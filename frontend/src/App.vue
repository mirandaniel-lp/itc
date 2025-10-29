<template>
  <n-config-provider
    :theme="darkTheme"
    :theme-overrides="themeOverrides"
    :locale="esAR"
    :date-locale="dateEsAR"
  >
    <n-notification-provider>
      <n-dialog-provider>
        <n-message-provider>
          <div class="font-futura">
            <router-view />
          </div>
        </n-message-provider>
      </n-dialog-provider>
    </n-notification-provider>
  </n-config-provider>
</template>

<script>
import { defineComponent } from "vue";
import { darkTheme, esAR, dateEsAR } from "naive-ui";

export default defineComponent({
  name: "App",
  setup() {
    const themeOverrides = {
      common: {
        primaryColor: "#2563eb",
        primaryColorHover: "#1d4ed8",
        primaryColorPressed: "#1e40af",
        primaryColorSuppl: "#3b82f6",
        cardColor: "#0f172a",
        modalColor: "#0b1220",
        bodyColor: "#0b1220",
      },
      Card: {
        color: "#0f172a",
        titleTextColor: "#e5e7eb",
        textColor: "#cbd5e1",
      },
      Button: {
        colorPrimary: "#2563eb",
        colorHoverPrimary: "#1d4ed8",
        colorPressedPrimary: "#1e40af",
        colorFocusPrimary: "#1d4ed8",
        textColorPrimary: "#ffffff",
      },
      Dialog: {
        color: "#0f172a",
        titleTextColor: "#e5e7eb",
        contentTextColor: "#cbd5e1",
      },
      Message: {
        color: "#0f172a",
      },
    };
    return { darkTheme, themeOverrides, esAR, dateEsAR };
  },
});
</script>
