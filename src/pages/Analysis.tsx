import { useState, useRef } from "react";
import { Upload, FileText, Brain, CheckCircle, Calendar, Target, X } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";

export default function Analysis() {
  const [selectedAnalysisType, setSelectedAnalysisType] = useState("general");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const analysisTypes = [
    {
      id: "general",
      label: "Geral",
      description: "Análise genérica para outros tipos de ação",
    },
    {
      id: "civil",
      label: "Cível",
      description: "Responsabilidade civil e defesa do consumidor",
    },
    {
      id: "labor",
      label: "Trabalhista",
      description: "Reclamações trabalhistas e direito do trabalho",
    },
    {
      id: "tax",
      label: "Tributária",
      description: "Autos de infração e contencioso tributário",
    },
  ];

  const analysisSteps = [
    "1. Upload do documento: Selecione um PDF jurídico",
    "2. Escolha o tipo: Cível, Trabalhista, Tributária ou Geral",
    "3. Análise com IA: Extração automática de informações relevantes",
    "4. Datas importantes: Identificação de prazos processuais",
    "5. Insights estratégicos: Sugestões para defesa ou ação",
  ];

  const validateFile = (file: File): string | null => {
    if (!file.type.includes('pdf')) {
      return 'Por favor, selecione apenas arquivos PDF.';
    }
    
    const maxSize = 20 * 1024 * 1024; // 20MB in bytes
    if (file.size > maxSize) {
      return 'O arquivo deve ter no máximo 20MB.';
    }
    
    return null;
  };

  const handleFileSelect = (file: File) => {
    const error = validateFile(file);
    if (error) {
      setFileError(error);
      setSelectedFile(null);
    } else {
      setFileError(null);
      setSelectedFile(file);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleUploadClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = () => {
    setSelectedFile(null);
    setFileError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Análise IA</h1>
        <p className="text-muted-foreground">
          Upload e análise de documentos jurídicos com Inteligência Artificial
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Document Upload */}
        <Card className="shadow-bridge-sm">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-primary" />
              Analisar Documento Jurídico
            </CardTitle>
            <CardDescription>
              Clique para upload do PDF
              <br />
              Selecione o PDF e depois clique em 'Analisar Documento'
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Upload Area */}
            <div className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf"
                onChange={handleFileInputChange}
                className="hidden"
              />
              
              {!selectedFile ? (
                <div 
                  onClick={handleUploadClick}
                  className="border-2 border-dashed border-border rounded-lg p-8 text-center bg-gradient-subtle hover:bg-muted/50 transition-colors cursor-pointer"
                >
                  <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-sm text-muted-foreground mb-2">
                    Arraste e solte um arquivo PDF ou clique para selecionar
                  </p>
                  <Button variant="outline" type="button" className="mb-2">
                    <FileText className="h-4 w-4 mr-2" />
                    Selecionar PDF
                  </Button>
                  <p className="text-xs text-muted-foreground">
                    Máximo 20MB
                  </p>
                </div>
              ) : (
                <div className="border border-border rounded-lg p-4 bg-background">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <FileText className="h-8 w-8 text-primary" />
                      <div>
                        <p className="text-sm font-medium text-foreground">{selectedFile.name}</p>
                        <p className="text-xs text-muted-foreground">{formatFileSize(selectedFile.size)}</p>
                      </div>
                    </div>
                    <Button
                      variant="ghost" 
                      size="sm"
                      onClick={handleRemoveFile}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
              
              {fileError && (
                <div className="text-sm text-destructive bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                  {fileError}
                </div>
              )}
            </div>

            {/* Analysis Types */}
            <div>
              <Label className="text-sm font-medium mb-3 block">
                Tipo de Análise
              </Label>
              <RadioGroup 
                value={selectedAnalysisType} 
                onValueChange={setSelectedAnalysisType}
                className="space-y-3"
              >
                {analysisTypes.map((type) => (
                  <div key={type.id} className="flex items-start space-x-3">
                    <RadioGroupItem value={type.id} id={type.id} className="mt-1" />
                    <div className="flex-1">
                      <Label 
                        htmlFor={type.id} 
                        className="text-sm font-medium cursor-pointer"
                      >
                        {type.label}
                      </Label>
                      <p className="text-xs text-muted-foreground mt-1">
                        {type.description}
                      </p>
                    </div>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Analyze Button */}
            <Button className="w-full bg-gradient-primary hover:shadow-bridge-glow transition-all duration-200">
              <Brain className="h-4 w-4 mr-2" />
              Analisar Documento
            </Button>
          </CardContent>
        </Card>

        {/* How it works */}
        <Card className="shadow-bridge-sm">
          <CardHeader>
            <CardTitle>Como funciona a análise?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analysisSteps.map((step, index) => (
                <div key={index} className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-primary/10 text-primary rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-medium">{index + 1}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{step.substring(2)}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Important Dates Widget */}
      <Card className="shadow-bridge-sm">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-accent" />
            Datas e Tarefas Importantes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <Target className="h-16 w-16 text-muted-foreground mx-auto mb-4 opacity-50" />
            <h3 className="text-lg font-medium text-muted-foreground mb-2">
              Aguardando análise do documento
            </h3>
            <p className="text-sm text-muted-foreground max-w-md mx-auto">
              Faça o upload e análise de um documento para extrair datas importantes 
              e adicionar tarefas personalizadas.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}