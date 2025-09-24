const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const connectDB = require("./config/db");
const teacherRoutes = require("./routes/teacherRoutes.js");
const studentRoutes = require("./routes/studentRoutes.js");
const classRoutes = require("./routes/classRoutes.js");
const subjectRoutes = require("./routes/subjectRoutes.js");
// const attendanceRoutes = require("./routes/attendanceRoutes.js");


dotenv.config();
connectDB();

const app = express();
app.use(express.json());
app.use(cors());

// Routes
app.use("/api/teacher", teacherRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/class", classRoutes);
app.use("/api/subject", subjectRoutes);
// app.use("/api/attendance", attendanceRoutes);

// Global error handling
app.use((err, req, res, next) => {
    res.status(500).json({ message: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));