const Teacher = require("../models/Teacher");
const bcrypt = require("bcryptjs");
const generateToken = require("../utils/generateToken");

// @desc    Register new teacher
// @route   POST /api/teachers/register
// @access  Public
const registerTeacher = async (req, res) => {
    try {
        const { name, email, password } = req.body;

        // Check if teacher exists
        const existingTeacher = await Teacher.findOne({ email });
        if (existingTeacher) {
            return res.status(400).json({ message: "Teacher already exists" });
        }

        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const teacher = await Teacher.create({
            name,
            email,
            passwordHash
        });

        // Send back token
        res.status(201).json({
            _id: teacher._id,
            name: teacher.name,
            email: teacher.email,
            token: generateToken(teacher._id)
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// @desc    Login teacher
// @route   POST /api/teachers/login
// @access  Public
const loginTeacher = async (req, res) => {
    try {
        const { email, password, role } = req.body;

        const teacher = await Teacher.findOne({ email });
        if (!teacher) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        // Check role matches
        if (role && teacher.role !== role) {
            return res.status(401).json({ message: "Role does not match credentials" });
        }

        const isMatch = await bcrypt.compare(password, teacher.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        res.json({
            _id: teacher._id,
            name: teacher.name,
            email: teacher.email,
            role: teacher.role,
            token: generateToken(teacher._id)
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


const getProfile = async (req, res, next) => {
    try {
        // Correctly populate 'classIds' and 'subjectIds'
        const teacher = await Teacher.findById(req.user._id)
            .populate("classIds", "name") // Changed from "classes"
            .populate("subjectIds", "name code"); // Changed from "subjects"

        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }

        res.status(200).json({
            id: teacher._id,
            name: teacher.name,
            email: teacher.email,
            // Use the correct property names in the response
            classes: teacher.classIds,
            subjects: teacher.subjectIds,
        });
    } catch (error) {
        next(error);
    }
};

const getAllTeachers = async (req, res, next) => {
    try {
        const teachers = await Teacher.find({}).populate('classIds', 'name').populate('subjectIds', 'name');
        res.status(200).json(teachers);
    } catch (error) {
        next(error);
    }
};


// @desc    Update teacher profile
// @route   PUT /api/teachers/profile
// @access  Private (teacher only)
const updateProfile = async (req, res, next) => {
    try {
        const teacher = await Teacher.findById(req.user._id);

        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }

        // Update fields if provided
        teacher.name = req.body.name || teacher.name;
        teacher.email = req.body.email || teacher.email;

        // Password update (if supported)
        if (req.body.password) {
            teacher.password = req.body.password; // pre-save hook will hash
        }

        const updatedTeacher = await teacher.save();

        res.status(200).json({
            id: updatedTeacher._id,
            name: updatedTeacher.name,
            email: updatedTeacher.email,
            subjects: updatedTeacher.subjects,
            classes: updatedTeacher.classes,
        });
    } catch (error) {
        next(error);
    }
};

const assignToTeacher = async (req, res, next) => {
    try {
        const { classIds, subjectIds } = req.body;

        // Prepare the update operation
        const updateOperation = {
            $addToSet: {}
        };

        // Add classIds to the operation if they are provided
        if (classIds && classIds.length > 0) {
            updateOperation.$addToSet.classIds = { $each: classIds };
        }

        // Add subjectIds to the operation if they are provided
        if (subjectIds && subjectIds.length > 0) {
            updateOperation.$addToSet.subjectIds = { $each: subjectIds };
        }

        // If there's nothing to update, just return the teacher
        if (!updateOperation.$addToSet.classIds && !updateOperation.$addToSet.subjectIds) {
            const teacher = await Teacher.findById(req.user._id);
            return res.status(200).json(teacher);
        }

        const teacher = await Teacher.findByIdAndUpdate(
            req.user._id,
            updateOperation,
            { new: true } // This option returns the updated document
        );

        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }

        res.status(200).json({ message: "Assignments updated successfully", teacher });
    } catch (error) {
        next(error);
    }
};

// Update teacher (admin only)
const updateTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        const updates = req.body;
        if (updates.password) {
            const salt = await bcrypt.genSalt(10);
            updates.passwordHash = await bcrypt.hash(updates.password, salt);
            delete updates.password;
        }
        const updatedTeacher = await Teacher.findByIdAndUpdate(id, updates, { new: true });
        if (!updatedTeacher) return res.status(404).json({ message: "Teacher not found" });
        res.status(200).json({ message: "Teacher updated", teacher: updatedTeacher });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Delete teacher (admin only)
const deleteTeacher = async (req, res) => {
    try {
        const { id } = req.params;
        const deletedTeacher = await Teacher.findByIdAndDelete(id);
        if (!deletedTeacher) return res.status(404).json({ message: "Teacher not found" });
        res.status(200).json({ message: "Teacher deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Make sure it's exported
module.exports = {
    registerTeacher,
    loginTeacher,
    getProfile,
    updateProfile,
    assignToTeacher, // Ensure this is exported
    getAllTeachers,
    updateTeacher,
    deleteTeacher
};

