import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { SETTINGS } from '@/settings/settings.current';

export function CheckEmail() {
  const siteName = SETTINGS.site.fullName;

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 space-y-4 text-center max-w-2xl mx-auto h-full">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4">
        Vérifiez vos e-mails
      </h1>
      <p className="text-center">
        Si votre adresse e-mail existe et qu&apos;elle ne correspond pas à un
        compte déjà vérifié, vous devriez recevoir un e-mail de confirmation
        sous peu.
      </p>
      <p className="text-center">
        Cliquez sur le lien de vérification dans l&apos;e-mail pour activer
        votre compte.
      </p>
      <div className="mt-4 text-left text-muted-foreground text-xs sm:text-sm">
        <p className="font-semibold text-primary text-center mb-4">
          Conseils si vous ne recevez pas l&apos;e-mail :
        </p>
        <ul className="list-disc list-inside space-y-1">
          <li>
            Vérifiez votre dossier de spam ou de courrier indésirable au cas où
            l&apos;e-mail de confirmation y aurait été dirigé.
          </li>
          <li>
            Assurez-vous d&apos;avoir saisi correctement votre adresse e-mail
            lors de l&apos;inscription.
          </li>
          <li>
            Si vous avez utilisé une adresse e-mail temporaire, essayez de vous
            inscrire avec une adresse e-mail différente.
          </li>
          <li>
            Votre compte existe peut-être déjà. Essayez de vous connecter ou de
            réinitialiser votre mot de passe si vous avez oublié vos
            identifiants.
          </li>
        </ul>
      </div>
      <p className="text-center text-primary mt-4">
        Merci et bienvenue chez <strong>{siteName}</strong> !
      </p>
      <Button asChild variant="default" className="rounded-xl mt-6">
        <Link href="/auth/sign-in">Aller à la page de connexion</Link>
      </Button>
      <Link
        href="/"
        className="text-sm text-muted-foreground mt-4 hover:underline"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
