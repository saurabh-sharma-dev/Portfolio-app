// models/Project.js
const mongoose = require("mongoose");

const URL_REGEX =
  /^(https?:\/\/)([\w-]+(\.[\w-]+)+)(:[0-9]{1,5})?(\/[^\s]*)?$/i;

function slugify(str) {
  return String(str || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

const ProjectSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Project name is required"],
      trim: true,
      maxlength: 160,
    },

    // Optional slug for pretty URLs (unique but sparse to avoid issues if missing)
    slug: { type: String, trim: true, unique: true, sparse: true, index: true },

    description: { type: String, trim: true, maxlength: 4000 },

    // For sorting/filtering by date (frontend checks date | createdAt | updatedAt)
    date: { type: Date },
    // Optional human input (e.g., "Aug 2024"); will be parsed into date if possible
    dateText: { type: String, trim: true, maxlength: 120 },

    // Tech stack: accept array or CSV string, store as unique trimmed array
    tech: {
      type: [String],
      default: [],
      set: (val) => {
        if (Array.isArray(val)) {
          return [...new Set(val.map((t) => String(t).trim()).filter(Boolean))];
        }
        if (typeof val === "string") {
          return [
            ...new Set(
              val
                .split(/[,\n]/)
                .map((t) => t.trim())
                .filter(Boolean)
            ),
          ];
        }
        return [];
      },
    },

    // Optional tags for filtering (frontend uses getTags which checks tags OR tech)
    tags: {
      type: [String],
      default: [],
      set: (arr) =>
        Array.isArray(arr)
          ? [...new Set(arr.map((t) => String(t).trim()).filter(Boolean))]
          : [],
    },

    // Optional image for the card
    image: {
      type: String,
      trim: true,
      validate: { validator: (v) => !v || URL_REGEX.test(v), message: "Invalid URL" },
    },

    // Live links (frontend checks: link | url | demo)
    link: { type: String, trim: true, validate: { validator: (v) => !v || URL_REGEX.test(v), message: "Invalid URL" } },
    url: { type: String, trim: true, validate: { validator: (v) => !v || URL_REGEX.test(v), message: "Invalid URL" } },
    demo: { type: String, trim: true, validate: { validator: (v) => !v || URL_REGEX.test(v), message: "Invalid URL" } },

    // Code links (frontend checks: github | repo | source)
    github: { type: String, trim: true, validate: { validator: (v) => !v || URL_REGEX.test(v), message: "Invalid URL" } },
    repo: { type: String, trim: true, validate: { validator: (v) => !v || URL_REGEX.test(v), message: "Invalid URL" } },
    source: { type: String, trim: true, validate: { validator: (v) => !v || URL_REGEX.test(v), message: "Invalid URL" } },
  },
  { timestamps: true, versionKey: false }
);

// Derive slug, parse dateText, and normalize arrays before save
ProjectSchema.pre("validate", function (next) {
  if (!this.slug && this.name) {
    this.slug = slugify(this.name).slice(0, 120);
  }
  next();
});

ProjectSchema.pre("save", function (next) {
  // Fill tags from tech if tags not provided
  if ((!this.tags || this.tags.length === 0) && Array.isArray(this.tech) && this.tech.length) {
    this.tags = [...new Set(this.tech)];
  }

  // Parse dateText into date if possible
  if (!this.date && this.dateText) {
    const d = new Date(this.dateText);
    if (!isNaN(d.getTime())) this.date = d;
  }

  next();
});

// Useful indexes
ProjectSchema.index({ createdAt: -1 });
ProjectSchema.index({ date: -1 });
ProjectSchema.index({ name: "text", description: "text", tags: "text", tech: "text" });

// Clean JSON (id instead of _id)
ProjectSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

module.exports = mongoose.model("Project", ProjectSchema);