const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const teacherRoutes = require("./routes/teacherRoutes.js");
const studentRoutes = require("./routes/studentRoutes.js");
const classRoutes = require("./routes/classRoutes.js");
const subjectRoutes = require("./routes/subjectRoutes.js");
const attendanceRoutes = require("./routes/attendanceRoutes.js");
const adminRoutes = require("./routes/adminRoutes.js");


dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

app.get("/", (req, res) => {
    res.status(200).json({ message: "Welcome to the Student Attendance Dashboard Backend!" });
});

// Routes
app.use("/api/teacher", teacherRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/class", classRoutes);
app.use("/api/subject", subjectRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/admin", adminRoutes);

// Global error handling
app.use((err, req, res, next) => {
    res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));