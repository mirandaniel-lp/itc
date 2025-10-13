<template>
  <div>
    <n-card>
      <template #header>
        <n-icon size="22" color="#1976d2"><ListOutline /></n-icon>
        <span class="ml-2 font-bold">Registrar y Ver Calificaciones</span>
      </template>
      <n-select
        v-model:value="selectedCourse"
        :options="courseOptions"
        placeholder="Selecciona un curso"
        class="mb-4"
      />
      <n-data-table
        :columns="columns"
        :data="grades"
        :bordered="false"
        striped
        size="large"
      />
    </n-card>
  </div>
</template>
<script setup>
import { ref, onMounted, watch } from "vue";
import { NCard, NIcon, NSelect, NDataTable } from "naive-ui";
import { ListOutline } from "@vicons/ionicons5";
import courseService from "@/services/courseService";
import gradeService from "@/services/gradeService";

const selectedCourse = ref(null);
const courseOptions = ref([]);
const grades = ref([]);
const columns = [
  { title: "Estudiante", key: "student" },
  { title: "Actividad", key: "activity" },
  { title: "Nota", key: "score" },
  { title: "Observación", key: "feedback" },
];

onMounted(async () => {
  const courses = await courseService.getAll();
  courseOptions.value = courses.map((c) => ({
    label: `${c.name} (${c.parallel})`,
    value: c.id,
  }));
});

watch(selectedCourse, async (courseId) => {
  if (courseId) {
    grades.value = await gradeService.getByCourse(courseId);
  } else {
    grades.value = [];
  }
});
</script>
