# vm
A vm that can excute JavaScript Code

# 代码解析

执行如下代码即可完成code解析执行
```javascript
const VM = require('./vm.js')

// SCOPE为执行上下文
var SCOPE = {
  console: console
}

VM('./test/code.js', SCOPE)
```

## 1.0.0

可以解析如下代码：
```javascript
// ./test/code.js
function add(a, b) {
  return (a + b)
}
console.log(add(0, 3))
// 3

console.log(add('lwd', 4))
// lwd4

console.log(add(1, 2, 4))
// 7


```
