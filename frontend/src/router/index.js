import { createRouter, createWebHistory } from "vue-router";
import HomeView from "../views/HomeView.vue";
import Login from "../views/authentication/LoginView.vue";
import Register from "../views/authentication/RegisterView.vue";
import ListUsersView from "../views/users/ListUsersView.vue";
import EditUserView from "../views/users/EditUserView.vue";
import ListStudentsView from "../views/students/ListStudentsView.vue";
import CreateStudentView from "../views/students/CreateStudentView.vue";
import EditStudentView from "../views/students/EditStudentView.vue";

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
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
