import Vue from 'vue'

const Toast = Vue.extend(require('./toast.vue'))
let toastPool = []

let getAnInstance = function () {
    if (toastPool.length > 0) {
        let instance = toastPool[0]
        toastPool.splice(0, 1)
        return instance
    }
    let instance = new Toast({
        el: document.createElement('div')
    })
    instance.vm = instance.$mount()
    return instance
}

let returnAnInstance = function (instance) {
    if (instance) {
        toastPool.push(instance)
    }
}

export default function (message, duration = 1500) {
    let instance = getAnInstance()
    instance.message = message
    Vue.nextTick(function () {
        document.body.appendChild(instance.vm.$el)
        setTimeout(function () {
            instance.vm.$el.remove()
            returnAnInstance(instance)
        }, duration)
    })
}
