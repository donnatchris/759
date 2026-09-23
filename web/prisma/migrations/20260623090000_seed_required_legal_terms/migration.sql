-- The legal terms are required before a user can complete their profile.
-- Insert the initial version only when no version exists yet.
INSERT INTO "legal_terms" ("id", "content", "createdAt", "updatedAt")
SELECT
    '00000000-0000-4000-8000-000000000001',
    $legal_terms$# Conditions générales d'utilisation et informations légales

Dernière version applicable à compter de sa date de publication.

## 1. Objet

Les présentes conditions générales d'utilisation encadrent l'utilisation du site Beauté d'Orient et des services disponibles en ligne, notamment la consultation des prestations, la création d'un compte client et la réservation de prestations.

En utilisant le site, l'utilisateur accepte les présentes conditions. Si l'utilisateur ne souhaite pas les accepter, il doit cesser d'utiliser les services en ligne.

## 2. Gestion du compte client

L'utilisateur peut créer un compte client afin de réserver plus facilement ses prestations et consulter les informations liées à son compte.

Les informations renseignées doivent être exactes et à jour. L'utilisateur reste responsable de la confidentialité de ses identifiants de connexion.

## 3. Réservations

Les réservations effectuées sur le site permettent de demander un créneau pour une prestation proposée par Beauté d'Orient.

Beauté d'Orient peut contacter le client si une précision est nécessaire concernant une réservation, notamment pour confirmer, déplacer ou annuler un rendez-vous.

## 4. Données personnelles

Les données personnelles renseignées sur le site ne sont pas exposées publiquement.

Elles sont accessibles uniquement aux équipes de Beauté d'Orient dans le cadre de la gestion du compte client, des réservations, de la relation client et du bon fonctionnement de l'activité.

- **Téléphone** : le numéro de téléphone est utilisé uniquement en cas de besoin, notamment pour confirmer une réservation, prévenir d'un changement lié à un rendez-vous ou contacter le client au sujet d'une demande en cours.
- **Email de compte** : l'adresse email est utilisée uniquement pour la gestion du compte, par exemple la création du compte, la connexion, la vérification d'email, la modification de mot de passe ou les messages strictement nécessaires au fonctionnement du compte.
- **Emails de réservation** : l'adresse email peut également être utilisée pour envoyer les confirmations, rappels et autres informations nécessaires au suivi des réservations.
- **Emails marketing** : l'adresse email peut enfin être utilisée pour les actualités, offres et informations de l'entreprise, sous réserve que le client ait accepté de recevoir les emails de marketing.

Le client peut modifier sa préférence concernant les emails marketing depuis son espace personnel lorsque cette fonctionnalité est disponible.

## 5. Cookies et session

Le site n'utilise pas de cookies publicitaires ou de cookies de suivi marketing.

Les seuls cookies ou mécanismes équivalents utilisés servent au fonctionnement technique de la session utilisateur, notamment pour maintenir la connexion au compte client et sécuriser l'accès aux espaces protégés.

## 6. Confidentialité et sécurité

Beauté d'Orient met en oeuvre des mesures raisonnables pour protéger les informations personnelles des utilisateurs.

L'utilisateur doit également veiller à ne pas partager ses identifiants et à se déconnecter lorsqu'il utilise un appareil partagé.

## 7. Disponibilité du site

Beauté d'Orient s'efforce de maintenir le site accessible, mais ne garantit pas une disponibilité permanente. Le site peut être temporairement indisponible pour maintenance, mise à jour ou incident technique.

## 8. Modification des conditions

Beauté d'Orient peut publier une nouvelle version des présentes conditions générales d'utilisation et informations légales.

Chaque nouvelle version est conservée en base de données afin de maintenir un historique des textes publiés.

## 9. Contact

Pour toute question concernant le site, les réservations ou les données personnelles, l'utilisateur peut contacter Beauté d'Orient via les coordonnées affichées sur le site.$legal_terms$,
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
WHERE NOT EXISTS (SELECT 1 FROM "legal_terms");

-- The public CGU page also depends on its page metadata.
INSERT INTO "site_pages" ("slug", "title", "subTitle", "createdAt", "updatedAt")
VALUES (
    'cgu',
    'Conditions générales d''utilisation',
    'Informations légales, confidentialité et utilisation du site Beauté d''Orient.',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("slug") DO NOTHING;
