<template>
  <app-layout>
    <div class="min-h-screen p-8 bg-[#0f172a] text-white">
      <div class="max-w-6xl mx-auto space-y-8">
        <div
          class="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <h1 class="text-4xl font-extrabold text-[#ffffff]">
            Lista de Estudiantes
          </h1>

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
            :item-count="filteredStudents.length"
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
import {
  PencilOutline,
  TrashOutline,
  SearchOutline,
  MaleOutline,
  FemaleOutline,
  TransgenderOutline,
} from "@vicons/ionicons5";
import { h } from "vue";
import AppLayout from "@/layouts/AppLayout.vue";
import StudentService from "@/services/studentService";

export default {
  name: "ListStudentsView",
  components: {
    AppLayout,
    NDataTable,
    NPagination,
    NIcon,
  },
  data() {
    return {
      SearchOutline,
      students: [],
      filteredStudents: [],
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
          title: "Nombre Completo",
          key: "full_name",
          render: (row) =>
            `${row.name} ${row.last_name ?? ""} ${
              row.second_last_name ?? ""
            }`.trim(),
        },
        { title: "Carnet de Identidad", key: "ci" },
        { title: "Teléfono", key: "phone" },
        {
          title: "Género",
          key: "gender",
          render: (row) => {
            const gender = (row.gender || "").toUpperCase();
            let color = "";
            let icon = null;
            if (gender === "MASCULINO") {
              color = "from-[#1e3a8a] to-[#2563eb]";
              icon = MaleOutline;
            } else if (gender === "FEMENINO") {
              color = "from-[#db2777] to-[#ec4899]";
              icon = FemaleOutline;
            } else {
              color = "from-[#6b21a8] to-[#a855f7]";
              icon = TransgenderOutline;
            }
            return h(
              "div",
              {
                class: `inline-flex items-center justify-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold text-white bg-gradient-to-r ${color} shadow-[0_0_10px_rgba(255,255,255,0.15)]`,
              },
              [h(NIcon, { component: icon, size: 14 })]
            );
          },
        },
        {
          title: "Imagen",
          key: "image",
          render: (row) =>
            row.image
              ? h("img", {
                  src: `http://localhost:3000${row.image}`,
                  alt: "foto",
                  class:
                    "w-10 h-10 rounded-full object-cover border border-[#3b82f6]/40 shadow-[0_0_10px_rgba(37,99,235,0.4)]",
                })
              : "-",
        },
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
                        class:
                          "px-3 py-1.5 rounded-lg text-sm font-bold bg-gradient-to-r from-[#7f1d1d] to-[#dc2626] text-white hover:shadow-[0_0_15px_rgba(239,68,68,0.5)] transition-all",
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
      } catch {
        this.message.error("Error al cargar estudiantes.");
      } finally {
        this.isLoading = false;
      }
    },
    handleSearch() {
      const query = this.search.toLowerCase();
      this.filteredStudents = this.students.filter((student) => {
        const fullName = `${student.name} ${student.last_name ?? ""} ${
          student.second_last_name ?? ""
        }`.toLowerCase();
        const ci = student.ci?.toLowerCase() || "";
        return fullName.includes(query) || ci.includes(query);
      });
      this.currentPage = 1;
    },
    async handleDelete(id) {
      try {
        await StudentService.remove(id);
        this.message.success("Estudiante eliminado.");
        await this.fetchStudents();
      } catch {
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
