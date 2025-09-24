const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: "Student", required: true },
    subjectId: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    date: { type: Date, required: true },
    session: { type: String, required: true }, // e.g. "Period 1", "Morning"
    status: { type: String, enum: ["Present", "Absent"], required: true }
}, { timestamps: true });

// ✅ Prevent duplicate entries for same student, subject, date, and session
attendanceSchema.index({ studentId: 1, subjectId: 1, date: 1, session: 1 }, { unique: true });

module.exports = mongoose.model("Attendance", attendanceSchema);