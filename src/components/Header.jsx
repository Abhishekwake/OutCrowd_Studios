export default function Hero() {
  return (
    <>
      {/* ================= HEADER ================= */}
      <header className="fixed inset-x-4 lg:inset-x-8 top-6 z-50">
        <div className="grid grid-cols-12 items-center gap-8 h-16 px-6">

          {/* Logo */}
          <div className="col-span-3 flex items-center">
            <img
              src="src/assets/OutCrowd.svg"
              alt="Outcrowd Studio"
              className="w-[115px] object-contain"
            />
          </div>

          {/* Navigation */}
         <nav className="col-span-6 flex justify-center">
  <ul className="flex gap-12 font-satoshi font-medium text-[16px] text-black">
    <li className="cursor-pointer hover:opacity-70 transition">Home</li>
    <li className="cursor-pointer hover:opacity-70 transition">Services</li>
    <li className="cursor-pointer hover:opacity-70 transition">Work</li>
    <li className="cursor-pointer hover:opacity-70 transition">About</li>
  </ul>
</nav>

          {/* CTA */}
          <div className="col-span-3 flex justify-end">
            <button className="h-12 px-8 rounded-full bg-black text-white text-sm font-medium">
              Start a Project
            </button>
          </div>

        </div>
      </header>

      {/* ================= HERO ================= */}
      <section className="relative min-h-screen overflow-hidden">

        {/* Background Image */}
       <div
  className="absolute inset-0 bg-cover"
  style={{
    backgroundImage: "url('/hero-bg.jpg')",
    backgroundPosition: "center 25%",
  }}
/>

        {/* Bottom vignette */}
        <div className="absolute bottom-0 left-0 right-0 h-[37%]
                bg-gradient-to-t from-black/75 via-black/39 to-transparent" />


        {/* Grid Container */}
        <div className="relative z-10 min-h-screen grid grid-cols-12 gap-8 px-8">

          {/* Center Floating Image (MOVED UP) */}
          <div className="col-span-12 lg:col-span-6 lg:col-start-4 flex items-start justify-center pt-32">
            <div className="w-[668px] h-[375px] overflow-hidden rounded-[8px] shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
              <img
                src="/hero-center.jpg"
                alt="Hero Visual"
                className="w-full h-full object-cover object-bottom"
              />
            </div>
          </div>
{/* Headline + Micro labels (GRID PERFECT) */}
<div className="absolute bottom-20 left-0 right-0 px-8">
  <div className="grid grid-cols-12 items-end">

    {/* Micro labels */}
    <span className="font-satoshi
        font-normal col-span-3 text-[20px] uppercase tracking-widest text-white/90 mb-6">
      A
    </span>

    <span
  className="
    col-span-6
    text-center
    font-satoshi
    font-normal
    text-[20px]
    uppercase
    tracking-widest
    text-white/90
    mb-6
  "
>
  Seriously
</span>

    <span className="font-satoshi
        font-normal col-span-3 text-right text-[20px] uppercase tracking-widest text-white/90 mb-6">
      Good
    </span>

   <h1
  className="
    col-span-12
    w-full
    font-satoshi
    font-black
    uppercase
   leading-[1]
   tracking-[-0.06em]
    text-[#F5A24A]
    text-[clamp(9rem,12.5vw,13rem)]
    text-center
    whitespace-nowrap
  "
>
  Visual Engineers
</h1>


  </div>
</div>


          {/* Scroll Indicator */}
          <div className="absolute bottom-8 left-8 text-sm text-white/70">
            Scroll down
          </div>

        </div>
      </section>
    </>
  );
}
