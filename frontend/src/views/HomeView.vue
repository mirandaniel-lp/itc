<template>
  <app-layout>
    <div class="min-h-screen py-8">
      <div class="max-w-5xl mx-auto">
        <n-card class="mb-8 shadow-lg" content-style="padding: 2rem;">
          <div
            class="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <div>
              <div class="text-2xl font-bold text-primary-700 mb-1">
                ¡Bienvenido{{ user?.role?.name ? `, ${user.role.name}` : "" }}!
              </div>
              <div class="text-gray-600">
                {{ user?.email }}
              </div>
            </div>
            <div class="flex gap-2">
              <n-tag type="info" size="large" v-if="user?.role?.name">
                {{ user.role.name }}
              </n-tag>
            </div>
          </div>
        </n-card>

        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <n-card
            v-for="card in cards"
            :key="card.title"
            class="shadow-md hover:shadow-xl transition"
          >
            <div class="flex items-center gap-3">
              <div class="text-3xl text-primary-600">
                <component :is="card.icon" />
              </div>
              <div>
                <div class="font-semibold text-lg">{{ card.title }}</div>
                <div class="text-gray-500 text-sm">{{ card.subtitle }}</div>
              </div>
            </div>
            <n-button
              class="mt-4"
              type="primary"
              secondary
              block
              @click="goTo(card.route)"
            >
              {{ card.button }}
            </n-button>
          </n-card>
        </div>
      </div>
    </div>
  </app-layout>
</template>

<script>
import { NCard, NTag, NButton } from "naive-ui";
import { BookOutline, PeopleOutline, SchoolOutline } from "@vicons/ionicons5";
import AppLayout from "@/layouts/AppLayout.vue";
import AuthService from "@/services/authService";

export default {
  name: "HomeView",
  components: {
    NCard,
    NTag,
    NButton,
    AppLayout,
    BookOutline,
    PeopleOutline,
    SchoolOutline,
  },
  data() {
    return {
      user: null,
      cards: [],
    };
  },
  async created() {
    try {
      const { user } = await AuthService.getUser();
      this.user = user;
      this.setupCards();
    } catch (error) {
      this.$router.push("/login");
    }
  },
  methods: {
    setupCards() {
      // Puedes personalizar los accesos según el rol
      const role = this.user?.role?.name;
      if (role === "ADMIN") {
        this.cards = [
          {
            title: "Gestión de Cursos",
            subtitle: "Crea, edita y asigna cursos",
            button: "Ver Cursos",
            route: "/courses",
            icon: BookOutline,
          },
          {
            title: "Gestión de Estudiantes",
            subtitle: "Lista y administra estudiantes",
            button: "Ver Estudiantes",
            route: "/students",
            icon: PeopleOutline,
          },
          {
            title: "Gestión de Docentes",
            subtitle: "Lista y administra docentes",
            button: "Ver Docentes",
            route: "/teachers",
            icon: SchoolOutline,
          },
        ];
      } else if (role === "DOCENTE") {
        this.cards = [
          {
            title: "Mis Cursos",
            subtitle: "Gestiona tus cursos y actividades",
            button: "Ver Mis Cursos",
            route: "/courses",
            icon: BookOutline,
          },
          {
            title: "Calificaciones",
            subtitle: "Registra y revisa notas",
            button: "Ver Calificaciones",
            route: "/grades",
            icon: PeopleOutline,
          },
        ];
      } else if (role === "ESTUDIANTE") {
        this.cards = [
          {
            title: "Mis Cursos",
            subtitle: "Consulta tus cursos inscritos",
            button: "Ver Mis Cursos",
            route: "/courses",
            icon: BookOutline,
          },
          {
            title: "Mis Calificaciones",
            subtitle: "Revisa tus notas",
            button: "Ver Calificaciones",
            route: "/grades",
            icon: PeopleOutline,
          },
        ];
      } else {
        this.cards = [];
      }
    },
    goTo(route) {
      this.$router.push(route);
    },
  },
};
</script>

<style scoped>
.text-primary-700 {
  color: #1d4ed8;
}
.text-primary-600 {
  color: #2563eb;
}
</style>
