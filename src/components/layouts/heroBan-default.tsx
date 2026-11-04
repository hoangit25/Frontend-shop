
export default function HeroBanner() {

interface ServiceItem {
  name: string;
  icon: string;
  color: string;
}


const services: ServiceItem[] = [
  { name: "Shopee Super Cheap", icon: "fa-tags", color: "text-blue-500" },
  {
    name: "Fulfillment by Shopee",
    icon: "fa-shopping-bag",
    color: "text-red-500",
  },
  { name: "Shopee Home", icon: "fa-home", color: "text-teal-500" },
  { name: "Shopee Rewards", icon: "fa-star", color: "text-orange-500" },
  { name: "Telco & Bills", icon: "fa-mobile-alt", color: "text-green-500" },
];



  return (
    <section className="bg-white pt-8 pb-4">
      <div className="container mx-auto px-4">
        <div className="flex gap-2 h-[235px]">
          {/* Main Banner */}
          <div className="w-2/3 relative rounded overflow-hidden shadow-sm">
            <img
              src="https://images.unsplash.com/photo-1542291026-7eec264c27ff?q=80&w=2070&auto=format&fit=crop"
              alt="Main Banner"
              className="w-full h-full object-cover"
            />

            <div className="absolute inset-0 banner-gradient opacity-90 flex items-center px-12 text-white">
              <div className="space-y-2">
                <h2 className="text-5xl font-black italic">11.11</h2>

                <p className="bg-white text-orange-600 inline-block px-3 py-1 font-bold text-sm">
                  DUY NHẤT 29.10
                </p>

                <h3 className="text-2xl font-bold uppercase">
                  Adidas Mua Sắm Mùa Lễ Hội
                </h3>

                <div className="flex gap-4 mt-4">
                  <div>
                    <p className="text-xs">GIẢM ĐẾN</p>
                    <p className="text-4xl font-black">30% +</p>
                  </div>

                  <div>
                    <p className="text-xs">VOUCHER</p>
                    <p className="text-4xl font-black">20%</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
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

          {/* Side Banners */}
          <div className="w-1/3 flex flex-col gap-1">
            <div className="h-1/2 relative rounded overflow-hidden shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?q=80&w=2070&auto=format&fit=crop"
                alt="Shopee Home Banner"
                className="w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-red-500/80 p-4 text-white flex flex-col justify-center">
                <p className="font-bold text-xs">SHOPEE HOME</p>

                <p className="font-black text-xl leading-tight">
                  MUA HÀNG TO CÓ SHOP-MIMU LO
                </p>

                <p className="text-[10px] mt-1 italic">
                  Miễn phí lắp đặt | Deal giảm đến 50%
                </p>
              </div>
            </div>

            <div className="h-1/2 relative rounded overflow-hidden shadow-sm">
              <img
                src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1999&auto=format&fit=crop"
                alt="Shopee Live Banner"
                className="w-full h-full object-cover"
              />

              <div className="absolute inset-0 bg-sky-400/80 p-4 text-white flex flex-col justify-center">
                <div className="flex gap-2 items-center">
                  <span className="font-bold text-xs bg-red-600 px-1">
                    LIVE
                  </span>

                  <p className="font-black text-xl leading-tight">
                    ĐỦ NHU CẦU HỜI MỌI DEAL
                  </p>
                </div>

                <p className="text-[10px] mt-1">
                  Giảm đến 50% | Voucher 15%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Service Icons */}
        <div className="flex justify-between mt-8 mb-4">
          {services.map((service) => (
            <div
              key={service.name}
              className="flex flex-col items-center gap-2 cursor-pointer group w-40"
            >
              <div className="w-12 h-12 rounded-2xl border border-gray-100 flex items-center justify-center bg-white shadow-sm transition-transform group-hover:-translate-y-1">
                <i
                  className={`fas ${service.icon} text-xl ${service.color}`}
                />
              </div>

              <span className="text-xs text-center text-gray-700">
                {service.name}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
