// models/Experience.js
const mongoose = require("mongoose");

// Simple URL validator
const URL_REGEX =
  /^(https?:\/\/)([\w-]+(\.[\w-]+)+)(:[0-9]{1,5})?(\/[^\s]*)?$/i;

const ALLOWED_TYPES = [
  "full-time",
  "part-time",
  "internship",
  "freelance",
  "contract",
  "temporary",
  "volunteer",
  "self-employed",
  "apprenticeship",
];

// Helpers
function monthsBetween(a, b) {
  const start = new Date(a.getFullYear(), a.getMonth(), 1);
  const end = new Date(b.getFullYear(), b.getMonth(), 1);
  const months = (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
  return Math.max(0, months);
}
function fmtMonthYear(d) {
  return d
    ? d.toLocaleDateString("en-US", { month: "short", year: "numeric" })
    : "";
}
function humanDuration(start, end) {
  const months = monthsBetween(start, end);
  const y = Math.floor(months / 12);
  const m = months % 12;
  if (y > 0 && m > 0) return `${y} yr ${m} mos`;
  if (y > 0) return `${y} yr${y > 1 ? "s" : ""}`;
  return `${m} mos`;
}

const ExperienceSchema = new mongoose.Schema(
  {
    role: {
      type: String,
      required: [true, "Role is required"],
      trim: true,
      maxlength: 140,
    },
    company: {
      type: String,
      required: [true, "Company is required"],
      trim: true,
      maxlength: 140,
    },

    // Employment type (frontend reads either type or employmentType)
    type: {
      type: String,
      trim: true,
      lowercase: true,
      enum: ALLOWED_TYPES,
    },
    employmentType: {
      type: String,
      trim: true,
      lowercase: true,
      enum: ALLOWED_TYPES,
    },

    location: {
      type: String,
      trim: true,
      maxlength: 160,
    },

    // Dates (use these for reliable sort/filter)
    startDate: { type: Date },
    endDate: { type: Date },
    current: { type: Boolean, default: false }, // if currently working

    // Optional raw text dates (e.g., "Aug 2024", "Present")
    startText: { type: String, trim: true, maxlength: 60 },
    endText: { type: String, trim: true, maxlength: 60 },

    // Display string (auto-computed if missing)
    duration: { type: String, trim: true, maxlength: 120 },

    description: { type: String, trim: true, maxlength: 4000 },

    // Optional details
    bullets: {
      type: [String],
      default: [],
      set: (arr) =>
        Array.isArray(arr)
          ? arr.map((s) => String(s || "").trim()).filter(Boolean)
          : [],
    },

    // For tags/tech badges in UI
    tags: {
      type: [String],
      default: [],
      set: (arr) =>
        Array.isArray(arr)
          ? [...new Set(arr.map((t) => String(t).trim()).filter(Boolean))]
          : [],
    },
    tech: {
      type: [String],
      default: [],
      set: (arr) =>
        Array.isArray(arr)
          ? [...new Set(arr.map((t) => String(t).trim()).filter(Boolean))]
          : [],
    },
    skills: {
      type: [String],
      default: [],
      set: (arr) =>
        Array.isArray(arr)
          ? [...new Set(arr.map((t) => String(t).trim()).filter(Boolean))]
          : [],
    },

    // Optional links used by frontend (View Details)
    link: {
      type: String,
      trim: true,
      validate: { validator: (v) => !v || URL_REGEX.test(v), message: "Invalid URL" },
    },
    url: {
      type: String,
      trim: true,
      validate: { validator: (v) => !v || URL_REGEX.test(v), message: "Invalid URL" },
    },
    companyUrl: {
      type: String,
      trim: true,
      validate: { validator: (v) => !v || URL_REGEX.test(v), message: "Invalid URL" },
    },
    certificate: {
      type: String,
      trim: true,
      validate: { validator: (v) => !v || URL_REGEX.test(v), message: "Invalid URL" },
    },
    logo: {
      type: String,
      trim: true,
      validate: { validator: (v) => !v || URL_REGEX.test(v), message: "Invalid URL" },
    },
    image: {
      type: String,
      trim: true,
      validate: { validator: (v) => !v || URL_REGEX.test(v), message: "Invalid URL" },
    },
  },
  { timestamps: true, versionKey: false }
);

// Pre-save normalization and duration auto-fill
ExperienceSchema.pre("save", function (next) {
  // If current is true, clear endDate
  if (this.current) this.endDate = null;

  // Parse startText/endText into dates if not provided
  if (!this.startDate && this.startText) {
    const d = new Date(this.startText);
    if (!isNaN(d.getTime())) this.startDate = d;
  }
  if (!this.endDate && this.endText && this.endText.toLowerCase() !== "present") {
    const d = new Date(this.endText);
    if (!isNaN(d.getTime())) this.endDate = d;
  }

  // Auto-compute duration if missing and startDate available
  if (!this.duration && this.startDate) {
    const end = this.current || !this.endDate ? new Date() : this.endDate;
    const range =
      `${fmtMonthYear(this.startDate)} – ${this.current || !this.endDate ? "Present" : fmtMonthYear(this.endDate)}`;
    const human = humanDuration(this.startDate, end);
    this.duration = `${range} · ${human}`;
  }

  // Ensure unique trimmed arrays
  ["tags", "tech", "skills", "bullets"].forEach((k) => {
    if (Array.isArray(this[k])) {
      this[k] = [...new Set(this[k].map((t) => String(t).trim()).filter(Boolean))];
    }
  });

  next();
});

// Helpful indexes
ExperienceSchema.index({ createdAt: -1 });
ExperienceSchema.index({ startDate: -1, endDate: -1 });
ExperienceSchema.index({ type: 1, employmentType: 1 });
ExperienceSchema.index({ company: 1 });
ExperienceSchema.index({ role: "text", company: "text", description: "text", tags: "text", tech: "text", skills: "text" });

// Clean JSON (id instead of _id)
ExperienceSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

module.exports = mongoose.model("Experience", ExperienceSchema);