<template>
  <app-layout>
    <div class="min-h-screen p-4 space-y-6">
      <h1 class="text-3xl md:text-4xl font-extrabold">Reportes</h1>

      <div class="flex flex-wrap gap-3 items-center">
        <n-select
          v-model:value="filters.courseId"
          :options="courseOptions"
          placeholder="Curso (opcional)"
          style="width: 260px"
          clearable
        />
        <n-select
          v-model:value="filters.modalityId"
          :options="modalityOptions"
          placeholder="Modalidad (opcional)"
          style="width: 220px"
          clearable
        />
        <n-select
          v-model:value="filters.granularity"
          :options="granularityOptions"
          style="width: 180px"
        />
        <n-date-picker
          v-model:value="filters.range"
          type="daterange"
          clearable
          :is-date-disabled="(d) => d > Date.now()"
        />
        <n-button :loading="loading" type="primary" @click="loadAll"
          >Actualizar</n-button
        >
        <div class="ml-auto flex gap-2">
          <n-dropdown
            trigger="click"
            :options="exportOptions"
            @select="handleExport"
          >
            <n-button quaternary>Exportar</n-button>
          </n-dropdown>
        </div>
      </div>

      <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
        <n-statistic label="Inscripciones" :value="kpi.enrollments" />
        <n-statistic label="Estudiantes activos" :value="kpi.activeStudents" />
        <n-statistic label="Promedio general" :value="kpi.avgScore" />
        <n-statistic label="Aprobación (%)" :value="kpi.approvalRate" />
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <n-card
          class="rounded-2xl shadow-lg hover:shadow-2xl transition-all border-0 bg-gradient-to-br from-slate-900 to-slate-800 text-white"
          size="large"
        >
          <template #header>
            <span class="font-extrabold text-2xl"
              >Inscripciones en el tiempo</span
            >
          </template>
          <v-chart :option="chartEnrollmentsOption" autoresize class="h-72" />
        </n-card>

        <n-card
          class="rounded-2xl shadow-lg hover:shadow-2xl transition-all border-0 bg-gradient-to-br from-slate-900 to-slate-800 text-white"
          size="large"
        >
          <template #header>
            <span class="font-extrabold text-2xl"
              >Inscripciones por modalidad</span
            >
          </template>
          <v-chart :option="chartModalityOption" autoresize class="h-72" />
        </n-card>

        <n-card
          class="rounded-2xl shadow-lg hover:shadow-2xl transition-all border-0 bg-gradient-to-br from-slate-900 to-slate-800 text-white"
          size="large"
        >
          <template #header>
            <span class="font-extrabold text-2xl"
              >Top cursos por inscripciones</span
            >
          </template>
          <v-chart :option="chartTopCoursesOption" autoresize class="h-80" />
        </n-card>

        <n-card
          class="rounded-2xl shadow-lg hover:shadow-2xl transition-all border-0 bg-gradient-to-br from-slate-900 to-slate-800 text-white"
          size="large"
        >
          <template #header>
            <span class="font-extrabold text-2xl">Distribución académica</span>
          </template>
          <v-chart :option="chartGradesOption" autoresize class="h-80" />
        </n-card>
      </div>

      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <n-card
          title="Reporte de Matrículas"
          class="hover:shadow-xl transition-shadow rounded-xl"
        >
          <p class="mb-4">
            Descarga un listado de estudiantes matriculados por curso.
          </p>
          <n-button @click="downloadEnrollments('csv')" class="mr-2"
            >Exportar CSV</n-button
          >
          <n-button @click="downloadEnrollments('pdf')" type="primary"
            >Exportar PDF</n-button
          >
        </n-card>

        <n-card
          title="Reporte de Calificaciones"
          class="hover:shadow-xl transition-shadow rounded-xl"
        >
          <p class="mb-4">
            Obtén calificaciones por curso, actividad y estudiante.
          </p>
          <n-button @click="downloadGrades('csv')" class="mr-2"
            >Exportar CSV</n-button
          >
          <n-button @click="downloadGrades('pdf')" type="primary"
            >Exportar PDF</n-button
          >
        </n-card>

        <n-card
          title="Reporte de Docentes"
          class="hover:shadow-xl transition-shadow rounded-xl"
        >
          <p class="mb-4">Listado de docentes y sus cursos asignados.</p>
          <n-button @click="downloadTeachers('csv')" class="mr-2"
            >Exportar CSV</n-button
          >
          <n-button @click="downloadTeachers('pdf')" type="primary"
            >Exportar PDF</n-button
          >
        </n-card>

        <n-card
          title="Reporte de Actividades"
          class="hover:shadow-xl transition-shadow rounded-xl"
        >
          <p class="mb-4">Actividades por curso y docente.</p>
          <n-button @click="downloadActivities('csv')" class="mr-2"
            >Exportar CSV</n-button
          >
          <n-button @click="downloadActivities('pdf')" type="primary"
            >Exportar PDF</n-button
          >
        </n-card>
      </div>
    </div>
  </app-layout>
</template>

<script>
import AppLayout from "@/layouts/AppLayout.vue";
import {
  useMessage,
  NButton,
  NCard,
  NSelect,
  NDatePicker,
  NStatistic,
  NDropdown,
} from "naive-ui";
import dayjs from "dayjs";
import pdfMake from "pdfmake/build/pdfmake";
import pdfFonts from "pdfmake/build/vfs_fonts";
pdfMake.vfs = pdfFonts.vfs;
import Papa from "papaparse";
import VueECharts from "vue-echarts";
import { use } from "echarts/core";
import { CanvasRenderer } from "echarts/renderers";
import { BarChart, PieChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
} from "echarts/components";
use([
  CanvasRenderer,
  BarChart,
  PieChart,
  GridComponent,
  TooltipComponent,
  LegendComponent,
  TitleComponent,
]);

import enrollmentService from "@/services/enrollmentService";
import gradeService from "@/services/gradeService";
import teacherService from "@/services/teacherService";
import activityService from "@/services/activityService";
import courseService from "@/services/courseService";
import modalityService from "@/services/modalityService";
import reportService from "@/services/reportService";

const CHART_COLORS = {
  text: "#e5e7eb",
  subtext: "#9ca3af",
  gridLine: "#374151",
  axis: "#9ca3af",
  tooltipBg: "#111827",
  tooltipBorder: "#374151",
  palette: ["#60a5fa", "#f59e0b", "#34d399", "#f472b6", "#c084fc", "#f97316"],
};

function darkBase(option = {}) {
  return {
    textStyle: { color: CHART_COLORS.text },
    tooltip: {
      trigger: option.tooltip?.trigger || "item",
      backgroundColor: CHART_COLORS.tooltipBg,
      borderColor: CHART_COLORS.tooltipBorder,
      textStyle: { color: CHART_COLORS.text },
    },
    legend: {
      top: "bottom",
      textStyle: { color: CHART_COLORS.text },
    },
    ...option,
  };
}

function getHeader(title) {
  return [
    {
      text: title,
      style: "header",
      alignment: "center",
      margin: [0, 15, 0, 15],
    },
    {
      canvas: [
        {
          type: "line",
          x1: 0,
          y1: 0,
          x2: 800,
          y2: 0,
          lineWidth: 2,
          lineColor: "#1976d2",
        },
      ],
    },
    { text: " ", margin: [0, 0, 0, 10] },
  ];
}

function getFooter(currentPage, pageCount) {
  return {
    text: `Página ${currentPage} de ${pageCount}`,
    alignment: "right",
    margin: [0, 0, 20, 0],
    fontSize: 9,
    color: "#888",
  };
}

function getTableConfig(body) {
  if (body[0].length > 6) {
    return {
      pageOrientation: "landscape",
      widths: Array(body[0].length).fill("auto"),
    };
  }
  return {
    pageOrientation: "portrait",
    widths: Array(body[0].length).fill("*"),
  };
}

export default {
  name: "ReportsView",
  components: {
    AppLayout,
    NButton,
    NCard,
    NSelect,
    NDatePicker,
    NStatistic,
    NDropdown,
    "v-chart": VueECharts,
  },
  data() {
    return {
      message: null,
      loading: false,
      granularityOptions: [
        { label: "Diario", value: "day" },
        { label: "Semanal", value: "week" },
        { label: "Mensual", value: "month" },
        { label: "Anual", value: "year" },
      ],
      filters: {
        courseId: null,
        modalityId: null,
        granularity: "month",
        range: [
          dayjs().startOf("year").valueOf(),
          dayjs().endOf("year").valueOf(),
        ],
      },
      courseOptions: [],
      modalityOptions: [],
      kpi: { enrollments: 0, activeStudents: 0, avgScore: 0, approvalRate: 0 },
      enrollmentsSeries: [],
      modalitySeries: [],
      topCoursesSeries: [],
      gradesDistribution: { avg: 0, approved: 0, failed: 0 },
      exportOptions: [
        { label: "Dashboard (PDF)", key: "pdf-dashboard" },
        { label: "Inscripciones (CSV)", key: "csv-enrollments" },
        { label: "Inscripciones (PDF)", key: "pdf-enrollments" },
        { type: "divider" },
        { label: "Docentes (CSV)", key: "csv-teachers" },
        { label: "Docentes (PDF)", key: "pdf-teachers" },
        { type: "divider" },
        { label: "Calificaciones (CSV)", key: "csv-grades" },
        { label: "Calificaciones (PDF)", key: "pdf-grades" },
        { type: "divider" },
        { label: "Actividades (CSV)", key: "csv-activities" },
        { label: "Actividades (PDF)", key: "pdf-activities" },
      ],
    };
  },
  computed: {
    chartEnrollmentsOption() {
      const x = this.enrollmentsSeries.map((i) => i.bucket);
      const y = this.enrollmentsSeries.map((i) => i.count);

      return darkBase({
        tooltip: { trigger: "axis" },
        grid: { left: 48, right: 20, top: 30, bottom: 40 },
        xAxis: {
          type: "category",
          data: x,
          axisLabel: {
            color: CHART_COLORS.text,
            rotate: x.length > 8 ? 45 : 0,
          },
          axisLine: { lineStyle: { color: CHART_COLORS.axis } },
          axisTick: { lineStyle: { color: CHART_COLORS.axis } },
        },
        yAxis: {
          type: "value",
          axisLabel: { color: CHART_COLORS.text },
          axisLine: { lineStyle: { color: CHART_COLORS.axis } },
          splitLine: { lineStyle: { color: CHART_COLORS.gridLine } },
        },
        color: CHART_COLORS.palette,
        series: [
          {
            type: "bar",
            data: y,
            barMaxWidth: 36,
            itemStyle: { borderRadius: [6, 6, 0, 0] },
          },
        ],
      });
    },

    chartModalityOption() {
      return darkBase({
        tooltip: { trigger: "item", formatter: "{b}: {c} ({d}%)" },
        color: CHART_COLORS.palette,
        series: [
          {
            type: "pie",
            radius: ["40%", "70%"],
            label: {
              show: true,
              color: CHART_COLORS.text,
              formatter: "{b}\n{c} ({d}%)",
            },
            labelLine: { lineStyle: { color: CHART_COLORS.text } },
            data: this.modalitySeries,
          },
        ],
      });
    },

    chartTopCoursesOption() {
      const data = [...this.topCoursesSeries].sort((a, b) => a.count - b.count);
      return darkBase({
        tooltip: { trigger: "axis" },
        grid: { left: 140, right: 30, top: 20, bottom: 20 },
        xAxis: {
          type: "value",
          axisLabel: { color: CHART_COLORS.text },
          axisLine: { lineStyle: { color: CHART_COLORS.axis } },
          splitLine: { lineStyle: { color: CHART_COLORS.gridLine } },
        },
        yAxis: {
          type: "category",
          data: data.map((i) => i.course),
          axisLabel: { color: CHART_COLORS.text },
          axisLine: { lineStyle: { color: CHART_COLORS.axis } },
        },
        color: CHART_COLORS.palette,
        series: [
          {
            type: "bar",
            data: data.map((i) => i.count),
            barMaxWidth: 22,
            itemStyle: { borderRadius: 6 },
          },
        ],
      });
    },

    chartGradesOption() {
      const { approved, failed, avg } = this.gradesDistribution;
      return darkBase({
        title: {
          text: `Promedio: ${avg}`,
          left: "center",
          top: 0,
          textStyle: { color: CHART_COLORS.text, fontSize: 14 },
        },
        legend: { top: "bottom", textStyle: { color: CHART_COLORS.text } },
        color: [CHART_COLORS.palette[2], CHART_COLORS.palette[0]],
        series: [
          {
            name: "Estado",
            type: "pie",
            radius: "60%",
            label: { color: CHART_COLORS.text },
            labelLine: { lineStyle: { color: CHART_COLORS.text } },
            data: [
              { name: "Aprobados", value: approved },
              { name: "Reprobados", value: failed },
            ],
          },
        ],
      });
    },
  },
  setup() {
    const message = useMessage();
    return { message };
  },
  async mounted() {
    await this.loadFilters();
    await this.loadAll();
  },
  methods: {
    async loadFilters() {
      const [courses, modalities] = await Promise.all([
        courseService.getAll(),
        modalityService.getAll(),
      ]);
      this.courseOptions = (courses || []).map((c) => ({
        label: `${c.name} (${c.parallel || "-"})`,
        value: c.id,
      }));
      this.modalityOptions = (modalities || []).map((m) => ({
        label: m.name,
        value: m.id,
      }));
    },
    toParams() {
      const [start, end] = this.filters.range || [null, null];
      return {
        courseId: this.filters.courseId || undefined,
        modalityId: this.filters.modalityId || undefined,
        granularity: this.filters.granularity,
        start: start ? dayjs(start).format("YYYY-MM-DD") : undefined,
        end: end ? dayjs(end).format("YYYY-MM-DD") : undefined,
      };
    },
    async loadAll() {
      this.loading = true;
      try {
        const params = this.toParams();
        const [kpiRes, enrollRes, modRes, topRes, gradesRes] =
          await Promise.all([
            reportService.getKpis(params),
            reportService.getEnrollmentsOverTime(params),
            reportService.getEnrollmentsByModality(params),
            reportService.getTopCourses(params),
            reportService.getGradesDistribution(params),
          ]);

        this.kpi = {
          enrollments: Number(kpiRes?.enrollments || 0),
          activeStudents: Number(kpiRes?.activeStudents || 0),
          avgScore: Number(
            (kpiRes?.avgScore ?? 0).toFixed
              ? kpiRes.avgScore.toFixed(2)
              : kpiRes?.avgScore ?? 0
          ),
          approvalRate: Number(
            (kpiRes?.approvalRate ?? 0).toFixed
              ? kpiRes.approvalRate.toFixed(2)
              : kpiRes?.approvalRate ?? 0
          ),
        };

        this.enrollmentsSeries = this.normalizeOverTime(enrollRes);
        this.modalitySeries = this.normalizeModality(modRes);
        this.topCoursesSeries = this.normalizeTopCourses(topRes);

        this.gradesDistribution = {
          avg: Number(
            (gradesRes?.avg ?? 0).toFixed
              ? gradesRes.avg.toFixed(2)
              : gradesRes?.avg ?? 0
          ),
          approved: Number(gradesRes?.approved || 0),
          failed: Number(gradesRes?.failed || 0),
        };
      } catch (e) {
        console.error(e);
        this.message.error("Error al cargar reportes.");
      } finally {
        this.loading = false;
      }
    },
    normalizeOverTime(resp) {
      if (Array.isArray(resp)) {
        return resp.map((r) => ({
          bucket: r.bucket,
          count: Number(r.count || 0),
        }));
      }
      if (resp && Array.isArray(resp.labels) && Array.isArray(resp.series)) {
        return resp.labels.map((label, i) => ({
          bucket: label,
          count: Number(resp.series[i] || 0),
        }));
      }
      return [];
    },
    normalizeModality(resp) {
      if (Array.isArray(resp)) {
        return resp.map((r) => ({
          name: r.modality || r.name || "Sin modalidad",
          value: Number(r.count || r.value || 0),
        }));
      }
      if (resp && Array.isArray(resp.labels) && Array.isArray(resp.series)) {
        return resp.labels.map((label, i) => ({
          name: label || "Sin modalidad",
          value: Number(resp.series[i] || 0),
        }));
      }
      return [];
    },
    normalizeTopCourses(resp) {
      if (Array.isArray(resp)) {
        return resp.map((r) => ({
          course:
            r.course ||
            `${r.name || ""}${r.parallel ? ` (${r.parallel})` : ""}`.trim(),
          count: Number(r.count || r.total || 0),
        }));
      }
      if (resp && Array.isArray(resp.items)) {
        return resp.items.map((r) => ({
          course:
            r.course ||
            `${r.name || ""}${r.parallel ? ` (${r.parallel})` : ""}`.trim(),
          count: Number(r.count || r.total || 0),
        }));
      }
      return [];
    },

    handleExport(key) {
      switch (key) {
        case "pdf-dashboard":
          this.exportDashboardPdf();
          break;
        case "csv-enrollments":
          this.downloadEnrollments("csv");
          break;
        case "pdf-enrollments":
          this.downloadEnrollments("pdf");
          break;
        case "csv-teachers":
          this.downloadTeachers("csv");
          break;
        case "pdf-teachers":
          this.downloadTeachers("pdf");
          break;
        case "csv-grades":
          this.downloadGrades("csv");
          break;
        case "pdf-grades":
          this.downloadGrades("pdf");
          break;
        case "csv-activities":
          this.downloadActivities("csv");
          break;
        case "pdf-activities":
          this.downloadActivities("pdf");
          break;
      }
    },
    header(title) {
      return [
        {
          text: title,
          style: "header",
          alignment: "center",
          margin: [0, 0, 0, 8],
        },
        {
          canvas: [
            {
              type: "line",
              x1: 0,
              y1: 0,
              x2: 520,
              y2: 0,
              lineWidth: 1,
              lineColor: "#1976d2",
            },
          ],
        },
        { text: " ", margin: [0, 0, 0, 6] },
      ];
    },
    exportDashboardPdf() {
      const doc = {
        content: [
          ...this.header("Dashboard Académico"),
          {
            columns: [
              { text: `Inscripciones: ${this.kpi.enrollments}`, width: "25%" },
              { text: `Activos: ${this.kpi.activeStudents}`, width: "25%" },
              { text: `Promedio: ${this.kpi.avgScore}`, width: "25%" },
              { text: `Aprobación: ${this.kpi.approvalRate}%`, width: "25%" },
            ],
            margin: [0, 0, 0, 10],
          },
          {
            text: "Inscripciones en el tiempo",
            bold: true,
            margin: [0, 8, 0, 4],
          },
          {
            table: {
              widths: ["*", "auto"],
              body: [
                ["Periodo", "Inscripciones"],
                ...this.enrollmentsSeries.map((i) => [i.bucket, i.count]),
              ],
            },
            layout: "lightHorizontalLines",
            margin: [0, 0, 0, 10],
          },
          {
            text: "Inscripciones por modalidad",
            bold: true,
            margin: [0, 8, 0, 4],
          },
          {
            table: {
              widths: ["*", "auto"],
              body: [
                ["Modalidad", "Inscripciones"],
                ...this.modalitySeries.map((i) => [i.name, i.value]),
              ],
            },
            layout: "lightHorizontalLines",
            margin: [0, 0, 0, 10],
          },
          { text: "Top cursos", bold: true, margin: [0, 8, 0, 4] },
          {
            table: {
              widths: ["*", "auto"],
              body: [
                ["Curso", "Inscripciones"],
                ...this.topCoursesSeries.map((i) => [i.course, i.count]),
              ],
            },
            layout: "lightHorizontalLines",
            margin: [0, 0, 0, 10],
          },
          { text: "Distribución académica", bold: true, margin: [0, 8, 0, 4] },
          {
            ul: [
              `Promedio: ${this.gradesDistribution.avg}`,
              `Aprobados: ${this.gradesDistribution.approved}`,
              `Reprobados: ${this.gradesDistribution.failed}`,
            ],
          },
        ],
        styles: { header: { fontSize: 18, bold: true, color: "#1976d2" } },
      };
      pdfMake.createPdf(doc).download("dashboard_academico.pdf");
    },
    async downloadEnrollments(type) {
      try {
        const enrollments = await enrollmentService.getAll();
        const body = [
          [
            "ID",
            "Estudiante",
            "CI",
            "Curso",
            "Fecha de Matrícula",
            "Tipo de Pago",
            "Estado",
          ],
          ...enrollments.map((e) => [
            e.id || "",
            `${e.student?.name || ""} ${e.student?.last_name || ""} ${
              e.student?.second_last_name || ""
            }`.trim(),
            e.student?.ci || "",
            `${e.course?.name || ""} (${e.course?.parallel || ""})`,
            e.enrollment_date?.substring(0, 10) || "",
            e.payment_type || "",
            e.status ? "Activo" : "Inactivo",
          ]),
        ];
        if (type === "csv") {
          const csv = Papa.unparse(
            enrollments.map((e) => ({
              ID: e.id,
              Estudiante: `${e.student?.name || ""} ${
                e.student?.last_name || ""
              } ${e.student?.second_last_name || ""}`.trim(),
              CI: e.student?.ci || "",
              Curso: `${e.course?.name || ""} (${e.course?.parallel || ""})`,
              "Fecha de Matrícula": e.enrollment_date || "",
              "Tipo de Pago": e.payment_type || "",
              Estado: e.status ? "Activo" : "Inactivo",
            }))
          );
          const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.setAttribute("download", "reporte_matriculas.csv");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else if (type === "pdf") {
          const tableConfig = getTableConfig(body);
          const docDefinition = {
            pageOrientation: tableConfig.pageOrientation,
            footer: getFooter,
            content: [
              ...getHeader("Reporte de Matrículas"),
              {
                table: { headerRows: 1, widths: tableConfig.widths, body },
                layout: getModernTableLayout(),
                dontBreakRows: true,
              },
            ],
            styles: {
              header: {
                fontSize: 24,
                bold: true,
                color: "#1976d2",
                alignment: "center",
                margin: [0, 0, 0, 10],
              },
            },
            defaultStyle: { fontSize: 10, noWrap: false },
          };
          pdfMake.createPdf(docDefinition).download("reporte_matriculas.pdf");
        }
      } catch (err) {
        console.error("Error PDF Matrículas:", err);
        this.message.error(
          "Error al generar el reporte de matrículas: " + (err.message || err)
        );
      }
    },
    async downloadGrades(type) {
      try {
        const res = await gradeService.getAll();
        const grades = res?.grades || res || [];
        const body = [
          [
            "ID",
            "Estudiante",
            "CI",
            "Curso",
            "Actividad",
            "Calificación",
            "Observación",
            "Fecha",
            "Estado",
          ],
          ...grades.map((g) => [
            g.id || "",
            `${g.student?.name || ""} ${g.student?.last_name || ""} ${
              g.student?.second_last_name || ""
            }`.trim(),
            g.student?.ci || "",
            `${g.activity?.course?.name || ""} (${
              g.activity?.course?.parallel || ""
            })`,
            g.activity?.title || "",
            g.score ?? "",
            g.feedback || "",
            g.created_at?.substring(0, 10) || "",
            g.status ? "Activo" : "Inactivo",
          ]),
        ];
        if (type === "csv") {
          const csv = Papa.unparse(
            grades.map((g) => ({
              ID: g.id,
              Estudiante: `${g.student?.name || ""} ${
                g.student?.last_name || ""
              } ${g.student?.second_last_name || ""}`.trim(),
              CI: g.student?.ci || "",
              Curso: `${g.activity?.course?.name || ""} (${
                g.activity?.course?.parallel || ""
              })`,
              Actividad: g.activity?.title || "",
              Calificación: g.score ?? "",
              Observación: g.feedback || "",
              Fecha: g.created_at?.substring(0, 10) || "",
              Estado: g.status ? "Activo" : "Inactivo",
            }))
          );
          const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.setAttribute("download", "reporte_calificaciones.csv");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else if (type === "pdf") {
          const docDefinition = {
            pageOrientation: "portrait",
            footer: getFooter,
            content: [
              ...getHeader("Reporte de Calificaciones"),
              {
                table: {
                  headerRows: 1,
                  widths: Array(body[0].length).fill("auto"),
                  body,
                },
                layout: getModernTableLayout(),
                dontBreakRows: true,
              },
            ],
            styles: {
              header: {
                fontSize: 24,
                bold: true,
                color: "#1976d2",
                alignment: "center",
                margin: [0, 0, 0, 10],
              },
            },
            defaultStyle: { fontSize: 10, noWrap: false },
          };
          pdfMake
            .createPdf(docDefinition)
            .download("reporte_calificaciones.pdf");
        }
      } catch (err) {
        console.error("Error PDF Calificaciones:", err);
        this.message.error(
          "Error al generar el reporte de calificaciones: " +
            (err.message || err)
        );
      }
    },
    async downloadTeachers(type) {
      try {
        const teachers = await teacherService.getAll();
        const body = [
          [
            "ID",
            "Nombre Completo",
            "CI",
            "Email",
            "Teléfono",
            "Especialidad",
            "Género",
            "Fecha de Nacimiento",
            "Cursos Asignados",
            "Estado",
          ],
          ...teachers.map((t) => [
            t.id || "",
            `${t.name || ""} ${t.last_name || ""} ${
              t.second_last_name || ""
            }`.trim(),
            t.ci || "",
            t.email || "",
            t.phone || "",
            t.specialty || "",
            t.gender || "",
            t.dateofbirth?.substring(0, 10) || "",
            t.courses?.map((c) => `${c.name} (${c.parallel})`).join(", ") || "",
            t.status ? "Activo" : "Inactivo",
          ]),
        ];
        if (type === "csv") {
          const csv = Papa.unparse(
            teachers.map((t) => ({
              ID: t.id,
              "Nombre Completo": `${t.name || ""} ${t.last_name || ""} ${
                t.second_last_name || ""
              }`.trim(),
              CI: t.ci || "",
              Email: t.email || "",
              Teléfono: t.phone || "",
              Especialidad: t.specialty || "",
              Género: t.gender || "",
              "Fecha de Nacimiento": t.dateofbirth?.substring(0, 10) || "",
              "Cursos Asignados":
                t.courses?.map((c) => `${c.name} (${c.parallel})`).join(", ") ||
                "",
              Estado: t.status ? "Activo" : "Inactivo",
            }))
          );
          const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.setAttribute("download", "reporte_docentes.csv");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else if (type === "pdf") {
          const tableConfig = getTableConfig(body);
          const docDefinition = {
            pageOrientation: tableConfig.pageOrientation,
            footer: getFooter,
            content: [
              ...getHeader("Reporte de Docentes"),
              {
                table: { headerRows: 1, widths: tableConfig.widths, body },
                layout: getModernTableLayout(),
                dontBreakRows: true,
              },
            ],
            styles: {
              header: {
                fontSize: 24,
                bold: true,
                color: "#1976d2",
                alignment: "center",
                margin: [0, 0, 0, 10],
              },
            },
            defaultStyle: { fontSize: 10, noWrap: false },
          };
          pdfMake.createPdf(docDefinition).download("reporte_docentes.pdf");
        }
      } catch (err) {
        console.error("Error PDF Docentes:", err);
        this.message.error(
          "Error al generar el reporte de docentes: " + (err.message || err)
        );
      }
    },
    async downloadActivities(type) {
      try {
        const activities = await activityService.getAll();
        const body = [
          ["ID", "Título", "Curso", "Docente", "Estado", "Fecha de Creación"],
          ...activities.map((a) => [
            a.id || "",
            a.title || "",
            `${a.course?.name || ""} (${a.course?.parallel || ""})`,
            `${a.teacher?.name || ""} ${a.teacher?.last_name || ""} ${
              a.teacher?.second_last_name || ""
            }`.trim(),
            a.status ? "Activo" : "Inactivo",
            a.created_at?.substring(0, 10) || "",
          ]),
        ];
        if (type === "csv") {
          const csv = Papa.unparse(
            activities.map((a) => ({
              ID: a.id,
              Título: a.title || "",
              Curso: `${a.course?.name || ""} (${a.course?.parallel || ""})`,
              Docente: `${a.teacher?.name || ""} ${
                a.teacher?.last_name || ""
              } ${a.teacher?.second_last_name || ""}`.trim(),
              Estado: a.status ? "Activo" : "Inactivo",
              "Fecha de Creación": a.created_at?.substring(0, 10) || "",
            }))
          );
          const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
          const link = document.createElement("a");
          link.href = URL.createObjectURL(blob);
          link.setAttribute("download", "reporte_actividades.csv");
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else if (type === "pdf") {
          const tableConfig = getTableConfig(body);
          const docDefinition = {
            pageOrientation: tableConfig.pageOrientation,
            footer: getFooter,
            content: [
              ...getHeader("Reporte de Actividades"),
              {
                table: { headerRows: 1, widths: tableConfig.widths, body },
                layout: getModernTableLayout(),
                dontBreakRows: true,
              },
            ],
            styles: {
              header: {
                fontSize: 24,
                bold: true,
                color: "#1976d2",
                alignment: "center",
                margin: [0, 0, 0, 10],
              },
            },
            defaultStyle: { fontSize: 10, noWrap: false },
          };
          pdfMake.createPdf(docDefinition).download("reporte_actividades.pdf");
        }
      } catch (err) {
        console.error("Error PDF Actividades:", err);
        this.message.error(
          "Error al generar el reporte de actividades: " + (err.message || err)
        );
      }
    },
  },
};
</script>

<style scoped>
.h-72 {
  height: 18rem;
}
.h-80 {
  height: 20rem;
}
</style>
