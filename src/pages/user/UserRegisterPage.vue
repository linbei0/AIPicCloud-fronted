<template>
  <div id="userRegisterPage">
    <h2 class="title">云图库 - 用户注册</h2>
    <div class="desc">企业级智能协同云图库</div>
    <a-form :model="formState" name="basic" label-align="left" autocomplete="off" @finish="handleSubmit">
      <a-form-item name="userAccount" :rules="[{ required: true, message: '请输入账号' }]">
        <a-input v-model:value="formState.userAccount" placeholder="请输入邮箱账号" />
      </a-form-item>
      <a-form-item name="emailCode" :rules="[{ required: true, message: '请输入验证码' }]">
        <div style="display: flex; gap: 8px;">
          <a-input v-model:value="formState.emailCode" placeholder="请输入验证码" style="flex: 1;" />
          <a-button 
            :disabled="sendCodeDisabled" 
            @click="sendEmailCode"
            style="width: 120px;"
          >
            {{ sendCodeText }}
          </a-button>
        </div>
      </a-form-item>
      <a-form-item name="userPassword" :rules="[
        { required: true, message: '请输入密码' },
        { min: 8, message: '密码不能小于 8 位' },
      ]">
        <a-input-password v-model:value="formState.userPassword" placeholder="请输入密码" />
      </a-form-item>
      <a-form-item name="checkPassword" :rules="[
        { required: true, message: '请输入确认密码' },
        { min: 8, message: '确认密码不能小于 8 位' },
      ]">
        <a-input-password v-model:value="formState.checkPassword" placeholder="请输入确认密码" />
      </a-form-item>
      <div class="tips">
        已有账号？
        <RouterLink to="/user/login">去登录</RouterLink>
      </div>
      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%">注册</a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import { userRegisterUsingPost, sendEmailCodeUsingGet } from '@/api/userController'
import router from '@/router'
const formState = reactive<API.UserRegisterRequest>({
  userAccount: '',
  userPassword: '',
  checkPassword: '',
  emailCode: '',
})

// 验证码发送相关状态
const sendCodeDisabled = ref(false)
const sendCodeText = ref('发送验证码')
const countDown = ref(0)

/**
 * 发送邮箱验证码
 */
const sendEmailCode = async () => {
  // 验证邮箱格式
  if (!formState.userAccount) {
    message.error('请先输入邮箱账号')
    return
  }
  if (!formState.userAccount.includes('@')) {
    message.error('请输入正确的邮箱格式')
    return
  }

  try {
    sendCodeDisabled.value = true
    const res = await sendEmailCodeUsingGet({ email: formState.userAccount })
    if (res.data.code === 0) {
      message.success('验证码已发送，请查收邮箱')
      // 开始倒计时
      countDown.value = 60
      const timer = setInterval(() => {
        countDown.value--
        sendCodeText.value = `${countDown.value}秒后重发`
        if (countDown.value <= 0) {
          clearInterval(timer)
          sendCodeDisabled.value = false
          sendCodeText.value = '发送验证码'
        }
      }, 1000)
    } else {
      message.error('发送失败：' + res.data.message)
      sendCodeDisabled.value = false
    }
  } catch (error) {
    console.error('发送验证码出错', error)
    message.error('发送验证码失败，请稍后重试')
    sendCodeDisabled.value = false
  }
}

/**
 * 提交表单
 * @param values
 */
const handleSubmit = async (values: any) => {
  // 判断两次输入的密码是否一致
  if (formState.userPassword !== formState.checkPassword) {
    message.error('二次输入的密码不一致')
    return
  }
  const res = await userRegisterUsingPost(values)
  // 注册成功，跳转到登录页面
  if (res.data.code === 0 && res.data.data) {
    message.success('注册成功')
    router.push({
      path: '/user/login',
      replace: true,
    })
  } else {
    message.error('注册失败，' + res.data.message)
  }
}
</script>

<style scoped>
#userRegisterPage {
  max-width: 360px;
  margin: 0 auto;
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: white;
  padding: 24px;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
  width: 100%;
}

.title {
  text-align: center;
  margin-bottom: 16px;
}

.desc {
  text-align: center;
  color: #bbb;
  margin-bottom: 16px;
}

.tips {
  margin-bottom: 16px;
  color: #bbb;
  font-size: 13px;
  text-align: right;
}
</style>
