<template>
  <app-layout>
    <div class="min-h-screen p-4">
      <n-card title="Estudiantes" size="large">
        <div class="mb-4 flex flex-wrap justify-between items-center gap-2">
          <n-input
            v-model:value="search"
            placeholder="Buscar por nombre o CI"
            clearable
            @input="handleSearch"
            style="max-width: 300px"
          />
          <n-button type="primary" @click="$router.push('/students/create')">
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
            :item-count="filteredStudents.length"
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
} from "naive-ui";
import { NIcon, NPopconfirm } from "naive-ui";
import { PencilOutline, TrashOutline } from "@vicons/ionicons5";
import { h } from "vue";

import AppLayout from "@/layouts/AppLayout.vue";
import StudentService from "@/services/studentService";

export default {
  name: "ListStudentsView",
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
      students: [],
      filteredStudents: [],
      search: "",
      currentPage: 1,
      itemsPerPage: 10,
      isLoading: false,
      message: null,
      columns: [
        { title: "#", key: "id", width: 60 },
        {
          title: "Nombre Completo",
          key: "full_name",
          render: (row) =>
            `${row.name} ${row.last_name} ${row.second_last_name}`,
        },
        { title: "CI", key: "ci" },
        { title: "Teléfono", key: "phone" },
        { title: "Género", key: "gender" },
        {
          title: "Imagen",
          key: "image",
          render: (row) =>
            row.image
              ? h("img", {
                  src: `http://localhost:3000${row.image}`,
                  alt: "foto",
                  class: "w-10 h-10 rounded-full object-cover border",
                })
              : "-",
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
                  onClick: () => this.$router.push(`/students/${row.id}/edit`),
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
                  default: () => "¿Eliminar este estudiante?",
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
      return this.filteredStudents.slice(start, start + this.itemsPerPage);
    },
  },
  methods: {
    async fetchStudents() {
      this.isLoading = true;
      try {
        const data = await StudentService.getAll();
        this.students = data;
        this.filteredStudents = [...data];
      } catch (err) {
        this.message.error("Error al cargar estudiantes.");
      } finally {
        this.isLoading = false;
      }
    },
    handleSearch() {
      const query = this.search.toLowerCase();
      this.filteredStudents = this.students.filter((student) => {
        const fullName =
          `${student.name} ${student.last_name} ${student.second_last_name}`.toLowerCase();
        return (
          fullName.includes(query) ||
          (student.ci && student.ci.toLowerCase().includes(query))
        );
      });
      this.currentPage = 1;
    },
    async handleDelete(id) {
      try {
        await StudentService.remove(id);
        this.message.success("Estudiante eliminado.");
        await this.fetchStudents();
      } catch (err) {
        this.message.error("Error al eliminar estudiante.");
      }
    },
  },
  created() {
    this.message = useMessage();
    this.fetchStudents();
  },
};
</script>

<style scoped>
table img {
  transition: 0.3s ease;
}
table img:hover {
  transform: scale(1.1);
}
</style>
