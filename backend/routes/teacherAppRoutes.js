import { Router } from "express";
import { authenticateTeacher } from "../middlewares/teacherAuthMiddleware.js";
import {
  teacherLogin,
  teacherLogout,
  teacherCourses,
  teacherActivities,
  createActivity,
  updateActivity,
  deleteActivity,
  publishActivity,
  unpublishActivity,
  courseStudents,
  gradesByActivity,
  upsertGrades,
  publishGrades,
  attendanceByCourseDate,
  saveAttendanceByCourseDate,
  attendanceAllowed,
  attendanceMeta,
  weeklySchedule,
  teacherProfile,
  updateTeacherProfile,
  changeTeacherPin,
} from "../controllers/teacherAppController.js";

const router = Router();

router.post("/auth/login", teacherLogin);
router.post("/auth/logout", teacherLogout);
router.get("/courses", authenticateTeacher, teacherCourses);
router.get("/activities", authenticateTeacher, teacherActivities);
router.post("/activities", authenticateTeacher, createActivity);
router.put("/activities/:id", authenticateTeacher, updateActivity);
router.delete("/activities/:id", authenticateTeacher, deleteActivity);
router.post("/activities/:id/publish", authenticateTeacher, publishActivity);
router.post(
  "/activities/:id/unpublish",
  authenticateTeacher,
  unpublishActivity
);
router.get("/courses/:courseId/students", authenticateTeacher, courseStudents);
router.get(
  "/activities/:activityId/grades",
  authenticateTeacher,
  gradesByActivity
);
router.post(
  "/activities/:activityId/grades",
  authenticateTeacher,
  upsertGrades
);
router.post(
  "/activities/:activityId/grades/publish",
  authenticateTeacher,
  publishGrades
);
router.get(
  "/attendance/:courseId",
  authenticateTeacher,
  attendanceByCourseDate
);
router.post(
  "/attendance/:courseId",
  authenticateTeacher,
  saveAttendanceByCourseDate
);
router.get(
  "/attendance/:courseId/allowed",
  authenticateTeacher,
  attendanceAllowed
);
router.get("/attendance/:courseId/meta", authenticateTeacher, attendanceMeta);
router.get("/schedule/weekly", authenticateTeacher, weeklySchedule);
router.get("/profile", authenticateTeacher, teacherProfile);
router.put("/profile", authenticateTeacher, updateTeacherProfile);
router.post("/profile/change-pin", authenticateTeacher, changeTeacherPin);

export default router;
