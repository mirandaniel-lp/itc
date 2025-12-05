<template>
  <app-layout>
    <div class="min-h-screen bg-[#0f172a] p-8 text-white flex justify-center">
      <div
        class="w-full max-w-6xl bg-[#1e293b]/90 border border-[#334155] rounded-2xl p-8 shadow-[0_8px_30px_rgba(0,0,0,0.6)]"
      >
        <h1 class="text-4xl font-extrabold text-center mb-6 tracking-tight">
          Registrar Inscripción
        </h1>

        <n-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-placement="top"
          :show-feedback="false"
        >
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <n-form-item label="Estudiante" path="studentId">
              <n-select
                v-model:value="form.studentId"
                :options="studentOptions"
                placeholder="Seleccione estudiante"
                filterable
                clearable
                size="large"
                @update:value="onStudentChange"
              />
            </n-form-item>
            <n-form-item label="Cursos" path="courseIds">
              <n-select
                v-model:value="form.courseIds"
                :options="courseOptions"
                multiple
                max-tag-count="responsive"
                placeholder="Seleccione uno o más cursos"
                filterable
                clearable
                size="large"
                @update:value="loadSelectedCourses"
              />
            </n-form-item>
            <n-form-item label="Fecha de Inscripción" path="enrollment_date">
              <n-date-picker
                v-model:value="form.enrollment_date"
                type="date"
                :input-readonly="true"
                clearable
                size="large"
              />
            </n-form-item>
            <n-form-item label="Tipo de Pago" path="payment_type">
              <n-select
                v-model:value="form.payment_type"
                :options="paymentOptions"
                placeholder="Seleccione tipo de pago"
                filterable
                clearable
                size="large"
              />
            </n-form-item>
          </div>

          <div
            v-if="needsContact"
            class="mt-4 rounded-2xl border border-[#10b981]/30 bg-[#0f172a]/50 p-4"
          >
            <div class="text-sm text-[#a7f3d0] mb-3 font-extrabold">
              Contacto del estudiante (solo primera inscripción)
            </div>
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-3">
              <n-form-item label="Nombre completo" path="contact_full_name">
                <n-input
                  v-model:value="contact.full_name"
                  placeholder="Ej: Ana Pérez"
                />
              </n-form-item>
              <n-form-item label="Relación" path="contact_relation">
                <n-select
                  v-model:value="contact.relation"
                  :options="relationOptions"
                  placeholder="Seleccione relación"
                />
              </n-form-item>
              <n-form-item label="Teléfono" path="contact_phone">
                <n-input
                  v-model:value="contact.phone"
                  placeholder="Ej: 76543210"
                />
              </n-form-item>
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-6">
            <div class="rounded-2xl border border-[#334155] p-4">
              <div class="text-sm text-gray-400 mb-2">Cursos seleccionados</div>
              <div v-if="!selectedDetails.length" class="text-gray-500">
                Sin cursos seleccionados
              </div>
              <div v-else class="space-y-3">
                <div
                  v-for="c in selectedDetails"
                  :key="c.id"
                  class="rounded-xl border border-[#334155] p-3"
                >
                  <div class="font-extrabold">
                    {{ c.name }}{{ c.parallel ? ` (${c.parallel})` : "" }}
                  </div>
                  <div class="text-xs text-gray-300">
                    {{ c.teacher?.name }} {{ c.teacher?.last_name || "" }} •
                    {{ c.modality?.name || "" }}
                  </div>
                  <div class="mt-2 flex flex-wrap gap-2">
                    <n-tag size="small" round>{{ termLabel(c.term) }}</n-tag>
                    <n-tag size="small" round>{{ c.shift }}</n-tag>
                    <n-tag size="small" round>{{ money(c.cost) }}</n-tag>
                    <n-tag v-if="c.max_capacity != null" size="small" round
                      >Cupo {{ c.max_capacity }}</n-tag
                    >
                  </div>
                  <div
                    class="mt-2 text-xs text-gray-300"
                    v-for="s in c.schedules"
                    :key="s.id"
                  >
                    {{ s.weekday }} • {{ s.start_time }} - {{ s.end_time }} •
                    {{ s.classroom?.name || "-" }}
                  </div>
                </div>
              </div>
            </div>

            <div class="rounded-2xl border border-[#334155] p-4">
              <div class="text-sm text-gray-400 mb-2">Revisión</div>
              <div v-if="agendaOk" class="inline-flex items-center gap-2">
                <n-tag type="success" round size="small"
                  >Agenda compatible</n-tag
                >
              </div>
              <div v-else class="space-y-2">
                <n-tag type="error" round size="small"
                  >Conflicto de horario</n-tag
                >
                <div
                  class="text-xs text-gray-300"
                  v-for="w in conflicts"
                  :key="w"
                >
                  {{ w }}
                </div>
              </div>
            </div>
          </div>

          <div class="mt-6 rounded-2xl border border-[#334155] p-4">
            <div class="text-sm text-gray-400 mb-3">Horario semanal</div>
            <div class="overflow-x-auto">
              <table class="min-w-full text-sm">
                <thead class="text-left text-gray-300">
                  <tr>
                    <th class="w-24 py-2 px-2">HORA</th>
                    <th v-for="d in days" :key="d.key" class="py-2 px-2">
                      {{ d.label }}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="h in gridHours" :key="h">
                    <td class="py-3 px-2 text-gray-300 align-top">
                      {{ hh(h) }}
                    </td>
                    <td
                      v-for="d in days"
                      :key="d.key"
                      class="py-2 px-2 align-top"
                    >
                      <div
                        class="h-10 rounded-md border border-white/10 bg-white/0 relative"
                      >
                        <div
                          v-for="it in cellItems(d.key, h)"
                          :key="it.k"
                          class="absolute inset-0 rounded-md flex items-center justify-center text-[11px] font-bold border"
                          :class="it.t === 'sel' ? selBg(it.cidx) : extBg"
                        >
                          <span class="truncate px-2">{{ it.txt }}</span>
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="mt-3 flex items-center gap-3 text-xs text-gray-400">
              <div class="w-3 h-3 rounded border" :class="selBg(0)"></div>
              <div>Cursos seleccionados</div>
              <div class="w-3 h-3 rounded border" :class="extBg"></div>
              <div>Inscrito previamente</div>
            </div>
          </div>

          <div class="mt-6 flex justify-center gap-4">
            <n-button type="default" @click="$router.push('/enrollments')"
              >Volver</n-button
            >
            <n-button type="primary" :loading="submitting" @click="submit"
              >Guardar</n-button
            >
          </div>
        </n-form>
      </div>

      <n-modal
        v-model:show="showResult"
        preset="card"
        :style="{ width: '720px' }"
        title="Inscripción registrada"
      >
        <div class="space-y-4">
          <div
            v-if="result.user_created"
            class="rounded-lg border border-[#22c55e]/40 bg-[#16a34a]/10 p-3"
          >
            <div class="text-sm text-[#86efac] font-extrabold">
              Credenciales generadas
            </div>
            <div class="mt-1 text-gray-200 text-sm">
              Usuario:
              <span class="font-bold">{{ result.credentials.username }}</span>
            </div>
            <div class="text-gray-200 text-sm">
              Contraseña:
              <span class="font-bold">{{ result.credentials.password }}</span>
            </div>
          </div>
          <div>
            <div class="text-sm text-gray-400 mb-2">Horario</div>
            <table class="w-full text-sm">
              <thead class="text-left text-gray-400">
                <tr>
                  <th class="py-2">Curso</th>
                  <th class="py-2">Día</th>
                  <th class="py-2">Inicio</th>
                  <th class="py-2">Fin</th>
                  <th class="py-2">Aula</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(r, i) in result.schedule"
                  :key="i"
                  class="border-t border-white/10"
                >
                  <td class="py-2">{{ r.courseName }}</td>
                  <td class="py-2">{{ r.weekday }}</td>
                  <td class="py-2">{{ r.start_time }}</td>
                  <td class="py-2">{{ r.end_time }}</td>
                  <td class="py-2">{{ r.classroom?.name || "-" }}</td>
                </tr>
              </tbody>
            </table>
            <div v-if="!result.schedule?.length" class="text-gray-500 mt-2">
              Sin horario.
            </div>
          </div>
        </div>
        <template #footer>
          <div class="flex justify-end">
            <n-button type="primary" @click="closeResult">Aceptar</n-button>
          </div>
        </template>
      </n-modal>
    </div>
  </app-layout>
</template>

<script>
import {
  NForm,
  NFormItem,
  NSelect,
  NDatePicker,
  NButton,
  NModal,
  NTag,
  NInput,
  useMessage,
} from "naive-ui";
import AppLayout from "@/layouts/AppLayout.vue";
import { useRoute } from "vue-router";
import EnrollmentService from "@/services/enrollmentService";
import StudentService from "@/services/studentService";
import CourseService from "@/services/courseService";

export default {
  name: "CreateEnrollmentView",
  components: {
    AppLayout,
    NForm,
    NFormItem,
    NSelect,
    NDatePicker,
    NButton,
    NModal,
    NTag,
    NInput,
  },
  data() {
    return {
      route: useRoute(),
      formRef: null,
      message: null,
      submitting: false,
      form: {
        studentId: null,
        courseIds: [],
        enrollment_date: null,
        payment_type: null,
      },
      paymentOptions: [
        { label: "CONTADO", value: "CONTADO" },
        { label: "MENSUAL", value: "MENSUAL" },
      ],
      relationOptions: [
        { label: "Madre", value: "MADRE" },
        { label: "Padre", value: "PADRE" },
        { label: "Tutor", value: "TUTOR" },
        { label: "Apoderado", value: "APODERADO" },
        { label: "Otro", value: "OTRO" },
      ],
      needsContact: false,
      contact: { full_name: "", relation: "", phone: "" },
      studentOptions: [],
      courseOptions: [],
      selectedDetails: [],
      studentSchedule: [],
      showResult: false,
      result: { user_created: false, credentials: null, schedule: [] },
      rules: {
        studentId: {
          required: true,
          message: "Seleccione estudiante",
          trigger: "change",
        },
        courseIds: [
          {
            validator: (_, v) =>
              Array.isArray(v) && v.length > 0
                ? true
                : new Error("Seleccione uno o más cursos"),
            trigger: ["change", "blur"],
          },
        ],
        payment_type: {
          required: true,
          message: "Seleccione tipo de pago",
          trigger: "change",
        },
      },
      days: [
        { key: "LUNES", label: "Lunes" },
        { key: "MARTES", label: "Martes" },
        { key: "MIERCOLES", label: "Miércoles" },
        { key: "JUEVES", label: "Jueves" },
        { key: "VIERNES", label: "Viernes" },
        { key: "SABADO", label: "Sábado" },
        { key: "DOMINGO", label: "Domingo" },
      ],
    };
  },
  computed: {
    allBlocks() {
      const blocks = [];
      for (const c of this.selectedDetails) {
        const colorIdx = this.colorIndex(c.id);
        for (const s of c.schedules || []) {
          const hs = this.hourSpan(s.start_time, s.end_time);
          for (const h of hs)
            blocks.push({
              d: s.weekday,
              h,
              txt: `${c.name}${c.parallel ? ` (${c.parallel})` : ""}`,
              t: "sel",
              cidx: colorIdx,
              k: `sel-${c.id}-${s.id}-${h}`,
            });
        }
      }
      for (const e of this.studentSchedule) {
        const hs = this.hourSpan(e.start_time, e.end_time);
        for (const h of hs)
          blocks.push({
            d: e.weekday,
            h,
            txt: e.courseName,
            t: "ext",
            cidx: -1,
            k: `ext-${e.courseId}-${h}`,
          });
      }
      return blocks;
    },
    gridHours() {
      const hours = [];
      let minH = 8,
        maxH = 18;
      const scan = [];
      for (const b of this.allBlocks) scan.push(b.h);
      if (scan.length) {
        minH = Math.max(7, Math.min(...scan));
        maxH = Math.min(22, Math.max(...scan) + 1);
      }
      for (let h = minH; h <= maxH; h++) hours.push(h);
      return hours;
    },
    agendaOk() {
      return this.conflicts.length === 0;
    },
    conflicts() {
      const key = (d, h) => `${d}-${h}`;
      const map = new Map();
      for (const b of this.allBlocks) {
        const k = key(b.d, b.h);
        if (!map.has(k)) map.set(k, []);
        map.get(k).push(b);
      }
      const out = [];
      for (const [k, arr] of map.entries()) {
        if (arr.length > 1) {
          const [d, h] = k.split("-");
          out.push(`${d} ${this.hh(Number(h))}`);
        }
      }
      return out;
    },
  },
  methods: {
    async loadOptions() {
      try {
        const students = await StudentService.getAll();
        this.studentOptions = (students || []).map((s) => ({
          label: `${s.name} ${s.last_name ?? ""} ${
            s.second_last_name ?? ""
          }`.trim(),
          value: String(s.id),
        }));
        const courses = await CourseService.getAll();
        this.courseOptions = (courses || []).map((c) => ({
          label: `${c.name}${c.parallel ? ` (${c.parallel})` : ""}`,
          value: String(c.id),
        }));
        const pre = this.route.query.studentId
          ? String(this.route.query.studentId)
          : null;
        if (pre) {
          this.form.studentId = pre;
          await this.onStudentChange(pre);
        }
      } catch {
        this.message?.error?.("Error al cargar datos.");
      }
    },
    async onStudentChange(v) {
      this.studentSchedule = [];
      this.needsContact = false;
      this.contact = { full_name: "", relation: "", phone: "" };
      if (!v) return;
      const id = Number(v);
      try {
        const st = await StudentService.getById(id);
        this.needsContact = !st?.has_contacts;
      } catch {}
      try {
        const sch = await EnrollmentService.getStudentSchedule(id);
        this.studentSchedule = sch || [];
      } catch {}
    },
    async loadSelectedCourses() {
      this.selectedDetails = [];
      const ids = Array.isArray(this.form.courseIds)
        ? this.form.courseIds.slice(0, 8)
        : [];
      const out = [];
      for (const idRaw of ids) {
        const id = Number(idRaw);
        try {
          const c = await CourseService.getById(id);
          out.push(c || {});
        } catch {}
      }
      this.selectedDetails = out;
    },
    hourSpan(st, et) {
      const [hs] = String(st)
        .split(":")
        .map((x) => parseInt(x, 10));
      const [he, me] = String(et)
        .split(":")
        .map((x) => parseInt(x, 10));
      const start = hs;
      const end = me === 0 ? he : he;
      const out = [];
      for (let h = start; h < end; h++) out.push(h);
      return out;
    },
    cellItems(day, hour) {
      return this.allBlocks.filter((b) => b.d === day && b.h === hour);
    },
    termLabel(t) {
      if (!t) return "";
      const y = new Date(t.start_date).getFullYear();
      return `${t.name ?? y}`;
    },
    money(v) {
      if (v == null) return "0 Bs";
      const n = Number(v);
      return `${Number.isNaN(n) ? v : n} Bs`;
    },
    hh(h) {
      return `${String(h).padStart(2, "0")}:00`;
    },
    colorIndex(id) {
      const s = String(id);
      let sum = 0;
      for (let i = 0; i < s.length; i++)
        sum = (sum * 31 + s.charCodeAt(i)) % 1000;
      return sum % 6;
    },
    selBg(idx) {
      const bgs = [
        "bg-[#1d4ed8]/25 border-[#1d4ed8]/40 text-[#93c5fd]",
        "bg-[#059669]/25 border-[#059669]/40 text-[#6ee7b7]",
        "bg-[#b45309]/25 border-[#b45309]/40 text-[#fcd34d]",
        "bg-[#7c3aed]/25 border-[#7c3aed]/40 text-[#c4b5fd]",
        "bg-[#dc2626]/25 border-[#dc2626]/40 text-[#fca5a5]",
        "bg-[#0ea5e9]/25 border-[#0ea5e9]/40 text-[#7dd3fc]",
      ];
      return bgs[idx % bgs.length];
    },
    get extBg() {
      return "bg-white/10 border-white/20 text-gray-200";
    },
    async submit() {
      try {
        await this.formRef?.validate();
      } catch {
        this.message?.error?.("Corrija los campos requeridos.");
        return;
      }
      if (this.needsContact) {
        if (
          !String(this.contact.full_name || "").trim() ||
          !String(this.contact.relation || "").trim() ||
          !String(this.contact.phone || "").trim()
        ) {
          this.message?.error?.("Complete los datos de contacto.");
          return;
        }
      }
      if (!this.agendaOk) {
        this.message?.error?.("Hay conflictos de horario.");
        return;
      }
      this.submitting = true;
      try {
        const payload = {
          studentId: Number(this.form.studentId),
          courseIds: (this.form.courseIds || []).map((x) => Number(x)),
          enrollment_date: this.form.enrollment_date
            ? new Date(this.form.enrollment_date).toISOString()
            : null,
          payment_type: this.form.payment_type,
          contact: this.needsContact ? this.contact : undefined,
        };
        const r = await EnrollmentService.createTx(payload);
        this.result = r || {};
        this.showResult = true;
      } catch (err) {
        const msg =
          err?.response?.data?.error || err?.message || "Error al registrar";
        this.message?.error?.(msg);
      } finally {
        this.submitting = false;
      }
    },
    closeResult() {
      this.showResult = false;
      this.$router.push("/enrollments");
    },
  },
  created() {
    this.message = useMessage();
    this.loadOptions();
  },
};
</script>
