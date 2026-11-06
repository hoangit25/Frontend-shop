
export default function HeroBanner() {
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

  return (
    <section className="bg-white pt-4 sm:pt-6 lg:pt-8 pb-4">
      <div className="container mx-auto px-3 sm:px-4">

        {/* Banners */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2 h-[180px] sm:h-[230px] lg:h-[280px]">

          {/* Main Banner */}
          <div className="relative md:col-span-2 rounded-lg overflow-hidden shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop"
              alt="Main Banner"
              className="w-full h-full object-cover"
            />

            <div className="absolute inset-0 bg-gradient-to-r from-orange-700/90 to-transparent flex items-center px-4 sm:px-8 lg:px-12 text-white">
              <div className="space-y-1 sm:space-y-2">
                <h2 className="text-3xl sm:text-5xl lg:text-6xl font-black italic">
                  11.11
                </h2>

                <p className="bg-white text-orange-600 inline-block px-2 py-1 font-bold text-[10px] sm:text-sm">
                  DUY NHẤT 29.10
                </p>

                <h3 className="text-base sm:text-xl lg:text-2xl font-bold uppercase">
                  Adidas Mua Sắm Mùa Lễ Hội
                </h3>

                <div className="flex gap-4 mt-2">
                  <div>
                    <p className="text-[10px] sm:text-xs">GIẢM ĐẾN</p>
                    <p className="text-2xl sm:text-4xl font-black">30% +</p>
                  </div>

                  <div>
                    <p className="text-[10px] sm:text-xs">VOUCHER</p>
                    <p className="text-2xl sm:text-4xl font-black">20%</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-2">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className={`w-2 h-2 rounded-full border border-white/50 ${
                    item === 1 ? "bg-orange-500" : "bg-white/30"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Side Banners - Tablet/Desktop */}
          <div className="hidden md:flex flex-col gap-2 min-h-0">

            <div className="relative flex-1 min-h-0 rounded-lg overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=2070&auto=format&fit=crop"
                alt="Shopee Home"
                className="w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-red-500/80 p-2 sm:p-3 text-white flex flex-col justify-center">
                <p className="font-bold text-[10px] sm:text-xs">SHOPEE HOME</p>
                <p className="font-black text-sm sm:text-xl leading-tight">
                  MUA HÀNG TO CÓ SHOP-MIMU LO
                </p>
                <p className="text-[9px] sm:text-[10px] mt-1">
                  Miễn phí lắp đặt | Deal giảm đến 50%
                </p>
              </div>
            </div>

            <div className="relative flex-1 min-h-0 rounded-lg overflow-hidden">
              <img
                src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999&auto=format&fit=crop"
                alt="Shopee Live"
                className="w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-sky-500/80 p-2 sm:p-3 text-white flex flex-col justify-center">
                <span className="font-bold text-[10px] bg-red-600 px-1 w-fit">
                  LIVE
                </span>
                <p className="font-black text-sm sm:text-xl leading-tight">
                  ĐỦ NHU CẦU HỜI MỌI DEAL
                </p>
                <p className="text-[9px] sm:text-[10px] mt-1">
                  Giảm đến 50% | Voucher 15%
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Services */}
        <div className="grid grid-cols-3 sm:grid-cols-5 gap-3 sm:gap-4 mt-6 sm:mt-8">
          {services.map((service) => (
            <div
              key={service.name}
              className="flex flex-col items-center gap-2 cursor-pointer group"
            >
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl border border-gray-100 flex items-center justify-center bg-white shadow-sm transition-transform group-hover:-translate-y-1">
                <i className={`fas ${service.icon} text-lg sm:text-xl ${service.color}`} />
              </div>

              <span className="text-[10px] sm:text-xs text-center text-gray-700 leading-tight">
                {service.name}
              </span>
            </div>
          ))}
        </div>

      </div>
    </section>
  );
}
