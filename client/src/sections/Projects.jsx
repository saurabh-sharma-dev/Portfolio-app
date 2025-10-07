// src/sections/Projects.jsx
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FaSearch, FaExternalLinkAlt, FaGithub, FaLink } from "react-icons/fa";
import useFetch from "../hooks/useFetch";

function parseDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (!isNaN(d.getTime())) return d;
  const m = String(value).match(/(20\d{2}|19\d{2})/);
  return m ? new Date(Number(m[1]), 0, 1) : null;
}

function getTags(project) {
  if (Array.isArray(project?.tags) && project.tags.length) return project.tags;
  if (Array.isArray(project?.tech) && project.tech.length) return project.tech;
  if (typeof project?.tech === "string")
    return project.tech.split(",").map((t) => t.trim()).filter(Boolean);
  return [];
}

export default function Projects() {
  const { data: projects, loading, error } = useFetch("/api/projects", []);

  const [search, setSearch] = useState("");
  const [activeTag, setActiveTag] = useState("all");
  const [sort, setSort] = useState("newest"); // newest | oldest
  const [visibleCount, setVisibleCount] = useState(6);

  // Build a tag cloud from your data (top 8)
  const allTags = useMemo(() => {
    const freq = {};
    (Array.isArray(projects) ? projects : []).forEach((p) => {
      getTags(p).forEach((t) => {
        const key = t.toLowerCase();
        freq[key] = (freq[key] || 0) + 1;
      });
    });
    return Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 8)
      .map(([t]) => t);
  }, [projects]);

  const filtered = useMemo(() => {
    let items = Array.isArray(projects) ? projects.slice() : [];

    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter((p) =>
        `${p?.name || ""} ${p?.description || ""} ${p?.tech || ""}`
          .toLowerCase()
          .includes(q)
      );
    }

    if (activeTag !== "all") {
      items = items.filter((p) =>
        getTags(p).map((t) => t.toLowerCase()).includes(activeTag)
      );
    }

    items.sort((a, b) => {
      const da = parseDate(a?.date || a?.createdAt || a?.updatedAt)?.getTime() ?? -Infinity;
      const db = parseDate(b?.date || b?.createdAt || b?.updatedAt)?.getTime() ?? -Infinity;
      return sort === "newest" ? db - da : da - db;
    });

    return items;
  }, [projects, search, activeTag, sort]);

  const toShow = filtered.slice(0, visibleCount);

  const codeLink = (p) => p?.github || p?.repo || p?.source;

  return (
    <section
      id="projects"
      aria-label="Projects"
      className="relative py-16 md:py-20 overflow-hidden bg-[#1f232b]"
    >
      {/* Subtle vignette + grid (matching site vibe) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)] bg-gradient-to-b from-white/5 via-transparent to-white/5"
      />
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-20 opacity-[0.18] bg-[radial-gradient(rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:22px_22px]"
      />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header */}
        <div className="mb-8">
          <p className="text-[11px] md:text-xs tracking-[0.25em] uppercase text-slate-400">
            Selected work
          </p>
          <h2 className="mt-1 text-3xl md:text-4xl font-extrabold text-slate-100">
            Projects <span className="text-[#ff2d55]">I’ve built</span>
          </h2>
          <div className="mt-3 h-[2px] w-14 bg-[#ff2d55] rounded-full" />
          <p className="mt-3 text-slate-300/90 max-w-3xl text-sm md:text-base">
            A mix of full‑stack apps and UI experiments focused on performance and delightful UX.
          </p>
        </div>

        {/* Controls (compact) */}
        <div className="mb-7 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search projects or tech..."
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#232830] border border-white/10 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#ff2d55]/60"
              />
            </div>
            {/* Sort */}
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value)}
              className="appearance-none px-3 py-2 rounded-lg bg-[#232830] border border-white/10 text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#ff2d55]/60"
              aria-label="Sort projects"
            >
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
            </select>
          </div>

          {/* Tag chips (scrollable on mobile) */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setActiveTag("all")}
              className={`px-3 py-1 text-xs rounded-full border whitespace-nowrap ${
                activeTag === "all"
                  ? "bg-[#ff2d55] text-white border-[#ff2d55]"
                  : "bg-[#232830] text-slate-200 border-white/10 hover:border-white/20"
              }`}
            >
              All
            </button>
            {allTags.map((t) => (
              <button
                key={t}
                onClick={() => setActiveTag(t)}
                className={`px-3 py-1 text-xs rounded-full border capitalize whitespace-nowrap ${
                  activeTag === t
                    ? "bg-[#ff2d55] text-white border-[#ff2d55]"
                    : "bg-[#232830] text-slate-200 border-white/10 hover:border-white/20"
                }`}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-center text-red-400 mb-6 text-sm">{error}</p>
        )}

        {/* Grid with smaller, tighter cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {loading
            ? Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-44 rounded-xl bg-[#232830] border border-white/10 overflow-hidden"
                >
                  <div className="h-full w-full animate-pulse bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%]" />
                </div>
              ))
            : toShow.length > 0
            ? toShow.map((project, i) => {
                const tags = getTags(project);
                const live = project?.link || project?.url || project?.demo;
                const code = codeLink(project);

                return (
                  <motion.article
                    key={project._id || project.name + i}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    whileHover={{ y: -2 }}
                    className="group relative rounded-xl border border-white/10 bg-[#232830] overflow-hidden shadow-[0_14px_44px_rgba(0,0,0,0.35)]"
                  >
                    {/* Image (smaller height) */}
                    {project.image ? (
                      <div className="h-32 md:h-36 w-full overflow-hidden">
                        <img
                          src={project.image}
                          alt={project.name || "Project image"}
                          className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                          loading="lazy"
                        />
                      </div>
                    ) : (
                      <div className="h-32 md:h-36 w-full bg-white/5" />
                    )}

                    {/* Body (compact) */}
                    <div className="p-3">
                      <h3 className="text-[15px] font-semibold text-slate-100 line-clamp-1">
                        {project.name || "Untitled"}
                      </h3>
                      {project.description && (
                        <p className="mt-1 text-[12px] text-slate-300/90 line-clamp-2">
                          {project.description}
                        </p>
                      )}

                      {/* Tags (tiny) */}
                      {tags.length > 0 && (
                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {tags.slice(0, 5).map((t, idx) => (
                            <span
                              key={idx}
                              className="text-[10px] px-2 py-0.5 rounded-full bg-black/20 border border-white/10 text-slate-200"
                            >
                              {t}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Actions (tiny buttons) */}
                      <div className="mt-3 flex items-center gap-2">
                        {live && (
                          <a
                            href={live}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] rounded-md bg-[#ff2d55] text-white hover:brightness-110"
                          >
                            <FaLink /> Live
                          </a>
                        )}
                        {code && (
                          <a
                            href={code}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-2.5 py-1 text-[11px] rounded-md bg-white/5 border border-white/10 text-slate-200 hover:text-white hover:border-white/20"
                          >
                            <FaGithub /> Code
                          </a>
                        )}
                        {!live && project.link && (
                          <a
                            href={project.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="ml-auto inline-flex items-center gap-1 text-[11px] text-slate-200 hover:text-white underline underline-offset-4"
                          >
                            Open <FaExternalLinkAlt />
                          </a>
                        )}
                      </div>
                    </div>

                    {/* Accent ring on hover */}
                    <span className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-transparent group-hover:ring-[#ff2d55]/35 transition" />
                  </motion.article>
                );
              })
            : (
              <p className="text-center text-slate-400 text-sm col-span-full">
                No projects found.
              </p>
            )}
        </div>

        {/* Load more + View on GitHub */}
        <div className="mt-9 flex flex-col sm:flex-row items-center justify-center gap-3">
          {!loading && filtered.length > visibleCount && (
            <button
              onClick={() => setVisibleCount((c) => c + 6)}
              className="px-5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-slate-200 hover:text-white hover:border-white/20 transition"
            >
              Load more
            </button>
          )}

          <a
            href={import.meta.env.VITE_GITHUB_URL || "https://github.com/saurabh-sharma-dev"}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 rounded-lg bg-[#ff2d55] text-white hover:brightness-110"
          >
            View more on GitHub
          </a>
        </div>
      </div>
    </section>
  );
}