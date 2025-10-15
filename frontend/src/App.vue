<template>
  <n-config-provider :theme="darkTheme" :theme-overrides="themeOverrides">
    <n-message-provider>
      <div class="font-futura">
        <router-view />
      </div>
    </n-message-provider>
  </n-config-provider>
</template>

<script>
import { defineComponent } from "vue";
import { darkTheme } from "naive-ui";

export default defineComponent({
  name: "App",
  setup() {
    const themeOverrides = {
      common: {
        primaryColor: "#1e40af",
        primaryColorHover: "#2563eb",
        primaryColorPressed: "#1e3a8a",
        primaryColorSuppl: "#3b82f6",
        bodyColor: "#0f172a",
        cardColor: "#1e293b",
        textColorBase: "#f1f5f9",
        textColor2: "#cbd5e1",
        borderColor: "#334155",
      },
      Button: {
        textColorPrimary: "#ffffff",
      },
      Input: {
        color: "#1e293b",
        colorFocus: "#334155",
        textColor: "#f8fafc",
        placeholderColor: "#94a3b8",
      },
      Card: {
        color: "#1e293b",
      },
      Menu: {
        itemColorActive:
          "linear-gradient(90deg, #1e3a8a 0%, #1d4ed8 50%, #2563eb 100%)",
        itemColorActiveHover:
          "linear-gradient(90deg, #1d4ed8 0%, #2563eb 100%)",
        itemTextColorActive: "#ffffff",
        itemTextColor: "#94a3b8",
        itemTextColorHover: "#e2e8f0",
        itemIconColorActive: "#ffffff",
        itemIconColor: "#94a3b8",
        itemIconColorHover: "#e2e8f0",
        borderColor: "#1e293b",
      },
      LayoutSider: {
        color: "#0f172a",
        textColor: "#e2e8f0",
        borderColor: "#1e293b",
      },
    };

    return { darkTheme, themeOverrides };
  },
});
</script>
