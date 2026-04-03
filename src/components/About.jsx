import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

gsap.registerPlugin(ScrollTrigger);

export default function About() {
  const containerRef = useRef(null);
  const textRef = useRef(null);
  const imageRef = useRef(null);
  const wrapperRef = useRef(null);

  const paragraph = "Outcrowd Studio is a creative production and digital marketing studio built to turn ideas into powerful visual stories. We specialize in high-quality videography, cinematic video editing, and result-driven digital marketing that helps brands, businesses, and individuals stand out in a crowded digital world.";

  const words = paragraph.split(" ");

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Image scroll parallax & scale effect
      gsap.fromTo(
        imageRef.current,
        { scale: 1.25, filter: "brightness(0.6)" },
        {
          scale: 1,
          filter: "brightness(1)",
          ease: "power2.out",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 85%",
            end: "center center",
            scrub: 1,
          },
        }
      );

      // Premium word-by-word opacity reveal
      const wordElements = textRef.current.querySelectorAll(".word");
      gsap.fromTo(
        wordElements,
        { opacity: 0.15 },
        {
          opacity: 1,
          stagger: 0.2, // increased stagger for scrub spread
          ease: "none",
          scrollTrigger: {
            trigger: wrapperRef.current,
            start: "top 75%",
            end: "center 25%",
            scrub: true,
          },
        }
      );
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={containerRef} className="relative z-20 w-full min-h-screen bg-white text-black pt-0 pb-12 sm:pb-16 flex items-center overflow-hidden">
      <div ref={wrapperRef} className="grid grid-cols-12 gap-8 lg:gap-16 w-full mx-auto px-4 lg:px-8 items-center">

        <div className="col-span-12 lg:col-span-7 flex flex-col justify-center font-satoshi order-2 lg:order-1 pt-4 lg:pt-0">
          <h3 className="text-[clamp(1.2rem,1.5vw,1.5rem)] font-bold mb-8 uppercase tracking-[0.1em] text-neutral-400">
            We Are
          </h3>
          <p
            ref={textRef}
            className="text-[clamp(2rem,3.5vw,5rem)] leading-[0.95] tracking-[-0.03em] font-satoshi font-medium text-black text-justify w-full"
            style={{ textAlignLast: "left" }}
          >
            {words.map((word, i) => (
              <React.Fragment key={i}>
                <span className="word inline opacity-20 will-change-[opacity]">
                  {word}
                </span>
                {" "}
              </React.Fragment>
            ))}
          </p>
        </div>

        <div className="col-span-12 lg:col-span-5 relative order-1 lg:order-2 h-[50vh] sm:h-[60vh] lg:h-[70vh] w-full rounded-[24px] overflow-hidden shadow-[0_10px_60px_-15px_rgba(0,0,0,0.1)]">
          <div className="absolute inset-0 z-10 10 bg-gradient-to-t from-black/20 to-transparent pointer-events-none" />
          <img
            ref={imageRef}
            src="/hero-center.jpg"
            alt="Outcrowd Video Placeholder"
            className="absolute inset-0 w-full h-full object-cover will-change-transform transform-gpu"
          />
          <div className="absolute top-6 right-6 z-20 bg-white/10 backdrop-blur-md border border-white/20 text-white text-xs font-semibold uppercase tracking-wider px-4 py-2 rounded-full">
            Video Placeholder
          </div>
        </div>

      </div>
    </section>
  );
}
