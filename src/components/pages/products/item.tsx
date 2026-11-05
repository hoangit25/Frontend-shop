export default function ProductItem({ item }) {
  const newPrice = (
    item.price * (100 - item.discountPercentage) / 100
  ).toFixed(0);

  return (
    <div className="flex flex-col overflow-hidden border border-gray-200 bg-white transition-shadow duration-200 hover:shadow-lg">

      {/* Product Image */}
      <div className="aspect-[4/3] w-full overflow-hidden">
        <img
          className="h-full w-full object-cover"
          src={item.thumbnail}
          alt={item.title}
        />
      </div>

      {/* Product Information */}
      <div className="flex flex-1 flex-col p-3">
        <h3 className="mb-3 line-clamp-2 min-h-10 text-sm font-medium text-gray-800">
          {item.title}
        </h3>

        {/* Price */}
        <div className="mt-auto">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-lg font-extrabold text-red-500">
              {newPrice}$
            </span>

            <span className="text-sm font-medium text-gray-400 line-through">
              {item.price}$
            </span>
          </div>

          <div className="mt-1 text-sm font-semibold text-red-500">
            -{item.discountPercentage}%
          </div>

          {/* Add to Cart */}
          <button
            className="mt-3 w-full rounded bg-orange-500 px-3 py-2 text-sm font-semibold text-white transition-colors hover:bg-orange-600 active:scale-[0.98]"
          >
            Add to cart
          </button>
        </div>
      </div>
    </div>
  );
}