const express = require("express");
const router = express.Router();
const {
    createSubject,
    getAllSubjects,
    getSubjectById,
    updateSubject,
    deleteSubject
} = require("../controllers/subjectController");

// CRUD Routes
router.post("/", createSubject);
router.get("/all-subjects", getAllSubjects);
router.get("/:id", getSubjectById);
router.put("/:id", updateSubject);
router.delete("/:id", deleteSubject);

module.exports = router;
