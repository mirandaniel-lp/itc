<template>
  <app-layout>
    <div class="min-h-screen p-4">
      <n-card size="large">
        <template #header>
          <div class="flex flex-col gap-2">
            <div class="text-2xl font-bold text-primary-700">
              {{ activity?.title || "Detalle de Actividad" }}
            </div>
            <div
              class="text-base text-gray-600 mb-2"
              v-if="activity?.description"
            >
              {{ activity.description }}
            </div>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
              <div>
                <span class="font-semibold text-gray-700">Curso: </span>
                <span class="text-gray-800"
                  >{{ activity?.course?.name }} -
                  {{ activity?.course?.parallel }}</span
                >
              </div>
              <div>
                <span class="font-semibold text-gray-700">Modalidad: </span>
                <span class="text-gray-800">{{
                  activity?.course?.modality?.name || "-"
                }}</span>
              </div>
              <div>
                <span class="font-semibold text-gray-700">Docente: </span>
                <span class="text-gray-800"
                  >{{ activity?.teacher?.name }}
                  {{ activity?.teacher?.last_name }}</span
                >
              </div>
            </div>
          </div>
        </template>

        <div v-if="isLoading" class="text-center py-10">
          <n-spin size="large">Cargando...</n-spin>
        </div>
        <div v-else-if="error" class="text-center py-10 text-red-500">
          {{ error }}
        </div>
        <div v-else>
          <n-data-table
            :columns="columns"
            :data="grades"
            :bordered="false"
            :striped="true"
            class="mt-6"
            size="large"
            :pagination="false"
          />
        </div>
      </n-card>
    </div>
  </app-layout>
</template>

<script>
/* eslint-disable vue/no-unused-components */
import { h } from "vue";
import {
  NCard,
  NDataTable,
  NInputNumber,
  NButton,
  NSpin,
  useMessage,
} from "naive-ui";
import AppLayout from "@/layouts/AppLayout.vue";
import ActivityService from "@/services/activityService";
import GradeService from "@/services/gradeService";

export default {
  name: "ActivityDetailView",
  components: { AppLayout, NCard, NDataTable, NInputNumber, NButton, NSpin },
  data() {
    return {
      activity: null,
      grades: [],
      isLoading: false,
      error: null,
      editingRow: null,
      editingScore: null,
      message: null,
    };
  },
  computed: {
    columns() {
      return [
        {
          title: "#",
          key: "index",
          width: 60,
          render: (row, i) => i + 1,
        },
        {
          title: "Estudiante",
          key: "studentName",
          render: (row) =>
            h("div", { class: "flex items-center gap-2" }, [
              row.studentImage
                ? h("img", {
                    src: row.studentImage.startsWith("http")
                      ? row.studentImage
                      : `http://localhost:3000${row.studentImage}`,
                    alt: "Foto",
                    class: "w-8 h-8 rounded-full object-cover border",
                  })
                : h(
                    "span",
                    {
                      class:
                        "w-8 h-8 flex items-center justify-center rounded-full bg-gray-200 text-gray-500 border",
                    },
                    [
                      h(
                        "svg",
                        {
                          xmlns: "http://www.w3.org/2000/svg",
                          fill: "none",
                          viewBox: "0 0 24 24",
                          stroke: "currentColor",
                          class: "w-5 h-5",
                        },
                        [
                          h("path", {
                            "stroke-linecap": "round",
                            "stroke-linejoin": "round",
                            "stroke-width": "2",
                            d: "M5.121 17.804A9 9 0 1112 21a9 9 0 01-6.879-3.196zM15 11a3 3 0 11-6 0 3 3 0 016 0z",
                          }),
                        ]
                      ),
                    ]
                  ),
              h("span", { class: "font-medium" }, row.studentName),
            ]),
        },
        {
          title: "Nota",
          key: "score",
          width: 120,
          render: (row) =>
            this.editingRow === row.id
              ? h("input", {
                  type: "number",
                  min: 0,
                  max: 100,
                  value: this.editingScore,
                  style:
                    "width: 90px; padding: 4px; border-radius: 6px; border: 1px solid #ccc;",
                  autofocus: true,
                  placeholder: "Ingrese nota (0-100)",
                  onInput: (e) => (this.editingScore = e.target.value),
                  onKeyup: (e) => {
                    if (e.key === "Enter") this.saveEdit(row);
                  },
                })
              : h(
                  "span",
                  {
                    class:
                      row.score >= 51
                        ? "text-green-600 font-semibold"
                        : "text-red-600 font-semibold",
                  },
                  row.score
                ),
        },
        {
          title: "Observación",
          key: "feedback",
          render: (row) =>
            row.feedback
              ? h("span", { class: "text-gray-500" }, row.feedback)
              : "-",
        },
        {
          title: "Acciones",
          key: "actions",
          width: 120,
          render: (row) =>
            this.editingRow === row.id
              ? h(
                  NButton,
                  {
                    type: "primary",
                    size: "small",
                    onClick: () => this.saveEdit(row),
                  },
                  { default: () => "Guardar" }
                )
              : h(
                  NButton,
                  {
                    size: "small",
                    tertiary: true,
                    onClick: () => this.startEdit(row),
                  },
                  { default: () => "Editar Nota" }
                ),
        },
      ];
    },
  },
  methods: {
    async fetchActivity() {
      this.isLoading = true;
      this.error = null;
      try {
        const activityId =
          this.$route.params.id || this.$route.query.activityId;
        const res = await ActivityService.getById(activityId);
        this.activity = res;
        if (!res) {
          this.error = "No se encontró la actividad.";
        }
      } catch (e) {
        console.error("Error al cargar actividad:", e);
        this.error = "Error al cargar actividad.";
        if (this.message) this.message.error("Error al cargar actividad.");
      } finally {
        this.isLoading = false;
      }
    },
    async fetchGrades() {
      this.isLoading = true;
      try {
        const activityId =
          this.$route.params.id || this.$route.query.activityId;
        const res = await GradeService.getGradesByActivity(activityId);
        this.grades = res.data.grades.map((g) => ({
          id: g.id,
          studentName: `${g.student?.name || ""} ${g.student?.last_name || ""}`,
          studentImage: g.student?.image || null,
          score:
            g.score !== null && g.score !== undefined ? Number(g.score) : 0,
          feedback: g.feedback,
        }));
        if (!this.grades.length) {
          this.error = "No hay calificaciones registradas para esta actividad.";
        }
      } catch (e) {
        console.error("Error al cargar calificaciones:", e);
        this.error = "Error al cargar calificaciones.";
        if (this.message) this.message.error("Error al cargar calificaciones.");
      } finally {
        this.isLoading = false;
      }
    },
    startEdit(row) {
      this.editingRow = row.id;
      this.editingScore =
        typeof row.score === "number" ? row.score : Number(row.score) || 0;
    },
    async saveEdit(row) {
      const score = Number(this.editingScore);
      if (
        score === null ||
        score === undefined ||
        isNaN(score) ||
        score < 0 ||
        score > 100
      ) {
        this.message.error("La nota debe estar entre 0 y 100.");
        return;
      }
      try {
        await GradeService.updateGrade(row.id, { score });
        this.message.success("Nota actualizada.");
        this.editingRow = null;
        await this.fetchGrades();
      } catch {
        this.message.error("Error al actualizar nota.");
      }
    },
  },
  async mounted() {
    this.message = useMessage();
    await this.fetchActivity();
    await this.fetchGrades();
  },
};
</script>

<style scoped>
.n-data-table {
  background: transparent;
}
</style>
