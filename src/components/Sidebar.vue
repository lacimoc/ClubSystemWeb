<!-- components/Sidebar.vue -->
<template>
  <el-menu
      router
      :default-active="activeMenu"
      :collapse="sidebar.collapse"
      class="sidebar-menu"
      background-color="#304156"
      text-color="#bfcbd9"
      active-text-color="#409EFF"
  >
    <div class="logo">{{ sidebar.collapse ? '★' : '计算机协会' }}</div>

    <template v-for="route in routes" :key="route.path">
      <el-menu-item
          :index="route.path"
          @click="handleMenuItemClick(route.path)"
      >
        <el-icon><component :is="route.meta.icon" /></el-icon>
        <template #title>{{ route.meta.title }}</template>
      </el-menu-item>
    </template>
  </el-menu>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSidebarStore } from '@/store/sidebar'

const router = useRouter()
const route = useRoute()
const sidebar = useSidebarStore()

const routes = computed(() =>
    router.getRoutes().filter(r => r.meta?.title && !r.meta.hidden)
)

const activeMenu = computed(() => route.path)

const handleMenuItemClick = (path) => {
  router.push(path)
}
</script>

<style scoped>
.sidebar-menu {
  height: 100vh;
  transition: width 0.3s;

  .el-menu-item {
    min-width: 200px;
    padding: 0 20px !important;
  }
}

.logo {
  height: 60px;
  line-height: 60px;
  text-align: center;
  color: #fff;
  font-size: 18px;
  background-color: #2b2f3a;
}
</style>