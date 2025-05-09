<script>
import { Expand, Fold } from '@element-plus/icons-vue'
import { useSidebarStore } from '@/store/sidebar'
import axios from 'axios';
import { ref } from 'vue';
import router from "@/router/index.js";

export default {
  name: 'Navbar',
  components: { Fold, Expand },
  setup() {
    const sidebarStore = useSidebarStore();
    const name = ref('data-date');
    const username = ref('未知用户');

    const toggleSidebar = () => {
      sidebarStore.toggleCollapse();
    };

    const fetchUserInfo = async () => {
      try {
        const responseData = await axios.get('https://home.icuhome.space:12007/api/getUserInfo', {headers: {"Authorization": `Bearer ${localStorage.getItem("token")}`}});
        const data = responseData.data;
        if (data.code === 200) {
          username.value = data.data.name;
        } else {
          await router.push('/login');
        }
      } catch (error) {
        console.error('请求失败:', error);
      }
    };

    const logout = () => {
      localStorage.removeItem("token");
      router.push('/login');
    }

    const personalCenter = () => {
      router.push('/working');
    }

    fetchUserInfo();

    return {
      sidebarStore,
      name,
      username,
      toggleSidebar,
      logout,
      personalCenter,
    };
  }
}
</script>

<style scoped>
.navbar {
  height: 60px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px;
  background: #fff;
  box-shadow: 0 1px 4px rgba(0, 21, 41, 0.08);
}

.hamburger {
  cursor: pointer;
  transition: all 0.3s;

  &:hover {
    color: var(--el-color-primary);
  }
}

.user-info {
  display: flex;
  align-items: center;
  cursor: pointer;
}

.username {
  margin-left: 8px;
  font-size: 14px;
}
</style>

<template>
  <div class="navbar">
    <div class="hamburger" @click="toggleSidebar">
      <el-icon :size="20">
        <Expand v-if="sidebarStore.collapse" />
        <Fold v-else />
      </el-icon>
    </div>

    <div class="right-menu">
      <el-dropdown>
        <span class="user-info">
          <el-avatar :size="30" src="https://cube.elemecdn.com/3/7c/3ea6beec64369c2642b92c6726f1epng.png" />
          <span class="username">{{ username }}</span>
        </span>
        <template #dropdown>
          <el-dropdown-menu>
            <el-dropdown-item @click="personalCenter">个人中心</el-dropdown-item>
            <el-dropdown-item divided @click="logout">退出登录</el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </div>
</template>
