'use client';

import { signIn } from '@/features/auth/auth-client';
import { Button } from '@/components/ui/button';
import { FcGoogle } from 'react-icons/fc';
import { toast } from 'sonner';

export function GoogleLoginButton() {
  async function handleGoogleLogin() {
    try {
      const response = await signIn.social({
        provider: 'google',
        callbackURL: '/auth/redirect',
      });

      if (response.error) {
        toast.error('Echec de la connexion avec Google. Veuillez réessayer.', {
          position: 'top-center',
        });
      }
    } catch (error) {
      console.error('Google login error:', error);
      toast.error('Echec de la connexion avec Google. Veuillez réessayer.', {
        position: 'top-center',
      });
    }
  }

  return (
    <Button
      variant="outline"
      size="lg"
      onClick={handleGoogleLogin}
      className="text-foreground text-lg px-16 py-6 bg-accent/10"
    >
      <FcGoogle className="h-5 w-5" />
      Se connecter avec Google
    </Button>
  );
}
