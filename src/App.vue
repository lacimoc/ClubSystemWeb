<template>
  <div class="app-container">
    <Sidebar />
    <div class="main-container">
      <Navbar />
      <div class="app-main">
        <router-view v-slot="{ Component }">
          <component :is="Component" />
        </router-view>
      </div>
    </div>
  </div>
</template>

<script setup>
import Sidebar from '@/components/Sidebar.vue'
import Navbar from '@/components/Navbar.vue'
</script>

<style lang="scss">
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body, #app {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.app-container {
  display: flex;
  width: 100vw;
  height: 100vh;
  background: #f0f2f5;

  .main-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    min-width: 0;

    .app-main {
      flex: 1;
      padding: 20px;
      overflow: auto;
      position: relative;
    }
  }
}
</style>