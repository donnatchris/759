import type { LegalTerms } from '@prisma/client';

type TLegalTermsSeed = Omit<LegalTerms, 'id' | 'createdAt' | 'updatedAt'>;

const siteName = process.env.SITE_FULL_NAME || 'l’établissement';
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
  content: `# Mentions légales et politique de confidentialité

Dernière mise à jour : septembre 2026.

## 1. Éditeur du site

${legalContactDetails}

## 2. Hébergement

Les coordonnées complètes de l'hébergeur doivent être renseignées par l'éditeur avant la mise en ligne publique du site : nom ou raison sociale, adresse et coordonnées de contact.

## 3. Objet du site

Le site de ${siteName} est un site vitrine à vocation informative. Il permet notamment de présenter l'établissement, sa carte, ses horaires, ses coordonnées et son Blog.

Le site public ne propose ni création de compte client, ni commande, ni paiement, ni réservation en ligne. Toute prise de contact s'effectue directement au moyen des coordonnées affichées sur le site.

Les informations publiées sont fournies à titre indicatif. ${siteName} s'efforce de les maintenir à jour, mais elles peuvent être modifiées à tout moment, notamment les horaires, les tarifs, la composition des produits et leur disponibilité.

## 4. Données personnelles

Le site vitrine ne comporte aucun formulaire public destiné à collecter des données personnelles et ne constitue pas de fichier client à partir des visites.

Comme pour tout site internet, l'hébergeur peut toutefois traiter temporairement certaines données techniques, telles que l'adresse IP, la date de connexion, les pages demandées ou les informations du navigateur, afin d'assurer la sécurité, la disponibilité et le diagnostic technique du service.

Pour toute question relative aux données personnelles ou pour exercer un droit applicable, l'utilisateur peut contacter ${siteName}${contactEmail ? ` à l'adresse ${contactEmail}` : ' au moyen des coordonnées affichées sur le site'}.

## 5. Cookies et mesure d'audience

Le site public n'utilise aucun cookie publicitaire et aucun cookie destiné à suivre les utilisateurs à des fins commerciales ou à travers plusieurs sites.

Lorsqu'elle est activée, la mesure d'audience repose sur Umami. Cet outil fonctionne sans cookie et produit des statistiques de fréquentation destinées à comprendre l'utilisation globale du site, sans chercher à identifier nominativement les visiteurs.

Des cookies strictement techniques peuvent être utilisés uniquement pour sécuriser l'accès à l'interface d'administration. Ils ne servent pas au profilage des visiteurs du site public.

Pour en savoir plus sur les cookies et traceurs, l'utilisateur peut consulter [les informations de la CNIL](https://www.cnil.fr/fr/cookies-et-autres-traceurs).

## 6. Propriété intellectuelle

Sauf mention contraire, les textes, photographies, illustrations, logos, graphismes et autres contenus présents sur le site sont protégés. Toute reproduction, adaptation, diffusion ou exploitation, totale ou partielle, sans autorisation préalable de leur titulaire est interdite, hors usages autorisés par la loi.

## 7. Liens externes

Le site peut contenir des liens vers des services tiers, par exemple un service de cartographie ou des réseaux sociaux. En suivant ces liens, l'utilisateur quitte le site de ${siteName}. Les sites tiers appliquent leurs propres conditions d'utilisation et politiques de confidentialité, dont ${siteName} n'est pas responsable.

## 8. Disponibilité et responsabilité

${siteName} s'efforce de maintenir le site accessible et ses informations exactes. Une disponibilité permanente ou l'absence totale d'erreur ne peut cependant pas être garantie. Le site peut être interrompu temporairement pour maintenance, mise à jour ou incident technique.

## 9. Modification de la présente page

${siteName} peut modifier les présentes informations pour tenir compte de l'évolution du site ou de ses obligations. La version applicable est celle publiée sur cette page.

## 10. Contact

Pour toute question concernant le site ou les présentes informations, l'utilisateur peut contacter ${siteName}${contactEmail ? ` à l'adresse ${contactEmail}` : ' via les coordonnées affichées sur le site'}.`,
};
