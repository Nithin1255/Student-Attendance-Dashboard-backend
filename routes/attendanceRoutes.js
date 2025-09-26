const express = require("express");
const router = express.Router();
const {
    markAttendance,
    getAttendance,
    getAttendanceReport,
    getAttendanceTrends,
    getDailyAttendanceReport,
    debugAttendance,
    getStudentAttendanceReport,
    getMasterReport,
} = require("../controllers/attendanceController");
const authMiddleware = require("../middleware/authMiddleware");

// Protected routes (teacher access only)
router.use(authMiddleware);

// Mark attendance for a class
router.post("/mark", markAttendance);

// Get attendance for a specific class on a specific date
router.get("/", getAttendance);

// Get a report for a class
router.get("/report", getAttendanceReport);
router.get("/report/daily", getDailyAttendanceReport);
router.get('/debug', debugAttendance);
// Get trends (daily present count)
router.get("/trends", getAttendanceTrends);
router.get("/student/:studentId/report", getStudentAttendanceReport);

router.get("/master-report", getMasterReport);


module.exports = router;