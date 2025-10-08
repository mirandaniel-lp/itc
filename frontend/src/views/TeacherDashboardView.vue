<template>
  <app-layout>
    <div class="max-w-4xl mx-auto py-8">
      <n-card>
        <div class="text-2xl font-bold mb-2">Panel Docente</div>
        <div class="text-gray-600 mb-4">
          Bienvenido, {{ teacher?.name }} {{ teacher?.last_name }}
        </div>
        <div class="mb-6">
          <div class="font-semibold text-lg mb-2">Mis Cursos Asignados</div>
          <n-table v-if="courses.length">
            <thead>
              <tr>
                <th>Curso</th>
                <th>Paralelo</th>
                <th>Modalidad</th>
                <th>Estudiantes inscritos</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="course in courses" :key="course.id">
                <td>{{ course.name }}</td>
                <td>{{ course.parallel }}</td>
                <td>{{ course.modality?.name }}</td>
                <td>{{ course.students.length }}</td>
                <td>
                  <n-button size="small" @click="showStudents(course)">
                    Ver estudiantes
                  </n-button>
                  <n-button
                    size="small"
                    type="primary"
                    class="ml-2"
                    @click="createActivity(course)"
                  >
                    Crear actividad
                  </n-button>
                </td>
              </tr>
            </tbody>
          </n-table>
          <div v-else class="text-gray-500">No tienes cursos asignados.</div>
        </div>
        <div class="grid grid-cols-2 gap-4">
          <router-link to="/courses" class="btn btn-outline w-full"
            >Mis Cursos</router-link
          >
          <router-link to="/activities/create" class="btn btn-outline w-full"
            >Crear Actividad</router-link
          >
          <router-link to="/activities/list" class="btn btn-outline w-full"
            >Ver Actividades</router-link
          >
          <router-link to="/grades/create" class="btn btn-outline w-full"
            >Registrar Calificación</router-link
          >
          <router-link to="/grades/list" class="btn btn-outline w-full"
            >Ver Calificaciones</router-link
          >
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
  </app-layout>
</template>

<script>
import AppLayout from "@/layouts/AppLayout.vue";
import { NCard, NButton, NTable, NModal } from "naive-ui";
import TeacherService from "@/services/teacherService";

export default {
  name: "TeacherDashboardView",
  components: { AppLayout, NCard, NButton, NTable, NModal },
  data() {
    const storedTeacher = localStorage.getItem("teacher");
    return {
      teacher: storedTeacher ? JSON.parse(storedTeacher) : null,
      courses: [],
      showModal: false,
      estudiantesCurso: [],
    };
  },
  async mounted() {
    if (this.teacher?.id) {
      const res = await TeacherService.getCourses(this.teacher.id);
      this.courses = res.courses || [];
    }
  },
  methods: {
    showStudents(course) {
      this.estudiantesCurso = course.students;
      this.showModal = true;
    },
    createActivity(course) {
      this.$router.push({
        path: "/activities/create",
        query: { courseId: course.id },
      });
    },
  },
};
</script>

<style scoped></style>
