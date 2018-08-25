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

- **解决图片点击失效**
有些情况下点击事件之间互相冲突，我们在使用fastclick的时候，可以给点击的dom添加一个fastclick里的一个css `needsclick`的类名，来确保点击事件可以正常执行

- **loading组件**
为了增加交互体验，在表单还未渲染之前，我们可以使用一个loading来占位。

在base中新建loading组件
```JavaScript
<template>
    <div class="loading">
      <img src="./loading.gif" alt="">
      <p class="desc">{{title}}</p>
    </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: '许文瑞正在吃屎。。。。'
    }
  }
}
</script>
```

在recommend.vue中添加如下代码：
```HTML
  <div class="loading-content" v-show="!discList.length">
    <loading></loading>
  </div>
```

## 三| 歌手组件开发
### 1.歌手首页开发

#### 数据获取

- 数据获取依旧从qq音乐官网获取

  [歌手接口](https://c.y.qq.com/v8/fcg-bin/v8.fcg)

- 创建singer.js

  我们和以前一样，利用我们封装的jsonp等发放，来请求我们的接口，返回给singer.vue。

> 成功获取数据以后，我们发现，官网的数据的数据结构和我们想要的不一样，所以我们下一步进行数据结构的聚合处理



#### 数据处理

我们希望的数据结构是数据按照字母排序的数组再加上一个热门的数组的集合，显然我们在官网的到的数据不是这样的，我们构造一个_normalizeSinger方法来完成：

```JavaScript
_normalizeSinger(list) { // 处理数据结构 形参为list
      let map = { // 把数据都存在map对象中
        hot: { // 热门城市
          title: HOT_NAME,
          items: [] // 初始化空数组
        }
      }
      list.forEach((item, index) => { // 循环数组中的每一项
        if (index < HOT_SINGER_LENGTH) { // 因为原始数据是按照热度排列的，所以获取前十的热门
          map.hot.items.push(new Singer({ // push到我们的hot数组中
          // new Singer: 为了模块化和减少代码的复用，我们在common > js 创建了一个singer.js
          // 来创建一个类构造器 里面包括歌手头像的拼接
            id: item.Fsinger_mid,
            name: item.Fsinger_name
          }))
        }
        const key = item.Findex // 歌手姓氏字首字母
        if (!map[key]) { // 如果不存在
          map[key] = { // 创建
            title: key,
            items: []
          }
        }
        map[key].items.push(new Singer({ // 追加到map.items中
          id: item.Fsinger_mid,
          name: item.Fsinger_name
        }))
      })

      // 为了得到有序列表 我们需要处理map
      let hot = [] // 热门城市
      let ret = [] // 字母表城市
      for (let key in map) { // 循环
        let val = map[key]
        if (val.title.match(/[a-zA-Z]/)) { // 正则匹配字母
          ret.push(val)
        } else if (val.title === HOT_NAME) {
          hot.push(val) // 热门城市
        }
      }
      ret.sort((a, b) => {
        return a.title.charCodeAt(0) - b.title.charCodeAt(0) // 把字母城市按charcode字母排序
      })

      return hot.concat(ret) // 将字母城市追加到hot城市 返回给外部
    }
```



**细节点注意**

> 关于歌手图片的获取，通过官网观察，我们发现图片是有一个网址拼接`item.Fsinger_mid` 来完成的，所以我们在common >js >singer.js中 使用了`${}`来拼接，获取歌手图片地址，拼接url语法是使用的是 `` 而不是' '



#### listview.vue开发

数据我们获取到了，我们接下来开发listview.vue组件，因为这个列表组件我们后面有很多页面也要用到，所以我们在base下创建基础组件 listview.vue

在listview.vue中引入 我们之前封装好的scroll组件
`import Scroll from 'base/scroll/scroll'`

通过获取的数据，进行两次遍历渲染，就能得到我们想要的dom页面了

html代码如下

```html
<template>
  <scroll class="listview" :data="data">
    <ul>
      <li v-for="(group, index) in data" :key="index" class="list-group">
        <h2 class="list-group-title">{{group.title}}</h2>
        <ul>
          <li v-for="(item, index) in group.items" :key="index" class="list-group-item">
            <img v-lazy="item.avatar" class="avatar">
            <span class="name">{{item.name}}</span>
          </li>
        </ul>
      </li>
    </ul>
    <div class="list-shortcut">
      <ul>
        <li class="item" v-for="(item, index) in shortcutList" :key="index">
          {{item}}
        </li>
      </ul>
    </div>
  </scroll>
</template>
```

至此 歌手页面就能正常滚动了

####  shortcutList字母导航器



接下来，**开始我们的字母导航器的样式制作**

我们可以在listview.vue中创建一个计算属性shortcutList

```javascript
computed: {
      shortcutList() {
        return this.data.map((group) => {
          return group.title.substr(0, 1)
        })
      }
    },
```

之后在页面中v-for渲染shortcutList即可 配合css样式 实现边栏的字母导航dom的制作

```html
    <div
      class="list-shortcut"
      @touchstart="onShortcutTouchStart"
      @touchmove.stop.prevent="onShortcutTouchMove"
    >
      <ul>
        <li
          class="item"
          v-for="(item, index) in shortcutList"
          :key="index"
          :data-index="index"
          :class="{'current': currentIndex === index}"
        >
          {{item}}
        </li>
      </ul>
    </div>
```

静态的字母导航在页面中已经展现出来了

接下来 **来给导航器添加滑动点击等事件，使其动态化**

- **滑动右边字母导航 listview实时滚动**

  在字母html标签中加入touch事件**

  ```
    @touchstart="onShortcutTouchStart"
    @touchmove.stop.prevent="onShortcutTouchMove"
  ```

  在循环中遍历index值，在后面的touch中获取索引，由于蕾类似此类获取数据的方法是很多地方都能用到的，我们在dom.js中添加getData方法

  ```
  export function getData(el, name, val) {
    const perfix = 'data-'
    name = perfix + name
    if (val) {
      return el.setAttribute(name, val)
    } else {
      return el.getAttribute(name)
    }
  }
  ```

  接下来 为scroll组件添加 跳转方法

  ``` javascript
  scrollTo() {
        this.scroll && this.scroll.scrollTo.apply(this.scroll, arguments)
      },
      scrollToElement() {
        this.scroll && this.scroll.scrollToElement.apply(this.scroll, arguments)
  ```

  完整的touch方法代码如下：

```javascript
onShortcutTouchStart(e) {
      let anchorIndex = getData(e.target, 'index') // 获取data
      let firstTouch = e.touches[0] // 刚开始触碰的位置坐标
      this.touch.y1 = firstTouch.pageY
      this.touch.anchorIndex = anchorIndex
      this._scrollTo(anchorIndex) // 通过使用_scrollTo方法来跳转到我们的字母所在位置
    },
    onShortcutTouchMove(e) { // 屏幕滑动方法 要明确开始滚动和结束滚动的两个位置，然后计算出滚动到哪一个字母
      let firstTouch = e.touches[0] // 停止滚动时的位置坐标
      this.touch.y2 = firstTouch.pageY // 保存到touch对象中
      let delta = (this.touch.y2 - this.touch.y1) / ANCHOR_HEIGHT | 0 // 计算滚动了多少个字母
      let anchorIndex = parseInt(this.touch.anchorIndex) + delta // this.touch.anchorIndex 字符串转化为整型
      this._scrollTo(anchorIndex) // 跳转到字母位置
    }
```

> 注意：通过getData方法的到的anchorIndex是一个字符串，记得要用parseInt转化为数字

至此 滑动字母导航器 左边的list已经可以实现滚动了



- 滚动左边list 右边字母导航高亮

    > 解决这个问题 ，就要知道左边listview滚动到的相对位置

    1. 在data中增加scrollY 和 currentIndex来实时监听listview滚动的位置 和 应该滚动到的具体索引

    2. 在scroll标签组件绑定@scroll='scroll' 来将滚动的实时位置赋值给this.scrollY

       ```javascript
           scroll(pos) {
             this.scrollY = pos.y
             console.log(pos) // 测试
           }
       ```

    3. 在listview中添加监视属性data

       ```javascript
       watch: {
           data() {
             setTimeout(() => { // 数据变化到dom变化有一个延迟，所以这个加一个定时器
               this._calculateHeight() // 计算每一个group的高度
             }, 20)
           }
       ```

       > 每次data变化，都会重新计算group的高度  

    4. _calculateHeight方法

       ```javascript
           _calculateHeight() {
             this.listHeight = []
             const list = this.$refs.listGroup
             let height = 0
             this.listHeight.push(height)
             for (let i = 0; i < list.length; i++) {
               let item = list[i]
               height += item.clientHeight
               this.listHeight.push(height) // 得到一个包含每一个group高度的数组
             }
           }
       ```

       这样 就能得到一个包含所有grroup高度的一个数据

    5. 在watch里监听scrollY

       > 拿到了每组的位置，我们可以监听scrollY 联合两者判断字母导航器应该滚动到的位置 

       ```javascript
           scrollY(newY) {
             const listHeight = this.listHeight
             // 当滚动到顶部 newY > 0
             if (newY > 0) {
               this.currentIndex = 0
               return
             }

             // 在中间部分滚动
             for (let i = 0; i < listHeight.length; i++) {
               let height1 = listHeight[i]
               let height2 = listHeight[i + 1]
               if (-newY >= height1 && -newY < height2) {
                 this.currentIndex = i
                 this.diff = height2 + newY // 注意 newY为负值
                 return
               }
             }
             // 当滚动到底部，且-newY 大于最后一个元素的上线
             this.currentIndex = listHeight.length - 2
           }
       ```

    6. currentIndex 绑定类 实现字母高亮

       ` :class="{'current': currentIndex === index}"`

       ​

- 细节优化

    1. 完善_scrollTo方法

       ```javascript
           _scrollTo(index) {
             if (!index && index !== 0) { // 点击以外的部分 无反应
               return
             }
             if (index < 0) { // 滑动到顶部时 index为负
               index = 0
             } else if (index > this.listHeight.length - 2) { // 滑动到尾部
               index = this.listHeight.length - 2
             }
             this.scrollY = -this.listHeight[index] // 每次点击都更改scrollY以实现同步
             this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 300)
           }
       ```

    2. fixedTitle

       计算属性

       ```javascript
           fixedTitle() {
             if (this.scrollY > 0) {
               return ''
             }
             return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
           }
       ```

       页面html

       ```html
           <div class="list-fixed" v-show="fixedTitle" ref="fixed">
             <h1 class="fixed-title">{{this.fixedTitle}}</h1>
           </div>
       ```

       > 至此 顶部的fixedtitle标题就做好了 但是我们发现两个title在重合的时候 并不是很完美，下面我们就来添加一个顶上去的动画来优化

       在scrollY函数中 我们可以轻松获取一个 diff 值 

       `this.diff = height2 + newY // 注意 newY为负值`

       通过监听diff 我们可以来实现我们的要求

       ```javascript
           diff(newVal) {
             let fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0
             if (this.fixedTop === fixedTop) {
               return
             }
             this.fixedTop = fixedTop
             this.$refs.fixed.style.transform = `translate3d(0,${fixedTop}px,0)`
           }
       ```

       ​

### 2.歌手详情页

> 歌手详情使用二级子路由来开发

#### 字路由 / 二级路由设置

> 路由是由组件承载的

在router -- index.js中 写入代码

**添加字路由**

```javascript
{
      path: '/singer',
      name: 'Singer',
      component: Singer,
      children: [
        {
          path: ':id',
          component: SingerDetail
        }
      ]
    }
```

如代码所示，在Singer component组件路由选项中，添加`children` 实现二级路由，然后需要在页面上加上`router-view`

标签来挂在这个二级路由显示页面

**编写跳转逻辑**

在次页面中，二级路由的跳转是在listview.vue中通过点击事件向外派发事件来实现的

```javascript
    selectItem(item) {
      this.$emit('select', item) // 向外派发事件
    }
```



> 因为listview.vue是一个基础组件，不会编写业务逻辑，所以把点击事件派发出去，让外部实现业务逻辑的编写

在singer.vue 中，我们监听到这个派发出来的select

`<list-view :data="singers" @select="selectSinger"></list-view>`

然后在selectSinger方法里面使用vue-router的 编程式跳转接口

```javascript
 selectSinger(singer) {
      this.$router.push({
        path: `/singer/${singer.id}` // 跳转页面
      })
    }
```

#### 添加转场动画

将singer-detail.vue 组件用transition标签包裹

并在css中添加动画

```scss
.slide-enter-active, .slide-leave-active
    transition: all 0.3s
 .slide-enter, .slide-leave-to
    transform: translate3d( 0, 100%, 0)
```

就下来，开始正式开发singer-detail组件,在这之前，我们先了解一下Vuex [跳转到vuex笔记](#jumpvuex)

#### 获取singer-detail数据

```javascript
export function getSingerDetail(singerId) {
  const url = 'https://c.y.qq.com/v8/fcg-bin/fcg_v8_singer_track_cp.fcg'
  const data = Object.assign({}, commonParams, {
    hostUin: 0,
    needNewCode: 0,
    platform: 'h5page',
    order: 'listen',
    begin: 0,
    num: 50,
    songstatus: 1,
    g_tk: 649509476,
    singermid: singerId // 注意是mid而不是id 不要出错
  })

  return jsonp(url, data, options)
}
```

> 当在singer-detail页面上刷新的时候，会获取不到数据，因为我们的数据是通过跳转得到的，如果我们在singer-detail数据上刷新，将返回上一级signer `this.$router.push('/singer')`



#### 整理获取的数据结构

**common>js>song.js**

```javascript
export default class Song {
  constructor({id, mid, singer, name, album, duration, image, url}) {
    this.id = id
    this.mid = mid
    this.singer = singer
    this.name = name
    this.album = album
    this.duration = duration
    this.image = image
    this.url = url
  }
}

export function createSong(musicData) {
  return new Song({
    id: musicData.songid,
    mid: musicData.songmid,
    singer: filterSonger(musicData.singer),
    name: musicData.songname,
    album: musicData.albumname,
    duration: musicData.interval,
    image: `https://y.gtimg.cn/music/photo_new/T002R300x300M000${musicData.albummid}.jpg?max_age=2592000`,
    url: `http://ws.stream.qqmusic.qq.com/C100${musicData.songmid}.m4a?fromtag=0&guid=126548448&crazycache=1`
  })
}

function filterSonger(singer) {
  let ret = []
  if (!singer) {
    return ''
  }
  singer.forEach((s) => {
    ret.push(s.name)
  })
  return ret.join('/')
}
```

通过方法调用类构造器，我们就能通过`createSong(musicData)`来整理获得我们需要的结构数据

**singer-detail**

```javascript
  methods: {
    _getDetail() {
      if (!this.singer.id) {
        this.$router.push('/singer')
      }
      getSingerDetail(this.singer.id).then((res) => {
        if (res.code === ERR_OK) {
          console.log(res.data.list)
          this.songs = this._normalizeSongs(res.data.list)
        }
      })
    },
    _normalizeSongs(list) {
      let ret = []
      list.forEach((item) => {
        let {musicData} = item
        if (musicData.songid && musicData.albummid) {
          ret.push(createSong(musicData)) 
        }
      })
      return ret
    }
  }
```

这样 通过调用_normalizeSongs方法 --> createSong 来得到songs数据

#### 开发MusicList.vue组件

在props中接受变量 bgImgae songs title

在singer-detail

通过计算属性拿到title 和 bgImage ，

`<music-list :songs="songs" :title="title" :bg-image="bgImage"></music-list>`

这样就完成了父组件的singer-detail向子组件的music-list的传值





> 因为歌曲列表是滚动的 我们在music-list中复用了scroll组件
>
> 我们还需要编写一个song-lsit组件，为接下来所用 [跳转到song-list组件开发](#jumpsonglist)

在music-list编写代码：

```vue
    <scroll
      class="list"
      ref="list"
      :data="songs"
      :probe-type="probeType"
      :listen-scroll="listenScroll"
      @scroll="scroll"
    >
      <div class="song-list-wrapper">
        <song-list :songs="songs"></song-list>
      </div>
      <div class="loading-container" v-show="!songs.length">
        <loading></loading>
      </div>
    </scroll>
```

> 至此，打开页面，我们可以看到歌单列表已经可以正常滚动

##### 1. 解决图片撑开问题

> 这是我们发现我们的页面上全部被歌单列表所占用， 要计算图片的位置把歌手背景图展现出来

在mounted生命周期钩子里添加

```javascript
 this.$refs.list.$el.style.top = `${this.$refs.bgImage.clientHeight}px`
```

这样就能实现歌手海报图的展示了



##### 2. 实现海报图跟着滚动的效果

我们在music-list.vue中加入一个layer层，用于跟着跟单一起滚动，来覆盖我们的bg-image，这样就能视觉上达到我们想要的效果了

`    <div class="bg-layer" ref="layer"></div>`

监听滚动距离

为scroll组件传入probeType值和listenScroll值

```vue
    created() {
      this.probeType = 3
      this.listenScroll = true
    }
```

为scroll添加scroll方法来监听滚动距离

```javascript
      scroll(pos) {
        this.scrollY = pos.y
      }
```

并监听scrollY数据 

```javascript
    watch: {
      scrollY(newY) {
        let translateY = Math.max(this.minTranslateY, newY)
        let zIndex = 0
        let scale = 1
        let blur = 0
        this.$refs.layer.style[transform] = `translate3d(0, ${translateY}px, 0)`
        const percent = Math.abs(newY / this.imageHeight)
        if (newY > 0) {
          scale = 1 + percent
          zIndex = 10
        } else {
          blur = Math.min(20 * percent, 20)
        }
        this.$refs.filter.style[backdrop] = `blur(${blur}px)`
        if (newY < this.minTranslateY) {
          zIndex = 10
          this.$refs.bgImage.style.paddingTop = 0
          this.$refs.bgImage.style.height = `${RESERVED_HEIGHT}px`
          this.$refs.pbtn.style.display = 'none'
        } else {
          this.$refs.bgImage.style.paddingTop = '70%'
          this.$refs.bgImage.style.height = 0
          this.$refs.pbtn.style.display = ''
        }
        this.$refs.bgImage.style.zIndex = zIndex
        this.$refs.bgImage.style[transform] = `scale(${scale})`
      }
    }
```

##### 3. 处理滚动到顶部的时候歌手title被歌单覆盖的问题

> 处理方法见上面代码zIndex相关操作



##### 4. 下滑的时候bg-image图片放大

> 处理见上代码 bgImage scale相关的操作

##### ５. 加入loading组件

>  在scroll结尾复用loading 即可







#### <span id="jumpvuex">开发song-list组件</span>

```vue
<template>
  <div class="song-list">
    <ul v-for="(song, index) in songs" :key="index" class="item">
      <div class="content">
        <h2 class="name">{{song.name}}</h2>
        <p class="desc">{{getDesc(song)}}</p>
      </div>
    </ul>
  </div>
</template>

<script type="text/ecmascript-6">
export default {
  props: {
    songs: {
      type: Array,
      default: () => []
    }
  },
  methods: {
    getDesc(song) {
      return `${song.singer} - ${song.album}`
    }
  }
}
</script>
```

在music-list中传入song值

`<song-list :songs="songs"></song-list>`





### <span id="jumpvuex">a. Vuex</span>

#### 什么是vuex

> Vuex 是一个专为 Vue.js 应用程序开发的**状态管理模式**。它采用集中式存储管理应用的所有组件的状态，并以相应的规则保证状态以一种可预测的方式发生变化。Vuex 也集成到 Vue 的官方调试工具 [devtools extension](https://github.com/vuejs/vue-devtools)，提供了诸如零配置的 time-travel 调试、状态快照导入导出等高级调试功能。

简单的说，当我们的vue项目比较复杂的时候，有的时候两个兄弟组件，或者相关度联系很低的组件相互之间需要同时获取或监听同一个数据或状态，这个时候我们就要使用vuex

> vuex 就像是一个大的机房，里面存着共享数据。这个房间我们可以让任何一个组件进来获取数据或者更新数据

![image](http://upload-images.jianshu.io/upload_images/11993435-700bb2cea1af7320.png?imageMogr2/auto-orient/strip%7CimageView2/2/w/1240)

#### 如何使用vuex

安装vuex

`npm install vuex --save`

在项目的根目录下，我们一般会新建一个store文件夹，里面添加新建文件：

- 入口文件 index.js  

- 存放状态 state.js

- 存放Mutations mutations.js

- 存放mutations相关数据的 mutation-types.js

- 数据修改 执行Mutations  actions.js

- 数据映射 getters.js

  > `getters` 和 vue 中的 `computed` 类似 , 都是用来计算 state 然后生成新的数据 ( 状态 ) 的。

以此项目为例子，需要各个组件之间共享一个singer数据

**state.js**

```javascript
const state = {
  singer: {}
}

export default state
```



**mutation-types.js**

```javascript
export const SET_SINGER = 'SET_SINGER'
```

> 使用常量替代 mutation 事件类型在各种 Flux 实现中是很常见的模式。这样可以使 linter 之类的工具发挥作用，同时把这些常量放在单独的文件中可以让你的代码合作者对整个 app 包含的 mutation 一目了然



**mutations.js**

```javascript
import * as types from './mutation-types'
// import * as obj from "xxx" 会将 "xxx" 中所有 export 导出的内容组合成一个对象返回。
const mutations = {
  [types.SET_SINGER](state, singer) {
    state.singer = singer
  }
}
export default mutations
```

> mutations.js 可以理解为是一个修改数据的方法的集合



**getter.js**

有时候我们需要从 store 中的 state 中派生出一些状态，如果有多个组件需要用到此属性，我们要么复制这个函数，或者抽取到一个共享函数然后在多处导入它——无论哪种方式都不是很理想。

Vuex 允许我们在 store 中定义“getter”（可以认为是 store 的计算属性）。就像计算属性一样，getter 的返回值会根据它的依赖被缓存起来，且只有当它的依赖值发生了改变才会被重新计算。

```javascript
export const singer = state => state.singer
```



**index.js**

```javascript
import Vue from 'vue'
import Vuex from 'vuex'
import * as actions from './actions'
import * as getters from './getters'
import state from './state'
import mutations from './mutations'
import createLogger from 'vuex/dist/logger'

Vue.use(Vuex) // 注册插件

const debug = process.env.NODE_ENV !== 'production' // 线下调试的时候 debug 为 ture

export default new Vuex.Store({ // new一个实例
  actions,
  getters,
  state,
  mutations,
  strict: debug, // 开启严格模式，用于下面来控制是否开启插件
  plugins: debug ? [createLogger()] : [] // 开启插件
})
```



**main.js**

在vue的main.js 中 注册 vuex

```
import store from './store'
....

new Vue({
  el: '#app',
  render: h => h(App),
  router,
  store
})
```

以上，vuex的初始化就完成了



**singer.vue 写入 state**

在组件中提交 Mutation

你可以在组件中使用 `this.$store.commit('xxx')` 提交 mutation，或者使用 `mapMutations` 辅助函数将组件中的 methods 映射为 `store.commit` 调用（需要在根节点注入 `store`）。

`import {mapMutations} from 'vuex'`

在methods结尾添加

```javascript
...mapMutations({
	setSinger: 'SET_SINGER' // 将 `this.setSinger()` 映射为 `this.$store.commit('SET_SINGER')`
})
```

通过`this.setSinger(singer)` 实现了对Mutations的提交



**singer-detail.vue  取出state数据**

引入

`import {mapGetters} from 'vuex'`

在computed中

```javascript
  computed: {
    ......
    
    ...mapGetters([
      'singer'  // 把 `this.signer` 映射为 `this.$store.getters.singer`
    ])
  }
```

至此，singer-detail 和 singer 之间就实现 singer 的共享了