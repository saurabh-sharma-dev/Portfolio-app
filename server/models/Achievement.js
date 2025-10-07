// models/Achievement.js
const mongoose = require("mongoose");

// Simple URL validator
const URL_REGEX =
  /^(https?:\/\/)([\w-]+(\.[\w-]+)+)(:[0-9]{1,5})?(\/[^\s]*)?$/i;

const AchievementSchema = new mongoose.Schema(
  {
    // Required
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      maxlength: 180,
    },

    // Optional content
    description: {
      type: String,
      trim: true,
      maxlength: 2000,
    },

    // Normalized date used for sorting/filtering
    date: {
      type: Date,
    },

    // Keep original human-readable date if you want to display it as-is
    dateText: {
      type: String,
      trim: true,
      maxlength: 120,
    },

    // Badge/category shown on the card
    category: {
      type: String,
      trim: true,
      maxlength: 60,
    },

    // Tags used for chips and filtering
    tags: {
      type: [String],
      default: [],
      set: (arr) =>
        Array.isArray(arr)
          ? [...new Set(arr.map((t) => String(t).trim()).filter(Boolean))]
          : [],
    },

    // Optional links (frontend already supports these keys)
    link: {
      type: String,
      trim: true,
      validate: {
        validator: (v) => !v || URL_REGEX.test(v),
        message: "Invalid URL",
      },
    },
    certificate: {
      type: String,
      trim: true,
      validate: {
        validator: (v) => !v || URL_REGEX.test(v),
        message: "Invalid URL",
      },
    },
    url: {
      type: String,
      trim: true,
      validate: {
        validator: (v) => !v || URL_REGEX.test(v),
        message: "Invalid URL",
      },
    },

    // Optional image for the card
    image: {
      type: String,
      trim: true,
      validate: {
        validator: (v) => !v || URL_REGEX.test(v),
        message: "Invalid URL",
      },
    },
  },
  { timestamps: true, versionKey: false }
);

// Normalize tags + derive date from dateText if needed
AchievementSchema.pre("save", function (next) {
  if (Array.isArray(this.tags)) {
    this.tags = [...new Set(this.tags.map((t) => String(t).trim()).filter(Boolean))];
  }

  // If date is missing but dateText is provided, try to parse it
  if (!this.date && this.dateText) {
    const d = new Date(this.dateText);
    if (!isNaN(d.getTime())) {
      this.date = d;
    }
  }

  next();
});

// Helpful indexes
AchievementSchema.index({ createdAt: -1 });
AchievementSchema.index({ date: -1 });
AchievementSchema.index({ category: 1 });
AchievementSchema.index({ title: "text", description: "text", tags: "text", category: "text" });

// Clean JSON shape (id instead of _id)
AchievementSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

module.exports = mongoose.model("Achievement", AchievementSchema);