import type { LegalTerms } from '@prisma/client';

type TLegalTermsSeed = Omit<LegalTerms, 'id' | 'createdAt' | 'updatedAt'>;

const siteName = process.env.SITE_FULL_NAME || 'l’association';
const siteCreator = process.env.SITE_CREATOR || siteName;
const contactEmail =
  process.env.SITE_CONTACT_EMAIL || process.env.SITE_CREATOR_MAIL;
const siteAddress = process.env.SITE_ADDRESS;
const sitePhone = process.env.SITE_PHONE;

const legalContactDetails = [
  `- **Éditeur du site** : ${siteName}`,
  `- **Responsable de la publication** : ${siteCreator}`,
  contactEmail ? `- **Email** : ${contactEmail}` : null,
  siteAddress ? `- **Adresse** : ${siteAddress}` : null,
  sitePhone ? `- **Téléphone** : ${sitePhone}` : null,
]
  .filter(Boolean)
  .join('\n');

export const legalTermsSeed: TLegalTermsSeed = {
  content: `# Conditions générales d’utilisation, mentions légales et confidentialité

Dernière mise à jour : octobre 2026.

## 1. Éditeur du site

${legalContactDetails}

## 2. Hébergement

Le site est hébergé par HOSTINGER INTERNATIONAL LIMITED, société de droit chypriote, dont le siège social est situé 61 Lordou Vironos str., 6023 Larnaca, Chypre.
Courriel : compliance@hostinger.com

## 3. Objet du site et acceptation des CGU

Le site présente l'association, ses idées, ses actualités, ses publications, ses événements et ses activités. Il permet également d'accéder aux services et espaces proposés par l'association, selon les fonctionnalités disponibles et les droits de chaque utilisateur.

Les présentes conditions générales d'utilisation (CGU) définissent les règles applicables aux visiteurs, aux titulaires d'un compte et aux adhérents utilisant le site. La création d'un compte implique l'acceptation des CGU. Chaque utilisateur s'engage à respecter ces règles lorsqu'il utilise le site et ses services.

La création d'un compte sur le site ne vaut pas adhésion à l'association. Certains espaces peuvent être réservés aux adhérents dont le statut a été validé par l'association. Les informations relatives aux activités et aux événements peuvent être mises à jour ; les utilisateurs sont invités à vérifier les modalités publiées avant d'y participer.

## 4. Compte utilisateur et règles de conduite

L'utilisateur fournit des informations exactes, maintient ses coordonnées à jour et protège ses identifiants de connexion. Son compte est personnel : il ne doit pas le prêter, usurper l'identité d'une autre personne ou utiliser le compte d'un tiers. Il signale à l'association toute utilisation non autorisée dont il a connaissance.

Les échanges doivent rester respectueux, y compris en cas de désaccord politique. La critique des idées, des propositions et des arguments a sa place ; les insultes, les attaques personnelles, les menaces, le harcèlement, la diffamation, les propos discriminatoires et les incitations à la haine ou à la violence sont interdits.

Il est également interdit de publier des contenus illicites, de porter atteinte à la vie privée ou aux droits d'autrui, de diffuser des données personnelles sans autorisation, d'envoyer des messages indésirables ou publicitaires non sollicités, de perturber les services ou de tenter d'accéder à des espaces sans y être autorisé. Le contournement d'une restriction ou d'un bannissement, notamment par la création d'un autre compte, est interdit.

## 5. Modération, suspension et bannissement du site

**En cas de non-respect des présentes CGU, l'association, en sa qualité d'éditeur du site, se réserve le droit de restreindre l'accès à certains services, de suspendre un compte ou de bannir un utilisateur du site, temporairement ou définitivement.** Les administrateurs et les modérateurs habilités peuvent mettre en œuvre ces mesures dans le cadre de leurs attributions afin de protéger les personnes, les échanges et le bon fonctionnement des services.

La mesure est adaptée à la nature, à la gravité et à la répétition du manquement. Un rappel des règles ou un avertissement peut être adressé à l'utilisateur, sans constituer une étape obligatoire avant toute sanction. Un manquement grave, une menace pour une personne ou pour la sécurité du site, ou des violations répétées peuvent justifier une suspension ou un bannissement immédiat, sans avertissement préalable.

L'utilisateur est informé du motif, du périmètre et, lorsqu'elle est temporaire, de la durée de la mesure, sauf obstacle légal ou nécessité de protection des personnes ou de la sécurité. Il peut demander un réexamen en contactant l'association au moyen des coordonnées indiquées ci-dessous. Cette demande ne suspend pas automatiquement la mesure.

Un bannissement du site porte sur l'accès au compte et aux services concernés. Il ne constitue pas, à lui seul, une exclusion de l'association : une éventuelle mesure concernant l'adhésion relève des statuts, du règlement intérieur et des procédures propres à l'association.

## 6. Futur forum réservé aux adhérents

**Le forum n'est pas encore disponible. Les règles de cette section s'appliqueront à compter de son éventuelle ouverture ; leur publication ne constitue pas un engagement sur une date de lancement.**

### Accès et esprit des échanges

Le forum sera réservé aux adhérents dont le statut est validé par l'association. Son accès nécessitera un compte personnel autorisé et restera soumis au maintien de cette qualité ainsi qu'au respect des CGU. Il aura pour vocation de permettre les échanges entre adhérents, le débat d'idées, le partage d'informations et l'organisation des activités associatives.

Chaque participant devra faire preuve de courtoisie, de respect et de bonne foi. Les désaccords sont légitimes et doivent s'exprimer par des arguments, sans insulter, humilier, provoquer personnellement ou intimider les autres. Il sera demandé de respecter les sujets de discussion, d'éviter les messages répétés, les provocations destinées à faire dégénérer les échanges, le harcèlement collectif, les publicités non autorisées et la diffusion délibérée d'informations trompeuses. Les règles de conduite de la section 4 s'appliqueront à tous les messages, titres, liens, images et pièces jointes.

### Confidentialité et responsabilité des participants

Le caractère réservé du forum devra être respecté : les participants ne devront pas diffuser à l'extérieur des échanges, des captures d'écran ou des informations permettant d'identifier d'autres adhérents sans leur autorisation, sous réserve des signalements et communications autorisés ou imposés par la loi. Ils devront éviter de publier des données personnelles inutiles, notamment celles de tiers. Un espace réservé ne garantit toutefois pas qu'un autre participant ne recopiera jamais un contenu.

Chaque auteur restera responsable de ses contributions et devra disposer des droits nécessaires sur les contenus partagés. Les messages des participants n'engageront pas la position officielle de l'association, sauf publication expressément présentée comme telle par une personne habilitée.

### Pouvoirs des modérateurs et sanctions

**Les modérateurs et les administrateurs habilités pourront éditer, masquer ou supprimer tout ou partie d'un message, déplacer une discussion ou la fermer lorsqu'un contenu enfreint les CGU ou perturbe le bon déroulement des échanges.** Ces interventions pourront notamment concerner des insultes, des attaques personnelles, des contenus illicites, des données privées, du spam ou des échanges devenus agressifs. Une modification de modération devra être signalée comme telle et ne devra pas attribuer à l'auteur des propos qu'il n'a pas tenus. Un simple désaccord exprimé avec respect ne constitue pas, à lui seul, un manquement.

Selon la gravité ou la répétition des faits, l'équipe pourra rappeler les règles, avertir un participant, limiter sa possibilité de publier, suspendre son accès au forum ou le bannir du forum temporairement ou définitivement. **Si les faits le justifient, la sanction pourra s'étendre à une suspension ou à un bannissement de l'ensemble du site**, dans les conditions de la section 5. Une mesure immédiate pourra être prise sans avertissement préalable en cas de manquement grave ou de nécessité de protection des personnes ou du service.

Les participants seront invités à signaler les contenus problématiques aux modérateurs ou à contacter l'association en précisant la discussion concernée et le motif du signalement, sans alimenter le conflit. La modération ne sera pas nécessairement effectuée avant publication ni assurée en permanence. Toute demande de réexamen d'une décision devra être adressée à l'association dans un échange respectueux.

## 7. Données personnelles

L'utilisation d'un compte et des services du site implique le traitement de données personnelles, notamment les informations de profil et de contact fournies par l'utilisateur, son statut d'accès, son acceptation des CGU et les informations nécessaires à la gestion des services utilisés. Lors de l'ouverture du forum, les contributions et les éléments nécessaires à leur modération feront également l'objet de traitements.

Ces données servent à gérer les comptes, les accès, les demandes des utilisateurs, la sécurité et le respect des règles du site. Des données techniques, telles que l'adresse IP, les dates de connexion et les informations du navigateur, peuvent également être traitées pour assurer la sécurité et diagnostiquer les incidents. L'accès aux données doit être limité aux personnes habilitées et aux prestataires techniques intervenant pour les besoins du service.

L'appartenance à une association politique et certaines contributions peuvent révéler des opinions politiques, qui constituent des données sensibles. Leur traitement nécessite des garanties particulières et un fondement approprié ; l'acceptation des CGU ne vaut pas consentement général à leur réutilisation ou à leur diffusion. Pour plus d'informations, consulter [les recommandations de la CNIL sur les fichiers de communication politique](https://www.cnil.fr/fr/les-fichiers-de-communication-politique).

Les informations détaillées sur les traitements, leurs bases légales, les destinataires et les durées de conservation doivent être précisées par l'association dans une information dédiée, accessible lors de la collecte. Les utilisateurs peuvent contacter l'association pour exercer leurs droits applicables, notamment d'accès, de rectification, d'effacement, de limitation et d'opposition, ainsi que de portabilité lorsque ses conditions sont réunies. Ils peuvent également adresser une réclamation à la CNIL. Lorsqu'un traitement repose sur le consentement, celui-ci peut être retiré à tout moment.

Pour toute question relative aux données personnelles ou pour exercer un droit applicable, l'utilisateur peut contacter ${siteName}${contactEmail ? ` à l'adresse ${contactEmail}` : ' au moyen des coordonnées affichées sur le site'}.

## 8. Cookies et mesure d'audience

Le site public n'utilise aucun cookie publicitaire et aucun cookie destiné à suivre les utilisateurs à des fins commerciales ou à travers plusieurs sites.

Lorsqu'elle est activée, la mesure d'audience repose sur Umami. Cet outil fonctionne sans cookie et produit des statistiques de fréquentation destinées à comprendre l'utilisation globale du site, sans chercher à identifier nominativement les visiteurs.

Des cookies strictement techniques peuvent être utilisés pour l'authentification, le maintien des sessions et la sécurisation de l'accès aux comptes et aux espaces réservés, y compris l'interface d'administration. Ils ne servent pas au profilage publicitaire des utilisateurs.

Pour en savoir plus sur les cookies et traceurs, l'utilisateur peut consulter [les informations de la CNIL](https://www.cnil.fr/fr/cookies-et-autres-traceurs).

## 9. Propriété intellectuelle

Sauf mention contraire, les textes, photographies, illustrations, logos, graphismes et autres contenus présents sur le site sont protégés. Toute reproduction, adaptation, diffusion ou exploitation, totale ou partielle, sans autorisation préalable de leur titulaire est interdite, hors usages autorisés par la loi.

## 10. Liens externes

Le site peut contenir des liens vers des services tiers, par exemple un service de cartographie ou des réseaux sociaux. En suivant ces liens, l'utilisateur quitte le site de ${siteName}. Les sites tiers appliquent leurs propres conditions d'utilisation et politiques de confidentialité, dont ${siteName} n'est pas responsable.

## 11. Disponibilité et responsabilité

${siteName} s'efforce de maintenir le site accessible et ses informations exactes. Une disponibilité permanente ou l'absence totale d'erreur ne peut cependant pas être garantie. Le site peut être interrompu temporairement pour maintenance, mise à jour ou incident technique.

## 12. Modification des CGU

${siteName} peut modifier les présentes CGU pour tenir compte de l'évolution du site, des services ou de ses obligations. La date de mise à jour figure en tête de cette page. Les utilisateurs seront informés des modifications substantielles par un moyen adapté et, lorsque nécessaire, invités à accepter la nouvelle version avant de continuer à utiliser les services concernés. Les nouvelles règles ne s'appliquent pas rétroactivement à des comportements antérieurs à leur entrée en vigueur.

## 13. Contact et signalements

Pour toute question concernant le site ou les présentes informations, l'utilisateur peut contacter ${siteName}${contactEmail ? ` à l'adresse ${contactEmail}` : ' via les coordonnées affichées sur le site'}.`,
};
