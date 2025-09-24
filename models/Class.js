// models/Class.js
const mongoose = require("mongoose");

const classSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true }, // e.g., "10A"
}, { timestamps: true });

module.exports = mongoose.model("Class", classSchema);