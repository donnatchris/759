GREEN=\033[32m
RED=\033[31m
YELLOW=\033[33m
BLUE=\033[34m
RESET=\033[0m

# Initialisation de l'environnement de développement

dev-init:
	@sh scripts/dev-init.sh

# Tâches de développement avec Docker pour la db en local
dev-local:
	@sh scripts/dev-run-local.sh

dev-prod:
	@printf "\n$(YELLOW)Lancement de l'environnement de production...$(RESET)\n" && \
	printf "\n$(YELLOW)Installation des dépendances...$(RESET)\n" && \
	(cd web && npm ci) && \
	printf "\n$(YELLOW)Démarrage de l'application Next.js...$(RESET)\n" && \
	set -a; . ./web/.env; set +a; \
	cd web && DATABASE_URL="$$DATABASE_DISTANT_URL" npm run dev

dev-stop:
	@printf "\n$(YELLOW)Arrêt de l'environnement de développement...$(RESET)\n"
	@set -eu; \
	if docker compose version >/dev/null 2>&1; then \
		DC="docker compose"; \
	elif command -v docker-compose >/dev/null 2>&1; then \
		DC="docker-compose"; \
	else \
		printf "$(YELLOW)Docker Compose indisponible : arrêt des conteneurs ignoré.$(RESET)\n"; \
		exit 0; \
	fi; \
	$$DC -f docker-compose.dev.yml down --remove-orphans; \
	printf "\n$(GREEN)Conteneurs de développement arrêtés, volumes conservés.$(RESET)\n"

db-local-studio:
	@printf "\n$(YELLOW)Lancement de prisma studio sur la base locale...$(RESET)\n"
	@cd web && npx --yes --package=dotenv-cli@11.0.0 dotenv -e .env -- sh -c 'DATABASE_URL="$$DATABASE_LOCAL_URL" npx prisma studio'

db-prod-studio:
	@printf "\n$(YELLOW)Lancement de prisma studio sur la base de production...$(RESET)\n"
	@cd web && npx --yes --package=dotenv-cli@11.0.0 dotenv -e .env -- sh -c 'DATABASE_URL="$$DATABASE_DISTANT_URL" npx prisma studio'

db-local-migrate:
	@printf "\n$(YELLOW)Migration de la base de données locale...$(RESET)\n"
	@cd web && npx --yes --package=dotenv-cli@11.0.0 dotenv -e .env -- sh -c 'DATABASE_URL="$${DATABASE_LOCAL_URL:?DATABASE_LOCAL_URL manquante}" npx prisma migrate dev'

db-prod-migrate:
	@printf "\n$(YELLOW)Migration de la base de données de production...$(RESET)\n"
	@cd web && npx --yes --package=dotenv-cli@11.0.0 dotenv -e .env -- sh -c 'DATABASE_URL="$${DATABASE_DISTANT_URL:?DATABASE_DISTANT_URL manquante}" npx prisma migrate deploy'

db-local-seed-data:
	@printf "\n$(YELLOW)Exécution du seed Prisma sur la base locale...$(RESET)\n"
	@cd web && npx --yes --package=dotenv-cli@11.0.0 dotenv -e .env -- sh -c 'DATABASE_URL="$$DATABASE_LOCAL_URL" npm run prisma:seed'
	@printf "\n$(GREEN)Seeds locaux exécutés avec succès !$(RESET)\n"

db-prod-seed-data:
	@printf "\n$(YELLOW)Exécution du seed Prisma sur la base de production...$(RESET)\n"
	@cd web && npx --yes --package=dotenv-cli@11.0.0 dotenv -e .env -- sh -c 'DATABASE_URL="$$DATABASE_DISTANT_URL" npm run prisma:seed'
	@printf "\n$(GREEN)Seeds de production exécutés avec succès !$(RESET)\n"

db-local-seed-user:
	@printf "\n$(YELLOW)Exécution du seed administrateur sur la base locale...$(RESET)\n"
	@cd web && npx --yes --package=dotenv-cli@11.0.0 dotenv -e .env -- sh -c 'DATABASE_URL="$$DATABASE_LOCAL_URL" SEEDING_ADMIN=true npm run prisma:seed-user'
	@printf "\n$(GREEN)Administrateur local créé ou mis à jour avec succès !$(RESET)\n"

db-prod-seed-user:
	@printf "\n$(YELLOW)Exécution du seed administrateur sur la base de production...$(RESET)\n"
	@cd web && npx --yes --package=dotenv-cli@11.0.0 dotenv -e .env -- sh -c 'DATABASE_URL="$$DATABASE_DISTANT_URL" SEEDING_ADMIN=true npm run prisma:seed-user'
	@printf "\n$(GREEN)Administrateur de production créé ou mis à jour avec succès !$(RESET)\n"

mail-local:
	@printf "\n$(YELLOW)Appel du webhook de mail avec la db locale...$(RESET)\n"
	@set -a; . ./web/.env; set +a; \
	curl -X POST http://localhost:3000/api/cron/marketing-emails -H "Authorization: Bearer $$CRON_SECRET"

mail-prod:
	@printf "\n$(YELLOW)Appel du webhook de mail en production...$(RESET)\n"
	@set -a; . ./web/.env; set +a; \
	curl -X POST https://delice-et-tradition-du-roussillon.fr/api/cron/marketing-emails -H "Authorization: Bearer $$CRON_SECRET"

generate-favicons:
	@printf "\n$(YELLOW)Génération des favicons...$(RESET)\n"
	@mkdir -p web/public/favicons
	@mkdir -p web/src/app
	magick web/uploads/logo.webp -resize 24x24^ -gravity center -background none -extent 16x16 web/public/favicons/favicon-16x16.png
	magick web/uploads/logo.webp -resize 48x48^ -gravity center -background none -extent 32x32 web/public/favicons/favicon-32x32.png
	magick web/uploads/logo.webp -resize 270x270^ -gravity center -background none -extent 180x180 web/public/favicons/apple-touch-icon.png
	magick web/uploads/logo.webp -resize 288x288^ -gravity center -background none -extent 192x192 web/public/favicons/android-chrome-192x192.png
	magick web/uploads/logo.webp -resize 768x768^ -gravity center -background none -extent 512x512 web/public/favicons/android-chrome-512x512.png
	magick web/uploads/logo.webp \
		\( -clone 0 -resize 24x24^ -gravity center -background none -extent 16x16 \) \
		\( -clone 0 -resize 48x48^ -gravity center -background none -extent 32x32 \) \
		\( -clone 0 -resize 72x72^ -gravity center -background none -extent 48x48 \) \
		-delete 0 web/src/app/favicon.ico
	@printf "\n$(GREEN)Favicons générés avec succès !$(RESET)\n"

convert-images:
	@printf "\n$(YELLOW)Conversion des images en WebP...$(RESET)\n"
	@cd web && npm run images:convert
	@printf "\n$(GREEN)Conversion des images terminée avec succès !$(RESET)\n"

# Tâches de développement

# Arrêter le serveur Next.js local (Ctrl+C) avant de lancer cette cible.
# Conserver les volumes PostgreSQL, les .env, les sources et package-lock.json.
clean: dev-stop
	@printf "\n$(YELLOW)Suppression des dépendances et fichiers régénérables...$(RESET)\n"
	@rm -rf web/node_modules web/.next web/out web/dist web/build web/coverage web/.cache
	@rm -f web/*.tsbuildinfo web/.eslintcache
	@printf "\n$(GREEN)Nettoyage terminé. Pour relancer : make dev-local$(RESET)\n"

format:
	@printf "\n$(YELLOW)Formattage du code avec Prettier...$(RESET)\n"
	@cd web && npm run format
	@printf "\n$(GREEN)Code formaté avec succès !$(RESET)\n"

typecheck:
	@printf "\n$(YELLOW)Vérification des types avec TypeScript...$(RESET)\n"
	@cd web && npm run typecheck
	@printf "\n$(GREEN)Vérification des types terminée avec succès !$(RESET)\n"

lint:
	@printf "\n$(YELLOW)Linting du code avec ESLint...$(RESET)\n"
	@cd web && npm run lint
	@printf "\n$(GREEN)Linting terminé avec succès !$(RESET)\n"

check: format typecheck lint
	@printf "\n$(GREEN)Toutes les vérifications ont été effectuées avec succès !$(RESET)\n"

push: check
	@printf "\n$(YELLOW)Poussée du code vers le dépôt distant...$(RESET)\n"
	@if [ -z "$$MSG" ]; then \
		printf "$(BLUE)Aucun message de commit fourni. Veuillez entrer un message de commit.$(RESET)\n"; \
		read -p "Entrez un message de commit: " MSG; \
	fi; \
	git add . && \
	git commit -m "$$MSG" && \
	git push
	@printf "\n$(GREEN)Code poussé avec succès !$(RESET)\n"



.PHONY: format lint typecheck check push dev-init dev-run dev-stop db-studio db-local-migrate db-prod-migrate db-seed-data db-seed-data-local db-seed-user db-local-seed-user generate-favicons convert-images clean dev-run-local
