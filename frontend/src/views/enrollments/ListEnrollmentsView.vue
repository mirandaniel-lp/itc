<template>
  <app-layout>
    <div class="min-h-screen p-4">
      <n-card title="Inscripciones" size="large">
        <div class="mb-4 flex flex-wrap justify-between items-center gap-2">
          <n-input
            v-model:value="search"
            placeholder="Buscar por estudiante o curso"
            clearable
            @input="handleSearch"
            style="max-width: 300px"
          />
          <n-button type="primary" @click="$router.push('/enrollments/create')">
            + Nueva
          </n-button>
        </div>

        <div class="overflow-x-auto">
          <n-data-table
            :loading="isLoading"
            :columns="columns"
            :data="paginatedData"
            :pagination="false"
            :bordered="false"
            :striped="true"
          />
        </div>

        <div class="flex justify-end mt-4">
          <n-pagination
            v-model:page="currentPage"
            :page-size="itemsPerPage"
            :item-count="filteredEnrollments.length"
            show-quick-jumper
          />
        </div>
      </n-card>
    </div>
  </app-layout>
</template>

<script>
import {
  NCard,
  NDataTable,
  NButton,
  NInput,
  NPagination,
  useMessage,
  NPopconfirm,
  NIcon,
} from "naive-ui";
import { TrashOutline } from "@vicons/ionicons5";
import { h } from "vue";
import AppLayout from "@/layouts/AppLayout.vue";
import EnrollmentService from "@/services/enrollmentService";

export default {
  name: "ListEnrollmentsView",
  components: {
    AppLayout,
    NCard,
    NDataTable,
    NButton,
    NInput,
    NPagination,
  },
  data() {
    return {
      enrollments: [],
      filteredEnrollments: [],
      search: "",
      currentPage: 1,
      itemsPerPage: 10,
      isLoading: false,
      message: null,
      columns: [
        { title: "#", key: "id", width: 60 },
        {
          title: "Estudiante",
          key: "student",
          render: (row) =>
            row.student
              ? `${row.student.name} ${row.student.last_name} ${row.student.second_last_name}`
              : "-",
        },
        {
          title: "Curso",
          key: "course",
          render: (row) =>
            row.course ? `${row.course.name} (${row.course.parallel})` : "-",
        },
        {
          title: "Docente",
          key: "teacher",
          render: (row) =>
            row.course?.teacher
              ? `${row.course.teacher.name} ${row.course.teacher.last_name}`
              : "-",
        },
        {
          title: "Modalidad",
          key: "modality",
          render: (row) => row.course?.modality?.name || "-",
        },
        {
          title: "Tipo de Pago",
          key: "payment_type",
        },
        {
          title: "Fecha",
          key: "enrollment_date",
          render: (row) =>
            row.enrollment_date
              ? new Date(row.enrollment_date).toLocaleDateString()
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
                      class: "n-button n-button--error n-button--small",
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
        this.message.error("Error al cargar inscripciones.");
      } finally {
        this.isLoading = false;
      }
    },
    handleSearch() {
      const q = this.search.toLowerCase();
      this.filteredEnrollments = this.enrollments.filter((e) => {
        const fullName = `${e.student?.name} ${e.student?.last_name ?? ""} ${
          e.student?.second_last_name ?? ""
        }`.toLowerCase();
        const courseName = `${e.course?.name ?? ""} ${
          e.course?.parallel ?? ""
        }`.toLowerCase();
        return fullName.includes(q) || courseName.includes(q);
      });
      this.currentPage = 1;
    },
    async handleDelete(id) {
      try {
        await EnrollmentService.remove(id);
        this.message.success("Inscripción eliminada.");
        await this.fetchEnrollments();
      } catch {
        this.message.error("Error al eliminar inscripción.");
      }
    },
  },
  created() {
    this.message = useMessage();
    this.fetchEnrollments();
  },
};
</script>
