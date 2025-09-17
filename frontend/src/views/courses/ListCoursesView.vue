<template>
  <app-layout>
    <div class="min-h-screen p-4">
      <n-card title="Cursos" size="large">
        <div class="mb-4 flex flex-wrap justify-between items-center gap-2">
          <n-input
            v-model:value="search"
            placeholder="Buscar por nombre o paralelo"
            clearable
            @input="handleSearch"
            style="max-width: 300px"
          />
          <n-button type="primary" @click="$router.push('/courses/create')">
            + Nuevo
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
            :item-count="filteredCourses.length"
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
import { PencilOutline, TrashOutline } from "@vicons/ionicons5";
import { h } from "vue";
import AppLayout from "@/layouts/AppLayout.vue";
import CourseService from "@/services/courseService";

export default {
  name: "ListCoursesView",
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
      courses: [],
      filteredCourses: [],
      search: "",
      currentPage: 1,
      itemsPerPage: 10,
      isLoading: false,
      message: null,
      columns: [
        { title: "#", key: "id", width: 60 },
        { title: "Nombre", key: "name" },
        { title: "Paralelo", key: "parallel" },
        {
          title: "Docente",
          key: "teacher",
          render: (row) =>
            row.teacher ? `${row.teacher.name} ${row.teacher.last_name}` : "-",
        },
        {
          title: "Modalidad",
          key: "modality",
          render: (row) => row.modality?.name || "-",
        },
        {
          title: "Inicio",
          key: "start_date",
          render: (row) =>
            row.start_date
              ? new Date(row.start_date).toLocaleDateString("es-BO", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })
              : "-",
        },
        {
          title: "Fin",
          key: "end_date",
          render: (row) =>
            row.start_date
              ? new Date(row.end_date).toLocaleDateString("es-BO", {
                  day: "2-digit",
                  month: "2-digit",
                  year: "numeric",
                })
              : "-",
        },
        {
          title: "Costo (Bs.)",
          key: "cost",
        },
        {
          title: "Acciones",
          key: "actions",
          render: (row) =>
            h("div", { class: "flex gap-2" }, [
              h(
                "button",
                {
                  class: "n-button n-button--primary n-button--small",
                  onClick: () => this.$router.push(`/courses/${row.id}/edit`),
                },
                [h(NIcon, null, { default: () => h(PencilOutline) }), " Editar"]
              ),
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
                  default: () => "¿Eliminar este curso?",
                }
              ),
            ]),
        },
      ],
    };
  },
  computed: {
    paginatedData() {
      const start = (this.currentPage - 1) * this.itemsPerPage;
      return this.filteredCourses.slice(start, start + this.itemsPerPage);
    },
  },
  methods: {
    async fetchCourses() {
      this.isLoading = true;
      try {
        const data = await CourseService.getAll();
        this.courses = data;
        this.filteredCourses = [...data];
      } catch (err) {
        this.message.error("Error al cargar cursos.");
      } finally {
        this.isLoading = false;
      }
    },
    handleSearch() {
      const q = this.search.toLowerCase();
      this.filteredCourses = this.courses.filter((c) => {
        return (
          c.name.toLowerCase().includes(q) ||
          c.parallel.toLowerCase().includes(q)
        );
      });
      this.currentPage = 1;
    },
    async handleDelete(id) {
      try {
        await CourseService.remove(id);
        this.message.success("Curso eliminado.");
        this.fetchCourses();
      } catch {
        this.message.error("Error al eliminar curso.");
      }
    },
  },
  created() {
    this.message = useMessage();
    this.fetchCourses();
  },
};
</script>
