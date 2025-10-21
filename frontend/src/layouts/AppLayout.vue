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

        <n-dropdown
          :options="userOptions"
          @select="onUserSelect"
          trigger="click"
        >
          <div
            class="cursor-pointer px-2 py-1 flex items-center gap-2 hover:bg-[#334155] rounded transition"
          >
            <n-icon size="20"><PersonCircleOutline /></n-icon>
            <span class="text-sm font-extrabold hidden sm:inline text-gray-300">
              {{ loadingUser ? "Cargando..." : user?.email || "Usuario" }}
            </span>
            <n-icon size="16" class="text-gray-400"><ChevronDown /></n-icon>
          </div>
        </n-dropdown>
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
} from "@vicons/ionicons5";

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
      } catch {
        router.push("/login");
      } finally {
        loadingUser.value = false;
      }
    });

    watch(collapsed, (v) => {
      localStorage.setItem("sidebar_collapsed", v ? "1" : "0");
    });

    const menuOptions = computed(() => {
      const role = user.value?.role?.name;

      const base = [
        { label: "Inicio", key: "/home", icon: renderIcon(HomeOutline) },
        { label: "Usuarios", key: "/users", icon: renderIcon(PeopleOutline) },
        {
          label: "Estudiantes",
          key: "/students",
          icon: renderIcon(SchoolOutline),
          children: [
            { label: "Lista de Estudiantes", key: "/students" },
            { label: "Registrar Estudiante", key: "/students/create" },
          ],
        },
        {
          label: "Docentes",
          key: "/teachers",
          icon: renderIcon(PeopleOutline),
          children: [
            { label: "Lista de Docentes", key: "/teachers" },
            { label: "Registrar Docente", key: "/teachers/create" },
          ],
        },
        {
          label: "Cursos",
          key: "/courses",
          icon: renderIcon(BookOutline),
          children: [
            { label: "Lista de Cursos", key: "/courses" },
            { label: "Registrar Curso", key: "/courses/create" },
          ],
        },
        {
          label: "Inscripciones",
          key: "/enrollments",
          icon: renderIcon(CashOutline),
          children: [
            { label: "Lista de Inscripciones", key: "/enrollments" },
            { label: "Nueva Inscripción", key: "/enrollments/create" },
          ],
        },
        {
          label: "Actividades",
          key: "/activities",
          icon: renderIcon(BookOutline),
        },
        {
          label: "Calificaciones",
          key: "/grades",
          icon: renderIcon(SchoolOutline),
        },
        {
          label: "Asistencias",
          key: "/attendances",
          icon: renderIcon(SchoolOutline),
        },
        {
          label: "Reportes",
          key: "/reports",
          icon: renderIcon(PieChartOutline),
        },
      ];

      if (role === "ADMINISTRADOR") return base;

      if (role === "GERENTE") {
        return base.filter(
          (item) => !String(item.key).startsWith("/enrollments")
        );
      }

      if (role === "SECRETARÍA") {
        return base.filter(
          (item) =>
            String(item.key).startsWith("/students") ||
            String(item.key).startsWith("/enrollments") ||
            String(item.key) === "/home"
        );
      }

      if (role === "USUARIO") {
        return base.filter((item) => String(item.key) === "/home");
      }

      return base.filter((item) => String(item.key) === "/home");
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
      grades: "Calificaciones",
      attendances: "Asistencias",
      create: "Registrar",
      edit: "Editar",
      "by-activity": "Gestión de Calificaciones",
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
      if (key === "profile") router.push("/home");
      if (key === "logout") {
        try {
          await AuthService.logout();
        } catch (e) {
          console.warn("Error al cerrar sesión:", e);
        }
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

function renderIcon(icon) {
  return () => h("span", [h(NIcon, null, { default: () => h(icon) })]);
}
</script>
