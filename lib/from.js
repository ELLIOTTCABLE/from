// `from.js` is a `require()` replacement (specifically, a “code acquisition system”) for Node.js,
// designed to address serious perceived deficiencies in Node.js's existing system.
// 
// Right off the bat:
// 
//  - `from.js` is a *much more complex* system than Node.js's `require()` currently is. If you want
//    simple, if `require()` does everything you want and you don't care, walk away now. I won't be
//    offended. (;
//  - Using `from.js` precludes use of any tools or modules that *depends upon* Node's `require()`
//    design (there aren't many¹.) The design is highly incompatible.
// 
// That said, there are many benefits to `from.js`'s approach and design, that (in my opinion) make
// it worth the above-mentioned caveats:
// 
//  - **Wider applicability:** code written for `from.js` (we don't have a concept of “modules”) can be
//    written in an asynchronous manner, making it consumable both from the browser (asynchronously)
//    *and* from server-side/command-line tools (synchronously, or asynchronously, as preferred.)
//  - **More flexibility for abstraction (library) authors:** the CommonJS style of “module” is very
//    restricting, and almost entirely pointless². A “piece of code” from the point of view of
//    `from.js` is just a function, and it returns some value (anything it wishes) to the consumer.
//    It can even be asynchronous, if that is most appropriate.
//  - **Adherence to Node.js's original goals:** although much of the Node.js community has deviated
//    (widely.) from the viewpoint of the original Node.js design (at least in the eyes of this
//    writer), hardline asynchronicity *still has great merits*. Although `from.js` allows for
//    synchronicity should you request it³, it is *very* friendly to writing fully and inherently
//    asynchronous abstractions.
//  - **Extensibility:** as mentioned above, we're *much* more complex than Node.js's built-in
//    `require()`. To pay you back somewhat for that disservice, we end up providing a *much* more
//    extensible system. You can extend `from.js` to preform almost any resolution mutation you can
//    possibly imagine, from simply substituting `~` in paths with your home folder, all the way up
//    to supporting the complex resolution pattern for NPM's `node_modules` folders. To boot,
//    everything else is nearly as extensible as the resolution system.
// 
// <small>¹ Most ‘`require()`-compatible modules’ are fairly agnostic, as long as you assume they
//          act in a CommonJS-compatible fashion, and are thus completely compatible with `from.js`.
//          Similarly, most neat tools and tricks (RequireJS, ender.js, etceteras) are equally as
//          incompatible with `require()` as *we* are, and are (unsurprisingly) also incompatible
//          with `from.js`.</small>
// 
// <small>² Some might disagree (;. `from.js` is written from the perspective that abstraction
//          authors should be able to “return” any value(s) they wish from their code to the
//          consumer's code, and not be restricted to an `exports` object dictated by the system.</small>
// 
// <small>³ When synchronicity is at all possible, that is. Obviously, some things *require*
//          asynchronicity. Such things would be entirely impossible under `require()`, and are
//          allowed within `from.js`; they therefore force `from.js`'s asynchronous mode upon you.</small>
// 
// So! Without **further** ado (phew, 'cause that was a *lot* of ‘ado,’)

/* The API.
// -------- */
var From = {} // NYI

/* My code is written in a style many of you will consider unfamiliar. Don't despair! Though the                  /*|   // Code and other content beyond column 120 is not intended for the casual reader, and should be
   code may seem *foreign*, it's designed to be eminently readable and understandable. Give it a                  //|   // be ignored on a cursory consumption of this document/file. *//*
   try, I think you'll find you like it. (; */
/* (One caveat: This code has to work both client-side and server-side, and all the way back to IE6               /*|   /* (Things stored in the `TESTABLES` namespace are intended to be accessed by `test/from.test.js`,
    and friends. Because of this, a lot of wonderful hacks aren't possible; the code within this                  //|   //  to which this file is concatenated at test-time.) */ var /*
    file is more obtuse than would otherwise be the case, for these reasons.) */                                  /*|*/ TESTABLES = new Object()
;(function(){
   var /* Plumbing: */ root, undefined
     , /* Code acquisition: */ Acquisition, legacyRequire
     , /* Query resolution: */ ResolutionMutator,  mutate
   
   /* Plumbing
   // ======== */                                                                                                 /*|*/ From.plumbing = {}
   // The `docco`-generated API documentation ends here. The rest of this file is not intended to
   // be read by the casual API consumer. Only continue reading if you wish to understand the nitty-
   // gritty hacks that power `from.js`!
   var /* Utility: */ isClient
     , /* Shims: */ runInNewContext, runInThisContext
     , /* DOM: */ nodeFor, html, head, body
   
   /* ### Utility */
   /* No, this isn't a getter. We can't use getters in IE6/7. Instead, it's a function that, when
      called, replaces itself in the defining scope with a boolean; we then call it exactly once at
      the end of this file. */                                                                                    /*|*/ From.plumbing.isClient =
   isClient = function(){                                                                                        return From.plumbing.isClient =
      isClient = typeof process === 'undefined' }
   
   /* ### Shims */
   /* This will synchronously execute the JavaScript code from a given string, in a
      newly-constructed 'JavaScript context' (think "new browser window.") */                                     /*|*/ From.plumbing.runInNewContext =
   runInNewContext = function(source){
      if (isClient) return runInNewContext.client.apply(this, arguments)
               else return runInNewContext.server.apply(this, arguments) }
   
   runInNewContext.client = function(source){ var inner = new Object()
      inner.frame = window.document .createElement('iframe')
      inner.frame.style.display = 'none'
      body(html(window.document))
         .insertBefore(inner.frame)
      inner.frame.contentWindow.document .close()
      
      inner.script = inner.frame.contentWindow.document .createElement('script')
      inner.frame.contentWindow
         .__fromSource = source
      inner.script.text = "window.__fromResult = eval(window.__fromSource)"
      body(html(inner.frame.contentWindow.document))
         .insertBefore(inner.script)
      
      return inner.frame.contentWindow
         .__fromResult }
   
   runInNewContext.server = function(source){ var
      vm = require('vm')
      return vm.runInNewContext(source) }
   
   /* ### DOM */                                                                                                  /*|*/ TESTABLES.nodeFor =
   nodeFor = function(type){
      return function(node){
         return node.getElementsByTagName(type)[0]
             || node.insertBefore((node.ownerDocument || node).createElement(type)) } }
   
   html = nodeFor('html')
   head = nodeFor('head')
   body = nodeFor('body')
   
isClient() })()
