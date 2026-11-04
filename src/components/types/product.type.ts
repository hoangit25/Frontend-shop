export interface Product {
  _id: string;
  name: string;
  image: string;
  price: number;
  discount?: number;
  sold: number;
  location?: string;
}

export interface CreateProduct {
  name: string;
  image: string;
  price: number;
  discount?: number;
  description: string;
  categoryId: string;
  stock: number;
}

// Interface cập nhật sản phẩm
export interface UpdateProduct {
  name?: string;
  image?: string;
  price?: number;
  discount?: number;
  description?: string;
  categoryId?: string;
  stock?: number;
}

// Interface xóa sản phẩm
export interface DeleteProduct {
  id: string;
}