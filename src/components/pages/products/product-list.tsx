
import { Link } from "react-router-dom";
import type { Product } from "../../types/product.type";

interface ProductItemProps {
  item: Product;
  onAddToCart?: (product: Product) => void;
  isAddingToCart?: boolean;
  isAdded?: boolean;
}

export default function ProductItem({
  item,
  onAddToCart,
  isAddingToCart = false,
  isAdded = false,
}: ProductItemProps) {
  const title = item.name || (item as any).title || "Sản phẩm";

  const thumbnail =
    item.image ||
    (item as any).thumbnail ||
    item.images?.[0] ||
    "/placeholder.png";

  const productId = item._id || (item as any).id || item.slug;

  const discount =
    item.discount ?? (item as any).discountPercentage ?? 0;

  const isOutOfStock =
    (item.stock !== undefined && item.stock <= 0) ||
    item.status === "OUT_OF_STOCK";

  const originalPrice =
    item.originalPrice && item.originalPrice > item.price
      ? item.originalPrice
      : discount > 0
        ? item.price / (1 - discount / 100)
        : item.price;

  const formattedPrice = (price: number) =>
    new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
      maximumFractionDigits: 0,
    }).format(price);

  return (
    <article
      className="
        group relative flex flex-col
        w-full h-full min-w-0
        bg-white rounded-xl
        border border-gray-100
        overflow-hidden
        transition-all duration-300
        hover:shadow-lg hover:border-orange-200
      "
    >
      {/* Product Image */}
      <Link
        to={`/product-detail/${productId}`}
        className="
          relative block w-full
          aspect-square shrink-0
          overflow-hidden bg-gray-50
        "
      >
        <img
          src={thumbnail}
          alt={title}
          loading="lazy"
          className={`
            w-full h-full object-cover
            transition-transform duration-500
            group-hover:scale-105
            ${isOutOfStock ? "grayscale opacity-75" : ""}
          `}
        />

        {/* Discount */}
        {discount > 0 && !isOutOfStock && (
          <span
            className="
              absolute top-2 left-2
              bg-orange-500 text-white
              px-2 py-1 rounded
              text-[10px] sm:text-xs font-bold
            "
          >
            -{Math.round(discount)}%
          </span>
        )}

        {/* Out of stock */}
        {isOutOfStock && (
          <span
            className="
              absolute top-2 left-2
              bg-gray-800/80 text-white
              px-2 py-1 rounded
              text-[10px] sm:text-xs font-semibold
            "
          >
            Hết hàng
          </span>
        )}

        {/* Favorite */}
        <button
          type="button"
          aria-label="Add to favorites"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          className="
            absolute top-2 right-2
            w-8 h-8 rounded-full
            bg-white/90 shadow-sm
            flex items-center justify-center
            text-gray-400 hover:text-red-500
            transition-colors
          "
        >
          <i className="far fa-heart text-sm" />
        </button>
      </Link>

      {/* Product Information */}
      <div
        className="
          flex flex-col flex-1
          min-w-0
          p-2.5 sm:p-3 lg:p-4
        "
      >
        {/* Product Name: cố định chiều cao */}
        <Link
          to={`/product-detail/${productId}`}
          className="block"
        >
          <h3
            className="
              h-10 sm:h-11 lg:h-12
              overflow-hidden
              line-clamp-2
              text-[12px] sm:text-sm lg:text-base
              font-semibold leading-5
              text-gray-800
              group-hover:text-orange-600
              transition-colors
            "
          >
            {title}
          </h3>
        </Link>

        {/* Price: dành không gian cố định */}
        <div
          className="
            flex flex-wrap items-start
            gap-x-2 gap-y-1
            min-h-[58px] sm:min-h-[64px]
            pt-2
          "
        >
          <span
            className="
              text-sm sm:text-base lg:text-xl
              font-bold text-orange-600
              whitespace-nowrap
            "
          >
            {formattedPrice(item.price)}
          </span>

          {discount > 0 && (
            <span
              className="
                text-[10px] sm:text-xs
                text-gray-400 line-through
                whitespace-nowrap
                pt-0.5
              "
            >
              {formattedPrice(originalPrice)}
            </span>
          )}
        </div>

        {/* Rating & Sold */}
        <div
          className="
            mt-auto
            min-h-[36px]
            flex items-center justify-between
            gap-1
            border-t border-gray-100
            py-2
          "
        >
          <div className="flex items-center gap-1 shrink-0">
            <i className="fas fa-star text-yellow-400 text-[10px] sm:text-xs" />

            <span className="text-[10px] sm:text-xs text-gray-600">
              {item.rating ? item.rating.toFixed(1) : "5.0"}
            </span>
          </div>

          <span
            className="
              text-[9px] sm:text-xs
              text-gray-400
              truncate text-right
            "
          >
            {item.sold !== undefined
              ? `Đã bán: ${item.sold}`
              : `Kho: ${item.stock ?? 0}`}
          </span>
        </div>

        {/* Add to Cart: luôn nằm dưới cùng */}
        <button
          type="button"
          disabled={isOutOfStock || isAddingToCart}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();

            if (!isOutOfStock && !isAddingToCart) {
              onAddToCart?.(item);
            }
          }}
          className={`
            w-full h-9 sm:h-10 lg:h-11
            mt-1 shrink-0
            flex items-center justify-center
            gap-1.5
            rounded-lg
            text-[10px] sm:text-xs lg:text-sm
            font-semibold
            transition-all duration-200
            ${
              isOutOfStock
                ? "bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed"
                : isAdded
                  ? "bg-emerald-500 text-white border border-emerald-500"
                  : isAddingToCart
                    ? "bg-orange-100 text-orange-600 border border-orange-200 cursor-wait"
                    : "bg-orange-50 text-orange-600 border border-orange-200 hover:bg-orange-500 hover:text-white hover:border-orange-500 active:scale-[0.98]"
            }
          `}
        >
          {isOutOfStock ? (
            <>
              <i className="fas fa-ban" />
              <span>Hết hàng</span>
            </>
          ) : isAdded ? (
            <>
              <i className="fas fa-check" />
              <span>Đã thêm!</span>
            </>
          ) : isAddingToCart ? (
            <>
              <i className="fas fa-circle-notch fa-spin" />
              <span>Đang thêm...</span>
            </>
          ) : (
            <>
              <i className="fas fa-cart-plus" />
              <span>Thêm vào giỏ</span>
            </>
          )}
        </button>
      </div>
    </article>
  );
}
