# Réglages SEO du 7.59

La source unique est `settings.seo.ts`. Le SEO ne lit plus les champs historiques
`seoTitle`, `seoDescription` et `ogImageUrl` de Prisma, ni les titres de pages en
base pour générer les métadonnées. Les titres et sous-titres visibles des pages
restent chargés depuis la base et modifiables par l’administration.
Le formulaire d'administration ne propose plus de titre SEO. Les champs
Prisma restent présents pour éviter une migration destructive des données.

## Modifier le référencement

- `siteUrl` : domaine public canonique, sans chemin, défini directement dans ce
  fichier. Les variables d'environnement de développement ne le remplacent pas.
- `siteName`, `siteAlternateNames`, `titleTemplate`, `language`, `locale`, `category` : identité commune.
- `pages.home` : titre et description de l'accueil.
- `identity` : présentation visible dans le footer (759, 7.59,
  identité patriote et identitaire, Canohès, proximité de Perpignan et Pyrénées-Orientales).
- `collections` : pagination, longueur des descriptions, type de balisage et
  indications de sitemap des articles et annonces d'événements.
- `pages.blog`, `pages.events`, etc. : titre SEO, description SEO et URL de chaque
  page. Ces valeurs ne remplacent pas le titre et le sous-titre affichés depuis
  la base dans `PageTitle`.
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
prestations sont actuellement désactivés. Les espaces membres et la redirection `/calendrier` sont exclus du sitemap.
Le crawl de `/auth` et `/calendrier` reste autorisé pour permettre aux moteurs de
lire `noindex`. Les espaces protégés et les API sont exclus du crawl.
Les layouts privés et d'authentification ajoutent `noindex, nofollow` et effacent
la canonique et les cartes sociales héritées de l'accueil.

Pour ajouter une page publique : ajouter son entrée dans `pages`, puis appeler
`createPublicPageMetadata('cle')` dans son layout. Ajouter si utile
`SeoJsonLd` avec `createBreadcrumbJsonLd('cle')`. Le sitemap suit automatiquement.
Les articles et événements possèdent désormais des URLs stables `/blog/[id]` et
`/evenements/[id]`, sans migration de la base. Le titre, la description et les
dates de chaque fiche proviennent de son contenu public ; les paramètres et
règles de génération restent centralisés dans `settings.seo.ts`. Les annonces
d'événements utilisent un balisage `Article` : aucune localisation ou condition
d'admission n'est inventée pour obtenir artificiellement un résultat enrichi.

Le sitemap est généré à la demande depuis les contenus publics et inclut leurs
dates réelles de mise à jour. Une panne de la base doit être corrigée : elle ne
produit pas silencieusement un sitemap incomplet. Les listes utilisent des liens
`?page=2`, etc., et chaque page possède sa canonique. Les pages vides hors de la
première page et les paramètres invalides répondent avec une page introuvable.

La redirection `www` utilise aussi `siteUrl` ; les valeurs d'authentification ou
de développement ne peuvent plus déplacer le domaine canonique. Les profils
`sameAs` et codes `verification` sont à compléter avec les vraies valeurs. Aucun
compte Search Console n'est créé ni sitemap soumis automatiquement.

Après modification, reconstruire puis redéployer. Vérifier les URLs publiques
`/sitemap.xml` et `/robots.txt`, puis soumettre le sitemap dans Google Search Console.
Tests locaux : `node --import tsx --test src/features/seo/lib/seo-metadata.test.ts`,
`npm run typecheck`, `npm run build`.
