<template>
  <div class="min-h-screen bg-[#0b1220] text-white">
    <header class="border-b border-white/10">
      <div
        class="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between"
      >
        <div class="flex items-center gap-3">
          <img
            src="@/assets/logo.png"
            alt="Logo Instituto Técnico Columbia"
            class="w-12 h-10 object-contain brightness-0 invert drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]"
          />
          <div class="flex flex-col leading-none">
            <span class="font-semibold text-sm md:text-base"
              >Instituto Técnico Columbia</span
            >
            <span class="text-xs text-white/50 hidden md:block"
              >Plataforma Docente</span
            >
          </div>
        </div>

        <nav class="hidden md:flex items-center gap-2">
          <template v-for="item in navItems" :key="item.path">
            <RouterLink
              :to="{ path: item.path }"
              class="flex items-center gap-2 px-3 py-2 rounded-lg transition-colors duration-150 text-sm"
              :class="linkCls(item.path)"
            >
              <span v-html="item.icon" class="w-4 h-4 opacity-80"></span>
              <span class="whitespace-nowrap">{{ item.label }}</span>
            </RouterLink>
          </template>

          <div class="relative">
            <button
              @click="profileOpen = !profileOpen"
              class="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition"
              :aria-expanded="String(profileOpen)"
            >
              <div
                class="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs"
              >
                {{ initials }}
              </div>
              <div class="text-sm hidden lg:block">{{ teacherNameShort }}</div>
              <svg
                v-if="!profileOpen"
                class="w-4 h-4"
                viewBox="0 0 24 24"
                fill="none"
              >
                <path
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M6 9l6 6 6-6"
                />
              </svg>
              <svg v-else class="w-4 h-4" viewBox="0 0 24 24" fill="none">
                <path
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  d="M18 15l-6-6-6 6"
                />
              </svg>
            </button>

            <transition name="fade-scale">
              <div
                v-if="profileOpen"
                @click.outside="profileOpen = false"
                class="absolute right-0 mt-2 w-44 bg-[#07101a] border border-white/6 rounded-lg shadow-lg overflow-hidden z-40"
              >
                <div class="px-4 py-3 border-b border-white/6">
                  <div class="text-sm font-medium">{{ teacherName }}</div>
                  <div class="text-xs text-white/50">{{ teacherEmail }}</div>
                </div>
                <button
                  @click="goToProfile"
                  class="w-full text-left px-4 py-2 hover:bg-white/3 text-sm"
                >
                  Ver perfil
                </button>
                <button
                  @click="logout"
                  class="w-full text-left px-4 py-2 hover:bg-red-600/90 bg-red-600/80 text-sm"
                >
                  Salir
                </button>
              </div>
            </transition>
          </div>
        </nav>

        <div class="md:hidden flex items-center gap-2">
          <button
            class="p-2 rounded-md bg-white/6 hover:bg-white/10 transition"
            @click="open = !open"
            :aria-expanded="String(open)"
            aria-label="Abrir menú"
          >
            <svg v-if="!open" class="w-6 h-6" viewBox="0 0 24 24" fill="none">
              <path
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M4 6h16M4 12h16M4 18h16"
              />
            </svg>
            <svg v-else class="w-6 h-6" viewBox="0 0 24 24" fill="none">
              <path
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                d="M6 6l12 12M6 18L18 6"
              />
            </svg>
          </button>
        </div>
      </div>

      <transition name="slide-fade-down">
        <div v-if="open" class="md:hidden border-t border-white/10">
          <div class="px-4 py-3 grid gap-2">
            <template v-for="item in navItems" :key="item.path + '-m'">
              <RouterLink
                @click="open = false"
                :to="{ path: item.path }"
                class="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-sm"
                :class="linkCls(item.path)"
              >
                <span v-html="item.icon" class="w-5 h-5"></span>
                <span class="grow">{{ item.label }}</span>
                <svg class="w-4 h-4 opacity-60" viewBox="0 0 24 24" fill="none">
                  <path
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="M9 6l6 6-6 6"
                  />
                </svg>
              </RouterLink>
            </template>

            <RouterLink
              @click="open = false"
              :to="{ path: '/teacher/profile' }"
              class="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition text-sm"
            >
              <span
                class="w-5 h-5 rounded-full bg-white/6 flex items-center justify-center text-xs"
                >{{ initials }}</span
              >
              <div class="text-sm">Perfil</div>
            </RouterLink>

            <button
              @click="logout"
              class="px-3 py-2 rounded-lg bg-red-600/80 hover:bg-red-600 text-left text-sm"
            >
              Salir
            </button>
          </div>
        </div>
      </transition>
    </header>

    <main class="max-w-7xl mx-auto px-4 py-6">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { ref, computed } from "vue";
import { useRoute, useRouter, RouterLink } from "vue-router";
import TeacherSessionService from "@/services/teacherSessionService";

const route = useRoute();
const router = useRouter();

const open = ref(false);
const profileOpen = ref(false);

const navItems = [
  {
    label: "Inicio",
    path: "/teacher/dashboard",
    icon: '<svg viewBox="0 0 24 24" fill="none"><path d="M3 12l9-9 9 9" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  },
  {
    label: "Cursos",
    path: "/teacher/courses",
    icon: '<svg viewBox="0 0 24 24" fill="none"><rect x="3" y="4" width="18" height="14" rx="2" stroke="currentColor" stroke-width="1.6"/></svg>',
  },
  {
    label: "Actividades",
    path: "/teacher/activities",
    icon: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 8v8M8 12h8" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  },
  {
    label: "Estudiantes",
    path: "/teacher/students",
    icon: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 12a4 4 0 100-8 4 4 0 000 8zM4 20a8 8 0 0116 0" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  },
  {
    label: "Calificaciones",
    path: "/teacher/grades",
    icon: '<svg viewBox="0 0 24 24" fill="none"><path d="M12 2v20M5 8h14" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  },
  {
    label: "Asistencias",
    path: "/teacher/attendances",
    icon: '<svg viewBox="0 0 24 24" fill="none"><path d="M9 11l3 3L22 4" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  },
];

function linkCls(path) {
  const active = route.path.startsWith(path);
  return active
    ? "bg-indigo-600/90 text-white"
    : "hover:bg-white/6 text-white/90";
}

const teacher = JSON.parse(localStorage.getItem("teacher") || "null") || {};
const teacherName = teacher.name || "Docente";
const teacherEmail = teacher.email || "";
const teacherNameShort = computed(() => {
  if (!teacherName) return "";
  return teacherName.split(" ").slice(0, 2).join(" ");
});
const initials = computed(() => {
  if (!teacherName) return "U";
  return teacherName
    .split(" ")
    .map((s) => s[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
});

async function logout() {
  try {
    await TeacherSessionService.logout();
  } catch {}
  localStorage.removeItem("token");
  localStorage.removeItem("teacher");
  localStorage.removeItem("sessionType");
  router.replace("/teacher/login");
}

function goToProfile() {
  profileOpen.value = false;
  router.push("/teacher/profile");
}
</script>

<style>
.fade-scale-enter-active,
.fade-scale-leave-active {
  transition: transform 0.12s ease, opacity 0.12s ease;
}
.fade-scale-enter-from,
.fade-scale-leave-to {
  transform: translateY(-6px) scale(0.98);
  opacity: 0;
}
.slide-fade-down-enter-active,
.slide-fade-down-leave-active {
  transition: transform 0.18s cubic-bezier(0.2, 0.8, 0.2, 1), opacity 0.18s;
}
.slide-fade-down-enter-from,
.slide-fade-down-leave-to {
  transform: translateY(-6px);
  opacity: 0;
}
[aria-expanded="true"] {
  outline: none;
}
</style>
