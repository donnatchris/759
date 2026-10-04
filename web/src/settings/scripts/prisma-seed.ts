import { eventsSeed } from '../data/data.events';
import { PrismaClient } from '@prisma/client';
import {
  initialRessources,
  siteServicesCategories,
  siteServices,
  siteServiceRessources,
} from '../data/data.services';
import { siteSettings } from '../data/data.siteSettings';
import { siteSocialMedias } from '../data/data.socialMedias';
import { sitePages } from '../data/data.pages';
import { carouselImages } from '../data/data.carousel-images';
import { siteSectionSeeds } from '../data/data.site-sections';
import { blogPostsSeed } from '../data/data.blog';
import { openingSlots } from '../data/data.opening-slots';
import { bookingSettingsSeed } from '../data/data.booking-settings';
import { legalTermsSeed } from '../data/data.legal-terms';
import { siteDishCategories, siteDishes } from '../data/data.dishes';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database with site services...');

  await prisma.siteSettings.deleteMany();
  await prisma.siteSettings.create({
    data: {
      ...siteSettings,
    },
  });

  await prisma.bookingSettings.deleteMany();
  console.log('Creating booking settings');
  await prisma.bookingSettings.create({
    data: {
      ...bookingSettingsSeed,
    },
  });

  await prisma.openingExceptionSlot.deleteMany();
  await prisma.openingException.deleteMany();
  await prisma.openingSlot.deleteMany();
  for (const openingSlot of openingSlots) {
    console.log(
      `Creating opening slot: dayOfWeek=${openingSlot.dayOfWeek}, opensAtMinute=${openingSlot.opensAtMinute}, closesAtMinute=${openingSlot.closesAtMinute}`,
    );
    await prisma.openingSlot.create({
      data: {
        ...openingSlot,
      },
    });
  }

  await prisma.sitePage.deleteMany();
  for (const page of sitePages) {
    console.log(`Creating page: ${page.title}`);
    await prisma.sitePage.create({
      data: {
        ...page,
      },
    });
  }

  await prisma.siteSection.deleteMany();
  for (const siteSection of siteSectionSeeds) {
    console.log(`Creating site section: ${siteSection.id}`);
    await prisma.siteSection.create({
      data: {
        ...siteSection,
      },
    });
  }

  await prisma.carouselImage.deleteMany();
  for (const image of carouselImages) {
    console.log(`Creating carousel image: ${image.url}`);
    await prisma.carouselImage.create({
      data: {
        ...image,
      },
    });
  }

  await prisma.reservation.deleteMany();
  await prisma.ressource.deleteMany();
  await prisma.servicesCategory.deleteMany();
  await prisma.serviceRessource.deleteMany();
  await prisma.service.deleteMany();

  for (const serviceCategory of siteServicesCategories) {
    console.log(`Creating service category: ${serviceCategory.label}`);
    await prisma.servicesCategory.create({
      data: {
        ...serviceCategory,
      },
    });
  }

  for (const ressource of initialRessources) {
    console.log(`Creating ressource: ${ressource.label}`);
    await prisma.ressource.create({
      data: {
        ...ressource,
      },
    });
  }

  for (const service of siteServices) {
    console.log(`Creating service: ${service.label}`);
    await prisma.service.create({
      data: {
        ...service,
      },
    });
  }

  for (const serviceRessource of siteServiceRessources) {
    console.log(
      `Creating service ressource: serviceId=${serviceRessource.serviceId}, ressourceId=${serviceRessource.ressourceId}`,
    );
    await prisma.serviceRessource.create({
      data: {
        ...serviceRessource,
      },
    });
  }

  await prisma.dish.deleteMany();
  await prisma.dishCategory.deleteMany();

  for (const dishCategory of siteDishCategories) {
    console.log(`Creating dish category: ${dishCategory.label}`);
    await prisma.dishCategory.create({
      data: {
        ...dishCategory,
      },
    });
  }

  for (const dish of siteDishes) {
    console.log(`Creating dish: ${dish.label}`);
    await prisma.dish.create({
      data: {
        ...dish,
      },
    });
  }

  await prisma.socialMedia.deleteMany();
  for (const socialMedia of siteSocialMedias) {
    console.log(`Creating social media: ${socialMedia.name}`);
    await prisma.socialMedia.create({
      data: {
        ...socialMedia,
      },
    });
  }

  await prisma.event.deleteMany();
  await prisma.event.createMany({ data: eventsSeed });

  await prisma.blogPost.deleteMany();
  for (const blogPost of blogPostsSeed) {
    console.log(`Creating blog post: ${blogPost.title}`);
    await prisma.blogPost.create({
      data: {
        ...blogPost,
      },
    });
  }

  await prisma.legalTerms.deleteMany();
  console.log(`Creating legal term`);
  await prisma.legalTerms.create({
    data: {
      ...legalTermsSeed,
    },
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
