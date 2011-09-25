var   fs = require('fs')
, Script = process.binding('evals').Script

;(function(){ if(typeof(from)!=="undefined"&&from){module.exports=from;return from}; return (function(){
  var root, From, Acquisition, ResolutionMutator, undefined, u = undefined
    , legacyRequire, compileScript, executeScript, constructCompiler, constructExecuter, of, probe, mutate
    , mutators, extensionMut, initializerMut, libMut, subdirMut, repositoryMut, relativeMut, absoluteMut
    , resolve, compile, execute, from, acquisition, _export, _import
    , repositories, extensions, filename, basicMutators
  
  // No poopy.js to do our work for us here! )-:
  ;(function(){ var up = Function
    ;((From = function(blueprint){ var that
      (that = function(){ return from.call(this, arguments) })['__proto__'] = From.prototype
      
      if (!(blueprint && blueprint.imports)) that.imports = new(Object)()
      if (blueprint) Object.keys(blueprint).forEach(function(key){
        that[key] = blueprint[key] }); return that })
    .prototype = (function(){ var C; (C = new(Function)()).prototype = up.prototype; return new(C)() })())
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
    
    defineGetter(Array.prototype, "first",   function(){   return  this[0] })
    defineGetter(Array.prototype, "last",    function(){   return  this[this.length - 1] })
    defineGetter(Array.prototype, "-1",      function(){   return  this[this.length - 1] })
    defineGetter(Array.prototype, "-2",      function(){   return  this[this.length - 2] })
    defineGetter(Array.prototype, "empty",   function(){   return !this.length })
    define(      Array.prototype, "include", function(it){ return  this.indexOf(it) !== -1 })
    
    define(Array.prototype, "firstThat", function(_){ var rv
      return this                   .some(function(element){ return _(rv = element) }) ? rv : null })
    define(Array.prototype, "lastThat", function(_){ var rv
      return this.slice(0).reverse().some(function(element){ return _(rv = element) }) ? rv : null })
    
    defineGetter(Object.prototype, "peek", function(){ console.log(require('sys').inspect(this)); return this })
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
  
  ;(function(){ var up = Function
    ;((Acquisition = function(blueprint){ var that
      (that = function(){ return acquisition.call(this, arguments) })['__proto__'] = Acquisition.prototype
      
      that.queries   = new(Array)()
      that.callbacks = new(Array)()
      if (blueprint) Object.keys(blueprint).forEach(function(key){
        that[key] = blueprint[key] }); return that })
    .prototype = (function(){ var C; (C = new(Function)()).prototype = up.prototype; return new(C)() })())
      .constructor = From })()
  
  Acquisition.prototype.dispatch = function(){ var that = this, iterate, jterate
    if (that.dispatched) return that.dispatched
    
    ;(iterate = function(index){ if (index >= that.queries.length) return that.complete()
      ;(jterate = function(jndex){ if (jndex >= that.queries[index].queries.length) return iterate(++index)
        execute.call(that
        , that.queries[index].queries[jndex], that.from.rootMutators, that.queries[index].exports, null
        , function(e, result){ if (e) throw e
            if (that.queries[index].imports) {
              that.from.imports[that.queries[index].queries[jndex]] = new(Object)()
              Object.keys(that.queries[index].imports).forEach(function(key){
                 that.from.imports[that.queries[index].queries[jndex]][key] =
                   result[that.queries[jndex].imports[key]] }) }
            else that.from.imports[that.queries[index].queries[jndex]] =
                   result
            
            return jterate(++jndex) }) })(0) })(0)
    
    return that.dispatched = true }
  
  Acquisition.prototype.complete = function(){ var that = this
    arguments = that.queries.reduce(function(arguments, query){
      arguments.push.apply(arguments, query.queries.reduce(function(arguments, q){
        arguments.push.apply(query.imports? Object.keys(query.imports).map(function(key){
          return that.from.imports[q][key] }) : [that.from.imports[q]])
        return arguments }, new(Array)())); return arguments }, new(Array)())
    
    that.callbacks.forEach(function(callback){ return callback.apply(undefined, arguments) })
    
    return this.complete = true }
  
  ;(function(){ var up = Function
    ;((ResolutionMutator = function(body, blueprint){ var that
      (that = function(){ return that.body.call(this, arguments) })['__proto__'] = ResolutionMutator.prototype
      
      if (typeof(body) === "function") that.body = function(arguments){ return body.apply(this, arguments) }
      else throw new(Error)("ResolutionMutators cannot be created without a body")
      
      if (blueprint) Object.keys(blueprint).forEach(function(key){
        that[key] = blueprint[key] }); return that })
    .prototype = (function(){ var C; (C = new(Function)()).prototype = up.prototype; return new(C)() })())
      .constructor = From })()
  
  /* A simple little hack to “arraify” its argument. */
  var of = function(arg){ return Array.isArray(arg)? arg : (arg? [arg]:[]) }
  
  // TODO: Windows support? What about drive names (C:/) and such?
  probe = function(path, _){ if (path[0] !== '/') return _(new(Error)("Path is not absolute"))
    fs.stat(path, function(e, file){ if (e) return _(e)
      if (file.isFile()) return _(u, path)
                    else return _(new(Error)("Path does not refer to a file")) }) }
  
  mutate = function(query, mutators, _){ var it = this
  , $$ = function($){ var $ = $.slice(0)
      if (!$[-1].paths) {
        return $[-1].mutator.call(it
        , $[-2].paths.lastThat(function(path){ return path.mutators.include($[-1]) }).path
        , query, function(error, paths){ $[-1].error = error; $[-1].paths = of(paths)
            .map(function(path){ return{ path:path, mutators:of($[-1].mutator.after)
              .map(function(mutator){ return{ mutator:mutator, paths:undefined, error:undefined } })
            , error:undefined } }); return $$($) }) }
      
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
    if (!process.env['HOME']) return _(new(Error)("$HOME not set"))
    return _(u, [path.replace('~', process.env['HOME'])]) }
  , { tag:"home" })
  
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
    return _(u, this.libraries.map(function(library){ return path.replace(query, library+"/"+query) })) }
  , { after:[homeMut, extensionMut, initializerMut], tag:"lib" })
  
  /* Appends each of the subdirectories (if the current path is, itself, a directory) to the path. Mind you,
     this doesn’t work if it’s called *after* things like `muts.extension()`. */    ;From.prototype.muts.subdir =
  subdirMut = new(ResolutionMutator)(function(path, query, _){ var i
  , dir = path.slice(0, (i = path.indexOf(query))), rest = path.slice(i)
    fs.stat(dir, function(e, stat){ if (e) return _(e)
      if (stat.isDirectory()) fs.readdir(dir, function(e, subdirs){ if (e) return _(e)
        return _(u, subdirs.map(function(subdir){ return dir+"/"+subdir+"/"+rest })) })
      else return _(new(Error)("Path does not refer to a directory")) }) }
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
      return _(new(Error)("Cannot resolve relative paths outside from’s purview"))
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
  from = function(arguments){
    var  is_a = Acquisition.prototype.isPrototypeOf(this)
    ,    that = is_a? this : new(Acquisition)({ from:arguments.callee })
    , queries = Array.prototype.slice.call(arguments)
    
    that.queries.push({ queries:Array.prototype.slice.call(arguments) })
    
    return that }
  
  // Calling an `Acquisition` simply queues up a new callback for *all* of the uncompleted queries within that
  // `Acquisition`. This means that calling an `Acquisition` with a callback `Function` will result in that
  // `Function` being called with *all of those queries’ results* as arguments.
  acquisition = function(arguments){ var _ = arguments[0], that = arguments.callee
    if (that.hasOwnProperty('complete') && that.complete)
      throw new(Error)("Cannot queue new callbacks against a completed `Acquisition`")
    
    that.callbacks.push(_)
    that.dispatch()
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
 _export = function(variable, variable, variable /* ... */){
    this.queries.last.exports = Array.prototype.slice.call(arguments)
    return this }                                                                 ;Acquisition.prototype.import =
 _import = function(variable, variable, variable /* ... */){
    this.queries.last.imports = Array.prototype.slice.call(arguments)
    return this }
  
  
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
  
  /* Names of library-containing superfolders. */                                     ;From.prototype.libraries =
  libraries = ['Library', 'lib']
  
  /* This will be defined differently for each `from` we create */                     ;From.prototype.filename =
  filename = undefined
  
  /* These are the default `ResolutionMutator`s that will be executed on paths via `from()`. You can add your own
     `ResolutionMutator`s describing additional functionality. */                  ;From.prototype.rootMutators =
  rootMutators = [absoluteMut, relativeMut, repositoryMut]
  
  
  root = new(From)({ filename:filename, root:true })
if (typeof(module) !== "undefined") (module.exports = root).library = "from"; return root })() })()
