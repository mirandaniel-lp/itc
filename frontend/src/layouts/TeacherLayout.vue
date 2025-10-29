<template>
  <div class="min-h-screen bg-[#0b1220] text-white">
    <header class="border-b border-white/10">
      <div
        class="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between"
      >
        <div class="flex items-center gap-3">
          <img
            src="@/assets/logo.png"
            alt="Logo Instituto Técnico Columbia"
            class="w-14 h-10 object-contain brightness-0 invert drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]"
          />
          <span class="font-semibold">Instituto Técnico Columbia</span>
        </div>
        <nav class="hidden md:flex items-center gap-2">
          <RouterLink
            :to="{ path: '/teacher/dashboard' }"
            class="px-3 py-1.5 rounded-lg"
            :class="linkCls('/teacher/dashboard')"
            >Inicio</RouterLink
          >
          <RouterLink
            :to="{ path: '/teacher/courses' }"
            class="px-3 py-1.5 rounded-lg"
            :class="linkCls('/teacher/courses')"
            >Cursos</RouterLink
          >
          <RouterLink
            :to="{ path: '/teacher/activities' }"
            class="px-3 py-1.5 rounded-lg"
            :class="linkCls('/teacher/activities')"
            >Actividades</RouterLink
          >
          <RouterLink
            :to="{ path: '/teacher/students' }"
            class="px-3 py-1.5 rounded-lg"
            :class="linkCls('/teacher/students')"
            >Estudiantes</RouterLink
          >
          <RouterLink
            :to="{ path: '/teacher/grades' }"
            class="px-3 py-1.5 rounded-lg"
            :class="linkCls('/teacher/grades')"
            >Calificaciones</RouterLink
          >
          <RouterLink
            :to="{ path: '/teacher/attendances' }"
            class="px-3 py-1.5 rounded-lg"
            :class="linkCls('/teacher/attendances')"
            >Asistencias</RouterLink
          >
          <RouterLink
            :to="{ path: '/teacher/profile' }"
            class="px-3 py-1.5 rounded-lg"
            :class="linkCls('/teacher/profile')"
            >Perfil</RouterLink
          >
          <button
            class="px-3 py-1.5 rounded-lg bg-red-600/80 hover:bg-red-600"
            @click="logout"
          >
            Salir
          </button>
        </nav>
        <button
          class="md:hidden px-3 py-1.5 rounded-lg bg-white/10"
          @click="open = !open"
        >
          Menú
        </button>
      </div>
      <div v-if="open" class="md:hidden border-t border-white/10">
        <div class="px-4 py-2 grid gap-2">
          <RouterLink
            @click="open = false"
            :to="{ path: '/teacher/dashboard' }"
            class="px-3 py-2 rounded-lg"
            :class="linkCls('/teacher/dashboard')"
            >Inicio</RouterLink
          >
          <RouterLink
            @click="open = false"
            :to="{ path: '/teacher/courses' }"
            class="px-3 py-2 rounded-lg"
            :class="linkCls('/teacher/courses')"
            >Cursos</RouterLink
          >
          <RouterLink
            @click="open = false"
            :to="{ path: '/teacher/activities' }"
            class="px-3 py-2 rounded-lg"
            :class="linkCls('/teacher/activities')"
            >Actividades</RouterLink
          >
          <RouterLink
            @click="open = false"
            :to="{ path: '/teacher/students' }"
            class="px-3 py-2 rounded-lg"
            :class="linkCls('/teacher/students')"
            >Estudiantes</RouterLink
          >
          <RouterLink
            @click="open = false"
            :to="{ path: '/teacher/grades' }"
            class="px-3 py-2 rounded-lg"
            :class="linkCls('/teacher/grades')"
            >Calificaciones</RouterLink
          >
          <RouterLink
            @click="open = false"
            :to="{ path: '/teacher/attendances' }"
            class="px-3 py-2 rounded-lg"
            :class="linkCls('/teacher/attendances')"
            >Asistencias</RouterLink
          >
          <RouterLink
            @click="open = false"
            :to="{ path: '/teacher/profile' }"
            class="px-3 py-2 rounded-lg"
            :class="linkCls('/teacher/profile')"
            >Perfil</RouterLink
          >
          <button
            class="px-3 py-2 rounded-lg bg-red-600/80 hover:bg-red-600 text-left"
            @click="logout"
          >
            Salir
          </button>
        </div>
      </div>
    </header>
    <main class="max-w-7xl mx-auto px-4 py-6">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import TeacherSessionService from "@/services/teacherSessionService";

const route = useRoute();
const router = useRouter();
const open = ref(false);

function linkCls(path) {
  const active = route.path.startsWith(path);
  return active ? "bg-indigo-600/80" : "hover:bg-white/10";
}

async function logout() {
  try {
    await TeacherSessionService.logout();
  } catch {}
  localStorage.removeItem("token");
  localStorage.removeItem("teacher");
  localStorage.removeItem("sessionType");
  router.replace("/teacher/login");
}
</script>
