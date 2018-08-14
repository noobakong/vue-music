import originJSONP from 'jsonp'

export default function jsonp(url, data, option) {
  // jsonp的三个参数
  // - url-->一个纯净的url地址
  // - data --> url中的 query 通过 data 拼到url上
  // - option
  url += (url.indexOf('?') < 0 ? '?' : '&') + param(data)
  return new Promise((resolve, reject) => {
    originJSONP(url, option, (err, data) => {
      if (!err) {
        resolve(data)
      } else {
        reject(err)
      }
    })
  })
}

function param (data) {
  let url = ''
  for (var k in data) {
    let value = data[k] !== undefined ? data[k] : ''
    url += `&${k}=${encodeURIComponent(value)}`
  }
  return url ? url.substring(1) : ''
}