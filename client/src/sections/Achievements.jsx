// src/sections/Achievements.jsx
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  FaAward,
  FaExternalLinkAlt,
  FaSearch,
  FaFilter,
  FaSortAmountDown,
  FaSortAmountUp,
  FaClock,
} from "react-icons/fa";
import useFetch from "../hooks/useFetch";

function parseDate(value) {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}
function formatDate(value) {
  const d = parseDate(value);
  if (!d) return typeof value === "string" ? value : "";
  const opts = d.getDate()
    ? { year: "numeric", month: "short", day: "numeric" }
    : { year: "numeric", month: "short" };
  return d.toLocaleDateString("en-US", opts);
}
const badgeFor = (ach) => ach?.category || ach?.type || "Achievement";
const linkFor = (ach) => ach?.link || ach?.certificate || ach?.url;

export default function Achievements() {
  const { data: achievements, loading, error } = useFetch("/api/achievements", []);

  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all"); // all | recent
  const [sort, setSort] = useState("newest"); // newest | oldest
  const [visibleCount, setVisibleCount] = useState(6);
  const [expanded, setExpanded] = useState(() => new Set());

  const filtered = useMemo(() => {
    let items = Array.isArray(achievements) ? achievements.slice() : [];

    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter((a) => {
        const t = `${a?.title || ""} ${a?.description || ""} ${a?.date || ""} ${a?.category || ""}`.toLowerCase();
        return t.includes(q);
      });
    }

    if (filter === "recent") {
      const now = new Date();
      const cutoff = new Date(now);
      cutoff.setMonth(now.getMonth() - 12);
      items = items.filter((a) => {
        const d = parseDate(a?.date);
        return d ? d >= cutoff : false;
      });
    }

    items.sort((a, b) => {
      const da = parseDate(a?.date)?.getTime() ?? -Infinity;
      const db = parseDate(b?.date)?.getTime() ?? -Infinity;
      return sort === "newest" ? db - da : da - db;
    });

    return items;
  }, [achievements, search, filter, sort]);

  const toShow = filtered.slice(0, visibleCount);

  const toggleExpand = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  return (
    <section id="achievements" aria-label="Achievements" className="relative py-20 overflow-hidden bg-[#1f232b]">
      {/* Vignette + subtle grid (same vibe as Projects/Experience) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)] bg-gradient-to-b from-white/5 via-transparent to-white/5" />
      <div aria-hidden className="absolute inset-0 -z-20 opacity-[0.18] bg-[radial-gradient(rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:22px_22px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header (left aligned) */}
        <div className="mb-8">
          <p className="text-[11px] md:text-xs tracking-[0.25em] uppercase text-slate-400">Milestones & awards</p>
          <h2 className="mt-2 text-3xl md:text-4xl font-extrabold text-slate-100">
            Achievements <span className="text-[#ff2d55]">I’ve earned</span>
          </h2>
          <p className="mt-2 text-slate-300/90 max-w-3xl text-sm md:text-base">
            Certifications, awards, and recognitions that reflect my learning and impact.
          </p>
        </div>

        {/* Controls (match Projects style) */}
        <div className="mb-8 flex flex-col gap-3">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            {/* Search */}
            <div className="relative flex-1">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search achievements..."
                className="w-full pl-9 pr-3 py-2 rounded-lg bg-[#232830] border border-white/10 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#ff2d55]/60"
              />
            </div>
            {/* Filter */}
            <div className="relative">
              <FaFilter className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
              <select
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
                className="appearance-none pl-9 pr-8 py-2 rounded-lg bg-[#232830] border border-white/10 text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#ff2d55]/60"
                aria-label="Filter achievements"
              >
                <option value="all">All</option>
                <option value="recent">Recent (12 months)</option>
              </select>
            </div>
            {/* Sort */}
            <div className="relative">
              {sort === "newest" ? (
                <FaSortAmountDown className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
              ) : (
                <FaSortAmountUp className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-300" />
              )}
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="appearance-none pl-9 pr-8 py-2 rounded-lg bg-[#232830] border border-white/10 text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#ff2d55]/60"
                aria-label="Sort achievements"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && <p className="text-center text-red-400 mb-6 text-sm">{error}</p>}

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {loading
            ? Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-44 rounded-xl bg-[#232830] border border-white/10 overflow-hidden">
                  <div className="h-full w-full animate-pulse bg-gradient-to-r from-white/5 via-white/10 to-white/5 bg-[length:200%_100%]" />
                </div>
              ))
            : toShow.length > 0
            ? toShow.map((ach, i) => {
                const id = ach?._id || `${ach?.title || "ach"}-${ach?.date || i}`;
                const isExpanded = expanded.has(id);
                const link = linkFor(ach);
                const d = formatDate(ach?.date);
                const badge = badgeFor(ach);

                return (
                  <motion.article
                    key={id}
                    initial={{ opacity: 0, y: 14 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.35, delay: i * 0.06 }}
                    whileHover={{ y: -2 }}
                    className="group relative p-5 bg-[#232830] border border-white/10 rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.35)]"
                  >
                    {/* Hover accent ring */}
                    <span className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-transparent group-hover:ring-[#ff2d55]/35 transition" />

                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-base font-semibold text-slate-100 flex-1 leading-tight">
                        {ach?.title || "Untitled achievement"}
                      </h3>
                      <span className="inline-flex items-center gap-1 text-[11px] text-slate-200 bg-black/20 border border-white/10 rounded-full px-2 py-1">
                        <FaAward className="text-[#ff2d55]" />
                        {badge}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-400">
                      <FaClock />
                      <span>{d || "Date not available"}</span>
                    </div>

                    <p className={`mt-3 text-sm text-slate-300/90 ${isExpanded ? "" : "line-clamp-3"}`}>
                      {ach?.description || "No description provided."}
                    </p>

                    {/* Optional tags */}
                    {Array.isArray(ach?.tags) && ach.tags.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {ach.tags.slice(0, 5).map((tag, idx) => (
                          <span
                            key={idx}
                            className="text-[11px] px-2 py-0.5 rounded-full bg-black/20 border border-white/10 text-slate-200"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="mt-4 flex items-center justify-between">
                      <button
                        onClick={() => toggleExpand(id)}
                        className="text-xs text-slate-200 hover:text-white underline underline-offset-4"
                      >
                        {isExpanded ? "Show less" : "Read more"}
                      </button>

                      {link && (
                        <a
                          href={link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-[#ff2d55] hover:brightness-110 underline underline-offset-4"
                        >
                          View Certificate <FaExternalLinkAlt />
                        </a>
                      )}
                    </div>

                    {/* Pulse dot (accent) */}
                    <span className="absolute top-4 right-4 w-2 h-2 rounded-full bg-[#ff2d55] animate-pulse" />
                  </motion.article>
                );
              })
            : (
              <p className="text-center text-slate-400 text-sm col-span-full">
                No achievements found.
              </p>
            )}
        </div>

        {/* Load more */}
        {!loading && filtered.length > visibleCount && (
          <div className="flex justify-center mt-10">
            <button
              onClick={() => setVisibleCount((c) => c + 6)}
              className="px-5 py-2.5 rounded-lg bg-white/5 border border-white/10 text-slate-200 hover:text-white hover:border-white/20 transition"
            >
              Load more
            </button>
          </div>
        )}
      </div>
    </section>
  );
}