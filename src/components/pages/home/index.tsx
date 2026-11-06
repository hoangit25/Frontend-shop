import HeroBanner from "../../layouts/heroBan-default";
import Categories from "../../layouts/category-default";
import  ProductList from "../products/index"

export default function HomePage() {
  return (
    <>
      <HeroBanner />
      <Categories />
      <ProductList/>
    </>
  );
}