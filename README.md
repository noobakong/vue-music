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
- npm install babel-polyfill
对es6的高级语法进行转义当运行环境中并没有实现的一些方法，babel-polyfill 会给其做兼容
需要在main.js中引入
- npm install babel-runtime --save 辅助编译 不需要引入即可用

>babel-runtime 是供编译模块复用工具函数。是锦上添花
babel-polyfil是雪中送炭，是转译没有的api.