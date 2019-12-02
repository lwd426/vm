const VM = require('../vm.js')
const ASSERT = require('assert');

describe('VM EXCUTE "console.log"', function () {
  it('最基础的功能测试', function () {
    try {
      VM('./test/code.js', {
        console: console
      })
      ASSERT.ok(true)
    } catch (e) {
      console.error(e)
      ASSERT.ok(false)
    }
  })


});

describe('VM EXCUTE "条件表达式"', function () {
  it('if/else/else if/else', function () {
    try {
      VM('./test/ifelseif.js', {
        console: console
      })
      ASSERT.ok(true)
    } catch (e) {
      console.error(e)
      ASSERT.ok(false)
    }
  })


});

describe('VM EXCUTE "三项表达式"', function () {
  it('var a = true? 1 : 2', function () {
    try {
      VM('./test/threeexp.js', {
        console: console
      })
      ASSERT.ok(true)
    } catch (e) {
      console.error(e)
      ASSERT.ok(false)
    }
  })


});
