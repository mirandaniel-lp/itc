<template>
  <app-layout>
    <div class="min-h-screen py-10 bg-[#0f172a] text-white">
      <div class="max-w-6xl mx-auto px-4">
        <div
          class="mb-10 bg-[#1e293b]/80 rounded-3xl p-8 shadow-[0_6px_25px_rgba(0,0,0,0.4)] border border-[#334155] backdrop-blur-sm"
        >
          <div
            class="flex flex-col md:flex-row md:items-center md:justify-between gap-6"
          >
            <div>
              <div class="text-3xl font-extrabold text-[#3b82f6] mb-1">
                ¡Bienvenido{{ user?.role?.name ? `, ${user.role.name}` : "" }}!
              </div>
              <div class="text-gray-400 text-sm">{{ user?.email }}</div>
            </div>
            <div>
              <span
                v-if="user?.role?.name"
                class="px-4 py-1.5 rounded-full bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] text-sm font-bold shadow-[0_0_12px_rgba(37,99,235,0.5)]"
              >
                {{ user.role.name }}
              </span>
            </div>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          <app-card
            v-for="card in cards"
            :key="card.title"
            :title="card.title"
            :subtitle="card.subtitle"
            :button="card.button"
            :icon="card.icon"
            @click="goTo(card.route)"
          />
        </div>
      </div>
    </div>
  </app-layout>
</template>

<script>
import AppLayout from "@/layouts/AppLayout.vue";
import AppCard from "@/components/AppCard.vue";
import AuthService from "@/services/authService";
import { BookOutline, PeopleOutline, SchoolOutline } from "@vicons/ionicons5";

export default {
  name: "HomeView",
  components: {
    AppLayout,
    AppCard,
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
    } catch {
      this.$router.push("/login");
    }
  },
  methods: {
    setupCards() {
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
