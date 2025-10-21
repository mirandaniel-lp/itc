<template>
  <div
    class="min-h-screen bg-[#0f172a] text-white flex items-center justify-center p-8"
  >
    <div
      class="max-w-xl w-full bg-[#1e293b]/90 border border-[#334155] rounded-2xl p-10 text-center"
    >
      <div class="text-4xl font-extrabold mb-4">Acceso restringido</div>
      <div class="text-gray-300 mb-8">
        No tienes permisos para acceder a esta sección.
      </div>
      <router-link
        to="/home"
        class="inline-block px-5 py-2 rounded-lg bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] font-bold"
        >Ir al inicio</router-link
      >
    </div>
  </div>
</template>
