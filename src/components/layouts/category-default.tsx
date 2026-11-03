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
        <section className="container mx-auto px-4 mt-6">
            <div className="bg-white rounded-sm shadow-sm overflow-hidden relative">
                <div className="p-4 border-b border-gray-100">
                    <h2 className="text-gray-500 uppercase font-medium">
                        Categories
                    </h2>
                </div>

                <div className="grid grid-cols-10 border-l border-t border-gray-50">
                    {categories.map((category) => (
                        <div
                            key={category.name}
                            className="border-r border-b border-gray-50 p-4 flex flex-col items-center gap-2 cursor-pointer hover:shadow-md transition-shadow"
                        >
                            <div className="w-20 h-20 overflow-hidden bg-gray-50 rounded-full flex items-center justify-center p-2">
                                <img
                                    src={category.img}
                                    alt={category.name}
                                    loading="lazy"
                                    className="w-full h-full object-contain mix-blend-multiply"
                                />
                            </div>

                            <span className="text-[13px] text-center text-gray-700 leading-tight h-8 flex items-center">
                                {category.name}
                            </span>
                        </div>
                    ))}
                </div>

                <button
                    type="button"
                    aria-label="Next categories"
                    className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 w-8 h-8 bg-white shadow-lg rounded-full flex items-center justify-center text-gray-400 border border-gray-100 hover:text-orange-500"
                >
                    <i className="fas fa-chevron-right" />
                </button>
            </div>
        </section>
    );
}