// models/Subject.js
const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema({
    name: { type: String, required: true }, // e.g. "Mathematics"
    code: { type: String, required: true, unique: true }, // e.g. "MATH101"

    classIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }],
    teacherIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Teacher" }]
}, { timestamps: true });

module.exports = mongoose.model("Subject", subjectSchema);