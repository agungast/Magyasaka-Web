<script setup lang="ts">
import { computed, ref, watchEffect } from 'vue'
import { useSeoMeta } from '#app'
import { useSchedules, useSemesters, semesterLabel } from '~/composables/useData'
// Fase 2: Jadwal Kuliah — Tampilan Mingguan
useSeoMeta({ title: 'Jadwal Kuliah - Magyasaka' })

const { data: schedules } = useSchedules()
const { data: semesters } = useSemesters()

const activeSemesterId = ref('')

// Urutkan semester terbaru di paling kiri (depan), semester lama di paling kanan (belakang)
const sortedSemesters = computed(() => {
  if (!semesters.value) return []
  return [...semesters.value].sort((a: any, b: any) => {
    const timeA = a.created_at ? new Date(a.created_at).getTime() : 0
    const timeB = b.created_at ? new Date(b.created_at).getTime() : 0
    if (timeA !== timeB) return timeB - timeA
    return (b.nomor || 0) - (a.nomor || 0)
  })
})

watchEffect(() => {
  if (activeSemesterId.value || !sortedSemesters.value.length) return
  activeSemesterId.value = sortedSemesters.value[0]?.id || ''
})

const activeSemester = computed(() =>
  sortedSemesters.value.find((s: any) => s.id === activeSemesterId.value) || null
)

const filteredSchedules = computed(() => {
  const all = schedules.value || []
  if (!sortedSemesters.value.length || !activeSemesterId.value) return all
  return all.filter((s: any) => s.semester_id === activeSemesterId.value)
})

const days = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']
const currentDay = ref(days[Math.min(new Date().getDay() - 1, 4)])
if (new Date().getDay() === 0 || new Date().getDay() === 6) {
  currentDay.value = 'Senin'
}

const viewMode = ref<'week' | 'day'>('week')

function blockStyle(s: any) {
  const color = s.warna || '#6366f1'
  return {
    borderLeft: `4px solid ${color}`,
    backgroundColor: `color-mix(in srgb, ${color} 14%, var(--ui-bg))`
  }
}

const scheduleByDay = computed(() => {
  const grouped: Record<string, any[]> = {}
  days.forEach(d => { grouped[d] = [] })
  filteredSchedules.value.forEach((s: any) => {
    if (grouped[s.hari]) {
      grouped[s.hari]!.push(s)
    }
  })
  return grouped
})

const todayName = computed(() => {
  const d = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat']
  return d[new Date().getDay()]
})

const todaySchedules = computed(() =>
  filteredSchedules.value.filter((s: any) => s.hari === todayName.value)
)

const totalSKS = computed(() =>
  filteredSchedules.value.reduce((sum: number, s: any) => sum + (s.sks || 0), 0)
)
</script>

<template>
  <UContainer class="py-8">
    <!-- Page Header -->
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
      <div>
        <h1 class="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <UIcon name="i-lucide-calendar" class="text-primary" />
          Jadwal Kuliah
        </h1>
        <p class="text-muted mt-1">
          <span v-if="activeSemester">{{ semesterLabel(activeSemester) }} · </span>Total {{ totalSKS }} SKS
        </p>
      </div>
      <div class="flex items-center gap-2">
        <UButtonGroup>
          <UButton
            :color="viewMode === 'week' ? 'primary' : 'neutral'"
            :variant="viewMode === 'week' ? 'solid' : 'outline'"
            label="Mingguan"
            icon="i-lucide-calendar-days"
            size="sm"
            @click="viewMode = 'week'"
          />
          <UButton
            :color="viewMode === 'day' ? 'primary' : 'neutral'"
            :variant="viewMode === 'day' ? 'solid' : 'outline'"
            label="Hari Ini"
            icon="i-lucide-calendar-check"
            size="sm"
            @click="viewMode = 'day'"
          />
        </UButtonGroup>
      </div>
    </div>

    <!-- Semester tabs -->
    <div v-if="sortedSemesters.length" class="flex gap-1 overflow-x-auto pb-2 mb-6">
      <UButton
        v-for="sem in sortedSemesters"
        :key="sem.id"
        :label="`Sem ${sem.nomor} ${sem.tipe}`"
        :color="activeSemesterId === sem.id ? 'primary' : 'neutral'"
        :variant="activeSemesterId === sem.id ? 'solid' : 'ghost'"
        size="sm"
        @click="activeSemesterId = sem.id"
      />
    </div>

    <!-- Weekly View -->
    <div v-if="viewMode === 'week'">
      <!-- Mobile: Tab view -->
      <div class="lg:hidden mb-4">
        <div class="flex gap-1 overflow-x-auto pb-2">
          <UButton
            v-for="day in days"
            :key="day"
            :label="day.substring(0, 3)"
            :color="currentDay === day ? 'primary' : 'neutral'"
            :variant="currentDay === day ? 'solid' : 'ghost'"
            size="sm"
            @click="currentDay = day"
          />
        </div>
        <div class="mt-4">
          <div v-if="scheduleByDay[currentDay || 'Senin']?.length === 0" class="text-center py-8 text-muted">
            <UIcon name="i-lucide-coffee" class="text-3xl mb-2" />
            <p class="text-sm">Tidak ada kuliah hari {{ currentDay }}</p>
          </div>
          <div v-else class="space-y-3">
            <UCard
              v-for="s in scheduleByDay[currentDay || 'Senin']"
              :key="s.id"
              class="card-hover"
              :style="blockStyle(s)"
            >
              <div class="flex items-center gap-3">
                <div
                  class="accent w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                  :style="{ '--accent': s.warna || '#6366f1' }"
                >
                  <UIcon name="i-lucide-book-open" class="text-xl" />
                </div>
                <div class="flex-1 min-w-0">
                  <p class="font-semibold text-sm">{{ s.mata_kuliah }}</p>
                  <p class="text-xs text-muted">{{ s.dosen }}</p>
                  <div class="flex items-center gap-3 mt-1">
                    <span class="text-xs flex items-center gap-1">
                      <UIcon name="i-lucide-clock" class="text-xs" />
                      {{ s.jam_mulai.slice(0, 5) }} - {{ s.jam_selesai.slice(0, 5) }}
                    </span>
                    <span class="text-xs flex items-center gap-1">
                      <UIcon name="i-lucide-map-pin" class="text-xs" />
                      {{ s.ruangan }}
                    </span>
<UBadge :label="`${s.sks} SKS`" variant="outline" size="xs" />
                  </div>
                </div>
              </div>
            </UCard>
          </div>
        </div>
      </div>

      <!-- Desktop: Grid view -->
      <div class="hidden lg:grid lg:grid-cols-5 gap-3">
        <div v-for="day in days" :key="day" class="space-y-3">
          <div
            :class="[
              'text-center py-2 rounded-lg font-semibold text-sm',
              day === todayName ? 'bg-primary text-inverted' : 'bg-elevated'
            ]"
          >
            {{ day }}
          </div>
          <div v-if="scheduleByDay[day]?.length === 0" class="text-center py-6 text-muted">
            <UIcon name="i-lucide-minus" class="text-lg" />
          </div>
          <UCard
            v-for="s in scheduleByDay[day]"
            :key="s.id"
            class="card-hover"
            :style="blockStyle(s)"
          >
            <div>
              <p class="font-semibold text-xs leading-tight mb-1">
                {{ s.mata_kuliah }}
              </p>
              <div class="space-y-0.5">
                <p class="text-xs text-muted flex items-center gap-1">
                  <UIcon name="i-lucide-clock" class="text-xs" />
                  {{ s.jam_mulai.slice(0, 5) }} - {{ s.jam_selesai.slice(0, 5) }}
                </p>
                <p class="text-xs text-muted flex items-center gap-1">
                  <UIcon name="i-lucide-map-pin" class="text-xs" />
                  {{ s.ruangan }}
                </p>
                <p class="text-xs text-muted truncate">{{ s.dosen }}</p>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </div>

    <!-- Today View -->
    <div v-if="viewMode === 'day'">
      <div class="max-w-2xl mx-auto">
        <div class="flex items-center gap-2 mb-6">
          <UIcon name="i-lucide-calendar-check" class="text-primary text-xl" />
          <h2 class="text-lg font-semibold">
            {{ todayName }}, {{ new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) }}
          </h2>
        </div>

        <div v-if="todaySchedules.length === 0" class="text-center py-16">
          <UIcon name="i-lucide-party-popper" class="text-5xl text-muted mb-3" />
          <h3 class="font-semibold text-lg mb-1">Tidak ada kuliah hari ini!</h3>
          <p class="text-muted text-sm">Gunakan waktu luang untuk belajar atau istirahat 😊</p>
        </div>

        <div v-else class="space-y-4">
          <UCard
            v-for="(s, index) in todaySchedules"
            :key="s.id"
            class="card-hover relative"
            :style="blockStyle(s)"
          >
            <!-- Timeline connector -->
            <div v-if="index < todaySchedules.length - 1" class="absolute left-8 top-full w-0.5 h-4 bg-default/30" />
            <div class="flex items-start gap-4">
              <div
                class="accent w-14 h-14 rounded-xl flex flex-col items-center justify-center shrink-0"
                :style="{ '--accent': s.warna || '#6366f1' }"
              >
                <span class="text-xs font-bold">{{ s.jam_mulai.slice(0, 5) }}</span>
              </div>
              <div class="flex-1">
                <h3 class="font-bold text-base">{{ s.mata_kuliah }}</h3>
                <p class="text-sm text-muted">{{ s.dosen }}</p>
                <div class="flex flex-wrap items-center gap-3 mt-2">
                  <span class="text-xs text-muted flex items-center gap-1">
                    <UIcon name="i-lucide-clock" />
                    {{ s.jam_mulai.slice(0, 5) }} - {{ s.jam_selesai.slice(0, 5) }}
                  </span>
                  <span class="text-xs text-muted flex items-center gap-1">
                    <UIcon name="i-lucide-map-pin" />
                    {{ s.ruangan }}
                  </span>
                  <UBadge :label="`${s.sks} SKS`" variant="outline" size="xs" />
                  <UBadge :label="s.kode_mk || '-'" variant="outline" size="xs" />
                </div>
              </div>
            </div>
          </UCard>
        </div>
      </div>
    </div>
  </UContainer>
</template>
