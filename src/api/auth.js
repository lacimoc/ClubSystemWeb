import axios from 'axios'

export const login = (data) => {
    return axios.post('https://home.icuhome.space:12007/api/auth/login', data)
}

export const logout = () => {
    return axios.post('https://home.icuhome.space:12007/api/auth/logout')
}
