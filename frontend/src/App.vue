<template>
  <n-config-provider>
    <n-message-provider>
      <div class="min-h-screen bg-gray-100">
        <router-view />
      </div>
    </n-message-provider>
  </n-config-provider>
</template>

<script>
import { defineComponent } from "vue";

export default defineComponent({
  name: "App",
});
</script>

<style></style>
