<template>
  <app-layout>
    <div class="min-h-screen bg-[#0f172a] p-8 text-white flex justify-center">
      <div
        class="w-full max-w-5xl bg-[#1e293b]/90 border border-[#334155] shadow-[0_8px_30px_rgba(0,0,0,0.6)] rounded-2xl p-8 backdrop-blur-sm"
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
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-3">
            <n-form-item label="Estudiante" path="studentId">
              <n-select
                v-model:value="form.studentId"
                :options="studentOptions"
                placeholder="Seleccione estudiante"
                filterable
                clearable
                size="large"
                class="w-full rounded-xl bg-[#0f172a]/70 border border-[#334155] px-2 py-1 focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all duration-300 text-gray-100"
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
                class="w-full rounded-xl bg-[#0f172a]/70 border border-[#334155] px-2 py-1 focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all duration-300 text-gray-100"
              />
            </n-form-item>

            <n-form-item label="Fecha de Inscripción" path="enrollment_date">
              <n-date-picker
                v-model:value="form.enrollment_date"
                type="date"
                placeholder="Seleccione fecha"
                :input-readonly="true"
                clearable
                size="large"
                class="w-full rounded-xl bg-[#0f172a]/70 border border-[#334155] px-4 py-2 focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all duration-300 placeholder:text-gray-400"
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
                class="w-full rounded-xl bg-[#0f172a]/70 border border-[#334155] px-2 py-1 focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all duration-300 text-gray-100"
              />
            </n-form-item>
          </div>

          <div
            v-if="needsContact"
            class="mt-6 rounded-2xl border border-[#10b981]/30 bg-[#0f172a]/50 p-4"
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

          <div
            class="mt-4 rounded-xl border border-[#334155] bg-[#0f172a]/50 p-4"
          >
            <div class="text-sm text-gray-400 mb-2">Cursos seleccionados</div>
            <div v-if="!form.courseIds.length" class="text-gray-500">
              Sin cursos seleccionados
            </div>
            <div v-else class="flex flex-wrap gap-2">
              <span
                v-for="c in selectedCourseBadges"
                :key="c.value"
                class="inline-flex items-center gap-2 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#1d4ed8]/20 text-[#93c5fd] border border-[#1d4ed8]/40"
              >
                {{ c.label }}
                <button
                  class="ml-1 text-rose-300 hover:text-rose-400"
                  @click="removeCourse(c.value)"
                >
                  ×
                </button>
              </span>
            </div>
          </div>

          <div class="mt-6 flex justify-center gap-4">
            <n-button
              type="default"
              class="bg-[#1e293b] border border[#334155] text-gray-300 font-bold px-8 py-3 rounded-xl hover:bg-[#334155] hover:text-white hover:scale-105 active:scale-95 transition-all duration-300"
              @click="$router.push('/enrollments')"
              >Volver</n-button
            >

            <n-button
              type="primary"
              :loading="submitting"
              class="bg-gradient-to-r from-[#1e3a8a] to-[#2563eb] text-white font-extrabold px-8 py-3 rounded-xl shadow-[0_0_18px_rgba(37,99,235,0.6)] hover:shadow-[0_0_28px_rgba(37,99,235,0.9)] hover:scale-105 active:scale-95 transition-all duration-300"
              @click="submit"
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
  NInput,
  useMessage,
} from "naive-ui";
import { useRoute } from "vue-router";
import AppLayout from "@/layouts/AppLayout.vue";
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
    };
  },
  computed: {
    selectedCourseBadges() {
      const map = new Map(this.courseOptions.map((o) => [o.value, o.label]));
      return this.form.courseIds.map((id) => ({
        value: id,
        label: map.get(id) || `#${id}`,
      }));
    },
  },
  watch: {
    "form.studentId": {
      immediate: false,
      handler: async function (v) {
        this.needsContact = false;
        this.contact = { full_name: "", relation: "", phone: "" };
        if (!v) return;
        try {
          const st = await StudentService.getById(v);
          this.needsContact = !st.has_contacts;
        } catch {}
      },
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
          value: s.id,
        }));
        const courses = await CourseService.getAll();
        this.courseOptions = (courses || []).map((c) => ({
          label: `${c.name}${c.parallel ? ` (${c.parallel})` : ""}`,
          value: c.id,
        }));
        const pre = this.route.query.studentId
          ? Number(this.route.query.studentId)
          : null;
        if (pre) this.form.studentId = pre;
      } catch {
        this.message?.error?.("Error al cargar datos.");
      }
    },
    removeCourse(id) {
      this.form.courseIds = this.form.courseIds.filter((x) => x !== id);
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
      this.submitting = true;
      try {
        const payload = {
          studentId: this.form.studentId,
          courseIds: this.form.courseIds,
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
