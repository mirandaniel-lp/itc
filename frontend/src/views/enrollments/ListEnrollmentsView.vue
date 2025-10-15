<template>
  <app-layout>
    <div class="min-h-screen p-8 bg-[#0f172a] text-white">
      <div class="max-w-6xl mx-auto space-y-8">
        <!-- Header -->
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
              class="font-extrabold bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] hover:shadow-[0_0_15px_rgba(37,99,235,0.5)]"
              @click="$router.push('/enrollments/create')"
            >
              + Nueva
            </n-button>
          </div>
        </div>

        <!-- Tabla -->
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

        <!-- Paginación -->
        <div class="flex justify-end mt-6">
          <n-pagination
            v-model:page="currentPage"
            :page-size="itemsPerPage"
            :item-count="filteredEnrollments.length"
            :show-quick-jumper="false"
            class="rounded-xl font-extrabold px-3 py-2 bg-[#1e293b] border border-[#3b82f6]/60 shadow-[0_0_20px_rgba(37,99,235,0.3)] text-white [&_.n-pagination-item]:bg-transparent [&_.n-pagination-item]:text-gray-200 [&_.n-pagination-item--active]:bg-[#2563eb] [&_.n-pagination-item--active]:text-white"
          />
        </div>
      </div>
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
  useMessage,
} from "naive-ui";

import { TrashOutline, SearchOutline } from "@vicons/ionicons5";
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
  },
  data() {
    return {
      SearchOutline,
      enrollments: [],
      filteredEnrollments: [],
      search: "",
      currentPage: 1,
      itemsPerPage: 8,
      isLoading: false,
      message: null,
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
            row.student
              ? `${row.student.name} ${row.student.last_name ?? ""} ${
                  row.student.second_last_name ?? ""
                }`.trim()
              : "-",
        },
        {
          title: "Curso",
          key: "course",
          render: (row) =>
            row.course
              ? `${row.course.name} ${
                  row.course.parallel ? `(${row.course.parallel})` : ""
                }`.trim()
              : "-",
        },
        {
          title: "Docente",
          key: "teacher",
          render: (row) =>
            row.course?.teacher
              ? `${row.course.teacher.name} ${
                  row.course.teacher.last_name ?? ""
                }`.trim()
              : "Sin docente",
        },
        {
          title: "Modalidad",
          key: "modality",
          render: (row) => row.course?.modality?.name || "—",
        },
        {
          title: "Tipo de Pago",
          key: "payment_type",
          render: (row) =>
            row.payment_type
              ? h(
                  "span",
                  {
                    class:
                      "inline-flex items-center justify-center px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#1d4ed8]/20 text-[#93c5fd] border border-[#1d4ed8]/40",
                  },
                  row.payment_type
                )
              : "—",
        },
        {
          title: "Fecha",
          key: "enrollment_date",
          render: (row) =>
            row.enrollment_date
              ? new Date(row.enrollment_date).toLocaleDateString("es-BO", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })
              : "-",
        },
        {
          title: "Acciones",
          key: "actions",
          render: (row) =>
            h(
              NPopconfirm,
              {
                "onPositive-click": () => this.handleDelete(row.id),
                "positive-text": "Sí",
                "negative-text": "No",
              },
              {
                trigger: () =>
                  h(
                    "button",
                    {
                      class:
                        "px-3 py-1.5 rounded-lg text-sm font-bold bg-gradient-to-r from-[#7f1d1d] to-[#dc2626] text-white hover:shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all",
                    },
                    [
                      h(NIcon, null, { default: () => h(TrashOutline) }),
                      " Eliminar",
                    ]
                  ),
                default: () => "¿Eliminar esta inscripción?",
              }
            ),
        },
      ],
    };
  },
  computed: {
    paginatedData() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.filteredEnrollments.slice(start, start + this.itemsPerPage);
    },
  },
  methods: {
    async fetchEnrollments() {
      this.isLoading = true;
      try {
        const data = await EnrollmentService.getAll();
        this.enrollments = data;
        this.filteredEnrollments = [...data];
      } catch {
        this.message?.error?.("Error al cargar inscripciones.");
      } finally {
        this.isLoading = false;
      }
    },
    handleSearch() {
      const q = this.search.toLowerCase().trim();
      this.filteredEnrollments = this.enrollments.filter((e) => {
        const fullName = `${e.student?.name ?? ""} ${
          e.student?.last_name ?? ""
        } ${e.student?.second_last_name ?? ""}`
          .trim()
          .toLowerCase();
        const courseName = `${e.course?.name ?? ""} ${e.course?.parallel ?? ""}`
          .trim()
          .toLowerCase();
        return fullName.includes(q) || courseName.includes(q);
      });
      this.currentPage = 1;
    },
    async handleDelete(id) {
      try {
        await EnrollmentService.remove(id);
        this.message?.success?.("Inscripción eliminada.");
        await this.fetchEnrollments();
      } catch {
        this.message?.error?.("Error al eliminar inscripción.");
      }
    },
  },
  created() {
    this.message = useMessage();
    this.fetchEnrollments();
  },
};
</script>

<style></style>
