
import "../../App.css";
import Navbar from './navbar-default'
import { Outlet } from "react-router-dom";

function LayoutDefault() {
  return (
    <div className="min-h-screen pb-20">
      <Navbar />
      <main>
        <Outlet/>
      </main>
      
    </div>
  );
}

export default LayoutDefault;
