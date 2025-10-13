<template>
  <div>
    <n-card>
      <template #header>
        <n-icon size="22" color="#1976d2"><BookOutline /></n-icon>
        <span class="ml-2 font-bold">Mis Cursos</span>
      </template>
      <n-data-table
        :columns="columns"
        :data="courses"
        :bordered="false"
        striped
        size="large"
        class="mt-4"
      />
    </n-card>
  </div>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { NCard, NIcon, NDataTable } from "naive-ui";
import { BookOutline } from "@vicons/ionicons5";
import courseService from "@/services/courseService";

const courses = ref([]);
const columns = [
  { title: "Nombre", key: "name" },
  { title: "Paralelo", key: "parallel" },
  { title: "Modalidad", key: "modality" },
  { title: "Gestión", key: "year" },
];

onMounted(async () => {
  courses.value = await courseService.getAll();
});
</script>
