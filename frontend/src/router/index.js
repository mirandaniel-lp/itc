import { createRouter, createWebHistory } from "vue-router";
import AuthService from "@/services/authService";
import { ROLES } from "@/constants/roles";
import { decodeJwt } from "@/utils/jwt";

let cachedUser = null;

function publicPaths() {
  return ["/login", "/register", "/teacher/login"];
}

function isAllowed(roleName, path) {
  if (!roleName) return false;
  if (roleName === ROLES.ADMINISTRADOR) return true;
  if (roleName === ROLES.GERENTE)
    return (
      path === "/home" ||
      path === "/profile" ||
      path.startsWith("/students") ||
      path.startsWith("/enrollments") ||
      path.startsWith("/courses") ||
      path.startsWith("/programs") ||
      path.startsWith("/terms") ||
      path.startsWith("/classrooms") ||
      path.startsWith("/grade-policies") ||
      path.startsWith("/holidays") ||
      path.startsWith("/activities") ||
      path.startsWith("/attendances") ||
      path.startsWith("/schedules") ||
      path.startsWith("/risks") ||
      path.startsWith("/grades") ||
      path.startsWith("/audit")
    );
  if (roleName === ROLES.SECRETARIA)
    return (
      path === "/home" ||
      path === "/profile" ||
      path.startsWith("/students") ||
      path.startsWith("/enrollments") ||
      path.startsWith("/attendances") ||
      path.startsWith("/grades")
    );
  if (roleName === ROLES.USUARIO) return path === "/home";
  return false;
}

const routes = [
  { path: "/", redirect: "/login" },
  {
    path: "/home",
    name: "home",
    component: () => import("@/views/HomeView.vue"),
  },
  {
    path: "/login",
    name: "login",
    component: () => import("@/views/authentication/LoginView.vue"),
  },
  {
    path: "/register",
    name: "register",
    component: () => import("@/views/authentication/RegisterView.vue"),
  },
  {
    path: "/profile",
    name: "profile",
    component: () => import("@/views/profile/UserProfileView.vue"),
  },
  {
    path: "/users",
    name: "users",
    component: () => import("@/views/users/ListUsersView.vue"),
  },
  {
    path: "/users/:id/edit",
    name: "edit-user",
    component: () => import("@/views/users/EditUserView.vue"),
    props: true,
  },
  {
    path: "/students",
    name: "students",
    component: () => import("@/views/students/ListStudentsView.vue"),
  },
  {
    path: "/students/create",
    name: "create-student",
    component: () => import("@/views/students/CreateStudentView.vue"),
  },
  {
    path: "/students/:id/edit",
    name: "edit-student",
    component: () => import("@/views/students/EditStudentView.vue"),
    props: true,
  },
  {
    path: "/teachers",
    name: "teachers",
    component: () => import("@/views/teachers/ListTeachersView.vue"),
  },
  {
    path: "/teachers/create",
    name: "create-teacher",
    component: () => import("@/views/teachers/CreateTeacherView.vue"),
  },
  {
    path: "/teachers/:id/edit",
    name: "edit-teacher",
    component: () => import("@/views/teachers/EditTeacherView.vue"),
    props: true,
  },
  {
    path: "/terms",
    name: "TermsList",
    component: () => import("@/views/terms/TermsListView.vue"),
  },
  {
    path: "/programs",
    name: "ProgramsList",
    component: () => import("@/views/programs/ProgramsListView.vue"),
  },
  {
    path: "/courses",
    name: "courses",
    component: () => import("@/views/courses/ListCoursesView.vue"),
  },
  {
    path: "/courses/:id/edit",
    name: "edit-course",
    component: () => import("@/views/courses/EditCourseView.vue"),
    props: true,
  },
  {
    path: "/courses/create",
    name: "CoursesDesigner",
    component: () =>
      import("@/views/courses/CreateCoursesWithSchedulesView.vue"),
  },
  {
    path: "/classrooms",
    name: "classrooms",
    component: () => import("@/views/classrooms/ClassroomsView.vue"),
  },
  {
    path: "/grade-policies",
    name: "grade-policies",
    component: () => import("@/views/gradePolicies/GradePoliciesView.vue"),
  },
  {
    path: "/holidays",
    name: "holidays",
    component: () => import("@/views/holidays/HolidaysView.vue"),
  },
  {
    path: "/enrollments",
    name: "enrollments",
    component: () => import("@/views/enrollments/ListEnrollmentsView.vue"),
  },
  {
    path: "/enrollments/create",
    name: "create-enrollment",
    component: () => import("@/views/enrollments/CreateEnrollmentView.vue"),
  },
  {
    path: "/activities",
    name: "activities",
    component: () => import("@/views/activities/ListActivitiesView.vue"),
  },
  {
    path: "/activities/create",
    name: "CreateActivity",
    component: () => import("@/views/activities/CreateActivityView.vue"),
  },
  {
    path: "/activities/:id",
    name: "ActivityDetail",
    component: () => import("@/views/activities/ActivityDetailView.vue"),
  },
  {
    path: "/grades",
    name: "grades",
    component: () => import("@/views/grades/GradesByActivityView.vue"),
  },
  {
    path: "/attendances",
    name: "attendances",
    component: () => import("@/views/attendances/AttendancesView.vue"),
  },
  {
    path: "/risks",
    name: "risks",
    component: () => import("@/views/risks/RiskAnalysisView.vue"),
  },
  {
    path: "/reports",
    name: "reports",
    component: () => import("@/views/reports/ReportsView.vue"),
  },
  {
    path: "/schedules/designer",
    name: "schedules-designer",
    component: () => import("@/views/schedules/ScheduleDesignerView.vue"),
  },
  {
    path: "/audit",
    name: "audit",
    component: () => import("@/views/audit/AuditView.vue"),
  },
  {
    path: "/teacher/login",
    name: "teacher-login",
    component: () => import("@/views/authentication/TeacherLoginView.vue"),
  },
  {
    path: "/teacher",
    component: () => import("@/layouts/TeacherLayout.vue"),
    children: [
      { path: "", redirect: "/teacher/dashboard" },
      {
        path: "dashboard",
        name: "teacher-dashboard",
        component: () => import("@/views/teacher/TeacherDashboardView.vue"),
      },
      {
        path: "courses",
        name: "teacher-courses",
        component: () => import("@/views/teacher/TeacherCoursesView.vue"),
      },
      {
        path: "activities",
        name: "teacher-activities",
        component: () => import("@/views/teacher/TeacherActivitiesView.vue"),
      },
      {
        path: "students",
        name: "teacher-students",
        component: () => import("@/views/teacher/TeacherStudentsView.vue"),
      },
      {
        path: "grades",
        name: "teacher-grades",
        component: () => import("@/views/teacher/TeacherGradesView.vue"),
      },
      {
        path: "attendances",
        name: "teacher-attendances",
        component: () => import("@/views/teacher/TeacherAttendancesView.vue"),
      },
      {
        path: "profile",
        name: "teacher-profile",
        component: () => import("@/views/teacher/TeacherProfileView.vue"),
      },
    ],
  },
  {
    path: "/restricted",
    name: "restricted",
    component: () => import("@/views/RestrictedView.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

router.beforeEach(async (to, from, next) => {
  if (to.path === "/teacher/login") {
    const t = localStorage.getItem("token");
    const s = localStorage.getItem("sessionType");
    if (t && s === "TEACHER") return next("/teacher/dashboard");
    return next();
  }

  if (publicPaths().includes(to.path)) return next();

  const token = localStorage.getItem("token");
  const sessionType = localStorage.getItem("sessionType");

  if (!token) {
    cachedUser = null;
    if (to.path.startsWith("/teacher")) return next("/teacher/login");
    return next("/login");
  }

  if (sessionType === "TEACHER") {
    if (to.path.startsWith("/teacher") || to.path === "/restricted")
      return next();
    return next("/restricted");
  }

  const payload = decodeJwt(token) || {};
  const currentUserId = payload.userId;

  if (!cachedUser || cachedUser.id !== currentUserId) {
    try {
      const { user } = await AuthService.getUser();
      cachedUser = user;
    } catch {
      localStorage.removeItem("token");
      cachedUser = null;
      return next("/login");
    }
  }

  const roleName = cachedUser?.role?.name || "";
  if (!isAllowed(roleName, to.path)) {
    if (to.path !== "/restricted") return next("/restricted");
    return next();
  }

  return next();
});

export default router;
