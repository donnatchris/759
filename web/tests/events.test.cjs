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
  event: {
    create: async ({ data }) => ({
      id: 'event-test',
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
  createEventService,
} = require('../src/features/events/lib/events.service.ts');
const {
  createEventSchema,
  updateEventSchema,
} = require('../src/features/events/lib/events.schema.ts');
const {
  getMarketingEmailHtml,
} = require('../src/features/mail/lib/marketing-email.templates.ts');
const {
  getMarketingEmailRecipientsFromPrismaRepository,
} = require('../src/features/mail/lib/marketing-email.repository.ts');
const input = {
  title: 'Rencontre <7.59>',
  subTitle: 'Bienvenue',
  content: 'Programme complet\nRepas & conférence',
  tag: 'Rencontre',
  author: 'Équipe',
  imageUrl: '/logo.png',
  links: ['/contact'],
  eventStartDate: '2099-10-05',
  eventEndDate: '2099-10-06',
  displayStartDate: '2099-10-01',
  displayEndDate: '2099-10-06',
};

test('creating an event queues an optional complete email atomically', async (t) => {
  t.mock.method(console, 'error', () => {});
  SETTINGS.features.events = true;
  await createEventService(input);
  assert.equal(committed[0].mails.length, 0);
  await createEventService({ ...input, sendToMembers: true });
  const mail = committed[1].mails[0];
  assert.equal(mail.content, input.content);
  assert.equal(mail.eyebrow, input.tag);
  assert.ok(mail.intro.includes('05 octobre 2099'));
  assert.ok(mail.intro.includes('06 octobre 2099'));
  assert.ok(mail.intro.includes(input.subTitle));
  assert.ok(mail.note.includes(input.author));
  assert.ok(mail.imageUrl.endsWith('/logo.png'));
  assert.ok(mail.links[0].endsWith('/contact'));
  assert.ok(mail.links[1].endsWith('/evenements'));
  assert.deepEqual(recipientFilter, {
    emailVerified: true,
    canReceiveMarketingEmails: true,
  });
  const html = getMarketingEmailHtml(mail);
  assert.ok(html.includes('<img src="' + mail.imageUrl + '"'));
  assert.ok(html.includes('Rencontre &lt;7.59&gt;'));
  assert.ok(html.includes('Repas &amp; conférence'));
  assert.ok(html.includes('href="' + mail.links[0] + '"'));
  failMail = true;
  await assert.rejects(() =>
    createEventService({ ...input, sendToMembers: true }),
  );
  assert.equal(committed.length, 2);
  failMail = false;
  admin = false;
  await assert.rejects(() => createEventService(input));
  assert.equal(committed.length, 2);
  admin = true;
  await getMarketingEmailRecipientsFromPrismaRepository();
  assert.deepEqual(recipientFilter, {
    emailVerified: true,
    canReceiveMarketingEmails: true,
  });
});

test('dates are validated on creation and editing; marketing opt-in defaults off', () => {
  assert.equal(createEventSchema.parse(input).sendToMembers, false);
  assert.equal(
    createEventSchema.safeParse({ ...input, eventEndDate: '2099-10-04' })
      .success,
    false,
  );
  assert.equal(
    updateEventSchema.safeParse({
      ...input,
      id: 'id',
      displayEndDate: '2099-09-30',
    }).success,
    false,
  );
  assert.equal(
    createEventSchema.safeParse({ ...input, sendToMembers: 'true' }).success,
    false,
  );
});

test('optional media preserves old emails and escapes unsafe URLs', () => {
  const html = getMarketingEmailHtml({ title: 'Titre', content: 'Texte' });
  assert.ok(!html.includes('<img'));
  const unsafe = getMarketingEmailHtml({
    title: 'Titre',
    content: 'Texte',
    imageUrl: 'javascript:alert(1)',
    links: ['javascript:alert(1)'],
  });
  assert.ok(!unsafe.includes('javascript:'));
});
