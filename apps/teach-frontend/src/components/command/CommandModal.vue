<script setup lang="ts">
import { NModal } from 'naive-ui'
import { watch } from 'vue'
import { resetSearch } from './search'
import CommandBody from './CommandModalBody.vue'
import { showCommandModal, useCommandModal } from './commandModal'

const { registerKeyboardShortcut } = useCommandModal()

registerKeyboardShortcut()

watch(() => showCommandModal.value, (v) => {
  if (!v)
    resetSearch()
})
</script>

<template>
  <NModal v-model:show="showCommandModal" display-directive="show">
    <CommandBody />
  </NModal>
</template>

<style scoped></style>
