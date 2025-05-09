<template>
  <div class="activity-container">
    <!-- 加载状态 -->
    <div v-if="loading" class="loading-container">
      <el-skeleton :rows="3" animated />
    </div>

    <!-- 空状态 -->
    <div v-else-if="activities.length === 0" class="empty-state">
      <el-empty description="您当前没有报名的活动">
        <el-button type="primary" @click="browseActivities">
          浏览活动
        </el-button>
      </el-empty>
    </div>

    <!-- 活动列表 -->
    <div v-else class="activity-list">
      <div
          v-for="activity in activities"
          :key="activity.id"

          class="activity-card"
      >
        <div class="card-header">
          <el-image
              :src="activity.cover"
              fit="cover"
              class="activity-cover"
          >
            <template #error>
              <div class="image-error">
                <el-icon :size="40"><Picture /></el-icon>
              </div>
            </template>
          </el-image>
          <el-tag
              :type="statusTagType(activity.status)"
              class="status-tag"
          >
            {{ activity.statusLabel }}
          </el-tag>
        </div>

        <div class="card-body">
          <h3 class="activity-title">{{ activity.title }}</h3>

          <div class="activity-info">
            <div class="info-item">
              <el-icon><Calendar /></el-icon>
              <span>活动时间：{{ formatDate(activity.time) }}</span>
            </div>
            <div class="info-item">
              <el-icon><Location /></el-icon>
              <span>活动地点：{{ activity.location }}</span>
            </div>
          </div>

          <div class="action-buttons">
            <el-button
                type="primary"
                size="small"
                @click="viewDetail(activity.id)"
            >
              查看详情
            </el-button>
            <el-button
                type="danger"
                size="small"
                :disabled="!canCancel(activity)"
                @click="cancelRegistration(activity)"
            >
              取消报名
            </el-button>
          </div>
        </div>
      </div>
    </div>

    <!-- 取消确认对话框 -->
    <el-dialog
        v-model="showCancelDialog"
        title="确认取消报名"
        width="400px"
    >
      <span>确定要取消报名该活动吗？</span>
      <template #footer>
        <el-button @click="showCancelDialog = false">取消</el-button>
        <el-button type="danger" @click="confirmCancel">
          确定取消
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import {
  Calendar,
  Location,
  Picture
} from '@element-plus/icons-vue'
import { formatDate } from '@/utils/date'
import { getActivities, cancelActivity } from '@/api/activity'
import { ElMessage } from "element-plus";
import router from "@/router/index.js";

const props = defineProps({
  userId: {
    type: String,
    required: true
  }
})

// 状态管理
const loading = ref(true)
const activities = ref([])
const showCancelDialog = ref(false)
const selectedActivity = ref(null)

// 获取活动数据
const fetchActivities = async () => {
  try {
    loading.value = true
    const response = await getActivities(props.userId)
    if (response.data.code === 401) {
      await router.push('/login')
      return
    }
    if (!response.data) {
      throw new Error('响应数据为空')
    }
    response.data = response.data.data.activities
    // 检查 response.data 是否为数组
    if (!Array.isArray(response.data)) {
      throw new Error('响应数据不是数组')
    }
    activities.value = response.data.map(item => ({
      ...item,
      statusLabel: getStatusLabel(item.status),
      canCancel: canCancel(item)
    }))
  } catch (error) {
    console.error(error)
    ElMessage.error('获取活动数据失败，请稍后再试')
  } finally {
    loading.value = false
  }
}

// 状态标签类型
const statusTagType = (status) => {
  const types = {
    registered: 'success',
    ongoing: 'primary',
    ended: 'info',
    cancelled: 'danger'
  }
  return types[status] || 'info'
}

// 状态显示文本
const getStatusLabel = (status) => {
  const labels = {
    registered: '已报名',
    ongoing: '进行中',
    ended: '已结束',
    cancelled: '已取消'
  }
  return labels[status] || '未知状态'
}

// 判断是否可以取消报名
const canCancel = (activity) => {
  return activity.status === 'registered'
}

// 取消报名操作
const cancelRegistration = (activity) => {
  selectedActivity.value = activity
  showCancelDialog.value = true
}

// 确认取消
const confirmCancel = async () => {
  try {
    if (!selectedActivity.value || !selectedActivity.value.id) {
      throw new Error('选中的活动无效')
    }
    await cancelActivity(selectedActivity.value.id)
    ElMessage.success('取消报名成功')
    await fetchActivities()
  } catch (error) {
    console.error(error)
    ElMessage.error('取消报名失败，请稍后再试')
  } finally {
    showCancelDialog.value = false
  }
}

// 查看详情
const viewDetail = (id) => {
  if (id) {
    router.push(`/working`)
  } else {
    ElMessage.error('活动ID无效')
  }
}

const browseActivities = () => {
  router.push(`/activitySignUp`)
}

// 初始化加载
onMounted(() => {
  fetchActivities()
})
</script>

<style scoped>
.activity-container {
  padding: 20px;
}

.loading-container {
  padding: 20px;
}

.empty-state {
  text-align: center;
  padding: 40px 0;
}

.activity-list {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.activity-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  overflow: hidden;
}

.card-header {
  position: relative;
  height: 180px;
}

.activity-cover {
  width: 100%;
  height: 100%;
}

.image-error {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: #f5f7fa;
}

.status-tag {
  position: absolute;
  top: 10px;
  right: 10px;
}

.card-body {
  padding: 16px;
}

.activity-title {
  margin: 0 0 12px;
  font-size: 16px;
  color: #303133;
}

.activity-info {
  margin-bottom: 16px;
}

.info-item {
  display: flex;
  align-items: center;
  margin-bottom: 8px;
  font-size: 14px;
  color: #606266;

  .el-icon {
    margin-right: 8px;
  }
}

.action-buttons {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}
</style>
