const Attendance = require("../models/Attendance");
const Student = require("../models/Student");

/**
 * @desc    Mark or update attendance for multiple students
 * @route   POST /api/attendance/mark
 * @access  Private (Teacher)
 */
exports.markAttendance = async (req, res) => {
    const { date, subjectId, classId, session, records } = req.body; // records = [{ studentId, status }, ...]

    if (!date || !subjectId || !classId || !records || !Array.isArray(records)) {
        return res.status(400).json({ message: "Missing required fields. date, classId, subjectId and records are required." });
    }

    try {
        // Normalize date to midnight
        const normalizedDate = new Date(date);
        normalizedDate.setHours(0, 0, 0, 0);

        const operations = records.map(({ studentId, status }) => ({
            updateOne: {
                filter: { classId, studentId, subjectId, date: normalizedDate, session: session || 'Default' },
                update: { $set: { status, classId, subjectId, studentId, date: normalizedDate, session: session || 'Default' } },
                upsert: true, // Creates a new document if one doesn't exist
            },
        }));

        await Attendance.bulkWrite(operations, { ordered: false });

        res.status(201).json({ message: "Attendance marked successfully" });
    } catch (error) {
        console.error("Error marking attendance:", error);
        res.status(500).json({ message: "Server error while marking attendance." });
    }
};

/**
 * @desc    Get attendance for a specific class on a given date
 * @route   GET /api/attendance?date=...&classId=...
 * @access  Private (Teacher)
 */
exports.getAttendance = async (req, res) => {
    const { date, classId, subjectId } = req.query;

    if (!date || !classId) {
        return res.status(400).json({ message: "Date and Class ID are required." });
    }

    try {
        // Find all students in the given class
        const students = await Student.find({ classId }).select("_id name rollNo");

        // Normalize date to midnight for querying
        const normalizedDate = new Date(date);
        normalizedDate.setHours(0, 0, 0, 0);
        const dayEnd = new Date(normalizedDate);
        dayEnd.setHours(23, 59, 59, 999);

        // Get existing attendance records for those students on that date and optionally subject
        const studentIds = students.map(s => s._id);
        const filter = {
            studentId: { $in: studentIds },
            date: { $gte: normalizedDate, $lte: dayEnd },
        };
        if (subjectId) filter.subjectId = subjectId;

        const attendanceRecords = await Attendance.find(filter).lean();

        // Map records for easy lookup (if multiple sessions exist, prefer the one matching session or first)
        const attendanceMap = new Map();
        attendanceRecords.forEach(rec => {
            attendanceMap.set(rec.studentId.toString(), rec.status);
        });

        // Combine student list with their attendance status
        const response = students.map(student => ({
            studentId: student._id,
            name: student.name,
            rollNo: student.rollNo,
            status: attendanceMap.get(student._id.toString()) || "Absent", // Default to Absent
        }));

        res.status(200).json(response);
    } catch (error) {
        console.error("Error fetching attendance:", error);
        res.status(500).json({ message: "Server error" });
    }
};


/**
 * @desc    Generate an attendance report
 * @route   GET /api/attendance/report?classId=...&subjectId=...&from=...&to=...
 * @access  Private (Teacher)
 */
exports.getAttendanceReport = async (req, res) => {
    const { classId, subjectId, from, to } = req.query;

    if (!classId || !from || !to) {
        return res.status(400).json({ message: "Class ID and date range are required." });
    }

    try {
        const students = await Student.find({ classId }).select("name");
        const studentIds = students.map(s => s._id);

        const attendance = await Attendance.find({
            studentId: { $in: studentIds },
            subjectId, // Optional: filter by subject
            date: { $gte: new Date(from), $lte: new Date(to) },
        }).populate("studentId", "name");

        // Simple aggregation for demonstration
        const report = students.map(student => {
            const studentRecords = attendance.filter(
                a => a.studentId._id.toString() === student._id.toString()
            );
            const presentCount = studentRecords.filter(r => r.status === "Present").length;
            const total = studentRecords.length;

            return {
                name: student.name,
                present: presentCount,
                total,
                percentage: total > 0 ? (presentCount / total) * 100 : 0,
            };
        });

        res.status(200).json(report);
    } catch (error) {
        console.error("Error generating report:", error);
        res.status(500).json({ message: "Server error" });
    }
};

/**
 * @desc    Get daily present counts (trend) for a class and subject over a date range
 * @route   GET /api/attendance/trends?classId=...&subjectId=...&from=...&to=...
 * @access  Private (Teacher)
 */
exports.getAttendanceTrends = async (req, res) => {
    const { classId, subjectId, from, to } = req.query;

    if (!classId || !from || !to) {
        return res.status(400).json({ message: "Class ID and date range are required." });
    }

    try {
        // Get students in class
        const students = await Student.find({ classId }).select("_id");
        const studentIds = students.map(s => s._id);
        const total = studentIds.length;

        // Aggregate present counts per date
        const match = {
            studentId: { $in: studentIds },
            status: 'Present',
            date: { $gte: new Date(from), $lte: new Date(to) },
        };
        if (subjectId) match.subjectId = subjectId;

        const agg = await Attendance.aggregate([
            { $match: match },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    presentCount: { $sum: 1 },
                }
            },
            { $sort: { '_id': 1 } }
        ]);

        // Build full date list and map results
        const start = new Date(from);
        const end = new Date(to);
        const dates = [];
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            const iso = d.toISOString().split('T')[0];
            dates.push(iso);
        }

        const countsMap = new Map(agg.map(a => [a._id, a.presentCount]));
        const response = dates.map(dt => ({ date: dt, presentCount: countsMap.get(dt) || 0, total }));

        res.status(200).json(response);
    } catch (error) {
        console.error('Error generating attendance trends:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * @desc    Get daily attendance percentage for a class & subject over a date range
 * @route   GET /api/attendance/report/daily?classId=...&subjectId=...&from=...&to=...
 * @access  Private (Teacher)
 */
exports.getDailyAttendanceReport = async (req, res) => {
    const { classId, subjectId, from, to } = req.query;

    if (!classId || !from || !to) {
        return res.status(400).json({ message: 'Class ID and date range are required.' });
    }

    try {
        // Get class strength (number of students in class)
        const students = await Student.find({ classId }).select('_id').lean();
        const studentIds = students.map(s => s._id);
        const classStrength = studentIds.length;

        // Build match for aggregation
        const match = {
            studentId: { $in: studentIds },
            date: { $gte: new Date(from), $lte: new Date(to) },
        };
        if (subjectId) match.subjectId = subjectId;

        // Aggregate present counts per day (single query)
        const agg = await Attendance.aggregate([
            { $match: match },
            {
                $group: {
                    _id: { $dateToString: { format: "%Y-%m-%d", date: "$date" } },
                    presentCount: { $sum: { $cond: [{ $eq: ["$status", "Present"] }, 1, 0] } },
                }
            },
            { $sort: { _id: 1 } }
        ]);

        // Build full date list between from and to inclusive
        const start = new Date(from);
        const end = new Date(to);
        start.setHours(0, 0, 0, 0);
        end.setHours(0, 0, 0, 0);

        const dates = [];
        for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
            dates.push(new Date(d).toISOString().split('T')[0]);
        }

        const countsMap = new Map(agg.map(a => [a._id, a.presentCount]));

        const results = dates.map(dt => {
            const presentCount = countsMap.get(dt) || 0;
            const percentage = classStrength > 0 ? (presentCount / classStrength) * 100 : 0;
            const dayNum = new Date(dt).getDate();
            return {
                date: dt,
                day: dayNum,
                presentCount,
                classStrength,
                percentage,
            };
        });

        res.status(200).json(results);
    } catch (error) {
        console.error('Error generating daily report:', error);
        res.status(500).json({ message: 'Server error' });
    }
};

/**
 * @desc Debug: return raw attendance documents for given class/subject/date range
 * @route GET /api/attendance/debug?classId=...&subjectId=...&from=...&to=...
 * @access Private
 */
exports.debugAttendance = async (req, res) => {
    const { classId, subjectId, from, to } = req.query;
    try {
        const filter = {};
        if (classId) filter.classId = classId;
        if (subjectId) filter.subjectId = subjectId;
        if (from && to) filter.date = { $gte: new Date(from), $lte: new Date(to) };
        else if (from) filter.date = { $gte: new Date(from) };
        else if (to) filter.date = { $lte: new Date(to) };

        const docs = await Attendance.find(filter).lean();
        res.status(200).json(docs);
    } catch (err) {
        console.error('Debug attendance error:', err);
        res.status(500).json({ message: 'Server error' });
    }
}