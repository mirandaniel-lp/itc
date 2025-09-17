<template>
  <app-layout>
    <div class="min-h-screen p-4">
      <n-card title="Usuarios">
        <div class="mb-4 flex flex-wrap justify-between items-center gap-2">
          <n-input
            v-model:value="search"
            placeholder="Buscar por email o rol"
            clearable
            @input="handleSearch"
            style="max-width: 300px"
          />
          <n-button type="primary" @click="$router.push('/users/create')">
            + Nuevo Usuario
          </n-button>
        </div>

        <div class="overflow-x-auto">
          <n-data-table
            :loading="loading"
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
            :item-count="filteredUsers.length"
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
import { NTag, NIcon, NPopconfirm } from "naive-ui";
import { PencilOutline, TrashOutline } from "@vicons/ionicons5";
import AppLayout from "@/layouts/AppLayout.vue";
import UserService from "@/services/userService";
import { h } from "vue";

export default {
  name: "ListUsersView",
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
      users: [],
      filteredUsers: [],
      search: "",
      currentPage: 1,
      itemsPerPage: 10,
      loading: false,
      message: null,
      columns: [
        { title: "#", key: "id", width: 60 },
        { title: "Email", key: "email" },
        {
          title: "Rol",
          key: "role",
          render: (row) =>
            h(
              NTag,
              { type: "info", size: "small" },
              { default: () => row.role?.name || "-" }
            ),
        },
        {
          title: "Fecha",
          key: "created_at",
          render: (row) => new Date(row.created_at).toLocaleDateString("es-BO"),
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
                  onClick: () => this.$router.push(`/users/${row.id}/edit`),
                },
                [h(NIcon, null, { default: () => h(PencilOutline) }), " Editar"]
              ),
              h(
                NPopconfirm,
                {
                  "onPositive-click": () => this.eliminar(row.id),
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
      } catch (err) {
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
    async eliminar(id) {
      try {
        await UserService.deleteUser(id);
        this.message.success("Usuario eliminado.");
        await this.fetchUsers();
      } catch (err) {
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

<style scoped></style>
