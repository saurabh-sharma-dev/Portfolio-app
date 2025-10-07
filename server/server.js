// server/index.js
require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const helmet = require("helmet");
const compression = require("compression");
const rateLimit = require("express-rate-limit");
const nodemailer = require("nodemailer");
const morgan = require("morgan");

// Models
const Contact = require("./models/Contact");
const Project = require("./models/Project");
const Experience = require("./models/Experience");
const Achievement = require("./models/Achievement");

const app = express();

// ---------------------- CONFIG ----------------------
const isProd = process.env.NODE_ENV === "production";
const PORT = process.env.PORT || 5000;

// Allow common dev origins + configured URL
const allowedOrigins = [
  process.env.FRONTEND_URL,
  "http://localhost:5173",
  "http://127.0.0.1:5173",
  "http://localhost:3000",
  "http://127.0.0.1:3000",
].filter(Boolean);

// ---------------------- MIDDLEWARE ----------------------
app.set("trust proxy", 1);
app.use(
  cors({
    origin(origin, cb) {
      // allow no origin (curl/postman) and allowed list
      if (!origin || allowedOrigins.includes(origin)) return cb(null, true);
      return cb(new Error("Not allowed by CORS"));
    },
  })
);
app.use(helmet({ crossOriginResourcePolicy: false }));
app.use(compression());
app.use(express.json({ limit: "200kb" }));
if (!isProd) app.use(morgan("dev"));

// Rate limit (general) - 300 req/5min per IP
const generalLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 300,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(generalLimiter);

// Contact route tighter limiter - 10 req/10min per IP
const contactLimiter = rateLimit({
  windowMs: 10 * 60 * 1000,
  max: 10,
  message: { error: "Too many requests, please try again later." },
  standardHeaders: true,
  legacyHeaders: false,
});

// ---------------------- DB ----------------------
if (!process.env.MONGO_URI) {
  console.error("❌ Missing MONGO_URI in .env");
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
  });

// ---------------------- UTILS ----------------------
const asyncHandler =
  (fn) =>
  (req, res, next) =>
    Promise.resolve(fn(req, res, next)).catch(next);

const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const SMTP_HOST = process.env.SMTP_HOST; // optional
const SMTP_PORT = process.env.SMTP_PORT; // optional
const EMAIL_TO = process.env.EMAIL_TO || EMAIL_USER;

function createTransporter() {
  if (SMTP_HOST && SMTP_PORT) {
    return nodemailer.createTransport({
      host: SMTP_HOST,
      port: Number(SMTP_PORT),
      secure: Number(SMTP_PORT) === 465,
      auth: EMAIL_USER && EMAIL_PASS ? { user: EMAIL_USER, pass: EMAIL_PASS } : undefined,
      tls: { rejectUnauthorized: false },
    });
  }
  // Fallback: Gmail service (requires EMAIL_USER/EMAIL_PASS)
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: EMAIL_USER, pass: EMAIL_PASS },
    tls: { rejectUnauthorized: false },
  });
}

// Trim helper
const t = (v) => (typeof v === "string" ? v.trim() : v);

// ---------------------- ROUTES ----------------------
app.get("/", (_req, res) => {
  res.json({ ok: true, message: "Portfolio Backend is running" });
});

// CONTACT
// CONTACT (safe)
app.post(
  "/api/contact",
  contactLimiter,
  asyncHandler(async (req, res) => {
    const t = (v) => (typeof v === "string" ? v.trim() : v);
    const name = t(req.body.name);
    const email = t(req.body.email);
    const message = t(req.body.message);
    const subject = t(req.body.subject);
    const phone = t(req.body.phone);

    if (!name || name.length < 2) {
      return res.status(400).json({ error: "Name must be at least 2 characters" });
    }
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ error: "Please provide a valid email" });
    }
    if (!message || message.length < 10) {
      return res.status(400).json({ error: "Message must be at least 10 characters" });
    }

    // Save to DB (always)
    const contact = new Contact({
      name,
      email: email.toLowerCase(),
      message,
      subject,
      phone,
      meta: {
        ip: req.ip,
        userAgent: req.headers["user-agent"],
        page: req.get("referer"),
      },
    });
    await contact.save();

    // Email send (graceful)
    let mailStatus = "skipped";
    const skipEmail = process.env.SKIP_EMAIL === "true";
    const EMAIL_USER = process.env.EMAIL_USER;
    const EMAIL_PASS = process.env.EMAIL_PASS;

    if (!skipEmail && EMAIL_USER && EMAIL_PASS) {
      try {
        const transporter = require("nodemailer").createTransport({
          host: process.env.SMTP_HOST || "smtp.gmail.com",
          port: Number(process.env.SMTP_PORT || 465),
          secure: Number(process.env.SMTP_PORT || 465) === 465, // 465: secure, 587: starttls
          auth: { user: EMAIL_USER, pass: EMAIL_PASS },
          tls: { rejectUnauthorized: false },
        });

        const compiledText = [
          `Name: ${name}`,
          `Email: ${email}`,
          phone ? `Phone: ${phone}` : null,
          subject ? `Subject: ${subject}` : null,
          "",
          message,
        ]
          .filter(Boolean)
          .join("\n");

        // Optional verify (comment out if slow)
        // await transporter.verify();

        await transporter.sendMail({
          from: EMAIL_USER, // must be the authenticated account
          to: process.env.EMAIL_TO || EMAIL_USER,
          replyTo: email,   // user email
          subject: `New Contact Message from ${name}`,
          text: compiledText,
        });

        mailStatus = "sent";
      } catch (e) {
        mailStatus = "failed";
        console.error("Email send failed:", e?.response || e?.message || e);
      }
    }

    return res.status(200).json({
      message: "Message received",
      mail: mailStatus, // "sent" | "failed" | "skipped"
    });
  })
);
// PROJECTS
app.get(
  "/api/projects",
  asyncHandler(async (_req, res) => {
    // Prefer date desc if available, then createdAt
    const projects = await Project.find().sort({ date: -1, createdAt: -1 }).lean();
    res.status(200).json(projects);
  })
);

app.get(
  "/api/projects/:id",
  asyncHandler(async (req, res) => {
    const project = await Project.findById(req.params.id).lean();
    if (!project) return res.status(404).json({ error: "Project not found" });
    res.status(200).json(project);
  })
);

app.post(
  "/api/projects",
  asyncHandler(async (req, res) => {
    const body = req.body || {};
    if (!body.name) return res.status(400).json({ error: "Project name is required" });

    // Normalize strings
    if (typeof body.name === "string") body.name = body.name.trim();
    if (typeof body.description === "string") body.description = body.description.trim();

    const project = new Project(body);
    await project.save();
    res.status(201).json(project);
  })
);

app.delete(
  "/api/projects/:id",
  asyncHandler(async (req, res) => {
    const deleted = await Project.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Project not found" });
    res.status(200).json({ message: "Project deleted successfully" });
  })
);

// EXPERIENCE
app.get(
  "/api/experience",
  asyncHandler(async (_req, res) => {
    // Prefer startDate desc if available, else createdAt
    const experiences = await Experience.find().sort({ startDate: -1, createdAt: -1 }).lean();
    res.status(200).json(experiences);
  })
);

app.post(
  "/api/experience",
  asyncHandler(async (req, res) => {
    const body = req.body || {};
    if (!body.role || !body.company) {
      return res.status(400).json({ error: "Role and company are required" });
    }
    const exp = new Experience(body);
    await exp.save();
    res.status(201).json(exp);
  })
);

// ACHIEVEMENTS
app.get(
  "/api/achievements",
  asyncHandler(async (_req, res) => {
    // Prefer date desc if available, else createdAt
    const achievements = await Achievement.find().sort({ date: -1, createdAt: -1 }).lean();
    res.status(200).json(achievements);
  })
);

app.post(
  "/api/achievements",
  asyncHandler(async (req, res) => {
    const body = req.body || {};
    if (!body.title) return res.status(400).json({ error: "Title is required" });
    const ach = new Achievement(body);
    await ach.save();
    res.status(201).json(ach);
  })
);

// ---------------------- 404 + ERROR HANDLER ----------------------
app.use((req, res) => {
  res.status(404).json({ error: "Not found" });
});

app.use((err, _req, res, _next) => {
  console.error("❌ Error:", err);
  const status = err.status || 500;
  res.status(status).json({
    error: err.message || "Server error",
  });
});

// ---------------------- START ----------------------
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});