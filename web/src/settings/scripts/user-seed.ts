import { PrismaClient } from '@prisma/client';
import { auth } from '@/features/auth/auth';
import { hashPassword } from 'better-auth/crypto';
import { randomUUID } from 'node:crypto';

const prisma = new PrismaClient();

const usersToSeed = [
  {
    name: 'Christophe Donnat',
    email: 'christophe@donnat.dev',
    password: 'Test123!flex',
    role: 'ADMIN' as const,
  },
    {
    name: 'Christophe Donnat',
    email: 'donnatchris@live.fr',
    password: 'Test123!flex',
    role: 'ADMIN' as const,
  },

];

async function seedUser({
  name,
  email,
  password,
  role,
}: (typeof usersToSeed)[number]) {
  let user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    await auth.api.signUpEmail({
      body: {
        name,
        email,
        password,
        legalTermsAccepted: true,
      },
    });

    user = await prisma.user.findUniqueOrThrow({ where: { email } });
  }

  const passwordHash = await hashPassword(password);
  const credentialAccount = await prisma.account.findFirst({
    where: {
      userId: user.id,
      providerId: 'credential',
      accountId: user.id,
    },
  });

  if (credentialAccount) {
    await prisma.account.update({
      where: { id: credentialAccount.id },
      data: { password: passwordHash },
    });
  } else {
    await prisma.account.create({
      data: {
        id: randomUUID(),
        userId: user.id,
        providerId: 'credential',
        accountId: user.id,
        password: passwordHash,
      },
    });
  }

  await prisma.user.update({
    where: { email },
    data: {
      name,
      role,
      emailVerified: true,
    },
  });

  console.log(`Seeded ${role.toLowerCase()} user: ${email}`);
}

async function main() {
  for (const user of usersToSeed) {
    await seedUser(user);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
