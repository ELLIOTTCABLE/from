var   fs = require('fs')
, Script = process.binding('evals').Script

;(function(){ if(typeof(from)!=="undefined"&&from){module.exports=from;return from}; return (function(){
  var root, From, Acquisition, ResolutionMutator, undefined, u = undefined
    , legacyRequire, compileScript, executeScript, constructCompiler, constructExecuter, probe, mutate
    , mutators, extensionMut, initializerMut, libMut, subdirMut, repositoryMut, relativeMut, absoluteMut
    , resolve, compile, execute, from, acquisition, export, import
    , repositories, extensions, filename, basicMutators
  
  // No poopy.js to do our work for us here! )-:
  ;(function(){ var super = Function
    ;((From = function(blueprint){ var that
      (that = function(){ return from.apply(that, arguments) })['__proto__'] = From.prototype
      
      if (!(blueprint && blueprint.imports)) that.imports = new(Object)()
      if (blueprint) Object.keys(blueprint).forEach(function(key){
        that[key] = blueprint[key] }); return that })
    .prototype = (function(){ var C; (C = new(Function)()).prototype = super.prototype; return new(C)() })())
      .constructor = From })()
  
  
  // ============
  // = Plumbing =
  // ============
  
  // These are simply some conveniences still missing from ECMAScript 5, and likely to remain absent.
  ;(function(){ var
    define = function(prototype, property, value){ var
           propertyAlreadyExists = prototype.hasOwnProperty(property)
      if (!propertyAlreadyExists) Object.defineProperty(prototype, property, { value:value, enumerable:false }) }
    
  , defineGetter = function(prototype, property, getter){ var
           propertyAlreadyExists = prototype.hasOwnProperty(property)
      if (!propertyAlreadyExists) Object.defineProperty(prototype, property, { get:getter, enumerable:false }) }
    
    defineGetter(Array.prototype, "first", function(){ return this[0] })
    defineGetter(Array.prototype, "last",  function(){ return this[this.length - 1] })
    defineGetter(Array.prototype, "-1",    function(){ return this[this.length - 1] })
    defineGetter(Array.prototype, "-2",    function(){ return this[this.length - 2] })
    defineGetter(Array.prototype, "empty", function(){ return !this.length })
    
    define(Array.prototype, "firstThat", function(_){ var rv
      return this                   .some(function(element){ return _(rv = element) }) ? rv : null })
    define(Array.prototype, "lastThat", function(_){ var rv
      return this.slice(0).reverse().some(function(element){ return _(rv = element) }) ? rv : null })
  })()
  
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
  
  ;(function(){ var super = Function
    ;((Acquisition = function(blueprint){ var that
      (that = function(){ return acquisition.apply(that, arguments) })['__proto__'] = Acquisition.prototype
      
      if (blueprint) Object.keys(blueprint).forEach(function(key){
        that[key] = blueprint[key] }); return that })
    .prototype = (function(){ var C; (C = new(Function)()).prototype = super.prototype; return new(C)() })())
      .constructor = From })()
  
  ;(function(){ var super = Function
    ;((ResolutionMutator = function(body, blueprint){ var that
      (that = function(){ return that.body.apply(this, arguments) })['__proto__'] = ResolutionMutator.prototype
      
      if (typeof(body) === "function") that.body = body
      else throw new(Error)("ResolutionMutators cannot be created without a body")
      
      if (blueprint) Object.keys(blueprint).forEach(function(key){
        that[key] = blueprint[key] }); return that })
    .prototype = (function(){ var C; (C = new(Function)()).prototype = super.prototype; return new(C)() })())
      .constructor = From })()
  
  // TODO: Windows support? What about drive names (C:/) and such?
  probe = function(path, _){
    console.error("(( in probe("+path+", _) ))")
    if (path[0] !== '/') return _(new(Error)("Path is not absolute"))
    console.error("(( path is absolute ))")
    fs.stat(path, function(e, file){
      console.error("(( stat() called back ))")
      if (e) return _(e)
      console.error("(( stat() reported no error ))")
      if (file.isFile()) {
        console.error("(( path is a file, returning ))")
        return _(u, path)}
                    else {
                      console.error("(( path is not a file, returning ))")
                      return _(new(Error)("Path does not refer to a file")) } }) }
  
  mutate = function(query, mutators, _){ var it = this
    
  , $$ = function($){ var $ = $.slice(0)
      console.error(".. recursing! (stack: "+$.length+", stack.last: "+(!$.empty ? $[-1].resolver.tag : "N/A")+")")
      console.error(new(Error)().stack.split("\n").slice(2).join("\n"))
      
      if ($.empty) {
        console.error("-- stack is empty")
        console.error("!! calling back")
        return _(new(Error)("Could not resolve path"), undefined, $)
      }
      
      if (!$[-1].paths) {
        console.error("?? $["+($.length-1)+"].paths is undefined; we haven't executed $["+($.length-1)+"].resolver")
        
        var path = $[-2].paths.lastThat(function(path){ return path.resolvers.indexOf($[-1]) !== -1 })
        
        console.error("-- calling $["+($.length-1)+"].resolver("+path.path+", "+query+", function(error, paths){ ... })")
        return $[-1].resolver.call(it, path.path, query, function(error, paths){
          console.error("(( $["+($.length-1)+"].resolver() called back ))")
          $[-1].error = error
          $[-1].paths = paths.map(function(path){ return{ path:path,
                                                     resolvers:$[-1].resolver.after.map(function(resolver){
                                                       return{ resolver:resolver,
                                                                  paths:undefined,
                                                                  error:undefined } }),
                                                         error:undefined } })
          return $$($)
        }) // / $[-1].resolver.call(it, path, query, function(error, paths)
      } // / if (!$[-1].paths)
      
      if ($[-1].paths.empty) {
        console.error("?? $["+($.length-1)+"].paths is empty; $["+($.length-1)+"].resolver gave us nothing to operate on")
        
        $.pop()
        console.error("-- removed ourselves from the stack")
        
        return $$($)
      } // / if ($[-1].paths.empty)
      
      console.error("?? $["+($.length-1)+"].paths has entries...")
      
      var     testedPaths =                $[-1].paths.filter(function(path){     return  path.error })
        ,   untestedPaths =                $[-1].paths.filter(function(path){     return !path.error })
        , unfinishedPaths =                testedPaths.filter(function(path){     return !path.resolvers.empty &&
                                          path.resolvers.some(function(resolver){ return !resolver.paths }) })
      if (!unfinishedPaths.empty) { var
        resolver = unfinishedPaths.first.resolvers.firstThat(function(resolver){ return !resolver.paths })
        console.error("?? $["+($.length-1)+"].paths has tested but not-yet-fully-resolved entries")
        $.push(resolver)
        console.error("-- pushed the first unhandled resolver ("+resolver.resolver.tag+") onto the stack")
        return $$($)
      } // / if (!unfinishedPaths.empty)
      
      console.error("?? all tested paths in $["+($.length-1)+"].paths have been fully resolved...")
      
      if (!untestedPaths.empty) {
        console.error("?? $["+($.length-1)+"].paths has untested entries")
        
        var path = untestedPaths.first
        
        console.error("-- testing "+path.path)
        console.error("## "+new(Array)($.length).join('  ')+"("+$[-1].resolver.tag+") "+path.path)
        return probe(path.path, function(error, extant){
          console.error("(( probe() called back ))")
          if (!error) {
            console.error("-- "+path.path+" exists")
            console.error("!! calling back")
            return _(u, extant, $)
          } // / if (!error)
          console.error("-- "+path.path+" does not exist")
          path.error = error
          return $$($)
        }) // / probe(path.path, function(error, extant)
      } // / if (!untestedPaths.empty)
      
      console.error("?? all paths in $["+($.length-1)+"].paths have been tested and fully resolved...")
      
      $.pop()
      console.error("-- removed ourselves from the stack")
      
      return $$($)
    } // / $$ = function($)
    
    var rootMut = new(ResolutionMutator)(function(path, query, _){ return _(u, [path]) },
                                           { after:mutators.slice(0), tag:"root" })
      , after = rootMut.after.map(function(resolver){
          return{ resolver:resolver, paths:undefined, error:undefined } })
    $$([{ resolver:rootMut, paths:[{ path:query, resolvers:after, error:undefined }], error:undefined }])
    
  } // / mutate = function(query, mutators, _)
  
  
  // =======================
  // = Low-level porcelain =
  // =======================
  
  From.prototype.muts = new(Array)()
  
  /* Appends each of `from.extensions` to the path. */                           ;From.prototype.muts.extension =
  extensionMut = new(ResolutionMutator)(function(path, query, _){
    return _(u, this.extensions.map(function(extension){ return path+extension })) }
  , { after:[], tag:"extension" })
  
  /* Appends the last section of the path to the path again. This serves to ensure that we check for
     `/foo/bar/bar.js` as well as `/foo/bar.js`. */                            ;From.prototype.muts.initializer =
  initializerMut = new(ResolutionMutator)(function(path, query, _){
    return _(u, [path+"/"+path.slice(path.lastIndexOf('/') + 1)]) }, { after:[extensionMut], tag:"initializer" })
  
  /* Prepends "lib/" to the query, ensuring we check inside library folders. */        ;From.prototype.muts.lib =
  libMut = new(ResolutionMutator)(function(path, query, _){
    return _(u, [path.replace(query, "lib/"+query)]) }, { after:[extensionMut, initializerMut], tag:"lib" })
  
  /* Appends each of the subdirectories (if the current path is, itself, a directory) to the path. Mind you,
     this doesn’t work if it’s called *after* things like `muts.extension()`. */    ;From.prototype.muts.subdir =
  subdirMut = new(ResolutionMutator)(function(path, query, _){ var i
  , dir = path.slice(0, (i = path.indexOf(query))), rest = path.slice(i)
    fs.stat(dir, function(e, stat){ if (e) return _((e.critical = false, e), [])
      if (stat.isDirectory()) fs.readdir(dir, function(e, subdirs){ if (e) return _(e, [])
        return _(u, subdirs.map(function(subdir){ return dir+"/"+subdir+"/"+rest })) })
      else return _(((e = new(Error)("Path does not refer to a directory")).critical = false, e), []) }) }
  , { after:[extensionMut, initializerMut, libMut], tag:"subdir" })
  
  /* Prepends the path with each repository from `from.repositories` (or, if not defined, `require.paths`
     instead). */                                                               ;From.prototype.muts.repository =
  repositoryMut = new(ResolutionMutator)(function(path, query, _){
    return _(u, (this.repositories || require.paths).map(function(repository){ return repository+"/"+path })) }
  , { after:[extensionMut, initializerMut, libMut, subdirMut], tag:"repository" })
    
  /* Resolves relative to the `filename` of the `from` associated with the current file. This obviously cannot
     operate in files that don’t have a `filename` (hence, you can only utilize relative paths inside files that
     were, themselves, aquired with `from`.) */                                   ;From.prototype.muts.relative =
  relativeMut = new(ResolutionMutator)(function(path, query, _){ var e
    if (!this.filename)
      return _(new(Error)("Cannot resolve relative paths outside from’s purview"), [])
    return _(u, [path]) }, { after:[extensionMut, initializerMut, libMut], tag:"relative" })
  
  /* This mutator is a noop. It’s simply here to ensure that the first series of resolution checks is always
     applied to the raw path queried. */                                          ;From.prototype.muts.absolute =
  absoluteMut = new(ResolutionMutator)(function(path, query, _){
    return _(u, [path]) }, { after:[extensionMut, initializerMut], tag:"absolute" })
  
                                                                                        ;From.prototype.resolve =
  resolve = function(pathBit, mutators, _){ var that = this, iterate
    ;(iterate = function(i){ if (i > mutators.length - 1) return _(new(Error)("Path could not be resolved"))
      mutate.call(that, pathBit, mutators[i], function(e, path){ // if (e) return _(e)
        if (path) return _(u, path); iterate(++i) }) })(0) }
                                                                                        ;From.prototype.compile =
  compile = function(pathBit, mutators, _){
    resolve.call(this, pathBit, mutators, function(e, path){ if (e) return _(e)
      fs.readFile(path, 'utf8', function(e, source){ if (e) return _(e)
        return _(u, compileScript(source.toString(), path)) }) }) }
                                                                                        ;From.prototype.execute =
  execute = function(pathBit, mutators, imports, injections, _){
    compile.call(this, pathBit, mutators, function(e, script){ if (e) return _(e)
      process.nextTick(function(){ _(u, executeScript(script, imports, injections)) }) }) }
  
  
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
    return acquisition }
  
  // Since `from` hands you back an `Acquisition` if you don’t provide a callback, you can call *it* with a
  // callback after having modified the `Acquisition`. This is utilized via something like:
  // 
  //     from('something', 'somewhere/somethingElse')(function(something, somethingElse){
  //       
  //     })
  // 
  // (Notice that the *return value* of `from()` is what is called with the parenthesis, via `from()()`!)
  acquisition = function(_){ var that = this, iterate
    ;(iterate = function(res, index){ if (typeof(that.paths[index]) === "undefined") return _.call(u, res)
      execute.call(that, that.paths[index], that.from.rootMutators, that.exports[index], null,
        function(e, result){ if (e) throw e
          if (that.imports[index]) Object.keys(that.imports[index]).forEach(function(key){ var n
            that.from.imports[key] = result[(n = that.imports[index][key]) ? n : key] })
          res[index] = result; return iterate(res, ++index) }) })(new(Array)(), 0)
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
  
  
  // =================
  // = Configuration =
  // =================
  
  /* This will override `require.paths`, if not empty */                           ;From.prototype.repositories =
  repositories = undefined
  
  /* `.js` is first, by default, because we want to let library authros create JavaScript ‘loader’ files for
     their native extensions */                                                      ;From.prototype.extensions =
  extensions = ['.js', '.node']
  
  /* This will be defined differently for each `from` we create */                     ;From.prototype.filename =
  filename = undefined
  
  /* These are the default `ResolutionMutator`s that will be executed on paths via `from()`. You can add your own
     `ResolutionMutator`s describing additional functionality. */                  ;From.prototype.rootMutators =
  rootMutators = [absoluteMut, relativeMut, repositoryMut]
  
  
  root = new(From)({ filename:filename, root:true })
if (typeof(module) !== "undefined") (module.exports = root).library = "from"; return root })() })()
