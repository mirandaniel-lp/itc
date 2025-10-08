import { createRouter, createWebHistory } from "vue-router";

const routes = [
  {
    path: "/",
    redirect: "/login",
  },
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
    path: "/courses",
    name: "courses",
    component: () => import("@/views/courses/ListCoursesView.vue"),
  },
  {
    path: "/courses/create",
    name: "create-course",
    component: () => import("@/views/courses/CreateCourseView.vue"),
  },
  {
    path: "/courses/:id/edit",
    name: "edit-course",
    component: () => import("@/views/courses/EditCourseView.vue"),
    props: true,
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
    path: "/grades/create",
    name: "CreateGrade",
    component: () => import("@/views/grades/CreateGradeView.vue"),
  },
  {
    path: "/grades",
    name: "grades",
    component: () => import("@/views/grades/ListGradesView.vue"),
  },
  {
    path: "/admin",
    name: "admin-dashboard",
    component: () => import("@/views/AdminDashboardView.vue"),
  },
  {
    path: "/teacher/dashboard",
    name: "teacher-dashboard",
    component: () => import("@/views/TeacherDashboardView.vue"),
  },
  {
    path: "/teacher/login",
    name: "teacher-login",
    component: () => import("@/views/authentication/TeacherLoginView.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
