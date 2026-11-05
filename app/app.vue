<script setup lang="ts">
import { useSeoMeta } from '#app'
import { useEventListener } from '@vueuse/core'
import { useSearch } from '~/composables/useSearch'
useSeoMeta({
  title: 'Portal Magyasaka',
  description: 'Portal & Dashboard Magyasaka 2023. Akses jadwal kuliah, tugas, informasi anggota, galeri kegiatan, dan lebih banyak lagi.',
  ogTitle: 'Portal Magyasaka — Magyasaka',
  ogDescription: 'Portal & Dashboard Magyasaka 2023',
  twitterCard: 'summary_large_image'
})

const { isSearchOpen, openSearch, closeSearch, searchQuery, searchResults } = useSearch()

const navItems = [
  { label: 'Beranda', to: '/', icon: 'i-lucide-home' },
  { label: 'Jadwal', to: '/jadwal', icon: 'i-lucide-calendar' },
  { label: 'Tugas', to: '/tugas', icon: 'i-lucide-clipboard-list' },
  { label: 'Anggota', to: '/anggota', icon: 'i-lucide-users' },
  { label: 'Galeri', to: '/galeri', icon: 'i-lucide-image' },
  { label: 'Proyek', to: '/proyek', icon: 'i-lucide-folder-code' }
]

const categoryIcons: Record<string, string> = {
  jadwal: 'i-lucide-calendar',
  tugas: 'i-lucide-clipboard-list',
  anggota: 'i-lucide-user',
  pengumuman: 'i-lucide-megaphone',
  proyek: 'i-lucide-folder-code',
  galeri: 'i-lucide-image'
}

// Keyboard shortcut for search
if (import.meta.client) {
  useEventListener(document, 'keydown', (e: KeyboardEvent) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault()
      openSearch()
    }
    if (e.key === 'Escape') {
      closeSearch()
    }
  })
}
</script>

<template>
  <UApp>
    <!-- Header / Navbar -->
    <UHeader :ui="{ root: 'bg-default' }">
      <template #left>
        <NuxtLink
          to="/"
          class="flex items-center gap-2.5 focus-visible:outline-3 outline-primary/25 rounded-md p-1 -ms-1"
        >
          <MagyasakaCrest :size="30" class="text-highlighted" />
          <span class="font-display font-extrabold text-[17px] tracking-[-0.02em] leading-none">
            MAGYASAKA
          </span>
        </NuxtLink>

        <!-- Desktop Navigation -->
        <nav class="hidden lg:flex items-center gap-1 ml-6">
          <NuxtLink
            v-for="item in navItems"
            :key="item.to"
            :to="item.to"
            class="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-muted rounded-md transition-colors duration-200 hover:bg-elevated/60"
            active-class="text-primary!"
          >
            <UIcon :name="item.icon" class="text-base" />
            {{ item.label }}
          </NuxtLink>
        </nav>
      </template>

      <template #right>
        <!-- Search Button -->
        <UButton
          icon="i-lucide-search"
          color="neutral"
          variant="ghost"
          aria-label="Cari"
          @click="openSearch"
        >
          <template #trailing>
            <UKbd class="hidden sm:inline-flex">Cari</UKbd>
          </template>
        </UButton>

        <UColorModeButton />

        <UButton
          to="/login"
          icon="i-lucide-log-in"
          color="neutral"
          variant="ghost"
          aria-label="Login Pengurus"
          class="hidden sm:inline-flex"
        />
      </template>
    </UHeader>

    <!-- Main Content -->
    <UMain>
      <NuxtPage />
    </UMain>

    <!-- Search Modal -->
    <UModal v-model:open="isSearchOpen">
      <template #content>
        <div class="p-4">
          <div class="flex items-center gap-3 mb-4">
            <UIcon name="i-lucide-search" class="text-xl text-muted" />
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Cari jadwal, tugas, anggota, proyek..."
              class="w-full bg-transparent border-none outline-none text-lg placeholder:text-muted"
              autofocus
            >
            <UKbd>ESC</UKbd>
          </div>
          <USeparator />
          <div class="mt-4 max-h-96 overflow-y-auto">
            <div v-if="searchResults.length === 0 && searchQuery.length >= 2" class="text-center py-8 text-muted">
              <UIcon name="i-lucide-search-x" class="text-4xl mb-2" />
              <p>Tidak ditemukan hasil untuk "{{ searchQuery }}"</p>
            </div>
            <div v-else-if="searchQuery.length < 2 && searchQuery.length > 0" class="text-center py-8 text-muted">
              <p class="text-sm">Ketik minimal 2 karakter untuk mencari...</p>
            </div>
            <div v-else-if="searchQuery.length === 0" class="text-center py-8 text-muted">
              <UIcon name="i-lucide-sparkles" class="text-4xl mb-2" />
              <p class="text-sm">Mulai ketik untuk mencari...</p>
            </div>
            <NuxtLink
              v-for="result in searchResults"
              :key="result.title + result.category"
              :to="result.url"
              class="flex items-start gap-3 p-3 rounded-md transition-colors hover:bg-elevated/60 cursor-pointer"
              @click="closeSearch"
            >
              <UIcon :name="categoryIcons[result.category] || result.icon" class="text-xl mt-0.5 text-primary" />
              <div class="flex-1 min-w-0">
                <p class="font-medium text-sm truncate">{{ result.title }}</p>
                <p class="text-xs text-muted truncate">{{ result.description }}</p>
              </div>
              <UBadge :label="result.category" variant="subtle" size="xs" />
            </NuxtLink>
          </div>
        </div>
      </template>
    </UModal>

    <!-- Footer -->
    <footer class="border-t border-default mt-16">
      <UContainer class="py-10">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <div class="flex items-center gap-2.5 mb-3">
              <MagyasakaCrest :size="26" class="text-highlighted" />
              <span class="font-display font-extrabold text-base tracking-[-0.02em]">Magyasaka</span>
            </div>
            <p class="text-sm text-muted max-w-[46ch]">
              Portal & Dashboard Magyasaka 2023.
            </p>
          </div>
          <div>
            <h4 class="font-display font-semibold text-sm mb-3">Navigasi</h4>
            <div class="grid grid-cols-2 gap-1">
              <NuxtLink
                v-for="item in navItems"
                :key="item.to"
                :to="item.to"
                class="text-sm text-muted hover:text-primary transition-colors"
              >
                {{ item.label }}
              </NuxtLink>
            </div>
          </div>
          <div>
            <h4 class="font-display font-semibold text-sm mb-3">Pengurus</h4>
            <NuxtLink
              to="/login"
              class="text-sm text-muted hover:text-primary transition-colors"
            >
              Login Pengurus
            </NuxtLink>
          </div>
        </div>
        <USeparator class="my-8" />
        <p class="text-xs text-muted text-center">
          © {{ new Date().getFullYear() }} Magyasaka. Build by Admin.
        </p>
      </UContainer>
    </footer>
  </UApp>
</template>
