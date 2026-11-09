<script setup lang="ts">
import { ref, computed, watch } from 'vue'
import { CalendarDate } from '@internationalized/date'

const props = withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
}>(), {
  modelValue: '',
  placeholder: 'Pilih tanggal & waktu'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

const monthShort = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des']

const open = ref(false)

// Calendar model: a date-only CalendarDate, or undefined when nothing chosen.
const dateValue = ref<CalendarDate | undefined>(undefined)
// UCalendar is generic over range/multiple; vue-tsc widens its modelValue to a
// wide union (DateValue | DateRange | DateValue[] | ...) regardless of the
// generic defaults, which breaks a direct typed binding. Bridge it with an
// `any` view; updates are narrowed back to CalendarDate in onCalendarUpdate.
const calendarModel = computed<any>(() => dateValue.value)
// Time is always present (defaults to 00:00) so the value is complete as soon
// as a date is picked. The user can refine it via the selects.
const hour = ref<number | undefined>(0)
const minute = ref<number | undefined>(0)

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

function buildValue() {
  if (!dateValue.value) return ''
  return `${dateValue.value.toString()}T${pad2(hour.value ?? 0)}:${pad2(minute.value ?? 0)}`
}

function syncFromModel(v: string) {
  if (!v) {
    dateValue.value = undefined
    hour.value = 0
    minute.value = 0
    return
  }
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/.exec(v)
  if (m) {
    dateValue.value = new CalendarDate(Number(m[1]), Number(m[2]), Number(m[3]))
    hour.value = Number(m[4])
    minute.value = Number(m[5])
    return
  }
  const d = /^(\d{4})-(\d{2})-(\d{2})/.exec(v)
  if (d) {
    dateValue.value = new CalendarDate(Number(d[1]), Number(d[2]), Number(d[3]))
    hour.value = 0
    minute.value = 0
  } else {
    dateValue.value = undefined
    hour.value = 0
    minute.value = 0
  }
}

// Initialise from the incoming modelValue once on setup.
syncFromModel(props.modelValue)

const hourOptions = Array.from({ length: 24 }, (_, i) => ({ label: pad2(i), value: i }))
const minuteOptions = Array.from({ length: 60 }, (_, i) => ({ label: pad2(i), value: i }))

const hasValue = computed(() => dateValue.value != null)

const preview = computed(() => {
  const d = dateValue.value
  if (!d) return ''
  return `${d.day} ${monthShort[d.month - 1]} ${d.year} · ${pad2(hour.value ?? 0)}:${pad2(minute.value ?? 0)}`
})

function clear() {
  dateValue.value = undefined
  hour.value = 0
  minute.value = 0
}

// UCalendar is generic over range/multiple; bind manually + narrow so the
// model type stays a clean CalendarDate (its date-only mode only ever emits one).
function onCalendarUpdate(value: unknown) {
  dateValue.value = value instanceof CalendarDate ? value : undefined
}

// Emit whenever the date or time changes.
watch([dateValue, hour, minute], () => {
  const v = buildValue()
  if (v !== props.modelValue) emit('update:modelValue', v)
})

// Sync from external modelValue changes (openCreate / openEdit resetting the form).
watch(() => props.modelValue, (v) => {
  if (v !== buildValue()) syncFromModel(v)
})
</script>

<template>
  <UPopover v-model:open="open" :content="{ side: 'bottom', align: 'start', sideOffset: 6, collisionPadding: 12 }">
    <!-- Trigger: styled like the form's other inputs -->
    <button type="button" class="group w-full flex items-center gap-2 rounded-xl border border-default bg-elevated px-3 py-2 text-left text-sm shadow-sm transition-colors hover:border-accented focus:outline-none focus-visible:ring-2 focus-visible:ring-primary/20">
      <UIcon name="i-lucide-calendar" class="text-primary shrink-0" />
      <span class="flex-1 min-w-0 truncate" :class="hasValue ? 'text-default font-medium' : 'text-muted'">
        {{ hasValue ? preview : placeholder }}
      </span>
      <UIcon name="i-lucide-chevron-down" class="text-muted shrink-0 transition-transform duration-200" :class="open ? 'rotate-180' : ''" />
    </button>

    <template #content="{ close }">
      <div class="p-3 space-y-3 w-72 max-w-[calc(100vw-1.5rem)]">
        <!-- Date: themed calendar (azure selection, Indonesian month/weekday names,
             heading switches to month then year picker) -->
        <UCalendar
          :model-value="calendarModel"
          locale="id-ID"
          size="sm"
          class="w-full"
          @update:model-value="onCalendarUpdate"
        />

        <!-- Printed-rule divider, echoing the site's halftone/paper motif -->
        <div class="border-t border-dashed border-default/40" />

        <!-- Time selection -->
        <div>
          <div class="text-[10px] font-semibold text-dimmed uppercase tracking-wider mb-1.5">Waktu</div>
          <div class="grid grid-cols-2 gap-2">
            <div>
              <label class="block text-[10px] font-semibold text-dimmed uppercase tracking-wider mb-1">Jam</label>
              <USelect v-model="hour" :items="hourOptions" size="sm" class="w-full" />
            </div>
            <div>
              <label class="block text-[10px] font-semibold text-dimmed uppercase tracking-wider mb-1">Menit</label>
              <USelect v-model="minute" :items="minuteOptions" size="sm" class="w-full" />
            </div>
          </div>
        </div>

        <!-- Footer actions -->
        <div class="flex items-center justify-between pt-1">
          <UButton variant="ghost" color="neutral" size="xs" label="Hapus" icon="i-lucide-trash-2" :disabled="!hasValue" @click="clear" />
          <UButton color="primary" size="xs" label="Selesai" icon="i-lucide-check" @click="close" />
        </div>
      </div>
    </template>
  </UPopover>
</template>
