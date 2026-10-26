<script setup lang="ts">
const props = defineProps<{
  modelValue: boolean
}>()

const emit = defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'saved'): void
}>()

const { updateConfig } = useGoogleDrive()

const apiKey = ref('')
const folderId = ref('')
const isTesting = ref(false)
const testResult = ref<{
  success: boolean
  message: string
  isConnected: boolean
} | null>(null)

// Load existing config on mount
onMounted(async () => {
  try {
    const res = await updateConfig({})
    if (res.folderId) folderId.value = res.folderId
  } catch (e) {
    // ignore
  }
})

const handleSave = async () => {
  isTesting.value = true
  testResult.value = null

  try {
    const res = await updateConfig({
      apiKey: apiKey.value,
      folderId: folderId.value
    })

    if (res.isConnected) {
      testResult.value = {
        success: true,
        message: 'Berhasil terhubung ke Google Drive! Data media langsung dimuat dari Drive.',
        isConnected: true
      }
      emit('saved')
    } else if (res.apiKeyConfigured && res.folderIdConfigured) {
      testResult.value = {
        success: false,
        message: res.error || 'Gagal memvalidasi folder Google Drive. Pastikan Folder disetel "Anyone with the link can view".',
        isConnected: false
      }
    } else {
      testResult.value = {
        success: true,
        message: 'Pengaturan disimpan. Menggunakan arsip lokal/demo data HS15.',
        isConnected: false
      }
      emit('saved')
    }
  } catch (err: any) {
    testResult.value = {
      success: false,
      message: err.message || 'Terjadi kesalahan saat menghubungi server.',
      isConnected: false
    }
  } finally {
    isTesting.value = false
  }
}

const closeModal = () => {
  emit('update:modelValue', false)
}
</script>

<template>
  <div v-if="modelValue" class="modal modal-open">
    <div class="modal-box glass-panel border border-neutral-700 max-w-xl text-neutral-100 shadow-2xl relative">
      <!-- Close Button -->
      <button
        class="btn btn-sm btn-circle btn-ghost absolute right-3 top-3 text-neutral-400 hover:text-white"
        @click="closeModal"
      >
        ✕
      </button>

      <!-- Header -->
      <div class="flex items-center gap-3 mb-5">
        <div class="w-10 h-10 rounded-xl bg-crimson-500/20 text-crimson-400 flex items-center justify-center border border-crimson-500/30">
          <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
        </div>
        <div>
          <h3 class="font-bold text-lg text-white">Integrasi Google Drive API</h3>
          <p class="text-xs text-neutral-400">Atur kredensial Google Drive untuk memuat arsip foto dan video secara langsung.</p>
        </div>
      </div>

      <!-- Feedback Alert -->
      <div v-if="testResult" class="mb-4">
        <div
          class="alert text-sm py-2 px-3 shadow-md"
          :class="testResult.success ? 'alert-success bg-emerald-950/80 border-emerald-500/40 text-emerald-200' : 'alert-error bg-red-950/80 border-red-500/40 text-red-200'"
        >
          <span>{{ testResult.message }}</span>
        </div>
      </div>

      <!-- Form Inputs -->
      <div class="space-y-4 text-sm">
        <div>
          <label class="block font-medium text-neutral-300 mb-1">
            Google Drive Folder ID
          </label>
          <input
            v-model="folderId"
            type="text"
            placeholder="Contoh: 1a2B3c4D5e6F7g8H9i0J..."
            class="input input-bordered w-full bg-neutral-900/80 border-neutral-700 text-neutral-100 placeholder:text-neutral-500 focus:border-crimson-500 text-sm"
          >
          <p class="text-xs text-neutral-400 mt-1">
            Salin ID folder dari URL Google Drive Anda (bagian setelah <code>/folders/</code>).
          </p>
        </div>

        <div>
          <label class="block font-medium text-neutral-300 mb-1">
            Google Drive API Key
          </label>
          <input
            v-model="apiKey"
            type="password"
            placeholder="Contoh: AIzaSyA... (Google Cloud API Key)"
            class="input input-bordered w-full bg-neutral-900/80 border-neutral-700 text-neutral-100 placeholder:text-neutral-500 focus:border-crimson-500 text-sm font-mono"
          >
          <p class="text-xs text-neutral-400 mt-1">
            Buat API Key gratis di Google Cloud Console dengan mengaktifkan <strong>Google Drive API</strong>.
          </p>
        </div>

        <!-- Instructions Box -->
        <div class="p-3.5 rounded-xl bg-neutral-900/60 border border-neutral-800 text-xs text-neutral-300 space-y-1.5">
          <div class="font-semibold text-crimson-400 flex items-center gap-1.5">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Petunjuk Penggunaan:
          </div>
          <ol class="list-decimal list-inside space-y-1 pl-1 text-neutral-400">
            <li>Pastikan izin folder Google Drive diatur ke <strong>"Siapa saja yang memiliki link dapat melihat"</strong>.</li>
            <li>Jika dikosongkan, website akan secara otomatis menampilkan galeri arsip lokal bawaan komunitas HS15.</li>
            <li>Nilai konfigurasi ini juga dapat disimpan permanen pada berkas <code>.env</code> server.</li>
          </ol>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="modal-action mt-6 flex justify-between items-center">
        <span class="text-xs text-neutral-500">
          Status: <strong class="text-neutral-300">{{ folderId && apiKey ? 'Kredensial Siap' : 'Mode Arsip Lokal / Demo' }}</strong>
        </span>
        <div class="flex gap-2">
          <button type="button" class="btn btn-ghost btn-sm text-neutral-300" @click="closeModal">
            Batal
          </button>
          <button
            type="button"
            class="btn btn-primary btn-sm px-5"
            :disabled="isTesting"
            @click="handleSave"
          >
            <span v-if="isTesting" class="loading loading-spinner loading-xs" />
            <span>{{ isTesting ? 'Menghubungkan...' : 'Simpan & Terapkan' }}</span>
          </button>
        </div>
      </div>
    </div>
    <div class="modal-backdrop bg-black/60 backdrop-blur-sm" @click="closeModal" />
  </div>
</template>
