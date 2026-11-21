import "./heroBaner.css";
import React from "react";
import { Link } from "react-router-dom";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay, EffectFade, Pagination, A11y } from "swiper/modules";
import { useBanners } from "../../hooks/banners";
import type { Banner } from "../../types/banner.type";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/pagination";

interface ServiceItem {
  name: string;
  icon: string;
  color: string;
}

const services: ServiceItem[] = [
  { name: "Shopee Super Cheap", icon: "fa-tags", color: "text-blue-500" },
  { name: "Fulfillment by Shopee", icon: "fa-shopping-bag", color: "text-red-500" },
  { name: "Shopee Home", icon: "fa-home", color: "text-teal-500" },
  { name: "Shopee Rewards", icon: "fa-star", color: "text-orange-500" },
  { name: "Telco & Bills", icon: "fa-mobile-alt", color: "text-green-500" },
];

const fallbackBannerSlides: Banner[] = [
  {
    _id: "fb-1",
    image:
      "https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop",
    alt: "Ưu đãi mua sắm giày thể thao",
    date: "DUY NHẤT 29.10",
    title: "11.11",
    subtitle: "Adidas Mua Sắm Mùa Lễ Hội",
    discount: "30% +",
    voucher: "20%",
    link: "/products",
    placement: "home_hero",
    position: 1,
    isActive: true,
  },
  {
    _id: "fb-2",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=2070&auto=format&fit=crop",
    alt: "Ưu đãi đồng hồ và phụ kiện",
    date: "ƯU ĐÃI ĐẶC BIỆT",
    title: "SALE 50%",
    subtitle: "Phụ Kiện Thời Trang Cao Cấp",
    discount: "50%",
    voucher: "15%",
    link: "/products",
    placement: "home_hero",
    position: 2,
    isActive: true,
  },
  {
    _id: "fb-3",
    image:
      "https://images.unsplash.com/photo-1556906781-9a412961c28c?q=80&w=2070&auto=format&fit=crop",
    alt: "Ưu đãi thời trang và giày dép",
    date: "DEAL HOT MỖI NGÀY",
    title: "MEGA SALE",
    subtitle: "Săn Deal Thời Trang Mùa Lễ Hội",
    discount: "40% +",
    voucher: "25%",
    link: "/products",
    placement: "home_hero",
    position: 3,
    isActive: true,
  },
];

export default function HeroBanner() {
  const { banners, isLoading } = useBanners({ placement: "home_hero" });

  const displaySlides = banners.length > 0 ? banners : fallbackBannerSlides;

  return (
    <section className="bg-white pt-4 pb-4 sm:pt-6 lg:pt-8">
      <div className="container mx-auto px-3 sm:px-4">
        {/* Banner layout */}
        <div className="grid grid-cols-1 gap-2 md:grid-cols-3 md:h-[230px] lg:h-[280px]">
          {/* Main carousel */}
          <div className="relative h-[180px] overflow-hidden rounded-lg shadow-sm sm:h-[230px] md:col-span-2 md:h-full">
            {isLoading && banners.length === 0 ? (
              <div className="relative h-full w-full overflow-hidden rounded-lg bg-gray-200 animate-pulse">
                {/* Background shimmer */}
                <div className="absolute inset-0 bg-gradient-to-r from-gray-300/60 via-gray-200/40 to-gray-300/60" />

                {/* Content skeleton overlay */}
                <div className="absolute inset-0 flex items-center px-4 sm:px-8 lg:px-12">
                  <div className="space-y-2 sm:space-y-3 w-full max-w-md">
                    {/* Title skeleton */}
                    <div className="h-8 sm:h-12 lg:h-14 w-28 sm:w-44 bg-gray-300/90 rounded-md" />

                    {/* Date badge skeleton */}
                    <div className="h-4 sm:h-5 w-24 sm:w-32 bg-gray-300/90 rounded" />

                    {/* Subtitle skeleton */}
                    <div className="h-4 sm:h-6 w-48 sm:w-72 bg-gray-300/90 rounded" />

                    {/* Badges skeleton */}
                    <div className="mt-3 flex gap-4 sm:gap-6 pt-1">
                      <div className="space-y-1">
                        <div className="h-2.5 w-12 bg-gray-300/80 rounded" />
                        <div className="h-6 sm:h-8 w-16 sm:w-20 bg-gray-300/90 rounded-md" />
                      </div>
                      <div className="space-y-1">
                        <div className="h-2.5 w-12 bg-gray-300/80 rounded" />
                        <div className="h-6 sm:h-8 w-16 sm:w-20 bg-gray-300/90 rounded-md" />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Pagination bullets skeleton */}
                <div className="absolute bottom-3 left-0 right-0 flex justify-center gap-1.5 z-10">
                  <div className="h-2 w-6 rounded-full bg-orange-400/70" />
                  <div className="h-2 w-2 rounded-full bg-gray-300" />
                  <div className="h-2 w-2 rounded-full bg-gray-300" />
                </div>
              </div>
            ) : (
              <Swiper
                modules={[Autoplay, EffectFade, Pagination, A11y]}
                slidesPerView={1}
                loop={displaySlides.length > 1}
                effect="fade"
                fadeEffect={{ crossFade: true }}
                autoplay={{
                  delay: 4000,
                  disableOnInteraction: false,
                  pauseOnMouseEnter: true,
                }}
                pagination={{
                  clickable: true,
                  bulletClass: "swiper-pagination-bullet hero-bullet",
                  bulletActiveClass:
                    "swiper-pagination-bullet-active hero-bullet-active",
                }}
                speed={900}
                className="h-full w-full hero-banner-swiper"
              >
                {displaySlides.map((slide) => {
                  const key = slide._id || (slide as any).id || slide.title;
                  const SlideWrapper = ({
                    children,
                  }: {
                    children: React.ReactNode;
                  }) =>
                    slide.link ? (
                      <Link to={slide.link} className="block relative h-full w-full">
                        {children}
                      </Link>
                    ) : (
                      <div className="relative h-full w-full">{children}</div>
                    );

                  return (
                    <SwiperSlide key={key}>
                      <SlideWrapper>
                        <img
                          src={slide.image}
                          alt={slide.alt || slide.title}
                          className="h-full w-full object-cover"
                        />

                        <div className="absolute inset-0 flex items-center bg-gradient-to-r from-orange-700/90 via-orange-600/50 to-transparent px-4 text-white sm:px-8 lg:px-12">
                          <div className="space-y-1 sm:space-y-2">
                            {slide.title && (
                              <h2 className="text-3xl font-black italic sm:text-5xl lg:text-6xl">
                                {slide.title}
                              </h2>
                            )}

                            {slide.date && (
                              <p className="inline-block bg-white px-2 py-1 text-[10px] font-bold text-orange-600 sm:text-sm">
                                {slide.date}
                              </p>
                            )}

                            {slide.subtitle && (
                              <h3 className="text-sm font-bold uppercase sm:text-xl lg:text-2xl">
                                {slide.subtitle}
                              </h3>
                            )}

                            {(slide.discount || slide.voucher) && (
                              <div className="mt-2 flex gap-4 sm:gap-6">
                                {slide.discount && (
                                  <div>
                                    <p className="text-[10px] sm:text-xs">GIẢM ĐẾN</p>
                                    <p className="text-2xl font-black sm:text-4xl">
                                      {slide.discount}
                                    </p>
                                  </div>
                                )}

                                {slide.voucher && (
                                  <div>
                                    <p className="text-[10px] sm:text-xs">VOUCHER</p>
                                    <p className="text-2xl font-black sm:text-4xl">
                                      {slide.voucher}
                                    </p>
                                  </div>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </SlideWrapper>
                    </SwiperSlide>
                  );
                })}
              </Swiper>
            )}
          </div>

          {/* Side banners */}
          <div className="hidden min-h-0 flex-col gap-2 md:flex">
            {/* Shopee Home */}
            <div className="group relative min-h-0 flex-1 overflow-hidden rounded-lg">
              <img
                src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=2070&auto=format&fit=crop"
                alt="Shopee Home"
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />

              <div className="absolute inset-0 flex flex-col justify-center bg-red-500/70 p-2 text-white transition-colors duration-300 group-hover:bg-red-500/60 sm:p-3">
                <p className="text-[10px] font-bold sm:text-xs">
                  SHOPEE HOME
                </p>

                <p className="text-sm font-black leading-tight sm:text-xl">
                  MUA HÀNG TO CÓ SHOP-MIMU LO
                </p>

                <p className="mt-1 text-[9px] sm:text-[10px]">
                  Miễn phí lắp đặt | Deal giảm đến 50%
                </p>
              </div>
            </div>

            {/* Shopee Live */}
            <div className="group relative min-h-0 flex-1 overflow-hidden rounded-lg">
              <img
                src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999&auto=format&fit=crop"
                alt="Shopee Live"
                className="h-full w-full object-cover transition-transform duration-700 ease-out group-hover:scale-110"
              />

              <div className="absolute inset-0 flex flex-col justify-center bg-sky-500/70 p-2 text-white transition-colors duration-300 group-hover:bg-sky-500/60 sm:p-3">
                <span className="w-fit bg-red-600 px-1 text-[10px] font-bold">
                  LIVE
                </span>

                <p className="text-sm font-black leading-tight sm:text-xl">
                  ĐỦ NHU CẦU HỜI MỌI DEAL
                </p>

                <p className="mt-1 text-[9px] sm:text-[10px]">
                  Giảm đến 50% | Voucher 15%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Services */}
        <div className="mt-6 grid grid-cols-3 gap-3 sm:mt-8 sm:grid-cols-5 sm:gap-4">
          {services.map((service) => (
            <div
              key={service.name}
              className="group flex cursor-pointer flex-col items-center gap-2"
            >
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-gray-100 bg-white shadow-sm transition-transform group-hover:-translate-y-1 sm:h-12 sm:w-12">
                <i
                  className={`fas ${service.icon} text-lg sm:text-xl ${service.color}`}
                />
              </div>

              <span className="text-center text-[10px] leading-tight text-gray-700 sm:text-xs">
                {service.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
