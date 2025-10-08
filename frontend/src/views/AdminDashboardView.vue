<template>
  <div class="p-6">
    <h2 class="text-2xl font-bold mb-6">Panel de Administración</h2>
    <div class="grid grid-cols-2 gap-4">
      <router-link to="/students" class="btn btn-outline w-full"
        >Estudiantes</router-link
      >
      <router-link to="/teachers" class="btn btn-outline w-full"
        >Docentes</router-link
      >
      <router-link to="/courses" class="btn btn-outline w-full"
        >Cursos</router-link
      >
      <router-link to="/activities/list" class="btn btn-outline w-full"
        >Actividades</router-link
      >
      <router-link to="/grades/list" class="btn btn-outline w-full"
        >Calificaciones</router-link
      >
      <router-link to="/enrollments" class="btn btn-outline w-full"
        >Inscripciones</router-link
      >
      <router-link to="/users" class="btn btn-outline w-full"
        >Usuarios</router-link
      >
    </div>
  </div>
</template>
