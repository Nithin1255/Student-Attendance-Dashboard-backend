const express = require("express");
const router = express.Router();
const classController = require("../controllers/classController");

// CRUD routes
router.post("/addClass", classController.addClass);        // Add a new class
router.get("/all-classes", classController.getClasses);       // Get all classes
router.get("/:id", classController.getClassById);  // Get class by ID
router.put("/:id", classController.updateClass);   // Update class
router.delete("/:id", classController.deleteClass);// Delete class

module.exports = router;
