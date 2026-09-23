# Template de site avec réservation

Template Next.js, PostgreSQL, Prisma et Better Auth destiné à créer un nouveau
site disposant d'une administration, d'un catalogue de prestations et d'un
système de réservation.

## Prérequis

- Node.js 20 ou supérieur ;
- npm ;
- Docker avec Docker Compose ;
- OpenSSL ;
- un port PostgreSQL local disponible ; `dev-init` cherche automatiquement le
  premier port libre entre `5432` et `5499`.

ImageMagick (`magick`) est uniquement nécessaire pour `make generate-favicons`.

## Créer un nouveau site

À la racine du projet :

```bash
make dev-init
```

La commande :

1. contrôle les prérequis et les valeurs saisies ;
2. installe exactement les versions de `package-lock.json` avec `npm ci` ;
3. sauvegarde les éventuels environnements sous la forme
   `.env.backup-YYYYMMDD-HHMMSS` ;
4. crée `.env` et `web/.env` ;
5. supprime uniquement le volume PostgreSQL associé au `SITE_NAME` choisi ;
6. applique les migrations et charge les données génériques ;
7. crée le premier administrateur sans envoyer d'email ;
8. exécute TypeScript et ESLint.

L'effacement du volume PostgreSQL est irréversible. Les fichiers d'environnement
précédents sont sauvegardés, mais la base doit être sauvegardée séparément si elle
contient déjà des données utiles.

Ensuite :

```bash
make dev-run-local
```

Le site est disponible sur <http://localhost:3000>.

## Personnalisation obligatoire

Le seed est volontairement neutre. Avant une mise en production, vérifier :

- les paramètres du site et les textes depuis l'administration ;
- les prestations, ressources, tarifs et durées ;
- les horaires et les règles de réservation ;
- les réseaux sociaux ;
- les images de `web/uploads` et les favicons ;
- les conditions générales et mentions légales avec un professionnel compétent ;
- les modèles d'emails et leur identité visuelle.

Les données de départ se trouvent dans `web/src/settings/data/`. Les images
présentes dans `web/uploads` ne sont que des fichiers de démonstration à remplacer.

## Variables d'environnement

- `.env.example` décrit l'environnement local ;
- `.env.production.example` décrit l'environnement de production ;
- `make dev-init` génère les secrets locaux ;
- les vrais secrets ne doivent jamais être commités.

`NEXT_PUBLIC_SITE_URL` et `BETTER_AUTH_URL` doivent contenir l'URL publique en
production, sans slash final. La redirection OAuth Google attend :

```text
https://votre-domaine.example/api/auth/callback/google
```

Les placeholders permettent de démarrer localement, mais Google OAuth et l'envoi
d'emails nécessitent de vraies clés.

## Commandes utiles

```bash
make dev-run-local       # PostgreSQL Docker + Next.js local
make dev-stop            # arrête Docker sans supprimer le volume
make clean               # supprime dépendances et caches, conserve la base
make check               # format, TypeScript et ESLint
make db-local-migrate    # crée/applique une migration de développement
make db-seed-data        # recharge les données initiales (destructif pour elles)
make db-studio           # ouvre Prisma Studio
```

Pour créer ou mettre à jour les utilisateurs de test définis dans le script de
seed :

```bash
make db-seed-user
```

Cette commande ne supprime aucun utilisateur. Elle crée actuellement le compte
administrateur `christophe@donnat.dev` avec le mot de passe de test
`Test123!flex`. Si le compte existe, son nom, son rôle et son mot de passe sont
réappliqués.

## Déploiement avec Dokploy

Utiliser `docker-compose.prod.yml` en mode Docker Compose et recopier les
variables adaptées depuis `.env.production.example` dans l'environnement
Dokploy.

Le compose de production :

- construit l'application ;
- exécute `prisma migrate deploy` avec le service ponctuel `migrate` ;
- ne démarre le service web qu'après la réussite des migrations ;
- conserve `/app/uploads` dans le volume `${SITE_NAME}-uploads`.

Configurer le domaine sur le service `web`, port interne `3000`, puis activer une
sauvegarde régulière du volume d'uploads et de PostgreSQL.

Lors du tout premier déploiement d'une base vide, charger une seule fois les
données initiales depuis le serveur :

```bash
docker compose -f docker-compose.prod.yml run --rm migrate npm run prisma:seed
```

Puis créer le premier administrateur sans conserver son mot de passe dans `.env` :

```bash
docker compose -f docker-compose.prod.yml run --rm \
  -e SEEDING_ADMIN=true \
  -e ADMIN_NAME="Admin" \
  -e ADMIN_EMAIL="admin@example.com" \
  -e ADMIN_PASSWORD="un-mot-de-passe-fort" \
  migrate npm run prisma:seed-user
```

Ne pas relancer le seed de données après l'ouverture du site : il remplace les
données métier administrables.

## Tâches planifiées

Configurer des requêtes HTTP avec l'en-tête :

```text
Authorization: Bearer <CRON_SECRET>
```

Endpoints :

```text
POST /api/cron/reservation-reminders
POST /api/cron/marketing-emails
```

## Remarque sur le seed

`make dev-init` recrée une base vide. `make db-seed-data` peut aussi supprimer et
recréer certaines données métier. Cette dernière commande ne doit pas être lancée
sur une base de production contenant des données réelles.
