var   fs = require('fs')
, Script = process.binding('evals').Script

;(function(){ if(typeof(from)!=="undefined"&&from){module.exports=from;return from}; return (function(){
  var root, From, Acquisition, ResolutionMutator, paths, extensions, filename, undefined, u = undefined
    , legacyRequire, compileScript, executeScript, constructCompiler, constructExecuter
    , absoluteMut, relativeMut, repositoryMut, subdirMut, libMut, initializerMut, extensionMut
    , absoluteResolver, relativeResolver, packageResolver
    , absoluteCompiler, relativeCompiler, packageCompiler
    , absoluteExecuter, relativeExecuter, packageExecuter
    , from, acquisition, export, import
  
  // No poopy.js to do our work for us here! )-:
  ;(function(){ var super = Function
    ;((From = function(blueprint){ var that
      (that = function(){return from.apply(that, arguments)})['__proto__'] = From.prototype
      
      if (!(blueprint && blueprint.imports)) that.imports = new(Object)()
      if (blueprint) Object.keys(blueprint).forEach(function(key){
        that[key] = blueprint[key] }); return that })
    .prototype = (function(){ var C; (C = new(Function)()).prototype = super.prototype; return new(C)() })())
      .constructor = From })()
  
  
  // =================
  // = Configuration =
  // =================
  
  /* This will override `require.paths`, if not empty */                                  ;From.prototype.paths =
  paths = undefined
  
  /* `.js` is first, by default, because we want to let library authros create
     JavaScript ‘loader’ files for their native extensions */                        ;From.prototype.extensions =
  extensions = ['', '.js', '.node']
  
  /* This will be defined differently for each `from` we create */                     ;From.prototype.filename =
  filename = undefined
  
  
  // ============
  // = Plumbing =
  // ============
  
  legacyRequire = function(from){ return function(path){ var exports
    return ((exports = require(path)) && exports.library === "from" ? from : exports) }}
  
  compileScript = function(source, filename){ var script;
    try { script = new(Script)(source.replace(/^\#\!.*\n/, '')) }
    catch (error) { if (SyntaxError.prototype.isPrototypeOf(error) &&
                          new(RegExp)("from-new.js").test(error.stack.split('\n')[1])) {
      console.error("OOPS: The following syntax error does *not* exist where it is reported!")
      console.error("  \\   Due to a bug in V8, the error is being reported as existing in `from.js`")
      console.error("  /   but it in fact originates from the following file:") }
      console.error("  \\ < "+filename+" >")
      throw error }
    
    // TODO: Figure out a way to get this out of the `Script` instance itself… it must store it somewhere
    script.filename = filename; return script }
  
  executeScript = function(script, imports, injections){ var sources, from, sandbox = new(Object)()
    for (source in (sources = [global, { from:(from = new(From)({ filename:script.filename, imports:imports })), 
                                            imports:from.imports, require:legacyRequire(from),
                                            __filename:script.filename, global:sandbox }, injections]))
      for (variable in sources[source]) if (sources[source].hasOwnProperty(variable))
        sandbox[variable] = sources[source][variable]
    return script.runInNewContext(sandbox) }
  
  constructCompiler = function(resolver){ return function(pathBit, _){
    resolver(pathBit, function(e, pathBit){ if(e)return _(e)
      fs.readFile(pathBit, 'utf8', function(e, source){ if(e)return _(e)
        _(u, compileScript(source.toString(), pathBit), pathBit) }) }) }}
  constructExecuter = function(compiler){ return function(pathBit, imports, injections, _){
    compiler(pathBit, function(e, script, pathBit){ if(e)return _(e)
      process.nextTick(function(){ _(u, executeScript(script, imports, injections)) }) }) }}
  
  ;(function(){ var super = Function
    ;((Acquisition = function(blueprint){ var that
      (that = function(){return acquisition.apply(that, arguments)})['__proto__'] = Acquisition.prototype
      
      if (blueprint) Object.keys(blueprint).forEach(function(key){
        that[key] = blueprint[key] }); return that })
    .prototype = (function(){ var C; (C = new(Function)()).prototype = super.prototype; return new(C)() })())
      .constructor = From })()
  
  ;(function(){ var super = Function
    ;((ResolutionMutator = function(body, blueprint){ var that
      (that = function(){return that.body.apply(that, arguments)})['__proto__'] = ResolutionMutator.prototype
      
      if (typeof(body) === "function") that.body = body
      else throw new(Error)("ResolutionMutators cannot be created without a body")
      
      if (blueprint) Object.keys(blueprint).forEach(function(key){
        that[key] = blueprint[key] }); return that })
    .prototype = (function(){ var C; (C = new(Function)()).prototype = super.prototype; return new(C)() })())
      .constructor = From })()
  
  
  // =======================
  // = Low-level porcelain =
  // =======================
                                                                                   ;From.prototype.extensionMut =
  extensionMut = new(ResolutionMutator)(function(path, query){ /* … */ })        ;From.prototype.initializerMut =
  initializerMut = new(ResolutionMutator)(function(path, query){ /* … */ })              ;From.prototype.libMut =
  libMut = new(ResolutionMutator)(function(path, query){ /* … */ })                   ;From.prototype.subdirMut =
  subdirMut = new(ResolutionMutator)(function(path, query){ /* … */ })            ;From.prototype.repositoryMut =
  repositoryMut = new(ResolutionMutator)(function(path, query){ /* … */ })          ;From.prototype.relativeMut =
  relativeMut = new(ResolutionMutator)(function(path, query){ /* … */ })            ;From.prototype.absoluteMut =
  absoluteMut = new(ResolutionMutator)(function(path, query){ /* … */ })
                                                                                ;From.prototype.resolveAbsolute =
  absoluteResolver = function(pathBit, _){
    // TODO: Windows support? What about drive names (C:/) and such?
    if (pathBit[0] !== '/' && pathBit[0] !== '~') return _(new(Error)("Path is not absolute."))
    
    // TODO: Support `~elliottcable/foo` type paths. (I have no idea, remotely, how to do this.)
    if (pathBit[0] === '~') pathBit = process.env['HOME'] + pathBit.substring(1)
    
    // Probably the most simplistic function in this library, we don’t
    // really have to ‘resolve’ an absolute path. We simply have to check
    // if it exists, and is a file.
    fs.stat(pathBit, function(e, file){ if(e)return _(e)
      if (file.isFile) return _(u, pathBit)
                  else return _(new(Error)("Path does not refer to a file.")) }) }
                                                                                ;From.prototype.compileAbsolute =
  absoluteCompiler = constructCompiler(absoluteResolver)                        ;From.prototype.executeAbsolute =
  absoluteExecuter = constructExecuter(absoluteCompiler)
  
  
  // ========================
  // = High-level porcelain =
  // ========================
  
  // This is the most common interface to `from`: you call this method with the paths to files you want, and a
  // callback that expects to be handed the library objects from those files.
  // 
  // If you like, you can also omit the callback, and receive an `Acquisition` object, that you can then call at
  // a later date with a callback.
  from = function(pathBit, pathBit, pathBit /* ... */, _){ var acquisition, paths
    if (typeof(_ = arguments[arguments.length - 1]) !== "function") _ = undefined
    
           acquisition = new(Acquisition)({ from:this, paths:Array.prototype.slice.call(arguments, 0, _? -1:u) })
    if (_) acquisition (_)
    return acquisition
  }
  
  // Since `from` hands you back an `Acquisition` if you don’t provide a callback, you can call *it* with a
  // callback after having modified the `Acquisition`. This is utilized via something like:
  // 
  //     from('something', 'somewhere/somethingElse')(function(something, somethingElse){
  //       
  //     })
  // 
  // (Notice that the *return value* of `from()` is what is called with the parenthesis, via `from()()`!)
  acquisition = function(_){ var that = this, iterate
    
    ;(iterate = function(res, index){ if (typeof(that.paths[index]) === "undefined") return _.call(u,res)
      absoluteExecuter(that.paths[index], that.exports[index], undefined, function(e, result){ if(e)throw e
        if (that.imports[index]) Object.keys(that.imports[index]).forEach(function(key){ var n
          that.from.imports[key] = result[(n = that.imports[index][key]) ? n : key] })
        res[index] = result; iterate(res, ++index) }) })(new(Array)(), 0)
    
    return that }
  
  // These two methods process `exports` and `imports`, respectively. The former takes objects containing
  // variable associations of the form `{"externalName": localVariable}` (notice that we pass localVariable
  // directly), while the latter takes associations of the form `{"localName", "externalName"}`.
  // 
  // `export()`s are taken from the local namespace (i.e. whatever values you hand in in the association
  // objects) and placed into the `imports` object *of the file being acquired* (hence, “exporting” values to the
  // external file), while `import()`s are taken from the return value (presumably, then, the library-object) of
  // the file being acquired and placed into the `imports` object *of the file doing the acquiring* (i.e. where
  // `from()` was called from… hence, “importing” values from the external file).
                                                                                  ;Acquisition.prototype.export =
  export = function(variable, variable, variable /* ... */){
    this.exports = Array.prototype.slice.call(arguments); return this }           ;Acquisition.prototype.import =
  import = function(variable, variable, variable /* ... */){
    this.imports = Array.prototype.slice.call(arguments); return this }
  
  
  root = new(From)({ filename:filename, root:true })
if (typeof(module) !== "undefined") (module.exports = root).library = "from"; return root })() })()
