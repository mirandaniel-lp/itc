<template>
  <div>
    <TeacherLayout />
    <div class="max-w-6xl mx-auto py-8">
      <n-grid :cols="2" :x-gap="24" :y-gap="24" class="mb-8">
        <n-gi>
          <n-card>
            <template #header>
              <n-icon size="28" color="#1976d2"><BookOutline /></n-icon>
              <span class="ml-2 font-bold">Mis Cursos</span>
            </template>
            <div class="text-2xl font-semibold text-blue-700">
              {{ courses.length }}
            </div>
            <div class="text-gray-500">Cursos asignados</div>
          </n-card>
        </n-gi>
        <n-gi>
          <n-card>
            <template #header>
              <n-icon size="28" color="#1976d2"><PeopleOutline /></n-icon>
              <span class="ml-2 font-bold">Estudiantes</span>
            </template>
            <div class="text-2xl font-semibold text-blue-700">
              {{ totalStudents }}
            </div>
            <div class="text-gray-500">Total estudiantes</div>
          </n-card>
        </n-gi>
        <n-gi>
          <n-card>
            <template #header>
              <n-icon size="28" color="#1976d2"><StarOutline /></n-icon>
              <span class="ml-2 font-bold">Actividades</span>
            </template>
            <div class="text-2xl font-semibold text-blue-700">
              {{ totalActivities }}
            </div>
            <div class="text-gray-500">Actividades creadas</div>
          </n-card>
        </n-gi>
        <n-gi>
          <n-card>
            <template #header>
              <n-icon size="28" color="#e53935"><ListOutline /></n-icon>
              <span class="ml-2 font-bold">Alertas</span>
            </template>
            <div class="text-2xl font-semibold text-red-600">
              {{ lowPerformance }}
            </div>
            <div class="text-gray-500">Estudiantes con bajo rendimiento</div>
          </n-card>
        </n-gi>
      </n-grid>

      <n-card>
        <div class="text-2xl font-bold mb-2">Panel Docente</div>
        <div class="text-gray-600 mb-4">
          Bienvenido, {{ teacher?.name }} {{ teacher?.last_name }}
        </div>
        <div class="mb-6">
          <div class="font-semibold text-lg mb-2">Mis Cursos Asignados</div>
          <div class="text-gray-500" v-if="courses.length === 0">
            No tienes cursos asignados.
          </div>
          <ul v-else>
            <li v-for="course in courses" :key="course.id">
              {{ course.name }}
            </li>
          </ul>
        </div>
      </n-card>

      <n-modal v-model:show="showModal" title="Estudiantes inscritos">
        <n-table>
          <thead>
            <tr>
              <th>Nombre</th>
              <th>CI</th>
              <th>Teléfono</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="e in estudiantesCurso" :key="e.student.id">
              <td>{{ e.student.name }} {{ e.student.last_name }}</td>
              <td>{{ e.student.ci }}</td>
              <td>{{ e.student.phone }}</td>
            </tr>
          </tbody>
        </n-table>
      </n-modal>
    </div>
  </div>
</template>

<script>
import TeacherLayout from "@/layouts/TeacherLayout.vue";
import TeacherService from "@/services/teacherService";
import { NCard, NTable, NModal, NGrid, NGi, NIcon } from "naive-ui";
import {
  BookOutline,
  PeopleOutline,
  StarOutline,
  ListOutline,
} from "@vicons/ionicons5";

export default {
  name: "TeacherDashboardView",
  components: {
    TeacherLayout,
    NCard,
    NTable,
    NModal,
    NGrid,
    NGi,
    NIcon,
    BookOutline,
    PeopleOutline,
    StarOutline,
    ListOutline,
  },
  data() {
    const storedTeacher = localStorage.getItem("teacher");
    return {
      teacher: storedTeacher ? JSON.parse(storedTeacher) : null,
      courses: [],
      showModal: false,
      estudiantesCurso: [],
      totalStudents: 0,
      totalActivities: 0,
      lowPerformance: 0,
    };
  },
  async mounted() {
    if (this.teacher?.id) {
      await this.loadDashboard();
    }
  },
  methods: {
    async loadDashboard() {
      try {
        const data = await TeacherService.getDashboard();
        this.courses = data.courses;
        this.totalStudents = data.totalStudents;
        this.totalActivities = data.totalActivities;
        this.lowPerformance = data.lowPerformance;
      } catch (err) {
        console.error("Error cargando dashboard:", err);
      }
    },
    showStudents(course) {
      this.estudiantesCurso = course.students;
      this.showModal = true;
    },
    createActivity(course) {
      this.$router.push({
        path: "/teacher/activities",
        query: { courseId: course.id },
      });
    },
  },
};
</script>
