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
var From = {} // FIXME: NYI

/* My code is written in a style many of you will consider unfamiliar. Don't despair! Though the                  //|   // Code and other content beyond column 120 is not intended for the casual reader, and should be
   code may seem *foreign*, it's designed to be eminently readable and understandable. Give it a                  //|   // be ignored on a cursory consumption of this document/file.
   try, I think you'll find you like it. (; */
/* (One caveat: This code has to work both client-side and server-side, and all the way back to IE6               /*|   /* (Things stored in the `OTHER` namespace are intended to be accessed by `test/from.test.js`,
    and friends. Because of this, a lot of wonderful hacks aren't possible; the code within this                  /*|   /*  to which this file is concatenated at test-time.) */ var                                       /*
    file is more obtuse than would otherwise be the case, for these reasons.) */                                  /*|*/ OTHER = new Object()
                                                                                                                  /*|*/~function(){ var defineFrom = function(){
   var /* Code acquisition: */ Acquisition, legacyRequire
     , /* Query resolution: */ ResolutionMutator,  mutate
     , /* Plumbing: */ root, plumbing, undefined
   
   /* Plumbing
   // ======== */                                                                                                 /*|*/ From.plumbing =
   // The `docco`-generated API documentation ends here. The rest of this file is not intended to
   // be read by the casual API consumer. Only continue reading if you wish to understand the nitty-
   // gritty hacks that power `from.js`!
   plumbing = {}                                                                                                  /*|*/;plumbing.runInNewContext = runInNewContext
                                                                                                                  /*|*/ plumbing.isClient = isClient // By this time, isClient() has been run
   // ...
                                                                                                                  /*|*/ }
   /* No, this isn't a getter. We can't use getters in IE6/7. Instead, it's a function that, when
      called, replaces itself in the defining scope with a boolean; we then call it exactly once at
      the end of this file. */
   isClient = function(){
      isClient = typeof process === 'undefined' }
   
   /* This will synchronously execute the JavaScript code from a given string, in a
      newly-constructed 'JavaScript context' (think "new browser window.") */
   runInNewContext = function(source){
      if (isClient) return runInNewContext.client.apply(this, arguments)
               else return runInNewContext.server.apply(this, arguments) }
   
   runInNewContext.client = function(source){ var inner = new Object()
                       inner.frame = window.document .createElement('iframe')
                       inner.frame.style.display = 'none'
      body(html(window.document))
         .insertBefore(inner.frame)
                       inner.window = inner.frame.contentWindow; inner.document = inner.window.document
                       inner.document .close()
      
                       inner.script = inner.document .createElement('script')
                       inner.               window.__fromSource = source
                       inner.script.text = "window.__fromResult = eval(window.__fromSource)"
      body(html(inner.document))
         .insertBefore(inner.script)
      
      return inner.window.__fromResult }
   
   runInNewContext.server = function(source){
      return require('vm').runInNewContext(source) }
   
   /* All of these declarations will be hoisted to the beginning of their closure, resulting in
   /* their visibility inside the sub-enclosure responsible for defining From, above. */
   var /* (HOISTED): */ isClient, runInNewContext
     , /* Utility: */ hasPrototypeAccessors, sub
     , /* DOM: */ nodeFor, html, head, body
   
   /* ### Utility */
   /* This is the most robust method I could come up with to detect the presence or absence of
    * `__proto__`-style accessors. It's probably not foolproof. */                                                /*|*/ OTHER.hasPrototypeAccessors =
   hasPrototypeAccessors = function(){ var a, b = new Object()
      b.__proto__ = a = new Object()
                    a.inherits = true                                                                             /*|*/;OTHER.hasPrototypeAccessors =
      hasPrototypeAccessors = !!b.inherits }
   
   /* This creates a pseudo-‘subclass’ of a native JavaScript complex-type. Currently only makes
    * sense to run on `Function`. // FIXME: Generalize to RegExp, Array, etc; release separately
    *
    * There's several ways to acheive a trick like this; unfortunately, all of them are severely
    * limited in some crucial way. Herein, I chose two of the most flexible ways, and dynamically
    * choose which to employ based on the capabilities of the hosting JavaScript implementation. */               /*|*/ OTHER.sub = 
   sub = function(up){
      if (up !== Function) // FIXME: NYI
         throw new RangeError("sub() may only be called with `Function`")
      if (hasPrototypeAccessors) return sub.withAccessors .apply(this, arguments)
                            else return sub.withAliens    .apply(this, arguments) }
   
   /* The first approach, and most flexible of all, is to create `Function` instances with the
    * native `Function` constructor from our own context, and then directly modify the [[Prototype]]
    * field thereof with the `__length__` pseudo-property provided by many implementations. */
   sub.withAccessors = function(up, constructorBody, runtimeBody){ var
      constructor = function(){ var
         that = function(){
            return (runtimeBody || arguments.callee.__body || function(){})
               .apply(this, arguments) }
         that.__proto__ = constructor.prototype
         return constructorBody.apply(that, arguments) || that }
      constructor.prototype =
         (function(C){ C = new Function; C.prototype = up.prototype; return new C })()
      constructor.prototype.constructor = constructor
      return constructor }
      
   /* This approach, while more widely supported (see `runInNewContext`), has a major downside:
    * it results in instances of the returned ‘subclass’ *do not inherit from the local context's
    * `Object` or `Function`.* This means that modifications to `Object.prototype` and similar will
    * not be accessible on instances of the returned subclass.
    *
    * This is not considered to be too much of a downside, as 1. the vast majority of JavaScript
    * programmers and widely-used JavaScript libraries consider modifying `Object.prototype` to be
    * anathema *already*, and so their code won't be affected by this shortcoming; 2. this downside
    * only applies in environments where `hasPrototypeAccessors` evaluates to `false` (notably,
    * Internet Explorer); and 3. this downside only applies to *our* objects (instances of the
    * returned subclass). I, elliottcable, consider it fairly unlikely for a situation to arise
    * where all of the following are true:
    * 
    *  - A user of `from`,
    *  - wishes their code to operate in old Internet Explorers,
    *  - while using a library that modifies `Object.prototype`,
    *  - and necessitates utilizing those modifications on `acquisition` instances (or similar.)
    *
    * (All that ... along with the fact that I know of absolutely no way to circumvent this.) */
   sub.withAliens = function(up, constructorBody, runtimeBody){ up = runInNewContext(up.name)
      up.runtimeBody = runtimeBody
      constructor = function(){ var
         that = new up('\
            return (arguments.callee._runtimeBody || '+up.name+'.runtimeBody || function(){}) \
               .apply(this, arguments) ')
         return constructorBody.apply(that, arguments) || that }
      constructor.prototype = up.prototype
      constructor.prototype.constructor = constructor
      return constructor }
   
   /* ### DOM */                                                                                                  /*|*/ OTHER.nodeFor =
   /* These either create or return the first existing subnode of a given type. */
   nodeFor = function(type){
      return function(node){
         return node.getElementsByTagName(type)[0]
             || node.insertBefore((node.ownerDocument || node).createElement(type)) } }
   
   html = nodeFor('html')
   head = nodeFor('head')
   body = nodeFor('body')
   
   /* We delay executing defineFrom(), an enclosure surrounding the majority of the above code,
    * until here; that allows our utility definitions and shims to take effect *before* the
    * majority of the library-code, while being placed *below* the more relevant (and readable)
    * code that we present to readers at the top of the file. */
   isClient(); hasPrototypeAccessors(); defineFrom()
   
if (typeof(module) !== "undefined") (module.exports = From).library = "from" }()
