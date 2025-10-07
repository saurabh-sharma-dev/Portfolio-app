// src/sections/Hero.jsx
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";
import { useEffect, useState } from "react";
import { FaLinkedin, FaGithub, FaArrowDown } from "react-icons/fa";

// Links
const RESUME_URL =
  "https://drive.google.com/file/d/1n11ROC7gHwU_wNrLtheYtY41koMIGazo/view?usp=sharing";
const LINKEDIN_URL =
  "https://www.linkedin.com/in/saurabh-kumar-sharma-5b03a1264/";
const GITHUB_URL =
  import.meta.env.VITE_GITHUB_URL || "https://github.com/saurabh-sharma-dev";

// Photos
const PHOTO_URL = "https://i.postimg.cc/5230f2mk/photo.jpg";
const FALLBACK_PHOTO = "https://i.postimg.cc/DZf7Wzb6/saurabh-photo.jpg";

export default function Hero() {
  const prefersReducedMotion = useReducedMotion();

  const roles = ["Full‑Stack Developer", "MERN Specialist", "UI‑Focused Engineer"];
  const [roleIndex, setRoleIndex] = useState(0);
  const [imgSrc, setImgSrc] = useState(PHOTO_URL);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (prefersReducedMotion) return;
    const id = setInterval(() => setRoleIndex((i) => (i + 1) % roles.length), 2600);
    return () => clearInterval(id);
  }, [prefersReducedMotion]);

  const scrollWithOffset = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const navHStr = getComputedStyle(document.documentElement).getPropertyValue("--nav-h");
    const navH = parseInt(navHStr) || 64;
    const y = el.getBoundingClientRect().top + window.pageYOffset - (navH + 8);
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <section
      id="home"
      aria-label="Hero"
      className="relative min-h-[calc(100vh-var(--nav-h,64px))] flex items-center overflow-hidden bg-[#1f232b] py-12 md:py-16"
    >
      {/* Subtle grid + vignette */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 opacity-[0.12] bg-[radial-gradient(rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:22px_22px]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,black_62%,transparent_100%)] bg-gradient-to-b from-white/5 via-transparent to-white/5"
      />

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 items-center">
          {/* Left: Text */}
          <div className="md:col-span-7 text-left">
            <motion.p
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-[10px] md:text-xs tracking-[0.25em] uppercase text-slate-400"
            >
              Welcome to my world
            </motion.p>

            <motion.h1
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="mt-2 text-[clamp(2rem,5vw,3.1rem)] leading-[1.15] font-extrabold text-slate-100"
            >
              Hi, I’m <span className="text-[#ff2d55]">Saurabh</span>
              <br />
              a Full Stack Developer
              <span className="ml-1 text-slate-400 align-baseline animate-pulse">|</span>
            </motion.h1>

            {/* Rotating role */}
            <div className="mt-2 h-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={roleIndex}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: prefersReducedMotion ? 0 : 0.3 }}
                  className="text-sm md:text-[15px] text-slate-300/90"
                >
                  {roles[roleIndex]}
                </motion.div>
              </AnimatePresence>
            </div>

            <p className="mt-4 text-slate-300/90 max-w-xl text-sm md:text-[15px]">
              I craft clean, accessible, and scalable web apps with beautiful UI and smooth
              interactions using React, Node, and Tailwind.
            </p>

            {/* CTAs (compact) */}
            <div className="mt-6 flex flex-wrap items-center gap-3">
              <button
                onClick={() => scrollWithOffset("contact")}
                className="px-5 py-2.5 rounded-lg bg-[#ff2d55] text-white font-semibold shadow-[0_10px_30px_rgba(255,45,85,0.25)] hover:brightness-110 transition-transform hover:scale-[1.02]"
              >
                Contact Me
              </button>
              <a
                href={RESUME_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-slate-200 hover:text-white hover:border-white/20 transition-transform hover:scale-[1.02]"
              >
                Download Resume
              </a>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-slate-200 hover:text-white hover:border-white/20 transition-transform hover:scale-[1.02] inline-flex items-center gap-2"
              >
                <FaGithub /> GitHub
              </a>
            </div>

            {/* Socials (compact) */}
            <div className="mt-4 flex items-center gap-3">
              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="text-slate-300 hover:text-[#ff2d55] transition"
              >
                <FaLinkedin size={18} />
              </a>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="text-slate-300 hover:text-[#ff2d55] transition"
              >
                <FaGithub size={18} />
              </a>
            </div>
          </div>

          {/* Right: Clean, simple photo card */}
          <div className="md:col-span-5 flex justify-center md:justify-end">
            <motion.div
              whileHover={{ scale: 1.01 }}
              transition={{ type: "spring", stiffness: 220, damping: 20 }}
              className="group relative w-52 sm:w-60 md:w-[20rem] aspect-[4/5]"
            >
              {/* Soft accent aura (very subtle) */}
              <div
                aria-hidden
                className="absolute -inset-4 rounded-[26px] bg-[radial-gradient(circle_at_30%_20%,rgba(255,45,85,0.18),transparent_60%)] blur-2xl"
              />

              {/* Card */}
              <div className="relative h-full w-full rounded-[22px] bg-[#232830] border border-white/10 overflow-hidden shadow-[0_24px_68px_rgba(0,0,0,0.45)] ring-1 ring-white/5">
                {/* Minimal gradient edge */}
                <div className="pointer-events-none absolute inset-0 rounded-[22px] ring-1 ring-white/10" />

                {/* Skeleton while loading */}
                {!loaded && <div className="absolute inset-0 bg-[#1b1f26] animate-pulse" />}

                <img
                  src={imgSrc}
                  alt="Saurabh Kumar Sharma portrait"
                  className={`relative w-full h-full object-cover object-center rounded-[22px] transition-opacity duration-500 ${
                    loaded ? "opacity-100" : "opacity-0"
                  }`}
                  loading="eager"
                  decoding="async"
                  onLoad={() => setLoaded(true)}
                  onError={() => {
                    setImgSrc(FALLBACK_PHOTO);
                    setLoaded(true);
                  }}
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Bottom scroll indicator (compact) */}
        <motion.button
          onClick={() => scrollWithOffset("about")}
          className="group absolute left-4 md:left-1/2 md:-translate-x-1/2 bottom-6 inline-flex items-center gap-2 text-slate-400 hover:text-[#ff2d55]"
          aria-label="Scroll to About"
          animate={prefersReducedMotion ? {} : { y: [0, 6, 0] }}
          transition={{ duration: 1.4, repeat: Infinity }}
        >
          <FaArrowDown className="opacity-80 group-hover:opacity-100" />
          <span className="text-xs tracking-wide">Scroll</span>
        </motion.button>
      </div>
    </section>
  );
}