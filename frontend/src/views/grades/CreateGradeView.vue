<template>
  <app-layout>
    <div class="min-h-screen p-4">
      <n-card title="Registrar Calificación" size="large">
        <n-form @submit.prevent="submit" label-placement="top">
          <n-form-item label="Curso" required>
            <n-select
              v-model:value="selectedCourse"
              :options="courseOptions"
              placeholder="Selecciona un curso"
              @update:value="fetchActivities"
            />
          </n-form-item>
          <n-form-item label="Actividad" required>
            <n-select
              v-model:value="activityId"
              :options="activityOptions"
              placeholder="Selecciona una actividad"
              :disabled="!selectedCourse"
              @update:value="fetchStudents"
            />
          </n-form-item>
          <n-form-item label="Estudiante" required>
            <n-select
              v-model:value="studentId"
              :options="studentOptions"
              placeholder="Selecciona un estudiante"
              :disabled="!activityId"
            />
          </n-form-item>
          <n-form-item label="Nota" required>
            <n-input
              v-model:value="score"
              type="number"
              step="0.01"
              min="0"
              max="100"
              placeholder="Nota"
            />
          </n-form-item>
          <n-form-item label="Observación">
            <n-input
              v-model:value="feedback"
              type="textarea"
              placeholder="Observación"
              :autosize="{ minRows: 2, maxRows: 4 }"
            />
          </n-form-item>
          <div class="flex justify-end mt-4">
            <n-button type="primary" attr-type="submit">Registrar</n-button>
          </div>
        </n-form>
      </n-card>
    </div>
  </app-layout>
</template>

<script>
import {
  NCard,
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NButton,
  useMessage,
} from "naive-ui";
import { createGrade } from "@/services/gradeService";
import ActivityService from "@/services/activityService";
import CourseService from "@/services/courseService";
import StudentService from "@/services/studentService";
import AppLayout from "@/layouts/AppLayout.vue";

export default {
  name: "CreateGradeView",
  components: {
    AppLayout,
    NCard,
    NForm,
    NFormItem,
    NInput,
    NSelect,
    NButton,
  },
  data() {
    return {
      selectedCourse: null,
      courseOptions: [],
      activityId: null,
      activityOptions: [],
      studentId: null,
      studentOptions: [],
      score: "",
      feedback: "",
      message: null,
    };
  },
  async mounted() {
    this.message = useMessage();
    const resCourses = await CourseService.getAll();
    this.courseOptions = resCourses.map((c) => ({
      label: `${c.name} - ${c.parallel}`,
      value: c.id,
    }));
  },
  methods: {
    async fetchActivities() {
      this.activityId = null;
      this.activityOptions = [];
      this.studentId = null;
      this.studentOptions = [];
      if (!this.selectedCourse) return;
      const res = await ActivityService.getActivitiesByCourse(
        this.selectedCourse
      );
      this.activityOptions = res.map((a) => ({
        label: a.title,
        value: a.id,
      }));
    },
    async fetchStudents() {
      this.studentId = null;
      this.studentOptions = [];
      if (!this.selectedCourse) return;
      const res = await StudentService.getAll();
      this.studentOptions = res
        .filter((s) =>
          s.enrollments?.some((e) => e.courseId === this.selectedCourse)
        )
        .map((s) => ({
          label: `${s.name} ${s.last_name}`,
          value: s.id,
        }));
    },
    async submit() {
      try {
        await createGrade({
          activityId: this.activityId,
          studentId: this.studentId,
          score: this.score,
          feedback: this.feedback,
        });
        this.message.success("Calificación registrada correctamente.");
        this.$router.push("/grades/list");
      } catch {
        this.message.error("Error al registrar calificación.");
      }
    },
  },
};
</script>
