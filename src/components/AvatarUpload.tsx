import { useState, useRef, useCallback } from "react";
import ReactCrop, { Crop, PixelCrop, centerCrop, makeAspectCrop } from "react-image-crop";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Camera, Upload, Crop as CropIcon, Check, X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import "react-image-crop/dist/ReactCrop.css";

interface AvatarUploadProps {
  currentAvatarUrl?: string;
  userId: string;
  userInitials: string;
  onAvatarUpdate: (url: string) => void;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  );
}

export function AvatarUpload({ currentAvatarUrl, userId, userInitials, onAvatarUpdate }: AvatarUploadProps) {
  const [open, setOpen] = useState(false);
  const [imgSrc, setImgSrc] = useState("");
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [uploading, setUploading] = useState(false);
  const [step, setStep] = useState<"upload" | "crop">("upload");
  
  const imgRef = useRef<HTMLImageElement>(null);
  const previewCanvasRef = useRef<HTMLCanvasElement>(null);
  const hiddenAnchorRef = useRef<HTMLAnchorElement>(null);
  const blobUrlRef = useRef("");

  function onSelectFile(e: React.ChangeEvent<HTMLInputElement>) {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "Por favor, selecione apenas arquivos de imagem.",
        });
        return;
      }

      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          variant: "destructive",
          title: "Erro",
          description: "O arquivo deve ter no máximo 5MB.",
        });
        return;
      }

      setCrop(undefined);
      const reader = new FileReader();
      reader.addEventListener("load", () =>
        setImgSrc(reader.result?.toString() || ""),
      );
      reader.readAsDataURL(file);
      setStep("crop");
    }
  }

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 1));
  }

  const getCroppedImg = useCallback(
    (image: HTMLImageElement, crop: PixelCrop): Promise<Blob> => {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");

      if (!ctx) {
        throw new Error("No 2d context");
      }

      const scaleX = image.naturalWidth / image.width;
      const scaleY = image.naturalHeight / image.height;

      const pixelRatio = window.devicePixelRatio;
      canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
      canvas.height = Math.floor(crop.height * scaleY * pixelRatio);

      ctx.scale(pixelRatio, pixelRatio);
      ctx.imageSmoothingQuality = "high";

      const cropX = crop.x * scaleX;
      const cropY = crop.y * scaleY;

      ctx.drawImage(
        image,
        cropX,
        cropY,
        crop.width * scaleX,
        crop.height * scaleY,
        0,
        0,
        crop.width * scaleX,
        crop.height * scaleY,
      );

      return new Promise((resolve) => {
        canvas.toBlob((blob) => {
          if (!blob) {
            throw new Error("Failed to create blob");
          }
          resolve(blob);
        }, "image/jpeg", 0.8);
      });
    },
    [],
  );

  const handleUpload = async () => {
    if (!imgRef.current || !completedCrop) {
      toast({
        variant: "destructive",
        title: "Erro",
        description: "Por favor, selecione e ajuste a área da imagem.",
      });
      return;
    }

    try {
      setUploading(true);

      const croppedImageBlob = await getCroppedImg(imgRef.current, completedCrop);
      
      // Create file name
      const fileExt = "jpg";
      const fileName = `${userId}/avatar.${fileExt}`;

      // Delete old avatar if exists
      if (currentAvatarUrl) {
        const oldPath = currentAvatarUrl.split('/').pop();
        if (oldPath) {
          await supabase.storage
            .from("avatars")
            .remove([`${userId}/${oldPath}`]);
        }
      }

      // Upload new avatar
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, croppedImageBlob, {
          cacheControl: "3600",
          upsert: true,
        });

      if (uploadError) {
        throw uploadError;
      }

      // Get public URL
      const { data } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      // Update profile with new avatar URL
      const { error: updateError } = await supabase
        .from("profiles")
        .update({ avatar_url: data.publicUrl })
        .eq("user_id", userId);

      if (updateError) {
        throw updateError;
      }

      onAvatarUpdate(data.publicUrl);
      setOpen(false);
      setStep("upload");
      setImgSrc("");
      
      toast({
        title: "Sucesso!",
        description: "Foto de perfil atualizada com sucesso.",
      });

    } catch (error: any) {
      console.error("Error uploading avatar:", error);
      toast({
        variant: "destructive",
        title: "Erro ao fazer upload",
        description: error.message || "Ocorreu um erro ao fazer upload da imagem.",
      });
    } finally {
      setUploading(false);
    }
  };

  const handleCancel = () => {
    setStep("upload");
    setImgSrc("");
    setCrop(undefined);
    setCompletedCrop(undefined);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div className="relative group cursor-pointer">
          <Avatar className="h-8 w-8 flex-shrink-0">
            <AvatarImage src={currentAvatarUrl} />
            <AvatarFallback className="text-xs">
              {userInitials}
            </AvatarFallback>
          </Avatar>
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-full flex items-center justify-center">
            <Camera className="h-3 w-3 text-white" />
          </div>
        </div>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === "upload" ? "Atualizar foto de perfil" : "Ajustar imagem"}
          </DialogTitle>
        </DialogHeader>
        
        {step === "upload" ? (
          <div className="space-y-4">
            <div className="flex flex-col items-center space-y-4">
              <Avatar className="w-24 h-24">
                <AvatarImage src={currentAvatarUrl} />
                <AvatarFallback className="text-2xl">
                  {userInitials}
                </AvatarFallback>
              </Avatar>
              
              <div className="space-y-2">
                <Button variant="outline" className="w-full" asChild>
                  <label htmlFor="avatar-upload" className="cursor-pointer">
                    <Upload className="w-4 h-4 mr-2" />
                    Escolher arquivo
                    <input
                      id="avatar-upload"
                      type="file"
                      accept="image/*"
                      onChange={onSelectFile}
                      className="hidden"
                    />
                  </label>
                </Button>
                <p className="text-xs text-muted-foreground text-center">
                  PNG, JPG até 5MB
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {imgSrc && (
              <div className="flex flex-col items-center space-y-4">
                <div className="max-h-96 overflow-hidden">
                  <ReactCrop
                    crop={crop}
                    onChange={(_, percentCrop) => setCrop(percentCrop)}
                    onComplete={(c) => setCompletedCrop(c)}
                    aspect={1}
                    minWidth={100}
                    minHeight={100}
                    circularCrop
                  >
                    <img
                      ref={imgRef}
                      alt="Crop me"
                      src={imgSrc}
                      style={{ maxHeight: "400px", width: "auto" }}
                      onLoad={onImageLoad}
                    />
                  </ReactCrop>
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    onClick={handleUpload} 
                    disabled={uploading || !completedCrop}
                    className="gap-2"
                  >
                    <Check className="w-4 h-4" />
                    {uploading ? "Enviando..." : "Salvar"}
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={handleCancel}
                    disabled={uploading}
                    className="gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancelar
                  </Button>
                </div>
              </div>
            )}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}