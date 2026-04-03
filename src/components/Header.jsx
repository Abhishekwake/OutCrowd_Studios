import { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Lenis from "@studio-freight/lenis";
import outcrowdLogo from "../assets/OutCrowd.svg";

gsap.registerPlugin(ScrollTrigger);

/** Magnetic only in the early part of scroll before expand dominates */
const MAGNETIC_OFF_SCROLL_PROGRESS = 0.12;
/** Lifts the card stack from viewport-center up to match pre–fullscreen hero layout (pt-28-ish) */
const INITIAL_CARD_FOLLOW_Y = -104;
/** Fullscreen end: soft corners (aligned with premium UI / CTA feel, not sharp 0) */
const FULLSCREEN_RADIUS = 24;
const MAGNETIC_QUICK = {
  duration: 0.28,
  ease: "power3.out",
  overwrite: "auto",
};

function useMagneticCardX({
  cardListenerRef,
  cardFollowRef,
  floatingRef,
  scrollProgressRef,
}) {
  const xToRef = useRef(null);

  useEffect(() => {
    const listener = cardListenerRef.current;
    const follow = cardFollowRef.current;
    const cardEl = floatingRef.current;
    if (!listener || !follow || !cardEl) return;

    gsap.set(follow, { x: 0, force3D: true });

    xToRef.current = gsap.quickTo(follow, "x", {
      ...MAGNETIC_QUICK,
      force3D: true,
    });
    const xTo = xToRef.current;

    let rafId = null;
    let latestClientX = 0;

    const applyMagnetic = () => {
      if (scrollProgressRef.current > MAGNETIC_OFF_SCROLL_PROGRESS) return;

      const cw = cardEl.offsetWidth;
      const winWidth = window.innerWidth;

      // How far the card's center can travel to touch the screen edges
      const travel = (winWidth - cw) / 2;

      if (travel <= 0) {
        xTo(0);
        return;
      }

      // Cursor offset globally clamped to screen width
      const clampedX = gsap.utils.clamp(0, winWidth, latestClientX);

      // Map global [0 → winWidth] to [-travel → +travel]
      const x = (clampedX / winWidth) * (travel * 2) - travel;
      xTo(Math.round(x * 100) / 100);
    };

    const onMove = (e) => {
      // Ignore if scrolling down far enough
      if (scrollProgressRef.current > MAGNETIC_OFF_SCROLL_PROGRESS) return;
      latestClientX = e.clientX;
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        applyMagnetic();
      });
    };

    const onLeave = () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
        rafId = null;
      }
      xTo(0);
    };

    window.addEventListener("pointermove", onMove, { passive: true });
    // Keep a transparent listener over the area to handle pointerleave just in case the mouse leaves the document
    document.addEventListener("pointerleave", onLeave);

    const onResize = () => {
      if (scrollProgressRef.current <= MAGNETIC_OFF_SCROLL_PROGRESS) {
        xTo(0);
      }
    };
    window.addEventListener("resize", onResize);

    return () => {
      if (rafId !== null) cancelAnimationFrame(rafId);
      window.removeEventListener("pointermove", onMove);
      document.removeEventListener("pointerleave", onLeave);
      window.removeEventListener("resize", onResize);
      xToRef.current = null;
    };
  }, [cardFollowRef, floatingRef, scrollProgressRef]);

  return xToRef;
}

export default function Hero() {
  /** Single hero shell: trigger + pin target (avoids nested 100vh = blank band) */
  const sectionRef = useRef(null);
  const cardTrackRef = useRef(null);
  const cardListenerRef = useRef(null);
  const cardFollowRef = useRef(null);
  const floatingRef = useRef(null);
  const imgRef = useRef(null);
  const headlineRef = useRef(null);
  const scrollProgressRef = useRef(0);

  const xToRef = useMagneticCardX({
    cardListenerRef,
    cardFollowRef,
    floatingRef,
    scrollProgressRef,
  });

  /* ---------- Lenis + GSAP ticker ---------- */
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.45,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      lerp: 0.075,
      smoothWheel: true,
      wheelMultiplier: 0.85,
    });

    lenis.on("scroll", ScrollTrigger.update);

    ScrollTrigger.scrollerProxy(document.documentElement, {
      scrollTop(value) {
        if (arguments.length) {
          lenis.scrollTo(value, { immediate: true });
        }
        return lenis.scroll;
      },
      getBoundingClientRect() {
        return {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
      },
    });

    const onResize = () => {
      lenis.resize();
      ScrollTrigger.refresh();
    };
    window.addEventListener("resize", onResize);

    const ticker = (time) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);

    return () => {
      window.removeEventListener("resize", onResize);
      gsap.ticker.remove(ticker);
      lenis.destroy();
      ScrollTrigger.scrollerProxy(document.documentElement, null);
    };
  }, []);

  /* ---------- Scroll: card expands to fullscreen (scrub), stays viewport-centered ---------- */
  useEffect(() => {
    const card = floatingRef.current;
    const section = sectionRef.current;
    const headline = headlineRef.current;
    const img = imgRef.current;
    const follow = cardFollowRef.current;
    if (!card || !section || !headline || !img || !follow) return;

    gsap.set(follow, { x: 0, xPercent: 0, y: INITIAL_CARD_FOLLOW_Y });

    gsap.set(card, {
      transformOrigin: "50% 50%",
      marginLeft: 0,
      marginRight: 0,
      position: "relative",
      left: "auto",
      top: "auto",
      xPercent: 0,
      yPercent: 0,
      width: "680px",
      height: "380px",
      borderRadius: 10,
      opacity: 1,
      boxShadow:
        "0 4px 24px rgba(0,0,0,0.04), 0 0 0 1px rgba(0,0,0,0.02)",
    });
    gsap.set(img, {
      scale: 1,
      filter: "brightness(1) blur(0px)",
      transformOrigin: "center center",
    });



    let lastProgress = 0;
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: section,
        start: "top top",
        end: "+=55%",
        scrub: 1,
        pin: section,
        anticipatePin: 1,
        onUpdate: (self) => {
          const p = self.progress;
          scrollProgressRef.current = p;
          if (
            lastProgress <= MAGNETIC_OFF_SCROLL_PROGRESS &&
            p > MAGNETIC_OFF_SCROLL_PROGRESS &&
            xToRef.current
          ) {
            xToRef.current(0);
          }
          lastProgress = p;
        },
      },
    });

    /* ----- Phase 1 (scroll ~0–50%): hero → fullscreen ----- */
    tl.to(
      follow,
      {
        y: 0,
        ease: "power3.inOut",
        duration: 1,
      },
      0
    );

    tl.to(
      card,
      {
        width: "100vw",
        height: "100svh",
        borderRadius: FULLSCREEN_RADIUS,
        boxShadow: "0 0 0 0 rgba(0,0,0,0)",
        ease: "power3.inOut",
        duration: 1,
      },
      0
    );

    tl.to(
      headline,
      {
        y: -140,
        opacity: 0,
        filter: "blur(8px)",
        ease: "power3.in",
        duration: 0.55,
      },
      0
    );

    tl.to(
      img,
      {
        scale: 1.06,
        filter: "brightness(0.92) blur(3px)",
        ease: "power2.inOut",
        duration: 0.45,
      },
      0
    );

    tl.to(
      img,
      {
        scale: 1,
        filter: "brightness(1) blur(0px)",
        ease: "power3.out",
        duration: 0.55,
      },
      0.45
    );

    return () => {
      tl.scrollTrigger?.kill();
      tl.kill();
    };
  }, []);

  /* ---------- Subtle hover scale (listener) ---------- */
  useEffect(() => {
    const el = floatingRef.current;
    const listener = cardListenerRef.current;
    if (!el || !listener) return;

    const onEnter = () => {
      gsap.to(el, {
        scale: 1.015,
        duration: 0.5,
        ease: "power3.out",
        overwrite: "auto",
        force3D: true,
      });
    };
    const onLeave = () => {
      gsap.to(el, {
        scale: 1,
        duration: 0.55,
        ease: "power3.out",
        overwrite: "auto",
        force3D: true,
      });
    };

    listener.addEventListener("pointerenter", onEnter);
    listener.addEventListener("pointerleave", onLeave);
    return () => {
      listener.removeEventListener("pointerenter", onEnter);
      listener.removeEventListener("pointerleave", onLeave);
    };
  }, []);

  return (
    <>
      <header className="pointer-events-none [&_a]:pointer-events-auto [&_div]:pointer-events-auto">
        <div className="overflow-hidden fixed left-4 lg:left-8 right-4 lg:right-8 top-4 lg:top-6 grid grid-cols-12 gap-4 lg:gap-8 z-50 text-black">

          <div className="col-span-6 lg:col-span-3 flex items-center">
            <img
              src={outcrowdLogo}
              alt="Outcrowd Studio"
              className="w-[115px] object-contain"
            />
          </div>

          <div className="hidden lg:flex col-span-4 flex-col justify-center">
            <span className="block overflow-hidden"><div className="block font-medium text-[clamp(16px,1.2vw,20px)]" style={{ transform: "none" }}>Creative Agency</div></span>
            <span className="block overflow-hidden"><div className="block font-medium text-neutral-500 text-[clamp(16px,1.2vw,20px)]" style={{ transform: "none" }}>Working globally</div></span>
          </div>

          <div className="hidden lg:flex col-span-3 flex-col justify-center">
            <span className="block overflow-hidden"><div className="block font-medium text-[clamp(16px,1.2vw,20px)]" style={{ transform: "none" }}>Project availability</div></span>
            <span className="block overflow-hidden"><div className="block font-medium text-neutral-500 text-[clamp(16px,1.2vw,20px)]" style={{ transform: "none" }}>Accepting now</div></span>
          </div>

          <a href="mailto:contact@outcrowd.com" className="fixed right-4 lg:right-8 top-4 lg:top-6 group cursor-pointer pointer-events-auto" aria-label="Send us an email" role="button" style={{ opacity: 1, transform: "none" }}>
            <div className="relative">
              <div className="absolute left-0 top-0 w-12 3xl:w-14 h-12 3xl:h-14 bg-black border border-neutral-800 rounded-full flex items-center justify-center rotate-180 scale-95 group-hover:scale-100 group-hover:rotate-0 group-hover:-translate-x-full transition-transform duration-700 ease-[cubic-bezier(0.34,1.56,0.64,1)] -z-10">
                <span className="text-lg lg:text-xl 3xl:text-2xl">🤙🏼</span>
              </div>
              <div className="flex items-center relative px-5 lg:px-6 h-12 lg:h-14 rounded-full bg-black text-white font-semibold text-[clamp(16px,1.2vw,20px)] border border-neutral-800 z-10">
                <div className="overflow-hidden h-6 lg:h-7">
                  <div className="flex flex-col transition-transform duration-500 ease-[cubic-bezier(0.25,1,0.5,1)] group-hover:-translate-y-1/2">
                    <span className="text-[clamp(16px,1.2vw,20px)] text-white font-semibold mb-1.5 leading-snug">Start a Project</span>
                    <span className="text-[clamp(16px,1.2vw,20px)] text-white font-semibold mb-1.5 leading-snug">Start a Project</span>
                  </div>
                </div>
              </div>
            </div>
          </a>

        </div>
      </header>

      <section
        ref={sectionRef}
        className="relative z-10 h-[100svh] w-full overflow-hidden [contain:layout_paint] bg-white isolate"
      >
        <div className="absolute bottom-0 left-0 right-0 h-[0%] bg-gradient-to-t from-white to-transparent z-[1]" />

        {/*
            End state: flex center keeps fullscreen perfectly centered.
            Initial: cardFollow gets negative y (GSAP) so the small card sits higher like the old pt-28 hero.
          */}
        <div className="absolute inset-0 z-[5] flex items-center justify-center pointer-events-none px-4 lg:px-8">
          <div
            ref={cardTrackRef}
            className="pointer-events-auto relative w-full max-w-[min(1100px,calc(100vw-2rem))] min-h-[min(440px,52vh)] flex items-center justify-center"
          >
            <div
              ref={cardListenerRef}
              className="absolute inset-0 z-30 touch-none"
              aria-hidden
            />
            <div
              ref={cardFollowRef}
              className="relative z-20 flex shrink-0 will-change-transform [transform:translateZ(0)]"
            >
              <div
                ref={floatingRef}
                className="relative shrink-0 w-[min(680px,calc(100vw-2rem))] h-[min(380px,48vh)] max-w-[100vw] overflow-hidden rounded-[10px] will-change-[width,height,transform,opacity] shadow-sm [backface-visibility:hidden]"
              >
                <img
                  ref={imgRef}
                  src="/hero-center.jpg"
                  alt=""
                  className="h-full w-full object-cover object-center pointer-events-none select-none"
                  draggable={false}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="relative z-10 h-full grid grid-cols-12 gap-8 px-4 lg:px-8 pointer-events-none [&_.headline-hit]:pointer-events-auto">
          <div
            ref={headlineRef}
            className="headline-hit col-span-12 absolute bottom-20 left-0 right-0 px-4 lg:px-8 will-change-transform"
          >
            <div className="grid grid-cols-12 items-end gap-x-2">
              <span className="font-medium col-span-3 mb-6 text-[20px] uppercase tracking-widest text-black/90">
                A
              </span>
              <span className="font-medium col-span-6 mb-6 text-center text-[20px] uppercase tracking-widest text-black/90">
                Seriously
              </span>
              <span className="font-medium col-span-3 mb-6 text-right text-[20px] uppercase tracking-widest text-black/90">
                Good
              </span>

              <h1 className="col-span-12 text-center font-satoshi font-black uppercase leading-[0.95] tracking-[-0.06em] text-[#000000] text-[clamp(4.5rem,11vw,12rem)] max-w-[min(100%,calc(100vw-2rem))] mx-auto whitespace-normal sm:whitespace-nowrap">
                Visual Engineers
              </h1>
            </div>
          </div>

          <div className="absolute bottom-8 left-4 lg:left-8 text-sm text-black">
            SCROLL
          </div>
        </div>
      </section>
    </>
  );
}






