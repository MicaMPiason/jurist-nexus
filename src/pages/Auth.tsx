import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "@/hooks/use-toast";
import { SignInPage, Testimonial } from "@/components/ui/sign-in";

const testimonials: Testimonial[] = [
  {
    avatarSrc: "https://randomuser.me/api/portraits/women/57.jpg",
    name: "Sarah Chen",
    handle: "@sarahdigital",
    text: "Amazing platform! The user experience is seamless and the features are exactly what I needed."
  },
  {
    avatarSrc: "https://randomuser.me/api/portraits/men/64.jpg",
    name: "Marcus Johnson",
    handle: "@marcustech",
    text: "This service has transformed how I work. Clean design, powerful features, and excellent support."
  },
  {
    avatarSrc: "https://randomuser.me/api/portraits/men/32.jpg",
    name: "David Martinez",
    handle: "@davidcreates",
    text: "I've tried many platforms, but this one stands out. Intuitive, reliable, and genuinely helpful for productivity."
  },
];

export default function Auth() {
  const [loading, setLoading] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const { signIn, signUp, user } = useAuth();
  const navigate = useNavigate();

  // Redirect if already authenticated
  useEffect(() => {
    if (user) {
      navigate("/");
    }
  }, [user, navigate]);

  const handleSignIn = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    if (isSignUp) {
      const name = formData.get("name") as string;
      const { error } = await signUp(email, password, name);

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro no cadastro",
          description: error.message,
        });
      } else {
        toast({
          title: "Cadastro realizado com sucesso!",
          description: "Verifique seu e-mail para confirmar a conta.",
        });
      }
    } else {
      const { error } = await signIn(email, password);

      if (error) {
        toast({
          variant: "destructive",
          title: "Erro no login",
          description: error.message,
        });
      } else {
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo de volta.",
        });
        navigate("/");
      }
    }
    setLoading(false);
  };

  const handleGoogleSignIn = () => {
    toast({
      title: "Em breve",
      description: "Login com Google será implementado em breve.",
    });
  };

  const handleResetPassword = () => {
    toast({
      title: "Redefinir senha",
      description: "Funcionalidade de redefinição de senha será implementada em breve.",
    });
  };

  return (
    <SignInPage
      title={<span className="font-light text-foreground tracking-tighter">{isSignUp ? "Criar Conta" : "Bem-vindo"}</span>}
      description={isSignUp ? "Junte-se a nós e comece sua jornada hoje" : "Acesse sua conta e continue sua jornada conosco"}
      heroImageSrc="https://images.unsplash.com/photo-1642615835477-d303d7dc9ee9?w=2160&q=80"
      testimonials={testimonials}
      onSignIn={handleSignIn}
      onGoogleSignIn={handleGoogleSignIn}
      onResetPassword={handleResetPassword}
      onCreateAccount={() => setIsSignUp(!isSignUp)}
      loading={loading}
      isSignUp={isSignUp}
    />
  );
}