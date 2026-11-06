import { Link } from "react-router-dom";
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
  group relative flex flex-col min-w-0 h-full
  bg-white rounded-lg
  border border-gray-100
  overflow-hidden
  transition-all duration-300
  hover:shadow-xl hover:border-orange-200
">

      {/* Image */}
      <Link
        to={`/product-detail/${item._id || item.id || item.slug}`}
        className="relative aspect-square overflow-hidden bg-gray-50 block"
      >
        <img
          src={thumbnail}
          alt={title}
          loading="lazy"
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />

        {discount > 0 && (
          <div className="absolute top-1.5 left-1.5 sm:top-2 sm:left-2 bg-orange-500 text-white px-1.5 sm:px-2 py-1 rounded-sm text-[9px] sm:text-xs font-bold">
            -{Math.round(discount)}%
          </div>
        )}

        <button
          type="button"
          aria-label="Add to favorites"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="absolute top-1.5 right-1.5 sm:top-2 sm:right-2 w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white/90 flex items-center justify-center text-gray-400 hover:text-red-500 transition-colors"
        >
          <i className="far fa-heart text-xs sm:text-sm" />
        </button>
      </Link>

      {/* Information */}
      <div className="flex flex-col flex-1 p-2 sm:p-3 lg:p-4">

        <Link to={`/product-detail/${item._id}`}>
          <h3 className="text-[11px] sm:text-xs lg:text-sm text-gray-800 font-medium leading-relaxed line-clamp-2 min-h-[32px] sm:min-h-[40px] group-hover:text-orange-600">
            {title}
          </h3>
        </Link>

        {/* Price */}
        <div className="mt-2 flex flex-wrap items-center gap-1 sm:gap-2">
          <span className="text-xs sm:text-base lg:text-lg font-bold text-orange-600">
            {formattedPrice(finalPrice)}
          </span>

          {discount > 0 && (
            <span className="text-[9px] sm:text-xs text-gray-400 line-through">
              {formattedPrice(originalPrice)}
            </span>
          )}
        </div>

        {/* Rating */}
        <div className="flex items-center justify-between mt-2 pt-2 border-t border-gray-100 gap-1">
          <div className="flex items-center gap-1">
            <i className="fas fa-star text-yellow-400 text-[10px]" />
            <span className="text-[10px] sm:text-xs text-gray-600">
              {item.rating ? item.rating.toFixed(1) : "5.0"}
            </span>
          </div>

          <span className="text-[9px] sm:text-xs text-gray-400 truncate">
            {item.sold !== undefined ? `Đã bán: ${item.sold}` : `Kho: ${item.stock}`}
          </span>
        </div>

        {/* Add cart */}
        <button
          type="button"
          onClick={() => onAddToCart?.(item)}
          className="w-full mt-2 sm:mt-3 flex items-center justify-center gap-1 sm:gap-2 py-2 px-1 sm:px-2 rounded-md bg-orange-50 text-orange-600 border border-orange-100 text-[10px] sm:text-xs lg:text-sm font-semibold hover:bg-orange-500 hover:text-white transition-all"
        >
          <i className="fas fa-shopping-cart" />
          <span>Thêm vào giỏ</span>
        </button>

      </div>
    </article>

  );
}
