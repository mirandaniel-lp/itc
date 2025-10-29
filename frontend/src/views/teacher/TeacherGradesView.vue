<template>
  <div class="space-y-6">
    <div class="text-2xl font-bold">Calificaciones</div>

    <n-card>
      <div class="grid md:grid-cols-2 gap-3">
        <n-select
          v-model:value="courseId"
          :options="courseOptions"
          placeholder="Curso"
        />
        <n-select
          v-model:value="activityId"
          :options="activityOptions"
          placeholder="Actividad"
        />
      </div>

      <div class="grid md:grid-cols-4 gap-3 mt-4">
        <n-card size="small">
          <div class="text-xs text-gray-400">Promedio</div>
          <div class="text-2xl font-bold mt-1">{{ metrics.avg }}</div>
        </n-card>
        <n-card size="small">
          <div class="text-xs text-gray-400">Mínimo</div>
          <div class="text-2xl font-bold mt-1">{{ metrics.min }}</div>
        </n-card>
        <n-card size="small">
          <div class="text-xs text-gray-400">Máximo</div>
          <div class="text-2xl font-bold mt-1">{{ metrics.max }}</div>
        </n-card>
        <n-card size="small">
          <div class="text-xs text-gray-400">Desv. Estándar</div>
          <div class="text-2xl font-bold mt-1">{{ metrics.std }}</div>
        </n-card>
      </div>
    </n-card>

    <!-- Herramientas rápidas -->
    <n-card>
      <div class="grid md:grid-cols-3 gap-3 items-end">
        <div>
          <div class="text-xs mb-1 text-gray-400">Nota para todos (0–100)</div>
          <n-input-number
            v-model:value="bulkScore"
            :min="0"
            :max="100"
            placeholder="Ej: 85"
          />
        </div>
        <div class="flex gap-2">
          <n-button :disabled="!canApplyBulk" @click="applyScoreToAll">
            Aplicar a todos
          </n-button>
          <n-button tertiary @click="clearAllScores">Limpiar notas</n-button>
          <n-button tertiary @click="clearAllFeedbacks"
            >Limpiar comentarios</n-button
          >
        </div>
        <div class="flex items-center justify-end gap-2">
          <n-button
            :disabled="!activityId || saving || hasInvalid"
            @click="save"
          >
            Guardar cambios
          </n-button>
          <n-button
            type="primary"
            :disabled="!activityId"
            @click="confirmPublish = true"
          >
            Publicar calificaciones
          </n-button>
        </div>
      </div>
      <div v-if="hasInvalid" class="mt-2 text-xs text-red-400">
        Hay notas fuera de rango. Corrige antes de guardar.
      </div>
    </n-card>

    <n-card>
      <table class="w-full text-sm">
        <thead class="text-left text-gray-400">
          <tr>
            <th class="py-2">Estudiante</th>
            <th class="py-2">CI</th>
            <th class="py-2">Nota</th>
            <th class="py-2">Comentario</th>
            <th class="py-2">Estado</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="row in rows"
            :key="row.studentId"
            class="border-t border-white/10"
          >
            <td class="py-2 font-medium">{{ row.studentName }}</td>
            <td class="py-2">{{ row.ci || "-" }}</td>
            <td class="py-2 w-40">
              <n-input-number v-model:value="row.score" :min="0" :max="100" />
            </td>
            <td class="py-2">
              <n-input
                v-model:value="row.feedback"
                placeholder="Comentario opcional"
              />
            </td>
            <td class="py-2">
              <n-tag type="success" v-if="row.is_published">Publicado</n-tag>
              <n-tag v-else>Pendiente</n-tag>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!rows.length" class="text-gray-500 mt-4">
        Selecciona curso y actividad.
      </div>
    </n-card>

    <n-modal
      v-model:show="confirmPublish"
      preset="card"
      title="Publicar Calificaciones"
    >
      <div class="text-sm text-gray-300">
        ¿Estás seguro de publicar las calificaciones? Los estudiantes podrán
        verlas y no se puede deshacer.
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
          <n-button @click="confirmPublish = false">Cancelar</n-button>
          <n-button type="primary" @click="publish">Publicar</n-button>
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from "vue";
import { useRoute } from "vue-router";
import {
  NCard,
  NButton,
  NSelect,
  NInputNumber,
  NInput,
  NModal,
  NTag,
  useMessage,
} from "naive-ui";
import TeacherSessionService from "@/services/teacherSessionService";

const message = useMessage();
const route = useRoute();

const courses = ref([]);
const activities = ref([]);
const rows = ref([]);

const courseId = ref(
  route.query.courseId ? Number(route.query.courseId) : null
);
const activityId = ref(
  route.query.activityId ? Number(route.query.activityId) : null
);

const saving = ref(false);
const confirmPublish = ref(false);

// Bulk tools
const bulkScore = ref(null);
const canApplyBulk = computed(
  () => activityId.value && bulkScore.value !== null && !isNaN(bulkScore.value)
);

// Options
const courseOptions = computed(() =>
  courses.value.map((c) => ({ label: c.name, value: Number(c.id) }))
);
const activityOptions = computed(() =>
  activities.value
    .filter(
      (a) => !courseId.value || Number(a.courseId) === Number(courseId.value)
    )
    .map((a) => ({ label: a.title, value: Number(a.id) }))
);

// Metrics
const metrics = computed(() => {
  const vals = rows.value.map((r) => Number(r.score)).filter((v) => !isNaN(v));
  const n = vals.length || 1;
  const avg = vals.reduce((a, b) => a + b, 0) / n;
  const min = vals.length ? Math.min(...vals) : 0;
  const max = vals.length ? Math.max(...vals) : 0;
  const std = Math.sqrt(vals.reduce((s, v) => s + Math.pow(v - avg, 2), 0) / n);
  return { avg: avg.toFixed(2), min, max, std: std.toFixed(2) };
});

// Validations
const hasInvalid = computed(() =>
  rows.value.some(
    (r) =>
      r.score !== null &&
      r.score !== undefined &&
      (isNaN(r.score) || r.score < 0 || r.score > 100)
  )
);

// Watchers
watch(courseId, async () => {
  await loadActivities();
  activityId.value = null;
  rows.value = [];
});
watch(activityId, async () => {
  if (activityId.value) await loadGrades();
});

// Loaders
async function loadCourses() {
  courses.value = await TeacherSessionService.getCourses();
}
async function loadActivities() {
  activities.value = await TeacherSessionService.getActivities({
    courseId: courseId.value,
  });
}
async function loadGrades() {
  const list = await TeacherSessionService.getGrades(activityId.value);
  rows.value = list.map((g) => ({
    studentId: g.studentId,
    studentName: `${g.student?.name || ""} ${g.student?.last_name || ""} ${
      g.student?.second_last_name || ""
    }`.trim(),
    ci: g.student?.ci || "",
    score: g.score !== null && g.score !== undefined ? Number(g.score) : null,
    feedback: g.feedback || "",
    is_published: g.is_published,
  }));
}

// Actions
function applyScoreToAll() {
  if (!activityId.value) {
    message.warning("Selecciona un curso y una actividad.");
    return;
  }
  if (bulkScore.value === null || isNaN(bulkScore.value)) {
    message.warning("Ingresa una nota válida.");
    return;
  }
  const s = Math.max(0, Math.min(100, Number(bulkScore.value)));
  rows.value = rows.value.map((r) => ({ ...r, score: s }));
  message.success("Se aplicó la nota a todos los estudiantes.");
}

function clearAllScores() {
  rows.value = rows.value.map((r) => ({ ...r, score: null }));
  message.info("Se limpiaron todas las notas.");
}

function clearAllFeedbacks() {
  rows.value = rows.value.map((r) => ({ ...r, feedback: "" }));
  message.info("Se limpiaron todos los comentarios.");
}

async function save() {
  if (!activityId.value) {
    message.warning("Selecciona un curso y una actividad.");
    return;
  }
  if (!rows.value.length) {
    message.info("No hay estudiantes para calificar.");
    return;
  }
  if (hasInvalid.value) {
    message.error(
      "Hay notas fuera de rango (0–100). Corrige antes de guardar."
    );
    return;
  }

  saving.value = true;
  try {
    await TeacherSessionService.saveGrades(
      activityId.value,
      rows.value.map((r) => ({
        studentId: r.studentId,
        score: r.score,
        feedback: r.feedback,
      }))
    );
    message.success("Se guardaron los cambios.");
    await loadGrades();
  } catch (e) {
    message.error("No se pudieron guardar las calificaciones.");
  } finally {
    saving.value = false;
  }
}

async function publish() {
  if (!activityId.value) return;
  try {
    await TeacherSessionService.publishGrades(activityId.value);
    confirmPublish.value = false;
    message.success("Calificaciones publicadas.");
    await loadGrades();
  } catch {
    message.error("No se pudieron publicar las calificaciones.");
  }
}

onMounted(async () => {
  await loadCourses();
  await loadActivities();
  if (activityId.value) await loadGrades();
});
</script>
