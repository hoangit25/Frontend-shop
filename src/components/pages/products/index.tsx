export default function ProductPage(){

    
     return <main className="min-h-screen bg-[#f5f5f5] text-[#222]">
    <header className="bg-gradient-to-b from-[#f53d2d] to-[#ff6533] text-white">
      <div className="mx-auto max-w-[1200px] px-4">
        <div className="flex h-9 items-center justify-between text-[13px]">
          <nav className="flex items-center gap-3"><span>Seller Centre</span><i/> <span>Start Selling</span><i/> <span>Download</span><i/> <span>Follow us on</span><span className="flex gap-2"><span className="social">f</span><span className="social">◎</span></span></nav>
          <nav className="hidden items-center gap-4 md:flex"><span className="flex items-center gap-1"><Bell size={16}/> Notifications</span><span className="flex items-center gap-1"><HelpCircle size={17}/> Help</span><span className="flex items-center gap-1"><Globe2 size={16}/> English <ChevronDown size={14}/></span><span>Sign Up</span><i/><span>Login</span></nav>
        </div>
        <div className="flex h-[88px] items-center gap-8">
          <div className="flex min-w-[210px] items-center gap-2"><div className="bag">S</div><span className="text-[31px] tracking-[-1px]">Shopee</span></div>
          <div className="flex flex-1 items-center gap-3">
            <div className="relative flex-1"><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Shopee bao ship 0Đ - Đăng ký ngay!" className="h-[42px] w-full rounded-sm bg-white px-4 text-[16px] text-gray-700 outline-none"/><button aria-label="Search" className="absolute right-1 top-1 flex h-10 w-[86px] items-center justify-center rounded-sm bg-[#fb5534] text-white"><Search size={23}/></button></div>
            <button aria-label="Cart" className="px-3"><ShoppingCart size={31}/></button>
          </div>
        </div>
        <div className="hidden h-9 items-start justify-center gap-5 text-[14px] lg:flex"><span>Áo Kiểu Nữ</span><span>Quần Bò Suông Ống Rộng Nữ</span><span>Ốp Lưng iPhone Duo</span><span>Đồ Ngủ Ở Nhà Cute</span><span>Áo Khoác Hoodie Zip Dày Dặn</span><span>Hàng Chính Hãng</span></div>
      </div>
    </header>

    <section className="mx-auto max-w-[1200px] px-4 pt-5">
      <div className="grid h-[338px] grid-cols-12 gap-1 overflow-hidden rounded-sm">
        <div className="relative col-span-8 overflow-hidden bg-[#ffb719] p-8 text-white"><div className="absolute inset-0 bg-[radial-gradient(circle_at_73%_40%,#e52e19_0_11%,transparent_12%),radial-gradient(circle_at_60%_83%,#fff_0_3%,transparent_3%),linear-gradient(100deg,transparent 50%,#ffce30 50%)] opacity-90"/><div className="relative z-10 mt-3 max-w-[430px]"><div className="text-2xl font-black">11.11</div><p className="mt-10 text-xl font-bold">ADIDAS MUA SẮM<br/>MÙA LỄ HỘI</p><p className="mt-3 text-4xl font-black">30% <span className="text-2xl">+</span> 20%</p><div className="mt-11 flex gap-2 pl-48"><b className="dot bg-[#ee4134]"/><b className="dot bg-white"/><b className="dot bg-white/70"/><b className="dot bg-white/50"/></div></div><div className="absolute right-8 top-16 text-right"><div className="text-7xl font-black text-[#c61622]">0Đ</div><div className="text-xl font-bold">FREESHIP</div></div></div>
        <div className="col-span-4 grid gap-1"><div className="relative overflow-hidden bg-[#ef4934] p-5 text-white"><p className="text-3xl font-black">MUA HÀNG TO<br/><span className="text-white">CÓ SHOPEE LO</span></p><p className="mt-3 text-lg font-semibold">MIỄN PHÍ LẮP ĐẶT · GIẢM 50%</p><div className="absolute bottom-3 right-5 text-6xl font-black text-[#ffda29]">0Đ</div></div><div className="relative overflow-hidden bg-[#f5ce52] p-5"><p className="text-xl font-black text-[#df3827]">ĐỦ NHU CẦU<br/>HỎI MỌI DEAL</p><p className="mt-4 text-sm font-bold text-[#208d7a]">FREESHIP · GIẢM 50%</p><div className="absolute bottom-2 right-4 text-5xl">🛒</div></div></div>
      </div>
      <div className="grid grid-cols-5 py-5">{services.map(([name,label,color])=><button key={name} className="group flex flex-col items-center gap-2 text-center text-[16px] hover:text-[#ee4d2d]"><span className="service-icon" style={{color}}>{label}</span><span>{name}</span></button>)}</div>
    </section>

    <section className="border-y border-[#e5e5e5] bg-[#f5f5f5] py-7"><div className="mx-auto max-w-[1200px] px-4"><div className="bg-white"><div className="flex items-center justify-between border-b px-7 py-5"><h2 className="text-[21px] font-normal uppercase text-[#777]">Categories</h2><button onClick={()=>setMenuOpen(!menuOpen)} className="flex items-center gap-1 text-sm text-[#ee4d2d] md:hidden"><Menu size={18}/> Menu</button></div><div className={`grid grid-cols-2 sm:grid-cols-5 md:grid-cols-10 ${menuOpen ? "" : "max-h-[250px]"} overflow-hidden`}>{categories.map(([name,icon])=><button key={name} className="flex min-h-[170px] flex-col items-center justify-center gap-4 border-b border-r border-[#eee] px-2 text-center text-[16px] transition hover:shadow-[0_0_8px_#ddd]"><span className="category-icon">{icon}</span><span>{name}</span></button>)}</div></div></div></section>
    <button onClick={()=>setLiked(!liked)} aria-label="Favorite" className={`fixed bottom-5 right-5 flex h-11 w-11 items-center justify-center rounded-full bg-white shadow-lg ${liked ? "text-[#ee4d2d]" : "text-gray-400"}`}><Heart size={21} fill={liked ? "currentColor" : "none"}/></button>
  </main>
}