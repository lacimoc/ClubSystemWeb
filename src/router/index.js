import { createRouter, createWebHistory } from 'vue-router'

const routes = [
    {
        path: '/',
        name: 'Dashboard',
        component: () => import('@/views/Dashboard.vue'),
        meta: { title: '我的活动', icon: 'DataAnalysis' }
    },
    {
        path: '/activitySignUp',
        name: 'ActivitySignUp',
        component: () => import('@/views/ActivitySignUp.vue'),
        meta: { title: '活动报名', icon: 'Goods' }
    },
    {
        path: '/users',
        name: 'Users',
        component: () => import('@/views/Users.vue'),
        meta: { title: '用户管理', icon: 'User' }
    },
    {
        path: '/activityManagement',
        name: 'ActivityManagement',
        component: () => import('@/views/ActivityManagement.vue'),
        meta: { title: '活动管理', icon: 'Edit' }
    },
    {
        path: '/settings',
        name: 'Settings',
        component: () => import('@/views/Settings.vue'),
        meta: { title: '系统设置', icon: 'Setting' }
    },
    {
        path: '/login',
        name: 'Login',
        component: () => import('@/views/Login.vue'),
        meta: { guest: true }
    },
    {
        path: '/working',
        name: 'Working',
        component: () => import('@/views/Working.vue'),
        meta: { guest: true }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes
})

export default router