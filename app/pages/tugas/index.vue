<script setup lang="ts">
import { computed, ref } from 'vue'
import { useSeoMeta } from '#app'
import { useState } from '#imports'
import { useAssignments } from '~/composables/useData'
// Fase 2: Daftar Tugas & Ujian
useSeoMeta({ title: 'Tugas & Ujian - Magyasaka' })

const { data: assignments } = useAssignments()

const filterType = ref('semua')
const filterTypes = ['semua', 'tugas', 'UTS', 'UAS', 'TUBES', 'Praktikum']

// Local completion tracking (stored in browser)
const completedTasks = useState<Set<string>>('completedTasks', () => new Set())

if (import.meta.client) {
  const stored = localStorage.getItem('trk2023_completed_tasks')
  if (stored) {
    completedTasks.value = new Set(JSON.parse(stored))
  }
}

function toggleComplete(id: string) {
  const newSet = new Set(completedTasks.value)
  if (newSet.has(id)) {
    newSet.delete(id)
  } else {
    newSet.add(id)
  }
  completedTasks.value = newSet
  if (import.meta.client) {
    localStorage.setItem('trk2023_completed_tasks', JSON.stringify([...newSet]))
  }
}

const filteredAssignments = computed(() => {
  let items = (assignments.value || []) as any[]
  if (filterType.value !== 'semua') {
    items = items.filter((a: any) => a.tipe === filterType.value)
  }
  return items
})

const upcomingExams = computed(() =>
  assignments.value?.filter((a: any) => ['uts', 'uas'].includes(a.tipe) && (a.deadline || a.tanggal_ujian) && new Date(a.deadline || a.tanggal_ujian) > new Date()) || []
)

function formatDate(dateStr: string) {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  })
}

function daysUntil(dateStr: string) {
  if (!dateStr) return ''
  const diff = new Date(dateStr).getTime() - Date.now()
  const days = Math.ceil(diff / 86400000)
  if (days < 0) return 'Terlewat'
  if (days === 0) return 'Hari ini!'
  if (days === 1) return 'Besok'
  return `${days} hari lagi`
}

function deadlineColor(dateStr: string) {
  if (!dateStr) return 'neutral'
  const diff = new Date(dateStr).getTime() - Date.now()
  const days = Math.ceil(diff / 86400000)
  if (days < 0) return 'error'
  if (days <= 2) return 'error'
  if (days <= 7) return 'warning'
  return 'success'
}

const tipeIcon: Record<string, string> = {
  tugas: 'i-lucide-file-text',
  uts: 'i-lucide-file-warning',
  uas: 'i-lucide-file-warning',
  tubes: 'i-lucide-help-circle',
  praktikum: 'i-lucide-flask-conical'
}

const tipeColor: Record<string, string> = {
  tugas: '#6366f1',
  uts: '#f43f5e',
  uas: '#ef4444',
  tubes: '#f59e0b',
  praktikum: '#10b981'
}
</script>

<template>
  <UContainer class="py-8">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
      <div>
        <h1 class="text-2xl md:text-3xl font-bold flex items-center gap-2">
          <UIcon name="i-lucide-clipboard-list" class="text-primary" />
          Tugas & Ujian
        </h1>
        <p class="text-muted mt-1">
          {{ filteredAssignments.length }} item
          <span v-if="completedTasks.size > 0"> • {{ completedTasks.size }} selesai</span>
        </p>
      </div>
    </div>

    <!-- Pengingat Ujian -->
    <div v-if="upcomingExams.length > 0" class="mb-8">
      <div class="flex items-center gap-2 mb-4">
          <UIcon name="i-lucide-bell-ring" class="text-error text-xl" />
        <h2 class="text-lg font-semibold">Pengingat Ujian</h2>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
        <UCard
          v-for="exam in upcomingExams"
          :key="exam.id"
          class="card-hover"
        >
          <div class="flex items-center gap-3">
            <div class="w-12 h-12 rounded-xl bg-error/10 flex items-center justify-center shrink-0">
              <UIcon name="i-lucide-file-warning" class="text-2xl text-error" />
            </div>
            <div class="flex-1">
              <p class="font-bold text-sm">{{ exam.judul }}</p>
              <p class="text-xs text-muted">{{ exam.mata_kuliah }}</p>
              <div class="flex items-center gap-2 mt-1">
                <UBadge :label="daysUntil((exam.deadline || exam.tanggal_ujian) ?? '')" :color="deadlineColor((exam.deadline || exam.tanggal_ujian) ?? '')" variant="subtle" size="xs" />
                <span class="text-xs text-muted">{{ formatDate((exam.deadline || exam.tanggal_ujian) ?? '') }}</span>
              </div>
            </div>
          </div>
        </UCard>
      </div>
    </div>

    <!-- Filter -->
    <div class="flex gap-1 flex-wrap mb-6">
      <UButton
        v-for="type in filterTypes"
        :key="type"
        :label="type.charAt(0).toUpperCase() + type.slice(1)"
        :color="filterType === type ? 'primary' : 'neutral'"
        :variant="filterType === type ? 'solid' : 'ghost'"
        size="sm"
        @click="filterType = type"
      />
    </div>

    <!-- Daftar Tugas -->
    <div class="space-y-3">
      <UCard
        v-for="task in filteredAssignments"
        :key="task.id"
        :class="['card-hover transition-all', completedTasks.has(task.id) ? 'opacity-60' : '']"
      >
        <div class="flex items-start gap-3">
          <!-- Checkbox -->
          <button
            :class="[
              'w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all',
              completedTasks.has(task.id)
                ? 'bg-success border-success text-inverted'
                : 'border-default hover:border-primary'
            ]"
            @click="toggleComplete(task.id)"
          >
            <UIcon v-if="completedTasks.has(task.id)" name="i-lucide-check" class="text-sm" />
          </button>

          <!-- Icon -->
          <div
            class="accent w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
            :style="{ '--accent': tipeColor[task.tipe || 'tugas'] || '#6366f1' }"
          >
            <UIcon :name="tipeIcon[task.tipe || 'tugas'] || 'i-lucide-file-text'" class="text-lg" />
          </div>

          <!-- Content -->
          <div class="flex-1 min-w-0">
            <h2 :class="['font-semibold text-sm', completedTasks.has(task.id) ? 'line-through' : '']">
              {{ task.judul }}
            </h2>
            <p class="text-xs text-muted mt-0.5">{{ task.mata_kuliah }}</p>
            <p v-if="task.deskripsi" class="text-xs text-muted mt-1 line-clamp-2">{{ task.deskripsi }}</p>
            <div class="flex items-center gap-2 mt-2">
              <UBadge :label="task.tipe || 'Tugas'" variant="subtle" size="xs" />
              <span v-if="task.deadline" class="text-xs text-muted flex items-center gap-1">
                <UIcon name="i-lucide-clock" />
                {{ formatDate(task.deadline) }}
              </span>
            </div>
          </div>

          <!-- Deadline badge -->
          <UBadge
            v-if="task.deadline && !completedTasks.has(task.id)"
            :label="daysUntil(task.deadline)"
            :color="deadlineColor(task.deadline)"
            variant="subtle"
            size="xs"
            class="shrink-0"
          />
          <UBadge
            v-else-if="completedTasks.has(task.id)"
            label="Selesai ✓"
            color="success"
            variant="subtle"
            size="xs"
            class="shrink-0"
          />
        </div>
      </UCard>
    </div>

    <div v-if="filteredAssignments.length === 0" class="text-center py-16">
      <UIcon name="i-lucide-inbox" class="text-5xl text-muted mb-3" />
      <h2 class="font-semibold text-lg mb-1">Tidak ada tugas</h2>
      <p class="text-muted text-sm">Belum ada tugas untuk filter "{{ filterType }}"</p>
    </div>
  </UContainer>
</template>
