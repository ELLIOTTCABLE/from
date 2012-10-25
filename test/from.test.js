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

test(function($){ var runInNewContext = From.plumbing.runInNewContext
   $.doesNotThrow(function(){ runInNewContext('true') })
   $.doesNotThrow(function(){ runInNewContext('Function') })
   $.strictEqual(runInNewContext('2'), 2)
   $.equal(typeof runInNewContext('Function'), 'function')
   $.notStrictEqual(runInNewContext('Function'), Function)
$.end() })

test(function($){ var sub = OTHER.sub, fanction
 , Fanction = sub(Function
    , function(stuff){ this.stuff = stuff }
    , function(nonsense){ return nonsense + ', wotcher!' })
   
   $.equal(typeof Fanction, 'function')
   $.notStrictEqual(Fanction, Function)
   
   fanction = new Fanction('foo')
   $.ok(   fanction instanceof Fanction)
   if (OTHER.hasPrototypeAccessors) {
      $.ok(fanction instanceof Function)
      $.ok(fanction instanceof Object) }
   $.strictEqual(fanction.stuff, 'foo')
   $.strictEqual(fanction('bar'), 'bar, wotcher!')
   
   Fanction.prototype.stufficate = function(){ this.stuff = this.stuff + this.stuff }
   $.doesNotThrow(function(){ fanction.stufficate() })
   $.strictEqual(fanction.stuff, 'foofoo')
$.end() })
