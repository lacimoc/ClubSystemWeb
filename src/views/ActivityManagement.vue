<template>
  <div class="activity-manager">
    <!-- 操作栏 -->
    <div class="action-bar">
      <el-button type="primary" @click="handleCreate">
        <el-icon><Plus /></el-icon>
        新建活动
      </el-button>

      <div class="filters">
        <el-input
            v-model="searchKeyword"
            placeholder="搜索活动"
            clearable
            @input="handleFilterChange"
            style="width: 200px"
        >
          <template #prefix>
            <el-icon><Search /></el-icon>
          </template>
        </el-input>

        <el-select
            v-model="selectedDepartment"
            placeholder="选择部门"
            clearable
            @change="handleFilterChange"
            style="width: 150px; margin-left: 10px"
        >
          <el-option
              v-for="dept in departments"
              :key="dept"
              :label="dept"
              :value="dept"
          />
        </el-select>

        <el-select
            v-model="selectedStatus"
            placeholder="活动状态"
            clearable
            @change="handleFilterChange"
            style="width: 150px; margin-left: 10px"
        >
          <el-option
              v-for="status in statusOptions"
              :key="status.value"
              :label="status.label"
              :value="status.value"
          />
        </el-select>
      </div>
    </div>

    <!-- 活动表格 -->
    <el-table
        :data="pagedActivities"
        v-loading="loading"
        style="width: 100%"
        stripe
    >
      <el-table-column prop="title" label="活动名称" width="250">
        <template #default="{ row }">
          <div class="title-wrapper">
            <el-image
                :src="row.cover"
                style="width: 40px; height: 40px; margin-right: 10px"
                fit="cover"
            />
            <span>{{ row.title }}</span>
          </div>
        </template>
      </el-table-column>

      <el-table-column prop="department" label="部门" width="120" />

      <el-table-column label="时间" width="400">
        <template #default="{ row }">
          {{ formatDateTime(row.startTime) }} ~
          {{ formatDateTime(row.endTime) }}
        </template>
      </el-table-column>

      <el-table-column label="报名开始时间" width="220">
        <template #default="{ row }">
          {{ formatDateTime(row.registration_time) }}
        </template>
      </el-table-column>

      <el-table-column label="状态" width="120">
        <template #default="{ row }">
          <el-tag :type="getStatusType(row.status)">
            {{ getStatusLabel(row.status) }}
          </el-tag>
        </template>
      </el-table-column>

      <el-table-column label="人数" width="200">
        <template #default="{ row }">
          <el-progress
              :percentage="(row.enrolled / row.capacity) * 100"
              :status="getProgressStatus(row)"
          />
          <div class="capacity-text">
            {{ row.enrolled }}/{{ row.capacity }}
          </div>
        </template>
      </el-table-column>

      <el-table-column label="操作" width="300" fixed="right">
        <template #default="{ row }">
          <el-button size="small" @click="handleEdit(row)">编辑</el-button>
          <el-button
              size="small"
              type="danger"
              @click="handleDelete(row.id)"
          >
            删除
          </el-button>
          <el-button size="small" @click="handleDownload(row)">导出报名表</el-button>
        </template>
      </el-table-column>
    </el-table>

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

    <!-- 编辑对话框 -->
    <activity-dialog
        v-model="dialogVisible"
        :activity="currentActivity"
        :departments="departments"
        @submit="handleSubmit"
    />
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import ActivityDialog from './ActivityDialog.vue'
import {
  fetchActivitiesApi,
  createActivityApi,
  updateActivityApi,
  deleteActivityApi,
  fetchDepartmentsApi
} from '@/api/activity'
import { formatDateTime } from '@/utils/date'
import { Plus, Search } from "@element-plus/icons-vue"
import router from "@/router/index.js";
import axios from "axios";

// 组件状态
const loading = ref(false)
const allActivities = ref([]) // 所有活动数据
const departments = ref([])
const currentPage = ref(1)
const pageSize = 10

// 筛选条件
const searchKeyword = ref('')
const selectedDepartment = ref('')
const selectedStatus = ref('')

// 对话框状态
const dialogVisible = ref(false)
const currentActivity = ref(null)

// 状态选项
const statusOptions = [
  { value: 'upcoming', label: '即将开始' },
  { value: 'ongoing', label: '进行中' },
  { value: 'ended', label: '已结束' }
]

// 计算属性
const filteredActivities = computed(() => {
  return allActivities.value.filter(activity => {
    // 关键词筛选
    const keywordMatch = searchKeyword.value
        ? activity.title.includes(searchKeyword.value) ||
        (activity.description && activity.description.includes(searchKeyword.value))
        : true

    // 部门筛选
    const departmentMatch = selectedDepartment.value
        ? activity.department === selectedDepartment.value
        : true

    // 状态筛选
    const statusMatch = selectedStatus.value
        ? activity.status === selectedStatus.value
        : true

    return keywordMatch && departmentMatch && statusMatch
  })
})

const pagedActivities = computed(() => {
  const start = (currentPage.value - 1) * pageSize
  const end = start + pageSize
  return filteredActivities.value.slice(start, end)
})

// 初始化数据
onMounted(async () => {
  await fetchDepartments()
  await fetchAllActivities()
})

// 获取所有活动数据
const fetchAllActivities = async () => {
  try {
    loading.value = true
    const { data } = await fetchActivitiesApi()
    if (data.code === 200) {
      allActivities.value = data.data
    }
    if (data.code === 401) {
      ElMessage.error('登录失效，请重新登录')
      await router.push({path: '/login'})
    }
  } catch (error) {
    ElMessage.error('获取活动列表失败')
  } finally {
    loading.value = false
  }
}

// 获取部门列表
const fetchDepartments = async () => {
  try {
    const { data } = await fetchDepartmentsApi()
    if (data.code === 401) {
      ElMessage.error('登录失效，请重新登录')
      await router.push({path: '/login'})
      return
    }
    if (data.code === 200) {
      departments.value = data.data
    } else {
      departments.value = []
    }
  } catch (error) {
    ElMessage.error('获取部门列表失败')
  }
}

// 状态显示方法
const getStatusType = (status) => {
  const types = {
    upcoming: 'success',
    ongoing: 'warning',
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

const getProgressStatus = (row) => {
  if (row.status === 'ended') return 'exception'
  return row.enrolled >= row.capacity ? 'warning' : 'success'
}

// 操作处理
const handleCreate = () => {
  currentActivity.value = null
  dialogVisible.value = true
}

const handleEdit = (activity) => {
  currentActivity.value = { ...activity }
  dialogVisible.value = true
}

const handleDelete = async (id) => {
  try {
    await ElMessageBox.confirm('确定删除该活动吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const { data } = await deleteActivityApi(id)
    if (data.code === 401) {
      ElMessage.error('登录失效，请重新登录')
      await router.push({path: '/login'})
      return
    }
    if (data.code === 403) {
      ElMessage.error('无权限删除该活动')
      return
    }
    ElMessage.success('删除成功')
    await fetchAllActivities() // 重新加载数据
  } catch (error) {
    console.log('取消删除')
  }
}

const handleSubmit = async (formData) => {
  try {
    if (formData.id) {
      const { data } = await updateActivityApi(formData)
      if (data.code === 401) {
        ElMessage.error('登录失效，请重新登录')
        await router.push({path: '/login'})
        return
      }
      if (data.code === 403) {
        ElMessage.error('无权限修改该活动')
        return
      }
      ElMessage.success('更新成功')
    } else {
      const { data } = await createActivityApi(formData)
      if (data.code === 401) {
        ElMessage.error('登录失效，请重新登录')
        await router.push({path: '/login'})
        return
      }
      if (data.code === 403) {
        ElMessage.error('无权限创建活动')
        return
      }
      ElMessage.success('创建成功')
    }
    dialogVisible.value = false
    await fetchAllActivities()
  } catch (error) {
    console.error('提交失败:', error)
  }
}

// 筛选处理
const handleFilterChange = () => {
  currentPage.value = 1
}

// 分页处理
const handlePageChange = () => {
  window.scrollTo(0, 0)
}

// 导出报名表
const downloadFile = async (options) => {
  try {
    // 处理不同数据来源
    let blob, filename;

    if (options.data instanceof Response) {
      const contentDisposition = options.data.headers.get('content-disposition');
      filename = contentDisposition
          ? decodeURIComponent(contentDisposition.split('filename=')[1])
          : options.filename || `file_${new Date().getTime()}`;

      blob = await options.data.blob();
    } else if (options.data instanceof Blob) {
      blob = options.data;
      filename = options.filename || `file_${new Date().getTime()}`;
    } else {
      throw new Error('Unsupported data type');
    }

    // 创建临时URL
    const url = window.URL.createObjectURL(
        new Blob([blob], {type: options.mimeType || blob.type})
    );

    // 创建隐藏的下载链接
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';

    // 触发下载
    document.body.appendChild(link);
    link.click();

    // 清理资源
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);

    return true;
  } catch (error) {
    console.error('文件下载失败:', error);
    return false;
  }
}

const handleDownload = (activity) => {
  axios.post('https://home.icuhome.space:12007/api/export',
      {"activity_id": activity.id},
      {
        responseType: 'blob',
        headers: {
          "Authorization": `Bearer ${localStorage.token}`
        }
      }).then((response) => {
    downloadFile({
      filename: 'report.xlsx',
      data: response.data,
      mimeType: 'application/xlsx'
    });
  });
}
</script>

<style scoped>
.activity-manager {
  padding: 20px;
  background: #fff;
  border-radius: 8px;
}

.action-bar {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px;
}

.filters {
  display: flex;
  gap: 10px;
}

.title-wrapper {
  display: flex;
  align-items: center;
}

.capacity-text {
  margin-top: 5px;
  font-size: 12px;
  color: #666;
}

.pagination {
  margin-top: 20px;
  display: flex;
  justify-content: flex-end;
}
</style>