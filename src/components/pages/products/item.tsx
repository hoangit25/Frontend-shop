import type { Product } from "../../types/product.type";

interface ProductItemProps {
  item: Product;
  onAddToCart?: (product: Product) => void;
}

export default function ProductItem({
  item,
  onAddToCart,
}: ProductItemProps) {
  const title = item.name || item.title || "Sản phẩm";
  const thumbnail = item.image || item.thumbnail || (item.images && item.images[0]) || "/placeholder.png";
  const discount = item.discount ?? item.discountPercentage ?? 0;
  
  // Tính giá sau giảm: nếu có originalPrice thì giá bán là item.price, hoặc tính theo discount
  const originalPrice = item.originalPrice && item.originalPrice > item.price 
    ? item.originalPrice 
    : (discount > 0 ? item.price / (1 - discount / 100) : item.price);
  
  const finalPrice = item.price;

  const formattedPrice = (price: number) => {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
  };

  return (
    <article className="
      group relative flex flex-col
      bg-white rounded-lg
      border border-gray-100
      overflow-hidden
      transition-all duration-300 ease-out
      hover:-translate-y-1
      hover:shadow-xl hover:shadow-gray-200/70
      hover:border-orange-200
    ">

      {/* Product Image */}
      <div className="relative aspect-square overflow-hidden bg-gray-50">

        <img
          src={thumbnail}
          alt={title}
          loading="lazy"
          className="
            w-full h-full object-cover
            transition-transform duration-500
            group-hover:scale-105
          "
        />

        {/* Discount Badge */}
        {discount > 0 && (
          <div className="
            absolute top-2 left-2
            bg-orange-500 text-white
            px-2 py-1
            rounded-sm
            text-[10px] sm:text-xs
            font-bold
            shadow-sm
          ">
            -{Math.round(discount)}%
          </div>
        )}

        {/* Favorite Button */}
        <button
          type="button"
          aria-label="Add to favorites"
          className="
            absolute top-2 right-2
            w-8 h-8 rounded-full
            bg-white/90 backdrop-blur-sm
            flex items-center justify-center
            text-gray-400
            hover:text-red-500
            hover:bg-white
            transition-colors
            shadow-sm
          "
        >
          <i className="far fa-heart" />
        </button>

      </div>

      {/* Product Information */}
      <div className="flex flex-col flex-1 p-3 sm:p-4">

        <h3 className="
          text-xs sm:text-sm
          text-gray-800
          font-medium
          leading-relaxed
          line-clamp-2
          min-h-[36px] sm:min-h-[42px]
          group-hover:text-orange-600
          transition-colors
        ">
          {title}
        </h3>

        {/* Price */}
        <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-1">

          <span className="
            text-base sm:text-lg
            font-bold text-orange-600
          ">
            {formattedPrice(finalPrice)}
          </span>

          {discount > 0 && (
            <span className="
              text-[11px] sm:text-xs
              text-gray-400
              line-through
            ">
              {formattedPrice(originalPrice)}
            </span>
          )}

        </div>

        {/* Bottom Information */}
        <div className="
          flex items-center justify-between
          mt-3 pt-3
          border-t border-gray-100
          gap-2
        ">

          <div className="flex items-center gap-1 min-w-0">
            <i className="fas fa-star text-yellow-400 text-xs" />
            <span className="text-xs text-gray-600">
              {item.rating ? item.rating.toFixed(1) : "5.0"}
            </span>
          </div>

          <span className="
            text-[10px] sm:text-xs
            text-gray-400
            truncate
          ">
            {item.sold !== undefined ? `Đã bán: ${item.sold}` : `Kho: ${item.stock}`}
          </span>

        </div>

        {/* Add to Cart */}
        <button
          type="button"
          onClick={() => onAddToCart?.(item)}
          className="
            w-full mt-3
            flex items-center justify-center gap-2
            py-2.5 px-2
            rounded-md
            bg-orange-50 text-orange-600
            border border-orange-100
            text-xs sm:text-sm font-semibold
            hover:bg-orange-500 hover:text-white
            hover:border-orange-500
            active:scale-[0.98]
            transition-all duration-200
          "
        >
          <i className="fas fa-shopping-cart" />
          Thêm vào giỏ
        </button>

      </div>
    </article>
  );
}
