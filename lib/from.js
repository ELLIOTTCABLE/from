// === Philosophy

// This is a complex system. Inspired by both Ruby (packages are
// folders with lib/ inside them, and file extensions are optional) and Python
// (the ability to import the specific things that you want from a package,
// the equivalent of an __init__.py file), this system also introduces several
// new or different features and concepts:
// 
//  - Packages are as absolutely simple as possible; a ‘package’ is really
//    nothing more than some `.tar.gz`ipped code. This frees the community up
//    to use any distribution, organization, and dependency resolution systems
//    they please; a `.tar.gz` on S3 is just as valid as a GitHub repository
//    or a `.zip` you e-mail to a friend. This also leaves us free, as a
//    community, to build more complex systems that build on top of this
//    system *without* precluding the use of this simple system by any
//    authors, opening up the possibility of systems like RubyForge, CPAN, or
//    Gemcutter.
//  - Packages can be organized Ruby style, with `./subpackage.js` adjacent to
//    `./subpackage/`… or Python style, with a twist: `subpackage.js` can
//    instead be placed *inside* `./subpackage/` as `./subpackage/subpackage.js`,
//    preforming the function of Python’s __init__.py., but with a more
//    semantic name (subpackage.js is welcome to do far more than ‘init’ the
//    subpackage; you could store as much of the ‘subpackage’ related code
//    inside that file as you want, and only move things to seperate files
//    inside `./subpackage/` as the code grew large and semantically separate)
//  - Since this is JavaScript, there is a good chance that you may want your
//    package to be as useful client-side as it is server-side; to this
//    purpose, the `from` system can be used in a fully filesystem-agnostic
//    manner: any `from` can be replaced *inline* with the content of the file
//    that `from` resolves to, and a package (or even an application, with all
//    of the packages it `from`s) can be served to the client as a *single
//    GZIPped file*, that requires no filesystem traversal or extra HTTP
//    requests.
//  - Compilation is fully object-agnostic (the original reason I wrote this
//    system, as the CommonJS ‘securable modules’ system existing in Node.js
//    at the time handed you an object and forced you to use it); the final
//    return value of your package/file is the return value of the `from`
//    functions (minus imports, mind you). This means that creating and
//    manipulating the object representing your package to the rest of the
//    JavaScript world is fully and completely up to you; you’re free to
//    return an Object, a prototype (as per poopy.js), a Function… even an
//    array or number or other primative (if you really want to). It’s
//    completely up to you.

// === Usage

// The basic `from`s will all asynchronously resolve and compile a JavaScript
// or object file, and pass the result to a callback. These are (modified)
// `Promise`s, so you can synchronously `wait()` on them if you wish.
// 
// Since the result of compilation is passed directly, you can expect to get
// an object representing the entire package.
// 
// Paths begining with a UNIX slash (‘/’) will be interpreted as absolute
// paths. Otherwise, they will be interpreted as relative to the file
// calling the `from`.
// 
//     var foo = from.file('/path/to/foo.js').wait();
//     var foo = from.file('to/foo.node').wait();
//     var foo = from.package('to/foo').wait();

// However, you can also `import()` the package directly *onto* a target.
// 
// This process will take the value of a property (‘foo’) on the compiled
// package, and apply it to the same property (‘foo’) on the target.
// 
// Multiple slots may be specified, in which case all specified slots will be
// applied; if no slots are specified, then *all* slots on the target package
// will be applied (thus, fully importing the target package). All `String`s
// passed as arguments will be interpreted as slot names; however, if the last
// argument is not a `String`, it will instead be interpreted as the target.
// 
// If no target is supplied (i.e. there are no arguments, or all arguments are
// strings), then the specified slots will be imported into a new `Object`,
// and that `Object` will be returned. This is functionally equivalent to the
// CommonJS `require()` (however, the from-file is expected to prepare its own
// object to return, even though this method would not use it… instead of
// being passed an `exports` object, as in CommonJS).
// 
//     from.file('to/foo.js').import('aSlot', 'anotherSlot', this);
//     from.file('/path/to/foo.js').import(this);
//     var things = from.package('to/foo').import('aSlot');

// === Package structure

// This `from` system is very flexible, but that is also its downfall. It is
// important that we use that flexibility for good, not evil.
// 
// As a package author, this means several things to you: generally, you need
// to put this flexibility in the hands of the user of your package, instead
// of abusing it yourself. For instance:
// 
//  - Write the subpackages of your package such that they are independant of
//    eachother as much as possible. This ensures that if a user of your
//    package only wants to `from.file('yourPackage/subpackage')`, they are
//    free to do so, as nothing in `lib/yourPackage/subpackage/` will depend
//    upon code in `lib/yourPackage/`.
//    
//    This `from` system attempts to generally facilitate this through the
//    subpackage named initfile; in fact, there are three different ways that
//    subpackages of your package may be utilized separately from your package
//    itself:
//     - `from.package('myPackage').import('subPackage', this);`
//     - `var subPackage = from.package('myPackage/subPackage');`
//     - Tearing the `lib/myPackage/subpackage/` folder out of your package,
//       and using (or even distributing, depending on your choice of license)
//       it as its own package
//  - Modularize your code iteratively; when the code relevant to the
//    `subPackage` section of your package is light, there is no reason not to
//    keep it in `lib/myPackage.js`. However, as your package grows, you may
//    find that you wish to keep it in a separate file; this is a simple
//    matter of moving `lib/myPackage.js` to `lib/myPackage/myPackage.js` (if
//    you wish; I personally prefer to keep all related code inside a single
//    folder, but leaving `myPackage.js` directly inside `lib/` is perfectly
//    valid) and then moving some of the `subPackage`-related code *out* of
//    `myPackage.js` into `lib/myPackage/subPackage.js`.
//    
//    This applies in the same way to the subpackages themselves; you may
//    eventually wish to move `lib/myPackage/subPackage.js` into
//    `lib/myPackage/subPackage/subPackage.js`, and then some of the subPackage
//    code into `lib/myPackage/subPackage/subSubPackage.js`. And so on, ad
//    infinitum.
//  - Your sourcefiles themselves should generally be wrapped in an anonymous
//    function to give them private anonymous scope; although *this* `from`
//    system will wrap them in such an anonymous function before compiling
//    them, others using your code in other ways may not.
//    
//    As well, although this system leaves the details entirely up to you,
//    you’ll almost certainly want to create and return an object that
//    represents your package to the outside world. It is good practice to
//    utilize a local variable of the same name as your package to hold this
//    object, as that means your property definitions (and internal dogfooding
//    of your own package’s methods) will have a good chance of directly
//    relating to your documentation, which is beneficial to people trying to
//    learn from your source code.
// 
// All that said, here’s a basic template for a package/subpackage within your
// package:
// 
//     /* lib/myPackage/myPackage.js */
//     return (function(){
//       var myPackage = {};
//       myPackage['subPackage'] = from.file('subPackage.js');
//       
//       // …
//       
//       return myPackage;
//     })()
// 
//     /* lib/myPackage/subPackage.js */
//     return (function(){
//       var subPackage = {};
//       
//       // …
//       
//       return subPackage;
//     })()
return (function() {
  
  // DEP: We have to depend upon the existence of `require()` here, since the
  //      current 'posix' module is written for it.
  var posix = require('posix');
  
  // TODO: The `Promise`s utilized throughout this code *really* should be raw
  //       `EventEmitter`s, but I absolutely *have* to support `wait()`
  //       functionality on all `from`s.
  //       
  //       The truth is that `Promise` really shouldn’t exist; everything
  //       implemented on `Promise` could be re-implemented on top of
  //       `EventEmitter` directly. However, that will have to be hashed out
  //       with @ryah.
  
  // FIXME: This code uses a metric shitton of nested `Promise`s, that
  //        callback or errback eachother in a chain. Allocating all of these
  //        is almost guaranteed to be a performance concern; consider
  //        refactoring to pass around a single `acquisition` from the very
  //        start.
  
  // TODO: What is `this` throughout the execution of an `from`’d file?
  //       Perhaps, if it’s valid, we should `apply()` our wrapper to `null`.
  
  // For the moment, this file has to be dual-compatible with both `from`
  // *and* the old ‘securable modules’ `require()` system (as that is the only
  // easy method for people wishing to get `from` into their code to do so).
  // For that reason, we’re going to ensure `exports` exists, and use that as
  // our `from` namespace.
  // 
  // In ‘the future’ (/dun dun dun+/), I’m hoping that this code will be
  // merged into Node.js and used to replace the ‘securable modules’
  // system as the primary code-acquisition system, and `from` will simply be
  // available. Until then, to make upgrading (if that happens) easier, I
  // suggest something like `var from = require('from');`.
  
  // Due to the way locals are declared and looked up, we can’t safely use
  // `exports` inside here. (Specifically, using `var exports` anywhere inside
  // this file will override the argument declaration, and lose us access to
  // that argument.) Hence, we’re going to define our own object, if exports
  // is undeclared.
  var from = (typeof exports !== 'undefined') ? exports : new(Object);
  
  // ============
  // = Plumbing =
  // ============
  
  // FIXME: This really should be some sort of tree-like structure; I’d much
  //        prefer these objects to be prototypal descendants of `Error`, and
  //        then have some of them additionally descend from eachother… but
  //        that really requires poopy.js, and that’s not an option inside
  //        this file. So, as it is, you have to individually compare to each
  //        and every element of `from.errors`.
  var errors = {
    notAbsolute: new(Error)("Path is not absolute.")
,   unreadable: new(Error)("Path can not be opened.")
,   notAFile: new(Error)("Path does not refer to a file.")
,   notADirectory: new(Error)("Path does not refer to a directory.")
,   doesNotExist: new(Error)("Nothing exists at this path.")
,   notFound: new(Error)("`from` could not resolve your requested package")
,   lost: new(Error)("We’re lost! `from` doesn’t know where it is. " +
      "Did you try a relative `from` in a file not acquired by an absolute `from`?")
,   completed: new(Error)("This acquisition has been completed, and can no " +
      "longer be modified.")
  }; from['errors'] = errors;
  
  var delay = function(func) { setTimeout(func, 0) };
  
  process.Promise.prototype['passCallback'] = function(to) {
    this.addCallback(function(ev) { to.emitSuccess(ev) }); return this; };
  process.Promise.prototype['passErrback'] = function(to) {
    this.addErrback(function(ev) { to.emitError(ev) }); return this; };
  process.Promise.prototype['pass'] = function(to) {
    this.passCallback(to).passErrback(to); return this; };
  
  // This will override `process.paths` if defined. However, bear in mind that
  // this property is *specific to this instance of `from`*. If multiple
  // systems bring in `from` separately, they will have separate `from.paths`!
  var paths; // = undefined;
  from['paths'] = paths;
  
  // `.js` is first, by default, because we want to let library authros create
  // JavaScript ‘loader’ files for their native extensions.
  var extensions = ['', '.js', '.node'];
  from['extensions'] = extensions;
  
  // For API consistency with `from.thisDirectory`, `from.thisPath` returns a
  // `Promise`. There’s no *actual* async operations occuring, feel free to
  // `wait()` on it for a sync return value.
  var thisPath; // = undefined;
  var thisPathGetter = function() {
    var getter = new(process.Promise);
    
    delay(function() { getter.emitSuccess(thisPath) });
    
    return getter;
  }; from['thisPath'] = thisPathGetter;
  
  var thisDirectory = function(relativeTo) {
    var getter = new(process.Promise),
            me = arguments.callee;
    
    if (typeof relativeTo === 'undefined') {
      relativeTo = thisPath };
    
    delay(function() {
      // TODO: Figure out how to access the path that the `require()` system
      // stores, so we can bootstrap from a `require()`d file.
      if (typeof relativeTo === 'undefined') {
        getter.emitError(errors.lost) }
      else {
        if (relativeTo[0] !== '/') {
          getter.emitError(errors.notAbsolute) }
        else {
          posix.stat(relativeTo)
            .addCallback(function(directory) {
              if (directory.isDirectory()) { getter.emitSuccess(relativeTo) }
              else {
                var bits = relativeTo.split('/'); bits.length = bits.length - 1;
                me.apply(this, [bits.join('/')]).pass(getter);
              }
            })
            .addErrback(function() {
              getter.emitError(errors.doesNotExist) }) } } });
    
    return getter;
  }; from['thisDirectory'] = thisDirectory;
  
  var superclass = process.Promise,
  
  Acquisition = function() {
    superclass.apply(this, arguments);
    this.exports = new(Object);
  };
  
  // No poopy to do our work for us here! )-:
  (Acquisition.prototype = (function(){
    var F = new(Function);
    F.prototype = superclass.prototype;
    return new(F);
  })()).constructor = Acquisition;
  
  Acquisition.prototype.export = function(exports) {
    if (this._hasFired) { throw(errors.completed) };
    for (variable in exports) { this.exports[variable] = exports[variable] };
    return this;
  };
  
  Acquisition.prototype.import = function(exports) {
    return this;
  };
  
  from['Acquisition'] = Acquisition;
  
  // Compiles some source, associates it with the given path, and returns the
  // resulting object. The source is wrapped in an anonymous function, to
  // preserve scope, and passsed any variables you give to this function as
  // the third argument.
  var compile = function(source, filePath, exports) {
    var defines = new(Object);
    if (typeof defines['__filename'] === 'undefined') {
      defines['__filename'] = filePath };
    if (typeof defines['from'] === 'undefined') {
      defines['from'] = from };
    if (typeof defines['require'] === 'undefined') {
      defines['require'] = require };
    
    if (typeof exports !== 'undefined') {
      for (variable in exports) { defines[variable] = exports[variable] }
    };
    
    var variables = [], values = [];
    for (variable in defines) {
      variables.push(variable);
      values.push(defines[variable]);
    };
    
    var oldPath = thisPath;
    thisPath = filePath;
    
    // Stolen from `src/node.js`, to remove any shebang on the first line.
    source = source.replace(/^\#\!.*\n/, '');
    
    // TODO: This doesn’t work with the standard ‘library wrapped in a
    //       function’ idiom, because *we* wrap it in a function *again*, and
    //       then there is no return value. We need to implicitly add a return
    //       value if necessary.
    //       
    //       The only workaround at the moment is to ensure you include an
    //       explicit return statement in the document, i.e.
    //       `return (function(){ … })()`
    // TODO: I am not entirely sure if this is ‘secure,’ nor am I even sure if
    //       I think it *should* be. For instance, I imagine one could do evil
    //       things of some sort with a file like this:
    //       
    //           })
    //           var gaz = 123;
    //           (function(){
    //       
    //       However, I don’t exactly see how that could be a problen… you can
    //       already inject variables into the enclosing scope (up to the
    //       global scope) simply by avoiding the good-practice `var` keyword…
    //       and if you’re `from`ing the sourecode of the file, don’t you
    //       already implicitly trust it, to some extent?
    // TODO: Is `process.compile` not an operation that could possibly be
    //       slow? It doesn’t hit the filesystem or any other resource, but…
    //       it seems to me that, for this particular case, the CPU itself
    //       could be considered a ‘slow resource’ for the purposes of
    //       Node.js’s ideological asynchronicity goals. I should ask @ryah
    //       about making `process.compile` async, and possibly (in the
    //       meantime) wrap this call in a `delay()`.
    // TODO: Currently, we set `this` to a new `Object`. There’s probably
    //       something smarter/more useful we could do with it.
    var returnValue = process.compile(
      "(function(" + variables.join(', ') + ") {\n" + source + "\n})", filePath)
      .apply(new(Object), values);
    
    thisPath = oldPath;
    return returnValue;
  }; from['compile'] = compile;
  
  var constructFrom = function(resolver) {
    return function(pathBit) {
      var acquisition = new(Acquisition);
      
      resolver.apply(this, [pathBit])
        .addCallback(function(pathBit) {
          posix.cat(pathBit)
            .addCallback(function(source) {
              acquisition.emitSuccess(
                from.compile(source, pathBit, acquisition.exports) ) })
            .addErrback(function() {
              acquisition.emitError(errors.unreadable) }) })
        .passErrback(acquisition);
        
      return acquisition;
    };
  };
  
  
  // =============
  // = Porcelain =
  // =============
  
  // === Path resolvers
  from['resolve'] = {};
  
  var resolveAbsolute = function(pathBit) {
    var resolution = new(process.Promise);
    
    // FIXME: Is this a race condition? Will the function *always* return
    //        *before* this `delay()` runs? If not, we may have the situation
    //        where the errback is not defined before the synchronous error
    //        condition below craps out. Same *might* be a problem with
    //        defining impots/exports on the `resolution`.
    //        
    //        Alternatively (though this isn’t a general solution to similar
    //        situations), we could `throw` the error instead of errbacking
    //        it. It *is* a synchronous error, after all. It just seems odd,
    //        to me, to make 90% of the errors that might be encountered by
    //        this system handleable by errbacks, and then have one error that
    //        you would have to `catch`.
    delay(function() {
      // TODO: Windows support? What about drive names (C:/) and such?
      if (pathBit[0] !== '/') {
        resolution.emitError(errors.notAbsolute) }
      else {
        // Probably the most simplistic function in this library, we don’t
        // really have to ‘resolve’ an absolute path. We simply have to check
        // if it exists, and is a file.
        posix.stat(pathBit)
          .addCallback(function(file) {
            if (file.isFile) { resolution.emitSuccess(pathBit) }
            else { resolution.emitError(errors.notAFile) } })
          .addErrback(function() {
            resolution.emitError(errors.doesNotExist) }) } });
    
    return resolution;
  }; from.resolve['absolute'] = resolveAbsolute;
  
  var resolveRelative = function(pathBit, relativeTo) {
    var resolution = new(process.Promise);
    
    thisDirectory(relativeTo)
      .addCallback(function(thisDirectory) {
        resolveAbsolute(thisDirectory + '/' + pathBit).pass(resolution) })
      .passErrback(resolution);
    
    return resolution;
  }; from.resolve['relative'] = resolveRelative;
  
  var resolvePackage = function(pathBit, libraryPaths) { var libraryPath;
    var resolution = new(process.Promise),
                me = arguments.callee;
    
    // If we’re not passed any `libraryPaths`, we’ll look first in
    // `thisDirectory`, and then fall through to reducing on `from.paths` or
    // `process.paths`
    if (typeof libraryPaths === 'undefined') {
      libraryPaths = (from.paths || process.paths).slice(0);
      
      thisDirectory()
        .addCallback(function(thisDirectory) {
          resolvePackage_inLibrary(pathBit, thisDirectory)
            .passCallback(resolution)
            .addErrback(function() {
              me.apply(this, [pathBit, libraryPaths]).pass(resolution) }) })
        .passErrback(resolution);
    } else {
      libraryPath = libraryPaths.shift();
      
      // TODO: DRY this up. Convenience function like `passErrback` to
      //       construct a function that auto-reduces?
      // TODO: Print warnings with some of these errbacks, as some of them
      //       shouldn’t occur (i.e. a libraryPath being a file instead of a
      //       directory, or not existing)
      // TODO: Check if the first folder in the pathBit exists as a library in
      //       `libraries`, and move it to the front if so. Same for
      //       extensions.
      posix.stat(libraryPath)
        .addCallback(function(directory) {
          if (directory.isDirectory()) {
            posix.readdir(libraryPath)
              .addCallback(function(libraries) {
                resolvePackage_inLibraries(pathBit, libraryPath, libraries)
                  .passCallback(resolution)
                  .addErrback(function(error) {
                    if (libraryPaths.length > 0) {
                      me.apply(this, [pathBit, libraryPaths])
                        .pass(resolution) }
                    else { resolution.emitError(error) } }) })
              .addErrback(function(error) {
                if (libraryPaths.length > 0) {
                  me.apply(this, [pathBit, libraryPaths])
                    .pass(resolution) }
                else { resolution.emitError(errors.notFound) } }) }
          else {
            if (libraryPaths.length > 0) {
              me.apply(this, [pathBit, libraryPaths])
                .pass(resolution) }
            else { resolution.emitError(errors.notFound) } } })
        .addErrback(function(error) {
          if (libraryPaths.length > 0) {
            me.apply(this, [pathBit, libraryPaths])
              .pass(resolution) }
          else { resolution.emitError(error) } });
    };
    
    return resolution;
  }; from.resolve['package'] = resolvePackage;
  
  // Reduces over a list of libraries, calling `resolvePackage_inLibrary` on
  // each one.
  //--
  // TODO: This is tiny, and only used once. Can we inline this into
  //       `resolvePackage`?
  var resolvePackage_inLibraries = function(pathBit, libraryPath, libraries) {
    var resolution = new(process.Promise),
                me = arguments.callee,
           library = libraryPath+'/'+libraries.shift()+'/lib';
    
    // UHH: Are these paths post-slash or pre-slash? And is `libraryPath`
    //      absolute?
    // TODO: We do the whole stat/isDirectory/readdir dance in at least three
    //       disparate locationss. DRY that up.
    posix.stat(library)
      .addCallback(function(directory) {
        if (directory.isDirectory()) {
          resolvePackage_inLibrary(pathBit, library)
            .passCallback(resolution)
            .addErrback(function(error) {
              if (libraries.length > 0) {
                me.apply(this, [pathBit, libraryPath, libraries])
                  .pass(resolution) }
              else { resolution.emitError(error) } }) }
        else {
          if (libraries.length > 0) {
            me.apply(this, [pathBit, libraryPath, libraries])
              .pass(resolution) }
          else { resolution.emitError(errors.notFound) } } })
      .addErrback(function(error) {
        if (libraries.length > 0) {
          me.apply(this, [pathBit, libraryPath, libraries])
            .pass(resolution) }
        else { resolution.emitError(errors.notFound) } });
    
    return resolution;
  };
  
  var resolvePackage_inLibrary = function(pathBit, library, possiblePaths) {
    var resolution = new(process.Promise),
                me = arguments.callee;
    
    if (typeof possiblePaths === 'undefined') {
      var bits = pathBit.split('/'); bits.push(bits[bits.length - 1]);
      var subbedPathBit = bits.join('/');
      
      possiblePaths = from.extensions.slice(0)
        .map(function(extension) { return pathBit + extension })
        .concat(from.extensions.slice(0)
          .map(function(extension) { return subbedPathBit + extension }))
    };
    
    resolveAbsolute(library+'/'+possiblePaths.shift())
      .passCallback(resolution)
      .addErrback(function(error) {
        if (possiblePaths.length > 0) {
          me.apply(this, [pathBit, library, possiblePaths])
            .pass(resolution) }
        else { resolution.emitError(errors.notFound) } })
    
    return resolution;
  };
  
  // === Basic froms
  from['absolute'] = constructFrom(from.resolve.absolute);
  from['relative'] = constructFrom(from.resolve.relative);
  from['package']  = constructFrom(from.resolve.package);
  
  return from;
})()
