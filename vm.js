var AST_C = require('babylon') // 引入AST解析工具
var AST_TYPES = require('babel-types') // 加载AST类型映射
var fs = require('fs')
var Scope = {} // 上下文执行环境对象
var SHOW_AST_TYPE = process.env.showlog || false
var excuteFunctionName = undefined // 用于缓存当前正在执行的方法作用域名称

function excute(expression) {
  // 是否显示ast对象类型辅助排查
  SHOW_AST_TYPE && console.log(expression.type)
// ExpressionStatement
  if (AST_TYPES.isExpressionStatement(expression)) {
    excute( expression.expression)
// AssignmentExpression
  } else if(AST_TYPES.isAssignmentExpression(expression)) {
    // 处理赋值语句
    switch (expression.operator) {
      case '=': {
        if (Scope[excuteFunctionName]) {
          Scope[excuteFunctionName][expression.left.name] = expression.right.value
        } else {
          Scope[expression.left.name] = expression.right.value
        }
        break;
      }
    }
// FunctionDeclaration
  } else if (AST_TYPES.isFunctionDeclaration(expression)) {
    var func_name = expression.id.name;
    // POINT: 在作用域链上推入 该函数的作用域
    Scope[func_name] = function () {
      excuteFunctionName = func_name
      var result = excute(expression.body, func_name)
      
      // 执行完 函数的形参变量清空
      var params = Scope[excuteFunctionName].paramArray
      for (var i = 0; i < params.length; i++) {
        var param = params[i]
        Scope[excuteFunctionName][param] = undefined
      }
      // 执行完 function 把正在执行的方法标识 清空
      excuteFunctionName = null
      return result
      
    }
    // POINT: 函数生声明
    Scope[func_name]['paramArray'] = []
    // POINT: 函数调用时，处理函数形参，绑定到函数的作用域链上
    for(var i = 0; i< expression.params.length; i++) {
      var param = expression.params[i]
      Scope[func_name][param.name] = undefined
      Scope[func_name]['paramArray'].push(param.name) // 在函数作用域对象上保存有一个入参数组
    }
// BlockStatement
  } else if (AST_TYPES.isBlockStatement(expression)) {
     // POINT: 执行函数体重的所有语句，遇到return语句，要返回执行结果
     for(var i = 0; i < expression.body.length; i++ ) {
       var expr = expression.body[i]
      if (AST_TYPES.isReturnStatement(expr)) return excute(expr) 
      excute(expr)
    }
// return表达式  
  } else if (AST_TYPES.isReturnStatement(expression)) {
    return excute(expression.argument)
// 二元表达式
  } else if (AST_TYPES.isBinaryExpression(expression)) { 
    var left = excute(expression.left)
    var right = excute(expression.right)
    switch (expression.operator) {
      case '+': return (left + right);break;
      case '-': return (left - right);break;
      case '*': return (left * right);break;
      case '/': return (left / right);break;
      case '===': return (left === right);break;
      case '!==': return (left !== right);break;
      case '==': return (left == right);break;
      case '!=': return (left != right);break;
    }
// 成员表达式
  } else if (AST_TYPES.isMemberExpression(expression)) { 
    excute(expression)
// 语句执行
  } else if (AST_TYPES.isCallExpression(expression)){ 
    // POINT: 函数调用类型要区分为 方法声明和入参处理 两块处理
    if (AST_TYPES.isMemberExpression(expression.callee)) {
      // 计算该调用的所有入参计算后，作为入参传入调用
      var argus = []
      for(var i = 0; i<expression.arguments.length; i++) {
        argus.push(excute(expression.arguments[i]))
      }
      
      // 调用函数
      var excuteObj = excute(expression.callee.object)
      excuteObj[expression.callee.property.name].apply(this, argus)
    } else if (AST_TYPES.isIdentifier(expression.callee)) {
      // 把作用域链上的该函数的形参赋值
      var calleeObj = Scope[expression.callee.name]
      for (var i = 0; i < calleeObj.paramArray.length; i++) {
        var param = calleeObj.paramArray[i]
        // 0 特殊处理
        if (expression.arguments[i].value === 0) {
          calleeObj[param] = 0
        } else {
          calleeObj[param] = expression.arguments[i].value || undefined
        }
      }
      return calleeObj.apply(this)
    }
// 字面量声明     
  } else if (AST_TYPES.isLiteral(expression)) {
    return expression.value
// 标识语句
  } else if (AST_TYPES.isIdentifier(expression)) {
    var id = expression.name
    if (excuteFunctionName && Scope[excuteFunctionName] && (Scope[excuteFunctionName][id] || Scope[excuteFunctionName][id] === 0)) {
      return Scope[excuteFunctionName][id]
    } else {
      // 遍历作用域链获取变量值
      return getValOfKey(id, Scope) || undefined
    }
// IfStatement  
  } else if (AST_TYPES.isIfStatement(expression)){
    if (excute(expression.test)) {
      return excute(expression.consequent)
    } else {
      return excute(expression.alternate)
    }
  } else if (AST_TYPES.isVariableDeclaration(expression)) {
    for (var i = 0; i < expression.declarations.length; i++) {
      excute(expression.declarations[i])
    }
  } else if(AST_TYPES.isVariableDeclarator(expression)){
    var val = excute(expression.init)
    if (excuteFunctionName && Scope[excuteFunctionName]) {
      Scope[excuteFunctionName][expression.id.name] = val
    } else {
      Scope[expression.id.name] = val
    }
  } else if(AST_TYPES.isConditionalExpression(expression)) {
    if (excute(expression.test)) {
      return excute(expression.consequent)
    } else {
      return excute(expression.alternate)
    }
  }
}


/**
 * 根据key获取obj的值
 * @param {}} key 
 * @param {*} obj 
 */

function getValOfKey (key, obj) {
  for (var k in obj) {
    if (k == key) return Scope[key]
    getValOfKey(k, obj[k])
  }
}

module.exports = function (src, scope) {
  try {
    // 获得代码文件
    var code = fs.readFileSync(src, 'utf8')
    // 初始化 VM内置Scope上下文执行环境对象
    Object.assign(Scope, scope)
    // 获得代码的ASTTREE
    var ast = AST_C.parse(code).program.body
    for(var i = 0; i<ast.length; i++) {
      excute(ast[i])
    }
  } catch (e) {
    console.error(e)
  }
}
