// @/api/activity.js
import axios from "axios";

export const getActivities = () => {
    return axios.post(`https://home.icuhome.space:12007/api/getUserActivities`, {}, {headers: {"Authorization": `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json"}})
}

export const cancelActivity = (activityId) => {
    return axios.post(`https://home.icuhome.space:12007/api/cancelActivity`, {"activityId": activityId}, {headers: {"Authorization": `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json"}})
}

export const fetchActivitiesApi = () => {
    return axios.post(`https://home.icuhome.space:12007/api/getActivities`, {}, {headers: {"Authorization": `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json"}})
}

export const createActivityApi = (activityData) => {
    return axios.post(`https://home.icuhome.space:12007/api/createActivity`, activityData, {headers: {"Authorization": `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json"}})
}

export const deleteActivityApi = (activityId) => {
    return axios.post(`https://home.icuhome.space:12007/api/deleteActivity`, {"activityId": activityId}, {headers: {"Authorization": `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json"}, data: {"activityId": activityId}})
}

export const updateActivityApi = (activityData) => {
    return axios.post(`https://home.icuhome.space:12007/api/updateActivity`, activityData, {headers: {"Authorization": `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json"}})
}

export const fetchDepartmentsApi = () => {
    return axios.post(`https://home.icuhome.space:12007/api/getDepartments`, {}, {headers: {"Authorization": `Bearer ${localStorage.getItem("token")}`}})
}

export const getUsers = () => {
    return axios.post(`https://home.icuhome.space:12007/api/getUsers`, {}, {headers: {"Authorization": `Bearer ${localStorage.getItem("token")}`}})
}

export const createUser = (UserData) => {
    return axios.post(`https://home.icuhome.space:12007/api/createUser`, UserData, {headers: {"Authorization": `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json"}})
}

export const deleteUser = (UserId) => {
    return axios.post(`https://home.icuhome.space:12007/api/deleteUser`, {"userId": UserId}, {headers: {"Authorization": `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json"}})
}

export const updateUser = (UserData) => {
    return axios.post(`https://home.icuhome.space:12007/api/updateUser`, UserData, {headers: {"Authorization": `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json"}})
}

export const resetPassword = (UserId) => {
    return axios.post(`https://home.icuhome.space:12007/api/resetPassword`, {"userId": UserId}, {headers: {"Authorization": `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json"}})
}

export const changePassword = (PasswordData) => {
    return axios.post(`https://home.icuhome.space:12007/api/changePassword`, PasswordData, {headers: {"Authorization": `Bearer ${localStorage.getItem("token")}`, "Content-Type": "application/json"}})
}

export const getActivityDetail = (id) => {
    return axios.get(`https://home.icuhome.space:12007/api/getActivities`, {headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}})
}

export const submitEnrollment = (data) => {
    return axios.post('https://home.icuhome.space:12007/api/enrollActivity', data, {headers: {'Authorization': `Bearer ${localStorage.getItem('token')}`}})
}