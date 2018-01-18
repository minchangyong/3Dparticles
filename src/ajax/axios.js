import axios from 'axios'
import qs from 'qs'
import util from 'util'
import md5 from 'md5'

let appKey = 'QTSHE_USER_PC'
let version = '4.8.2'

/***
 * ajax请求函数
 * @param url
 * @param json
 * @param timeout
 * @returns {*}
 */
const FIX_URL = process.env.FIX_URL
var NEW_URL = process.env.NEW_URL
let $axios = {
  post: (url, json = {}, timeout = 30000) => {
    return new Promise((resolve, reject) => {
      if (!url) {
        console.error('ajax url必填')
        return
      }
      let timestamp = Date.now()
      let data = {}
      let params = {
        appKey,
        version,
        timestamp: timestamp,
        sign: url.indexOf('jobCenter') > -1 ? md5(appKey + timestamp + version) : md5(appKey + '4fa1141058034c9eaaddd542a9e36f5c' + timestamp),
        token: util.getToken()
      }
      let deviceId = window.localStorage.getItem('random_number')
      if (!deviceId) {
        params.deviceId = Math.random()
        window.localStorage.setItem('random_number', params.deviceId)
      } else {
        params.deviceId = deviceId
      }
      util.extend(data, params, json)
      if (url.indexOf('http') === -1 && url.indexOf('https') === -1) {
        if (url.indexOf('jobCenter') > -1 || url.indexOf('accountCenter') > -1) {
          url = NEW_URL + url
        } else {
          url = FIX_URL + url
        }
      }
      let jwttoken = util.getCookie('jwttoken') || ''
      let req = {
        url: url,
        method: 'post',
        data: qs.stringify(data),
        timeout: timeout,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/x-www-form-urlencoded'
          // 'Authorization': `Bearer ${jwttoken}`
        }
      }
      if (jwttoken) {
        req.headers.Authorization = `Bearer ${jwttoken}`
      }
      axios(req)
        .then((response) => {
          resolve(response.data)
          if (response.data.errCode === 4004 || response.data.code === 4004) {
            //util.getCurrentVersionInteractivePackage().evokeLoginPage()
          }
        })
        .catch((error) => {
          if (error.message) {
            reject(error.message)
          } else {
            reject(`ajax 异常: ${url}`)
          }
        })
    })
  }
}
export default $axios
