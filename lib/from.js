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

/* (Things stored in the `testables` namespace are intended to be accessed by `test/from.test.js`,
    to which this file is concatenated at test-time.) */
var testables = new Object()

// The API.
// ========
/* My code is written in a style many of you will consider unfamiliar. Don't despair! Though the
   code may seem *foreign*, it's designed to be eminently readable and understandable. Give it a
   try, I think you'll find you like it. (; */
/* (One caveat: This code has to work both client-side and server-side, and all the way back to IE6
    and friends. Because of this, a lot of wonderful hacks aren't possible; the code within this
    file is more obtuse than would otherwise be the case, for these reasons.) */
;(function(){                                                                                    //|        Content over here beyond the ‘buffer columns’ 100-108 is not intended for reader
   var /* Plumbing: */ root, undefined
     , /* Code acquisition: */ From, Acquisition, legacyRequire                            
     , /* Query resolution: */ ResolutionMutator,  mutate
   
   
   /* Notes:
       - Asynchronicity vs. synchronicity? Acquisition-specific?
      
       - Framework for individual 'from' objects per-context
          - create from-objects for each new context
          - ‘Inherting’ from-objects into eachother
          - API to cause a particular acquisition to be ‘internal’ or ‘external’ (‘inheriting’)
          - individual mutators default otherwise (a file acquired relatively is probably internal
            to the current library, whereas a repositories file is probably not.)
       - Need a mutate()-rewrite
       - Need a ResolutionMutator-replacement that is more flexible on the relationships between
         mutators
          - store relationships in the from-environment, not in the Mutators themselves
          - store suggested-relationships in the mutators, copy those relationships into the from
          - have a blueprint for new froms with relationships between all the default mutators
            hard-coded (these will not be completly identical to the mutator-specific suggestions)
      
       - From, Acquisition, Mutator; Mutation?
       - constructor-ification (`new`-agnosticism) convenience
       - portable Function subclassing
    */
   
   // Plumbing
   // ========
   // The `docco`-generated API documentation ends here. The rest of this file is not intended to
   // be read by the casual API consumer. Only continue reading if you wish to understand the nitty-
   // gritty hacks that power `from.js`!
   var /* Utility: */ isClient
     , /* Shims: */ runInNewContext, runInThisContext
     , /* DOM: */ html, head, body, nodeFor
   
   /* ### Utility */
   /* No, this isn't a getter. We can't use getters in IE6/7. Instead, it's a function that, when
      called, replaces itself in the defining scope with a boolean; we then call it exactly once at
      the end of this file. */                                                                     ;        testables.isClient =
   isClient = function(){
      return isClient = true // FIXME: NYI
   }
   
   /* ### Shims */
   /* This will synchronously execute the JavaScript code from a given string, in a
      newly-constructed 'JavaScript context' (think "new browser window.") */                      ;        testables.runInNewContext =
   runInNewContext = function(source){
      if (isClient) return runInNewContext.client.apply(this, arguments)
               else return runInNewContext.server.apply(this, arguments) }
   runInNewContext.client = function(source){ var inner = new Object()
      inner.frame = window.document.createElement('iframe')
      inner.frame.style.display = 'none'
      body(html(window.document)).insertBefore(inner.frame)
      inner.frame.contentWindow.document.close()
      
      inner.script = inner.frame.contentWindow.document.createElement('script')
      inner.frame.contentWindow.__fromSource = source
      inner.script.text = "window.__fromResult = eval(window.__fromSource)"
      body(html(inner.frame.contentWindow.document)).insertBefore(inner.script)
      
      return inner.frame.contentWindow.__fromResult }
   runInNewContext.server = function(source){ var
      vm = require('vm')
      return vm.runInNewContext(source) }
   
   /* ### DOM */
   html = function(node){ return nodeFor(node, 'html') }
   head = function(node){ return nodeFor(node, 'head') }
   body = function(node){ return nodeFor(node, 'body') }
                                                                                                   ;        testables.nodeFor =
   nodeFor = function(node, type){
      return node.getElementsByTagName(type)[0]
          || node.insertBefore((node.ownerDocument || node).createElement(type)) }
   
   isClient()
})()
