<template>
  <app-layout>
    <div class="min-h-screen py-8 bg-[#071026] text-white">
      <div class="max-w-7xl mx-auto px-6">
        <n-card
          class="mb-6 rounded-3xl bg-gradient-to-r from-[#0f172a] to-[#071026]/60 border border-[#1f2a44]"
          bordered
        >
          <div
            class="flex flex-col md:flex-row md:items-center md:justify-between gap-4"
          >
            <div>
              <div class="text-3xl font-extrabold">Auditoría del sistema</div>
              <div class="text-sm text-gray-400 mt-1">
                Acciones, eventos y sesiones de usuarios
              </div>
            </div>
            <div class="flex items-center gap-3">
              <n-space>
                <n-dropdown :options="exportMenu" trigger="click">
                  <n-button size="small">Exportar</n-button>
                </n-dropdown>
              </n-space>
            </div>
          </div>
        </n-card>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <n-card class="rounded-2xl p-4" bordered>
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm text-gray-400">Eventos</div>
                <div class="text-2xl font-bold">{{ totalEvents }}</div>
              </div>
              <div class="text-right">
                <div class="text-xs text-gray-400">Nuevos hoy</div>
                <n-badge :value="newEventsToday" show-zero />
              </div>
            </div>
          </n-card>

          <n-card class="rounded-2xl p-4" bordered>
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm text-gray-400">Sesiones activas</div>
                <div class="text-2xl font-bold">{{ activeSessions }}</div>
              </div>
              <div class="text-right">
                <div class="text-xs text-gray-400">Totales</div>
                <n-badge :value="totalSessions" show-zero />
              </div>
            </div>
          </n-card>

          <n-card class="rounded-2xl p-4" bordered>
            <div class="flex items-center justify-between">
              <div>
                <div class="text-sm text-gray-400">Última actualización</div>
                <div class="text-sm">{{ lastUpdated }}</div>
              </div>
            </div>
          </n-card>
        </div>

        <n-tabs v-model:value="activeTab" type="line" size="large">
          <n-tab-pane name="auditoria" tab="Auditoría">
            <n-card
              class="rounded-2xl p-4 bg-[#071026]/70 border border-[#1f2a44]"
              bordered
            >
              <div
                class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4"
              >
                <div class="flex items-center gap-3 w-full md:w-2/3">
                  <n-input
                    v-model:value="q"
                    placeholder="Buscar ruta, acción o método"
                    clearable
                  />
                  <n-select
                    v-model:value="quickRange"
                    :options="quickRangeOptions"
                    placeholder="Rango rápido"
                  />
                </div>
                <div class="flex items-center gap-3">
                  <n-date-picker
                    v-model:value="range"
                    type="daterange"
                    placeholder="Fecha inicio - fin"
                  />
                </div>
              </div>

              <div class="relative">
                <div
                  v-if="loadingEvents"
                  class="absolute inset-0 z-10 flex items-center justify-center bg-transparent"
                >
                  <n-spin size="large" />
                </div>

                <n-data-table
                  :key="`events-table-${loadingEvents}-${page}-${pageSize}`"
                  :columns="columnsEvents"
                  :data="events"
                  :loading="loadingEvents"
                  :pagination="{
                    page: page,
                    pageSize: pageSize,
                    itemCount: totalEvents,
                  }"
                  @page-change="onEventsPageChange"
                  :row-expandable="() => true"
                  class="text-sm"
                >
                  <template #body-cell-id="{ row }">
                    <div class="font-medium">{{ row.id }}</div>
                  </template>

                  <template #body-cell-userEmail="{ row }">
                    <div class="flex items-center gap-2">
                      <div class="truncate" style="max-width: 220px">
                        {{ row.user?.email ?? "-" }}
                      </div>
                    </div>
                  </template>

                  <template #body-cell-method="{ row }">
                    <n-badge :type="methodBadgeType(row.method)">{{
                      row.method
                    }}</n-badge>
                  </template>

                  <template #body-cell-route="{ row }">
                    <div class="truncate" style="max-width: 320px">
                      {{ row.route }}
                    </div>
                  </template>

                  <template #body-cell-action="{ row }">
                    <div class="hidden md:block truncate">
                      {{ row.action ?? "-" }}
                    </div>
                    <div class="block md:hidden text-xs truncate">
                      {{ row.action ?? "-" }}
                    </div>
                  </template>

                  <template #body-cell-ip="{ row }">
                    <div class="hidden sm:block">{{ row.ip ?? "-" }}</div>
                    <div class="block sm:hidden text-xs">
                      {{ row.ip ?? "-" }}
                    </div>
                  </template>

                  <template #body-cell-createdAt="{ row }">
                    <div>{{ row.createdAtFormatted }}</div>
                  </template>

                  <template #body-cell-actions="{ row }">
                    <n-space>
                      <n-button size="tiny" @click="openEvent(row.id)"
                        >Ver</n-button
                      >
                      <n-dropdown
                        trigger="click"
                        :options="[
                          { label: 'Copiar ruta', key: 'copy-route' },
                          { label: 'Ver payload', key: 'view-payload' },
                        ]"
                        @select="handleEventMenu($event, row)"
                      >
                        <n-button size="tiny">Más</n-button>
                      </n-dropdown>
                    </n-space>
                  </template>

                  <template #expand="{ row }">
                    <div class="p-4 bg-[#071026]/60 rounded-lg">
                      <div class="mb-2 text-sm">
                        <span class="font-medium">Ruta:</span>
                        <span class="break-words">{{ row.route }}</span>
                      </div>
                      <div class="mb-2 text-sm">
                        <span class="font-medium">Usuario:</span>
                        {{ row.user?.email ?? "-" }}
                      </div>
                      <div class="mb-2 text-sm">
                        <span class="font-medium">IP:</span> {{ row.ip ?? "-" }}
                      </div>
                      <div class="mb-2 text-sm">
                        <span class="font-medium">User-Agent:</span>
                        <div class="truncate">{{ row.userAgent }}</div>
                      </div>
                      <div
                        v-if="row.payload"
                        class="mb-2 text-xs bg-[#0b1220] p-2 rounded overflow-auto"
                      >
                        <pre class="whitespace-pre-wrap text-xs">{{
                          pretty(row.payload)
                        }}</pre>
                      </div>
                      <div class="text-xs text-gray-400">
                        <span class="font-medium">Creado:</span>
                        {{ row.createdAtFormatted }}
                      </div>
                    </div>
                  </template>
                </n-data-table>
              </div>
            </n-card>
          </n-tab-pane>

          <n-tab-pane name="eventos" tab="Eventos">
            <n-card
              class="rounded-2xl p-4 bg-[#071026]/70 border border-[#1f2a44]"
              bordered
            >
              <div
                class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-4"
              >
                <div class="flex items-center gap-3 w-full md:w-2/3">
                  <n-input
                    v-model:value="sessionQ"
                    placeholder="Buscar por usuario o IP"
                    clearable
                  />
                  <n-select
                    v-model:value="statusFilter"
                    :options="sessionStatusOptions"
                    placeholder="Estado"
                  />
                </div>
              </div>

              <div class="relative">
                <div
                  v-if="loadingSessions"
                  class="absolute inset-0 z-10 flex items-center justify-center bg-transparent"
                >
                  <n-spin size="large" />
                </div>

                <n-data-table
                  :key="`sessions-table-${loadingSessions}-${sessionPage}-${pageSize}`"
                  :columns="columnsSessions"
                  :data="sessions"
                  :loading="loadingSessions"
                  :pagination="{
                    page: sessionPage,
                    pageSize: pageSize,
                    itemCount: totalSessions,
                  }"
                  @page-change="onSessionsPageChange"
                  :row-expandable="() => true"
                  class="text-sm"
                >
                  <template #body-cell-id="{ row }">
                    <div class="font-medium">{{ row.id }}</div>
                  </template>

                  <template #body-cell-userEmail="{ row }">
                    <div class="truncate" style="max-width: 220px">
                      {{ row.user?.email ?? "-" }}
                    </div>
                  </template>

                  <template #body-cell-ip="{ row }">
                    <div class="hidden sm:block">{{ row.ip ?? "-" }}</div>
                    <div class="block sm:hidden text-xs">
                      {{ row.ip ?? "-" }}
                    </div>
                  </template>

                  <template #body-cell-startedAt="{ row }">
                    <div>{{ row.startedAtFormatted }}</div>
                  </template>

                  <template #body-cell-endedAt="{ row }">
                    <div>{{ row.endedAtFormatted ?? "-" }}</div>
                  </template>

                  <template #body-cell-actions="{ row }">
                    <n-space>
                      <n-button size="tiny" @click="openSession(row.id)"
                        >Ver</n-button
                      >
                      <n-dropdown
                        trigger="click"
                        :options="[
                          { label: 'Terminar sesión', key: 'end' },
                          { label: 'Bloquear IP', key: 'block' },
                        ]"
                        @select="handleSessionMenu($event, row)"
                      >
                        <n-button size="tiny">Más</n-button>
                      </n-dropdown>
                    </n-space>
                  </template>

                  <template #expand="{ row }">
                    <div class="p-4 bg-[#071026]/60 rounded-lg">
                      <div class="mb-2 text-sm">
                        <span class="font-medium">Usuario:</span>
                        {{ row.user?.email ?? "-" }}
                      </div>
                      <div class="mb-2 text-sm">
                        <span class="font-medium">IP:</span> {{ row.ip ?? "-" }}
                      </div>
                      <div class="mb-2 text-sm">
                        <span class="font-medium">User-Agent:</span>
                        <div class="truncate">{{ row.userAgent }}</div>
                      </div>
                      <div class="mb-2 text-sm">
                        <span class="font-medium">Inicio:</span>
                        {{ row.startedAtFormatted }}
                      </div>
                      <div class="mb-2 text-sm">
                        <span class="font-medium">Fin:</span>
                        {{ row.endedAtFormatted ?? "-" }}
                      </div>
                    </div>
                  </template>
                </n-data-table>
              </div>
            </n-card>
          </n-tab-pane>
        </n-tabs>

        <n-modal
          v-model:show="showEventModal"
          title="Detalle evento"
          :style="{ width: '720px' }"
          preset="card"
        >
          <div class="space-y-2">
            <div class="font-extrabold">{{ selectedEvent?.route }}</div>
            <div class="text-xs text-gray-400">
              Método: {{ selectedEvent?.method }} · Usuario:
              {{ selectedEvent?.user?.email ?? "-" }}
            </div>
            <pre
              class="text-xs bg-[#0b1220] p-3 rounded"
              v-if="selectedEvent?.payload"
              >{{ pretty(selectedEvent.payload) }}</pre
            >
            <div class="text-xs text-gray-400">IP: {{ selectedEvent?.ip }}</div>
            <div class="text-xs text-gray-400">
              User-Agent:
              <div class="truncate">{{ selectedEvent?.userAgent }}</div>
            </div>
            <div class="text-xs text-gray-400">
              Creado en: {{ selectedEvent?.createdAtFormatted }}
            </div>
          </div>
          <template #footer>
            <div class="flex justify-end">
              <n-button @click="showEventModal = false">Cerrar</n-button>
            </div>
          </template>
        </n-modal>

        <n-modal
          v-model:show="showSessionModal"
          title="Detalle sesión"
          :style="{ width: '720px' }"
          preset="card"
        >
          <div class="space-y-2">
            <div class="font-extrabold">{{ selectedSession?.user?.email }}</div>
            <div class="text-xs text-gray-400">
              IP: {{ selectedSession?.ip }}
            </div>
            <div class="text-xs text-gray-400">
              User-Agent:
              <div class="truncate">{{ selectedSession?.userAgent }}</div>
            </div>
            <div class="text-xs text-gray-400">
              Inicio: {{ selectedSession?.startedAtFormatted }}
            </div>
            <div class="text-xs text-gray-400">
              Fin: {{ selectedSession?.endedAtFormatted ?? "-" }}
            </div>
          </div>
          <template #footer>
            <div class="flex justify-end gap-2">
              <n-button
                v-if="!selectedSession?.endedAt"
                @click="endSelectedSession"
                >Finalizar sesión</n-button
              >
              <n-button @click="showSessionModal = false">Cerrar</n-button>
            </div>
          </template>
        </n-modal>
      </div>
    </div>
  </app-layout>
</template>

<script>
import AppLayout from "@/layouts/AppLayout.vue";
import AuthService from "@/services/authService";
import AuditService from "@/services/auditService";
import {
  useMessage,
  NSpin,
  NDataTable,
  NInput,
  NButton,
  NModal,
  NDatePicker,
  NTabs,
  NTabPane,
  NCard,
  NSpace,
  NBadge,
  NDropdown,
  NSelect,
} from "naive-ui";

export default {
  name: "AuditView",
  components: {
    AppLayout,
    NSpin,
    NDataTable,
    NInput,
    NButton,
    NModal,
    NDatePicker,
    NTabs,
    NTabPane,
    NCard,
    NSpace,
    NBadge,
    NDropdown,
    NSelect,
  },
  data() {
    return {
      user: null,
      q: "",
      range: null,
      quickRange: null,
      quickRangeOptions: [
        { label: "Hoy", value: "today" },
        { label: "Últimos 7 días", value: "7d" },
        { label: "Últimos 30 días", value: "30d" },
      ],
      page: 1,
      pageSize: 12,
      events: [],
      totalEvents: 0,
      newEventsToday: 0,
      loadingEvents: false,
      sessionQ: "",
      sessionPage: 1,
      sessions: [],
      totalSessions: 0,
      activeSessions: 0,
      loadingSessions: false,
      selectedEvent: null,
      showEventModal: false,
      selectedSession: null,
      showSessionModal: false,
      message: null,
      mounted: false,
      lastUpdated: "",
      activeTab: "auditoria",
      exportMenu: [
        { label: "Eventos CSV", key: "export-events-csv" },
        { label: "Sesiones CSV", key: "export-sessions-csv" },
      ],
      statusFilter: null,
      sessionStatusOptions: [
        { label: "Activas", value: "active" },
        { label: "Finalizadas", value: "ended" },
      ],
      debounceTimers: {},
    };
  },
  computed: {
    columnsEvents() {
      return [
        { title: "#", key: "id", width: 60 },
        { title: "Usuario", key: "userEmail" },
        { title: "Método", key: "method", width: 100 },
        { title: "Ruta", key: "route" },
        { title: "IP", key: "ip", width: 140 },
        { title: "Creado", key: "createdAt", width: 160 },
      ];
    },
    columnsSessions() {
      return [
        { title: "#", key: "id", width: 60 },
        { title: "Usuario", key: "userEmail" },
        { title: "IP", key: "ip" },
        { title: "Inicio", key: "startedAt", width: 160 },
        { title: "Fin", key: "endedAt", width: 160 },
      ];
    },
    inferredNewEventsToday() {
      const start = new Date();
      start.setHours(0, 0, 0, 0);
      return this.events.filter((e) => {
        if (!e.createdAt) return false;
        const d = new Date(e.createdAt);
        return d >= start;
      }).length;
    },
    inferredActiveSessions() {
      return this.sessions.filter((s) => !s.endedAt).length;
    },
  },
  watch: {
    q() {
      this.debounced("q", () => {
        this.page = 1;
        if (this.activeTab === "auditoria") this.loadEvents();
      });
    },
    range() {
      this.page = 1;
      if (this.activeTab === "auditoria") this.loadEvents();
    },
    quickRange(v) {
      this.onQuickRange(v);
    },
    sessionQ() {
      this.debounced("sessionQ", () => {
        this.sessionPage = 1;
        if (this.activeTab === "eventos") this.loadSessions();
      });
    },
    statusFilter() {
      this.sessionPage = 1;
      if (this.activeTab === "eventos") this.loadSessions();
    },
    page() {
      if (this.activeTab === "auditoria") this.loadEvents();
    },
    sessionPage() {
      if (this.activeTab === "eventos") this.loadSessions();
    },
    activeTab(v) {
      if (v === "auditoria") this.loadEvents();
      if (v === "eventos") this.loadSessions();
    },
    events() {
      if (typeof this.totalEvents !== "number" || this.totalEvents === 0) {
        this.totalEvents = this.events.length;
      }
      if (!this.newEventsToday || this.newEventsToday === 0) {
        this.newEventsToday = this.inferredNewEventsToday;
      }
    },
    sessions() {
      if (!this.totalSessions || this.totalSessions === 0) {
        this.totalSessions = this.sessions.length;
      }
      if (!this.activeSessions || this.activeSessions === 0) {
        this.activeSessions = this.inferredActiveSessions;
      }
    },
  },
  methods: {
    debounced(key, fn, wait = 450) {
      if (this.debounceTimers[key]) clearTimeout(this.debounceTimers[key]);
      this.debounceTimers[key] = setTimeout(() => {
        fn();
        this.debounceTimers[key] = null;
      }, wait);
    },
    async loadUser() {
      try {
        const resp = await AuthService.getUser();
        this.user = resp.user;
        if (!this.user || this.user.role?.name !== "ADMINISTRADOR")
          this.$router.push("/");
      } catch {
        this.$router.push("/login");
      }
    },
    async loadEvents() {
      this.loadingEvents = true;
      try {
        const params = { page: this.page, pageSize: this.pageSize };
        if (this.q) params.q = this.q;
        if (Array.isArray(this.range) && this.range.length === 2) {
          params.from = this.range[0];
          params.to = this.range[1];
        }
        const res = await AuditService.getEvents(params);
        const raw = res.events || [];
        this.events = raw.map((e) => {
          return {
            ...e,
            userEmail: e.user?.email ?? "-",
            createdAtFormatted: this.formatDate(e.createdAt),
          };
        });
        this.totalEvents =
          typeof res.total === "number"
            ? res.total
            : this.events.length || this.totalEvents;
        this.newEventsToday =
          typeof res.newToday === "number"
            ? res.newToday
            : this.inferredNewEventsToday;
        this.lastUpdated = new Date().toLocaleString();
      } catch {
        this.message?.error?.("Error cargando eventos");
      } finally {
        this.loadingEvents = false;
      }
    },
    async loadSessions() {
      this.loadingSessions = true;
      try {
        const params = { page: this.sessionPage, pageSize: this.pageSize };
        if (this.sessionQ) params.q = this.sessionQ;
        if (this.statusFilter) params.status = this.statusFilter;
        const res = await AuditService.getSessions(params);
        const raw = res.sessions || [];
        this.sessions = raw.map((s) => {
          return {
            ...s,
            userEmail: s.user?.email ?? "-",
            startedAtFormatted: this.formatDate(s.startedAt),
            endedAtFormatted: s.endedAt ? this.formatDate(s.endedAt) : null,
          };
        });
        this.totalSessions =
          typeof res.total === "number"
            ? res.total
            : this.sessions.length || this.totalSessions;
        this.activeSessions =
          typeof res.active === "number"
            ? res.active
            : this.inferredActiveSessions;
        this.lastUpdated = new Date().toLocaleString();
      } catch {
        this.message?.error?.("Error cargando sesiones");
      } finally {
        this.loadingSessions = false;
      }
    },
    onEventsPageChange(p) {
      this.page = p;
      this.loadEvents();
    },
    onSessionsPageChange(p) {
      this.sessionPage = p;
      this.loadSessions();
    },
    onQuickRange(v) {
      if (!v) return;
      const end = new Date();
      let start = new Date();
      if (v === "today")
        start = new Date(end.getFullYear(), end.getMonth(), end.getDate());
      if (v === "7d") start.setDate(end.getDate() - 7);
      if (v === "30d") start.setDate(end.getDate() - 30);
      this.range = [start.toISOString(), end.toISOString()];
    },
    formatDate(d) {
      if (!d) return "-";
      try {
        const date = new Date(d);
        const parts = new Intl.DateTimeFormat("es-BO", {
          timeZone: "America/La_Paz",
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          hour12: false,
        }).formatToParts(date);
        const map = {};
        parts.forEach((p) => {
          map[p.type] = p.value;
        });
        return `${map.year}-${map.month}-${map.day} ${map.hour}:${map.minute}:${map.second}`;
      } catch (e) {
        return String(d);
      }
    },
    methodBadgeType(m) {
      if (!m) return "default";
      const up = String(m).toUpperCase();
      if (up === "POST") return "info";
      if (up === "PUT" || up === "PATCH") return "warning";
      if (up === "DELETE") return "error";
      return "default";
    },
    async openEvent(id) {
      try {
        const { event } = await AuditService.getEvent(id);
        this.selectedEvent = {
          ...event,
          createdAtFormatted: this.formatDate(event?.createdAt),
        };
        this.showEventModal = true;
      } catch {
        this.message?.error?.("Error al obtener evento");
      }
    },
    async openSession(id) {
      try {
        const { session } = await AuditService.getSession(id);
        this.selectedSession = {
          ...session,
          startedAtFormatted: this.formatDate(session?.startedAt),
          endedAtFormatted: session?.endedAt
            ? this.formatDate(session.endedAt)
            : null,
        };
        this.showSessionModal = true;
      } catch {
        this.message?.error?.("Error al obtener sesión");
      }
    },
    async endSelectedSession() {
      try {
        await AuditService.endSession(this.selectedSession.id);
        this.showSessionModal = false;
        await this.loadSessions();
      } catch {
        this.message?.error?.("Error finalizando sesión");
      }
    },
    handleEventMenu(key, row) {
      if (key === "copy-route") navigator.clipboard?.writeText(row.route || "");
      if (key === "view-payload") {
        this.selectedEvent = row;
        this.showEventModal = true;
      }
    },
    handleSessionMenu(key, row) {
      if (key === "end") {
        this.selectedSession = row;
        this.endSelectedSession();
      }
      if (key === "block") {
        AuditService.blockIp(row.ip)
          .then(() => this.message.success("IP bloqueada"))
          .catch(() => this.message.error("Error bloqueando IP"));
      }
    },
    pretty(obj) {
      try {
        return JSON.stringify(obj, null, 2);
      } catch {
        return String(obj);
      }
    },
  },
  created() {
    this.message = useMessage();
    this.loadUser();
    this.loadEvents();
    this.loadSessions();
  },
  mounted() {
    this.$nextTick(() => {
      this.mounted = true;
    });
  },
};
</script>

<style scoped>
.n-data-table .n-data-table-tbody td {
  vertical-align: middle;
}
</style>
