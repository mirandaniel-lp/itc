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
      class="!bg-white"
      @collapse="collapsed = true"
      @expand="collapsed = false"
    >
      <div class="flex items-center gap-3 px-4 py-4">
        <n-icon size="20"><HomeOutline /></n-icon>
        <span v-if="!collapsed" class="font-semibold tracking-wide">Panel</span>
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
        <div class="flex items-center gap-3 px-4 py-4 border-b">
          <n-icon size="20"><HomeOutline /></n-icon>
          <span class="font-semibold tracking-wide">Panel</span>
        </div>
        <n-menu
          :value="currentMenuKey"
          :options="menuOptions"
          :indent="18"
          :root-indent="18"
          @update:value="onMenuSelect"
        />
      </n-drawer-content>
    </n-drawer>

    <n-layout>
      <n-layout-header
        bordered
        class="!h-14 flex items-center justify-between px-3 lg:px-4 bg-white"
      >
        <div class="flex items-center gap-2">
          <n-button
            quaternary
            circle
            class="lg:!hidden"
            @click="mobileOpen = true"
          >
            <n-icon><MenuIcon /></n-icon>
          </n-button>

          <n-button
            quaternary
            circle
            class="hidden lg:!inline-flex"
            @click="collapsed = !collapsed"
          >
            <n-icon><MenuIcon /></n-icon>
          </n-button>

          <n-breadcrumb class="ml-1">
            <n-breadcrumb-item v-for="bc in breadcrumbs" :key="bc.to">
              <router-link :to="bc.to">{{ bc.label }}</router-link>
            </n-breadcrumb-item>
          </n-breadcrumb>
        </div>

        <n-dropdown
          :options="userOptions"
          @select="onUserSelect"
          trigger="click"
        >
          <div class="flex items-center gap-2 cursor-pointer select-none">
            <n-avatar size="small" round>
              <n-icon><PersonCircleOutline /></n-icon>
            </n-avatar>
            <div class="hidden sm:block text-sm">
              <div class="leading-4 font-medium">
                {{ loadingUser ? "Cargando..." : user?.email || "Usuario" }}
              </div>
              <div class="text-xs text-gray-500 leading-4">
                {{ user?.role?.name || "Rol" }}
              </div>
            </div>
          </div>
        </n-dropdown>
      </n-layout-header>

      <n-layout-content class="p-3 lg:p-4">
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
  NAvatar,
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
} from "@vicons/ionicons5";

export default {
  name: "AppLayout",
  components: {
    NLayout,
    NLayoutSider,
    NLayoutHeader,
    NLayoutContent,
    NMenu,
    NIcon,
    NButton,
    NDropdown,
    NAvatar,
    NBreadcrumb,
    NBreadcrumbItem,
    NDrawer,
    NDrawerContent,
    MenuIcon,
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

    const menuOptions = computed(() => [
      {
        label: "Inicio",
        key: "/home",
        icon: renderIcon(HomeOutline),
      },
      {
        label: "Usuarios",
        key: "/users",
        icon: renderIcon(PersonCircleOutline),
      },
      {
        label: "Estudiantes",
        key: "/students",
        icon: renderIcon(PersonCircleOutline),
        children: [
          {
            label: "Listado",
            key: "/students",
          },
          {
            label: "Registrar Estudiante",
            key: "/students/create",
          },
        ],
      },
    ]);

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
      create: "Nuevo",
      edit: "Editar",
    };

    const breadcrumbs = computed(() => {
      const segments = route.path.split("/").filter(Boolean);
      const crumbs = [];
      let cumulativePath = "";

      segments.forEach((segment) => {
        cumulativePath += `/${segment}`;
        if (!isNaN(segment)) return;

        const label =
          routeNames[segment] ||
          segment.charAt(0).toUpperCase() + segment.slice(1);
        crumbs.push({ label, to: cumulativePath });
      });

      return crumbs;
    });

    const userOptions = computed(() => [
      {
        label: "Mi perfil",
        key: "profile",
        icon: renderIcon(PersonCircleOutline),
      },
      {
        label: "Cerrar sesión",
        key: "logout",
        icon: renderIcon(LogOutOutline),
      },
    ]);

    async function onUserSelect(key) {
      if (key === "profile") {
        router.push("/home");
      }
      if (key === "logout") {
        try {
          await AuthService.logout();
        } catch {
          console.error("Cierre de sesión falló");
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
  return () =>
    h(NIcon, null, {
      default: () => h(icon),
    });
}
</script>

<style scoped></style>
