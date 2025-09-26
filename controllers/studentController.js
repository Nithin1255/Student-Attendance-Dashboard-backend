const Student = require("../models/Student");
const Class = require("../models/Class");

// @desc    Add new student
// @route   POST /api/student
const addStudent = async (req, res, next) => {
    try {
        const { name, rollNo, classId } = req.body;

        // Validation
        if (!name || !rollNo || !classId) {
            return res.status(400).json({ message: "Name, rollNo, and classId are required" });
        }

        // Check if class exists
        const classExists = await Class.findById(classId);
        if (!classExists) {
            return res.status(404).json({ message: "Class not found" });
        }

        // Create student
        const newStudent = new Student({ name, rollNo, classId });
        await newStudent.save();

        res.status(201).json(newStudent);
    } catch (error) {
        next(error); // send to error handler
    }
};


// @desc    Get all students or by classId (query param)
// @route   GET /api/student?classId=...
const getStudents = async (req, res) => {
    try {
        const filter = {};
        if (req.query.classId) filter.classId = req.query.classId;
        const students = await Student.find(filter)
            .populate("classId", "name")
            .sort({ rollNo: 1 });
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ message: "Error fetching students", error: error.message });
    }
};

// @desc    Get single student by ID
// @route   GET /api/student/:id
const getStudentById = async (req, res) => {
    try {
        const student = await Student.findById(req.params.id).populate("classId", "name");
        if (!student) return res.status(404).json({ message: "Student not found" });

        res.status(200).json(student);
    } catch (error) {
        res.status(500).json({ message: "Error fetching student", error: error.message });
    }
};

// @desc    Get students by ClassId
// @route   GET /api/student/class/:classId
const getStudentsByClass = async (req, res) => {
    try {
        const { classId } = req.params; // <-- use id, not classId
        const students = await Student.find({ classId: classId }).populate("classId", "name");
        res.status(200).json(students);
    } catch (error) {
        res.status(500).json({ message: "Error fetching students by class", error: error.message });
    }
};

// @desc    Update student
// @route   PUT /api/student/:id
const updateStudent = async (req, res, next) => {
    try {
        const { name, rollNo, classId } = req.body;

        // Check class if provided
        if (classId) {
            const classExists = await Class.findById(classId);
            if (!classExists) {
                return res.status(404).json({ message: "Class not found" });
            }
        }

        const updatedStudent = await Student.findByIdAndUpdate(
            req.params.id,
            { name, rollNo, classId },
            { new: true, runValidators: true }
        );

        if (!updatedStudent) return res.status(404).json({ message: "Student not found" });

        res.status(200).json(updatedStudent);
    } catch (error) {
        next(error);
    }
};
// @desc    Delete student
// @route   DELETE /api/student/:id
const deleteStudent = async (req, res) => {
    try {
        const student = await Student.findByIdAndDelete(req.params.id);

        if (!student) return res.status(404).json({ message: "Student not found" });

        res.status(200).json({ message: "Student deleted successfully" });
    } catch (error) {
        res.status(500).json({ message: "Error deleting student", error: error.message });
    }
};

module.exports = {
    addStudent,
    getStudents,
    getStudentById,
    getStudentsByClass,
    updateStudent,
    deleteStudent,
};
