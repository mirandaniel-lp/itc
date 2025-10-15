<template>
  <button
    :disabled="loading || disabled"
    @click="!loading && $emit('click')"
    class="relative w-full h-11 rounded-lg font-extrabold text-white tracking-wide bg-gradient-to-r from-[#1e3a8a] via-[#1d4ed8] to-[#2563eb] shadow-[0_4px_14px_rgba(37,99,235,0.4)] hover:shadow-[0_6px_20px_rgba(37,99,235,0.55)] hover:-translate-y-[1px] active:translate-y-[0px] transition-all duration-300 ease-in-out disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center"
  >
    <span v-if="!loading" class="flex items-center justify-center gap-2">
      <slot />
    </span>

    <span v-else class="flex items-center justify-center gap-2">
      <svg
        class="animate-spin h-5 w-5 text-white"
        xmlns="http://www.w3.org/2000/svg"
        fill="none"
        viewBox="0 0 24 24"
      >
        <circle
          class="opacity-25"
          cx="12"
          cy="12"
          r="10"
          stroke="currentColor"
          stroke-width="4"
        />
        <path
          class="opacity-75"
          fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
      <span class="text-sm font-extrabold">Cargando...</span>
    </span>
  </button>
</template>

<script setup>
defineProps({
  loading: { type: Boolean, default: false },
  disabled: { type: Boolean, default: false },
});
defineEmits(["click"]);
</script>
