'use client';

import Image from 'next/image';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, A11y } from 'swiper/modules';
import type { CarouselImage } from '../lib/carousel.types';
import { EditCarouselAdminButton } from './edit-carousel-admin-button';
import { useIsMobile } from '@/features/core/responsive/responsive.hook';

import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

type Props = {
  images: CarouselImage[];
};

export function Carousel({ images }: Props) {
  const isMobile = useIsMobile();
  const numberOfImages = images.length ?? 0;
  const hasImages = numberOfImages > 0;
  const slidesPerView =
    isMobile && hasImages ? 1 : numberOfImages >= 3 ? 3 : numberOfImages;
  const slideSizes =
    slidesPerView >= 3
      ? '(min-width: 1024px) 33vw, (min-width: 768px) 50vw, 100vw'
      : slidesPerView === 2
        ? '(min-width: 768px) 50vw, 100vw'
        : '100vw';
  return (
    <section className="relative mx-auto max-w-[1400px] px-4 py-10 sm:px-8">
      <div className="absolute top-4 right-4 z-20">
        <EditCarouselAdminButton images={images} />
      </div>
      {hasImages && (
        <Swiper
          navigation
          pagination={{ type: 'bullets' }}
          a11y={{
            containerMessage: "Carrousel d'images de l'accueil",
            prevSlideMessage: 'Image précédente',
            nextSlideMessage: 'Image suivante',
            paginationBulletMessage: "Aller à l'image {{index}}",
          }}
          modules={[Navigation, Pagination, Autoplay, A11y]}
          slidesPerView={slidesPerView}
          loop
          autoplay={{ delay: 3000, disableOnInteraction: false }}
          className="home-carousel relative h-[18rem] w-full rounded-md sm:h-[24rem]"
        >
          {images.map((image, i) => (
            <SwiperSlide key={i}>
              <div className="relative flex h-full w-full items-center justify-center overflow-hidden border-x-4 border-background">
                <Image
                  src={image.url}
                  alt={`Slide ${i + 1}`}
                  fill
                  sizes={slideSizes}
                  className="block object-cover object-center transition-transform duration-700 hover:scale-[1.03]"
                  priority={i <= slidesPerView - 1}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>
      )}
    </section>
  );
}
