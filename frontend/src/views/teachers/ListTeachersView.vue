<template>
  <app-layout>
    <div class="min-h-screen p-4">
      <n-card title="Docentes" size="large">
        <div class="mb-4 flex flex-wrap justify-between items-center gap-2">
          <n-input
            v-model:value="search"
            placeholder="Buscar por nombre o CI"
            clearable
            @input="handleSearch"
            style="max-width: 300px"
          />
          <n-button type="primary" @click="$router.push('/teachers/create')">
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
            :item-count="filteredTeachers.length"
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
  NIcon,
  NPopconfirm,
} from "naive-ui";
import { h } from "vue";
import { PencilOutline, TrashOutline } from "@vicons/ionicons5";

import AppLayout from "@/layouts/AppLayout.vue";
import TeacherService from "@/services/teacherService";

export default {
  name: "ListTeachersView",
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
      teachers: [],
      filteredTeachers: [],
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
            `${row.name ?? ""} ${row.last_name ?? ""} ${
              row.second_last_name ?? ""
            }`,
        },
        { title: "CI", key: "ci" },
        { title: "Teléfono", key: "phone" },
        { title: "Especialidad", key: "specialty" },
        {
          title: "Acciones",
          key: "actions",
          render: (row) =>
            h("div", { class: "flex gap-2" }, [
              h(
                "button",
                {
                  class: "n-button n-button--primary n-button--small",
                  onClick: () => this.$router.push(`/teachers/${row.id}/edit`),
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
                  default: () => "¿Eliminar este docente?",
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
      return this.filteredTeachers.slice(start, start + this.itemsPerPage);
    },
  },
  methods: {
    async fetchTeachers() {
      this.isLoading = true;
      try {
        const data = await TeacherService.getAll();
        this.teachers = data;
        this.filteredTeachers = [...data];
      } catch (err) {
        this.message.error("Error al cargar docentes.");
      } finally {
        this.isLoading = false;
      }
    },
    handleSearch() {
      const query = this.search.toLowerCase();
      this.filteredTeachers = this.teachers.filter((t) => {
        const fullName = `${t.name ?? ""} ${t.last_name ?? ""} ${
          t.second_last_name ?? ""
        }`.toLowerCase();
        return (
          fullName.includes(query) ||
          (t.ci && t.ci.toLowerCase().includes(query))
        );
      });
      this.currentPage = 1;
    },
    async handleDelete(id) {
      try {
        await TeacherService.remove(id);
        this.message.success("Docente eliminado.");
        await this.fetchTeachers();
      } catch (err) {
        this.message.error("Error al eliminar docente.");
      }
    },
  },
  created() {
    this.message = useMessage();
    this.fetchTeachers();
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
