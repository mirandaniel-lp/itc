import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import Login from "../views/authentication/LoginView.vue";
import Register from "../views/authentication/RegisterView.vue";
import ListUsersView from "../views/users/ListUsersView.vue";
import EditUserView from "../views/users/EditUserView.vue";
import ListStudentsView from "../views/students/ListStudentsView.vue";
import CreateStudentView from "../views/students/CreateStudentView.vue";
import EditStudentView from "../views/students/EditStudentView.vue";
import ListTeachersView from "../views/teachers/ListTeachersView.vue";
import CreateTeacherView from "../views/teachers/CreateTeacherView.vue";
import EditTeacherView from "../views/teachers/EditTeacherView.vue";
import ListCoursesView from "../views/courses/ListCoursesView.vue";
import CreateCourseView from "../views/courses/CreateCourseView.vue";
import EditCourseView from "../views/courses/EditCourseView.vue";
import ListEnrollmentsView from "../views/enrollments/ListEnrollmentsView.vue";
import CreateEnrollmentView from "../views/enrollments/CreateEnrollmentView.vue";

const routes = [
  {
    path: "/",
    redirect: "/login",
  },
  {
    path: "/home",
    name: "home",
    component: HomeView,
  },
  {
    path: "/login",
    name: "login",
    component: Login,
  },
  {
    path: "/register",
    name: "register",
    component: Register,
  },
  {
    path: "/users",
    name: "users",
    component: ListUsersView,
  },
  {
    path: "/users/:id/edit",
    name: "edit-user",
    component: EditUserView,
    props: true,
  },
  {
    path: "/students",
    name: "students",
    component: ListStudentsView,
  },
  {
    path: "/students/create",
    name: "create-student",
    component: CreateStudentView,
  },
  {
    path: "/students/:id/edit",
    name: "edit-student",
    component: EditStudentView,
    props: true,
  },
  {
    path: "/teachers",
    name: "teachers",
    component: ListTeachersView,
  },
  {
    path: "/teachers/create",
    name: "create-teacher",
    component: CreateTeacherView,
  },
  {
    path: "/teachers/:id/edit",
    name: "edit-teacher",
    component: EditTeacherView,
    props: true,
  },
  {
    path: "/courses",
    name: "courses",
    component: ListCoursesView,
  },
  {
    path: "/courses/create",
    name: "create-course",
    component: CreateCourseView,
  },
  {
    path: "/courses/:id/edit",
    name: "edit-course",
    component: EditCourseView,
    props: true,
  },
  {
    path: "/enrollments",
    name: "enrollments",
    component: ListEnrollmentsView,
  },
  {
    path: "/enrollments/create",
    name: "create-enrollment",
    component: CreateEnrollmentView,
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
