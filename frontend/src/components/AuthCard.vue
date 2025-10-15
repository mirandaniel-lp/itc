<template>
  <div
    class="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0f172a] to-[#1e293b] p-6 text-gray-100 transition-all duration-300"
  >
    <n-card
      class="w-[400px] rounded-2xl border border-gray-700 shadow-[0_10px_30px_rgba(0,0,0,0.4)] backdrop-blur-sm"
      :content-style="{ padding: '36px 40px' }"
    >
      <div class="text-center mb-6">
        <div
          class="mx-auto w-20 h-20 rounded-2xl bg-gradient-to-b from-[#1e3a8a] to-[#1d4ed8] flex items-center justify-center shadow-[0_0_25px_rgba(37,99,235,0.6)] hover:shadow-[0_0_45px_rgba(37,99,235,0.9)] hover:scale-105 transition-all duration-500 ease-out"
        >
          <img
            src="@/assets/logo.png"
            alt="Logo Instituto Técnico Columbia"
            class="w-12 h-12 object-contain brightness-0 invert drop-shadow-[0_0_8px_rgba(255,255,255,0.6)]"
          />
        </div>

        <h1 class="text-2xl font-extrabold text-[#ffffff] mt-5 tracking-tight">
          {{ title }}
        </h1>

        <p class="text-gray-400 text-sm mt-1">{{ subtitle }}</p>

        <div
          class="mx-auto mt-3 w-24 h-[3px] bg-gradient-to-r from-[#2563eb] to-[#1e3a8a] rounded-full opacity-80"
        ></div>
      </div>

      <slot></slot>
    </n-card>
  </div>
</template>

<script setup>
defineProps({
  title: { type: String, required: true },
  subtitle: { type: String, default: "" },
});
</script>
