import {defineStore} from "pinia"

export const _adminStore = defineStore("admin",{
    state: () => {
        return {
            id: 0,
            account: "",
            token: "",
            detail: null
        }
    },
    actions: {},
    getters: {},
    persist: true
})