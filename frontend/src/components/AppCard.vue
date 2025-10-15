<template>
  <div
    class="group relative bg-[#1e293b]/80 rounded-2xl p-6 border border-[#334155] shadow-[0_4px_15px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_25px_rgba(37,99,235,0.4)] hover:-translate-y-[2px] transition-all duration-500 ease-out backdrop-blur-sm"
  >
    <div class="flex items-center gap-4 mb-3">
      <div
        class="p-3 rounded-xl bg-gradient-to-br from-[#1e3a8a] to-[#2563eb] shadow-[0_0_15px_rgba(37,99,235,0.4)] group-hover:shadow-[0_0_30px_rgba(37,99,235,0.6)] transition-all duration-500 ease-out"
      >
        <component :is="icon" class="w-6 h-6 text-white" />
      </div>
      <div>
        <div class="text-lg font-extrabold text-white">{{ title }}</div>
        <div class="text-gray-400 text-sm">{{ subtitle }}</div>
      </div>
    </div>

    <button
      @click="$emit('click')"
      class="mt-4 w-full py-2.5 rounded-lg font-bold text-white bg-gradient-to-r from-[#1e3a8a] via-[#1d4ed8] to-[#2563eb] shadow-[0_4px_14px_rgba(37,99,235,0.4)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.55)] transition-all duration-300 ease-in-out"
    >
      {{ button }}
    </button>
  </div>
</template>

<script setup>
defineProps({
  title: String,
  subtitle: String,
  button: String,
  icon: Object,
});
defineEmits(["click"]);
</script>
