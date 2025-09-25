#!/usr/bin/env node
/**
 * repairRelations.js
 * Safe repair script to:
 * - remove nulls from Subject.teacherIds and Subject.classIds
 * - remove nulls from Teacher.classIds and Teacher.subjectIds
 * - backfill Attendance.classId from Student.classId when missing
 * - report actions taken
 *
 * Run with: node scripts/repairRelations.js (ensure MONGO_URI is set in env)
 */

const mongoose = require('mongoose');
const Subject = require('../models/Subject');
const Teacher = require('../models/Teacher');
const Attendance = require('../models/Attendance');
const Student = require('../models/Student');

async function main() {
    const uri = process.env.MONGO_URI || process.env.MONGO_URL;
    if (!uri) {
        console.error('MONGO_URI not set. Set it in environment before running this script.');
        process.exit(1);
    }

    await mongoose.connect(uri);
    console.log('Connected to MongoDB');

    try {
        // 1) Remove null entries from Subject arrays
        const subResult = await Subject.updateMany({}, { $pull: { teacherIds: null, classIds: null } });
        console.log('Subjects cleaned:', subResult.modifiedCount || subResult.nModified || subResult.ok || subResult);

        // 2) Remove null entries from Teacher arrays
        const teachResult = await Teacher.updateMany({}, { $pull: { classIds: null, subjectIds: null } });
        console.log('Teachers cleaned:', teachResult.modifiedCount || teachResult.nModified || teachResult.ok || teachResult);

        // 3) Backfill Attendance.classId when missing using Student.classId
        const missingClassDocs = await Attendance.find({ $or: [{ classId: { $exists: false } }, { classId: null }] }).lean();
        console.log('Attendance docs missing classId:', missingClassDocs.length);

        let backfilled = 0;
        for (const doc of missingClassDocs) {
            try {
                if (!doc.studentId) continue;
                const student = await Student.findById(doc.studentId).select('classId').lean();
                if (student && student.classId) {
                    await Attendance.updateOne({ _id: doc._id }, { $set: { classId: student.classId } });
                    backfilled++;
                } else {
                    // could not find student's classId
                }
            } catch (e) {
                console.error('Error backfilling doc', doc._id, e.message);
            }
        }
        console.log('Attendance backfilled count:', backfilled);

        // 4) Ensure status values are valid (Present or Absent). If other values exist, set to Absent and log.
        const invalidStatusDocs = await Attendance.find({ status: { $nin: ['Present', 'Absent'] } }).lean();
        console.log('Attendance docs with invalid status:', invalidStatusDocs.length);
        let fixedStatus = 0;
        for (const doc of invalidStatusDocs) {
            await Attendance.updateOne({ _id: doc._id }, { $set: { status: 'Absent' } });
            fixedStatus++;
        }
        console.log('Fixed invalid status count:', fixedStatus);

        console.log('Repair completed. Please verify data and indexes.');
    } catch (err) {
        console.error('Error running repair:', err);
    } finally {
        await mongoose.disconnect();
        process.exit(0);
    }
}

main();
