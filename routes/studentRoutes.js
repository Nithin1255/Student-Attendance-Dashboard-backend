const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware"); // 1. Import middleware

const {
    addStudent,
    getStudents,
    getStudentById,
    getStudentsByClass,
    updateStudent,
    deleteStudent,
} = require("../controllers/studentController");

// Routes
router.post("/", addStudent);
router.get("/", getStudents);
router.get("/:id", getStudentById);
router.get("/class/:classId", protect, getStudentsByClass);
router.put("/:id", updateStudent);
router.delete("/:id", deleteStudent);

module.exports = router;
