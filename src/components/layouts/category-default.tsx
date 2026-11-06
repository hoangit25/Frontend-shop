
export default function Categories() {
  interface CategoryItem {
    name: string;
    img: string;
  }

  const categories: CategoryItem[] = [
    {
      name: "Men Clothes",
      img: "https://images.unsplash.com/photo-1591047139829-d91aecb6caea?q=80&w=200&auto=format&fit=crop",
    },
    {
      name: "Mobile & Gadgets",
      img: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?q=80&w=200&auto=format&fit=crop",
    },
    {
      name: "Consumer Electronics",
      img: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?q=80&w=200&auto=format&fit=crop",
    },
    {
      name: "Computer & Accessories",
      img: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?q=80&w=200&auto=format&fit=crop",
    },
    {
      name: "Cameras",
      img: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=200&auto=format&fit=crop",
    },
    {
      name: "Watches",
      img: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?q=80&w=200&auto=format&fit=crop",
    },
    {
      name: "Men Shoes",
      img: "https://images.unsplash.com/photo-1549298916-b41d501d3772?q=80&w=200&auto=format&fit=crop",
    },
    {
      name: "Home Appliances",
      img: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?q=80&w=200&auto=format&fit=crop",
    },
    {
      name: "Sport & Outdoor",
      img: "https://images.unsplash.com/photo-1517649763962-0c623066013b?q=80&w=200&auto=format&fit=crop",
    },
    {
      name: "Automotive",
      img: "https://images.unsplash.com/photo-1558981403-c5f91cbba527?q=80&w=200&auto=format&fit=crop",
    },
  ];

  return (
    <section className="container mx-auto px-3 sm:px-4 mt-4 sm:mt-6">

      <div className="bg-white rounded-lg shadow-sm overflow-hidden">

        {/* Header */}
        <div className="px-3 sm:px-4 py-3 sm:py-4 border-b border-gray-100">
          <h2 className="text-gray-500 uppercase font-medium text-xs sm:text-sm">
            Categories
          </h2>
        </div>

        {/* Category Grid */}
        <div className="
          grid
          grid-cols-5
          border-l border-t border-gray-50
        ">
          {categories.map((category) => (
            <button
              type="button"
              key={category.name}
              className="
                min-w-0
                border-r border-b border-gray-50
                p-1.5 sm:p-3 lg:p-4
                flex flex-col
                items-center
                justify-start
                gap-2
                cursor-pointer
                hover:shadow-md
                hover:bg-orange-50/30
                transition-all duration-200
                group
              "
            >

              {/* Image */}
              <div className="
                w-11 h-11
                sm:w-14 sm:h-14
                md:w-16 md:h-16
                lg:w-20 lg:h-20
                rounded-full
                overflow-hidden
                bg-gray-50
                flex items-center justify-center
                p-1 sm:p-2
                shrink-0
              ">
                <img
                  src={category.img}
                  alt={category.name}
                  loading="lazy"
                  className="
                    w-full h-full
                    object-contain
                    mix-blend-multiply
                    transition-transform duration-300
                    group-hover:scale-110
                  "
                />
              </div>

              {/* Name */}
              <span className="
                w-full
                text-[9px]
                sm:text-[10px]
                md:text-xs
                lg:text-[13px]
                text-center
                text-gray-700
                leading-tight
                line-clamp-2
                min-h-[24px]
                sm:min-h-[32px]
                flex items-center justify-center
                break-words
                group-hover:text-orange-600
              ">
                {category.name}
              </span>

            </button>
          ))}
        </div>

      </div>
    </section>
  );
}
