<template>
  <app-layout>
    <div class="min-h-screen">
      <n-card title="Bienvenido">
        <p v-if="user">Hola, {{ user.email }} (Rol: {{ user.role.name }})</p>
        <p v-else>Cargando...</p>
      </n-card>
    </div>
  </app-layout>
</template>

<script>
import { NCard } from "naive-ui";
import AppLayout from "@/layouts/AppLayout.vue";
import AuthService from "@/services/authService";

export default {
  name: "HomeView",
  components: { NCard, AppLayout },
  data() {
    return {
      user: null,
    };
  },
  async created() {
    try {
      const { user } = await AuthService.getUser();
      this.user = user;
    } catch (error) {
      this.$router.push("/login");
    }
  },
};
</script>
