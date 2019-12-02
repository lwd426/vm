# vm
A vm that can excute JavaScript Code.

使用了AST语法解析JavaScript表达式语句，完成代码执行

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

### 功能说明：
+ function 自定义函数定义
  + 入参
  + 变量覆盖赋值
  + 多语句执行
  + return
+ 函数（作用域对象方法和自定义方法）执行
+ 基础作用域链
+ 上下文执行环境

### 已经处理的AST TYPE

| AST TYPE  | DESCRIPTION |
| ------------- | ------------- |
| Literal  | 字面量取值处理  |
| Identifier | 标识符取值处理  |
| FunctionDeclaration | 函数声明  |
| ExpressionStatement | 表达式定义  |
| BlockStatement | 块 语句  |
| ReturnStatement | return表达式  |
| BinaryExpression | 二元表达式  |
| MemberExpression | 成员表达式  |
| CallExpression | 方法调用表达式  |
| AssignmentExpression | 声明表达式  |


### 可以解析如下代码：
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
