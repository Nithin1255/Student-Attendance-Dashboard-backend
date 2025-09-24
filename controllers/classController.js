const Class = require("../models/Class");

// Add a new class
exports.addClass = async (req, res) => {
    try {
        const { name } = req.body;

        // Check if class exists
        const existingClass = await Class.findOne({ name });
        if (existingClass) {
            return res.status(400).json({ message: "Class already exists" });
        }

        const newClass = new Class({ name });
        await newClass.save();

        res.status(201).json({ message: "Class created successfully", class: newClass });
    } catch (error) {
        res.status(500).json({ message: "Error creating class", error: error.message });
    }
};

// Get all classes
exports.getClasses = async (req, res) => {
    try {
        const classes = await Class.find();
        res.status(200).json(classes);
    } catch (error) {
        res.status(500).json({ message: "Error fetching classes", error: error.message });
    }
};

// Get class by ID
exports.getClassById = async (req, res) => {
    try {
        const { id } = req.params;
        const foundClass = await Class.findById(id);

        if (!foundClass) {
            return res.status(404).json({ message: "Class not found" });
        }

        res.status(200).json(foundClass);
    } catch (error) {
        res.status(500).json({ message: "Error fetching class", error: error.message });
    }
};

// Update class
exports.updateClass = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;

        const updatedClass = await Class.findByIdAndUpdate(id, updates, { new: true });

        if (!updatedClass) {
            return res.status(404).json({ message: "Class not found" });
        }

        res.status(200).json({ message: "Class updated successfully", class: updatedClass });
    } catch (error) {
        res.status(500).json({ message: "Error updating class", error: error.message });
    }
};

// Delete class
exports.deleteClass = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedClass = await Class.findByIdAndDelete(id);

        if (!deletedClass) {
            return res.status(404).json({ message: "Class not found" });
        }

        res.status(200).json({ message: "Class deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting class", error: error.message });
    }
};
