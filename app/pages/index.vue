<script setup lang="ts">
import { computed } from 'vue'
import { useAnnouncements, useAssignments, useSchedules } from '~/composables/useData'
// Fase 1: Beranda Angkatan
const { data: announcements } = useAnnouncements()
const { data: assignments } = useAssignments()
const { data: schedules } = useSchedules()

const pinnedAnnouncements = computed(() =>
  announcements.value?.filter((a: any) => a.is_pinned) || []
)

const latestAnnouncements = computed(() =>
  announcements.value?.slice(0, 5) || []
)

const upcomingAssignments = computed(() => {
  return assignments.value
    ?.filter((a: any) => !a.is_completed && (a.deadline || a.tanggal_ujian) && new Date(a.deadline || a.tanggal_ujian) > new Date())
    .slice(0, 3) || []
})

const todaySchedule = computed(() => {
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', ]
  const today = days[new Date().getDay()]
  return schedules.value?.filter((s: any) => s.hari === today) || []
})

const quickLinks = [
  { label: 'Jadwal Kuliah', icon: 'i-lucide-calendar', to: '/jadwal', desc: 'Lihat jadwal mingguan' },
  { label: 'Tugas & Ujian', icon: 'i-lucide-clipboard-list', to: '/tugas', desc: 'Cek deadline tugas' },
  { label: 'Data Anggota', icon: 'i-lucide-users', to: '/anggota', desc: 'Cari teman sekelas' },
  { label: 'Galeri Foto', icon: 'i-lucide-image', to: '/galeri', desc: 'Kenangan bersama' },
  { label: 'Proyek Kelas', icon: 'i-lucide-folder-code', to: '/proyek', desc: 'Karya angkatan' },
  { label: 'Pengurus', icon: 'i-lucide-shield', to: '/anggota/pengurus', desc: 'Struktur organisasi' }
]

function formatDate(dateStr?: string | null) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

function daysUntil(dateStr?: string | null) {
  if (!dateStr) return 'Tanpa tenggat'
  const diff = new Date(dateStr).getTime() - Date.now()
  const days = Math.ceil(diff / 86400000)
  if (days === 0) return 'Hari ini'
  if (days === 1) return 'Besok'
  return `${days} hari lagi`
}

const kategoriColor: Record<string, 'error' | 'info' | 'success' | 'neutral'> = {
  penting: 'error',
  akademik: 'info',
  kegiatan: 'success',
  umum: 'neutral'
}
</script>

<template>
  <div>
    <!-- Hero Section -->
    <section class="hero-plate dark relative isolate overflow-hidden text-white">
      <UContainer class="relative py-16 md:py-24">
        <div class="grid gap-12 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
          <div class="hero-enter">
            <h1 class="font-display text-[2.75rem] md:text-6xl lg:text-7xl font-extrabold tracking-[-0.035em] leading-[1.02] text-balance">
              Portal Kelas<br>
              <span class="text-azure-300">MAGYASAKA</span>
            </h1>
            <p class="mt-6 text-lg text-ink-200 leading-relaxed max-w-[58ch]">
              Akses informasi akademik, jadwal kuliah, tugas, dan semua yang kamu butuhkan dalam satu tempat.
            </p>
            <div class="mt-8 flex flex-wrap gap-3">
              <UButton
                to="/jadwal"
                label="Lihat Jadwal"
                icon="i-lucide-calendar"
                size="lg"
                color="primary"
                variant="solid"
              />
              <UButton
                to="/anggota"
                label="Data Anggota"
                icon="i-lucide-users"
                size="lg"
                color="neutral"
                variant="outline"
                class="text-white ring-white/30 hover:bg-white/10"
              />
            </div>
          </div>

          <figure class="order-first lg:order-last flex flex-col items-center gap-4">
            <MagyasakaCrest :size="200" class="text-white" />
            <figcaption class="text-xs uppercase tracking-[0.2em] text-ink-300 text-center leading-relaxed max-w-60">
              MAHASISWA TEKNOLOGI REKAYASA KOMPUTER A<br>ANGKATAN 2023
            </figcaption>
          </figure>
        </div>
      </UContainer>
    </section>

    <UContainer class="py-14">
      <!-- Sorotan Angkatan (Pinned) -->
      <section v-if="pinnedAnnouncements.length" class="mb-14">
        <div class="flex items-center gap-2 mb-5">
          <UIcon name="i-lucide-pin" class="text-primary text-lg" />
          <h2 class="font-display text-xl md:text-2xl font-bold tracking-[-0.02em]">Sorotan Angkatan</h2>
        </div>
        <div class="divide-y divide-default">
          <article
            v-for="announcement in pinnedAnnouncements"
            :key="announcement.id"
            class="py-5 flex items-start gap-4"
          >
            <UIcon name="i-lucide-pin" class="text-primary text-base mt-1 shrink-0" />
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2 mb-1.5">
                <UBadge
                  :label="announcement.kategori || 'umum'"
                  :color="kategoriColor[announcement.kategori || 'umum'] || 'neutral'"
                  variant="outline"
                  size="sm"
                />
                <span class="text-xs text-muted">{{ formatDate(announcement.created_at) }}</span>
              </div>
              <h3 class="font-display font-semibold text-base">{{ announcement.judul }}</h3>
              <p class="text-sm text-muted mt-1 line-clamp-2">{{ announcement.konten }}</p>
              <p class="text-xs text-muted mt-2">— {{ announcement.penulis }}</p>
            </div>
          </article>
        </div>
      </section>

      <!-- Pintasan Menu / Quick Links -->
      <section class="mb-14">
        <div class="flex items-center gap-2 mb-5">
          <UIcon name="i-lucide-zap" class="text-primary text-lg" />
          <h2 class="font-display text-xl md:text-2xl font-bold tracking-[-0.02em]">Pintasan Menu</h2>
        </div>
        <div class="grid sm:grid-cols-2 gap-x-12 divide-y divide-default">
          <NuxtLink
            v-for="link in quickLinks"
            :key="link.to"
            :to="link.to"
            class="group flex items-center gap-4 py-4 transition-colors"
          >
            <UIcon :name="link.icon" class="text-xl text-muted group-hover:text-primary transition-colors shrink-0" />
            <div class="min-w-0 flex-1">
              <p class="font-display font-semibold text-[15px] group-hover:text-primary transition-colors">{{ link.label }}</p>
              <p class="text-sm text-muted truncate">{{ link.desc }}</p>
            </div>
            <UIcon
              name="i-lucide-arrow-right"
              class="text-muted shrink-0 transition-all group-hover:text-primary group-hover:translate-x-0.5"
            />
          </NuxtLink>
        </div>
      </section>

      <!-- Grid: Jadwal Hari Ini + Tugas Mendatang -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-10 mb-14">
        <!-- Jadwal Hari Ini -->
        <section>
          <div class="flex items-center justify-between gap-4 mb-5">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-clock" class="text-primary text-lg" />
              <h2 class="font-display text-xl font-bold tracking-[-0.02em]">Jadwal Hari Ini</h2>
            </div>
            <UButton to="/jadwal" label="Semua" variant="link" trailing-icon="i-lucide-arrow-right" size="sm" />
          </div>
          <div v-if="todaySchedule.length === 0" class="text-center py-10 border-y border-default">
            <UIcon name="i-lucide-party-popper" class="text-3xl text-muted mb-2" />
            <p class="text-muted text-sm">Tidak ada kuliah hari ini.</p>
          </div>
          <div v-else class="divide-y divide-default">
            <div
              v-for="schedule in todaySchedule"
              :key="schedule.id"
              class="py-3.5 flex items-center gap-4"
            >
              <div
                :style="{ '--accent': schedule.warna || '#6366f1' }"
                class="accent w-10 h-10 rounded-md flex items-center justify-center shrink-0"
              >
                <UIcon name="i-lucide-book-open" class="text-lg" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-sm truncate">{{ schedule.mata_kuliah }}</p>
                <p class="text-xs text-muted font-mono tabular-nums">{{ schedule.jam_mulai.slice(0, 5) }} - {{ schedule.jam_selesai.slice(0, 5) }} • {{ schedule.ruangan }}</p>
              </div>
            </div>
          </div>
        </section>

        <!-- Tugas Mendatang -->
        <section>
          <div class="flex items-center justify-between gap-4 mb-5">
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-alert-circle" class="text-primary text-lg" />
              <h2 class="font-display text-xl font-bold tracking-[-0.02em]">Tugas Mendatang</h2>
            </div>
            <UButton to="/tugas" label="Semua" variant="link" trailing-icon="i-lucide-arrow-right" size="sm" />
          </div>
          <div v-if="upcomingAssignments.length === 0" class="text-center py-10 border-y border-default">
            <UIcon name="i-lucide-check-circle-2" class="text-3xl text-muted mb-2" />
            <p class="text-muted text-sm">Semua tugas sudah selesai.</p>
          </div>
          <div v-else class="divide-y divide-default">
            <div
              v-for="task in upcomingAssignments"
              :key="task.id"
              class="py-3.5 flex items-center gap-4"
            >
              <div class="accent w-10 h-10 rounded-md flex items-center justify-center shrink-0" :style="{ '--accent': 'var(--ui-color-warning-500)' }">
                <UIcon name="i-lucide-file-text" class="text-lg" />
              </div>
              <div class="flex-1 min-w-0">
                <p class="font-semibold text-sm truncate">{{ task.judul }}</p>
                <p class="text-xs text-muted">{{ task.mata_kuliah }}</p>
              </div>
              <UBadge :label="daysUntil(task.deadline)" color="warning" variant="outline" size="sm" />
            </div>
          </div>
        </section>
      </div>

      <!-- Sambutan Kelas / Semua Pengumuman -->
      <section>
        <div class="flex items-center gap-2 mb-5">
          <UIcon name="i-lucide-megaphone" class="text-primary text-lg" />
          <h2 class="font-display text-xl md:text-2xl font-bold tracking-[-0.02em]">Pengumuman Terbaru</h2>
        </div>
        <div class="divide-y divide-default">
          <article
            v-for="announcement in latestAnnouncements"
            :key="announcement.id"
            class="py-5 flex items-start gap-4"
          >
            <div class="accent w-10 h-10 rounded-md flex items-center justify-center shrink-0" :style="{ '--accent': 'var(--ui-color-primary)' }">
              <UIcon name="i-lucide-megaphone" class="text-lg" />
            </div>
            <div class="min-w-0 flex-1">
              <div class="flex flex-wrap items-center gap-2 mb-1">
                <h3 class="font-display font-semibold text-sm">{{ announcement.judul }}</h3>
                <span v-if="announcement.is_pinned" class="text-primary inline-flex items-center">
                  <UIcon name="i-lucide-pin" class="text-sm" />
                  <span class="sr-only">Disematkan</span>
                </span>
              </div>
              <p class="text-sm text-muted line-clamp-2">{{ announcement.konten }}</p>
              <div class="flex flex-wrap items-center gap-3 mt-2">
                <UBadge
                  :label="announcement.kategori || 'umum'"
                  :color="kategoriColor[announcement.kategori || 'umum'] || 'neutral'"
                  variant="outline"
                  size="sm"
                />
                <span class="text-xs text-muted">{{ formatDate(announcement.created_at) }} • {{ announcement.penulis }}</span>
              </div>
            </div>
          </article>
        </div>
      </section>
    </UContainer>
  </div>
</template>
