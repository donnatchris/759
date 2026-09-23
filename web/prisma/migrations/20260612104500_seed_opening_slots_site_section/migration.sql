-- SeedData
INSERT INTO "site_section" ("id", "title", "subTitle", "content", "footer", "createdAt", "updatedAt")
VALUES (
    'opening-slots',
    'Horaires d''ouverture',
    'Votre moment beauté',
    'Nous vous accueillons dans une atmosphère douce et apaisante, pour vos soins, rituels et instants de détente.',
    'Réservation recommandée pour garantir votre créneau.',
    CURRENT_TIMESTAMP,
    CURRENT_TIMESTAMP
)
ON CONFLICT ("id") DO NOTHING;
