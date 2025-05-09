<template>
  <div class="password-strength">
    <div
        class="strength-bar"
        :class="strengthClass"
    />
    <span class="strength-text">{{ strengthText }}</span>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  password: {
    type: String,
    default: ''
  }
})

const strengthLevel = computed(() => {
  if (!props.password) return 0
  let strength = 0

  // 长度评分
  if (props.password.length >= 8) strength += 1
  if (props.password.length >= 12) strength += 1

  // 字符类型评分
  const hasLower = /[a-z]/.test(props.password)
  const hasUpper = /[A-Z]/.test(props.password)
  const hasNumber = /\d/.test(props.password)
  const hasSpecial = /[!@#$%^&*]/.test(props.password)

  const typeCount = [hasLower, hasUpper, hasNumber, hasSpecial]
      .filter(Boolean).length

  return strength + typeCount
})

const strengthClass = computed(() => {
  if (strengthLevel.value <= 2) return 'weak'
  if (strengthLevel.value <= 4) return 'medium'
  return 'strong'
})

const strengthText = computed(() => {
  return {
    weak: '弱',
    medium: '中',
    strong: '强'
  }[strengthClass.value]
})
</script>

<style scoped>
.password-strength {
  margin-top: 8px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.strength-bar {
  width: 100px;
  height: 6px;
  border-radius: 3px;
  background-color: #e0e0e0;
  position: relative;
  overflow: hidden;
}

.strength-bar::after {
  content: '';
  position: absolute;
  left: 0;
  top: 0;
  height: 100%;
  transition: width 0.3s ease;
}

.strength-bar.weak::after {
  width: 33%;
  background-color: #ff4d4f;
}

.strength-bar.medium::after {
  width: 66%;
  background-color: #faad14;
}

.strength-bar.strong::after {
  width: 100%;
  background-color: #52c41a;
}

.strength-text {
  font-size: 12px;
  color: #666;
}
</style>