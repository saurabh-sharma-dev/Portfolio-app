// src/sections/Experience.jsx
import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { FaExternalLinkAlt, FaClock, FaMapMarkerAlt, FaBriefcase } from "react-icons/fa";
import useFetch from "../hooks/useFetch";

function parseDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (!isNaN(d.getTime())) return d;
  const m = String(value).match(/(20\d{2}|19\d{2})/);
  return m ? new Date(Number(m[1]), 0, 1) : null;
}
function getTags(exp) {
  if (Array.isArray(exp?.tags) && exp.tags.length) return exp.tags;
  if (Array.isArray(exp?.skills) && exp.skills.length) return exp.skills;
  if (Array.isArray(exp?.tech) && exp.tech.length) return exp.tech;
  if (typeof exp?.tech === "string") return exp.tech.split(",").map((t) => t.trim()).filter(Boolean);
  return [];
}
function companyInitials(name = "") {
  const parts = String(name).trim().split(/\s+/);
  return parts.slice(0, 2).map((w) => w[0]?.toUpperCase() || "").join("") || "•";
}

export default function Experience() {
  const { data: experiences, loading, error } = useFetch("/api/experience", []);

  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("newest"); // newest | oldest
  const [typeFilter, setTypeFilter] = useState("all"); // all | internship | full-time | freelance
  const [visibleCount, setVisibleCount] = useState(6);
  const [expanded, setExpanded] = useState(() => new Set());

  const filtered = useMemo(() => {
    let items = Array.isArray(experiences) ? experiences.slice() : [];

    if (search.trim()) {
      const q = search.toLowerCase();
      items = items.filter((e) =>
        `${e?.role || ""} ${e?.company || ""} ${e?.description || ""} ${e?.duration || ""} ${e?.location || ""} ${e?.type || e?.employmentType || ""}`
          .toLowerCase()
          .includes(q)
      );
    }
    if (typeFilter !== "all") {
      items = items.filter((e) => {
        const t = `${e?.type || e?.employmentType || ""}`.toLowerCase();
        return t.includes(typeFilter);
      });
    }
    items.sort((a, b) => {
      const da = parseDate(a?.startDate || a?.start || a?.from || a?.date || a?.duration)?.getTime() ?? -Infinity;
      const db = parseDate(b?.startDate || b?.start || b?.from || b?.date || b?.duration)?.getTime() ?? -Infinity;
      return sort === "newest" ? db - da : da - db;
    });

    return items;
  }, [experiences, search, sort, typeFilter]);

  const toShow = filtered.slice(0, visibleCount);

  const toggleExpand = (id) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const typeOptions = ["all", "internship", "full-time", "freelance"];

  return (
    <section id="experience" aria-label="Experience" className="relative py-20 overflow-hidden bg-[#1f232b]">
      {/* Vignette + subtle grid (same vibe as Projects) */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,black_60%,transparent_100%)] bg-gradient-to-b from-white/5 via-transparent to-white/5" />
      <div aria-hidden className="absolute inset-0 -z-20 opacity-[0.18] bg-[radial-gradient(rgba(148,163,184,0.12)_1px,transparent_1px)] [background-size:22px_22px]" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Header (left-aligned) */}
        <div className="mb-8">
          <p className="text-[11px] md:text-xs tracking-[0.25em] uppercase text-slate-400">Roles and responsibilities</p>
          <h2 className="mt-2 text-3xl md:text-4xl font-extrabold text-slate-100">
            Experience <span className="text-[#ff2d55]">I’ve gained</span>
          </h2>
          <p className="mt-2 text-slate-300/90 max-w-3xl text-sm md:text-base">
            Internships and roles where I built real features, collaborated with teams, and shipped quality.
          </p>
        </div>

        {/* Controls (match Projects) */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search roles, companies, tech..."
              className="w-full sm:flex-1 px-3 py-2 rounded-lg bg-[#232830] border border-white/10 text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-[#ff2d55]/60"
            />
            <div className="flex items-center gap-3">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="appearance-none px-3 py-2 rounded-lg bg-[#232830] border border-white/10 text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#ff2d55]/60"
                aria-label="Filter by type"
              >
                {typeOptions.map((o) => (
                  <option key={o} value={o}>
                    {o === "all" ? "All types" : o.replace("-", " ").replace(/^\w/, (c) => c.toUpperCase())}
                  </option>
                ))}
              </select>
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value)}
                className="appearance-none px-3 py-2 rounded-lg bg-[#232830] border border-white/10 text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#ff2d55]/60"
                aria-label="Sort by date"
              >
                <option value="newest">Newest</option>
                <option value="oldest">Oldest</option>
              </select>
            </div>
          </div>
        </div>

        {/* Error */}
        {error && <p className="text-center text-red-400 mb-6 text-sm">{error}</p>}

        {/* Timeline (styled to match Projects cards) */}
        <div className="relative">
          {/* Rail */}
          <div className="absolute left-5 top-0 bottom-0 w-px bg-white/10 hidden sm:block" aria-hidden />

          <div className="space-y-6">
            {loading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <div key={i} className="relative pl-12">
                    <span className="hidden sm:block absolute left-4 top-5 -translate-x-1/2 w-3 h-3 rounded-full bg-[#ff2d55]/70 shadow" />
                    <div className="h-28 bg-[#232830] border border-white/10 rounded-xl animate-pulse" />
                  </div>
                ))
              : toShow.length > 0
              ? toShow.map((exp, i) => {
                  const id = exp?._id || `${exp?.role || "exp"}-${i}`;
                  const isExpanded = expanded.has(id);
                  const tags = getTags(exp);
                  const link = exp?.link || exp?.url || exp?.companyUrl || exp?.certificate;

                  return (
                    <motion.article
                      key={id}
                      initial={{ opacity: 0, y: 14 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: i * 0.06 }}
                      className="relative pl-12"
                    >
                      {/* Dot */}
                      <span className="hidden sm:block absolute left-4 top-6 -translate-x-1/2 w-3 h-3 rounded-full bg-[#ff2d55] shadow" aria-hidden />

                      <div className="group relative p-6 bg-[#232830] border border-white/10 rounded-xl shadow-[0_20px_60px_rgba(0,0,0,0.35)]">
                        {/* Hover accent ring */}
                        <span className="pointer-events-none absolute inset-0 rounded-xl ring-1 ring-transparent group-hover:ring-[#ff2d55]/35 transition" />

                        <div className="flex items-start gap-4">
                          {/* Avatar */}
                          <div className="flex-shrink-0">
                            <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 grid place-items-center text-xs font-semibold text-slate-200">
                              {companyInitials(exp?.company)}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                              <h3 className="text-base font-semibold text-slate-100 leading-tight">
                                {exp?.role || "Role"}
                              </h3>
                              {exp?.company && (
                                <span className="text-sm text-slate-300 font-medium">• {exp.company}</span>
                              )}
                            </div>

                            <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-400">
                              {exp?.duration && (
                                <span className="inline-flex items-center gap-1">
                                  <FaClock /> {exp.duration}
                                </span>
                              )}
                              {(exp?.location || exp?.place) && (
                                <span className="inline-flex items-center gap-1">
                                  <FaMapMarkerAlt /> {exp.location || exp.place}
                                </span>
                              )}
                              {(exp?.type || exp?.employmentType) && (
                                <span className="inline-flex items-center gap-1">
                                  <FaBriefcase /> {exp.type || exp.employmentType}
                                </span>
                              )}
                            </div>

                            <p className={`mt-3 text-sm text-slate-300/90 ${isExpanded ? "" : "line-clamp-3"}`}>
                              {exp?.description || "No description provided."}
                            </p>

                            {tags.length > 0 && (
                              <div className="mt-3 flex flex-wrap gap-2">
                                {tags.slice(0, 6).map((tag, idx) => (
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
                                  View Details <FaExternalLinkAlt />
                                </a>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.article>
                  );
                })
              : (
                <p className="text-center text-slate-400 text-sm">No experiences found.</p>
              )}
          </div>
        </div>

        {/* Load more */}
        {!loading && filtered.length > visibleCount && (
          <div className="flex justify-center mt-8">
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