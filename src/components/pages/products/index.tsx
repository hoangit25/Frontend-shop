import { useEffect, useState } from "react";
import ProductItem from "./item";
import { }
export default function ProductPage() {

  return (
    <div className="mx-auto w-full max-w-7xl px-4 py-6">
      <h2 className="mb-5 text-2xl font-bold text-gray-800">
        Product List
      </h2>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {products.map((product) => (
          <ProductItem item={product} key={product.id} />
        ))}
      </div>
    </div>
  );
}