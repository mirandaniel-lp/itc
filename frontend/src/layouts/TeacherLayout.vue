<template>
  <n-layout-header
    bordered
    class="!h-14 flex items-center justify-between px-4 bg-white shadow-sm"
  >
    <div class="flex items-center gap-2">
      <n-icon size="22"><SchoolOutline /></n-icon>
      <span class="font-semibold text-base tracking-wide">Instituto Técnico Columbia</span>
    </div>

    <div class="flex items-center gap-2">
      <n-icon size="20"><PersonCircleOutline /></n-icon>
      <span class="font-medium text-base">{{ teacherName }}</span>

      <n-dropdown :options="userOptions" @select="onUserSelect" trigger="click">
        <n-button quaternary circle>
          <n-icon><ChevronDown /></n-icon>
        </n-button>
      </n-dropdown>
    </div>
  </n-layout-header>
</template>

<script>
import { NLayoutHeader, NIcon, NButton, NDropdown } from "naive-ui";
import {
  SchoolOutline,
  PersonCircleOutline,
  ChevronDown,
  LogOutOutline,
} from "@vicons/ionicons5";
import { useRouter } from "vue-router";
import { h } from "vue";
import TeacherService from "@/services/teacherService";

export default {
  name: "TeacherLayout",
  components: {
    NLayoutHeader,
    NIcon,
    NButton,
    NDropdown,
    SchoolOutline,
    PersonCircleOutline,
    ChevronDown,
  },
  setup() {
    const router = useRouter();
    const teacher = JSON.parse(localStorage.getItem("teacher") || "{}");
    const teacherName = `${teacher.name || ""} ${
      teacher.last_name || ""
    }`.trim();

    const userOptions = [
      {
        label: "Cerrar sesión",
        key: "logout",
        icon: renderIcon(LogOutOutline),
      },
    ];

    async function onUserSelect(key) {
      if (key === "logout") {
        await TeacherService.logout();
        router.push("/teacher/login");
      }
    }

    return { teacherName, userOptions, onUserSelect };
  },
};

function renderIcon(icon) {
  return () => h("span", [h(icon)]);
}
</script>
