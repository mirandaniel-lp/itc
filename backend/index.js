import express from "express";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import fs from "fs";
import admin from "firebase-admin";
import { fileURLToPath } from "url";
import { dirname } from "path";
import { createServer } from "http";
import { initSockets } from "./sockets/socket.js";
import { startAlertsCron } from "./jobs/alerts.job.js";
import { startIForestCron } from "./jobs/iforest.job.js";
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
import profileRoutes from "./routes/profileRoutes.js";
import iforestEvalRoutes from "./routes/iforestEvalRoutes.js";
import mobileNotificationsRoutes from "./routes/mobileNotificationsRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js";
import auditRoutes from "./routes/auditRoutes.js";
import { auditMiddleware } from "./middlewares/auditMiddleware.js";

dotenv.config();

const saPath = process.env.FIREBASE_SERVICE_ACCOUNT_PATH || "";
if (!saPath) {
  console.warn(
    "FIREBASE_SERVICE_ACCOUNT_PATH no encontrado — firebase-admin no encontrado"
  );
} else {
  const full = path.isAbsolute(saPath)
    ? saPath
    : path.join(process.cwd(), saPath);
  try {
    const raw = fs.readFileSync(full, "utf8");
    const serviceAccount = JSON.parse(raw);
    admin.initializeApp({ credential: admin.credential.cert(serviceAccount) });
  } catch (e) {
    console.error("Falló al inicializar", full, e);
    process.exit(1);
  }
}

const app = express();
const PORT = 3000;

app.use(
  cors({
    origin: "http://localhost:8080",
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(auditMiddleware);

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
app.use("/api/profile", profileRoutes);
app.use("/api/iforest-eval", iforestEvalRoutes);
app.use("/api/mobile/notifications", mobileNotificationsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/audit", auditRoutes);

const server = createServer(app);
initSockets(server);
startAlertsCron();
startIForestCron();

server.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
