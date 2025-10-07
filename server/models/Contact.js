// models/Contact.js
const mongoose = require("mongoose");

// Basic validators
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[\d+\-\s()]{7,20}$/;

const ContactSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
      minlength: 2,
      maxlength: 120,
      set: (v) => String(v || "").replace(/\s+/g, " ").trim(),
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      trim: true,
      lowercase: true,
      match: [EMAIL_REGEX, "Invalid email address"],
      index: true,
    },

    message: {
      type: String,
      required: [true, "Message is required"],
      trim: true,
      minlength: 10,
      maxlength: 5000,
    },

    // Optional fields (won't break your current frontend)
    subject: {
      type: String,
      trim: true,
      maxlength: 200,
    },

    phone: {
      type: String,
      trim: true,
      validate: {
        validator: (v) => !v || PHONE_REGEX.test(v),
        message: "Invalid phone number",
      },
    },

    // Workflow status for admin
    status: {
      type: String,
      enum: ["new", "read", "replied", "archived"],
      default: "new",
      index: true,
    },

    // Optional metadata (can be filled in controller)
    meta: {
      ip: { type: String, trim: true },
      userAgent: { type: String, trim: true },
      page: { type: String, trim: true }, // referrer page
    },
  },
  { timestamps: true, versionKey: false }
);

// Helpful indexes
ContactSchema.index({ createdAt: -1 });

// Clean JSON (id instead of _id)
ContactSchema.set("toJSON", {
  transform: (_doc, ret) => {
    ret.id = ret._id;
    delete ret._id;
    return ret;
  },
});

module.exports = mongoose.model("Contact", ContactSchema);