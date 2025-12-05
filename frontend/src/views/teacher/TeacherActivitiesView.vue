<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div class="text-2xl font-bold">Actividades</div>
      <n-button type="primary" @click="openCreate = true">Nuevo</n-button>
    </div>

    <n-card>
      <div class="grid md:grid-cols-2 gap-3">
        <n-select
          v-model:value="courseId"
          :options="courseOptions"
          placeholder="Todos los cursos"
          clearable
        />
        <n-select
          v-model:value="state"
          :options="stateOptions"
          placeholder="Todos los estados"
          clearable
        />
      </div>
    </n-card>

    <n-card>
      <table class="w-full text-sm">
        <thead class="text-left text-gray-400">
          <tr>
            <th class="py-2">Título</th>
            <th class="py-2">Curso</th>
            <th class="py-2">Tipo</th>
            <th class="py-2">Fecha</th>
            <th class="py-2">Pond.</th>
            <th class="py-2">Estado</th>
            <th class="py-2 text-right">Acciones</th>
          </tr>
        </thead>
        <tbody>
          <tr
            v-for="a in filtered"
            :key="a.id"
            class="border-t border-white/10"
          >
            <td class="py-3 font-medium">{{ a.title }}</td>
            <td class="py-3">{{ a.course?.name || "-" }}</td>
            <td class="py-3">
              <n-tag>{{ a.type }}</n-tag>
            </td>
            <td class="py-3">
              {{ a.due_date ? formatDate(a.due_date) : "-" }}
            </td>
            <td class="py-3">{{ a.weight_pct ?? "-" }}</td>
            <td class="py-3">
              <n-tag type="success" v-if="a.is_published">Publicada</n-tag>
              <n-tag type="warning" v-else>Borrador</n-tag>
            </td>
            <td class="py-3">
              <div class="flex justify-end gap-2">
                <n-button size="small" @click="onEdit(a)">Editar</n-button>
                <n-button size="small" @click="onTogglePublish(a)">
                  {{ a.is_published ? "Despublicar" : "Publicar" }}
                </n-button>
                <n-button size="small" type="error" @click="onRemove(a)"
                  >Eliminar</n-button
                >
                <n-button size="small" type="primary" @click="goGrade(a)"
                  >Calificar</n-button
                >
              </div>
            </td>
          </tr>
        </tbody>
      </table>
      <div v-if="!filtered.length" class="text-gray-500 mt-4">
        No hay actividades.
      </div>
    </n-card>

    <n-modal
      v-model:show="openCreate"
      preset="card"
      title="Nueva Actividad"
      style="max-width: 720px; width: 100%"
    >
      <n-form
        ref="createRef"
        :model="form"
        :rules="rules"
        label-placement="top"
        :require-mark-placement="'right-hanging'"
      >
        <div class="grid md:grid-cols-2 gap-4">
          <n-form-item label="Título" path="title">
            <n-input v-model:value="form.title" maxlength="100" />
          </n-form-item>

          <n-form-item label="Curso" path="courseId">
            <n-select
              v-model:value="form.courseId"
              :options="courseOptions"
              placeholder="Selecciona un curso"
            />
          </n-form-item>

          <n-form-item label="Tipo" path="type">
            <n-select
              v-model:value="form.type"
              :options="typeOptions"
              placeholder="Selecciona tipo"
              clearable
            />
          </n-form-item>

          <n-form-item label="Ponderación (%)" path="weight_pct">
            <n-input-number
              v-model:value="form.weight_pct"
              :min="0"
              :max="100"
              placeholder="0 a 100"
            />
          </n-form-item>

          <n-form-item label="Fecha de entrega" path="due_date">
            <n-date-picker
              v-model:value="formDate"
              type="date"
              placeholder="Fecha de entrega"
              format="dd/MM/yyyy"
              clearable
            />
          </n-form-item>

          <n-form-item
            class="md:col-span-2"
            label="Descripción"
            path="description"
          >
            <n-input
              v-model:value="form.description"
              type="textarea"
              :autosize="{ minRows: 3, maxRows: 6 }"
            />
          </n-form-item>
        </div>
      </n-form>
      <template #footer>
        <div class="flex justify-end gap-2">
          <n-button @click="openCreate = false">Cancelar</n-button>
          <n-button type="primary" :loading="saving" @click="onCreate"
            >Guardar</n-button
          >
        </div>
      </template>
    </n-modal>

    <n-modal
      v-model:show="openEdit"
      preset="card"
      title="Editar Actividad"
      style="max-width: 720px; width: 100%"
    >
      <n-form
        ref="editRef"
        :model="form"
        :rules="rules"
        label-placement="top"
        :require-mark-placement="'right-hanging'"
      >
        <div class="grid md:grid-cols-2 gap-4">
          <n-form-item label="Título" path="title">
            <n-input v-model:value="form.title" maxlength="100" />
          </n-form-item>

          <n-form-item label="Curso" path="courseId">
            <n-select
              v-model:value="form.courseId"
              :options="courseOptions"
              placeholder="Selecciona un curso"
            />
          </n-form-item>

          <n-form-item label="Tipo" path="type">
            <n-select
              v-model:value="form.type"
              :options="typeOptions"
              placeholder="Selecciona tipo"
              clearable
            />
          </n-form-item>

          <n-form-item label="Ponderación (%)" path="weight_pct">
            <n-input-number
              v-model:value="form.weight_pct"
              :min="0"
              :max="100"
              placeholder="0 a 100"
            />
          </n-form-item>

          <n-form-item label="Fecha de entrega" path="due_date">
            <n-date-picker
              v-model:value="formDate"
              type="date"
              placeholder="Fecha de entrega"
              format="dd/MM/yyyy"
              clearable
            />
          </n-form-item>

          <n-form-item
            class="md:col-span-2"
            label="Descripción"
            path="description"
          >
            <n-input
              v-model:value="form.description"
              type="textarea"
              :autosize="{ minRows: 3, maxRows: 6 }"
            />
          </n-form-item>
        </div>
      </n-form>
      <template #footer>
        <div class="flex justify-end gap-2">
          <n-button @click="openEdit = false">Cancelar</n-button>
          <n-button type="primary" :loading="saving" @click="onUpdate"
            >Guardar</n-button
          >
        </div>
      </template>
    </n-modal>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import {
  NCard,
  NButton,
  NInput,
  NSelect,
  NTag,
  NModal,
  NForm,
  NFormItem,
  NInputNumber,
  NDatePicker,
  useMessage,
} from "naive-ui";
import TeacherSessionService from "@/services/teacherSessionService";

const route = useRoute();
const router = useRouter();
const message = useMessage();

const courses = ref([]);
const activities = ref([]);
const courseId = ref(
  route.query.courseId ? Number(route.query.courseId) : null
);
const state = ref(null);

const stateOptions = [
  { label: "Publicadas", value: "pub" },
  { label: "Borrador", value: "draft" },
];

const typeOptions = [
  { label: "Examen", value: "EXAMEN" },
  { label: "Práctica", value: "PRACTICA" },
  { label: "Tarea", value: "TAREA" },
  { label: "Proyecto", value: "PROYECTO" },
  { label: "Otro", value: "OTRO" },
];

const courseOptions = computed(() =>
  courses.value.map((c) => ({ label: c.name, value: Number(c.id) }))
);

const filtered = computed(() =>
  activities.value.filter((a) => {
    const byC = courseId.value
      ? Number(a.courseId) === Number(courseId.value)
      : true;
    const byS =
      state.value === "pub"
        ? a.is_published
        : state.value === "draft"
        ? !a.is_published
        : true;
    return byC && byS;
  })
);

const openCreate = ref(false);
const openEdit = ref(false);
const saving = ref(false);

const form = ref({
  id: null,
  title: "",
  description: "",
  weight_pct: null,
  type: null,
  due_date: null,
  courseId: null,
});
const formDate = ref(null);

const rules = {
  title: {
    required: true,
    message: "Ingrese el título",
    trigger: ["blur", "input"],
  },
  courseId: {
    required: true,
    type: "number",
    message: "Seleccione un curso",
    trigger: ["change"],
  },
  type: { required: true, message: "Seleccione el tipo", trigger: ["change"] },
  weight_pct: {
    type: "number",
    min: 0,
    max: 100,
    message: "La ponderación debe estar entre 0 y 100",
    trigger: ["blur", "change"],
  },
};

const createRef = ref(null);
const editRef = ref(null);

function formatDate(d) {
  try {
    return new Date(d).toLocaleDateString();
  } catch {
    return d;
  }
}
function resetForm() {
  form.value = {
    id: null,
    title: "",
    description: "",
    weight_pct: null,
    type: null,
    due_date: null,
    courseId: courseId.value || null,
  };
  formDate.value = null;
}

function onEdit(a) {
  form.value = {
    id: a.id,
    title: a.title,
    description: a.description,
    weight_pct: a.weight_pct,
    type: a.type,
    due_date: a.due_date,
    courseId: Number(a.courseId),
  };
  formDate.value = a.due_date ? new Date(a.due_date).getTime() : null;
  openEdit.value = true;
}

function goGrade(a) {
  router.push({
    path: "/teacher/grades",
    query: { activityId: a.id, courseId: a.courseId },
  });
}

async function onCreate() {
  try {
    await createRef.value?.validate();
  } catch (err) {
    const first = Array.isArray(err) ? err[0] : err;
    message.error(first?.message || "Corrige los campos marcados.");
    return;
  }

  saving.value = true;
  try {
    const payload = {
      ...form.value,
      due_date: formDate.value ? new Date(formDate.value).toISOString() : null,
    };
    await TeacherSessionService.createActivity(payload);
    message.success("Actividad creada.");
    openCreate.value = false;
    await loadData();
    resetForm();
  } finally {
    saving.value = false;
  }
}

async function onUpdate() {
  try {
    await editRef.value?.validate();
  } catch (err) {
    const first = Array.isArray(err) ? err[0] : err;
    message.error(first?.message || "Corrige los campos marcados.");
    return;
  }

  saving.value = true;
  try {
    const payload = {
      ...form.value,
      due_date: formDate.value ? new Date(formDate.value).toISOString() : null,
    };
    await TeacherSessionService.updateActivity(form.value.id, payload);
    message.success("Cambios guardados.");
    openEdit.value = false;
    await loadData();
    resetForm();
  } finally {
    saving.value = false;
  }
}

async function onTogglePublish(a) {
  if (a.is_published) await TeacherSessionService.unpublishActivity(a.id);
  else await TeacherSessionService.publishActivity(a.id);
  await loadData();
}

async function onRemove(a) {
  await TeacherSessionService.deleteActivity(a.id);
  message.success("Actividad eliminada.");
  await loadData();
}

async function loadData() {
  courses.value = await TeacherSessionService.getCourses();
  const params = {};
  if (courseId.value) params.courseId = courseId.value;
  const list = await TeacherSessionService.getActivities(
    Object.keys(params).length ? params : undefined
  );
  activities.value = Array.isArray(list) ? list : list.activities ?? [];
}

watch(courseId, async () => {
  await loadData();
});

onMounted(loadData);
</script>
