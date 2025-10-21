<template>
  <app-layout>
    <div class="min-h-screen p-6 space-y-6">
      <h1 class="text-3xl md:text-4xl font-extrabold">Calificaciones</h1>
      <div class="flex flex-wrap items-center gap-3 mb-4">
        <n-select
          v-model:value="selectedCourse"
          :options="courseOptions"
          placeholder="Selecciona un curso"
          style="max-width: 260px"
          @update:value="fetchActivities"
        />
        <n-select
          v-model:value="selectedActivity"
          :options="activityOptions"
          placeholder="Selecciona una actividad"
          style="max-width: 260px"
          :disabled="!selectedCourse"
          @update:value="fetchStudentsAndGrades"
        />
        <div class="flex items-center gap-2 ml-auto">
          <n-input-number
            v-model:value="globalScore"
            min="0"
            max="100"
            placeholder="Nota general"
            style="width: 120px"
          />
          <n-button
            class="px-3 py-1.5 rounded-lg text-sm font-bold bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] text-white hover:shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all"
            @click="applyGlobalScore"
            :disabled="!grades.length"
          >
            Aplicar
          </n-button>
          <n-button
            class="px-3 py-1.5 rounded-lg text-sm font-bold bg-gradient-to-r from-[#ff1953] to-[#ff3064] text-white hover:shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all"
            @click="clearAllScores"
            :disabled="!grades.length"
          >
            Limpiar
          </n-button>
          <n-button
            class="rounded-md bg-gradient-to-r from-[#1aff94] to-[#02cc6e] px-3 py-1.5 text-xs font-bold text-white hover:from-[#1aff94] hover:to-[#1aff94] transition"
            :loading="saving"
            @click="saveAll"
            :disabled="!grades.length"
          >
            Guardar
          </n-button>
        </div>
      </div>

      <div
        v-if="summary.total > 0"
        class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4"
      >
        <n-statistic label="Total Estudiantes" :value="summary.total" />
        <n-statistic label="Promedio" :value="summary.average" />
        <n-statistic label="Aprobados" :value="summary.approved" />
        <n-statistic label="Reprobados" :value="summary.failed" />
      </div>
      <div
        class="rounded-2xl overflow-hidden border border-[#334155] shadow-[0_6px_25px_rgba(0,0,0,0.4)] bg-[#1e293b]/80 backdrop-blur-sm"
      >
        <n-data-table
          :columns="columns"
          :data="grades"
          :bordered="false"
          :striped="true"
          :pagination="false"
          size="large"
          class="[&_.n-data-table-th]:text-center [&_.n-data-table-th]:font-extrabold [&_.n-data-table-td]:text-center [&_.n-data-table-tr:hover]:bg-[#1d4ed8]/20 transition-all"
        />
      </div>
      <div v-if="!grades.length" class="text-center text-gray-500 mt-6">
        No hay estudiantes para esta actividad.
      </div>
    </div>
  </app-layout>
</template>

<script>
import { h } from "vue";
import {
  NCard,
  NSelect,
  NButton,
  NInputNumber,
  NInput,
  NDataTable,
  NStatistic,
  useMessage,
} from "naive-ui";
import AppLayout from "@/layouts/AppLayout.vue";
import CourseService from "@/services/courseService";
import ActivityService from "@/services/activityService";
import StudentService from "@/services/studentService";
import GradeService from "@/services/gradeService";

export default {
  name: "GradesByActivityView",
  components: {
    AppLayout,
    NCard,
    NSelect,
    NButton,
    NInputNumber,
    NInput,
    NDataTable,
    NStatistic,
  },
  data() {
    return {
      selectedCourse: null,
      selectedActivity: null,
      courses: [],
      activities: [],
      grades: [],
      courseOptions: [],
      activityOptions: [],
      summary: { total: 0, average: 0, approved: 0, failed: 0 },
      globalScore: null,
      saving: false,
      message: null,
    };
  },
  computed: {
    columns() {
      return [
        { title: "Estudiante", key: "studentName" },
        {
          title: "Nota",
          key: "score",
          render: (row) =>
            h(NInputNumber, {
              min: 0,
              max: 100,
              size: "small",
              value: row.score,
              style: "width: 100px",
              onUpdateValue: (val) => {
                row.score = val;
                this.updateSummary();
              },
            }),
        },
        {
          title: "Observación",
          key: "feedback",
          render: (row) =>
            h(NInput, {
              size: "small",
              placeholder: "Observación",
              value: row.feedback,
              onUpdateValue: (val) => {
                row.feedback = val;
              },
            }),
        },
      ];
    },
  },
  async mounted() {
    this.message = useMessage();
    const resCourses = await CourseService.getAll();
    this.courses = resCourses;
    this.courseOptions = resCourses.map((c) => ({
      label: `${c.name} - ${c.parallel}`,
      value: c.id,
    }));
  },
  methods: {
    async fetchActivities() {
      this.selectedActivity = null;
      this.activityOptions = [];
      this.grades = [];
      if (!this.selectedCourse) return;
      const res = await ActivityService.getActivitiesByCourse(
        this.selectedCourse
      );
      this.activities = res;
      this.activityOptions = res.map((a) => ({ label: a.title, value: a.id }));
    },
    async fetchStudentsAndGrades() {
      if (!this.selectedCourse || !this.selectedActivity) return;

      const enrolledStudents = await StudentService.getByCourse(
        this.selectedCourse
      );

      const gradesRes = await GradeService.getGradesByActivity(
        this.selectedActivity
      );
      const existingGrades = Array.isArray(gradesRes.data)
        ? gradesRes.data
        : gradesRes.data?.grades || [];
      this.grades = enrolledStudents.map((s) => {
        const found = existingGrades.find(
          (g) => Number(g.studentId) === Number(s.id)
        );
        return {
          id: found?.id || null,
          studentId: Number(s.id),
          studentName: `${s.name} ${s.last_name || ""}`.trim(),
          score: found?.score ? Number(found.score) : 0,
          feedback: found?.feedback || "",
        };
      });

      this.updateSummary();
    },
    updateSummary() {
      const total = this.grades.length;
      if (!total) {
        this.summary = { total: 0, average: 0, approved: 0, failed: 0 };
        return;
      }
      const scores = this.grades.map((g) => Number(g.score) || 0);
      const avg = (scores.reduce((a, b) => a + b, 0) / total).toFixed(2);
      const approved = scores.filter((s) => s >= 51).length;
      const failed = total - approved;
      this.summary = { total, average: avg, approved, failed };
    },
    applyGlobalScore() {
      if (this.globalScore === null) {
        this.message.warning("Ingresa una nota primero.");
        return;
      }
      this.grades.forEach((g) => (g.score = this.globalScore));
      this.updateSummary();
      this.message.success("Nota aplicada a todos los estudiantes.");
    },
    clearAllScores() {
      this.grades.forEach((g) => {
        g.score = 0;
        g.feedback = "";
      });
      this.updateSummary();
      this.message.info("Notas limpiadas.");
    },
    async saveAll() {
      if (!this.grades.length) return;
      this.saving = true;
      try {
        const promises = this.grades.map((g) => {
          if (g.id) {
            return GradeService.updateGrade(g.id, {
              score: g.score,
              feedback: g.feedback,
            });
          } else {
            return GradeService.createGrade({
              activityId: this.selectedActivity,
              studentId: g.studentId,
              score: g.score,
              feedback: g.feedback,
            });
          }
        });
        await Promise.all(promises);
        this.message.success("Notas guardadas correctamente.");
        await this.fetchStudentsAndGrades();
      } catch (err) {
        console.error(err);
        this.message.error("Error al guardar notas.");
      } finally {
        this.saving = false;
      }
    },
  },
};
</script>
