<template>
  <app-layout>
    <div class="min-h-screen p-8">
      <div class="max-w-6xl mx-auto space-y-10">
        <div class="flex flex-col gap-6">
          <h1 class="text-4xl font-extrabold text-white">
            {{ activity?.title || "Detalle de Actividad" }}
          </h1>
          <div v-if="activity?.description" class="text-lg text-gray-300 mb-6">
            {{ activity.description }}
          </div>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-300">
            <div>
              <span class="font-semibold text-gray-200">Curso: </span>
              <span class="text-gray-400">{{ activity?.course?.name }} - {{ activity?.course?.parallel }}</span>
            </div>
            <div>
              <span class="font-semibold text-gray-200">Modalidad: </span>
              <span class="text-gray-400">{{ activity?.course?.modality?.name || "No especificado" }}</span>
            </div>
            <div>
              <span class="font-semibold text-gray-200">Docente: </span>
              <span class="text-gray-400">{{ activity?.teacher?.name }} {{ activity?.teacher?.last_name }}</span>
            </div>
          </div>
        </div>

        <div v-if="isLoading" class="text-center py-10">
          <n-spin size="large" class="text-white">Cargando...</n-spin>
        </div>

        <div v-else-if="error" class="text-center py-10 text-red-500">
          {{ error }}
        </div>

        <div v-else>
          <div class="overflow-hidden rounded-2xl bg-[#2a3541] shadow-xl backdrop-blur-sm">
            <n-data-table
              :columns="columns"
              :data="grades"
              :bordered="false"
              :striped="true"
              size="large"
              :pagination="false"
              :loading="isLoading"
              class="transition-all duration-300 ease-in-out mt-6 rounded-2xl"
            />
          </div>
        </div>
      </div>
    </div>
  </app-layout>
</template>

<script>
import { h } from "vue";
import { NDataTable, NSpin, useMessage } from "naive-ui";
import AppLayout from "@/layouts/AppLayout.vue";
import ActivityService from "@/services/activityService";
import GradeService from "@/services/gradeService";

export default {
  name: "ActivityDetailView",
  components: { AppLayout, NDataTable, NSpin },
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
                    class: "w-10 h-10 rounded-full object-cover border border-[#3b82f6]/40 shadow-lg",
                  })
                : h("span", { class: "w-10 h-10 flex items-center justify-center rounded-full bg-gray-300 text-gray-500 border" }, [
                    h("svg", { xmlns: "http://www.w3.org/2000/svg", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor", class: "w-5 h-5" }, [
                      h("path", {
                        "stroke-linecap": "round",
                        "stroke-linejoin": "round",
                        "stroke-width": "2",
                        d: "M5.121 17.804A9 9 0 1112 21a9 9 0 01-6.879-3.196zM15 11a3 3 0 11-6 0 3 3 0 016 0z",
                      }),
                    ]),
                  ]),
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
                  class: "p-3 rounded-md bg-[#333] text-white border border-[#444] focus:outline-none focus:ring-2 focus:ring-blue-500",
                  autofocus: true,
                  placeholder: "Ingrese nota",
                  onInput: (e) => (this.editingScore = e.target.value),
                  onKeyup: (e) => {
                    if (e.key === "Enter") this.saveEdit(row);
                  },
                })
              : h("span", {
                  class: row.score >= 51 ? "text-green-600 font-semibold" : "text-red-600 font-semibold",
                }, row.score),
        },
        {
          title: "Observación",
          key: "feedback",
          render: (row) => row.feedback ? h("span", { class: "text-gray-500" }, row.feedback) : "-",
        },
        {
          title: "Acciones",
          key: "actions",
          width: 120,
          render: (row) =>
            this.editingRow === row.id
              ? h(
                  "button",
                  {
                    type: "button",
                    class:
                      "bg-gradient-to-r from-[#34d399] to-[#10b981] text-white rounded-md py-2 px-4 transition-all hover:from-[#10b981] hover:to-[#34d399] shadow-lg",
                    onClick: () => this.saveEdit(row),
                  },
                  "Guardar"
                )
              : h(
                  "button",
                  {
                    type: "button",
                    class:
                      "bg-gradient-to-r from-[#3b82f6] to-[#2563eb] text-white rounded-md py-2 px-4 transition-all hover:from-[#2563eb] hover:to-[#3b82f6] shadow-lg",
                    onClick: () => this.startEdit(row),
                  },
                  "Editar Nota"
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
        const activityId = this.$route.params.id || this.$route.query.activityId;
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
        const activityId = this.$route.params.id || this.$route.query.activityId;
        const res = await GradeService.getGradesByActivity(activityId);
        this.grades = res.data.grades.map((g) => ({
          id: g.id,
          studentName: `${g.student?.name || ""} ${g.student?.last_name || ""}`,
          studentImage: g.student?.image || null,
          score: g.score !== null && g.score !== undefined ? Number(g.score) : 0,
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
      this.editingScore = typeof row.score === "number" ? row.score : Number(row.score) || 0;
    },
    async saveEdit(row) {
      const score = Number(this.editingScore);
      if (score === null || score === undefined || isNaN(score) || score < 0 || score > 100) {
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
