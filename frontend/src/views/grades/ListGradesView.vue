<template>
  <app-layout>
    <div class="min-h-screen p-4">
      <n-card title="Calificaciones" size="large">
        <div class="flex items-center mb-4 gap-2">
          <n-select
            v-model:value="selectedCourse"
            :options="courseOptions"
            placeholder="Selecciona un curso"
            @update:value="fetchActivities"
            style="max-width: 300px"
          />
          <n-select
            v-model:value="selectedActivity"
            :options="activityOptions"
            placeholder="Selecciona una actividad"
            @update:value="fetchGrades"
            style="max-width: 300px"
            :disabled="!selectedCourse"
          />
          <router-link
            :to="`/grades/create?activityId=${selectedActivity}`"
            class="btn btn-primary ml-auto"
            >Registrar Calificación</router-link
          >
        </div>
        <n-data-table
          :columns="columns"
          :data="grades"
          :bordered="false"
          :striped="true"
        />
        <div v-if="!grades.length" class="mt-4">
          No hay calificaciones para esta actividad.
        </div>
      </n-card>
    </div>
  </app-layout>
</template>

<script>
import { NCard, NSelect, NDataTable } from "naive-ui";
import ActivityService from "@/services/activityService";
import CourseService from "@/services/courseService";
import AppLayout from "@/layouts/AppLayout.vue";
import GradeService from "@/services/gradeService";

export default {
  name: "ListGradesView",
  components: { AppLayout, NCard, NSelect, NDataTable },
  data() {
    return {
      courses: [],
      courseOptions: [],
      selectedCourse: null,
      activities: [],
      activityOptions: [],
      selectedActivity: null,
      grades: [],
      columns: [
        { title: "Estudiante", key: "studentName" },
        { title: "Nota", key: "score" },
        { title: "Observación", key: "feedback" },
      ],
    };
  },
  async mounted() {
    const res = await CourseService.getAll();
    this.courses = res;
    this.courseOptions = this.courses.map((c) => ({
      label: `${c.name} - ${c.parallel}`,
      value: c.id,
    }));
    if (this.courses.length) {
      this.selectedCourse = this.courses[0].id;
      await this.fetchActivities();
    }
  },
  methods: {
    async fetchActivities() {
      if (!this.selectedCourse) return;
      const res = await ActivityService.getActivitiesByCourse(
        this.selectedCourse
      );
      this.activities = res;
      this.activityOptions = this.activities.map((a) => ({
        label: a.title,
        value: a.id,
      }));
      if (this.activities.length) {
        this.selectedActivity = this.activities[0].id;
        await this.fetchGrades();
      } else {
        this.selectedActivity = null;
        this.grades = [];
      }
    },
    async fetchGrades() {
      if (!this.selectedActivity) {
        this.grades = [];
        return;
      }
      const res = await GradeService.getGradesByActivity(this.selectedActivity);
      this.grades = res.data.grades.map((g) => ({
        studentName: `${g.student?.name || ""} ${g.student?.last_name || ""}`,
        score: g.score,
        feedback: g.feedback,
      }));
    },
  },
};
</script>
