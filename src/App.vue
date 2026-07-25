<template>
  <div id="app" class="safe-area-top safe-area-bottom">
    <router-view />
    <GlobalAudio />
    <MiniPlayer />
  </div>
</template>

<script setup lang="ts">
import GlobalAudio from '@/components/GlobalAudio.vue'
import MiniPlayer from '@/components/MiniPlayer.vue'
</script>

<style>
#app {
  width: 100%;
  max-width: 100%;
  margin: 0;
  padding: 0;
}
</style>