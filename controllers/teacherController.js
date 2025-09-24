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
        const { email, password } = req.body;

        const teacher = await Teacher.findOne({ email });
        if (!teacher) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        const isMatch = await bcrypt.compare(password, teacher.passwordHash);
        if (!isMatch) {
            return res.status(401).json({ message: "Invalid credentials" });
        }

        res.json({
            _id: teacher._id,
            name: teacher.name,
            email: teacher.email,
            token: generateToken(teacher._id)
        });

    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};


const getProfile = async (req, res, next) => {
    try {
        const teacher = await Teacher.findById(req.user._id)
            .populate("subjects", "name code") // populate subject details
            .populate("classes", "name"); // if you store class refs

        if (!teacher) {
            return res.status(404).json({ message: "Teacher not found" });
        }

        res.status(200).json({
            id: teacher._id,
            name: teacher.name,
            email: teacher.email,
            subjects: teacher.subjects,
            classes: teacher.classes,
        });
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

module.exports = {
    registerTeacher,
    loginTeacher,
    getProfile,
    updateProfile,
};

