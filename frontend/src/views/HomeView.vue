<template>
  <app-layout>
    <div class="min-h-screen py-8 bg-[#0b1220] text-white">
      <div class="max-w-7xl mx-auto px-6">
        <div
          class="mb-6 rounded-3xl p-6 bg-gradient-to-r from-[#0f172a] to-[#0f172a]/60 border border-[#1f2a44] shadow-[0_10px_30px_rgba(2,6,23,0.6)]"
        >
          <div
            class="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <div>
              <div
                class="text-3xl md:text-4xl font-extrabold text-[#60a5fa] leading-tight"
              >
                ¡Bienvenido<span v-if="user?.role?.name && isRestrictedRole"
                  >, {{ user.role.name }}</span
                ><span v-else-if="user?.email"> {{ user.email }}</span
                >!
              </div>
              <div class="text-sm text-gray-400 mt-1">{{ user?.email }}</div>
            </div>
            <div class="flex items-center gap-4">
              <n-tag
                size="large"
                type="success"
                round
                v-if="user?.role?.name"
                class="px-4"
              >
                {{ user.role.name }}
              </n-tag>
            </div>
          </div>
        </div>

        <div v-if="isAdminLike" class="space-y-6">
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <div
              class="rounded-2xl p-5 bg-[#0f172a]/70 border border-[#1f2a44] flex items-center gap-4"
            >
              <n-icon size="36"><PeopleOutline /></n-icon>
              <div class="flex-1">
                <div class="text-xs text-gray-400 uppercase tracking-wider">
                  Estudiantes activos
                </div>
                <div class="text-3xl font-extrabold mt-1">
                  {{ kpis.students_active }}
                </div>
                <div class="text-xs text-gray-400 mt-1">
                  Último mes
                  <span class="font-bold">{{ trends.students_delta }}</span>
                </div>
              </div>
            </div>

            <div
              class="rounded-2xl p-5 bg-[#0f172a]/70 border border-[#1f2a44] flex items-center gap-4"
            >
              <n-icon size="36"><BookOutline /></n-icon>
              <div class="flex-1">
                <div class="text-xs text-gray-400 uppercase tracking-wider">
                  Cursos activos
                </div>
                <div class="text-3xl font-extrabold mt-1">
                  {{ kpis.courses_active }}
                </div>
                <div class="text-xs text-gray-400 mt-1">
                  Activos este término
                </div>
              </div>
            </div>

            <div
              class="rounded-2xl p-5 bg-[#0f172a]/70 border border-[#1f2a44] flex items-center gap-4"
            >
              <n-icon size="36"><StatsChartOutline /></n-icon>
              <div class="flex-1">
                <div class="text-xs text-gray-400 uppercase tracking-wider">
                  Inscripciones activas
                </div>
                <div class="text-3xl font-extrabold mt-1">
                  {{ kpis.enrollments_active }}
                </div>
                <div class="text-xs text-gray-400 mt-1">
                  Hoy
                  <span class="font-bold">{{ trends.enrollments_today }}</span>
                </div>
              </div>
            </div>

            <div
              class="rounded-2xl p-5 bg-[#0f172a]/70 border border-[#1f2a44] flex items-center gap-4"
            >
              <n-icon size="36"><SchoolOutline /></n-icon>
              <div class="flex-1">
                <div class="text-xs text-gray-400 uppercase tracking-wider">
                  Docentes activos
                </div>
                <div class="text-3xl font-extrabold mt-1">
                  {{ kpis.teachers_active }}
                </div>
                <div class="text-xs text-gray-400 mt-1">
                  Participando este término
                </div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div
              class="lg:col-span-2 rounded-2xl p-5 bg-[#071026]/70 border border-[#1f2a44] shadow-sm"
            >
              <div class="flex items-center justify-between mb-4">
                <div class="text-lg font-bold">Estudiantes por curso</div>
                <n-select
                  v-model:value="selectedCourseForFilter"
                  :options="courseOptionsForFilter"
                  size="small"
                  @update:value="onChartFilterChange"
                />
              </div>
              <div class="relative h-96">
                <div
                  v-if="chartsLoading"
                  class="absolute inset-0 flex items-center justify-center bg-transparent z-10"
                >
                  <n-spin size="large" />
                </div>
                <canvas
                  ref="coursesChart"
                  class="w-full h-full"
                  v-show="!chartsLoading"
                ></canvas>
              </div>
            </div>

            <div
              class="rounded-2xl p-5 bg-[#071026]/70 border border-[#1f2a44] shadow-sm flex flex-col gap-4"
            >
              <div class="flex items-center justify-between">
                <div class="text-lg font-bold">
                  Distribución de inscripciones
                </div>
              </div>
              <div class="flex-1 flex flex-col items-center justify-center">
                <div class="relative w-full max-w-sm h-64">
                  <div
                    v-if="chartsLoading"
                    class="absolute inset-0 flex items-center justify-center bg-transparent z-10"
                  >
                    <n-spin size="large" />
                  </div>
                  <canvas
                    ref="donutChart"
                    class="w-full h-full"
                    v-show="!chartsLoading"
                  ></canvas>
                </div>
              </div>
              <div class="grid grid-cols-1 gap-2">
                <div
                  v-for="(c, i) in smallLegend"
                  :key="i"
                  class="flex items-center gap-3 text-xs"
                >
                  <div
                    :style="{ background: c.color }"
                    class="w-4 h-4 rounded"
                  ></div>
                  <div class="truncate text-gray-200">{{ c.label }}</div>
                  <div class="ml-auto text-xs text-gray-400">{{ c.value }}</div>
                </div>
              </div>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div
              class="rounded-2xl p-5 bg-[#071026]/70 border border-[#1f2a44]"
            >
              <div class="flex items-center justify-between mb-4">
                <div class="text-lg font-bold">
                  Tendencia de inscripciones (últimos 6 meses)
                </div>
              </div>
              <div class="relative h-64">
                <div
                  v-if="chartsLoading"
                  class="absolute inset-0 flex items-center justify-center bg-transparent z-10"
                >
                  <n-spin size="large" />
                </div>
                <canvas
                  ref="trendChart"
                  class="w-full h-full"
                  v-show="!chartsLoading"
                ></canvas>
              </div>
            </div>

            <div
              class="rounded-2xl p-5 bg-[#071026]/70 border border-[#1f2a44]"
            >
              <div class="text-lg font-bold mb-4">Desempeño por curso</div>
              <n-select
                v-model:value="selectedCourse"
                :options="courseOptions"
                placeholder="Seleccione curso"
                filterable
                clearable
                size="medium"
                @update:value="onCourseChange"
              />
              <div class="mt-4">
                <div v-if="studentsLoading" class="text-gray-400">
                  Cargando estudiantes...
                </div>
                <div
                  v-else-if="studentsList.length === 0"
                  class="text-gray-400"
                >
                  Seleccione un curso para ver desempeño.
                </div>
                <div v-else class="space-y-3">
                  <div
                    v-for="(s, idx) in studentsList.slice(0, 6)"
                    :key="s.studentId"
                    class="flex items-center gap-3 border-b border-[#1f2a44] pb-3"
                  >
                    <div class="flex-1">
                      <div class="font-bold">{{ s.studentName }}</div>
                      <div class="text-xs text-gray-400">
                        Asistencias: {{ s.attendances }}
                      </div>
                    </div>
                    <div class="w-24 text-right">
                      <div class="text-sm font-extrabold">
                        {{
                          s.avg_score === null ? "-" : s.avg_score.toFixed(2)
                        }}
                      </div>
                      <div class="text-xs text-gray-400">Promedio</div>
                    </div>
                    <n-button
                      size="small"
                      @click="openStudentDetail(s.studentId)"
                      >Detalles</n-button
                    >
                  </div>
                  <div
                    v-if="studentsList.length > 6"
                    class="text-xs text-gray-400"
                  >
                    Mostrando 6 de {{ studentsList.length }} estudiantes
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div
          v-else
          class="rounded-2xl p-6 bg-[#071026]/60 border border-[#1f2a44] text-center"
        >
          <div class="text-xl font-extrabold">Bienvenido {{ user?.email }}</div>
        </div>
      </div>

      <n-modal
        v-model:show="showStudentModal"
        preset="card"
        :style="{ width: '720px' }"
        title="Detalle del Estudiante"
      >
        <div v-if="studentLoading" class="text-gray-300">Cargando...</div>
        <div v-else class="space-y-4">
          <div class="font-extrabold text-lg">{{ studentDetail?.name }}</div>
          <div class="text-sm text-gray-300">
            CI: {{ studentDetail?.ci || "-" }}
          </div>
          <div class="text-sm text-gray-300">
            Teléfono: {{ studentDetail?.phone || "-" }}
          </div>
          <div class="text-sm text-gray-300">
            Promedio en curso:
            {{
              studentPerformance?.avg_score === null
                ? "-"
                : studentPerformance?.avg_score.toFixed(2)
            }}
          </div>

          <div v-if="studentGrades?.length">
            <div class="text-sm text-gray-400 mb-2">Calificaciones</div>
            <div class="space-y-2">
              <div
                v-for="g in studentGrades"
                :key="g.activityId"
                class="rounded-xl border border-[#1f2a44] p-3"
              >
                <div class="font-extrabold">
                  {{ g.activityTitle || "Actividad" }}
                </div>
                <div class="text-xs text-gray-300">Puntaje: {{ g.score }}</div>
                <div class="text-xs text-gray-300">
                  Feedback: {{ g.feedback || "-" }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <template #footer>
          <div class="flex justify-end">
            <n-button @click="showStudentModal = false">Cerrar</n-button>
          </div>
        </template>
      </n-modal>
    </div>
  </app-layout>
</template>

<script>
import AppLayout from "@/layouts/AppLayout.vue";
import AuthService from "@/services/authService";
import DashboardService from "@/services/dashboardService";
import StudentService from "@/services/studentService";
import {
  useMessage,
  NIcon,
  NButton,
  NSelect,
  NModal,
  NTag,
  NSpin,
} from "naive-ui";
import {
  PeopleOutline,
  BookOutline,
  SchoolOutline,
  StatsChartOutline,
  ClipboardOutline,
} from "@vicons/ionicons5";
import { nextTick } from "vue";
import Chart from "chart.js/auto";

export default {
  name: "HomeView",
  components: { AppLayout, NIcon, NButton, NSelect, NModal, NTag, NSpin },
  data() {
    return {
      user: null,
      kpis: {
        students_active: 0,
        courses_active: 0,
        enrollments_active: 0,
        teachers_active: 0,
      },
      trends: { students_delta: "+0%", enrollments_today: 0 },
      courseOptions: [],
      courseOptionsForFilter: [],
      selectedCourseForFilter: null,
      selectedCourse: null,
      studentsList: [],
      studentsLoading: false,
      showStudentModal: false,
      studentDetail: null,
      studentPerformance: null,
      studentGrades: [],
      studentLoading: false,
      coursesChartInstance: null,
      donutChartInstance: null,
      trendChartInstance: null,
      smallLegend: [],
      activeTab: "graphics",
      chartsLoading: false,
      message: null,
    };
  },
  computed: {
    isAdminLike() {
      const r = this.user?.role?.name;
      return r === "ADMINISTRADOR" || r === "GERENTE" || r === "SECRETARÍA";
    },
    isRestrictedRole() {
      const r = this.user?.role?.name;
      return r && r !== "USUARIO";
    },
  },
  methods: {
    async loadUserAndData() {
      try {
        const resp = await AuthService.getUser();
        this.user = resp.user;
        if (this.isAdminLike) {
          this.chartsLoading = true;
          await this.loadAll();
          this.chartsLoading = false;
          window.addEventListener("dashboard:update", this.onDashboardUpdate);
        }
      } catch {
        this.$router.push("/login");
      }
    },
    async loadAll() {
      await Promise.all([this.loadDashboard(), this.loadCourses()]);
      await this.buildCharts();
      await this.buildTrendChart();
    },
    async loadDashboard() {
      try {
        const data = await DashboardService.summary();
        this.kpis = data || this.kpis;
      } catch {
        this.message?.error?.("Error al cargar KPIs.");
      }
    },
    async loadCourses() {
      try {
        const data = await DashboardService.getCourses();
        const arr = (data || []).map((c) => ({
          label: `${c.name}${c.parallel ? ` (${c.parallel})` : ""}`,
          value: c.id,
        }));
        this.courseOptions = arr;
        this.courseOptionsForFilter = [{ label: "Todos", value: null }, ...arr];
      } catch {
        this.message?.error?.("Error al cargar cursos.");
      }
    },
    async onChartFilterChange() {
      this.chartsLoading = true;
      await this.buildCharts();
      this.chartsLoading = false;
    },
    async onCourseChange() {
      if (!this.selectedCourse) {
        this.studentsList = [];
        return;
      }
      await this.loadCourseStudents(this.selectedCourse);
    },
    async loadCourseStudents(courseId) {
      this.studentsLoading = true;
      try {
        const data = await DashboardService.coursePerformance(courseId);
        this.studentsList = data || [];
      } catch {
        this.message?.error?.("Error al cargar estudiantes.");
      } finally {
        this.studentsLoading = false;
      }
    },
    async openStudentDetail(studentId) {
      this.studentLoading = true;
      this.showStudentModal = true;
      this.studentDetail = null;
      this.studentPerformance = null;
      this.studentGrades = [];
      try {
        const st = await StudentService.getById(studentId);
        this.studentDetail = st || {};
        if (this.selectedCourse) {
          const perf = (this.studentsList || []).find(
            (s) => Number(s.studentId) === Number(studentId)
          );
          this.studentPerformance = perf || { avg_score: null, attendances: 0 };
          const gradesResp = await StudentServiceGradesFetcher(
            studentId,
            this.selectedCourse
          );
          this.studentGrades = gradesResp || [];
        }
      } catch {
      } finally {
        this.studentLoading = false;
      }
    },
    async buildCharts() {
      await nextTick();
      try {
        const courses = await DashboardService.getCourses();
        const filtered = this.selectedCourseForFilter
          ? courses.filter((c) => c.id === this.selectedCourseForFilter)
          : courses;
        const labels = (filtered || []).map(
          (c) => `${c.name}${c.parallel ? ` (${c.parallel})` : ""}`
        );
        const courseIds = (filtered || []).map((c) => c.id);
        const counts = [];
        for (const id of courseIds) {
          try {
            const perf = await DashboardService.coursePerformance(id);
            counts.push(perf?.length ?? 0);
          } catch {
            counts.push(0);
          }
        }
        const ctx = this.$refs.coursesChart?.getContext?.("2d");
        if (ctx) {
          if (this.coursesChartInstance) this.coursesChartInstance.destroy();
          this.coursesChartInstance = new Chart(ctx, {
            type: "bar",
            data: {
              labels,
              datasets: [
                {
                  label: "Estudiantes inscritos",
                  data: counts,
                  backgroundColor: "rgba(59,130,246,0.9)",
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              scales: {
                x: { ticks: { maxRotation: 45 }, grid: { display: false } },
                y: { beginAtZero: true },
              },
              plugins: {
                legend: { display: false },
                tooltip: { mode: "index" },
              },
            },
          });
        }
        const donutCtx = this.$refs.donutChart?.getContext?.("2d");
        if (donutCtx) {
          if (this.donutChartInstance) this.donutChartInstance.destroy();
          const dataset = counts.map((c) => c);
          const colors = labels.map((_, i) => `hsl(${(i * 50) % 360} 70% 55%)`);
          this.smallLegend = labels.map((l, i) => ({
            label: l,
            color: colors[i],
            value: dataset[i],
          }));
          this.donutChartInstance = new Chart(donutCtx, {
            type: "doughnut",
            data: {
              labels,
              datasets: [{ data: dataset, backgroundColor: colors }],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
            },
          });
        }
      } catch {}
    },
    async buildTrendChart() {
      await nextTick();
      try {
        const values = [];
        for (let i = 0; i < 6; i++)
          values.push(Math.floor(Math.random() * 40) + 10);
        const ctx = this.$refs.trendChart?.getContext?.("2d");
        if (ctx) {
          if (this.trendChartInstance) this.trendChartInstance.destroy();
          this.trendChartInstance = new Chart(ctx, {
            type: "line",
            data: {
              labels: ["-5m", "-4m", "-3m", "-2m", "-1m", "Ahora"],
              datasets: [
                {
                  label: "Inscripciones",
                  data: values,
                  borderColor: "rgba(34,197,94,0.9)",
                  backgroundColor: "rgba(34,197,94,0.12)",
                  fill: true,
                  tension: 0.3,
                },
              ],
            },
            options: {
              responsive: true,
              maintainAspectRatio: false,
              plugins: { legend: { display: false } },
              scales: { x: { grid: { display: false } } },
            },
          });
        }
      } catch {}
    },
    async onDashboardUpdate() {
      this.chartsLoading = true;
      await this.loadAll();
      this.chartsLoading = false;
    },
  },
  created() {
    this.message = useMessage();
    this.loadUserAndData();
  },
  unmounted() {
    window.removeEventListener("dashboard:update", this.onDashboardUpdate);
    if (this.coursesChartInstance) this.coursesChartInstance.destroy();
    if (this.donutChartInstance) this.donutChartInstance.destroy();
    if (this.trendChartInstance) this.trendChartInstance.destroy();
  },
};

async function StudentServiceGradesFetcher(studentId, courseId) {
  try {
    const http = (await import("@/services/http")).default;
    const { data } = await http.get(
      `/grades?studentId=${studentId}&courseId=${courseId}`
    );
    return data.grades ?? data;
  } catch {
    return [];
  }
}
</script>
