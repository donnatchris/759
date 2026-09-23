-- Neutralize legacy demonstration content without overwriting values already
-- customized by an administrator. Historical migrations remain unchanged so
-- their Prisma checksums stay valid on databases that already applied them.

UPDATE "legal_terms"
SET
    "content" = replace("content", 'Beauté d''Orient', 'l''établissement'),
    "updatedAt" = CURRENT_TIMESTAMP
WHERE
    "id" = '00000000-0000-4000-8000-000000000001'
    AND "content" LIKE '%Beauté d''Orient%';

UPDATE "site_pages"
SET
    "subTitle" = 'Informations légales, confidentialité et utilisation du site.',
    "updatedAt" = CURRENT_TIMESTAMP
WHERE
    "slug" = 'cgu'
    AND "subTitle" = 'Informations légales, confidentialité et utilisation du site Beauté d''Orient.';

UPDATE "site_section"
SET
    "subTitle" = 'Quand nous retrouver',
    "content" = 'Les horaires ci-dessous sont des exemples. Pensez à les adapter avant la mise en production.',
    "updatedAt" = CURRENT_TIMESTAMP
WHERE
    "id" = 'opening-slots'
    AND "subTitle" = 'Votre moment beauté'
    AND "content" = 'Nous vous accueillons dans une atmosphère douce et apaisante, pour vos soins, rituels et instants de détente.';
