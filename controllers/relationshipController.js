// backend/controllers/relationshipController.js
const Teacher = require('../models/Teacher');
const Class = require('../models/Class');
const Subject = require('../models/Subject');

// Add a class to a teacher and a teacher to a class (many-to-many)
exports.addClassToTeacher = async (req, res) => {
    const { teacherId, classId } = req.body;
    try {
        await Teacher.findByIdAndUpdate(teacherId, { $addToSet: { classIds: classId } });
        await Class.findByIdAndUpdate(classId, { $addToSet: { teacherIds: teacherId } });
        res.json({ message: 'Class and Teacher linked successfully.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Remove a class from a teacher and a teacher from a class
exports.removeClassFromTeacher = async (req, res) => {
    const { teacherId, classId } = req.body;
    try {
        await Teacher.findByIdAndUpdate(teacherId, { $pull: { classIds: classId } });
        await Class.findByIdAndUpdate(classId, { $pull: { teacherIds: teacherId } });
        res.json({ message: 'Class and Teacher unlinked successfully.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Add a subject to a teacher and a teacher to a subject
exports.addSubjectToTeacher = async (req, res) => {
    const { teacherId, subjectId } = req.body;
    try {
        await Teacher.findByIdAndUpdate(teacherId, { $addToSet: { subjectIds: subjectId } });
        await Subject.findByIdAndUpdate(subjectId, { $addToSet: { teacherIds: teacherId } });
        res.json({ message: 'Subject and Teacher linked successfully.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

// Remove a subject from a teacher and a teacher from a subject
exports.removeSubjectFromTeacher = async (req, res) => {
    const { teacherId, subjectId } = req.body;
    try {
        await Teacher.findByIdAndUpdate(teacherId, { $pull: { subjectIds: subjectId } });
        await Subject.findByIdAndUpdate(subjectId, { $pull: { teacherIds: teacherId } });
        res.json({ message: 'Subject and Teacher unlinked successfully.' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};
