<template>
  <app-layout>
    <div class="mx-auto max-w-6xl p-6 md:p-8 space-y-8">
      <div class="flex items-start justify-between gap-4">
        <div class="space-y-2">
          <h1 class="text-3xl md:text-4xl font-extrabold">
            {{ activity?.title || "Detalle de Actividad" }}
          </h1>
          <div class="flex flex-wrap items-center gap-2 text-sm">
            <span
              class="inline-flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5"
            >
              <span class="text-gray-300">Vence:</span>
              <strong class="text-white">{{ formattedDeadline }}</strong>
            </span>
            <span
              :class="[
                'inline-flex items-center gap-2 rounded-lg px-3 py-1.5 border',
                statusBadge.border,
                statusBadge.bg,
                statusBadge.text,
              ]"
            >
              <span
                class="h-2.5 w-2.5 rounded-full"
                :class="statusBadge.dot"
              ></span>
              {{ statusText }}
            </span>
          </div>
        </div>
        <div class="shrink-0 hidden sm:flex flex-col items-end gap-2 text-sm">
          <span
            class="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5"
          >
            <span class="text-gray-300">Curso:</span>
            <strong class="ml-1"
              >{{ activity?.course?.name }} -
              {{ activity?.course?.parallel }}</strong
            >
          </span>
          <span
            class="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5"
          >
            <span class="text-gray-300">Modalidad:</span>
            <strong class="ml-1">{{
              activity?.course?.modality?.name || "No especificado"
            }}</strong>
          </span>
          <span
            class="px-3 py-1.5 rounded-lg border border-white/10 bg-white/5"
          >
            <span class="text-gray-300">Docente:</span>
            <strong class="ml-1"
              >{{ activity?.teacher?.name }}
              {{ activity?.teacher?.last_name }}</strong
            >
          </span>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-3">
        <div class="lg:col-span-2 space-y-6">
          <section
            class="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5"
          >
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-bold">Descripción</h2>
              <span class="text-xs text-gray-400"
                >{{ pointsTotal }} puntos</span
              >
            </div>
            <p class="mt-3 text-gray-300 leading-relaxed">
              {{ activity?.description || "Sin descripción." }}
            </p>
          </section>

          <section
            class="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-5"
          >
            <div class="flex items-center justify-between">
              <h2 class="text-lg font-bold">Estudiantes</h2>
              <button
                @click="printReport"
                class="rounded-md bg-gradient-to-r from-[#3b82f6] to-[#2563eb] px-3 py-1.5 text-xs font-bold text-white hover:from-[#2563eb] hover:to-[#3b82f6] transition"
              >
                Imprimir
              </button>
            </div>
            <div class="mt-3 overflow-hidden rounded-xl border border-white/10">
              <table class="w-full text-sm">
                <thead class="bg-white/5">
                  <tr class="text-left text-gray-300">
                    <th class="px-4 py-3 w-10">#</th>
                    <th class="px-4 py-3">Estudiante</th>
                    <th class="px-4 py-3 text-center">Nota</th>
                    <th class="px-4 py-3 text-right">Acción</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="(g, i) in grades"
                    :key="g.id"
                    class="border-t border-white/5 hover:bg-white/5 transition"
                  >
                    <td class="px-4 py-3 text-gray-400">{{ i + 1 }}</td>
                    <td class="px-4 py-3">
                      <div class="flex items-center gap-2">
                        <img
                          v-if="g.studentImage"
                          :src="avatarSrc(g.studentImage)"
                          class="h-8 w-8 rounded-full object-cover ring-2 ring-white/10"
                          alt=""
                        />
                        <div
                          v-else
                          class="h-8 w-8 rounded-full bg-white/10 ring-2 ring-white/10"
                        ></div>
                        <span class="font-medium">{{ g.studentName }}</span>
                      </div>
                    </td>
                    <td class="px-4 py-3 text-center">
                      <span
                        :class="[
                          Number(g.score) >= 51
                            ? 'text-emerald-400'
                            : 'text-rose-400',
                          'font-semibold',
                        ]"
                      >
                        {{ g.score }}
                      </span>
                    </td>
                    <td class="px-4 py-3">
                      <div class="flex justify-end">
                        <template v-if="editingRow === g.id">
                          <div class="flex items-center gap-2">
                            <input
                              type="number"
                              min="0"
                              max="100"
                              v-model.number="editingScore"
                              class="w-20 rounded-md bg-[#0f1626] border border-white/10 px-2 py-1 text-center focus:outline-none focus:ring-2 focus:ring-[#3b82f6]/40"
                            />
                            <button
                              @click="saveEdit(g)"
                              class="rounded-md bg-gradient-to-r from-[#34d399] to-[#10b981] px-3 py-1.5 text-xs font-bold text-white hover:from-[#10b981] hover:to-[#34d399] transition"
                            >
                              Guardar
                            </button>
                            <button
                              @click="cancelEdit"
                              class="rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-bold text-gray-200 hover:bg-white/10 transition"
                            >
                              Cancelar
                            </button>
                          </div>
                        </template>
                        <template v-else>
                          <button
                            @click="startEdit(g)"
                            class="rounded-md bg-gradient-to-r from-[#1aff94] to-[#02cc6e] px-3 py-1.5 text-xs font-bold text-white hover:from-[#1aff94] hover:to-[#1aff94] transition"
                          >
                            Editar nota
                          </button>
                        </template>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="!grades || grades.length === 0">
                    <td colspan="4" class="px-4 py-6 text-center text-gray-400">
                      Sin calificaciones registradas.
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <p class="text-xs text-gray-400 mt-4">
              Promedio general de los estudiantes:
              <span
                class="font-bold"
                :class="
                  averageScore >= 51 ? 'text-emerald-400' : 'text-rose-400'
                "
              >
                {{ averageScore }}
              </span>
              puntos
            </p>
          </section>
        </div>

        <aside class="space-y-6">
          <section class="rounded-2xl border border-white/10 bg-[#101826] p-5">
            <h3 class="text-lg font-bold">Resumen</h3>
            <div class="mt-4 space-y-3 text-sm">
              <div class="flex items-center justify-between">
                <span class="text-gray-400">Paralelo</span>
                <span class="font-semibold"
                  >({{ activity?.course?.parallel }})</span
                >
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-400">Docente</span>
                <span class="font-semibold"
                  >{{ activity?.teacher?.name }}
                  {{ activity?.teacher?.last_name }}</span
                >
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-400">Modalidad</span>
                <span class="font-semibold">{{
                  activity?.course?.modality?.name || "—"
                }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-400">Puntaje</span>
                <span class="font-semibold">{{ pointsTotal }}</span>
              </div>
              <div class="flex items-center justify-between">
                <span class="text-gray-400">Promedio</span>
                <span
                  class="font-semibold"
                  :class="
                    averageScore >= 51 ? 'text-emerald-400' : 'text-rose-400'
                  "
                  >{{ averageScore }}</span
                >
              </div>
            </div>
          </section>
        </aside>
      </div>
    </div>
  </app-layout>
</template>

<script>
import AppLayout from "@/layouts/AppLayout.vue";
import ActivityService from "@/services/activityService";
import GradeService from "@/services/gradeService";
import { useMessage } from "naive-ui";
import * as pdfMake from "pdfmake/build/pdfmake";
import * as pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.vfs;

export default {
  name: "ActivityDetailView",
  components: { AppLayout },
  data() {
    return {
      activity: null,
      grades: [],
      checklist: [],
      selectedFile: null,
      isLoading: false,
      error: null,
      editingRow: null,
      editingScore: null,
      message: null,
    };
  },
  computed: {
    formattedDeadline() {
      const d = this.activity?.due_date;
      if (!d) return "—";
      const date = new Date(d);
      return date.toLocaleString();
    },
    statusText() {
      if (!this.activity?.due_date) return "Sin fecha";
      return new Date(this.activity.due_date) > new Date()
        ? "Abierta"
        : "Cerrada";
    },
    statusBadge() {
      const open = this.statusText === "Abierta";
      return {
        bg: open ? "bg-emerald-500/10" : "bg-rose-500/10",
        text: open ? "text-emerald-300" : "text-rose-300",
        border: open ? "border-emerald-400/20" : "border-rose-400/20",
        dot: open ? "bg-emerald-400" : "bg-rose-400",
      };
    },
    pointsTotal() {
      return this.activity?.points ?? 100;
    },
    averageScore() {
      if (!this.grades.length) return 0;
      const total = this.grades.reduce((a, g) => a + (Number(g.score) || 0), 0);
      return Number((total / this.grades.length).toFixed(2));
    },
  },
  methods: {
    avatarSrc(path) {
      return path?.startsWith("http") ? path : `http://localhost:3000${path}`;
    },
    startEdit(row) {
      this.editingRow = row.id;
      this.editingScore = Number(row.score) || 0;
    },
    cancelEdit() {
      this.editingRow = null;
      this.editingScore = null;
    },
    async saveEdit(row) {
      const score = Number(this.editingScore);
      if (isNaN(score) || score < 0 || score > 100) {
        this.message?.error("La nota debe estar entre 0 y 100");
        return;
      }
      try {
        await GradeService.updateGrade(row.id, { score });
        this.message?.success("Nota actualizada");
        this.editingRow = null;
        await this.fetchGrades();
      } catch {
        this.message?.error("Error al actualizar nota");
      }
    },
    async fetchActivity() {
      try {
        const activityId =
          this.$route.params.id || this.$route.query.activityId;
        const res = await ActivityService.getById(activityId);
        this.activity = res;
        this.checklist = res?.instructions || [];
      } catch (e) {
        this.error = "Error al cargar actividad.";
      }
    },
    async fetchGrades() {
      try {
        const activityId =
          this.$route.params.id || this.$route.query.activityId;
        const list = await GradeService.getGradesByActivity(activityId);
        this.grades = (list || []).map((g) => ({
          id: g.id,
          studentName: `${g.student?.name || ""} ${
            g.student?.last_name || ""
          }`.trim(),
          studentImage: g.student?.image || null,
          score: g.score != null ? Number(g.score) : 0,
          feedback: g.feedback || "",
        }));
      } catch (e) {
        this.error = "Error al cargar calificaciones.";
      }
    },
    printReport() {
      const doc = {
        content: [
          {
            text: this.activity?.title || "Reporte de Actividad",
            style: "header",
          },
          {
            text: `Curso: ${this.activity?.course?.name || ""} - ${
              this.activity?.course?.parallel || ""
            }`,
            margin: [0, 5, 0, 0],
          },
          {
            text: `Docente: ${this.activity?.teacher?.name || ""} ${
              this.activity?.teacher?.last_name || ""
            }`,
            margin: [0, 0, 0, 10],
          },
          {
            text: `Promedio general: ${this.averageScore}`,
            margin: [0, 0, 0, 10],
          },
          {
            table: {
              widths: ["auto", "*", "auto"],
              body: [
                ["#", "Estudiante", "Nota"],
                ...this.grades.map((g, i) => [i + 1, g.studentName, g.score]),
              ],
            },
          },
        ],
        styles: { header: { fontSize: 16, bold: true, margin: [0, 0, 0, 10] } },
      };
      pdfMake.createPdf(doc).open();
    },
  },
  async mounted() {
    this.message = useMessage();
    await this.fetchActivity();
    await this.fetchGrades();
  },
};
</script>
