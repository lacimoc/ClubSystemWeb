<template>
  <div class="password-change-container">
    <el-card class="password-card">
      <template #header>
        <div class="card-header">
          <h3>修改密码</h3>
        </div>
      </template>

      <el-form
          ref="passwordForm"
          :model="form"
          :rules="rules"
          label-width="120px"
          label-position="left"
      >
        <el-form-item label="新密码" prop="newPassword">
          <el-input
              v-model="form.newPassword"
              type="password"
              show-password
              placeholder="8-20位字母、数字和符号组合"
          />
          <password-strength-meter :password="form.newPassword" />
        </el-form-item>

        <el-form-item label="确认新密码" prop="confirmPassword">
          <el-input
              v-model="form.confirmPassword"
              type="password"
              show-password
              placeholder="请再次输入新密码"
          />
        </el-form-item>

        <el-form-item>
          <el-button
              type="primary"
              :loading="submitting"
              @click="submitForm"
          >
            确认修改
          </el-button>
        </el-form-item>
      </el-form>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'
import PasswordStrengthMeter from '@/views/PasswordStrengthMeter.vue'
import { changePassword } from '@/api/activity.js'

const form = reactive({
  oldPassword: '',
  newPassword: '',
  confirmPassword: ''
})

const rules = reactive({
  newPassword: [
    { required: true, message: '请输入新密码', trigger: 'blur' },
    {
      pattern: /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*])[A-Za-z\d!@#$%^&*]{8,20}$/,
      message: '8-20位字母、数字和特殊符号组合',
      trigger: 'blur'
    }
  ],
  confirmPassword: [
    { required: true, message: '请确认新密码', trigger: 'blur' },
    {
      validator: (rule, value, callback) => {
        if (value !== form.newPassword) {
          callback(new Error('两次输入的密码不一致'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
})

const passwordForm = ref(null)
const submitting = ref(false)

const submitForm = async () => {
  try {
    await passwordForm.value.validate()

    submitting.value = true
    await changePassword({
      new_password: form.newPassword
    })

    ElMessage.success('密码修改成功')
    resetForm()
  } catch (error) {
    const msg = error.response?.data?.message || '密码修改失败'
    ElMessage.error(msg)
  } finally {
    submitting.value = false
  }
}

const resetForm = () => {
  passwordForm.value.resetFields()
}
</script>

<style scoped>
.password-change-container {
  max-width: 600px;
  margin: 40px auto;
}

.password-card {
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  text-align: center;
  margin-bottom: 20px;
}

.el-form-item {
  margin-bottom: 24px;
}

.el-button {
  width: 100%;
  margin-top: 10px;
}
</style>