<template>
  <app-layout>
    <div class="min-h-screen">
      <n-card title="Editar Usuario">
        <n-form :model="form" label-placement="top">
          <n-form-item label="Email">
            <n-input v-model:value="form.email" />
          </n-form-item>
          <n-form-item label="Rol">
            <n-select v-model:value="form.roleId" :options="roles" />
          </n-form-item>
          <n-button type="primary" @click="update">Guardar</n-button>
        </n-form>
      </n-card>
    </div>
  </app-layout>
</template>

<script>
import {
  NForm,
  NFormItem,
  NInput,
  NSelect,
  NButton,
  NCard,
  useMessage,
} from "naive-ui";
import AppLayout from "@/layouts/AppLayout.vue";
import UserService from "@/services/userService";

export default {
  name: "EditUserView",
  components: {
    AppLayout,
    NForm,
    NFormItem,
    NInput,
    NSelect,
    NButton,
    NCard,
  },
  data() {
    return {
      form: {
        email: "",
        roleId: "",
      },
      roles: [
        { label: "Admin", value: 1 },
        { label: "Usuario", value: 2 },
      ],
      message: null,
    };
  },
  methods: {
    async fetchUser() {
      try {
        const id = parseInt(this.$route.params.id);
        const user = await UserService.getUser(id);
        this.form.email = user.email;
        this.form.roleId = user.roleId;
      } catch {
        this.message.error("Usuario no encontrado.");
        this.$router.push("/users");
      }
    },
    async update() {
      try {
        const id = parseInt(this.$route.params.id);
        await UserService.updateUser(id, this.form);
        this.message.success("Usuario actualizado.");
        this.$router.push("/users");
      } catch {
        this.message.error("Error al actualizar.");
      }
    },
  },
  created() {
    this.message = useMessage();
    this.fetchUser();
  },
};
</script>
