import axios from "../ajax/axios"
let util = {
  /**
     * 获取登录token
     */
  getToken: function() {
    var token = window.sessionStorage.getItem('identity_new');
    if (token == null) {
      return "";
    }
    return token;
  },
  /**
     * $.extend方法原型
     */
  extend: function() {
    var target = arguments[0] || {}; //目标对象
    var e = false; //是否进行深拷贝
    var h = 1; //参数个数
    var n = arguments.length; //实际传入的参数个数
    var temp; // 临时保存源参数
    if (typeof target === "boolean") {
      e = arguments[0];
      target = arguments[1] || {};
      //skip the boolean and target
      h = 2;
    }
    // Handle case when target is a string or something (possible in deep copy)
    if (typeof target !== "object" && typeof target !== "function") {
      target = {};
    }
    // extend object itself if only one argument is passed
    if (n === h) {
      target = this;
      --h;
    }
    for (; h < n; h++) {
      temp = arguments[h];
      if (typeof temp !== undefined) {
        for (var t in temp) {
          var src = target[t];
          var copy = temp[t];
          if (target === copy) {
            continue;
          }
          if (
            e &&
            temp[t] &&
            typeof temp[t] === "object" &&
            !temp[t].nodeType
          ) {
            //进行深拷贝
            target[t] = this.extend(e, src || {}, temp[t]);
          } else {
            //浅拷贝
            if (temp[t] !== undefined) {
              target[t] = temp[t];
            }
          }
        }
      }
    }
    return target;
  },
  /**
     * 获取过去多少天
     * @param  {Number} n 过去多少天
     * @return {Object}   Date对象
     */
  getPassDate(n) {
    return new Date(new Date() - n * 24 * 60 * 60 * 1000);
  },
  /**
     * 获取某一天时间戳
     * @param  {time} 支持时间戳、date对象、yyyy-MM-dd hh:mm:ss 三种格式
     * @return {Object}     zeroTimestamp 零点时间戳，currentTimestamp 当前时间戳，endTimestamp 当天结束之前的最后一秒 23:59:59
     */
  getOtherDayTimestamp(d) {
    var now = new Date();
    now.setHours(0);
    now.setMinutes(0);
    now.setSeconds(0);
    now.setMilliseconds(0);

    // 当前时间零点时间戳
    let currentZeroTimestamp = (now.getTime() / 1000) | 0;
    // 当前时间戳
    let currentTimestamp = (new Date().getTime() / 1000) | 0;

    // 当前时间和零点的差值
    let currentZeroDifference = currentTimestamp - currentZeroTimestamp;

    // 获取某一天零点的时间戳
    let otherDayZeroTimestamp =
      (new Date(this.dateFormat(d, "yyyy/MM/dd") + " 00:00:00").getTime() /
        1000) |
      0;

    // 获取某一天零点的时间戳
    let otherDayEndTimestamp =
      (new Date(this.dateFormat(d, "yyyy/MM/dd") + " 23:59:59").getTime() /
        1000) |
      0;

    // 获取某一天的当前时间戳
    let otherDayCurrentTimestamp =
      otherDayZeroTimestamp + currentZeroDifference;

    return {
      zeroTimestamp: otherDayZeroTimestamp,
      currentTimestamp: otherDayCurrentTimestamp,
      endTimestamp: otherDayEndTimestamp
    };
  },
  /**
     * @desc 删除字符串首尾空
     * @param  {string} str 要处理的字符串
     * @return {string} 删除收尾空之后的字符串
     */
  trimStr(str) {
    return str.replace(/(^\s*)|(\s*$)/g, "");
  },
  /**
     * @desc 获取链接参数的值
     * @param  {string} name 参数名字
     * @param  {string} [url] 链接url，为空的时候取location.href
     * @return {string} 参数
     */
  getQueryString(name, url) {
    url = url == null ? window.location.href : url;
    url = url.split("#")[0];

    var reg = new RegExp("(^|\\?|&)" + name + "=([^&]*)(\\s|&|$)", "i");
    return reg.test(url) ? RegExp.$2.replace(/\+/g, " ") : "";
  },
  /**
     * url 参数转 object 对象
     * @param  {String} params 如果不传，则取当前 url 的参数
     * @return {Object}
     * 例如： urlParamToJson('name=heyhey&page=2')
     *     返回： {name: 'heyhey', page: '2'}
     */
  urlToJson(params) {
    var search =
      params ||
      window.location.search.substring(1) ||
      window.location.hash.substring(1).split("?")[1];
    return search
      ? JSON.parse(
          '{"' + search.replace(/&/g, '","').replace(/=/g, '":"') + '"}',
          function(key, value) {
            return key === "" ? value : decodeURIComponent(value);
          }
        )
      : {};
  },

  param(obj = {}) {
    // 序列化对象
    let arr = [];

    Object.keys(obj).map(function(key) {
      let item = [key, obj[key]].join("=");
      arr.push(item);
    });

    return arr.join("&");
  },
  setCookie(name, value) {
    let Days = 30;
    let exp = new Date();
    exp.setTime(exp.getTime() + Days * 24 * 60 * 60 * 1000);
    document.cookie =
      name +
      "=" +
      encodeURIComponent(value) +
      ";expires=" +
      exp.toGMTString() +
      ";path=/";
    return true;
  },
  getCookie(name) {
    var arr,
      reg = new RegExp("(^| )" + name + "=([^;]*)(;|$)");
    if ((arr = document.cookie.match(reg))) {
      return decodeURIComponent(arr[2]);
    } else {
      return null;
    }
  },
  delCookie(name) {
    var exp = new Date();
    exp.setTime(exp.getTime() + -1 * 24 * 60 * 60 * 1000);
    var cval = this.getCookie(name);
    document.cookie =
      name + "=" + cval + "; expires=" + exp.toGMTString() + ";path=/";
  },
  unique(array) {
    array.sort();
    var re = [array[0]];
    for (var i = 1; i < array.length; i++) {
      if (array[i] !== re[re.length - 1]) {
        re.push(array[i]);
      }
    }
    return re;
  },
  setHistory(array) {
    //存localStorage数组
    array = util.unique(array);
    if (array.length >= 5) {
      array = array.slice(0, 4);
      array.reverse();
    }
    window.localStorage.history = array.join(",");
  },

  getHistory() {
    //取出数组
    return window.localStorage.history;
  },
  //数字转中文数字
  convertToChinese(num) {
    if (!/^\d*(\.\d*)?$/.test(num)) {
      alert("Number is wrong!");
      return "Number is wrong!";
    }
    var AA = new Array("零", "一", "二", "三", "四", "五", "六", "七", "八", "九");
    var BB = new Array("", "十", "百", "千", "万", "亿", "点", "");
    var a = ("" + num).replace(/(^0*)/g, "").split("."),
      k = 0,
      re = "";
    for (var i = a[0].length - 1; i >= 0; i--) {
      switch (k) {
        case 0:
          re = BB[7] + re;
          break;
        case 4:
          if (!new RegExp("0{4}\\d{" + (a[0].length - i - 1) + "}$").test(a[0]))
            re = BB[4] + re;
          break;
        case 8:
          re = BB[5] + re;
          BB[7] = BB[5];
          k = 0;
          break;
      }
      if (k % 4 == 2 && a[0].charAt(i + 2) != 0 && a[0].charAt(i + 1) == 0)
        re = AA[0] + re;
      if (a[0].charAt(i) != 0) re = AA[a[0].charAt(i)] + BB[k % 4] + re;
      k++;
    }

    if (a.length > 1) {
      //加上小数部分(如果有小数部分)
      re += BB[6];
      for (var i = 0; i < a[1].length; i++) re += AA[a[1].charAt(i)];
    }
    re = re.replace("一十", "十");
    return re;
  },
  spaceReplaceHollowString(content) {
    try {
      content = content.replace(/ /g, "");
    } catch (e) {
      throw e;
    }
    return content;
  },
  /*** @param {Object} datesStr */
  sprDay(datesStr) {
    datesStr = util.spaceReplaceHollowString(datesStr);
    var dataAllList = [];
    var dataAllListIndex = 0;
    var dateList = datesStr.split(",");
    dateList = dateList.sort();
    var year = null;
    for (var dIndex = 0; dIndex < dateList.length; dIndex++) {
      var dataStr = dateList[dIndex];
      var dateSplit = dataStr.split("-");
      if (dateSplit[0] !== year) {
        dataAllList[dataAllListIndex] = {
          year: dateSplit[0]
        };
        year = dateSplit[0];
        var mouthAllList = new Array();
        var mouthAllListIndex = 0;
        var mouth = null;
        for (var yearIndex = 0; yearIndex < dateList.length; yearIndex++) {
          var yearDataStr = dateList[yearIndex];
          yearDataStr = yearDataStr.split("-");
          if (yearDataStr[0] === year) {
            if (mouth !== yearDataStr[1]) {
              mouthAllList[mouthAllListIndex] = {
                mouth: yearDataStr[1]
              };
              mouth = yearDataStr[1];
              dataAllList[dataAllListIndex].mouth = mouthAllList;
              var dayAllList = new Array();
              var dayAllListIndex = 0;
              var day = null;
              var dayYear = 0;
              for (var dayIndex = 0; dayIndex < dateList.length; dayIndex++) {
                var dayDataStr = dateList[dayIndex];
                dayYear++;
                dayDataStr = dayDataStr.split("-");
                if (dayDataStr[0] === year && dayDataStr[1] === mouth) {
                  dayAllList[dayAllListIndex] = dayDataStr[2];
                  dayAllListIndex++;
                  day = dayDataStr[2];
                }
                dataAllList[dataAllListIndex].mouth[
                  mouthAllListIndex
                ].days = dayAllList;
              }
              mouthAllListIndex++;
            }
          }
        }
        dataAllListIndex++;
      }
    }
    return dataAllList;
  },
  timestamp(time) {
    let day = Math.floor(time / 86400);
    let hour = Math.floor(time / 3600 % 24);
    let min = Math.floor(time / 60 % 60);
    hour = hour < 10 ? "0" + hour : hour;
    min = min < 10 ? "0" + min : min;
    if (day > 0) {
      time = `${day}天${hour}小时${min}`;
    }
    if (day <= 0 && hour > 0) {
      time = `${hour}小时${min}分`;
    }
    if (day <= 0 && hour <= 0) {
      time = `${min}分`;
    }
    return time;
  },
  dateFormat(d, fmt) {
    // 时间格式化
    let date = "";
    if (!d) {
      return;
    }
    try {
      if (Number.isInteger(d)) {
        date = new Date(d);
      } else if (typeof d === "string") {
        // safari使用yyyy-MM-dd hh:mm格式会出错
        let ua = window.navigator.userAgent.toLowerCase();

        if (ua.match(/.*version\/([\w.]+).*(safari).*/)) {
          d = d.replace(/-/g, "/");
          date = new Date(d);
        }
      } else if (typeof d === "object") {
        date = d;
      } else {
        throw new Error("日期转化错误");
      }
    } catch (e) {
      console.warn(e);
      return;
    }
    var o = {
      "M+": date.getMonth() + 1, //月份
      "d+": date.getDate(), //日
      "H+": date.getHours(), //小时
      "m+": date.getMinutes(), //分
      "s+": date.getSeconds(), //秒
      "q+": Math.floor((date.getMonth() + 3) / 3), //季度
      S: date.getMilliseconds() //毫秒
    };
    if (/(y+)/.test(fmt)) {
      fmt = fmt.replace(
        RegExp.$1,
        (date.getFullYear() + "").substr(4 - RegExp.$1.length)
      );
    }
    for (var k in o) {
      if (new RegExp("(" + k + ")").test(fmt)) {
        fmt = fmt.replace(
          RegExp.$1,
          RegExp.$1.length === 1
            ? o[k]
            : ("00" + o[k]).substr(("" + o[k]).length)
        );
      }
    }
    return fmt;
  },
  searchParam(par) {
    //获取地址栏参数
    var param = {};
    if (util.isEmpty(par)) {
      return param;
    } else {
      if (par.indexOf("?") != -1) {
        par = par.substring(1, par.length);
      }
      var array = par.split("&");
      for (var i = 0; i < array.length; i++) {
        var array2 = new Array();
        var ss = array[i].toString();
        array2[0] = ss.substring(0, array[i].indexOf("="));
        array2[1] = array[i].substring(
          array[i].indexOf("=") + 1,
          array[i].length
        );
        param[array2[0]] = array2[1];
      }
      return param;
    }
  },
  //判空
  isEmpty(value) {
    if (
      value == null ||
      value == undefined ||
      value == "" ||
      value == "null" ||
      value == "undefined"
    ) {
      return true;
    }
    return false;
  },
  isIos() {
    //判断IOS
    var u = navigator.userAgent,
      app = navigator.appVersion;
    var isiOS = !!u.match(/\(i[^;]+;( U;)? CPU.+Mac OS X/);
    return isiOS;
  },
  isAndroid() {
    //判断安卓
    var u = navigator.userAgent,
      app = navigator.appVersion;
    var isAndroid = u.indexOf("Android") > -1 || u.indexOf("Linux") > -1;
    return isAndroid;
  },
  //青团社App ios终端
  isIosApp() {
    var u = navigator.userAgent,
      app = navigator.appVersion;
    var isiOS = u.indexOf("qtsapp-student-ios") >= 0;
    return isiOS;
  },
  //青团社App Android终端
  isAndroidApp() {
    var u = navigator.userAgent,
      app = navigator.appVersion;
    var isAndroid = u.indexOf("qtsapp-student-android") >= 0;
    return isAndroid;
  },
  testEmoji(str, replaceSign) {
    // 检测是否输入了emoji
    let regExp = /[\uD800-\uDBFF][\uDC00-\uDFFF]/g;
    if (typeof replaceSign !== "undefined") {
      return str.replace(regExp, replaceSign);
    }
    return regExp.test(str);
  },
  isWeiXin() {
    var ua = window.navigator.userAgent.toLowerCase();
    if (ua.match(/MicroMessenger/i) == "micromessenger") {
      return true;
    } else {
      return false;
    }
  },
  isQQ() {
    var u = navigator.userAgent,
      app = navigator.appVersion;
    if (u.indexOf("MQQBrowser") > -1) {
      return true;
    } else {
      return false;
    }
  },
  collectPtpError(ptpData) {
    let collection = JSON.parse(sessionStorage.getItem("ptpErrorCollections")) || []
    let eventList = ptpData.eventList ? JSON.parse(ptpData.eventList) : []
    let token = ptpData.token;
    let appKey = ptpData.appKey;
    let version = ptpData.version;
    let cityId = ptpData.cityId || 0;
    let browerVersion = window.navigator.userAgent.toLowerCase();
    let ipAddress = window.location.origin;
    if (eventList.length) {
      eventList.map(item => {
        let eventId = item.eventId || 0
        let errorInfo = JSON.stringify(item)
        let errorData = {
          eventId,
          token,
          appKey,
          version,
          cityId,
          browerVersion,
          ipAddress,
          errorInfo
        };
        collection.push(errorData);
      })
      sessionStorage.setItem("ptpErrorCollections", JSON.stringify(collection));
      this.sendPtpErrorCollections();
    }
  },
  sendPtpErrorCollections() {
    return
    let _this = this;
    let ptpErrorCollections = JSON.parse(
      sessionStorage.getItem("ptpErrorCollections")
    ) || [];
    if (!ptpErrorCollections.length) {
      return;
    } else {
      let errorData = ptpErrorCollections[0];
      axios.set("/ptpError/record/add", errorData)
      .then(res => {
        if (res.success) {
          ptpErrorCollections.splice(0, 1);
          sessionStorage.setItem(
            "ptpErrorCollections",
            JSON.stringify(ptpErrorCollections)
          );
          if (!ptpErrorCollections.length) {
            return;
          } else {
            _this.sendPtpErrorCollections();
          }
        } else {
          setTimeout(() => {
            _this.sendPtpErrorCollections();
          }, 5000);
        }
      })
      .catch(response => {
        setTimeout(() => {
          _this.sendPtpErrorCollections();
        }, 5000);
      });
    }
  },
  //埋点数据
  buriedPoint(eventList) {
    var postData = {
      token: util.getToken(),
      version: "4.8.2", //版本号
      appKey: 5, //设备标示
      cityId: util.getCookie("townId"), //window.sessionStorage.getItem('cityIds'),
      eventList: eventList
    };
    return axios.set("/ptp/savePtp", postData);
  },
  compareVersion() {
    if (arguments[0] && arguments[1]) {
      let arr0 = arguments[0].split(".");
      let arr1 = arguments[1].split(".");
      for (var i = 0; i < arr0.length; i++) {
        if (Number(arr0[i]) > Number(arr1[i])) {
          return true;
        } else if (Number(arr0[i]) === Number(arr1[i])) {
          if (i === arr0.length - 1) {
            return true;
          } else {
            continue;
          }
        } else {
          return false;
        }
      }
    } else {
      return false;
    }
  },
  getAppVersion() {
    let u = navigator.userAgent;
    let str = u.substring(u.indexOf("-{") + 1);
    try {
      return JSON.parse(str).qtsVersion;
    } catch (e) {
      if (u.indexOf("qtsapp-student") > -1) {
        return "<4.6.3";
      } else {
        return "H5";
      }
    }
  },
  getCurrentVersionInteractivePackage() {
    return oldInterface
    let version = this.getAppVersion();
    let flag = false;
    if (version === "H5" || version === "<4.6.3") {
      flag = false;
    } else {
      flag = this.compareVersion(version, "4.6.3");
    }
    // let version = this.getAppVersion()
    // let flag = false
    // if (version === 'H5') {
    //     flag = true
    // } else {
    //     flag = this.compareVersion(version, '4.8.2')
    // }
    // var flag = true
    // if (!flag) {
    //   return oldInterface;
    // } else {
    //   return newInterface;
    // }
  },
  // 字符串前面补0，length为补0后一共要求的位数，例如 prefixInteger('a', 3) 返回 00a
  prefixInteger(str, length) {
    return (Array(length).join('0') + str).slice(-length);
  }
};
let arr = [
  "Arguments",
  "Function",
  "String",
  "Number",
  "Date",
  "RegExp",
  "Error"
];
arr.forEach(function(name) {
  util["is" + name] = function(obj) {
    return toString.call(obj) === "[object " + name + "]";
  };
});
export default util;
