<script setup lang="ts">
import { useSeoMeta } from '#app'
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useSupabaseClient, useSupabaseUser } from '#imports'
// Fase 4: Login Pengurus
useSeoMeta({ title: 'Login Pengurus — Magyasaka' })

const supabase = useSupabaseClient()
const user = useSupabaseUser()
const router = useRouter()

const email = ref('')
const password = ref('')
const loading = ref(false)
const errorMsg = ref('')

// Redirect if already logged in
watch(user, (val: any) => {
  if (val) {
    router.push('/admin')
  }
}, { immediate: true })

async function handleLogin() {
  loading.value = true
  errorMsg.value = ''

  try {
    const { error } = await supabase.auth.signInWithPassword({
      email: email.value,
      password: password.value
    })

    if (error) {
      errorMsg.value = error.message === 'Invalid login credentials'
        ? 'Email atau password salah. Pastikan akun sudah terdaftar di Supabase.'
        : error.message
    } else {
      router.push('/admin')
    }
  } catch (e: any) {
    errorMsg.value = 'Terjadi kesalahan. Pastikan koneksi ke Supabase sudah dikonfigurasi.'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="min-h-[80vh] flex items-center justify-center px-4">
    <div class="w-full max-w-md">
      <UCard class="shadow-lg">
        <!-- Header -->
        <div class="text-center mb-6">
          <MagyasakaCrest :size="72" class="mx-auto mb-5 text-highlighted" />
          <h1 class="font-display text-2xl font-bold tracking-[-0.02em]">Login Pengurus</h1>
          <p class="text-sm text-muted mt-1">Masuk ke panel admin Magyasaka</p>
        </div>

        <!-- Error -->
        <UAlert
          v-if="errorMsg"
          :description="errorMsg"
          color="error"
          icon="i-lucide-alert-circle"
          class="mb-4"
        />

        <!-- Form -->
        <form @submit.prevent="handleLogin" class="space-y-4">
          <div>
            <label class="text-sm font-medium mb-1.5 block">Email</label>
            <UInput
              v-model="email"
              type="email"
              placeholder="pengurus@example.com"
              icon="i-lucide-mail"
              required
              size="md"
              class="w-full"
            />
          </div>
          <div>
            <label class="text-sm font-medium mb-1.5 block">Password</label>
            <UInput
              v-model="password"
              type="password"
              placeholder="••••••••"
              icon="i-lucide-lock"
              required
              size="md"
              class="w-full"
            />
          </div>
          <UButton
            type="submit"
            label="Masuk"
            icon="i-lucide-log-in"
            :loading="loading"
            block
            size="lg"
          />
        </form>

        <USeparator class="my-6" label="Info" />

        <div class="text-center">
          <p class="text-xs text-muted">
            Hanya pengurus kelas yang memiliki akun bisa login.
            <br />Hubungi admin jika butuh akses.
          </p>
        </div>
      </UCard>
    </div>
  </div>
</template>
