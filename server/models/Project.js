const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  tech: { type: String, required: true },
  link: { type: String, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Project", projectSchema);
