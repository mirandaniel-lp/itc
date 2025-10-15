<template>
  <app-layout>
    <div class="min-h-screen p-8 bg-[#0f172a] text-white">
      <div class="max-w-6xl mx-auto space-y-8">
        <div
          class="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
        >
          <h1 class="text-4xl font-extrabold text-[#ffffff]">
            Lista de Usuarios
          </h1>

          <div class="relative w-full md:w-80">
            <input
              v-model="search"
              @input="handleSearch"
              type="text"
              placeholder="Buscar por correo o rol..."
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
            :loading="loading"
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
            :item-count="filteredUsers.length"
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
  NTag,
  NIcon,
  NPopconfirm,
  NPagination,
  useMessage,
} from "naive-ui";
import { PencilOutline, TrashOutline, SearchOutline } from "@vicons/ionicons5";
import AppLayout from "@/layouts/AppLayout.vue";
import UserService from "@/services/userService";
import { h } from "vue";

export default {
  name: "ListUsersView",
  components: {
    AppLayout,
    NDataTable,
    NPagination,
    NIcon,
  },
  data() {
    return {
      SearchOutline,
      users: [],
      filteredUsers: [],
      search: "",
      currentPage: 1,
      itemsPerPage: 8,
      loading: false,
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
          title: "Correo electrónico",
          key: "email",
        },
        {
          title: "Rol",
          key: "role",
          render: (row) =>
            h(
              NTag,
              {
                type: "info",
                bordered: false,
                class:
                  "px-3 py-1 font-bold bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] text-white",
              },
              { default: () => row.role?.name || "-" }
            ),
        },
        {
          title: "Fecha de registro",
          key: "created_at",
          render: (row) =>
            h(
              "span",
              { class: "text-gray-400" },
              new Date(row.created_at).toLocaleDateString("es-BO")
            ),
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
                  onClick: () => this.$router.push(`/users/${row.id}/edit`),
                },
                [h(NIcon, null, { default: () => h(PencilOutline) }), " Editar"]
              ),
              h(
                NPopconfirm,
                {
                  "onPositive-click": () => this.delete(row.id),
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
                        "Eliminar",
                      ]
                    ),
                  default: () => "¿Eliminar este usuario?",
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
      return this.filteredUsers.slice(start, start + this.itemsPerPage);
    },
  },
  methods: {
    async fetchUsers() {
      this.loading = true;
      try {
        const data = await UserService.getUsers();
        this.users = data;
        this.filteredUsers = [...data];
      } catch {
        this.message.error("Error al cargar usuarios.");
      } finally {
        this.loading = false;
      }
    },
    handleSearch() {
      const query = this.search.toLowerCase();
      this.filteredUsers = this.users.filter((user) => {
        const email = user.email?.toLowerCase() || "";
        const role = user.role?.name?.toLowerCase() || "";
        return email.includes(query) || role.includes(query);
      });
      this.currentPage = 1;
    },
    async delete(id) {
      try {
        await UserService.deleteUser(id);
        this.message.success("Usuario eliminado.");
        await this.fetchUsers();
      } catch {
        this.message.error("Error al eliminar.");
      }
    },
  },
  created() {
    this.message = useMessage();
    this.fetchUsers();
  },
};
</script>
