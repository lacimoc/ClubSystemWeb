import { defineStore } from 'pinia'

export const useSidebarStore = defineStore('sidebar', {
    state: () => ({
        collapse: false
    }),
    actions: {
        toggleCollapse() {
            this.collapse = !this.collapse
        }
    },
    persist: true
})