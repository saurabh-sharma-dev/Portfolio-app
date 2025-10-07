// src/sections/Contact.jsx
import { useRef, useState } from "react";
import { motion } from "framer-motion";
import {
  FaPaperPlane,
  FaCheckCircle,
  FaEnvelope,
  FaLinkedin,
  FaGithub,
  FaCopy,
} from "react-icons/fa";
import api from "../utils/api";

const MAX_MESSAGE = 800;
const LINKEDIN_URL =
  "https://www.linkedin.com/in/saurabh-kumar-sharma-5b03a1264/";
const GITHUB_URL =
  import.meta.env.VITE_GITHUB_URL || "https://github.com/saurabh-sharma-dev";
const CARD_IMG =
  import.meta.env.VITE_CONTACT_CARD_IMG ||
  "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?q=80&w=1200&auto=format&fit=crop";

export default function Contact() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    subject: "",
    message: "",
  });
  const [touched, setTouched] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [trap, setTrap] = useState(""); // honeypot
  const [copied, setCopied] = useState(false);

  const nameRef = useRef(null);
  const emailRef = useRef(null);
  const messageRef = useRef(null);

  const emailEnv = import.meta.env.VITE_EMAIL_USER || "";

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  };
  const handleBlur = (e) =>
    setTouched((t) => ({ ...t, [e.target.name]: true }));

  const validate = () => {
    const errs = {};
    if (!form.name?.trim() || form.name.trim().length < 2)
      errs.name = "Please enter at least 2 characters.";
    const email = form.email?.trim();
    const emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || "");
    if (!emailOk) errs.email = "Please enter a valid email address.";
    const msg = form.message?.trim() || "";
    if (!msg || msg.length < 10)
      errs.message = "Message should be at least 10 characters.";
    if (msg.length > MAX_MESSAGE)
      errs.message = `Message is too long (max ${MAX_MESSAGE} characters).`;
    // Optional phone validation (only if provided)
    if (form.phone && !/^[\d+\-\s()]{7,20}$/.test(form.phone))
      errs.phone = "Please enter a valid phone number.";
    return errs;
  };

  const focusFirstInvalid = (errs) => {
    if (errs.name) return nameRef.current?.focus();
    if (errs.email) return emailRef.current?.focus();
    if (errs.message) return messageRef.current?.focus();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSubmitted(false);

    // Honeypot
    if (trap) {
      setError("Something went wrong. Please email me directly.");
      return;
    }

    const errs = validate();
    if (Object.keys(errs).length > 0) {
      setTouched({ name: true, email: true, message: true, phone: true });
      focusFirstInvalid(errs);
      return;
    }

    setSubmitting(true);
    try {
      // Keep backend shape same; include subject/phone inside message safely
      const subject = form.subject?.trim();
      const phone = form.phone?.trim();
      const compiledMessage = [
        subject ? `Subject: ${subject}` : "",
        phone ? `Phone: ${phone}` : "",
        form.message.trim(),
      ]
        .filter(Boolean)
        .join("\n\n");

      const payload = {
        name: form.name.trim(),
        email: form.email.trim(),
        message: compiledMessage,
      };

      await api.post("/api/contact", payload);
      setSubmitted(true);
      setForm({ name: "", email: "", phone: "", subject: "", message: "" });
      setTouched({});
    } catch (err) {
      setError(
        err?.response?.data?.error || "Failed to send message. Please try again."
      );
    } finally {
      setSubmitting(false);
    }
  };

  const errors = validate();
  const isInvalid = Object.keys(errors).length > 0;

  const copyEmail = async () => {
    if (!emailEnv) return;
    try {
      await navigator.clipboard.writeText(emailEnv);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <section
      id="contact"
      aria-label="Contact"
      className="relative py-20 overflow-hidden bg-[#1f232b]"
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
        {/* Header (left aligned, screenshot style) */}
        <div className="mb-10">
          <p className="text-[11px] md:text-xs tracking-[0.25em] uppercase text-[#ff2d55]">
            Contact
          </p>
          <h2 className="mt-1 text-3xl md:text-4xl font-extrabold text-slate-100">
            Contact <span className="text-[#ff2d55]">With Me</span>
          </h2>
        </div>

        {/* Success / Error banners */}
        <div aria-live="polite" className="mb-4">
          {submitted && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto max-w-2xl rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-300 px-4 py-3 flex items-center gap-2"
            >
              <FaCheckCircle /> Message sent successfully!
            </motion.div>
          )}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              className="mx-auto max-w-2xl rounded-lg border border-red-500/30 bg-red-500/10 text-red-300 px-4 py-3"
            >
              {error}
            </motion.div>
          )}
        </div>

        {/* Layout: left info card + right form */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left: Info Card */}
          <aside className="md:col-span-4">
            <div className="rounded-2xl bg-[#232830] border border-white/10 p-5 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
              <div className="overflow-hidden rounded-xl">
                <img
                  src={CARD_IMG}
                  alt="Contact visual"
                  className="w-full h-44 object-cover"
                  loading="lazy"
                />
              </div>

              <div className="mt-5">
                <h3 className="text-xl font-semibold text-slate-100">
                  Saurabh Kumar Sharma
                </h3>
                <p className="text-sm text-slate-400">Full Stack Developer</p>

                <p className="mt-4 text-sm text-slate-300/90">
                  I’m available for freelance/part‑time work. Connect with me via
                  email or socials below.
                </p>

                <div className="mt-4 flex items-center gap-3">
                  <span className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-black/20 border border-white/10 text-slate-200">
                    <FaEnvelope className="text-[#ff2d55]" />
                    <a
                      href={`mailto:${emailEnv}`}
                      className="hover:text-white transition"
                    >
                      {emailEnv || "you@example.com"}
                    </a>
                  </span>
                  <button
                    onClick={copyEmail}
                    className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-slate-300 hover:text-white"
                    title="Copy email"
                  >
                    <FaCopy />
                  </button>
                  {copied && (
                    <span className="text-xs text-emerald-300">Copied!</span>
                  )}
                </div>

                <div className="mt-5">
                  <p className="text-xs uppercase tracking-widest text-slate-400">
                    Find with me
                  </p>
                  <div className="mt-3 flex items-center gap-3">
                    <a
                      href={LINKEDIN_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="grid place-items-center w-10 h-10 rounded-lg bg-black/20 border border-white/10 text-slate-200 hover:text-white"
                    >
                      <FaLinkedin />
                    </a>
                    <a
                      href={GITHUB_URL}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="grid place-items-center w-10 h-10 rounded-lg bg-black/20 border border-white/10 text-slate-200 hover:text-white"
                    >
                      <FaGithub />
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Right: Form */}
          <motion.form
            onSubmit={handleSubmit}
            noValidate
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="md:col-span-8 rounded-2xl bg-[#232830] border border-white/10 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.45)]"
          >
            {/* Honeypot (do not send to backend) */}
            <input
              type="text"
              name="website"
              value={trap}
              onChange={(e) => setTrap(e.target.value)}
              autoComplete="off"
              tabIndex={-1}
              aria-hidden="true"
              className="hidden"
            />

            {/* Row: Name + Phone */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="name"
                  className="block text-[11px] tracking-widest text-slate-400 mb-1 uppercase"
                >
                  Your Name
                </label>
                <input
                  ref={nameRef}
                  id="name"
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="John Doe"
                  autoComplete="name"
                  className={`px-4 py-2 w-full rounded-lg bg-[#1b1f26] text-slate-200 placeholder-slate-500 border ${
                    errors.name && touched.name
                      ? "border-red-500/50 focus:ring-red-500"
                      : "border-white/10 focus:ring-[#ff2d55]/60"
                  } focus:outline-none focus:ring-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]`}
                  required
                  minLength={2}
                />
                {errors.name && touched.name && (
                  <p className="mt-1 text-xs text-red-400">{errors.name}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="phone"
                  className="block text-[11px] tracking-widest text-slate-400 mb-1 uppercase"
                >
                  Phone Number (optional)
                </label>
                <input
                  id="phone"
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  placeholder="+91 98765 43210"
                  autoComplete="tel"
                  className={`px-4 py-2 w-full rounded-lg bg-[#1b1f26] text-slate-200 placeholder-slate-500 border ${
                    errors.phone && touched.phone
                      ? "border-red-500/50 focus:ring-red-500"
                      : "border-white/10 focus:ring-[#ff2d55]/60"
                  } focus:outline-none focus:ring-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]`}
                />
                {errors.phone && touched.phone && (
                  <p className="mt-1 text-xs text-red-400">{errors.phone}</p>
                )}
              </div>
            </div>

            {/* Email */}
            <div className="mt-4">
              <label
                htmlFor="email"
                className="block text-[11px] tracking-widest text-slate-400 mb-1 uppercase"
              >
                Email
              </label>
              <input
                ref={emailRef}
                id="email"
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="you@example.com"
                autoComplete="email"
                className={`px-4 py-2 w-full rounded-lg bg-[#1b1f26] text-slate-200 placeholder-slate-500 border ${
                  errors.email && touched.email
                    ? "border-red-500/50 focus:ring-red-500"
                    : "border-white/10 focus:ring-[#ff2d55]/60"
                } focus:outline-none focus:ring-2 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]`}
                required
              />
              {errors.email && touched.email && (
                <p className="mt-1 text-xs text-red-400">{errors.email}</p>
              )}
            </div>

            {/* Subject */}
            <div className="mt-4">
              <label
                htmlFor="subject"
                className="block text-[11px] tracking-widest text-slate-400 mb-1 uppercase"
              >
                Subject (optional)
              </label>
              <input
                id="subject"
                type="text"
                name="subject"
                value={form.subject}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Project inquiry, collaboration, etc."
                className="px-4 py-2 w-full rounded-lg bg-[#1b1f26] text-slate-200 placeholder-slate-500 border border-white/10 focus:outline-none focus:ring-2 focus:ring-[#ff2d55]/60 shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]"
              />
            </div>

            {/* Message */}
            <div className="mt-4">
              <label
                htmlFor="message"
                className="block text-[11px] tracking-widest text-slate-400 mb-1 uppercase"
              >
                Your Message
              </label>
              <textarea
                ref={messageRef}
                id="message"
                name="message"
                value={form.message}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Tell me a bit about your project or question..."
                rows={6}
                maxLength={MAX_MESSAGE}
                className={`px-4 py-3 w-full rounded-lg bg-[#1b1f26] text-slate-200 placeholder-slate-500 border ${
                  errors.message && touched.message
                    ? "border-red-500/50 focus:ring-red-500"
                    : "border-white/10 focus:ring-[#ff2d55]/60"
                } focus:outline-none focus:ring-2 resize-y min-h-[160px] shadow-[inset_0_1px_0_rgba(255,255,255,0.04)]`}
                required
              />
              <div className="mt-1 flex items-center justify-between text-xs">
                <span className="text-slate-400">Min 10 characters</span>
                <span
                  className={`${
                    form.message.length > MAX_MESSAGE
                      ? "text-red-400"
                      : "text-slate-400"
                  }`}
                >
                  {form.message.length}/{MAX_MESSAGE}
                </span>
              </div>
              {errors.message && touched.message && (
                <p className="mt-1 text-xs text-red-400">{errors.message}</p>
              )}
            </div>

            <motion.button
              whileHover={{ scale: submitting || isInvalid ? 1 : 1.02 }}
              whileTap={{ scale: submitting || isInvalid ? 1 : 0.98 }}
              disabled={submitting || isInvalid}
              type="submit"
              className={`mt-5 inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-lg text-white font-semibold transition ${
                submitting || isInvalid
                  ? "bg-slate-600 cursor-not-allowed"
                  : "bg-[#ff2d55] hover:brightness-110 shadow-[0_10px_30px_rgba(255,45,85,0.25)]"
              }`}
            >
              {submitting ? (
                <>
                  <span className="inline-block h-4 w-4 rounded-full border-2 border-white/60 border-t-transparent animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <FaPaperPlane /> Send Message
                </>
              )}
            </motion.button>
          </motion.form>
        </div>
      </div>
    </section>
  );
}