<template>
  <n-layout has-sider>
    <n-layout-sider
      v-if="!isMobile"
      bordered
      collapse-mode="width"
      :collapsed="collapsed"
      :collapsed-width="64"
      :width="240"
      show-trigger
      class="!bg-[#0f172a] text-white"
      @collapse="collapsed = true"
      @expand="collapsed = false"
    >
      <div class="flex items-center justify-center px-4 py-5">
        <img
          src="@/assets/logo.png"
          alt="Logo Instituto Técnico Columbia"
          class="w-14 h-14 object-contain brightness-0 invert drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]"
        />
      </div>
      <n-menu
        :value="currentMenuKey"
        :options="menuOptions"
        :collapsed="collapsed"
        :collapsed-width="64"
        :indent="18"
        :root-indent="18"
        @update:value="onMenuSelect"
      />
    </n-layout-sider>

    <n-drawer v-model:show="mobileOpen" :width="280" placement="left">
      <n-drawer-content class="!p-0">
        <div
          class="flex items-center gap-3 px-4 py-4 border-b border-gray-700 bg-[#0f172a] text-white"
        >
          <n-icon size="22"><HomeOutline /></n-icon>
          <span class="font-extrabold tracking-wide"
            >Instituto Técnico Columbia</span
          >
        </div>
        <n-menu
          :value="currentMenuKey"
          :options="menuOptions"
          :indent="18"
          :root-indent="18"
          @update:value="onMenuSelect"
          class="[&_li.n-menu-item--selected]:bg-gradient-to-r [&_li.n-menu-item--selected]:from-[#1e3a8a] [&_li.n-menu-item--selected]:via-[#1d4ed8] [&_li.n-menu-item--selected]:to-[#2563eb] [&_li.n-menu-item--selected]:text-white [&_li.n-menu-item--selected]:shadow-[0_0_15px_rgba(37,99,235,0.45)] [&_li.n-menu-item--selected]:rounded-lg [&_li.n-menu-item--selected_span]:text-white [&_li.n-menu-item--selected_svg]:text-white transition-all duration-300"
        />
      </n-drawer-content>
    </n-drawer>

    <n-layout>
      <n-layout-header
        bordered
        class="!h-14 flex items-center justify-between px-3 lg:px-4 bg-[#1e293b] text-white border-b border-[#334155]"
      >
        <div class="flex items-center gap-2">
          <n-button
            quaternary
            circle
            class="lg:!hidden text-white font-extrabold"
            @click="mobileOpen = true"
          >
            <n-icon><MenuIcon /></n-icon>
          </n-button>
          <n-button
            quaternary
            circle
            class="hidden lg:!inline-flex text-white font-extrabold"
            @click="collapsed = !collapsed"
          >
            <n-icon><MenuIcon /></n-icon>
          </n-button>
          <n-breadcrumb class="ml-1 flex items-center gap-2">
            <n-breadcrumb-item
              v-for="(bc, index) in breadcrumbs"
              :key="bc.to"
              class="text-sm"
            >
              <router-link
                :to="bc.to"
                :class="[
                  'px-2 py-1 rounded-md transition-all duration-300 font-extrabold',
                  index === breadcrumbs.length - 1
                    ? 'text-[#60a5fa]'
                    : 'text-gray-400 hover:text-white',
                ]"
              >
                {{ bc.label }}
              </router-link>
            </n-breadcrumb-item>
          </n-breadcrumb>
        </div>

        <div class="flex items-center gap-2">
          <NotificationBell />
          <n-dropdown
            :options="userOptions"
            @select="onUserSelect"
            trigger="click"
          >
            <div
              class="cursor-pointer px-2 py-1 flex items-center gap-2 hover:bg-[#334155] rounded transition"
            >
              <n-icon size="20"><PersonCircleOutline /></n-icon>
              <span
                class="text-sm font-extrabold hidden sm:inline text-gray-300"
              >
                {{ loadingUser ? "Cargando..." : user?.email || "Usuario" }}
              </span>
              <n-icon size="16" class="text-gray-400"><ChevronDown /></n-icon>
            </div>
          </n-dropdown>
        </div>
      </n-layout-header>

      <n-layout-content
        class="p-3 lg:p-4 bg-[#0f172a] text-white font-bold min-h-screen"
      >
        <slot />
      </n-layout-content>
    </n-layout>
  </n-layout>
</template>

<script>
import {
  NLayout,
  NLayoutSider,
  NLayoutHeader,
  NLayoutContent,
  NMenu,
  NIcon,
  NButton,
  NDropdown,
  NBreadcrumb,
  NBreadcrumbItem,
  NDrawer,
  NDrawerContent,
} from "naive-ui";
import { useRouter, useRoute } from "vue-router";
import { ref, computed, onMounted, watch, h } from "vue";
import AuthService from "@/services/authService";
import NotificationBell from "@/components/NotificationBell.vue";
import {
  Menu as MenuIcon,
  HomeOutline,
  PersonCircleOutline,
  LogOutOutline,
  ChevronDown,
  PeopleOutline,
  SchoolOutline,
  BookOutline,
  CashOutline,
  PieChartOutline,
  CalendarOutline,
  LayersOutline,
  AnalyticsOutline,
} from "@vicons/ionicons5";
import { decodeJwt } from "@/utils/jwt";
import notif from "@/stores/notifications";
import { connectWithUser } from "@/sockets/socket";

function renderIcon(icon) {
  return () => h("span", [h(NIcon, null, { default: () => h(icon) })]);
}

export default {
  name: "AppLayout",
  components: {
    NLayout,
    NLayoutSider,
    NLayoutHeader,
    NLayoutContent,
    NMenu,
    NButton,
    NDropdown,
    NBreadcrumb,
    NBreadcrumbItem,
    NDrawer,
    NDrawerContent,
    MenuIcon,
    PersonCircleOutline,
    ChevronDown,
    NotificationBell,
  },
  setup() {
    const router = useRouter();
    const route = useRoute();

    const user = ref(null);
    const loadingUser = ref(true);
    const collapsed = ref(localStorage.getItem("sidebar_collapsed") === "1");
    const isMobile = ref(false);
    const mobileOpen = ref(false);

    const checkMobile = () => {
      isMobile.value = window.innerWidth < 1024;
    };

    onMounted(async () => {
      checkMobile();
      window.addEventListener("resize", checkMobile);
      try {
        const { user: u } = await AuthService.getUser();
        user.value = u;
        const t = localStorage.getItem("token");
        if (t) {
          const p = decodeJwt(t);
          if (p?.userId) {
            connectWithUser(p.userId);
            notif.bindSocket();
            await notif.loadUnread();
          }
        }
      } catch {
        router.push("/login");
      } finally {
        loadingUser.value = false;
      }
    });

    watch(collapsed, (v) => {
      localStorage.setItem("sidebar_collapsed", v ? "1" : "0");
    });

    const itemHome = {
      label: "Inicio",
      key: "/home",
      icon: renderIcon(HomeOutline),
    };
    const itemUsers = {
      label: "Usuarios",
      key: "/users",
      icon: renderIcon(PeopleOutline),
    };
    const itemStudents = {
      label: "Estudiantes",
      key: "/students",
      icon: renderIcon(SchoolOutline),
      children: [
        { label: "Lista de Estudiantes", key: "/students" },
        { label: "Registrar Estudiante", key: "/students/create" },
      ],
    };
    const itemTeachers = {
      label: "Docentes",
      key: "/teachers",
      icon: renderIcon(PeopleOutline),
      children: [
        { label: "Lista de Docentes", key: "/teachers" },
        { label: "Registrar Docente", key: "/teachers/create" },
      ],
    };
    const itemCourses = {
      label: "Cursos",
      key: "/courses",
      icon: renderIcon(BookOutline),
      children: [
        { label: "Lista de Cursos", key: "/courses" },
        { label: "Registrar Cursos", key: "/courses/create" },
      ],
    };
    const itemEnrollments = {
      label: "Inscripciones",
      key: "/enrollments",
      icon: renderIcon(CashOutline),
      children: [
        { label: "Lista de Inscripciones", key: "/enrollments" },
        { label: "Nueva Inscripción", key: "/enrollments/create" },
      ],
    };
    const itemCatalogs = {
      label: "Catálogos",
      key: "catalogs",
      icon: renderIcon(LayersOutline),
      children: [
        { label: "Programas", key: "/programs" },
        { label: "Periodos Académicos", key: "/terms" },
        { label: "Aulas", key: "/classrooms" },
        { label: "Políticas de Calificaciones", key: "/grade-policies" },
        { label: "Feriados Académicos", key: "/holidays" },
      ],
    };
    const itemActivities = {
      label: "Actividades",
      key: "/activities",
      icon: renderIcon(BookOutline),
    };
    const itemGrades = {
      label: "Calificaciones",
      key: "/grades",
      icon: renderIcon(SchoolOutline),
    };
    const itemAttendances = {
      label: "Asistencias",
      key: "/attendances",
      icon: renderIcon(SchoolOutline),
    };
    const itemSchedules = {
      label: "Horarios",
      key: "/schedules/designer",
      icon: renderIcon(CalendarOutline),
    };
    const itemReports = {
      label: "Reportes",
      key: "/reports",
      icon: renderIcon(PieChartOutline),
    };
    const itemRisks = {
      label: "Riesgos",
      key: "/risks",
      icon: renderIcon(AnalyticsOutline),
    };
    const itemAudit = {
      label: "Auditoría",
      key: "/audit",
      icon: renderIcon(AnalyticsOutline),
    };

    const menuOptions = computed(() => {
      const raw = (user.value?.role?.name || "").toUpperCase();
      const role = raw.startsWith("ADMIN")
        ? "ADMINISTRADOR"
        : raw.includes("GERENTE")
        ? "GERENTE"
        : raw.includes("SECRETARIA")
        ? "SECRETARÍA"
        : raw.includes("USUARIO")
        ? "USUARIO"
        : raw;
      if (role === "ADMINISTRADOR")
        return [
          itemHome,
          itemUsers,
          itemStudents,
          itemTeachers,
          itemCourses,
          itemEnrollments,
          itemCatalogs,
          itemActivities,
          itemGrades,
          itemAttendances,
          itemSchedules,
          itemRisks,
          itemReports,
          itemAudit,
        ];
      if (role === "GERENTE")
        return [
          itemHome,
          itemStudents,
          itemCourses,
          itemEnrollments,
          itemCatalogs,
          itemActivities,
          itemGrades,
          itemAttendances,
          itemSchedules,
          itemRisks,
          itemReports,
          itemAudit,
        ];
      if (role === "SECRETARÍA")
        return [
          itemHome,
          itemStudents,
          itemEnrollments,
          itemAttendances,
          itemGrades,
        ];
      if (role === "USUARIO") return [itemHome];
      return [itemHome];
    });

    const currentMenuKey = computed(() => route.path);

    function onMenuSelect(key) {
      if (typeof key === "string") {
        router.push(key);
        if (isMobile.value) mobileOpen.value = false;
      }
    }

    const routeNames = {
      home: "Inicio",
      users: "Usuarios",
      students: "Estudiantes",
      teachers: "Docentes",
      courses: "Cursos",
      enrollments: "Inscripciones",
      activities: "Actividades",
      reports: "Reportes",
      risks: "Riesgos de Deserción",
      grades: "Calificaciones",
      attendances: "Asistencias",
      schedules: "Horarios",
      designer: "Diseño",
      create: "Registrar",
      edit: "Editar",
      programs: "Programas",
      terms: "Periodos Académicos",
      classrooms: "Aulas",
      "grade-policies": "Políticas de Calificaciones",
      holidays: "Feriados Académicos",
      profile: "Perfil",
    };

    const breadcrumbs = computed(() => {
      const segments = route.path.split("/").filter(Boolean);
      const crumbs = [];
      let cumulativePath = "";
      segments.forEach((segment) => {
        cumulativePath += `/${segment}`;
        if (!isNaN(segment)) return;
        const label =
          routeNames[segment.toLowerCase()] ||
          segment.charAt(0).toUpperCase() + segment.slice(1);
        crumbs.push({ label, to: cumulativePath });
      });
      return crumbs;
    });

    const userOptions = computed(() => [
      {
        key: "profile",
        icon: renderIcon(PersonCircleOutline),
        label: () =>
          h("span", { class: "font-extrabold text-gray-100" }, "Mi perfil"),
      },
      {
        key: "logout",
        icon: renderIcon(LogOutOutline),
        label: () =>
          h("span", { class: "font-extrabold text-rose-400" }, "Cerrar sesión"),
      },
    ]);

    async function onUserSelect(key) {
      if (key === "profile") router.push("/profile");
      if (key === "logout") {
        try {
          await AuthService.logout();
        } catch {}
        localStorage.removeItem("token");
        router.push("/login");
      }
    }

    return {
      user,
      loadingUser,
      collapsed,
      isMobile,
      mobileOpen,
      menuOptions,
      currentMenuKey,
      onMenuSelect,
      breadcrumbs,
      userOptions,
      onUserSelect,
    };
  },
};
</script>
