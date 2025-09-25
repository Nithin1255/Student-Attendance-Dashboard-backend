const express = require("express");
const router = express.Router();
const { registerTeacher, loginTeacher, getProfile, updateProfile, assignToTeacher, getAllTeachers } = require("../controllers/teacherController");
const protect = require("../middleware/authMiddleware"); // JWT middleware


router.post("/register", registerTeacher);
router.post("/login", loginTeacher);
router.get("/profile", protect, getProfile);
router.get("/all-teachers", getAllTeachers);
router.put("/profile", protect, updateProfile);
router.put("/assign", protect, assignToTeacher);

module.exports = router;
