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

## 二| 顶部tab导航 && Recommend 页面组件开发
### 1. 顶部导航栏 tab
建立基本的页面骨架，基本的组件引入
header rank recommend search singer tab 这几个组件组成页面骨架

### 2. recommend组件

- **数据获取**
qq音乐

#### Jsonp
> Jsonp发送的不是一个ajax请求，他动态创建一个script标签，script没有同源策略限制，所以能跨域  有一个返回参数 callback ， 后端解析url，返回一个方法。

- 安装： npm install jsonp@0.2.1
[jsonp github仓库](https://github.com/webmodules/jsonp)
- 以后需要多出引用jsonp跨域请求，将其创建在 `scr/common/jsonp.js` 中

#### jsonp promise化
```JavaScript
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
 // 拼接data到url
function param (data) {
  let url = ''
  for (var k in data) {
    let value = data[k] !== undefined ? data[k] : ''
    url += `&${k}=${encodeURIComponent(value)}`
  }
  // encodeURIComponent() 函数可把字符串作为 URI 组件进行编码。
  return url ? url.substring(1) : ''
}
```

> **注意**：当路径报错的时候，我们要想到webpack.base.conf.js配置文件中的 alias 选项 确保路径是否匹配

#### Recommend的数据获取
1. 在 `recommend.vue` 中的 `created` 生命周期钩子中调用`_getRecommend` 方法
2. `_getRecommend` 方法调用`recommend.js`中暴露出来的`getRecommend`方法
3. 而 `getRecommend` 方法调用了 `Jsonp` 方法， Jsonp方法抓取接口，从而获得数据

> - 有的jsonp接口url很长，但是真正的url知识前面的部分
> - 大公司一般用0来代表一切正常

#### 轮播图组件
- **轮播图数据获取完成后，就下来做的就是搭建轮播页面 ，接下来编写一个轮播组件 `slider.vue`**
  1. 新建`base`文件夹，储存如同slider.vue的基础组件
  在silder.vue中，我们使用了slot插槽，外部引用slider的时候slider标签里面包裹的dom会被插入到slot插槽部分。
  2. 在recommend.vue中 引入 `import Slider from 'base/slider/slider'`,并在components中注册Slider，之后就可以使用Slider标签了
  3. 将jsonp返回的slider数据存储到recommend数组中，然后遍历recommned 数组项循环渲染内容

> 这个时候我们打开项目，会发现已有数据，但是样式还不行，在props中添加loop，autoplay，interval（滚动间隔）， 

- **使用了第三方轮播 better-scroll 来进一步实现 slider**
  > 新版的BS中snap属性集合成了一个对象选项 而旧版的是单独的属性名，这点要注意
  1. 初始化BS，在什么时候初始化？
  我们要保证渲染的时机是正确的，通常在`mounted`生命周期钩子中初始化，保证BS正常渲染的话我们通常在mounted里面加一个延迟
  ```JavaScript
   mounted () {
      setTimeout(() => { // 浏览器17ms刷新一次， 这里延迟20ms 确保组件已经渲染完成
        this._setSliderWidth() // 设置slider宽度
        this._initDots() // 初始话dots
        this._initSlider() // 初始化slider
      }, 20)
  ```

  2. `_setSliderWidth`方法 -- 轮播图组件的宽度计算
  这里要注意，这时候执行玩宽度方法之后，可能无效，这是因为在宽度计算的时候，slot插槽里面的东西还未加载，为了解决这个问题，我们可以在recommend.vue中 给slider 的父元素 加上`v-if="recommends.length"`,确保渲染时机正确

  3. `_initSlider()`方法 -- 使用`new BScroll` 创建轮播实例，设置无限滚动及其他的相关初始化配置，至此，我们的轮播页面已经可以无缝滚动了  

  4. 添加dots导航
      > 五个数据，dom有七个，因为loop为ture的时候，bs会自动在前后各拷贝一份。我们想要添加dots，必须保证和数据数一样，所以我们应该在bs初始化之前完成dots的初始化

      初始化dots为一个长度为childern.length的数组
      `this.dots = new Array(this.children.length)`
      在slider.vue中循环
      ` v-for="(item,index) of dots"`
      添加选中样式
      `:class="{active:currentPageIndex === index}"`
      在bs滚动的时候 会派发一个事件 在初始化slider 绑定一个事件
      ```JavaScript
          this.slider.on('scrollEnd', () => {
          let pageIndex = this.slider.getCurrentPage().pageX
          if (this.loop) {
            pageIndex -= 1
            this.currentPageIndex = pageIndex
            if (this.autoplay) {
              clearTimeout(this.timer)
              this._play()
            }
          }
        })
      ```
      使用了 bs中的 `getCurrentPage` 方法来获取滚动的当前页面
      在autoplay中使用了bs 的 `goToPage` 方法来实现轮播

- **监听窗口大小改变自动改变 && 优化slider**
> 之前的slider基本完成，但是此时如果改变窗口大小，页面就会乱掉

使用resize窗口监听事件，配合bs的refresh刷新方法 实现每一次改变窗口大小都能重置宽度
```JavaScript
  window.addEventListener('resize', () => {
    if (!this.slider) { // slider还没有初始化的时候
      return
    }
    this._setSliderWidth(true)
    this.slider.refresh()
  })
```
在app.vue 中使用keepalive标签，来避免重复请求

我们在跳转到其他页面的时候，要记得清理定时器，优化效率
```
  destroyed() {
    clearTimeout(this.timer) // 性能优化小习惯
  }
```

### 歌单组件
#### 歌单组件数据获取
在pc版的qq音乐中获取请求接口

> 由于QQ音乐的歌单数据时，请求接口host和refer规定了必须是qq音乐的地址，我们本地就会请求失败。为了解决这个问题，我们可以使用 手动代理 伪装成qq音乐地址请求接口 欺骗接口

#### Vue proxyTable代理 后端代理接口
>  在项目开发的时候，接口联调的时候一般都是同域名下，且不存在跨域的情况下进行接口联调，但是当我们现在使用vue-cli进行项目打包的时候，我们在本地启动服务器后，比如本地开发服务下是 http://localhost:8080 这样的访问页面，但是我们的接口地址是 http://xxxx.com/save/index 这样的接口地址，我们这样直接使用会存在跨域的请求，导致接口请求不成功，因此我们需要在打包的时候配置一下，我们进入 config/index.js 代码下如下配置即可：

```JavaScript
dev: {
    // 静态资源文件夹
    assetsSubDirectory: 'static',
    // 发布路径
    assetsPublicPath: '/',
    // 代理配置表，在这里可以配置特定的请求代理到对应的API接口
    // 例如将'localhost:8080/api/xxx'代理到'www.example.com/api/xxx'
    // 使用方法：https://vuejs-templates.github.io/webpack/proxy.html
    proxyTable: {
      '/': {
        target: 'https://c.y.qq.com', // 接口的域名
        secure: false, // 如果是https接口，需要配置这个参数
        changeOrigin: true, // 如果接口跨域，需要进行这个参数配置
        pathRewrite: {
          '^/api': '/'
        },
        headers: {
          referer: 'https://c.y.qq.com'
        }
      }
    }
```

> 注意： '/api' 为匹配项，target 为被请求的地址，因为在 ajax 的 url 中加了前缀 '/api'，而原本的接口是没有这个前缀的，所以需要通过 pathRewrite 来重写地址，将前缀 '/api' 转为 '/'。如果本身的接口地址就有 '/api' 这种通用前缀，就可以把 pathRewrite 删掉。

#### 表单组件开发
我们通过代理获得ajax数据后，将其赋值给 discList
`this.discList = res.data.list`
之后将disclist渲染到组件中
`v-for="item of discList"`

- 滚动组件 Scroll.vue
由于 滚动 是一个很基础的组件 所以在common里创建scroll.vue组件，使代码结构化
```
<template>
  <div ref="wrapper">
    <slot></slot>
  </div>
</template>
```

> 在Recommend.vue中  一定要绑定data数据，因为scroll.vue中 watch 监听data数据的变化来刷新better-scroll 这里的可以绑定recommend.vue中的 discList 数组来座位 data

> 这里的 recommends 和 discList 数据获取是有先后顺序的，一般都是先recommends再discList，如果先获取到的是discList的话 歌单列表就会出现滚动不到底部的问题

为了确保recommend数据后加载的情况下我们的表单还能正常滚动发，我们可以给slider中的img添加一个loadImage方法`@load="loadImage"`，方法调用一个 refresh方法即可 `this.$refs.scroll.refresh()`
为了避免请求的每一张图片都执行一次，我们可以设置一个bool标志位来控制 ，只要有一张图片加载完成即可，如下：
```JavaScript
      loadImage() {
        if (!this.checkLoaded) {
          this.$refs.scroll.refresh()
          this.checkLoaded = true
        }
      }
```

#### 表单组件优化

- **图片的懒加载**
> 节省流量，提升加载速度
npm 安装
`npm install vue-lazyload`
在main.js中添加代码
```JavaScript
import VueLazyLoad from 'vue-lazyload'
Vue.use(VueLazyLoad, {
  loading: require('common/images/touxiang.png')
})

```
在Recommend.vue中使用
`<img v-lazy="item.imgurl" alt="">`