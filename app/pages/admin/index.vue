<script setup lang="ts">
import { computed } from 'vue'
import { useSeoMeta } from '#app'

declare const definePageMeta: (meta: any) => void

definePageMeta({
  middleware: 'auth'
})

useSeoMeta({ title: 'Dashboard Admin - Magyasaka' })

const { data: members, status: membersStatus } = useMembers()
const { data: schedules } = useSchedules()
const { activeSemester: latestSemester } = useActiveSemester()
const { data: assignments } = useAssignments()
const { data: announcements } = useAnnouncements()

// Semester 7 = periode Magang Kerja (MBKM), tidak ada jadwal kuliah reguler.
const activeSchedules = computed(() =>
  (schedules.value || []).filter((s: any) => s.semester_id === latestSemester.value?.id)
)

const stats = computed(() => [
  { label: 'Anggota', value: members.value?.length ?? 0, to: '/admin/anggota', icon: 'i-lucide-users', color: '#6366f1', loading: membersStatus.value === 'pending' },
  { label: 'Jadwal', value: activeSchedules.value.length, to: '/admin/jadwal', icon: 'i-lucide-calendar', color: '#0ea5e9', loading: false },
  { label: 'Tugas & Ujian', value: assignments.value?.length ?? 0, to: '/admin/tugas', icon: 'i-lucide-clipboard-list', color: '#f59e0b', loading: false },
  { label: 'Pengumuman', value: announcements.value?.length ?? 0, to: '/admin/pengumuman', icon: 'i-lucide-megaphone', color: '#10b981', loading: false }
])

// Tugas/ujian yang belum selesai, urut tenggat terdekat (deadline untuk tugas, tanggal_ujian untuk ujian).
const upcoming = computed(() =>
  (assignments.value || [])
    .filter((a: any) => !a.is_completed && (a.deadline || a.tanggal_ujian))
    .sort((a: any, b: any) => new Date(a.deadline || a.tanggal_ujian).getTime() - new Date(b.deadline || b.tanggal_ujian).getTime())
    .slice(0, 3)
)

const today = new Date().toLocaleDateString('id-ID', { weekday: 'long' })
const todaySchedules = computed(() => activeSchedules.value.filter((s: any) => s.hari === today))

function formatDateTime(value: string | null | undefined) {
  if (!value) return '-'
  return new Date(value).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })
}
</script>

<template>
  <div class="space-y-4">
    <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
      <NuxtLink
        v-for="s in stats"
        :key="s.label"
        :to="s.to"
        class="card-hover flex items-center gap-3 rounded-xl border border-default/30 bg-elevated/40 p-3 hover:bg-elevated/80"
      >
        <div
          class="accent w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          :style="{ '--accent': s.color }"
        >
          <UIcon :name="s.icon" class="text-lg" />
        </div>
        <div class="min-w-0">
          <p class="font-display text-2xl font-bold leading-none tabular-nums">{{ s.loading ? '…' : s.value }}</p>
          <p class="text-xs text-muted truncate mt-1">{{ s.label }}</p>
        </div>
      </NuxtLink>
    </div>

    <div class="grid lg:grid-cols-2 gap-4">
      <UCard>
        <template #header>
          <div class="flex items-center justify-between gap-2">
            <h2 class="font-semibold flex items-center gap-2">
              <UIcon name="i-lucide-alarm-clock" class="text-primary" />
              Tenggat Terdekat
            </h2>
            <UButton to="/admin/tugas" label="Kelola" variant="ghost" color="neutral" size="xs" />
          </div>
        </template>
        <div v-if="upcoming.length" class="space-y-3">
          <div v-for="a in upcoming" :key="a.id" class="flex items-start justify-between gap-3 text-sm">
            <div class="min-w-0">
              <p class="font-medium truncate">{{ a.judul }}</p>
              <p class="text-xs text-muted truncate">{{ a.mata_kuliah }}</p>
            </div>
            <span class="text-xs text-muted whitespace-nowrap">{{ formatDateTime(a.deadline || a.tanggal_ujian) }}</span>
          </div>
        </div>
        <p v-else class="text-sm text-muted">Tidak ada tugas atau ujian yang mendatang.</p>
      </UCard>

      <UCard>
        <template #header>
          <div class="flex items-center justify-between gap-2">
            <div>
              <h2 class="font-semibold flex items-center gap-2">
                <UIcon name="i-lucide-calendar-clock" class="text-primary" />
                Jadwal Hari {{ today }}
              </h2>
              <p v-if="latestSemester" class="text-xs text-muted mt-0.5">
                {{ latestSemester.nomor === 7 ? 'Semester 7 · Magang Kerja' : semesterLabel(latestSemester) }}
              </p>
            </div>
            <UButton to="/admin/jadwal" label="Kelola" variant="ghost" color="neutral" size="xs" />
          </div>
        </template>
        <div v-if="todaySchedules.length" class="space-y-2">
          <div v-for="s in todaySchedules" :key="s.id" class="flex items-center gap-3 text-sm">
            <span class="w-1 self-stretch rounded-full shrink-0" :style="{ backgroundColor: s.warna }" />
            <div class="min-w-0 flex-1">
              <p class="font-medium truncate">{{ s.mata_kuliah }}</p>
              <p class="text-xs text-muted truncate">{{ s.ruangan }}</p>
            </div>
            <span class="text-xs text-muted whitespace-nowrap">{{ s.jam_mulai.slice(0, 5) }} - {{ s.jam_selesai.slice(0, 5) }}</span>
          </div>
        </div>
        <p v-else class="text-sm text-muted">
          {{ latestSemester?.nomor === 7 ? 'Semester ini periode magang, tidak ada jadwal kuliah.' : 'Tidak ada kuliah hari ini.' }}
        </p>
      </UCard>
    </div>
  </div>
</template>
