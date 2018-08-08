# Vue-Music
## 一| 前期工作
### 1.项目初始化
- npm install -g vue-cli
- vue init webpack vue-music
- npm install stylus stylus-loader -D
- 修改eslint.js
- 修改webpack.base.conf.js resolve配置项简化路径

### 2.装包
- npm install fastclick --save 取消默认300ms延迟
```JavaScript
import fastClick from 'fastclick'
fastClick.attach(document.body)
```
- npm install babel-polyfill
对es6的高级语法进行转义当运行环境中并没有实现的一些方法，babel-polyfill 会给其做兼容
需要在main.js中引入
- npm install babel-runtime --save 辅助编译 不需要引入即可用

> babel-runtime 是供编译模块复用工具函数。是锦上添花
> babel-polyfil是雪中送炭，是转译没有的api.

## 二| 开始项目
### 1. 顶部导航栏 tab
建立基本的页面骨架，基本的组件引入
header rank recommend search singer tab 这几个组件组成页面骨架

### 2. recommend组件

- **数据获取**
qq音乐

#### **Jsonp**
> Jsonp发送的不是一个ajax请求，他动态创建一个script标签，script没有同源策略限制，所以能跨域  有一个返回参数callback

- 安装： npm install jsonp@0.2.1
[jsonp github仓库](https://github.com/webmodules/jsonp)
- 以后需要多出引用jsonp跨域请求，将其创建在 `scr/common/jsonp.js` 中
```JavaScript
import originJSONP from 'jsonp'

export default function jsonp(url, data, option) {
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
```

> **注意**：当路径报错的时候，我们要想到webpack.base.conf.js配置文件中的 alias 选项 确保路径是非匹配

#### Recommend的数据获取
1. 在 `recommend.vue` 中的 `created` 生命周期钩子中调用`_getRecommend` 方法
2. `_getRecommend` 方法调用`recommend.js`中暴露出来的`getRecommend`方法
3. 而 `getRecommend` 房发调用了 `Jsonp` 方法， Jsonp方法抓取接口，从而获得数据

#### 轮播图组件
> 轮播图数据获取完成后，就下来做的就是搭建轮播页面 ，接下来编写一个轮播组件 `slider.vue`
- 使用了第三方轮播 better-scroll
> 新版的snap属性集合成了一个对象选项 而旧版的是单独的属性名，这点要注意
- `_setSliderWidth`方法 -- 轮播图组件的宽度计算
- `_initSlider()`方法 -- 使用`new BScroll` 创建轮播实例
> 其中使用了BS插件的 `getCurrentPage` `goToPage` 方法 来获取和跳转当前页面来实现dots导航点的实现
