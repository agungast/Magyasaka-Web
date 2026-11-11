<script setup lang="ts">
import { semesterLabel } from '~/composables/useData'

interface Semester {
  nomor: number
  tipe: string
  tahun_ajaran: string
}

defineProps<{ semester: Semester | null }>()
</script>

<template>
  <div class="hero-enter">
    <!-- Kartu utama -->
    <UCard class="overflow-hidden text-center border-primary/20 relative">
      <!-- Glow dekoratif di bagian atas -->
      <div class="pointer-events-none absolute inset-x-0 -top-24 h-48 bg-linear-to-b from-primary/10 to-transparent blur-2xl" />

      <div class="relative py-10 px-6">
        <!-- Badge ikon -->
        <div class="inline-flex items-center justify-center w-20 h-20 rounded-full bg-linear-to-br from-primary/20 to-primary/5 ring-1 ring-primary/20 mb-5">
          <UIcon name="i-lucide-graduation-cap" class="text-4xl text-primary" />
        </div>

        <h2 class="text-2xl md:text-3xl font-bold mb-2">
          Selamat Melakukan Internship!
        </h2>
        <p v-if="semester" class="text-sm font-medium text-primary mb-4">
          {{ semesterLabel(semester) }}
        </p>
        <p class="text-sm text-muted max-w-md mx-auto leading-relaxed">
          Semester 7 adalah periode
          <span class="font-medium text-default">Magang Kerja</span>.
          Tidak ada jadwal perkuliahan reguler waktumu sepenuhnya untuk pengalaman magang.
          Semoga berkah, lancar, dan membawa banyak ilmu serta jaringan baru!
        </p>

        <!-- Status badge: periode magang aktif -->
        <div class="mt-6">
          <span
            class="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 px-3 py-1 text-xs font-medium ring-1 ring-emerald-500/20"
          >
            <span class="relative flex h-1.5 w-1.5">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span class="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500" />
            </span>
            Periode Magang Aktif
          </span>
        </div>
      </div>
    </UCard>

    <!-- Kartu informasi -->
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
      <UCard class="card-hover">
        <div class="flex items-start gap-3">
          <div class="shrink-0 w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <UIcon name="i-lucide-target" class="text-lg" />
          </div>
          <div>
            <h3 class="font-semibold text-sm">Fokus Magang</h3>
            <p class="text-xs text-muted mt-1 leading-relaxed">
              Waktu penuh untuk pengalaman langsung di dunia kerja.
            </p>
          </div>
        </div>
      </UCard>

      <UCard class="card-hover">
        <div class="flex items-start gap-3">
          <div class="shrink-0 w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <UIcon name="i-lucide-clipboard-list" class="text-lg" />
          </div>
          <div>
            <h3 class="font-semibold text-sm">Logbook &amp; Laporan</h3>
            <p class="text-xs text-muted mt-1 leading-relaxed">
              Catat aktivitas harian dan susun laporan akhir tepat waktu.
            </p>
          </div>
        </div>
      </UCard>

      <UCard class="card-hover">
        <div class="flex items-start gap-3">
          <div class="shrink-0 w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
            <UIcon name="i-lucide-handshake" class="text-lg" />
          </div>
          <div>
            <h3 class="font-semibold text-sm">Jaringan Profesional</h3>
            <p class="text-xs text-muted mt-1 leading-relaxed">
              Bangun relasi &amp; portofolio sebagai bekal masa depan.
            </p>
          </div>
        </div>
      </UCard>
    </div>
  </div>
</template>
