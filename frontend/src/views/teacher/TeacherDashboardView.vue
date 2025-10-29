<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <div class="text-2xl font-bold">Inicio</div>
        <div class="text-sm text-gray-400">
          Bienvenido {{ teacher?.name }} {{ teacher?.last_name }}
        </div>
      </div>
    </div>

    <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
      <n-card size="small"
        ><div class="text-gray-400 text-sm">Mis cursos</div>
        <div class="text-3xl font-bold mt-2">{{ stats.courses }}</div></n-card
      >
      <n-card size="small"
        ><div class="text-gray-400 text-sm">Actividades</div>
        <div class="text-3xl font-bold mt-2">
          {{ stats.activities }}
        </div></n-card
      >
      <n-card size="small"
        ><div class="text-gray-400 text-sm">Estudiantes</div>
        <div class="text-3xl font-bold mt-2">{{ stats.students }}</div></n-card
      >
      <n-card size="small"
        ><div class="text-gray-400 text-sm">Calificaciones</div>
        <div class="text-3xl font-bold mt-2">{{ stats.grades }}</div></n-card
      >
    </div>

    <n-card>
      <template #header>
        <div class="font-semibold">Mi Horario Semanal</div>
      </template>
      <div class="grid md:grid-cols-7 gap-3">
        <div
          v-for="d in weekdays"
          :key="d.key"
          class="bg-white/5 rounded-xl p-3"
        >
          <div class="text-xs text-gray-400 mb-2">{{ d.label }}</div>
          <div class="space-y-2">
            <div
              v-for="it in scheduleMap[d.key]"
              :key="it.courseId + it.start_time"
              class="rounded-lg p-2 bg-indigo-600/20"
            >
              <div class="text-sm font-medium">{{ it.courseName }}</div>
              <div class="text-xs text-gray-300">
                {{ it.start_time }} - {{ it.end_time }}
              </div>
              <div class="text-xs text-gray-400">
                {{ it.classroom || "Aula" }}
              </div>
            </div>
            <div
              v-if="!scheduleMap[d.key]?.length"
              class="text-xs text-gray-500"
            >
              Sin clases
            </div>
          </div>
        </div>
      </div>
    </n-card>

    <div class="grid grid-cols-2 md:grid-cols-4 gap-3">
      <n-button @click="go('/teacher/courses')" secondary>Ver Cursos</n-button>
      <n-button @click="go('/teacher/activities')" secondary
        >Crear Actividad</n-button
      >
      <n-button @click="go('/teacher/students')" secondary
        >Ver Estudiantes</n-button
      >
      <n-button @click="go('/teacher/grades')" type="primary"
        >Calificar</n-button
      >
    </div>

    <n-card>
      <template #header
        ><div class="font-semibold">Últimas Actividades</div></template
      >
      <div v-if="recentActivities.length">
        <ul class="divide-y divide-white/10">
          <li
            v-for="a in recentActivities"
            :key="a.id"
            class="py-3 flex items-center justify-between"
          >
            <div>
              <div class="font-medium">{{ a.title }}</div>
              <div class="text-xs text-gray-400">
                {{ a.course?.name || "-" }}
              </div>
            </div>
            <div class="text-xs text-gray-400">
              {{ formatDate(a.created_at) }}
            </div>
          </li>
        </ul>
      </div>
      <div v-else class="text-gray-500">No hay actividades recientes.</div>
    </n-card>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { NCard, NButton } from "naive-ui";
import TeacherSessionService from "@/services/teacherSessionService";

const router = useRouter();
const teacher = JSON.parse(localStorage.getItem("teacher") || "null");

const stats = ref({ courses: 0, activities: 0, students: 0, grades: 0 });
const recentActivities = ref([]);
const schedule = ref([]);
const weekdays = [
  { key: "LUNES", label: "Lunes" },
  { key: "MARTES", label: "Martes" },
  { key: "MIERCOLES", label: "Miércoles" },
  { key: "JUEVES", label: "Jueves" },
  { key: "VIERNES", label: "Viernes" },
  { key: "SABADO", label: "Sábado" },
  { key: "DOMINGO", label: "Domingo" },
];
const scheduleMap = computed(() => {
  const map = {};
  weekdays.forEach((w) => (map[w.key] = []));
  schedule.value.forEach((it) => {
    if (!map[it.weekday]) map[it.weekday] = [];
    map[it.weekday].push(it);
  });
  return map;
});

function formatDate(d) {
  try {
    return new Date(d).toLocaleString();
  } catch {
    return d;
  }
}
function go(p) {
  router.push(p);
}
function goProfile() {
  router.push("/teacher/profile");
}

async function loadData() {
  const [courses, activities] = await Promise.all([
    TeacherSessionService.getCourses(),
    TeacherSessionService.getActivities(),
  ]);
  stats.value.courses = courses?.length || 0;
  stats.value.activities = activities?.length || 0;
  const allStudents = new Set();
  courses?.forEach((c) =>
    c.enrollments?.forEach((e) => allStudents.add(e.studentId || e.student?.id))
  );
  stats.value.students = allStudents.size;
  const gradesCount =
    activities?.reduce((acc, a) => acc + (a.grades?.length || 0), 0) || 0;
  stats.value.grades = gradesCount;
  recentActivities.value = (activities || []).slice(0, 5);
  const sch = await TeacherSessionService.getWeeklySchedule({});
  schedule.value = sch?.schedule || [];
}

onMounted(loadData);
</script>
