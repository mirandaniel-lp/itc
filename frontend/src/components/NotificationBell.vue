<template>
  <div class="relative">
    <n-badge :value="state.unread" :max="99" type="error">
      <n-button quaternary circle @click="toggle">
        <n-icon size="20"><NotificationsOutline /></n-icon>
      </n-button>
    </n-badge>

    <n-drawer v-model:show="open" :width="drawerWidth" placement="right">
      <n-drawer-content
        :native-scrollbar="false"
        :body-content-style="{
          display: 'flex',
          flexDirection: 'column',
          height: '100%',
        }"
      >
        <div class="flex items-center justify-between pb-3 shrink-0">
          <div class="text-base font-extrabold">Notificaciones</div>
          <div class="flex items-center gap-2">
            <n-button size="small" tertiary @click="refresh">
              <template #icon
                ><n-icon><RefreshOutline /></n-icon
              ></template>
              Actualizar
            </n-button>
            <n-button
              size="small"
              tertiary
              @click="readAll"
              :disabled="state.unread === 0"
            >
              <template #icon
                ><n-icon><CheckmarkDoneOutline /></n-icon
              ></template>
              Marcar todo
            </n-button>
          </div>
        </div>

        <n-scrollbar class="flex-1 min-h-0">
          <div v-if="!state.ready" class="py-6 text-sm text-gray-400">
            Cargando…
          </div>
          <div
            v-else-if="state.items.length === 0"
            class="py-6 text-sm text-gray-400"
          >
            Sin notificaciones
          </div>

          <div v-else class="space-y-3">
            <div
              v-for="it in state.items"
              :key="it.id"
              class="rounded-xl border border-[#334155] bg-[#0b1220] hover:bg-[#0d1426] transition"
            >
              <div class="p-3 flex gap-3">
                <div class="pt-0.5">
                  <n-tag size="small" :type="tagType(it.notification.level)">{{
                    it.notification.level || "INFO"
                  }}</n-tag>
                </div>
                <div class="flex-1 min-w-0">
                  <div class="text-sm font-extrabold text-white truncate">
                    {{ it.notification.title }}
                  </div>
                  <div class="text-sm text-gray-300 leading-snug">
                    {{ it.notification.message }}
                  </div>
                  <div
                    class="mt-1 flex items-center gap-2 text-xs text-gray-400"
                  >
                    <n-icon size="14"><TimeOutline /></n-icon>
                    <span>{{ formatDate(it.notification.created_at) }}</span>
                    <n-tag
                      v-if="it.notification?.data?.meta?.version"
                      size="tiny"
                      type="default"
                      round
                    >
                      v{{ it.notification.data.meta.version }}
                    </n-tag>
                  </div>

                  <div v-if="hasSections(it)" class="mt-3">
                    <n-collapse accordion>
                      <n-collapse-item
                        v-for="sec in it.notification.data.sections"
                        :key="sec.courseId"
                        :name="sec.courseId"
                        :title="sectionTitle(sec)"
                      >
                        <div class="space-y-2">
                          <div
                            v-for="st in sec.items"
                            :key="st.student_id"
                            class="flex items-start justify-between rounded-lg border border-[#1f2a44] bg-[#0a1120] px-3 py-2"
                          >
                            <div class="flex items-start gap-3 min-w-0">
                              <n-avatar round size="small">{{
                                initials(st.studentName)
                              }}</n-avatar>
                              <div class="min-w-0">
                                <div
                                  class="text-sm font-extrabold text-white truncate"
                                >
                                  {{ st.studentName || "Estudiante" }}
                                </div>
                                <div class="text-xs text-gray-400">
                                  {{ st.ci ? "CI " + st.ci : "" }}
                                  <span v-if="st.ci">·</span> Riesgo
                                  {{ fmtPct(st.risk_score01) }}
                                </div>
                                <div class="mt-1 flex gap-1 flex-wrap">
                                  <n-tag
                                    v-for="r in st.reasons || []"
                                    :key="r"
                                    size="tiny"
                                    :type="reasonType(r)"
                                    round
                                  >
                                    {{ r }}
                                  </n-tag>
                                </div>
                              </div>
                            </div>
                            <div class="pl-2 flex items-center gap-2">
                              <n-progress
                                type="circle"
                                :percentage="pct(st.risk_score01)"
                                :status="riskStatus(st.risk_score01)"
                                :stroke-width="8"
                                :height="36"
                              />
                              <n-button
                                v-if="!it.readAt"
                                size="tiny"
                                tertiary
                                type="primary"
                                @click="readOne(it.id)"
                                >Leer</n-button
                              >
                            </div>
                          </div>
                        </div>
                      </n-collapse-item>
                    </n-collapse>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </n-scrollbar>
      </n-drawer-content>
    </n-drawer>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from "vue";
import {
  NBadge,
  NButton,
  NIcon,
  NDrawer,
  NDrawerContent,
  NScrollbar,
  NTag,
  NCollapse,
  NCollapseItem,
  NAvatar,
  NProgress,
} from "naive-ui";
import {
  NotificationsOutline,
  CheckmarkDoneOutline,
  TimeOutline,
  RefreshOutline,
} from "@vicons/ionicons5";
import notif from "../stores/notifications";

const state = notif.state;
const open = ref(false);
const drawerWidth = ref(420);

function resize() {
  const w = typeof window !== "undefined" ? window.innerWidth : 420;
  drawerWidth.value = Math.min(480, Math.max(320, w - 24));
}
function toggle() {
  open.value = !open.value;
}
function readAll() {
  notif.markAll();
}
function readOne(id) {
  notif.markRead(id);
}
function refresh() {
  notif.load({ limit: 15 });
}
function formatDate(s) {
  return new Date(s).toLocaleString();
}
function tagType(level) {
  const x = String(level || "").toUpperCase();
  if (x === "ALTA") return "error";
  if (x === "MEDIA") return "warning";
  return "info";
}
function hasSections(it) {
  return !!it?.notification?.data?.sections?.length;
}
function sectionTitle(sec) {
  return `${sec.courseName || "Curso"} · ${sec.items?.length || 0} est.`;
}
function initials(name) {
  const parts = String(name || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2);
  return parts.map((p) => p[0]?.toUpperCase() || "").join("");
}
function pct(v) {
  const n = Number(v || 0);
  return Math.max(0, Math.min(100, Math.round(n * 100)));
}
function fmtPct(v) {
  return `${pct(v)}%`;
}
function riskStatus(v) {
  const n = Number(v || 0);
  if (n >= 0.8) return "error";
  if (n >= 0.66) return "warning";
  return "success";
}
function reasonType(r) {
  const s = String(r || "").toLowerCase();
  if (s.includes("asistencia") || s.includes("ausencia")) return "warning";
  if (s.includes("promedio") || s.includes("reprobación")) return "error";
  return "default";
}

onMounted(async () => {
  resize();
  window.addEventListener("resize", resize);
  if (!state.ready) await notif.load({ limit: 15 });
});
onBeforeUnmount(() => {
  window.removeEventListener("resize", resize);
});
</script>

<style scoped>
:deep(.n-drawer-body) {
  background: #0f172a;
  color: #e5e7eb;
}
</style>
