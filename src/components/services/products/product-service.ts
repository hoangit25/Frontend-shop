
import request from "../../utils/request";

import type {
  Product,
  CreateProduct,
  UpdateProduct,
} from "../../types/product.type";

export const productService = {
  // Lấy danh sách sản phẩm
  getProducts: () => {
    return request.get<Product[]>("/products");
  },

  // Lấy chi tiết sản phẩm
  getProductById: (id: string) => {
    return request.get<Product>(`/products/${id}`);
  },

//   // Tạo sản phẩm
//   createProduct: (data: CreateProduct) => {
//     return request.post<Product, CreateProduct>(
//       "/admin/products",
//       data
//     );
//   },

//   // Cập nhật sản phẩm
//   updateProduct: (id: string, data: UpdateProduct) => {
//     return request.patch<Product, UpdateProduct>(
//       `/admin/products/${id}`,
//       data
//     );
//   },

//   // Xóa sản phẩm
//   deleteProduct: (id: string) => {
//     return request.delete<null>(`/admin/products/${id}`);
//   },
};
