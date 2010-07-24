var   fs = require('fs')
, Script = process.binding('evals').Script

;(function(){ if(typeof(from)!=="undefined"&&from){module.exports=from;return from}; return (function(){
  var from, From, paths, extensions, filename, undefined //= undefined
    , legacyRequire, compileScript, executeScript, constructCompiler, constructExecuter
    , absoluteResolver, relativeResolver, packageResolver
    , absoluteCompiler, relativeCompiler, packageCompiler
    , absoluteExecuter, relativeExecuter, packageExecuter
  
  // No poopy.js to do our work for us here! )-:
  ;(function(){ var super = Function
    ;((From = function(blueprint){ var that = this
      super.apply(this, ['return From.body.apply(that, arguments)']
        .concat(Array.prototype.slice.call(arguments, 1)))
      
      if (!(blueprint && blueprint.imports)) this.imports = new(Object)()
      if (blueprint) Object.keys(blueprint).forEach(function(key){
        that[key] = blueprint[key] }); return that })
    .prototype = (function(){ var C; (C = new(Function)()).prototype = super.prototype; return new(C)() })())
      .constructor = From })()
  
  
  // =================
  // = Configuration =
  // =================
  
  // This will override `require.paths`, if not empty.
  From.prototype.paths = paths = undefined
  
  // `.js` is first, by default, because we want to let library authros create
  // JavaScript ‘loader’ files for their native extensions.
  From.prototype.extensions = extensions = ['', '.js', '.node']
  
  // This will be defined differently for each `from` we create with `constructFrom`.
  From.prototype.filename = filename = undefined
  
  
  // ============
  // = Plumbing =
  // ============
  
  legacyRequire = function(from){ return function(path){ var exports
    return ((exports = require(path)) && exports.library === "from" ? from : exports)
  }}
  
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
  
  executeScript = function(script, injections){ var sources, from, sandbox = new(Object)()
    for (source in (sources = [global, { from:(from = new(From)({filename:script.filename})), 
                                            imports:from.imports, require:legacyRequire(from),
                                            __filename:script.filename, global:sandbox }, injections]))
      for (variable in sources[source]) if (sources[source].hasOwnProperty(variable))
        sandbox[variable] = sources[source][variable]
    return script.runInNewContext(sandbox) }
  
  constructCompiler = function(resolver){ return function(pathBit, _){
    resolver(pathBit, function(e, pathBit){ if(e)return _(e)
      fs.readFile(pathBit, 'utf8', function(e, source){ if(e)return _(e)
        _(undefined, compileScript(source.toString(), pathBit), pathBit) }) }) }}
  constructExecuter = function(compiler){ return function(pathBit, injections, _){
    compiler(pathBit, function(e, script, pathBit){ if(e)return _(e)
      process.nextTick(function(){ _(undefined, executeScript(script, injections)) }) }) }}
  
  
  // =======================
  // = Low-level porcelain =
  // =======================
  
  absoluteResolver = function(pathBit, _){
    // TODO: Windows support? What about drive names (C:/) and such?
    if (pathBit[0] !== '/') return _(new(Error)("Path is not absolute."))
    
    // Probably the most simplistic function in this library, we don’t
    // really have to ‘resolve’ an absolute path. We simply have to check
    // if it exists, and is a file.
    fs.stat(pathBit, function(e, file){ if(e)return _(e)
      if (file.isFile) return _(undefined, pathBit)
                  else return _(new(Error)("Path does not refer to a file.")) }) }
  
  From.prototype.resolveAbsolute = absoluteResolver
  From.prototype.compileAbsolute = absoluteCompiler = constructCompiler(absoluteResolver)
  From.prototype.executeAbsolute = absoluteExecuter = constructExecuter(absoluteCompiler)
  
  
  // ========================
  // = High-level porcelain =
  // ========================
  
  From.body = function(pathBit, _){ /* … */ }
  
  from = new(From)({filename:filename, root:true})
if (typeof(module) !== "undefined") (module.exports = from).library = "from"; return from })() })()
