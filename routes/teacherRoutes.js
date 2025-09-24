const express = require("express");
const router = express.Router();
const { registerTeacher, loginTeacher, getProfile, updateProfile } = require("../controllers/teacherController");
const protect = require("../middleware/authMiddleware"); // JWT middleware


router.post("/register", registerTeacher);
router.post("/login", loginTeacher);
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

module.exports = router;
