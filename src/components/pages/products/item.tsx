import { useState, useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import { useProductDetail } from "../../hooks/products";
import type { ProductOptionValue, ProductVariant, ProductOption } from "../../api/products/product-service";

const ProductDetail = () => {
  const { id } = useParams<{ id: string }>();

  // 1. Quản lý query Product Detail bằng TanStack Query hook
  const {
    data: response,
    isLoading,
    isError,
    error,
    refetch,
  } = useProductDetail(id || "");

  const product = response?.data;

  // 2. States tương tác UI
  const [userSelectedImageIndex, setUserSelectedImageIndex] = useState<number | null>(null);
  const [userSelectedOptions, setUserSelectedOptions] = useState<Record<string, string>>({});
  const [quantity, setQuantity] = useState<number>(1);
  const [addedToast, setAddedToast] = useState<boolean>(false);

  // Danh sách hình ảnh sản phẩm
  const galleryImages = useMemo(() => {
    if (!product) return [];
    const list: string[] = [];
    if (product.image) list.push(product.image);
    if (Array.isArray(product.images)) {
      product.images.forEach((img) => {
        if (img && !list.includes(img)) list.push(img);
      });
    }
    return list.length > 0 ? list : ["/placeholder.png"];
  }, [product]);

  // 3. Tổng hợp danh sách Options hiển thị (Đảm bảo có cả Màu sắc và Kích cỡ/Dung lượng nếu có trong data hoặc variants)
  const displayOptions = useMemo<ProductOption[]>(() => {
    const list: ProductOption[] = product?.options ? [...product.options] : [];
    const existingNames = new Set(list.map((o) => o.name.toLowerCase()));

    // Nếu các biến thể có Màu sắc nhưng options chưa khai báo
    if (product?.variants && !existingNames.has("màu sắc")) {
      const distinctColors = Array.from(
        new Set(product.variants.map((v) => v.color?.trim()).filter((c): c is string => Boolean(c)))
      );
      if (distinctColors.length > 0) {
        list.unshift({
          _id: "auto-color",
          productId: product._id,
          name: "Màu sắc",
          type: "COLOR",
          isRequired: true,
          position: 0,
          values: distinctColors.map((c, i) => {
            const matchedVar = product.variants.find((v) => v.color === c);
            return {
              name: c,
              code: matchedVar?.colorCode || (c.toLowerCase().includes("trắng") ? "#FFFFFF" : c.toLowerCase().includes("đen") ? "#171717" : "#888888"),
              isDefault: i === 0,
              priceAdjustment: 0,
            };
          }),
        });
      }
    }

    // Nếu các biến thể có Kích cỡ / Size nhưng options chưa khai báo
    const hasAnySizeOption =
      existingNames.has("kích cỡ") ||
      existingNames.has("size") ||
      existingNames.has("kích cỡ giày") ||
      existingNames.has("kích thước") ||
      existingNames.has("dung lượng");

    if (product?.variants && !hasAnySizeOption) {
      const distinctSizes = Array.from(
        new Set(product.variants.map((v) => v.size?.trim()).filter((s): s is string => Boolean(s)))
      );
      if (distinctSizes.length > 0) {
        list.push({
          _id: "auto-size",
          productId: product._id,
          name: "Kích cỡ",
          type: "DROPDOWN",
          isRequired: true,
          position: 1,
          values: distinctSizes.map((s, i) => ({
            name: s,
            code: s,
            isDefault: i === 0,
            priceAdjustment: 0,
          })),
        });
      }
    }

    return list;
  }, [product]);

  // Tùy chọn được chọn (kết hợp mặc định từ displayOptions và lựa chọn của người dùng)
  const selectedOptions = useMemo(() => {
    const defaultOptions: Record<string, string> = {};
    if (displayOptions && displayOptions.length > 0) {
      displayOptions.forEach((opt) => {
        const defaultVal =
          opt.values.find((v) => v.isDefault)?.name ||
          (opt.values.length > 0 ? opt.values[0].name : "");
        if (defaultVal) {
          defaultOptions[opt.name] = defaultVal;
        }
      });
    }
    return { ...defaultOptions, ...userSelectedOptions };
  }, [displayOptions, userSelectedOptions]);

  // 4. Tìm biến thể Variant khớp với các tùy chọn đã chọn (khớp cả màu và kích cỡ)
  const currentVariant = useMemo<ProductVariant | undefined>(() => {
    if (!product?.variants || product.variants.length === 0) return undefined;

    return product.variants.find((v) => {
      let match = true;

      // 1. Kiểm tra optionValues nếu variant lưu dạng Record
      if (v.optionValues && typeof v.optionValues === "object") {
        for (const [optName, selectedVal] of Object.entries(selectedOptions)) {
          const valInVariant = (v.optionValues as Record<string, string>)[optName];
          if (valInVariant && valInVariant.toLowerCase() !== selectedVal.toLowerCase()) {
            match = false;
            break;
          }
        }
      }

      // 2. Khớp Màu sắc (color)
      if (match && selectedOptions["Màu sắc"] && v.color) {
        match = match && v.color.toLowerCase() === selectedOptions["Màu sắc"].toLowerCase();
      }

      // 3. Khớp Kích cỡ / Size / Dung lượng
      if (match) {
        const sizeOptionName = Object.keys(selectedOptions).find((k) =>
          ["kích cỡ", "size", "kích cỡ giày", "kích thước", "dung lượng"].includes(k.toLowerCase())
        );
        if (sizeOptionName && v.size) {
          const selectedVal = selectedOptions[sizeOptionName];
          match = match && v.size.toLowerCase() === selectedVal.toLowerCase();
        }
      }

      return match;
    });
  }, [product, selectedOptions]);

  // Xác định vị trí ảnh đang hiển thị
  const activeImageIndex = useMemo(() => {
    if (userSelectedImageIndex !== null) return userSelectedImageIndex;
    if (currentVariant?.image) {
      const idx = galleryImages.indexOf(currentVariant.image);
      if (idx !== -1) return idx;
    }
    return 0;
  }, [userSelectedImageIndex, currentVariant, galleryImages]);

  // Tính giá & tồn kho hiện tại theo variant hoặc tùy chọn
  const priceAdjustmentTotal = useMemo(() => {
    let extra = 0;
    displayOptions.forEach((opt) => {
      const selectedValName = selectedOptions[opt.name];
      const foundVal = opt.values.find((v) => v.name === selectedValName);
      if (foundVal?.priceAdjustment) {
        extra += foundVal.priceAdjustment;
      }
    });
    return extra;
  }, [displayOptions, selectedOptions]);

  const price = (currentVariant?.price ?? product?.price ?? 0) + (currentVariant ? 0 : priceAdjustmentTotal);
  const originalPrice = currentVariant?.originalPrice ?? product?.originalPrice ?? 0;
  const discount = product?.discount ?? 0;
  const stock = currentVariant?.stock ?? product?.stock ?? 0;
  const isAvailable = stock > 0;

  // Format tiền tệ VND
  const formatPrice = (val: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(val);
  };

  const handleOptionSelect = (optionName: string, value: ProductOptionValue) => {
    setUserSelectedImageIndex(null); // Reset ảnh chọn tay để ưu tiên ảnh theo variant nếu có
    setUserSelectedOptions((prev) => ({
      ...prev,
      [optionName]: value.name,
    }));
  };

  const handleAddToCart = () => {
    if (!isAvailable) return;
    console.log("Add to cart:", {
      productId: product?._id,
      productName: product?.name,
      variant: currentVariant,
      selectedOptions,
      quantity,
      price,
    });
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 2500);
  };

  // ── SKELETON LOADING ──
  if (isLoading) {
    return (
      <div className="w-full min-h-screen bg-white">
        <div className="mx-auto w-full max-w-[1440px] flex flex-col lg:flex-row animate-pulse">
          <div className="w-full lg:w-1/2 bg-[#f8f8f8] p-10 min-h-[480px] flex flex-col items-center justify-center">
            <div className="w-72 sm:w-96 h-72 sm:h-96 bg-gray-200 rounded-2xl" />
          </div>
          <div className="w-full lg:w-1/2 p-8 sm:p-12 space-y-5">
            <div className="h-4 bg-gray-200 rounded w-28" />
            <div className="h-10 bg-gray-200 rounded w-3/4" />
            <div className="h-8 bg-gray-200 rounded w-1/3" />
            <div className="h-20 bg-gray-200 rounded w-full" />
            <div className="h-12 bg-gray-200 rounded w-1/2" />
          </div>
        </div>
      </div>
    );
  }

  // ── ERROR STATE ──
  if (isError || !product) {
    return (
      <div className="w-full min-h-[500px] flex flex-col items-center justify-center p-6 text-center">
        <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center text-red-500 text-2xl mb-4">
          <i className="fas fa-exclamation-circle" />
        </div>
        <h2 className="text-xl font-bold text-gray-800 mb-2">Không tìm thấy sản phẩm</h2>
        <p className="text-sm text-gray-500 max-w-md mb-6">
          {error instanceof Error ? error.message : "Sản phẩm không tồn tại hoặc đã bị xóa."}
        </p>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => refetch()}
            className="px-5 py-2.5 rounded-lg bg-orange-500 text-white text-sm font-medium hover:bg-orange-600 transition-colors"
          >
            Thử lại
          </button>
          <Link
            to="/products"
            className="px-5 py-2.5 rounded-lg border border-gray-200 text-gray-700 text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            Về danh sách sản phẩm
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white">
      {/* Toast thông báo thêm giỏ hàng thành công */}
      {addedToast && (
        <div className="fixed top-6 right-6 z-50 bg-green-600 text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 animate-bounce">
          <i className="fas fa-check-circle text-lg" />
          <div>
            <p className="text-sm font-semibold">Đã thêm vào giỏ hàng!</p>
            <p className="text-xs text-green-100">{quantity}x {product.name}</p>
          </div>
        </div>
      )}

      {/* Breadcrumb */}
      <div className="mx-auto w-full max-w-[1440px] px-4 sm:px-8 pt-4 pb-2">
        <nav className="flex items-center gap-2 text-xs text-gray-500">
          <Link to="/" className="hover:text-[#F15A24] transition-colors">
            Trang chủ
          </Link>
          <i className="fas fa-chevron-right text-[9px] text-gray-400" />
          <Link to="/products" className="hover:text-[#F15A24] transition-colors">
            Sản phẩm
          </Link>
          <i className="fas fa-chevron-right text-[9px] text-gray-400" />
          <span className="text-gray-800 font-medium truncate max-w-[200px] sm:max-w-md">
            {product.name}
          </span>
        </nav>
      </div>

      <div className="mx-auto w-full max-w-[1440px] flex flex-col lg:flex-row">
        {/* Left Section: Image Gallery */}
        <div className="
          w-full lg:w-1/2
          bg-[#f8f8f8]
          flex flex-col items-center justify-center
          relative
          px-4 py-8
          sm:px-8 sm:py-12
          lg:px-8 lg:py-16
          xl:px-16 xl:py-20
        ">
          {/* Sale Badge */}
          {discount > 0 && (
            <div className="
              absolute top-4 right-4
              sm:top-6 sm:right-6
              lg:top-8 lg:right-8
              w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16
              rounded-full bg-[#f0f48b]
              flex flex-col items-center justify-center
              text-[10px] sm:text-xs font-bold tracking-wider text-gray-900 shadow-sm
            ">
              <span>SALE</span>
              <span>-{Math.round(discount)}%</span>
            </div>
          )}

          {/* Product Image Display */}
          <div className="
            w-full max-w-[560px]
            flex items-center justify-center
            min-h-[280px]
            sm:min-h-[380px]
            lg:min-h-[480px]
            xl:min-h-[560px]
          ">
            <img
              src={galleryImages[activeImageIndex] || "/placeholder.png"}
              alt={product.name}
              className="
                w-full h-full max-h-[560px]
                object-contain transition-all duration-300
              "
            />
          </div>

          {/* Image Thumbnails & Pagination */}
          {galleryImages.length > 1 && (
            <div className="flex flex-col items-center gap-3 mt-6 lg:mt-8">
              {/* Thumbnail strip */}
              <div className="flex items-center gap-2 overflow-x-auto max-w-full pb-2">
                {galleryImages.map((img, index) => (
                  <button
                    key={index}
                    type="button"
                    onClick={() => setUserSelectedImageIndex(index)}
                    aria-label={`Xem ảnh ${index + 1}`}
                    className={`
                      w-12 h-12 sm:w-14 sm:h-14 rounded-lg overflow-hidden border-2 transition-all
                      ${
                        activeImageIndex === index
                          ? "border-[#F15A24] shadow-sm scale-105"
                          : "border-transparent opacity-60 hover:opacity-100"
                      }
                    `}
                  >
                    <img
                      src={img}
                      alt=""
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>

              {/* Dots indicator */}
              <div className="flex items-center justify-center gap-2">
                {galleryImages.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    aria-label={`View image ${index + 1}`}
                    onClick={() => setUserSelectedImageIndex(index)}
                    className={`
                      w-2 h-2 rounded-full transition-colors
                      ${
                        index === activeImageIndex
                          ? "bg-[#F15A24]"
                          : "border border-[#F15A24]"
                      }
                    `}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Section: Product Details */}
        <div className="
          w-full lg:w-1/2
          flex flex-col justify-center
          px-4 py-8
          sm:px-8 sm:py-10
          lg:px-8 lg:py-12
          xl:px-16 xl:py-16
          2xl:px-20
        ">
          <div className="w-full max-w-[560px] mx-auto">
            {/* Product Title */}
            <h1 className="
              text-2xl
              sm:text-3xl
              lg:text-4xl
              xl:text-5xl
              font-bold text-[#F15A24]
              mb-2 leading-tight
            ">
              {product.name}
            </h1>

            {/* Brand & Rating */}
            <div className="flex flex-wrap items-center gap-4 mb-4 sm:mb-6 text-xs sm:text-sm text-gray-700">
              <p className="flex items-center">
                Thương hiệu:
                <span className="mx-1 font-semibold text-gray-900">
                  {product.brand || "Chính hãng"}
                </span>
                <span className="mx-1 text-[#F15A24]">♡</span>
              </p>

              {product.rating !== undefined && product.rating > 0 && (
                <div className="flex items-center gap-1 text-amber-500">
                  <i className="fas fa-star text-xs" />
                  <span className="font-semibold text-gray-800">{product.rating}</span>
                  {product.ratingCount ? (
                    <span className="text-gray-400">({product.ratingCount} đánh giá)</span>
                  ) : null}
                </div>
              )}

              {product.sold !== undefined && product.sold > 0 && (
                <span className="text-gray-500">
                  Đã bán: <strong className="text-gray-800">{product.sold}</strong>
                </span>
              )}
            </div>

            {/* Price */}
            <div className="
              flex flex-wrap items-baseline
              gap-x-3 gap-y-1
              mb-6 sm:mb-8
            ">
              <span className="
                text-2xl sm:text-3xl
                font-bold text-[#F15A24]
              ">
                {formatPrice(price)}
              </span>

              {originalPrice > price && (
                <span className="
                  text-base sm:text-lg
                  text-gray-400 line-through
                ">
                  {formatPrice(originalPrice)}
                </span>
              )}

              {discount > 0 && (
                <span className="px-2 py-0.5 rounded-sm bg-orange-100 text-orange-600 text-xs font-semibold">
                  Giảm {Math.round(discount)}%
                </span>
              )}
            </div>

            {/* Product Options (Hiển thị tất cả: Cả Màu sắc VÀ Kích cỡ/Dung lượng) */}
            {displayOptions && displayOptions.length > 0 && (
              <div className="space-y-5 mb-6">
                {displayOptions.map((opt) => {
                  const isColorType = opt.type === "COLOR" || opt.name.toLowerCase().includes("màu");

                  return (
                    <div key={opt._id} className="space-y-2">
                      <div className="flex items-center justify-between text-xs sm:text-sm">
                        <span className="font-medium text-gray-800">
                          {opt.name}:
                        </span>
                        <span className="text-gray-600 font-semibold">
                          {selectedOptions[opt.name] || "Chưa chọn"}
                        </span>
                      </div>

                      {/* Tùy chọn kiểu Màu sắc (COLOR) */}
                      {isColorType ? (
                        <div className="flex flex-wrap items-center gap-3">
                          {opt.values.map((val) => {
                            const isSelected = selectedOptions[opt.name] === val.name;
                            const colorHex = val.code || "#cccccc";

                            return (
                              <button
                                key={val.name}
                                type="button"
                                title={val.name}
                                aria-label={val.name}
                                onClick={() => handleOptionSelect(opt.name, val)}
                                className={`
                                  relative w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 transition-all flex items-center justify-center
                                  ${
                                    isSelected
                                      ? "ring-2 ring-offset-2 ring-[#F15A24] border-white scale-110 shadow-md"
                                      : "border-gray-200 hover:scale-105"
                                  }
                                `}
                                style={{ backgroundColor: colorHex }}
                              >
                                {isSelected && (
                                  <i className={`fas fa-check text-xs drop-shadow-md ${colorHex.toLowerCase() === "#ffffff" ? "text-gray-800" : "text-white"}`} />
                                )}
                              </button>
                            );
                          })}
                        </div>
                      ) : (
                        /* Tùy chọn kiểu Nút chọn (Kích cỡ, Size, Dung lượng, ...) */
                        <div className="flex flex-wrap items-center gap-2">
                          {opt.values.map((val) => {
                            const isSelected = selectedOptions[opt.name] === val.name;
                            return (
                              <button
                                key={val.name}
                                type="button"
                                onClick={() => handleOptionSelect(opt.name, val)}
                                className={`
                                  px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium border transition-all
                                  ${
                                    isSelected
                                      ? "border-[#F15A24] bg-orange-50 text-[#F15A24] font-semibold shadow-xs"
                                      : "border-gray-200 bg-white text-gray-700 hover:border-orange-300 hover:bg-gray-50"
                                  }
                                `}
                              >
                                {val.name}
                                {val.priceAdjustment ? (
                                  <span className="ml-1 text-[11px] text-gray-500">
                                    (+{formatPrice(val.priceAdjustment)})
                                  </span>
                                ) : null}
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {/* Availability */}
            <div className="mb-6 sm:mb-8">
              {isAvailable ? (
                <span className="
                  inline-flex items-center
                  px-3 py-1.5
                  rounded-md text-xs font-medium
                  bg-[#dbf9e2] text-[#22c55e]
                ">
                  <span className="
                    w-1.5 h-1.5 rounded-full
                    bg-[#22c55e] mr-2
                  " />
                  Còn hàng ({stock} sản phẩm)
                </span>
              ) : (
                <span className="
                  inline-flex items-center
                  px-3 py-1.5
                  rounded-md text-xs font-medium
                  bg-red-50 text-red-600
                ">
                  <span className="
                    w-1.5 h-1.5 rounded-full
                    bg-red-500 mr-2
                  " />
                  Tạm hết hàng
                </span>
              )}
            </div>

            {/* Description */}
            <div className="mb-6">
              <h2 className="text-sm font-bold text-gray-800 uppercase tracking-wider mb-2">
                Mô tả sản phẩm
              </h2>
              <p className="
                text-gray-700
                text-sm sm:text-base
                leading-relaxed whitespace-pre-line
              ">
                {product.description || "Chưa có mô tả chi tiết cho sản phẩm này."}
              </p>
            </div>

            {/* Features & Tags */}
            {product.tags && product.tags.length > 0 && (
              <div className="
                border-t border-gray-200
                pt-6
                mb-6 sm:mb-8
              ">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="text-xs sm:text-sm font-medium text-[#F15A24] mr-1">
                    Tags:
                  </span>
                  {product.tags.map((tag, idx) => (
                    <span
                      key={idx}
                      className="
                        px-3 py-1
                        bg-gray-100 rounded-full
                        text-xs font-medium text-gray-600
                      "
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity & Add to Cart */}
            <div className="
              border-t border-gray-200
              pt-6 sm:pt-8
              flex flex-col
              min-[380px]:flex-row
              items-stretch min-[380px]:items-center
              gap-4 sm:gap-6
            ">
              {/* Quantity Counter */}
              <div className="
                flex items-center justify-center
                gap-5
                text-lg
                border border-gray-200
                rounded-full
                px-5 py-2
                w-fit
              ">
                <button
                  type="button"
                  aria-label="Giảm số lượng"
                  disabled={quantity <= 1 || !isAvailable}
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                  className="
                    text-gray-500
                    hover:text-[#F15A24]
                    disabled:opacity-40 disabled:cursor-not-allowed
                    transition-colors
                  "
                >
                  –
                </button>

                <span className="w-6 text-center text-sm font-semibold select-none">
                  {quantity}
                </span>

                <button
                  type="button"
                  aria-label="Tăng số lượng"
                  disabled={quantity >= stock || !isAvailable}
                  onClick={() => setQuantity((prev) => prev + 1)}
                  className="
                    text-gray-500
                    hover:text-[#F15A24]
                    disabled:opacity-40 disabled:cursor-not-allowed
                    transition-colors
                  "
                >
                  +
                </button>
              </div>

              {/* Add to Cart Button */}
              <button
                type="button"
                disabled={!isAvailable}
                onClick={handleAddToCart}
                className="
                  flex-1 min-w-0
                  bg-[#F15A24] text-white
                  py-3.5 sm:py-4
                  px-5 sm:px-8
                  rounded-full
                  font-medium
                  text-sm sm:text-base lg:text-lg
                  hover:bg-[#d94a18]
                  disabled:opacity-50 disabled:cursor-not-allowed
                  active:scale-[0.98]
                  transition-all duration-200
                  flex items-center justify-center gap-2
                  shadow-lg shadow-orange-500/20
                "
              >
                <i className="fas fa-cart-plus" />
                {isAvailable ? "Thêm vào giỏ hàng" : "Hết hàng"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
