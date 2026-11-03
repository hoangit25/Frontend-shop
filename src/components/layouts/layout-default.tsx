
import "../../App.css";
import Navbar from './navbar-default'
import HeroBanner from './heroBan-default'
import Categories from './category-default'

function LayoutDefault() {
  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      <HeroBanner />
      <Categories />
    </div>
  );
}

export default LayoutDefault;
