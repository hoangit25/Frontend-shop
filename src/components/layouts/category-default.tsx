
import { useState } from "react";
import { Link } from "react-router-dom";
import { useCategories } from "../hooks/categories";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DEFAULT_CATEGORY_IMG =
  "https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=200&auto=format&fit=crop";

export default function Categories() {
  const { categories, isLoading, isError } = useCategories();

  const [currentIndex, setCurrentIndex] = useState(0);

  // Số danh mục hiển thị theo màn hình
  const visibleCount = 5;

  const maxIndex = Math.max(0, categories.length - visibleCount);

  const handleNext = () => {
    setCurrentIndex((prev) => Math.min(prev + 1, maxIndex));
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => Math.max(prev - 1, 0));
  };

  return (
    <section className="container mx-auto px-3 sm:px-4 mt-4 sm:mt-6">
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">

        {/* Header */}
        <div className="px-3 sm:px-4 py-3 sm:py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-gray-500 uppercase font-medium text-xs sm:text-sm">
            Danh mục
          </h2>

          <Link
            to="/products"
            className="flex items-center gap-1 text-orange-500 hover:text-orange-600 text-xs font-medium transition-colors"
          >
            Xem tất cả
            <ChevronRight size={14} />
          </Link>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="grid grid-cols-5 animate-pulse">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="border-r border-gray-50 p-3 flex flex-col items-center gap-2"
              >
                <div className="w-11 h-11 sm:w-14 sm:h-14 rounded-full bg-gray-200" />
                <div className="h-3 bg-gray-200 rounded w-14" />
              </div>
            ))}
          </div>
        )}

        {/* Error / Empty */}
        {!isLoading && (isError || categories.length === 0) && (
          <div className="py-8 text-center text-gray-400 text-xs sm:text-sm">
            {isError
              ? "Không thể tải danh mục sản phẩm."
              : "Chưa có danh mục nào."}
          </div>
        )}

        {/* Category Carousel */}
        {!isLoading && !isError && categories.length > 0 && (
          <div className="relative group">

            {/* Previous Button */}
            {currentIndex > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                aria-label="Danh mục trước"
                className="
                  absolute left-2 top-1/2 -translate-y-1/2 z-10
                  w-8 h-8 sm:w-10 sm:h-10
                  rounded-full
                  bg-white
                  shadow-md
                  border border-gray-100
                  flex items-center justify-center
                  text-gray-600
                  hover:text-orange-500
                  hover:bg-orange-50
                  transition-all
                "
              >
                <ChevronLeft size={20} />
              </button>
            )}

            {/* Next Button */}
            {currentIndex < maxIndex && (
              <button
                type="button"
                onClick={handleNext}
                aria-label="Danh mục tiếp theo"
                className="
                  absolute right-2 top-1/2 -translate-y-1/2 z-10
                  w-8 h-8 sm:w-10 sm:h-10
                  rounded-full
                  bg-white
                  shadow-md
                  border border-gray-100
                  flex items-center justify-center
                  text-gray-600
                  hover:text-orange-500
                  hover:bg-orange-50
                  transition-all
                "
              >
                <ChevronRight size={20} />
              </button>
            )}

            {/* Categories */}
            <div className="overflow-hidden">
              <div
                className="flex transition-transform duration-300 ease-in-out"
                style={{
                  transform: `translateX(-${currentIndex * (100 / visibleCount)}%)`,
                }}
              >
                {categories.map((category) => (
                  <Link
                    key={category._id}
                    to={`/category/${category.slug}`}
                    className="
                      flex-none
                      w-1/5
                      border-r border-gray-50
                      border-b
                      p-2 sm:p-3 lg:p-4
                      flex flex-col
                      items-center
                      justify-start
                      gap-2
                      cursor-pointer
                      hover:bg-orange-50/30
                      transition-colors
                      group/item
                    "
                  >
                    {/* Image */}
                    <div
                      className="
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
                      "
                    >
                      <img
                        src={category.image || DEFAULT_CATEGORY_IMG}
                        alt={category.name}
                        loading="lazy"
                        onError={(e) => {
                          e.currentTarget.onerror = null;
                          e.currentTarget.src = DEFAULT_CATEGORY_IMG;
                        }}
                        className="
                          w-full h-full
                          object-contain
                          mix-blend-multiply
                          transition-transform duration-300
                          group-hover/item:scale-110
                        "
                      />
                    </div>

                    {/* Name */}
                    <span
                      className="
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
                        group-hover/item:text-orange-600
                      "
                    >
                      {category.name}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
