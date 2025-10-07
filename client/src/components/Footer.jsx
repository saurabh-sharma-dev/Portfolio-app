// src/components/Footer.jsx
import { FaLinkedin, FaGithub, FaArrowUp } from "react-icons/fa";
import { motion } from "framer-motion";

export default function Footer() {
  const year = new Date().getFullYear();
  const email = import.meta.env.VITE_EMAIL_USER || "you@example.com";
  const LINKEDIN_URL = "https://www.linkedin.com/in/saurabh-kumar-sharma-5b03a1264/";
  const GITHUB_URL = import.meta.env.VITE_GITHUB_URL || "https://github.com/saurabh-sharma-dev";

  const navLinks = [
    { label: "Home", id: "home" },
    { label: "About", id: "about" },
    { label: "Projects", id: "projects" },
    { label: "Experience", id: "experience" },
    { label: "Achievements", id: "achievements" },
    { label: "Contact", id: "contact" },
  ];

  const scrollWithOffset = (id) => {
    const el = document.getElementById(id);
    if (!el) return;
    const navHStr = getComputedStyle(document.documentElement).getPropertyValue("--nav-h");
    const navH = parseInt(navHStr) || 64;
    const y = el.getBoundingClientRect().top + window.pageYOffset - (navH + 8);
    window.scrollTo({ top: y, behavior: "smooth" });
  };

  return (
    <footer
      role="contentinfo"
      className="relative overflow-hidden bg-[#1f232b] text-slate-300 border-t border-white/10"
    >
      {/* Accent top line */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-[#ff2d55]/60 to-transparent"
      />
      {/* Subtle vignette + grid (match sections) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)] bg-gradient-to-b from-white/5 via-transparent to-white/5"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 opacity-[0.18] bg-[radial-gradient(rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:22px_22px]"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
          {/* Brand + tagline + socials */}
          <div className="md:col-span-5">
            <motion.h3
              initial={{ opacity: 0, y: 6 }}
              whileInView={{ opacity: 1, y: 0 }}
              className="text-lg font-extrabold bg-gradient-to-r from-white via-white to-[#ffb6c6] bg-clip-text text-transparent"
            >
              Saurabh Kumar Sharma
            </motion.h3>
            <p className="mt-2 text-sm text-slate-400">Full Stack Developer</p>

            <p className="mt-4 text-sm text-slate-300/90 max-w-md">
              I build clean, scalable, and accessible web apps with React, Node, and Tailwind —
              focused on performance and delightful UX.
            </p>

            <div className="mt-5 flex items-center gap-3">
              <a
                href={LINKEDIN_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LinkedIn"
                className="grid place-items-center w-10 h-10 rounded-lg bg-[#232830] border border-white/10 text-slate-200 hover:text-white"
              >
                <FaLinkedin />
              </a>
              <a
                href={GITHUB_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="GitHub"
                className="grid place-items-center w-10 h-10 rounded-lg bg-[#232830] border border-white/10 text-slate-200 hover:text-white"
              >
                <FaGithub />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <nav className="md:col-span-4" aria-label="Footer navigation">
            <h4 className="text-sm font-semibold text-slate-200">Quick Links</h4>
            <ul className="mt-3 grid grid-cols-2 gap-2">
              {navLinks.map((l) => (
                <li key={l.id}>
                  <button
                    onClick={() => scrollWithOffset(l.id)}
                    className="text-left w-full text-sm text-slate-400 hover:text-white hover:underline underline-offset-4 rounded focus:outline-none focus:ring-2 focus:ring-[#ff2d55]"
                  >
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Contact + CTAs */}
          <div className="md:col-span-3">
            <h4 className="text-sm font-semibold text-slate-200">Get in touch</h4>
            <p className="mt-3 text-sm text-slate-400">
              Email:{" "}
              <a
                href={`mailto:${email}`}
                className="text-[#ff2d55] hover:brightness-110 underline underline-offset-4"
              >
                {email}
              </a>
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <button
                onClick={() => scrollWithOffset("contact")}
                className="px-4 py-2 text-sm rounded-lg bg-[#ff2d55] text-white shadow-[0_10px_30px_rgba(255,45,85,0.25)] hover:brightness-110"
              >
                Contact Me
              </button>
              <a
                href="https://drive.google.com/file/d/1n11ROC7gHwU_wNrLtheYtY41koMIGazo/view?usp=sharing"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 text-sm rounded-lg bg-[#232830] border border-white/10 text-slate-200 hover:text-white hover:border-white/20"
              >
                Download Resume
              </a>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-slate-500">
            &copy; {year} Saurabh Kumar Sharma. All rights reserved.
          </p>

          <motion.button
            onClick={() => scrollWithOffset("home")}
            whileHover={{ y: -2 }}
            className="inline-flex items-center gap-2 text-sm text-slate-400 hover:text-[#ff2d55] focus:outline-none focus:ring-2 focus:ring-[#ff2d55] rounded"
            aria-label="Back to top"
          >
            <FaArrowUp />
            Back to top
          </motion.button>
        </div>
      </div>
    </footer>
  );
}