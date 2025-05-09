<template>
  <div class="activity-list-container">
    <!-- 搜索和筛选 -->
    <div class="filter-section">
      <el-input
          v-model="searchKeyword"
          placeholder="搜索活动"
          class="search-input"
          clearable
          @change="handleSearch"
      >
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>

      <el-select
          v-model="filterStatus"
          placeholder="活动状态"
          class="status-filter"
          clearable
          @change="handleFilterChange"
      >
        <el-option
            v-for="item in statusOptions"
            :key="item.value"
            :label="item.label"
            :value="item.value"
        />
      </el-select>

      <el-date-picker
          v-model="dateRange"
          type="daterange"
          range-separator="至"
          start-placeholder="开始日期"
          end-placeholder="结束日期"
          @change="handleDateChange"
      />
    </div>

    <!-- 活动列表 -->
    <div v-loading="loading" class="activity-grid">
      <!-- 空状态 -->
      <el-empty
          v-if="!loading && activities.length === 0"
          description="暂无相关活动"
      />

      <!-- 活动卡片 -->
      <div
          v-for="activity in paginatedActivities"
          :key="activity.id"
          class="activity-card"
      >
        <el-card shadow="hover">
          <template #header>
            <div class="card-header">
              <h3 class="activity-title">{{ activity.title }}</h3>
              <el-tag :type="getStatusTagType(activity.status)">
                {{ getStatusLabel(activity.status) }}
              </el-tag>
            </div>
          </template>

          <div class="card-content">
            <el-image
                :src="activity.cover"
                class="activity-cover"
                fit="cover"
                lazy
            >
              <template #error>
                <div class="cover-error">
                  <el-icon><Picture /></el-icon>
                </div>
              </template>
            </el-image>

            <div class="activity-info">
              <div class="info-item">
                <el-icon><Calendar /></el-icon>
                <span>活动开始时间：{{ formatDate(activity.startTime) }}</span>
              </div>
              <div class="info-item">
                <el-icon><Calendar /></el-icon>
                <span>活动报名开始时间：{{ formatDate(activity.registration_time) }}</span>
              </div>
              <div class="info-item">
                <el-icon><Location /></el-icon>
                <span>活动地点：{{ activity.location }}</span>
              </div>
              <div class="info-item">
                <el-icon><User /></el-icon>
                <span>剩余名额：{{ activity.remaining }}/{{ activity.capacity }}</span>
              </div>
            </div>

            <div class="card-actions">
              <el-button
                  type="primary"
                  :disabled="!canEnroll(activity)"
                  @click="handleEnroll(activity)"
              >
                {{ getButtonText(activity) }}
              </el-button>
              <el-button @click="viewDetail()">
                查看详情
              </el-button>
            </div>
          </div>
        </el-card>
      </div>
    </div>

    <!-- 分页 -->
    <div class="pagination">
      <el-pagination
          v-model:current-page="currentPage"
          :page-size="pageSize"
          layout="total, prev, pager, next"
          :total="filteredActivities.length"
          @current-change="handlePageChange"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import {
  Search,
  Calendar,
  Location,
  User,
  Picture
} from '@element-plus/icons-vue'
import { formatDate } from '@/utils/date'
import {ElMessage} from "element-plus";
import {getActivityDetail, submitEnrollment} from "@/api/activity.js";

const router = useRouter()

// 状态管理
const loading = ref(true)
const activities = ref([])
const searchKeyword = ref('')
const filterStatus = ref('')
const dateRange = ref([])
const currentPage = ref(1)
const pageSize = 9

// 状态选项
const statusOptions = [
  { value: 'upcoming', label: '即将开始' },
  { value: 'ongoing', label: '进行中' },
  { value: 'ended', label: '已结束' }
]

// 获取活动数据
const fetchActivities = async () => {
  try {
    loading.value = true
    const { data } = await getActivityDetail()
    if (data.code === 401) {
      ElMessage.error('登录失效，请重新登录')
      await router.push({ path: '/login' })
      return
    }
    activities.value = data.data.map(item => ({
      ...item,
      remaining: item.capacity - item.enrolled
    }))
  } catch (error) {
    console.log(error)
    ElMessage.error('获取活动列表失败')
  } finally {
    loading.value = false
  }
}

// 计算属性
const filteredActivities = computed(() => {
  return activities.value.filter(activity => {
    const matchesSearch = activity.title.includes(searchKeyword.value) ||
        activity.description.includes(searchKeyword.value)

    const matchesStatus = filterStatus.value ?
        activity.status === filterStatus.value : true

    const matchesDate = dateRange.value.length === 2 ?
        new Date(activity.startTime) >= dateRange.value[0] &&
        new Date(activity.endTime) <= dateRange.value[1] : true

    return matchesSearch && matchesStatus && matchesDate
  })
})

const paginatedActivities = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredActivities.value.slice(start, end)
})

// 状态显示方法
const getStatusTagType = (status) => {
  const types = {
    upcoming: 'success',
    ongoing: 'primary',
    ended: 'info'
  }
  return types[status] || 'info'
}

const getStatusLabel = (status) => {
  const labels = {
    upcoming: '报名中',
    ongoing: '进行中',
    ended: '已结束'
  }
  return labels[status] || '未知状态'
}

const canEnroll = (activity) => {
  return activity.status === 'upcoming' && activity.remaining > 0
}

const getButtonText = (activity) => {
  if (activity.status !== 'upcoming') return '已结束'
  return activity.remaining > 0 ? '立即报名' : '名额已满'
}

// 事件处理
const handleSearch = () => {
  currentPage.value = 1
}

const handleFilterChange = () => {
  currentPage.value = 1
}

const handleDateChange = () => {
  currentPage.value = 1
}

const handlePageChange = (page) => {
  currentPage.value = page
}

const handleEnroll = (activity) => {
  submitEnrollment(activity)
}

const viewDetail = (id) => {
  router.push(`/working`)
}

// 初始化获取数据
onMounted(() => {
  fetchActivities()
})
</script>

<style scoped>
.activity-list-container {
  max-width: 1200px;
  margin: 20px auto;
  padding: 0 20px;
}

.filter-section {
  display: flex;
  gap: 15px;
  margin-bottom: 20px;

  .search-input {
    width: 300px;
  }

  .status-filter {
    width: 150px;
  }
}

.activity-grid {
  display: grid;
  gap: 20px;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
}

.activity-card {
  transition: transform 0.3s;

  &:hover {
    transform: translateY(-5px);
  }
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.activity-cover {
  width: 100%;
  height: 200px;
  border-radius: 4px;
}

.cover-error {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  background: #f5f7fa;
}

.activity-info {
  margin: 15px 0;
  font-size: 14px;
  color: #606266;

  .info-item {
    display: flex;
    align-items: center;
    gap: 8px;
    margin-bottom: 10px;

    .el-icon {
      font-size: 16px;
    }
  }
}

.card-actions {
  display: flex;
  gap: 10px;
  margin-top: 15px;
}

.pagination {
  margin-top: 30px;
  display: flex;
  justify-content: center;
}
</style>