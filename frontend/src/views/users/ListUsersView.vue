<template>
  <app-layout>
    <div class="min-h-screen">
      <n-card title="Usuarios">
        <n-table :bordered="false" :striped="true">
          <thead>
            <tr>
              <th>#</th>
              <th>Email</th>
              <th>Rol</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id">
              <td>{{ user.id }}</td>
              <td>{{ user.email }}</td>
              <td>
                <n-tag type="info" size="small">{{ user.role.name }}</n-tag>
              </td>
              <td>{{ new Date(user.created_at).toLocaleDateString() }}</td>
              <td>
                <n-button
                  text
                  type="primary"
                  @click="$router.push(`/users/${user.id}/edit`)"
                >
                  <n-icon><PencilOutline /></n-icon>
                </n-button>

                <n-popconfirm
                  @positive-click="eliminar(user.id)"
                  positive-text="Sí"
                  negative-text="No"
                >
                  <template #trigger>
                    <n-button text type="error">
                      <n-icon><TrashOutline /></n-icon>
                    </n-button>
                  </template>
                  ¿Eliminar este usuario?
                </n-popconfirm>
              </td>
            </tr>
          </tbody>
        </n-table>
      </n-card>
    </div>
  </app-layout>
</template>

<script>
import {
  NCard,
  NTable,
  NButton,
  NTag,
  NIcon,
  NPopconfirm,
  useMessage,
} from "naive-ui";
import { PencilOutline, TrashOutline } from "@vicons/ionicons5";
import AppLayout from "@/layouts/AppLayout.vue";
import UserService from "@/services/userService";

export default {
  name: "ListUsersView",
  components: {
    AppLayout,
    NCard,
    NTable,
    NButton,
    NTag,
    NIcon,
    NPopconfirm,
    PencilOutline,
    TrashOutline,
  },
  data() {
    return {
      users: [],
      loading: false,
      message: null, // ✅ Aquí guardamos useMessage()
    };
  },
  methods: {
    async fetchUsers() {
      this.loading = true;
      try {
        this.users = await UserService.getUsers();
      } catch (err) {
        this.message.error("Error al cargar usuarios.");
      } finally {
        this.loading = false;
      }
    },
    async eliminar(id) {
      try {
        await UserService.deleteUser(id); // ✅ Esto hace soft-delete
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
