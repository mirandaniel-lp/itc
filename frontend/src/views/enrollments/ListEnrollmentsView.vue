<template>
  <app-layout>
    <div class="min-h-screen p-8 bg-[#0f172a] text-white">
      <div class="max-w-6xl mx-auto space-y-8">
        <div
          class="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <h1 class="text-4xl font-extrabold text-[#ffffff]">Inscripciones</h1>
          <div class="flex items-center gap-3 w-full md:w-auto">
            <div class="relative w-full md:w-80">
              <input
                v-model="search"
                @input="handleSearch"
                type="text"
                placeholder="Buscar por estudiante o curso"
                class="w-full h-12 bg-[#1e293b]/95 border border-[#334155] rounded-lg pl-4 pr-11 text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all duration-300"
              />
              <n-icon
                :component="SearchOutline"
                class="absolute right-3 top-[14px] text-[#60a5fa]"
                size="20"
              />
            </div>
            <n-button
              type="primary"
              size="large"
              class="rounded-lg font-extrabold"
              @click="$router.push('/enrollments/create')"
              >+ Nuevo</n-button
            >
          </div>
        </div>

        <div
          class="rounded-2xl overflow-hidden border border-[#334155] shadow-[0_6px_25px_rgba(0,0,0,0.4)] bg-[#1e293b]/80 backdrop-blur-sm"
        >
          <n-data-table
            :loading="isLoading"
            :columns="columns"
            :data="paginatedData"
            :pagination="false"
            :bordered="false"
            size="large"
            class="[&_.n-data-table-th]:text-center [&_.n-data-table-th]:font-extrabold [&_.n-data-table-td]:text-center [&_.n-data-table-tr:hover]:bg-[#1d4ed8]/20 transition-all"
          />
        </div>

        <div class="flex justify-end mt-6">
          <n-pagination
            v-model:page="currentPage"
            :page-size="itemsPerPage"
            :item-count="filtered.length"
            :show-quick-jumper="false"
            class="rounded-xl font-extrabold px-3 py-2 bg-[#1e293b] border border-[#3b82f6]/60 shadow-[0_0_20px_rgba(37,99,235,0.3)] text-white [&_.n-pagination-item]:bg-transparent [&_.n-pagination-item]:text-gray-200 [&_.n-pagination-item--active]:bg-[#2563eb] [&_.n-pagination-item--active]:text-white"
          />
        </div>
      </div>

      <n-modal
        v-model:show="showSchedule"
        preset="card"
        :style="{ width: '720px' }"
        title="Horario del Estudiante"
      >
        <div v-if="scheduleLoading" class="text-gray-300">Cargando...</div>
        <div v-else>
          <table class="w-full text-sm">
            <thead class="text-left text-gray-400">
              <tr>
                <th class="py-2">Curso</th>
                <th class="py-2">Día</th>
                <th class="py-2">Inicio</th>
                <th class="py-2">Fin</th>
                <th class="py-2">Aula</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="(r, i) in scheduleRows"
                :key="i"
                class="border-t border-white/10"
              >
                <td class="py-2">{{ r.courseName }}</td>
                <td class="py-2">{{ r.weekday }}</td>
                <td class="py-2">{{ r.start_time }}</td>
                <td class="py-2">{{ r.end_time }}</td>
                <td class="py-2">{{ r.classroom?.name || "-" }}</td>
              </tr>
            </tbody>
          </table>
          <div v-if="!scheduleRows.length" class="text-gray-400 mt-4">
            Sin horario registrado.
          </div>
        </div>
        <template #footer>
          <div class="flex justify-end">
            <n-button @click="showSchedule = false">Cerrar</n-button>
          </div>
        </template>
      </n-modal>
    </div>
  </app-layout>
</template>

<script>
import {
  NDataTable,
  NIcon,
  NPagination,
  NPopconfirm,
  NButton,
  NModal,
  useMessage,
} from "naive-ui";
import {
  TrashOutline,
  SearchOutline,
  CalendarOutline,
  AddCircleOutline,
} from "@vicons/ionicons5";
import { h } from "vue";
import AppLayout from "@/layouts/AppLayout.vue";
import EnrollmentService from "@/services/enrollmentService";

export default {
  name: "ListEnrollmentsView",
  components: {
    AppLayout,
    NDataTable,
    NPagination,
    NIcon,
    NButton,
    NModal,
  },
  data() {
    return {
      SearchOutline,
      enrollments: [],
      filtered: [],
      search: "",
      currentPage: 1,
      itemsPerPage: 8,
      isLoading: false,
      message: null,
      showSchedule: false,
      scheduleLoading: false,
      scheduleRows: [],
      columns: [
        {
          title: "#",
          key: "index",
          width: 60,
          align: "center",
          render: (_, index) =>
            index + 1 + (this.currentPage - 1) * this.itemsPerPage,
        },
        {
          title: "Estudiante",
          key: "student",
          render: (row) =>
            `${row.student.name} ${row.student.last_name ?? ""} ${
              row.student.second_last_name ?? ""
            }`.trim(),
        },
        {
          title: "Cursos",
          key: "courses",
          render: (row) =>
            h(
              "div",
              { class: "flex flex-wrap gap-2 justify-center" },
              row.courses.map((c) =>
                h(
                  "div",
                  {
                    class:
                      "inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#1d4ed8]/20 text-[#93c5fd] border border-[#1d4ed8]/40",
                  },
                  [
                    `${c.course.name}${
                      c.course.parallel ? ` (${c.course.parallel})` : ""
                    }`,
                    h(
                      NPopconfirm,
                      {
                        "onPositive-click": () =>
                          this.removeEnrollment(c.enrollmentId),
                        "positive-text": "Sí",
                        "negative-text": "No",
                      },
                      {
                        trigger: () =>
                          h(
                            "button",
                            { class: "ml-1 text-rose-300 hover:text-rose-400" },
                            [h(NIcon, null, { default: () => h(TrashOutline) })]
                          ),
                        default: () => "¿Eliminar esta inscripción?",
                      }
                    ),
                  ]
                )
              )
            ),
        },
        {
          title: "Acciones",
          key: "actions",
          render: (row) =>
            h("div", { class: "flex gap-2 justify-center" }, [
              h(
                "button",
                {
                  class:
                    "px-3 py-1.5 rounded-lg text-sm font-bold bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] text-white hover:shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all",
                  onClick: () => this.openSchedule(row.student.id),
                },
                [
                  h(NIcon, null, { default: () => h(CalendarOutline) }),
                  " Ver horario",
                ]
              ),
              h(
                "button",
                {
                  class:
                    "px-3 py-1.5 rounded-lg text-sm font-bold bg-[#1e293b] border border-[#334155] text-gray-300 hover:bg-[#334155] transition-all",
                  onClick: () =>
                    this.$router.push(
                      `/enrollments/create?studentId=${row.student.id}`
                    ),
                },
                [
                  h(NIcon, null, { default: () => h(AddCircleOutline) }),
                  " Añadir cursos",
                ]
              ),
            ]),
        },
      ],
    };
  },
  computed: {
    paginatedData() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.filtered.slice(start, start + this.itemsPerPage);
    },
  },
  methods: {
    async fetchSummary() {
      this.isLoading = true;
      try {
        const data = await EnrollmentService.getSummary();
        this.enrollments = data;
        this.filtered = [...data];
      } catch {
        this.message?.error?.("Error al cargar inscripciones.");
      } finally {
        this.isLoading = false;
      }
    },
    handleSearch() {
      const q = this.search.toLowerCase().trim();
      this.filtered = this.enrollments.filter((e) => {
        const full = `${e.student.name} ${e.student.last_name ?? ""} ${
          e.student.second_last_name ?? ""
        }`
          .trim()
          .toLowerCase();
        const anyCourse = e.courses.some((c) =>
          `${c.course.name} ${c.course.parallel ?? ""}`
            .toLowerCase()
            .includes(q)
        );
        return full.includes(q) || anyCourse;
      });
      this.currentPage = 1;
    },
    async removeEnrollment(id) {
      try {
        await EnrollmentService.remove(id);
        this.message?.success?.("Inscripción eliminada.");
        await this.fetchSummary();
      } catch {
        this.message?.error?.("Error al eliminar inscripción.");
      }
    },
    async openSchedule(studentId) {
      this.showSchedule = true;
      this.scheduleLoading = true;
      try {
        this.scheduleRows = await EnrollmentService.getStudentSchedule(
          studentId
        );
      } catch {
        this.scheduleRows = [];
      } finally {
        this.scheduleLoading = false;
      }
    },
  },
  created() {
    this.message = useMessage();
    this.fetchSummary();
  },
};
</script>
