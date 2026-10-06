/* eslint-disable @typescript-eslint/no-require-imports -- Mock external boundaries before loading server modules. */
const assert = require('node:assert/strict');
const { test } = require('node:test');
const Module = require('node:module');
const originalLoad = Module._load;
let admin = true;
let failMail = false;
let committed = [];
let recipientFilter;
let batch = [];
const now = new Date();
const tx = {
  blogPost: {
    create: async ({ data }) => ({
      id: 'blog-test',
      ...data,
      createdAt: now,
      updatedAt: now,
    }),
  },
  user: {
    count: async ({ where }) => {
      recipientFilter = where;
      return 2;
    },
  },
  marketingEmail: {
    create: async ({ data }) => {
      if (failMail) throw new Error('database unavailable');
      const mail = {
        id: 'mail-test',
        ...data,
        createdAt: now,
        updatedAt: now,
        status: 'PENDING',
      };
      batch.push(mail);
      return mail;
    },
  },
};
const prisma = {
  $transaction: async (fn) => {
    batch = [];
    const event = await fn(tx);
    committed.push({ event, mails: [...batch] });
    return event;
  },
  user: {
    findMany: async ({ where }) => {
      recipientFilter = where;
      return [];
    },
  },
};
Module._load = function (request, parent, isMain) {
  if (request === '@/lib/prisma/prisma') return { prisma };
  if (request === '@/lib/resend/resend') return { resend: {} };
  if (request === '@/features/core')
    return {
      ...require('../src/features/core/error/error.AppError.ts'),
      ...require('../src/features/core/error/error.handling.ts'),
      ...require('../src/features/core/server/server.service.ts'),
      ...require('../src/features/core/validation/zod-helpers.ts'),
    };
  if (request === '@/features/auth/server/require-admin')
    return {
      requireAdminOrThrow: async () => {
        if (!admin) throw new Error('forbidden');
        return { user: { id: 'admin' } };
      },
    };
  if (request === '@/features/auth/server/require-staff') return {};
  if (request === '@/features/permission/lib/permission.service')
    return {
      requireStaffPermissionOrThrow: async () => ({
        id: 'admin',
        email: 'admin@example.test',
      }),
    };
  return originalLoad.call(this, request, parent, isMain);
};
const { SETTINGS } = require('../src/settings/settings.current.ts');
const {
  createBlogPostService,
} = require('../src/features/blog/lib/blog.service.ts');
const {
  createBlogPostSchema,
  updateBlogPostSchema,
} = require('../src/features/blog/lib/blog.schema.ts');
const input = {
  title: 'Nouvel article',
  subTitle: 'Présentation',
  content: 'Contenu de l’article',
  tag: 'Actualités',
  author: 'Équipe',
  imageUrl: '/uploads/article.jpg',
  links: ['/contact'],
  eventStartDate: '2099-10-05',
  eventEndDate: '2099-10-06',
};

test('blog email defaults on and is queued atomically only when selected', async (t) => {
  t.mock.method(console, 'error', () => {});
  SETTINGS.features.blog = true;
  assert.equal(createBlogPostSchema.parse(input).sendToUsers, true);
  await createBlogPostService(input);
  assert.equal(committed[0].mails.length, 1);
  await createBlogPostService({ ...input, sendToUsers: false });
  assert.equal(committed[1].mails.length, 0);
  const beforeCreation = Date.now();
  await createBlogPostService({ ...input, sendToUsers: true });
  const afterCreation = Date.now();
  const mail = committed[2].mails[0];
  assert.equal(mail.subject, input.title);
  assert.equal(mail.title, input.title);
  assert.equal(mail.content, input.content);
  assert.equal(mail.eyebrow, input.tag);
  assert.ok(mail.intro.includes(input.subTitle));
  assert.ok(mail.intro.includes('05 octobre 2099'));
  assert.ok(mail.intro.includes('06 octobre 2099'));
  assert.equal(mail.note, 'Par Équipe');
  assert.ok(mail.imageUrl.endsWith('/uploads/article.jpg'));
  assert.ok(mail.links[0].endsWith('/contact'));
  assert.ok(mail.links[1].endsWith('/blog'));
  assert.ok(mail.scheduledFor.getTime() >= beforeCreation);
  assert.ok(mail.scheduledFor.getTime() <= afterCreation);
  assert.deepEqual(recipientFilter, {
    emailVerified: true,
    canReceiveMarketingEmails: true,
  });
  failMail = true;
  await assert.rejects(() =>
    createBlogPostService({ ...input, sendToUsers: true }),
  );
  assert.equal(committed.length, 3);
  failMail = false;
  admin = false;
  await assert.rejects(() =>
    createBlogPostService({ ...input, sendToUsers: true }),
  );
  assert.equal(committed.length, 3);
  admin = true;
});

test('blog schedules preserve hours on creation and editing and validate their order', () => {
  const schedule = {
    ...input,
    eventStartDate: '2099-01-05T18:30',
    eventEndDate: '2099-01-05T20:00',
  };
  const created = createBlogPostSchema.parse(schedule);
  assert.equal(
    created.eventStartDate.toISOString(),
    '2099-01-05T17:30:00.000Z',
  );
  assert.equal(created.eventEndDate.toISOString(), '2099-01-05T19:00:00.000Z');
  const edited = updateBlogPostSchema.parse({ ...created, id: 'post' });
  assert.equal(edited.eventEndDate.getTime(), created.eventEndDate.getTime());
  assert.equal(
    createBlogPostSchema.safeParse({
      ...schedule,
      eventEndDate: '2099-01-05T18:00',
    }).success,
    false,
  );
  assert.equal(
    createBlogPostSchema.safeParse({
      ...input,
      eventStartDate: '',
      eventEndDate: '',
    }).success,
    true,
  );
});
