/* This test file is intended to be *concatenated* to the end of `lib/from.js`, and then the result
   to be run through either http://testling.com/, or <FIXME: NYI> directly via `node` from the CLI. */
try { var testling = require('testling') } catch(_){}

/* We use testling-style assertions; here, we configure Node's `assert()` module to expose an
   identical interface. */
var test = function(test){
   if (!testling) { var
      assert = require('assert')
      assert.ok = assert
      assert.end = function(){ /* noop */ } }
   if (testling) testling(function(assert){ test(assert) })
                                     else { test(assert) } }

test(function(assert){ var runInNewContext = From.plumbing.runInNewContext
   assert.doesNotThrow(function(){ runInNewContext('true') })
   assert.doesNotThrow(function(){ runInNewContext('Function') })
   assert.ok(runInNewContext('2') === 2)
   assert.ok(typeof runInNewContext('Function') === 'function')
   assert.ok(runInNewContext('Function') !== Function)
   assert.end() })
