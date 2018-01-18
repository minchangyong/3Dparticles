import ajax from './axios.js'

export default function (Vue) {
    Vue.prototype.$axios = ajax
}
