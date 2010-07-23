var   fs = require('fs')
, Script = process.binding('evals').Script;

sys = require('sys')

return (function() { var posix, paths, thisPath, undefined //= undefined
, compileScript, executeScript, constructCompiler, constructExecuter, resolveAbsolute
, from = typeof(exports) !== 'undefined' ? exports : new(Object)
  // Due to the way locals are declared and looked up, we can’t safely use
  // `exports` inside here. (Specifically, using `var exports` anywhere inside
  // this file will override the argument declaration, and lose us access to
  // that argument.) Hence, we’re going to define our own object, if exports
  // is undeclared.
  
  // =================
  // = Configuration =
  // =================
  
  // This will override `process.paths` if defined. However, bear in mind that
  // this property is *specific to this instance of `from`*. If multiple
  // systems bring in `from` separately, they will have separate `from.paths`!
  from['paths'] = paths
  
  // `.js` is first, by default, because we want to let library authros create
  // JavaScript ‘loader’ files for their native extensions.
  from['extensions'] = extensions = ['', '.js', '.node']
  
  // ============
  // = Plumbing =
  // ============
  
  compileScript = function(source, filename){ var script;
    try { script = new(Script)(source.replace(/^\#\!.*\n/, '')) }
    catch (error) { if (SyntaxError.prototype.isPrototypeOf(error) &&
                          new(RegExp)("from-new.js").test(error.stack.split('\n')[1])) {
      console.error("BUG: The following syntax error does *not* exist where it is reported!")
      console.error("     Due to a bug in V8, the error is being reported as existing in `from.js`,")
      console.error("     but it is in fact originating from a file *compiled* by `from.js`.") }
      throw error }
    
    // TODO: Figure out a way to get this out of the `Script` instance itself… it must store it somewhere
    script.filename = filename; return script }
  
  executeScript = function(script, exports){ var
      globals           = { __filename: script.filename, from: from, require: require }
    if (typeof(exports) !== 'undefined') for (variable in exports)
      globals[variable] = exports[variable]
    
    return script.runInNewContext(globals) }
  
  
  constructCompiler = function(resolver){ return function(pathBit, _){
    resolver(pathBit, function(e, pathBit){ if(e)return _(e)
      fs.readFile(pathBit, 'utf8', function(e, source){ if(e)return _(e)
        _(undefined, compileScript(source.toString()), pathBit) }) }) }}
  constructExecuter = function(compiler){ return function(pathBit, exports, _){
    compiler(pathBit, function(e, script, pathBit){ if(e)return _(e)
      _(undefined, executeScript(script, pathBit, exports)) }) }}
  
  // =============
  // = Porcelain =
  // =============
  
  from['resolve'] = new(Object)()
  
  resolveAbsolute = function(pathBit, _){
    // TODO: Windows support? What about drive names (C:/) and such?
    if (pathBit[0] !== '/') return _(new(Error)("Path is not absolute."))
    
    // Probably the most simplistic function in this library, we don’t
    // really have to ‘resolve’ an absolute path. We simply have to check
    // if it exists, and is a file.
    fs.stat(pathBit, function(e, file){ if(e)return _(e)
      if (file.isFile) return _(undefined, pathBit)
                  else return _(new(Error)("Path does not refer to a file.")) })
  }
  
  from['resolve']['absolute'] =                                       resolveAbsolute
  
  from['compile'] = new(Object)()
  from['compile']['absolute'] =                    constructCompiler( resolveAbsolute )
  
  from['execute'] = new(Object)()
  from['execute']['absolute'] = constructExecuter( constructCompiler( resolveAbsolute ) )
  
return from })()
