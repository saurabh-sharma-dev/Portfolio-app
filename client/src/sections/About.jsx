// src/sections/About.jsx
import { useEffect, useMemo, useRef, useState } from "react";
import { motion } from "framer-motion";
import { FaLaptopCode, FaGamepad, FaBook, FaCheck } from "react-icons/fa";
import {
  SiJavascript,
  SiReact,
  SiNodedotjs,
  SiExpress,
  SiMongodb,
  SiTailwindcss,
  SiHtml5,
  SiCss3,
} from "react-icons/si";

const RESUME_URL =
  "https://drive.google.com/file/d/1n11ROC7gHwU_wNrLtheYtY41koMIGazo/view?usp=sharing";

// Animated counter (no backend)
function StatCounter({ value, label, delay = 0 }) {
  const ref = useRef(null);
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let raf = 0;
    const obs = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        const dur = 900;
        const start = performance.now() + delay * 120;
        const tick = (t) => {
          const elapsed = Math.max(0, t - start);
          const p = Math.min(1, elapsed / dur);
          setDisplay(Math.round(p * value));
          if (p < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
        obs.disconnect();
      },
      { threshold: 0.55 }
    );
    obs.observe(el);
    return () => {
      cancelAnimationFrame(raf);
      obs.disconnect();
    };
  }, [value, delay]);

  return (
    <div
      ref={ref}
      className="flex-1 min-w-[7.5rem] max-w-[10rem] text-center bg-[#232830] border border-white/10 rounded-xl px-3 py-3 shadow-[0_12px_40px_rgba(0,0,0,0.35)]"
    >
      <span className="text-xl font-bold text-[#ff2d55]">{display}+</span>
      <p className="text-xs text-slate-400">{label}</p>
    </div>
  );
}

// Skill -> Icon
const skillIconMap = {
  "JavaScript": <SiJavascript className="text-yellow-300" />,
  "React.js": <SiReact className="text-sky-300" />,
  "Node.js": <SiNodedotjs className="text-green-400" />,
  "Express.js": <SiExpress className="text-gray-300" />,
  "MongoDB": <SiMongodb className="text-emerald-400" />,
  "HTML": <SiHtml5 className="text-orange-400" />,
  "CSS": <SiCss3 className="text-blue-400" />,
  "Tailwind CSS": <SiTailwindcss className="text-cyan-300" />,
};

export default function About() {
  const skills = useMemo(
    () => ({
      Frontend: ["React.js", "HTML", "CSS", "Tailwind CSS"],
      Backend: ["Node.js", "Express.js", "MongoDB"],
      Core: ["JavaScript"],
    }),
    []
  );

  const stats = [
    { label: "Projects Completed", value: 3 },
    { label: "Technologies Learned", value: 12 },
    { label: "Years of Experience", value: 0 },
  ];

  const hobbies = [
    { icon: <FaGamepad />, label: "Gaming" },
    { icon: <FaBook />, label: "Reading" },
  ];

  const coreStack = ["React", "Node.js", "Express", "MongoDB", "Tailwind"];

  return (
    <section
      id="about"
      aria-label="About Saurabh"
      className="relative py-16 md:py-20 overflow-hidden bg-[#1f232b]"
    >
      {/* Vignette + subtle grid (same vibe as Projects/Experience) */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)] bg-gradient-to-b from-white/5 via-transparent to-white/5"
      />
      <div
        aria-hidden
        className="absolute inset-0 -z-20 opacity-[0.18] bg-[radial-gradient(rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:22px_22px]"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header (left aligned) */}
        <div className="mb-8">
          <p className="text-[11px] md:text-xs tracking-[0.25em] uppercase text-slate-400">
            Who I am
          </p>
          <h2 className="mt-1 text-3xl md:text-4xl font-extrabold text-slate-100">
            About <span className="text-[#ff2d55]">Me</span>
          </h2>
          <div className="mt-3 h-[2px] w-14 bg-[#ff2d55] rounded-full" />
          <p className="mt-3 text-slate-300/90 max-w-3xl text-sm md:text-base">
            I’m a final-year Computer Science student who loves building clean,
            accessible and performant web apps with React, Node and Tailwind.
          </p>
        </div>

        {/* Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-10 items-start">
          {/* Left: highlights, CTAs, skills, stats, hobbies */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45 }}
            className="md:col-span-7 space-y-7"
          >
            {/* Quick highlights (compact bullets) */}
            <ul className="space-y-2 text-slate-300/90 text-sm md:text-[15px]">
              {[
                "Clean UI and smooth interactions",
                "Performance and accessibility first",
                "End‑to‑end MERN development",
              ].map((item, i) => (
                <li key={i} className="flex items-start gap-2">
                  <FaCheck className="mt-[2px] text-[#ff2d55]" size={12} />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {/* CTAs (compact) */}
            <div className="flex flex-wrap gap-3">
              <a
                href="#contact"
                className="px-5 py-2.5 rounded-lg bg-[#ff2d55] text-white font-medium shadow-[0_10px_30px_rgba(255,45,85,0.25)] hover:brightness-110 transition-transform hover:scale-[1.02]"
              >
                Let’s Work Together
              </a>
              <a
                href={RESUME_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="px-5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-slate-200 hover:text-white hover:border-white/20 transition"
              >
                Download Resume
              </a>
            </div>

            {/* Core stack (tiny chips) */}
            <div className="flex flex-wrap gap-2">
              {coreStack.map((t) => (
                <span
                  key={t}
                  className="text-[11px] px-2.5 py-1 rounded-full bg-black/20 border border-white/10 text-slate-200"
                >
                  {t}
                </span>
              ))}
            </div>

            {/* Skills (grouped, compact) */}
            <div>
              <h3 className="text-base md:text-lg font-semibold text-slate-100">
                Skills
              </h3>
              <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.entries(skills).map(([group, arr], gi) => (
                  <motion.div
                    key={group}
                    initial={{ opacity: 0, y: 6 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: gi * 0.06 }}
                    className="bg-[#232830] border border-white/10 rounded-xl p-4"
                  >
                    <p className="text-sm font-medium text-slate-300 mb-3">
                      {group}
                    </p>
                    <ul className="flex flex-wrap gap-2">
                      {arr.map((skill, i) => (
                        <li key={skill}>
                          <motion.span
                            initial={{ opacity: 0, y: 6 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.25, delay: i * 0.03 }}
                            whileHover={{ scale: 1.05 }}
                            className="inline-flex items-center gap-2 px-2.5 py-1 rounded-full bg-black/20 border border-white/10 text-slate-200 text-[11px] md:text-xs font-medium"
                            title={skill}
                          >
                            <span className="text-[15px] leading-none">
                              {skillIconMap[skill] || (
                                <FaLaptopCode className="text-slate-200" />
                              )}
                            </span>
                            {skill}
                          </motion.span>
                        </li>
                      ))}
                    </ul>
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Stats (compact + responsive) */}
            <div className="flex flex-wrap gap-3">
              {stats.map((s, i) => (
                <StatCounter
                  key={s.label}
                  value={s.value}
                  label={s.label}
                  delay={i * 0.2}
                />
              ))}
            </div>

            {/* Hobbies (compact chips) */}
            <div>
              <h4 className="text-sm font-semibold text-slate-300 mb-2">
                Hobbies
              </h4>
              <div className="flex flex-wrap gap-2.5">
                {hobbies.map((h, i) => (
                  <motion.div
                    key={h.label}
                    initial={{ opacity: 0, y: 6 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.06 }}
                    className="flex items-center gap-2 bg-[#232830] border border-white/10 rounded-xl px-3 py-1.5 text-slate-200 text-xs"
                  >
                    {h.icon}
                    <span>{h.label}</span>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Right: compact interactive card + education chip */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="md:col-span-5 flex flex-col items-center gap-4"
          >
            <div className="w-full flex justify-center" style={{ perspective: "1000px" }}>
              <motion.div
                whileHover={{ rotateY: 10, rotateX: 5, scale: 1.015 }}
                transition={{ type: "spring", stiffness: 220, damping: 20 }}
                className="group relative w-52 sm:w-56 h-52 sm:h-56 p-5 rounded-3xl bg-[#232830] border border-white/10 shadow-[0_26px_76px_rgba(0,0,0,0.45)] grid place-items-center overflow-hidden"
              >
                {/* Accent aura */}
                <div className="absolute -inset-[2px] rounded-3xl bg-[radial-gradient(circle_at_30%_20%,rgba(255,45,85,0.18),transparent_55%)]" />
                <div className="absolute inset-0 rounded-3xl ring-1 ring-white/10" />
                <FaLaptopCode className="relative text-slate-100 text-5xl drop-shadow" />
                {/* Hover ring */}
                <span className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-transparent group-hover:ring-[#ff2d55]/35 transition" />
              </motion.div>
            </div>

            <div className="w-full">
              <div className="mx-auto max-w-[20rem] bg-[#232830] border border-white/10 rounded-xl px-4 py-3 text-center">
                <p className="text-sm text-slate-300">
                  Final-year CS @{" "}
                  <span className="text-[#ff2d55] font-medium">
                    Centurion University
                  </span>
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}