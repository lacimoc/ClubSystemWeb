<template>
  <div class="user-management">
    <!-- 操作栏 -->
    <div class="action-bar">
      <el-button type="primary" @click="showCreateDialog">
        <el-icon><Plus /></el-icon>
        添加用户
      </el-button>
    </div>

    <!-- 用户表格 -->
    <el-table
        :data="users"
        v-loading="loading"
        style="width: 100%"
        stripe
    >
      <el-table-column prop="username" label="用户名" width="180" />
      <el-table-column prop="name" label="姓名" width="180" />
      <el-table-column label="部门" width="150">
        <template #default="{ row }">
          <el-tag type="info">{{ getDepartmentName(row.departmentId) }}</el-tag>
        </template>
      </el-table-column>
      <el-table-column label="权限" width="120">
        <template #default="{ row }">
          <el-tag :type="row.isAdmin ? 'danger' : 'success'">
            {{ row.isAdmin ? '管理员' : '用户' }}
          </el-tag>
        </template>
      </el-table-column>
      <el-table-column prop="createdAt" label="创建时间" width="180">
        <template #default="{ row }">
          {{ formatDate(row.createdAt) }}
        </template>
      </el-table-column>
      <el-table-column label="操作" width="220" fixed="right">
        <template #default="{ row }">
          <el-button
              size="small"
              type="primary"
              @click="handleResetPassword(row.id)"
          >
            重置密码
          </el-button>
          <el-button
              size="small"
              type="danger"
              @click="handleDeleteUser(row.id)"
          >
            删除
          </el-button>
        </template>
      </el-table-column>
    </el-table>

    <!-- 添加用户对话框 -->
    <el-dialog
        v-model="showCreateUserDialog"
        :title="isEditing ? '编辑用户' : '新建用户'"
        width="500px"
    >
      <el-form
          ref="userForm"
          :model="currentUser"
          :rules="formRules"
          label-width="80px"
      >
        <el-form-item label="用户名" prop="username">
          <el-input v-model="currentUser.username" />
        </el-form-item>

        <el-form-item label="姓名" prop="name">
          <el-input v-model="currentUser.name" />
        </el-form-item>

        <el-form-item label="部门" prop="departmentId">
          <el-select
              v-model="currentUser.departmentId"
              placeholder="选择部门"
              clearable
          >
            <el-option
                v-for="dept in departments"
                :key="dept.id"
                :label="dept.name"
                :value="dept.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="权限" prop="isAdmin">
          <el-radio-group v-model="currentUser.isAdmin">
            <el-radio :label="true">管理员</el-radio>
            <el-radio :label="false">普通用户</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="密码" prop="password" v-if="!isEditing">
          <el-input
              v-model="currentUser.password"
              type="password"
              show-password
              placeholder="请输入8-20位密码"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="showCreateUserDialog = false">取消</el-button>
        <el-button type="primary" @click="submitUserForm">
          确认
        </el-button>
      </template>
    </el-dialog>

    <!-- 重置密码确认对话框 -->
    <el-dialog
        v-model="showResetPasswordDialog"
        title="重置密码确认"
        width="400px"
    >
      <span>确定要重置该用户的密码吗？新密码将设为：123456</span>
      <template #footer>
        <el-button @click="showResetPasswordDialog = false">取消</el-button>
        <el-button type="primary" @click="confirmResetPassword">
          确定重置
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  getUsers,
  createUser,
  updateUser,
  deleteUser,
  resetPassword,
  fetchDepartmentsApi as getDepartments
} from '@/api/activity.js'
import { formatDate } from '@/utils/date'
import {Plus} from "@element-plus/icons-vue";
import router from "@/router/index.js";

// 组件状态
const loading = ref(false)
const users = ref([])
const departments = ref([])
const currentUser = ref(initUserForm())
const selectedUserId = ref(null)

// 对话框状态
const showCreateUserDialog = ref(false)
const showResetPasswordDialog = ref(false)
const isEditing = ref(false)

// 表单验证规则
const formRules = reactive({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    {
      pattern: /^[a-zA-Z0-9_]{4,16}$/,
      message: '4-16位字母、数字或下划线',
      trigger: 'blur'
    }
  ],
  name: [
      { required: true, message: '请输入姓名', trigger: 'blur' },
  ],
  departmentId: [
    { required: true, message: '请选择所属部门', trigger: 'change' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    {
      pattern: /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,20}$/,
      message: '8-20位字母和数字组合',
      trigger: 'blur'
    }
  ]
})

// 初始化数据
onMounted(async () => {
  await Promise.all([fetchDepartments(), fetchUsers()])
})

// 获取部门数据
const fetchDepartments = async () => {
  try {
    const { data } = await getDepartments()
    if (data.code === 401) {
      ElMessage.error('登录失效，请重新登录')
      await router.push({ path: '/login' })
      return
    }
    departments.value = [
        {"id": "dept_01", "name": `${data.data[0]}`},
        {"id": "dept_02", "name": `${data.data[1]}`},
        {"id": "dept_03", "name": `${data.data[2]}`},
        {"id": "dept_04", "name": `${data.data[3]}`},
        {"id": "dept_05", "name": `${data.data[4]}`},
        {"id": "dept_06", "name": `${data.data[5]}`},
        {"id": "dept_07", "name": `${data.data[6]}`},
    ]
  } catch (error) {
    ElMessage.error('获取部门列表失败')
  }
}

// 获取用户列表
const fetchUsers = async () => {
  try {
    loading.value = true
    const { data } = await getUsers()
    if (data.code === 401) {
      ElMessage.error('登录失效，请重新登录')
      await router.push({ path: '/login' })
      return
    }
    users.value = data.data
  } catch (error) {
    ElMessage.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

// 部门名称映射
const getDepartmentName = (id) => {
  return departments.value.find(d => d.id === id)?.name || '未知部门'
}

// 初始化用户表单
function initUserForm() {
  return {
    username: '',
    departmentId: null,
    isAdmin: false,
    password: ''
  }
}

// 显示创建对话框
const showCreateDialog = () => {
  isEditing.value = false
  currentUser.value = initUserForm()
  showCreateUserDialog.value = true
}

// 处理删除用户
const handleDeleteUser = async (userId) => {
  try {
    await ElMessageBox.confirm('确定删除该用户吗？', '警告', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    })

    const { data } = await deleteUser(userId)
    if (data.code === 401) {
      ElMessage.error('登录失效，请重新登录')
      await router.push({ path: '/login' })
      return
    }
    if (data.code === 403) {
      ElMessage.error('无权限删除该用户')
      return
    }
    ElMessage.success('删除成功')
    await fetchUsers()
  } catch (error) {
    console.log('取消删除')
  }
}

// 处理重置密码
const handleResetPassword = (userId) => {
  selectedUserId.value = userId
  showResetPasswordDialog.value = true
}

// 确认重置密码
const confirmResetPassword = async () => {
  try {
    const { data } = await resetPassword(selectedUserId.value)
    if (data.code === 401) {
      ElMessage.error('登录失效，请重新登录')
      await router.push({ path: '/login' })
      return
    }
    if (data.code === 403) {
      ElMessage.error('无权限重置密码')
      return
    }
    ElMessage.success('密码已重置为123456')
    showResetPasswordDialog.value = false
  } catch (error) {
    ElMessage.error('重置密码失败')
  }
}

// 提交用户表单
const submitUserForm = async () => {
  try {
    const payload = { ...currentUser.value }

    if (isEditing.value) {
      const { data } = await updateUser(payload)
      if (data.code === 401) {
        ElMessage.error('登录失效，请重新登录')
        await router.push({ path: '/login' })
        return
      }
      if (data.code === 403) {
        ElMessage.error('无权限修改该用户')
        return
      }
      ElMessage.success('用户更新成功')
    } else {
      const { data } = await createUser(payload)
      if (data.code === 401) {
        ElMessage.error('登录失效，请重新登录')
        await router.push({ path: '/login' })
        return
      }
      if (data.code === 403) {
        ElMessage.error('无权限创建用户')
        return
      }
      ElMessage.success('用户创建成功')
    }

    showCreateUserDialog.value = false
    await fetchUsers()
  } catch (error) {
    ElMessage.error(error.response?.data?.message || '操作失败')
  }
}
</script>

<style scoped>
.user-management {
  padding: 20px;
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.action-bar {
  margin-bottom: 20px;
}

.el-tag {
  margin-right: 5px;
}

.el-table {
  margin-top: 15px;
}
</style>