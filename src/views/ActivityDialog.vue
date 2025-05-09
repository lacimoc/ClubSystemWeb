<template>
  <el-dialog
      v-model="visible"
      :title="formData.id ? '编辑活动' : '新建活动'"
      width="600px"
  >
    <el-form
        ref="formRef"
        :model="formData"
        label-width="100px"
        :rules="rules"
    >
      <el-form-item label="活动名称" prop="title">
        <el-input v-model="formData.title" />
      </el-form-item>

      <el-form-item label="所属部门" prop="department">
        <el-select
            v-model="formData.department"
            placeholder="请选择部门"
            clearable
        >
          <el-option
              v-for="dept in departments"
              :key="dept"
              :label="dept"
              :value="dept"
          />
        </el-select>
      </el-form-item>

      <el-form-item label="活动时间" prop="time">
        <el-date-picker
            v-model="formData.time"
            type="datetimerange"
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            value-format="YYYY-MM-DDTHH:mm:ssZ"
        />
      </el-form-item>

      <el-form-item label="报名时间" prop="registration_time">
        <el-date-picker
            v-model="formData.registration_time"
            type="datetime"
            value-format="YYYY-MM-DDTHH:mm:ssZ"
        />
      </el-form-item>

      <el-form-item label="活动地点" prop="location">
        <el-input v-model="formData.location" />
      </el-form-item>

      <el-form-item label="最大人数" prop="capacity">
        <el-input-number
            v-model="formData.capacity"
            :min="1"
            :max="1000"
        />
      </el-form-item>

      <el-form-item label="活动封面" prop="cover">
        <el-upload
            action="https://home.icuhome.space:12007/api/upload"
            :headers="{'Authorization': `Bearer ${token}`}"
            :show-file-list="false"
            :on-success="handleUploadSuccess"
        >
          <el-button type="primary">上传图片</el-button>
          <template #tip>
            <div class="el-upload__tip">建议尺寸 800x400px</div>
          </template>
        </el-upload>
      </el-form-item>

      <el-form-item label="活动描述" prop="description">
        <el-input
            v-model="formData.description"
            type="textarea"
            :rows="4"
        />
      </el-form-item>
    </el-form>

    <template #footer>
      <el-button @click="visible = false">取消</el-button>
      <el-button type="primary" @click="submitForm">提交</el-button>
    </template>
  </el-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { ElMessage } from 'element-plus'
import router from "@/router/index.js";

const props = defineProps({
  modelValue: Boolean,
  activity: Object,
  departments: Array
})

const emit = defineEmits(['update:modelValue', 'submit'])

const visible = ref(false)
const formData = ref({
  title: '',
  department: '',
  time: [],
  registration_time: '',
  location: '',
  capacity: 50,
  cover: '',
  description: ''
})

const rules = {
  title: [
    { required: true, message: '请输入活动名称', trigger: 'blur' },
    { min: 3, max: 50, message: '长度在3到50个字符', trigger: 'blur' }
  ],
  department: [
    { required: true, message: '请选择所属部门', trigger: 'change' }
  ],
  time: [
    { required: true, message: '请选择活动时间', trigger: 'change' }
  ],
  registration_time: [
    { required: true, message: '请选择报名时间开始', trigger: 'change' }
  ],
  location: [
    { required: true, message: '请输入活动地点', trigger: 'blur' }
  ]
}

watch(() => props.modelValue, (val) => {
  visible.value = val
  if (val) {
    formData.value = props.activity ? {
      ...props.activity,
      time: [props.activity.startTime, props.activity.endTime]
    } : {
      title: '',
      department: '',
      time: [],
      registration_time: '',
      location: '',
      capacity: 50,
      cover: '',
      description: ''
    }
  }
})

watch(visible, (val) => {
  emit('update:modelValue', val)
})

const handleUploadSuccess = (response) => {
  if (response.code === 401) {
    ElMessage.error('登录失效，请重新登录')
    router.push({ path: '/login' })
    return
  }
  formData.value.cover = response.data.url
}

const submitForm = () => {
  const submitData = {
    ...formData.value,
    startTime: formData.value.time[0],
    endTime: formData.value.time[1]
  }
  delete submitData.time
  emit('submit', submitData)
}

const token = localStorage.getItem('token')
</script>