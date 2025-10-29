import { Router } from "express";
import authMobile from "../middlewares/authMobile.js";
import { upload } from "../middlewares/upload.js";
import { login, changePin } from "../controllers/mobileAuthController.js";
import {
  me,
  patchProfile,
  uploadAvatar,
} from "../controllers/mobileProfileController.js";
import {
  getCourses,
  getSchedule,
  getActivities,
} from "../controllers/mobileCoursesController.js";
import { getGrades } from "../controllers/mobileGradesController.js";
import { getAttendance } from "../controllers/mobileAttendanceController.js";
/*import {
  getContacts,
  createContact,
  updateContact,
  deleteContact,
} from "../controllers/mobileContactsController.js";*/

const router = Router();

router.post("/auth/login", login);
router.post("/auth/change-pin", authMobile, changePin);

router.get("/me", authMobile, me);
router.patch("/profile", authMobile, patchProfile);
router.post("/profile/avatar", authMobile, upload.single("file"), uploadAvatar);

router.get("/courses", authMobile, getCourses);
router.get("/schedule", authMobile, getSchedule);
router.get("/activities", authMobile, getActivities);
router.get("/grades", authMobile, getGrades);
router.get("/attendance", authMobile, getAttendance);

/*router.get("/contacts", authMobile, getContacts);
router.post("/contacts", authMobile, createContact);
router.patch("/contacts/:id", authMobile, updateContact);
router.delete("/contacts/:id", authMobile, deleteContact);*/

export default router;
