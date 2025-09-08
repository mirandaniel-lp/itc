<template>
  <div class="min-h-screen flex items-center justify-center p-4 bg-gray-50">
    <n-card
      class="w-[380px] rounded-3xl shadow-lg transform transition-all duration-300 hover:shadow-2xl hover:scale-[1.02] bg-white/80 backdrop-blur-sm"
    >
      <div class="text-center space-y-3">
        <div class="animate-fadeIn">
          <h1 class="text-2xl font-bold text-gray-800 mb-1">
            Instituto Técnico Columbia
          </h1>
          <h2 class="text-lg text-gray-600">
            {{ title }}
          </h2>
        </div>
        <div
          class="w-16 h-1 bg-green-900 mx-auto rounded-full opacity-75"
        ></div>
      </div>

      <div class="mt-6 animate-slideUp">
        <slot></slot>
      </div>
    </n-card>
  </div>
</template>

<script>
export default {
  name: "AuthCard",
  props: {
    title: {
      type: String,
      required: true,
    },
  },
};
</script>

<style>
@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes slideUp {
  from {
    transform: translateY(20px);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.animate-fadeIn {
  animation: fadeIn 0.6s ease-out;
}

.animate-slideUp {
  animation: slideUp 0.5s ease-out;
}
</style>
