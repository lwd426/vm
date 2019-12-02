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
