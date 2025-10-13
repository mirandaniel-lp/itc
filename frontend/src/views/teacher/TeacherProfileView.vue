<template>
  <div>
    <n-card>
      <template #header>
        <n-icon size="22" color="#1976d2"><PersonCircleOutline /></n-icon>
        <span class="ml-2 font-bold">Mi Perfil</span>
      </template>
      <div class="flex flex-col gap-2 mt-4">
        <div><b>Nombre:</b> {{ teacher.name }} {{ teacher.last_name }}</div>
        <div><b>Email:</b> {{ teacher.email }}</div>
        <div><b>CI:</b> {{ teacher.ci }}</div>
        <div><b>Especialidad:</b> {{ teacher.specialty }}</div>
        <div><b>Teléfono:</b> {{ teacher.phone }}</div>
      </div>
    </n-card>
  </div>
</template>
<script setup>
import { NCard, NIcon } from "naive-ui";
import { PersonCircleOutline } from "@vicons/ionicons5";
const teacher = JSON.parse(localStorage.getItem("teacher") || "{}");
</script>
