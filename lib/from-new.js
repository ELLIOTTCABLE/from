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
  probe = function(path, _){ if (path[0] !== '/') return _(new(Error)("Path is not absolute"))
    fs.stat(path, function(e, file){ if (e) return _(e)
      if (file.isFile()) return _(u, path)
                    else return _(new(Error)("Path does not refer to a file")) }) }
  
  mutate = function(query, mutators, _){ var it = this
  , $$ = function($){ var $ = $.slice(0)
      if (!$[-1].paths) {
        return $[-1].mutator.call(it
        , $[-2].paths.lastThat(function(path){ return path.mutators.indexOf($[-1]) !== -1 }).path
        , query, function(error, paths){ $[-1].error = error; $[-1].paths = paths
            .filter(function(path){ return !$[-2].paths.some(function(p){ return p.path === path }) })
            .map(function(path){ return{ path:path, mutators:$[-1].mutator.after.map(function(mutator){ return{
              mutator:mutator, paths:undefined, error:undefined } }), error:undefined } }); return $$($) }) }
      
      if ($[-1].paths.empty) return $$(($.pop(), $))
      
      var     testedPaths =               $[-1].paths.filter(function(path){    return  path.error })
        ,   untestedPaths =               $[-1].paths.filter(function(path){    return !path.error })
        , unfinishedPaths =               testedPaths.filter(function(path){    return !path.mutators.empty &&
                                          path.mutators.some(function(mutator){ return !mutator.paths }) })
      
      if (!unfinishedPaths.empty) return $$(($.push(unfinishedPaths.first.mutators
                                           .firstThat(function(mutator){ return !mutator.paths })), $))
      
      if (!untestedPaths.empty)
        return probe(untestedPaths.first.path, function(error, extant){ if (!error) return _(u, extant, $)
          console.error("//"+new(Array)($.length).join('  ')+"("+$[-1].mutator.tag+") "+untestedPaths.first.path)
          untestedPaths.first.error = error; return $$($) })
      
      if ($.length <= 1) return _(new(Error)("Could not resolve path"), undefined, $)
      
      return $$(($.pop(), $)) }
    
    var rootMut = new(ResolutionMutator)(function(path, query, _){ return _(u, [path]) },
                                           { after:mutators.slice(0), tag:"root" })
      , after = rootMut.after.map(function(mutator){ return{ mutator:mutator, paths:undefined, error:undefined } })
    $$([{ mutator:rootMut, paths:[{ path:query, mutators:after, error:undefined }], error:undefined }])
    
  } // / mutate = function(query, mutators, _)
  
  
  // =======================
  // = Low-level porcelain =
  // =======================
  
  From.prototype.muts = new(Array)()
  
  /* Replaces `~` with $HOME. */                                                      ;From.prototype.muts.home =
  homeMut = new(ResolutionMutator)(function(path, query, _){
    if (!process.env['HOME']) return _(new(Error)("$HOME not set"), [])
    return _(u, [path.replace('~', process.env['HOME'])]) }
  , { after:[], tag:"home" })
  
  /* Appends each of `from.extensions` to the path. */                           ;From.prototype.muts.extension =
  extensionMut = new(ResolutionMutator)(function(path, query, _){
    return _(u, this.extensions.map(function(extension){ return path+extension })) }
  , { after:[homeMut], tag:"extension" })
  
  /* Appends the last section of the path to the path again. This serves to ensure that we check for
     `/foo/bar/bar.js` as well as `/foo/bar.js`. Also any `initializers`. */   ;From.prototype.muts.initializer =
  initializerMut = new(ResolutionMutator)(function(path, query, _){ var initializers
    (initializers = this.initializers.slice(0))
                 .push(path.slice(path.lastIndexOf('/') + 1))
    return _(u, initializers.map(function(initializer){ return path+"/"+initializer })) }
  , { after:[homeMut, extensionMut], tag:"initializer" })
  
  /* Prepends "lib/" to the query, ensuring we check inside library folders. */        ;From.prototype.muts.lib =
  libMut = new(ResolutionMutator)(function(path, query, _){
    return _(u, [path.replace(query, "lib/"+query)]) }
  , { after:[homeMut, extensionMut, initializerMut], tag:"lib" })
  
  /* Appends each of the subdirectories (if the current path is, itself, a directory) to the path. Mind you,
     this doesn’t work if it’s called *after* things like `muts.extension()`. */    ;From.prototype.muts.subdir =
  subdirMut = new(ResolutionMutator)(function(path, query, _){ var i
  , dir = path.slice(0, (i = path.indexOf(query))), rest = path.slice(i)
    fs.stat(dir, function(e, stat){ if (e) return _(e, [])
      if (stat.isDirectory()) fs.readdir(dir, function(e, subdirs){ if (e) return _(e, [])
        return _(u, subdirs.map(function(subdir){ return dir+"/"+subdir+"/"+rest })) })
      else return _(new(Error)("Path does not refer to a directory"), []) }) }
  , { after:[homeMut, extensionMut, initializerMut, libMut], tag:"subdir" })
  
  /* Prepends the path with each repository from `from.repositories` (or, if not defined, `require.paths`
     instead). */                                                               ;From.prototype.muts.repository =
  repositoryMut = new(ResolutionMutator)(function(path, query, _){
    return _(u, (this.repositories || require.paths).map(function(repository){ return repository+"/"+path })) }
  , { after:[homeMut, extensionMut, initializerMut, libMut, subdirMut], tag:"repository" })
    
  /* Resolves relative to the `filename` of the `from` associated with the current file. This obviously cannot
     operate in files that don’t have a `filename` (hence, you can only utilize relative paths inside files that
     were, themselves, aquired with `from`.) */                                   ;From.prototype.muts.relative =
  relativeMut = new(ResolutionMutator)(function(path, query, _){ var e
    if (!this.filename)
      return _(new(Error)("Cannot resolve relative paths outside from’s purview"), [])
    return _(u, [path]) }, { after:[homeMut, extensionMut, initializerMut, libMut], tag:"relative" })
  
  /* This mutator is a noop. It’s simply here to ensure that the first series of resolution checks is always
     applied to the raw path queried. */                                          ;From.prototype.muts.absolute =
  absoluteMut = new(ResolutionMutator)(function(path, query, _){
    return _(u, [path]) }, { after:[homeMut, extensionMut, initializerMut], tag:"absolute" })
  
                                                                                        ;From.prototype.resolve =
  resolve = function(pathBit, mutators, _){
    mutate.call(this.from, pathBit, mutators, function(e, path){ if (e) return _(e)
      if (path) return _(u, path) }) }
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
  
  /* A series of subpackage-initializer files’ names. Automatically expanded to include the name of the
     subpackage itself at mutate-time. */                                          ;From.prototype.initializers =
  initializers = ['__init__' /* Python-esque! */]
  
  /* This will be defined differently for each `from` we create */                     ;From.prototype.filename =
  filename = undefined
  
  /* These are the default `ResolutionMutator`s that will be executed on paths via `from()`. You can add your own
     `ResolutionMutator`s describing additional functionality. */                  ;From.prototype.rootMutators =
  rootMutators = [absoluteMut, relativeMut, repositoryMut]
  
  
  root = new(From)({ filename:filename, root:true })
if (typeof(module) !== "undefined") (module.exports = root).library = "from"; return root })() })()
