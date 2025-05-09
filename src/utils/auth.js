// Token处理
export const getToken = () => localStorage.getItem('token')
export const setToken = (token) => localStorage.setItem('token', token)
export const removeToken = () => localStorage.removeItem('token')

// 用户信息处理
export const getUserInfo = () => JSON.parse(localStorage.getItem('userInfo') || '{}')
export const setUserInfo = (info) => localStorage.setItem('userInfo', JSON.stringify(info))
