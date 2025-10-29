<template>
  <app-layout>
    <div class="min-h-screen p-8 bg-[#0f172a] text-white">
      <div class="max-w-6xl mx-auto space-y-8">
        <div
          class="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <h1 class="text-4xl font-extrabold text-[#ffffff]">
            Análisis Predictivo de Riesgo de Deserción
          </h1>
          <div class="flex items-center gap-3 w-full md:w-auto">
            <n-select
              v-model:value="courseId"
              :options="courseOptions"
              placeholder="Seleccionar curso"
              class="w-full md:w-80"
              :loading="loadingCourses"
            />
            <n-button
              type="primary"
              size="large"
              class="rounded-lg font-extrabold"
              :disabled="!courseId"
              :loading="loadingPredict"
              @click="onDetect"
            >
              Detectar Riesgo
            </n-button>
          </div>
        </div>

        <div class="grid md:grid-cols-4 gap-4">
          <div
            class="rounded-2xl border border-[#334155] bg-[#1e293b]/80 p-5 shadow-[0_6px_25px_rgba(0,0,0,0.4)]"
          >
            <div class="text-gray-300 text-sm">Total Estudiantes</div>
            <div class="text-3xl font-extrabold mt-2">{{ stats.total }}</div>
            <div class="text-xs text-gray-400">Estudiantes analizados</div>
          </div>
          <div
            class="rounded-2xl border border-[#334155] bg-[#1e293b]/80 p-5 shadow-[0_6px_25px_rgba(0,0,0,0.4)]"
          >
            <div class="text-gray-300 text-sm">Alto Riesgo</div>
            <div class="text-3xl font-extrabold mt-2 text-[#ef4444]">
              {{ stats.high }}
            </div>
            <div class="text-xs text-gray-400">
              {{ pct(stats.high, stats.total) }} del total
            </div>
          </div>
          <div
            class="rounded-2xl border border-[#334155] bg-[#1e293b]/80 p-5 shadow-[0_6px_25px_rgba(0,0,0,0.4)]"
          >
            <div class="text-gray-300 text-sm">Riesgo Medio</div>
            <div class="text-3xl font-extrabold mt-2 text-[#f59e0b]">
              {{ stats.medium }}
            </div>
            <div class="text-xs text-gray-400">
              {{ pct(stats.medium, stats.total) }} del total
            </div>
          </div>
          <div
            class="rounded-2xl border border-[#334155] bg-[#1e293b]/80 p-5 shadow-[0_6px_25px_rgba(0,0,0,0.4)]"
          >
            <div class="text-gray-300 text-sm">Bajo Riesgo</div>
            <div class="text-3xl font-extrabold mt-2 text-[#22c55e]">
              {{ stats.low }}
            </div>
            <div class="text-xs text-gray-400">
              {{ pct(stats.low, stats.total) }} del total
            </div>
          </div>
        </div>

        <div
          class="rounded-2xl border border-[#334155] bg-[#1e293b]/80 p-4 shadow-[0_6px_25px_rgba(0,0,0,0.4)]"
        >
          <div class="flex flex-wrap gap-3">
            <n-button
              :disabled="!courseId || !items.length"
              :loading="saving"
              class="rounded-lg font-extrabold"
              @click="onPersist"
            >
              Guardar Resultados
            </n-button>
            <n-button
              tertiary
              class="rounded-lg font-extrabold"
              @click="openTrain = true"
            >
              Actualizar Modelo
            </n-button>
            <n-button
              tertiary
              :disabled="!courseId"
              :loading="validating"
              class="rounded-lg font-extrabold"
              @click="onValidate"
            >
              Validar Precisión
            </n-button>
            <n-button
              tertiary
              :disabled="!items.length"
              class="rounded-lg font-extrabold"
              @click="exportCsv"
            >
              Exportar CSV
            </n-button>
            <div class="ml-auto text-xs text-gray-400" v-if="meta.version">
              Versión:
              <span class="text-white font-semibold">{{ meta.version }}</span> •
              Umbral: {{ meta.threshold?.toFixed(3) }} • Contaminación:
              {{ meta.contamination }}
            </div>
          </div>
        </div>

        <div
          class="rounded-2xl border border-[#334155] bg-[#1e293b]/80 p-4 shadow-[0_6px_25px_rgba(0,0,0,0.4)]"
        >
          <div class="text-gray-300 text-sm mb-3">Filtros</div>
          <div class="grid lg:grid-cols-4 gap-4">
            <n-select
              v-model:value="riskFilter"
              :options="riskLevelOptions"
              placeholder="Nivel de riesgo"
            />
            <n-input v-model:value="q" placeholder="Buscar por nombre o CI" />
            <div class="flex items-center gap-3">
              <div class="text-xs text-gray-400 w-44">
                Puntuación Mínima: {{ scoreMin.toFixed(2) }}
              </div>
              <n-slider
                v-model:value="scoreMin"
                :min="0"
                :max="1"
                :step="0.01"
              />
            </div>
            <n-button
              secondary
              class="rounded-lg font-extrabold"
              @click="onlyAlerts = !onlyAlerts"
            >
              {{ onlyAlerts ? "Mostrar todos" : "Solo alertas" }}
            </n-button>
          </div>
          <div class="mt-4 flex gap-2">
            <button
              :class="tab === 'table' ? activeTab : baseTab"
              @click="tab = 'table'"
            >
              Tabla de Estudiantes
            </button>
            <button
              :class="tab === 'charts' ? activeTab : baseTab"
              @click="tab = 'charts'"
            >
              Gráficos y Análisis
            </button>
          </div>
        </div>

        <div
          v-if="tab === 'table'"
          class="rounded-2xl overflow-hidden border border-[#334155] shadow-[0_6px_25px_rgba(0,0,0,0.4)] bg-[#1e293b]/80 backdrop-blur-sm"
        >
          <n-data-table
            :loading="loadingPredict"
            :columns="columns"
            :data="paginated"
            :pagination="false"
            :bordered="false"
            size="large"
            class="[&_.n-data-table-th]:text-center [&_.n-data-table-th]:font-extrabold [&_.n-data-table-td]:text-center [&_.n-data-table-tr:hover]:bg-[#1d4ed8]/20 transition-all"
          />
          <div class="flex justify-end p-4">
            <n-pagination
              v-model:page="page"
              :page-size="pageSize"
              :item-count="filtered.length"
              class="rounded-xl font-extrabold px-3 py-2 bg-[#1e293b] border border-[#3b82f6]/60 shadow-[0_0_20px_rgba(37,99,235,0.3)] text-white [&_.n-pagination-item]:bg-transparent [&_.n-pagination-item]:text-gray-200 [&_.n-pagination-item--active]:bg-[#2563eb] [&_.n-pagination-item--active]:text-white"
            />
          </div>
        </div>

        <div v-else class="grid md:grid-cols-2 gap-4">
          <div
            class="rounded-2xl border border-[#334155] bg-[#1e293b]/80 p-5 shadow-[0_6px_25px_rgba(0,0,0,0.4)]"
          >
            <div class="text-sm text-gray-300 mb-2">Distribución de Riesgo</div>
            <div class="grid grid-cols-3 gap-3">
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full bg-[#ef4444]"></div>
                <div class="text-xs text-gray-300">Alto: {{ stats.high }}</div>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full bg-[#f59e0b]"></div>
                <div class="text-xs text-gray-300">
                  Medio: {{ stats.medium }}
                </div>
              </div>
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 rounded-full bg-[#22c55e]"></div>
                <div class="text-xs text-gray-300">Bajo: {{ stats.low }}</div>
              </div>
            </div>
            <div class="mt-4 h-3 bg-white/10 rounded-full overflow-hidden flex">
              <div
                class="h-3 bg-[#ef4444]"
                :style="{ width: pctNum(stats.high, stats.total) + '%' }"
              ></div>
              <div
                class="h-3 bg-[#f59e0b]"
                :style="{ width: pctNum(stats.medium, stats.total) + '%' }"
              ></div>
              <div
                class="h-3 bg-[#22c55e]"
                :style="{ width: pctNum(stats.low, stats.total) + '%' }"
              ></div>
            </div>
          </div>
          <div
            class="rounded-2xl border border-[#334155] bg-[#1e293b]/80 p-5 shadow-[0_6px_25px_rgba(0,0,0,0.4)]"
          >
            <div class="text-sm text-gray-300 mb-3">
              Estudiantes de Mayor Riesgo
            </div>
            <div class="space-y-3">
              <div
                v-for="r in top5"
                :key="r.student_id"
                class="flex items-center gap-3"
              >
                <div class="w-44 text-xs text-gray-300 truncate">
                  {{ r.studentName || "Estudiante" }}
                </div>
                <div class="flex-1 h-2 bg-white/10 rounded">
                  <div
                    class="h-2 rounded bg-[#ef4444]"
                    :style="{ width: (r.risk_score01 * 100).toFixed(0) + '%' }"
                  ></div>
                </div>
                <div class="w-12 text-right text-xs text-gray-300">
                  {{ r.risk_score01.toFixed(2) }}
                </div>
              </div>
            </div>
          </div>
          <div
            class="md:col-span-2 rounded-2xl border border-[#334155] bg-[#1e293b]/80 p-5 shadow-[0_6px_25px_rgba(0,0,0,0.4)]"
          >
            <div class="text-sm text-gray-300 mb-2">
              Asistencia vs Promedio de Calificaciones
            </div>
            <div class="grid grid-cols-4 gap-4">
              <div
                v-for="r in top4ForBars"
                :key="r.student_id"
                class="flex flex-col items-center"
              >
                <div
                  class="w-12 bg-[#60a5fa]/70 rounded-t h-40 relative overflow-hidden"
                >
                  <div
                    class="absolute bottom-0 left-0 right-0 bg-[#60a5fa]"
                    :style="{ height: attPct(r) * 100 + '%' }"
                  ></div>
                </div>
                <div
                  class="w-12 bg-[#a78bfa]/70 rounded-b h-16 -mt-1 relative overflow-hidden"
                >
                  <div
                    class="absolute bottom-0 left-0 right-0 bg-[#a78bfa]"
                    :style="{ height: gradePct(r) * 100 + '%' }"
                  ></div>
                </div>
                <div
                  class="text-xs text-gray-300 mt-1 truncate w-24 text-center"
                >
                  {{ r.studentName || "Est." }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <n-drawer v-model:show="showDetail" width="420">
          <n-drawer-content title="Detalles del Estudiante">
            <div class="space-y-4">
              <div
                class="rounded-2xl border border-[#334155] bg-[#1e293b]/80 p-4"
              >
                <div class="text-lg font-extrabold">
                  {{ detail?.studentName || "Estudiante" }}
                </div>
                <div class="text-xs text-gray-400">{{ detail?.ci || "-" }}</div>
              </div>
              <div
                class="rounded-2xl border border-[#334155] bg-[#1e293b]/80 p-4"
              >
                <div class="text-sm text-gray-300">Estado de Riesgo</div>
                <div class="flex items-center justify-between mt-2">
                  <n-tag
                    round
                    size="small"
                    :style="levelStyle(levelOf(detail))"
                    >{{ levelLabel(levelOf(detail)) }}</n-tag
                  >
                  <div class="text-2xl font-extrabold">
                    {{ Math.round((detail?.risk_score01 || 0) * 100) }}/100
                  </div>
                </div>
              </div>
              <div
                class="rounded-2xl border border-[#334155] bg-[#1e293b]/80 p-4"
              >
                <div class="text-sm text-gray-300 mb-2">
                  Factores de Riesgo Identificados
                </div>
                <ul class="list-disc pl-5 text-sm text-gray-300">
                  <li v-for="f in detail?.reasons || []" :key="f">{{ f }}</li>
                  <li v-if="!(detail?.reasons || []).length">
                    Sin factores destacados
                  </li>
                </ul>
              </div>
              <div
                class="rounded-2xl border border-[#334155] bg-[#1e293b]/80 p-4"
              >
                <div class="text-sm text-gray-300 mb-2">
                  Acciones Recomendadas
                </div>
                <ul class="list-disc pl-5 text-sm text-gray-300 space-y-1">
                  <li>Programar reunión individual</li>
                  <li>Contactar al tutor académico</li>
                  <li>Ofrecer apoyo académico adicional</li>
                  <li>Monitorear semanalmente</li>
                </ul>
                <div class="flex gap-2 mt-3">
                  <n-button type="primary">Enviar Correo</n-button>
                  <n-button secondary>Generar Reporte</n-button>
                </div>
              </div>
            </div>
          </n-drawer-content>
        </n-drawer>

        <n-modal
          v-model:show="openTrain"
          preset="card"
          title="Actualizar Modelo"
          style="max-width: 520px; width: 100%"
        >
          <div class="space-y-4">
            <div class="text-sm text-gray-300">Contaminación</div>
            <n-slider
              v-model:value="contamination"
              :min="0.05"
              :max="0.3"
              :step="0.01"
            />
            <div class="text-sm text-gray-300">
              Valor: {{ contamination.toFixed(2) }}
            </div>
            <div class="flex justify-end gap-2">
              <n-button @click="openTrain = false">Cancelar</n-button>
              <n-button type="primary" :loading="training" @click="onTrain"
                >Entrenar</n-button
              >
            </div>
            <div v-if="trainResult" class="text-xs text-gray-400">
              Versión:
              <span class="text-white">{{ trainResult.version }}</span> •
              Umbral: {{ trainResult.threshold?.toFixed(3) }} • Filas:
              {{ trainResult.n_rows }}
            </div>
          </div>
        </n-modal>

        <n-modal
          v-model:show="openValidate"
          preset="card"
          title="Validación de Precisión"
          style="max-width: 520px; width: 100%"
        >
          <div class="space-y-3">
            <div class="text-sm text-gray-300">
              Precisión: {{ (validateResult?.precision || 0).toFixed(2) }} •
              Recall: {{ (validateResult?.recall || 0).toFixed(2) }}
            </div>
            <table class="w-full text-sm">
              <thead class="text-left text-gray-400">
                <tr>
                  <th class="py-2">Métrica</th>
                  <th class="py-2">Valor</th>
                </tr>
              </thead>
              <tbody>
                <tr class="border-t border-white/10">
                  <td class="py-2">TP</td>
                  <td class="py-2">{{ validateResult?.tp || 0 }}</td>
                </tr>
                <tr class="border-t border-white/10">
                  <td class="py-2">FP</td>
                  <td class="py-2">{{ validateResult?.fp || 0 }}</td>
                </tr>
                <tr class="border-t border-white/10">
                  <td class="py-2">TN</td>
                  <td class="py-2">{{ validateResult?.tn || 0 }}</td>
                </tr>
                <tr class="border-t border-white/10">
                  <td class="py-2">FN</td>
                  <td class="py-2">{{ validateResult?.fn || 0 }}</td>
                </tr>
              </tbody>
            </table>
            <div class="text-xs text-gray-400">
              Versión:
              <span class="text-white">{{
                validateResult?.version || meta.version || "-"
              }}</span>
            </div>
            <div class="flex justify-end">
              <n-button type="primary" @click="openValidate = false"
                >Cerrar</n-button
              >
            </div>
          </div>
        </n-modal>
      </div>
    </div>
  </app-layout>
</template>

<script>
import {
  NSelect,
  NButton,
  NSlider,
  NInput,
  NTag,
  NModal,
  NDrawer,
  NDrawerContent,
  NDataTable,
  NPagination,
  useMessage,
} from "naive-ui";
import { h } from "vue";
import AppLayout from "@/layouts/AppLayout.vue";
import riskService from "@/services/riskService";
import CourseService from "@/services/courseService";

export default {
  name: "RiskAnalysisView",
  components: {
    AppLayout,
    NSelect,
    NButton,
    NSlider,
    NInput,
    NTag,
    NModal,
    NDrawer,
    NDrawerContent,
    NDataTable,
    NPagination,
  },
  data() {
    return {
      message: null,
      courses: [],
      loadingCourses: false,
      courseId: null,
      items: [],
      meta: { threshold: null, contamination: null, version: null },
      riskFilter: "all",
      riskLevelOptions: [
        { label: "Todos los niveles", value: "all" },
        { label: "Alto Riesgo", value: "high" },
        { label: "Riesgo Medio", value: "medium" },
        { label: "Bajo Riesgo", value: "low" },
      ],
      q: "",
      scoreMin: 0,
      onlyAlerts: false,
      tab: "table",
      page: 1,
      pageSize: 10,
      loadingPredict: false,
      saving: false,
      training: false,
      validating: false,
      openTrain: false,
      contamination: 0.18,
      trainResult: null,
      openValidate: false,
      validateResult: null,
      showDetail: false,
      detail: null,
      baseTab:
        "px-3 py-1.5 rounded-lg text-sm font-extrabold bg-[#0b1224] border border-[#334155] text-gray-300",
      activeTab:
        "px-3 py-1.5 rounded-lg text-sm font-extrabold bg-[#2563eb] text-white border border-[#3b82f6]/60",
      columns: [],
    };
  },
  computed: {
    courseOptions() {
      return this.courses.map((c) => ({
        label: `${c.name}${c.parallel ? " – " + c.parallel : ""}`,
        value: Number(c.id),
      }));
    },
    filtered() {
      const text = (this.q || "").toLowerCase();
      return this.items
        .filter((r) =>
          this.riskFilter === "all" ? true : this.levelOf(r) === this.riskFilter
        )
        .filter((r) => r.risk_score01 >= this.scoreMin)
        .filter((r) => (this.onlyAlerts ? r.alert : true))
        .filter((r) =>
          `${r.studentName || ""} ${r.ci || ""}`.toLowerCase().includes(text)
        )
        .sort((a, b) => b.risk_score01 - a.risk_score01);
    },
    paginated() {
      const start = (this.page - 1) * this.pageSize;
      return this.filtered.slice(start, start + this.pageSize);
    },
    stats() {
      const total = this.items.length;
      const high = this.items.filter((r) => this.levelOf(r) === "high").length;
      const medium = this.items.filter(
        (r) => this.levelOf(r) === "medium"
      ).length;
      const low = this.items.filter((r) => this.levelOf(r) === "low").length;
      return { total, high, medium, low };
    },
    top5() {
      return this.filtered.slice(0, 5);
    },
    top4ForBars() {
      return this.filtered.slice(0, 4);
    },
  },
  watch: {
    async courseId(val) {
      if (val) {
        this.page = 1;
        await this.onDetect();
      }
    },
  },
  methods: {
    levelOf(r) {
      const s = Number(r?.risk_score01 || 0);
      if (s >= 0.66) return "high";
      if (s >= 0.33) return "medium";
      return "low";
    },
    levelLabel(l) {
      return l === "high"
        ? "Alto Riesgo"
        : l === "medium"
        ? "Riesgo Medio"
        : "Bajo Riesgo";
    },
    levelStyle(l) {
      const c =
        l === "high" ? "#ef4444" : l === "medium" ? "#f59e0b" : "#22c55e";
      return { background: c, color: "#111827" };
    },
    pct(a, b) {
      if (!b) return "0.0%";
      return `${((a / b) * 100).toFixed(1)}%`;
    },
    pctNum(a, b) {
      if (!b) return 0;
      return (a / b) * 100;
    },
    attPct(r) {
      return Math.min(Math.max(r.attendance_pct ?? 0.75, 0), 1);
    },
    gradePct(r) {
      const g = r.grade_avg ?? 60;
      return Math.min(Math.max(g / 100, 0), 1);
    },

    async loadCourses() {
      this.loadingCourses = true;
      try {
        const list = await CourseService.getAll();
        this.courses = list || [];
        if (!this.courseId && this.courses.length)
          this.courseId = Number(this.courses[0].id);
      } finally {
        this.loadingCourses = false;
      }
    },

    async onDetect() {
      if (!this.courseId) return;
      this.loadingPredict = true;
      try {
        const res = await riskService.getPredictions(this.courseId);
        this.items = res.items || [];
        this.meta = {
          threshold: res.threshold,
          contamination: res.contamination,
          version: res.version || this.meta.version,
        };
        this.page = 1;
        this.message.success(`Analizados ${res.n}`);
      } catch {
        this.message.error("No se pudo obtener predicciones");
      } finally {
        this.loadingPredict = false;
      }
    },

    async onPersist() {
      this.saving = true;
      try {
        const r = await riskService.persistPredictions(this.courseId);
        this.message.success(
          `Guardados ${r.saved} de ${r.n} • Versión ${r.version}`
        );
        await this.onDetect();
      } catch {
        this.message.error("No se pudieron guardar los resultados");
      } finally {
        this.saving = false;
      }
    },

    async onTrain() {
      this.training = true;
      try {
        const r = await riskService.train({
          contamination: Number(this.contamination),
        });
        this.trainResult = r;
        this.meta = {
          threshold: r.threshold,
          contamination: r.contamination,
          version: r.version,
        };
        this.message.success(`Modelo actualizado: ${r.version}`);
        this.openTrain = false;
        await this.onDetect();
      } catch {
        this.message.error("No se pudo entrenar el modelo");
      } finally {
        this.training = false;
      }
    },

    async onValidate() {
      this.validating = true;
      try {
        const r = await riskService.validateCourse(this.courseId);
        this.validateResult = r;
        this.openValidate = true;
      } catch {
        this.message.error("No se pudo validar");
      } finally {
        this.validating = false;
      }
    },

    exportCsv() {
      const rows = [
        [
          "Estudiante",
          "CI",
          "Nivel de Riesgo",
          "Puntuación",
          "Alerta",
          "Motivos",
        ],
      ];
      this.filtered.forEach((r) =>
        rows.push([
          r.studentName || "",
          r.ci || "",
          this.levelLabel(this.levelOf(r)),
          r.risk_score01?.toFixed(4) || "0",
          r.alert ? "Sí" : "No",
          (r.reasons || []).join(" | "),
        ])
      );
      const csv = rows
        .map((x) =>
          x.map((s) => `"${String(s).replace(/"/g, '""')}"`).join(",")
        )
        .join("\n");
      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "riesgo_desercion.csv";
      a.click();
      URL.revokeObjectURL(url);
    },

    openDetailRow(r) {
      this.detail = r;
      this.showDetail = true;
    },

    buildColumns() {
      this.columns = [
        {
          title: "#",
          key: "index",
          width: 60,
          align: "center",
          render: (_, index) => index + 1 + (this.page - 1) * this.pageSize,
        },
        {
          title: "Estudiante",
          key: "student",
          align: "left",
          render: (row) =>
            h("div", { class: "text-left" }, [
              h(
                "div",
                { class: "font-extrabold text-white" },
                row.studentName || "Estudiante"
              ),
              h("div", { class: "text-xs text-gray-400" }, row.ci || "-"),
            ]),
        },
        {
          title: "Nivel de Riesgo",
          key: "level",
          render: (row) =>
            h(
              "span",
              {
                class:
                  "inline-flex items-center justify-center px-3 py-1 rounded-full text-xs font-bold",
                style: this.levelStyle(this.levelOf(row)),
              },
              this.levelLabel(this.levelOf(row))
            ),
        },
        {
          title: "Puntuación",
          key: "score",
          width: 220,
          render: (row) =>
            h("div", { class: "flex items-center gap-3 justify-center" }, [
              h(
                "div",
                {
                  class:
                    "w-40 h-2 bg白/10 rounded-full overflow-hidden".replace(
                      "白",
                      "white"
                    ),
                },
                [
                  h("div", {
                    class: "h-2",
                    style: {
                      width: `${(row.risk_score01 * 100).toFixed(0)}%`,
                      background:
                        row.risk_score01 >= 0.66
                          ? "#ef4444"
                          : row.risk_score01 >= 0.33
                          ? "#f59e0b"
                          : "#22c55e",
                    },
                  }),
                ]
              ),
              h(
                "div",
                { class: "text-xs text-gray-300" },
                row.risk_score01.toFixed(2)
              ),
            ]),
        },
        {
          title: "Alerta",
          key: "alert",
          render: (row) =>
            h(
              "span",
              {
                class: "px-3 py-1 rounded-full text-xs font-bold",
                style: {
                  background: row.alert ? "#ef4444" : "#22c55e",
                  color: "#111827",
                },
              },
              row.alert ? "Sí" : "No"
            ),
        },
        {
          title: "Motivos",
          key: "reasons",
          render: (row) =>
            h(
              "div",
              { class: "text-xs text-gray-300 truncate max-w-xs" },
              (row.reasons || []).join(" · ") || "-"
            ),
        },
        {
          title: "Acciones",
          key: "actions",
          render: (row) =>
            h(
              "button",
              {
                class:
                  "px-3 py-1.5 rounded-lg text-sm font-bold bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] text-white hover:shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all",
                onClick: () => this.openDetailRow(row),
              },
              "Ver detalle"
            ),
        },
      ];
    },
  },
  async created() {
    this.message = useMessage();
    this.buildColumns();
    await this.loadCourses();
    try {
      const hlt = await riskService.health();
      if (hlt?.threshold) this.meta.threshold = hlt.threshold;
      if (hlt?.contamination) this.meta.contamination = hlt.contamination;
      if (hlt?.version) this.meta.version = hlt.version;
    } catch {}
    if (this.courseId) await this.onDetect();
  },
};
</script>
