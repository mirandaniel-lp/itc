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
        primaryColorHover: "transparent",
        cardColor: "#1e293b",
      },
      Button: {
        textColor: "#ffffff",
        textColorHover: "#ffffff",
        textColorPressed: "#fde047",
        textColorPrimary: "#ffffff",
        textColorHoverPrimary: "#ffffff",
        textColorPressedPrimary: "#fde047",
      },
    };
    return { darkTheme, themeOverrides };
  },
});
</script>
