<template>
  <div class="login-container">
    <el-card class="login-card">
      <h2 class="login-title">用户登录</h2>

      <el-form
          ref="loginForm"
          :model="form"
          :rules="rules"
          @keyup.enter="handleLogin"
      >
        <el-form-item prop="username">
          <el-input
              v-model="form.username"
              placeholder="请输入用户名"
              prefix-icon="User"
              clearable
          />
        </el-form-item>

        <el-form-item prop="password">
          <el-input
              v-model="form.password"
              placeholder="请输入密码"
              prefix-icon="Lock"
              show-password
              clearable
          />
        </el-form-item>

        <el-form-item prop="remember" class="remember-item">
          <el-checkbox v-model="form.remember">记住我</el-checkbox>
          <el-link type="primary" class="forgot-password" @click="handleForgotPassword">
            忘记密码?
          </el-link>
        </el-form-item>

        <el-form-item>
          <el-button
              type="primary"
              class="login-button"
              :loading="loading"
              @click="handleLogin"
          >
            立即登录
          </el-button>
        </el-form-item>

        <div class="register-link">
          没有账号? <el-link type="primary" @click="handleRegister">立即注册</el-link>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { login } from '@/api/auth'
import { setToken } from '@/utils/auth'

const router = useRouter()

// 表单数据
const form = reactive({
  username: '',
  password: '',
  remember: false
})

// 表单验证规则
const rules = reactive({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 4, max: 20, message: '长度在 4 到 20 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 20, message: '长度在 6 到 20 个字符', trigger: 'blur' }
  ]
})

// 引用表单实例
const loginForm = ref(null)
const loading = ref(false)

// 初始化时检查记住我
onMounted(() => {
  const savedUsername = localStorage.getItem('username')
  if (savedUsername) {
    form.username = savedUsername
    form.remember = true
  }
})

// 处理登录
const handleLogin = async () => {
  try {
    await loginForm.value.validate()
    loading.value = true

    // 调用登录API
    const { data } = await login({
      username: form.username,
      password: form.password
    })

    // 保存Token
    setToken(data.data.token)

    // 处理记住我
    if (form.remember) {
      localStorage.setItem('username', form.username)
    } else {
      localStorage.removeItem('username')
    }

    if (data.code === 200) {
      // 跳转到首页
      await router.push('/')
      ElMessage.success('登录成功')
      // 刷新整个页面
      window.location.reload()
    }
    if (data.code === 401) {
      const msg = '登录失败'
      ElMessage.error(msg)
    }

  } catch (error) {
    if (error.response) {
      const msg = error.response.data?.message || '登录失败'
      ElMessage.error(msg)
    } else {
      ElMessage.error('网络错误，请稍后重试')
    }
  } finally {
    loading.value = false
  }
}

// 其他操作
const handleForgotPassword = () => {
  router.push('/forgot-password')
}

const handleRegister = () => {
  router.push('/register')
}
</script>

<style scoped>
.login-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 92vh;
  background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
}

.login-card {
  width: 400px;
  padding: 30px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.login-title {
  text-align: center;
  margin-bottom: 30px;
  color: #303133;
}

.login-button {
  width: 100%;
  margin-top: 10px;
}

.remember-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.forgot-password {
  margin-left: auto;
}

.register-link {
  text-align: center;
  margin-top: 20px;
  color: #606266;
}
</style>