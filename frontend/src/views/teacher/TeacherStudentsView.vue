<template>
  <div>
    <n-card>
      <template #header>
        <n-icon size="22" color="#1976d2"><PeopleOutline /></n-icon>
        <span class="ml-2 font-bold">Estudiantes por Curso</span>
      </template>
      <n-select
        v-model:value="selectedCourse"
        :options="courseOptions"
        placeholder="Selecciona un curso"
        class="mb-4"
      />
      <n-data-table
        :columns="columns"
        :data="students"
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
import { PeopleOutline } from "@vicons/ionicons5";
import courseService from "@/services/courseService";
import studentService from "@/services/studentService";

const selectedCourse = ref(null);
const courseOptions = ref([]);
const students = ref([]);
const columns = [
  { title: "Nombre", key: "name" },
  { title: "CI", key: "ci" },
  { title: "Email", key: "email" },
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
    students.value = await studentService.getByCourse(courseId);
  } else {
    students.value = [];
  }
});
</script>
