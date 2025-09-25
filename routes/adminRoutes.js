const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { isAdmin } = require("../middleware/roleMiddleware");
const studentController = require("../controllers/studentController");
const teacherController = require("../controllers/teacherController");
const classController = require("../controllers/classController");
const subjectController = require("../controllers/subjectController");
const relationshipController = require("../controllers/relationshipController");

// --- TEACHER CRUD ---
router.post("/teacher", protect, isAdmin, teacherController.registerTeacher);
router.put("/teacher/:id", protect, isAdmin, teacherController.updateTeacher); // You need to implement updateTeacher
router.delete("/teacher/:id", protect, isAdmin, teacherController.deleteTeacher); // You need to implement deleteTeacher

// --- CLASS CRUD ---
router.post("/class", protect, isAdmin, classController.addClass);
router.get("/class/:id/students", protect, isAdmin, studentController.getStudentsByClass);
router.put("/class/:id", protect, isAdmin, classController.updateClass);
router.delete("/class/:id", protect, isAdmin, classController.deleteClass);

// --- SUBJECT CRUD ---
router.post("/subject", protect, isAdmin, subjectController.createSubject);
router.put("/subject/:id", protect, isAdmin, subjectController.updateSubject);
router.delete("/subject/:id", protect, isAdmin, subjectController.deleteSubject);

// --- RELATIONSHIPS ---
router.post("/teacher/add-class", protect, isAdmin, relationshipController.addClassToTeacher);
router.post("/teacher/remove-class", protect, isAdmin, relationshipController.removeClassFromTeacher);
router.post("/teacher/add-subject", protect, isAdmin, relationshipController.addSubjectToTeacher);
router.post("/teacher/remove-subject", protect, isAdmin, relationshipController.removeSubjectFromTeacher);

module.exports = router;
