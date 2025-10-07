// src/components/Navbar.jsx
import { useEffect, useRef, useState } from "react";
import {
  FaMoon,
  FaSun,
  FaLinkedin,
  FaGithub,
  FaBars,
  FaTimes,
  FaDownload,
} from "react-icons/fa";
import { motion, AnimatePresence, useReducedMotion } from "framer-motion";

const LINKS = [
  { id: "home", label: "Home" },
  { id: "about", label: "About" },
  { id: "projects", label: "Projects" },
  { id: "experience", label: "Experience" },
  { id: "achievements", label: "Achievements" },
  { id: "contact", label: "Contact" },
];

const RESUME_URL =
  "https://drive.google.com/file/d/1n11ROC7gHwU_wNrLtheYtY41koMIGazo/view?usp=sharing";
const LINKEDIN_URL =
  "https://www.linkedin.com/in/saurabh-kumar-sharma-5b03a1264/";
const GITHUB_URL =
  import.meta.env.VITE_GITHUB_URL || "https://github.com/saurabh-sharma-dev";

export default function Navbar() {
  const prefersReducedMotion = useReducedMotion();
  const navRef = useRef(null);

  // Theme with persistence
  const [darkMode, setDarkMode] = useState(() => {
    try {
      const saved = localStorage.getItem("theme");
      if (saved) return saved === "dark";
    } catch {}
    return true;
  });

  const [active, setActive] = useState("home");
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [navH, setNavH] = useState(64);
  const [progress, setProgress] = useState(0); // scroll progress bar

  // Apply theme class + persist
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
    try {
      localStorage.setItem("theme", darkMode ? "dark" : "light");
    } catch {}
  }, [darkMode]);

  // Measure nav height for scroll offset + CSS var
  useEffect(() => {
    const update = () => {
      const h = navRef.current?.offsetHeight || 64;
      setNavH(h);
      document.documentElement.style.setProperty("--nav-h", `${h}px`);
    };
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  // Change background on scroll + progress
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      setScrolled(y > 8);
      const docH = document.documentElement.scrollHeight;
      const winH = window.innerHeight;
      const total = Math.max(1, docH - winH);
      setProgress(Math.min(1, Math.max(0, y / total)));
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Scrollspy: highlight active link
  useEffect(() => {
    const sections = LINKS.map((l) => document.getElementById(l.id)).filter(Boolean);
    if (!sections.length) return;

    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (visible?.target?.id) setActive(visible.target.id);
      },
      { rootMargin: `-${navH + 10}px 0px -50% 0px`, threshold: [0.25, 0.5, 0.75] }
    );

    sections.forEach((s) => obs.observe(s));
    return () => obs.disconnect();
  }, [navH]);

  // Lock scroll when mobile menu open
  useEffect(() => {
    if (menuOpen) document.documentElement.style.overflow = "hidden";
    else document.documentElement.style.overflow = "";
    return () => (document.documentElement.style.overflow = "");
  }, [menuOpen]);

  const handleScroll = (id) => {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (!el) return;
    const y = el.getBoundingClientRect().top + window.pageYOffset - (navH + 8);
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <>
      {/* Skip link */}
      <a
        href="#home"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-[9999] px-3 py-2 rounded bg-[#ff2d55] text-white"
      >
        Skip to content
      </a>

      <motion.nav
        ref={navRef}
        initial={{ y: prefersReducedMotion ? 0 : -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: prefersReducedMotion ? 0 : 0.5 }}
        className={`fixed inset-x-0 top-0 z-50 border-b border-white/10 backdrop-blur-sm ${
          scrolled
            ? "bg-[#1f232b]/95 shadow-[0_10px_30px_rgba(0,0,0,0.25)]"
            : "bg-[#1f232b]/80"
        }`}
        role="navigation"
        aria-label="Primary"
      >
        {/* Top accent line */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#ff2d55]/60 to-transparent"
        />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">
          {/* Brand */}
          <button
            onClick={() => handleScroll("home")}
            className="text-base md:text-lg font-extrabold bg-gradient-to-r from-white via-white to-[#ffb6c6] bg-clip-text text-transparent"
            aria-label="Go to home"
          >
            Saurabh Kumar Sharma
          </button>

          {/* Desktop nav */}
          <ul className="hidden md:flex items-center gap-1">
            {LINKS.map((link) => (
              <li key={link.id} className="px-1">
                <button
                  onClick={() => handleScroll(link.id)}
                  aria-current={active === link.id ? "page" : undefined}
                  className={`group relative px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                    active === link.id
                      ? "text-white"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  {link.label}
                  <span
                    className={`pointer-events-none absolute left-3 right-3 -bottom-0.5 h-[2px] rounded-full bg-[#ff2d55] transition-all ${
                      active === link.id
                        ? "opacity-100 w-[calc(100%-1.5rem)]"
                        : "opacity-0 w-0 group-hover:w-[calc(100%-1.5rem)] group-hover:opacity-90"
                    }`}
                  />
                </button>
              </li>
            ))}
          </ul>

          {/* Right: social + resume + theme */}
          <div className="hidden md:flex items-center gap-3">
            <a
              href={LINKEDIN_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-[#ff2d55] text-lg focus:outline-none focus:ring-2 focus:ring-[#ff2d55] rounded"
              aria-label="LinkedIn"
            >
              <FaLinkedin />
            </a>
            <a
              href={GITHUB_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-slate-300 hover:text-[#ff2d55] text-lg focus:outline-none focus:ring-2 focus:ring-[#ff2d55] rounded"
              aria-label="GitHub"
            >
              <FaGithub />
            </a>

            <a
              href={RESUME_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-2 text-xs px-3 py-2 rounded-md bg-[#232830] border border-white/10 text-slate-200 hover:text-white hover:border-white/20 transition focus:outline-none focus:ring-2 focus:ring-[#ff2d55]"
            >
              <FaDownload /> Resume
            </a>

            <button
              onClick={() => setDarkMode((d) => !d)}
              className="ml-1 inline-flex items-center justify-center w-9 h-9 rounded-md text-yellow-400 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-[#ff2d55]"
              aria-label="Toggle theme"
              title="Toggle theme"
            >
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setMenuOpen((m) => !m)}
            className="md:hidden text-slate-200 hover:text-[#ff2d55] text-2xl p-1 focus:outline-none focus:ring-2 focus:ring-[#ff2d55] rounded"
            aria-label="Toggle menu"
            aria-expanded={menuOpen}
          >
            {menuOpen ? <FaTimes /> : <FaBars />}
          </button>
        </div>

        {/* Bottom scroll progress bar */}
        <div
          aria-hidden="true"
          className="absolute bottom-0 left-0 h-[2px] bg-[#ff2d55] transition-[width] duration-150"
          style={{ width: `${progress * 100}%` }}
        />
      </motion.nav>

      {/* Mobile drawer */}
      <AnimatePresence>
        {menuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              key="backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm md:hidden"
              onClick={() => setMenuOpen(false)}
            />

            {/* Sheet */}
            <motion.div
              key="sheet"
              initial={{ y: "-100%" }}
              animate={{ y: 0 }}
              exit={{ y: "-100%" }}
              transition={{ type: "spring", stiffness: 260, damping: 26 }}
              className="fixed top-0 inset-x-0 z-50 md:hidden bg-[#1f232b] border-b border-white/10"
              style={{ paddingTop: navH }}
            >
              <div className="px-6 pb-6 pt-4 space-y-3">
                {LINKS.map((l) => (
                  <button
                    key={l.id}
                    onClick={() => handleScroll(l.id)}
                    className={`block w-full text-left px-3 py-2 rounded-md text-slate-200 hover:text-white hover:bg-[#232830] ${
                      active === l.id ? "text-[#ff2d55]" : ""
                    }`}
                  >
                    {l.label}
                  </button>
                ))}

                <div className="flex items-center gap-4 pt-3">
                  <a
                    href={LINKEDIN_URL}
                    target="_blank"
                    className="text-slate-200 hover:text-[#ff2d55]"
                  >
                    LinkedIn
                  </a>
                  <a
                    href={GITHUB_URL}
                    target="_blank"
                    className="text-slate-200 hover:text-[#ff2d55]"
                  >
                    GitHub
                  </a>
                  <a
                    href={RESUME_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ml-auto inline-flex items-center gap-2 text-xs px-3 py-2 rounded-md bg-[#232830] border border-white/10 text-slate-200 hover:text-white hover:border-white/20"
                  >
                    <FaDownload /> Resume
                  </a>
                  <button
                    onClick={() => setDarkMode((d) => !d)}
                    className="w-9 h-9 inline-flex items-center justify-center rounded-md text-yellow-400 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-[#ff2d55]"
                    aria-label="Toggle theme"
                  >
                    {darkMode ? <FaSun /> : <FaMoon />}
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}