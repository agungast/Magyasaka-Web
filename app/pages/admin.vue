<script setup lang="ts">
import { useSeoMeta } from '#app'
import { useRouter } from 'vue-router'
import { useSupabaseClient, useSupabaseUser } from '#imports'

declare const definePageMeta: (meta: any) => void

definePageMeta({
  middleware: 'auth'
})

useSeoMeta({ title: 'Admin Dashboard — Magyasaka' })

const user = useSupabaseUser()
const supabase = useSupabaseClient()
const router = useRouter()

async function logout() {
  await supabase.auth.signOut()
  router.push('/')
}

const menuItems = [
  { label: 'Dashboard', to: '/admin', icon: 'i-lucide-layout-dashboard' },
  { label: 'Pengumuman', to: '/admin/pengumuman', icon: 'i-lucide-megaphone' },
  { label: 'Jadwal', to: '/admin/jadwal', icon: 'i-lucide-calendar' },
  { label: 'Tugas & Ujian', to: '/admin/tugas', icon: 'i-lucide-clipboard-list' },
  { label: 'Anggota', to: '/admin/anggota', icon: 'i-lucide-users' },
  { label: 'Pengurus', to: '/admin/pengurus', icon: 'i-lucide-shield' },
  { label: 'Galeri', to: '/admin/galeri', icon: 'i-lucide-image' },
  { label: 'Semester', to: '/admin/semester', icon: 'i-lucide-calendar-days' },
  { label: 'Proyek', to: '/admin/proyek', icon: 'i-lucide-folder-code' }
]
</script>

<template>
  <UContainer class="py-8">
    <div class="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
      <div>
        <h1 class="font-display text-2xl md:text-3xl font-bold tracking-[-0.02em] flex items-center gap-3">
          <MagyasakaCrest :size="32" class="text-highlighted" />
          Panel Admin
        </h1>
        <p class="text-muted mt-1">Kelola konten Portal Magyasaka</p>
        <p v-if="user?.email" class="text-xs text-muted mt-1">Login sebagai {{ user.email }}</p>
      </div>
      <UButton label="Keluar" icon="i-lucide-log-out" variant="outline" @click="logout" />
    </div>

    <nav class="grid sm:grid-cols-2 lg:grid-cols-3 gap-x-10 divide-y divide-default mb-8">
      <NuxtLink
        v-for="item in menuItems"
        :key="item.to"
        :to="item.to"
        class="group flex items-center gap-3 py-3.5"
      >
        <UIcon :name="item.icon" class="text-lg text-muted group-hover:text-primary transition-colors shrink-0" />
        <span class="font-display font-semibold text-sm group-hover:text-primary transition-colors">{{ item.label }}</span>
        <UIcon name="i-lucide-arrow-right" class="text-muted ml-auto group-hover:text-primary transition-colors" />
      </NuxtLink>
    </nav>

    <NuxtPage />
  </UContainer>
</template>
