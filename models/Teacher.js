// models/Teacher.js
const mongoose = require("mongoose");

const teacherSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true }, // store bcrypt hash
    role: {
        type: String,
        enum: ["admin", "teacher"], // allowed roles
        default: "teacher"
    },
    classIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Class" }],
    // classes taught by teacher

    subjectIds: [{ type: mongoose.Schema.Types.ObjectId, ref: "Subject" }]
    // subjects handled by teacher
}, { timestamps: true });

module.exports = mongoose.model("Teacher", teacherSchema);
