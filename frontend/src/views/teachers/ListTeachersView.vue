<template>
  <app-layout>
    <div class="min-h-screen p-8 bg-[#0f172a] text-white">
      <div class="max-w-6xl mx-auto space-y-8">
        <div
          class="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <h1 class="text-4xl font-extrabold text-[#ffffff]">
            Lista de Docentes
          </h1>
          <div class="flex items-center gap-3 w-full md:w-auto">
            <div class="relative w-full md:w-80">
              <input
                v-model="search"
                @input="handleSearch"
                type="text"
                placeholder="Buscar"
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
              @click="$router.push('/teachers/create')"
            >
              + Nuevo
            </n-button>
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
            :item-count="filteredTeachers.length"
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
  NPopconfirm,
  NPagination,
  useMessage,
} from "naive-ui";
import { PencilOutline, TrashOutline, SearchOutline } from "@vicons/ionicons5";
import { h } from "vue";
import AppLayout from "@/layouts/AppLayout.vue";
import TeacherService from "@/services/teacherService";

export default {
  name: "ListTeachersView",
  components: {
    AppLayout,
    NDataTable,
    NPagination,
  },
  data() {
    return {
      SearchOutline,
      teachers: [],
      filteredTeachers: [],
      search: "",
      currentPage: 1,
      itemsPerPage: 10,
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
          title: "Nombre Completo",
          key: "full_name",
          render: (row) =>
            `${row.name ?? ""} ${row.last_name ?? ""} ${
              row.second_last_name ?? ""
            }`.trim(),
        },
        { title: "Carnet de Identidad", key: "ci" },
        { title: "Teléfono", key: "phone" },
        { title: "Especialidad", key: "specialty" },
        {
          title: "Acciones",
          key: "actions",
          render: (row) =>
            h("div", { class: "flex gap-3 justify-center" }, [
              h(
                "button",
                {
                  class:
                    "px-3 py-1.5 rounded-lg text-sm font-bold bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] text-white hover:shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all",
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
                        class:
                          "px-3 py-1.5 rounded-lg text-sm font-bold bg-gradient-to-r from-[#7f1d1d] to-[#dc2626] text-white hover:shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all",
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
      } catch {
        this.message.error("Error al cargar docentes.");
      } finally {
        this.isLoading = false;
      }
    },
    handleSearch() {
      const q = this.search.toLowerCase();
      this.filteredTeachers = this.teachers.filter((t) => {
        const full = `${t.name ?? ""} ${t.last_name ?? ""} ${
          t.second_last_name ?? ""
        }`.toLowerCase();
        const ci = t.ci?.toLowerCase() || "";
        return full.includes(q) || ci.includes(q);
      });
      this.currentPage = 1;
    },
    async handleDelete(id) {
      try {
        await TeacherService.remove(id);
        this.message.success("Docente eliminado.");
        await this.fetchTeachers();
      } catch {
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
