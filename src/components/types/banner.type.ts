export interface Banner {
  _id: string;
  id?: string | number;
  title: string;
  subtitle: string;
  image: string;
  alt: string;
  date: string;
  discount: string;
  voucher: string;
  link?: string;
  placement?: string;
  position?: number;
  isActive?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface BannerFilterParams {
  placement?: string;
  isActive?: boolean;
}
