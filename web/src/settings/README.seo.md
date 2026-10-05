# Réglages SEO du 7.59

La source unique est `settings.seo.ts`. Le SEO ne lit plus les champs historiques
`seoTitle`, `seoDescription` et `ogImageUrl` de Prisma, ni les titres de pages en
base. Le formulaire d'administration ne propose plus de titre SEO. Les champs
Prisma restent présents pour éviter une migration destructive des données.

## Modifier le référencement

- `siteUrl` : domaine public canonique, sans chemin, défini directement dans ce
  fichier. Les variables d'environnement de développement ne le remplacent pas.
- `siteName`, `titleTemplate`, `language`, `locale`, `category` : identité commune.
- `pages.home` : titre et description de l'accueil.
- `pages.blog`, `pages.events`, etc. : titre, description et URL de chaque page.
  `image` peut remplacer l'image commune pour une page.
- `image` : visuel des partages Open Graph et Twitter (URL, dimensions et texte
  alternatif). Les fichiers locaux sont placés dans `web/public`.
- `icons` : favicons et icône Apple ; tous les chemins sont configurés ici.
  Les fichiers correspondants se trouvent dans `web/public/favicons`.
- `organization` : données JSON-LD de l'association, logo, coordonnées publiques,
  adresse structurée et URLs des profils officiels (`sameAs`). Ne pas inventer de
  coordonnées. Le balisage `WebSite` et les fils d'Ariane sont générés automatiquement.
- `verification` : codes de validation, par exemple `{ google: 'votre-code' }`.
- `twitter` : carte et identifiants facultatifs des comptes.
- `indexingEnabled` : `false` pour une préproduction. Localhost, 127.0.0.1 et ::1
  sont toujours exclus de l'indexation ; leur sitemap est vide.
- `robots` : agents et chemins exclus du crawl, aperçu autorisé pour Google.
- `privateMetadata`, `authMetadata` : titres/descriptions des espaces non indexables.

## Sitemap et routes

`/sitemap.xml` et `/robots.txt` utilisent cette même configuration.
Pour une page, `index` contrôle l'indexation et `sitemap` son inclusion dans le
sitemap ; `priority` et `changeFrequency` donnent les indications correspondantes.
`lastModified` est facultatif et doit être une date réelle de modification (ISO),
pas une date recalculée à chaque requête.

Les pages optionnelles suivent `features` dans `settings.current.ts` : menu et
prestations sont actuellement désactivés. Les espaces `/auth`, `/staff`,
`/dashboard`, `/notifications`, les API et la redirection `/calendrier` sont exclus.
Les layouts privés et d'authentification ajoutent `noindex, nofollow` et effacent
la canonique et les cartes sociales héritées de l'accueil.

Pour ajouter une page publique : ajouter son entrée dans `pages`, puis appeler
`createPublicPageMetadata('cle')` dans son layout. Ajouter si utile
`SeoJsonLd` avec `createBreadcrumbJsonLd('cle')`. Le sitemap suit automatiquement.
Le blog et les événements n'ont pas de routes publiques individuelles dans ce
projet : seules leurs pages listes ont des URLs à inclure.

Après modification, reconstruire puis redéployer. Vérifier les URLs publiques
`/sitemap.xml` et `/robots.txt`, puis soumettre le sitemap dans Google Search Console.
Tests locaux : `node --import tsx --test src/features/seo/lib/seo-metadata.test.ts`,
`npm run typecheck`, `npm run build`.
