<template>
  <div class="w-full">
    <div class="relative">
      <input
        :type="type"
        :id="id"
        v-model="model"
        :placeholder="placeholder"
        class="peer w-full h-12 rounded-lg px-4 font-extrabold text-gray-100 bg-[#1e293b]/95 border border-[#334155] focus:outline-none focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all duration-300 placeholder-transparent"
      />
      <label
        :for="id"
        class="absolute left-4 top-3.5 font-extrabold text-gray-400 text-base transition-all duration-300 peer-focus:-top-2 peer-focus:text-[#60a5fa] peer-focus:text-sm peer-[&:not(:placeholder-shown)]:-top-2 peer-[&:not(:placeholder-shown)]:text-[#60a5fa] peer-[&:not(:placeholder-shown)]:text-sm bg-[#1e293b]/95 px-1 pointer-events-none"
      >
        {{ label }}
      </label>

      <div
        v-if="error"
        class="mt-1 text-sm text-rose-500 flex items-center gap-1"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          class="h-4 w-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          stroke-width="2"
        >
          <path
            stroke-linecap="round"
            stroke-linejoin="round"
            d="M12 9v2m0 4h.01M4.93 4.93l14.14 14.14M12 2a10 10 0 100 20 10 10 0 000-20z"
          />
        </svg>
        <span>{{ error }}</span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  modelValue: [String, Number],
  label: String,
  type: { type: String, default: "text" },
  id: {
    type: String,
    default: () => `input-${Math.random().toString(36).slice(2)}`,
  },
  placeholder: String,
  error: String,
});

const emit = defineEmits(["update:modelValue"]);

const model = computed({
  get: () => props.modelValue,
  set: (val) => emit("update:modelValue", val),
});
</script>
