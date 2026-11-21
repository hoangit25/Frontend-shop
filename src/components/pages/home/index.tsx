import HeroBanner from "../../layouts/heroBaner/heroBan-default";
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