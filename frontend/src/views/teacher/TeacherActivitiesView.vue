<template>
  <div>
    <n-card>
      <template #header>
        <n-icon size="22" color="#1976d2"><StarOutline /></n-icon>
        <span class="ml-2 font-bold">Mis Actividades</span>
      </template>
      <n-button type="primary" class="mb-4">Crear nueva actividad</n-button>
      <n-data-table
        :columns="columns"
        :data="activities"
        :bordered="false"
        striped
        size="large"
      />
    </n-card>
  </div>
</template>
<script setup>
import { ref, onMounted } from "vue";
import { NCard, NIcon, NButton, NDataTable } from "naive-ui";
import { StarOutline } from "@vicons/ionicons5";
import activityService from "@/services/activityService";

const activities = ref([]);
const columns = [
  { title: "Título", key: "title" },
  { title: "Curso", key: "course" },
  { title: "Fecha", key: "created_at" },
  { title: "Estado", key: "status" },
];

onMounted(async () => {
  // Aquí deberías filtrar solo las actividades del docente autenticado
  activities.value = await activityService.getAll();
});
</script>
