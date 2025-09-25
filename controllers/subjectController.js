const Subject = require("../models/Subject");
const Teacher = require("../models/Teacher");
const Class = require("../models/Class");

// @desc Create new subject
// @route POST /api/subjects
// @access Private (teacher/admin)
const createSubject = async (req, res, next) => {
    try {
        const { name, code, teacherId, classId } = req.body;

        // Validation
        if (!name || !code) {
            return res.status(400).json({ message: "All fields are required" });
        }


        // Create subject
        const subject = new Subject({
            name,
            code,
            teacherIds: [teacherId],  // store as array for multiple teachers
            classIds: [classId],      // store as array for multiple classes
        });

        await subject.save();

        res.status(201).json({ message: "Subject created successfully", subject });
    } catch (error) {
        next(error);
    }
};

// @desc Get all subjects
// @route GET /api/subjects
const getAllSubjects = async (req, res, next) => {
    try {
        const subjects = await Subject.find()
            .populate("teacherIds", "name email")
            .populate("classIds", "name");
        res.status(200).json(subjects);
    } catch (error) {
        next(error);
    }
};

// @desc Get subject by ID
// @route GET /api/subjects/:id
const getSubjectById = async (req, res, next) => {
    try {
        const subject = await Subject.findById(req.params.id)
            .populate("teacherIds", "name email")
            .populate("classIds", "name");

        if (!subject) return res.status(404).json({ message: "Subject not found" });

        res.status(200).json(subject);
    } catch (error) {
        next(error);
    }
};

// @desc Update subject
// @route PUT /api/subjects/:id
const updateSubject = async (req, res, next) => {
    try {
        const { name, code, teacherId, classId } = req.body;

        const subject = await Subject.findById(req.params.id);
        if (!subject) return res.status(404).json({ message: "Subject not found" });

        if (teacherId) subject.teacherIds = [teacherId];
        if (classId) subject.classIds = [classId];
        if (name) subject.name = name;
        if (code) subject.code = code;

        const updatedSubject = await subject.save();

        res.status(200).json({ message: "Subject updated", subject: updatedSubject });
    } catch (error) {
        next(error);
    }
};

// @desc Delete subject
// @route DELETE /api/subjects/:id
const deleteSubject = async (req, res, next) => {
    try {
        const subject = await Subject.findByIdAndDelete(req.params.id);
        if (!subject) return res.status(404).json({ message: "Subject not found" });

        res.status(200).json({ message: "Subject deleted successfully" });
    } catch (error) {
        next(error);
    }
};

module.exports = {
    createSubject,
    getAllSubjects,
    getSubjectById,
    updateSubject,
    deleteSubject,
};
