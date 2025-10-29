import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { createServer } from "http";

import { initSockets } from "./sockets/socket.js";
import { startAlertsCron } from "./jobs/alerts.job.js";

import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import teacherRoutes from "./routes/teacherRoutes.js";
import teacherAppRoutes from "./routes/teacherAppRoutes.js";
import courseRoutes from "./routes/courseRoutes.js";
import enrollmentRoutes from "./routes/enrollmentRoutes.js";
import modalityRoutes from "./routes/modalityRoutes.js";
import activityRoutes from "./routes/activityRoutes.js";
import gradeRoutes from "./routes/gradeRoutes.js";
import attendanceRoutes from "./routes/attendanceRoutes.js";
import reportsRoutes from "./routes/reportsRoutes.js";
import classroomRoutes from "./routes/classroomRoutes.js";
import gradePolicyRoutes from "./routes/gradePolicyRoutes.js";
import holidayRoutes from "./routes/holidayRoutes.js";
import termRoutes from "./routes/termRoutes.js";
import programRoutes from "./routes/programRoutes.js";
import scheduleRoutes from "./routes/scheduleRoutes.js";
import riskRoutes from "./routes/riskRoutes.js";
import alertRoutes from "./routes/alertRoutes.js";
import notificationRoutes from "./routes/notificationRoutes.js";
import mobileRoutes from "./routes/mobileRoutes.js";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(
  cors({
    origin: "http://localhost:8080",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/students", studentRoutes);
app.use("/api/teachers", teacherRoutes);
app.use("/api/teacher", teacherAppRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/modalities", modalityRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/grades", gradeRoutes);
app.use("/api/attendance", attendanceRoutes);
app.use("/api/classrooms", classroomRoutes);
app.use("/api/grade-policies", gradePolicyRoutes);
app.use("/api/holidays", holidayRoutes);
app.use("/api/reports", reportsRoutes);
app.use("/api/terms", termRoutes);
app.use("/api/programs", programRoutes);
app.use("/api/schedules", scheduleRoutes);
app.use("/api/risks", riskRoutes);
app.use("/api/alerts", alertRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/mobile", mobileRoutes);
const server = createServer(app);
initSockets(server);
startAlertsCron();

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
