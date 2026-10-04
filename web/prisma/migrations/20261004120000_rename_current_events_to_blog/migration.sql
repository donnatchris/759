-- Rename existing objects without deleting articles or notifications.
ALTER TABLE "current_event" RENAME TO "blog_post";
ALTER TABLE "blog_post" RENAME CONSTRAINT "current_event_pkey" TO "blog_post_pkey";
ALTER INDEX "current_event_id_key" RENAME TO "blog_post_id_key";
ALTER TYPE "NotificationType" RENAME VALUE 'CURRENT_EVENT_ANNOUNCEMENT' TO 'BLOG_POST_ANNOUNCEMENT';

UPDATE "site_pages"
SET "slug" = 'blog', "title" = 'Blog', "updatedAt" = CURRENT_TIMESTAMP
WHERE "slug" = 'actualite';
