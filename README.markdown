`from`
======
It’s cool, and shit.

I really couldn’t stand the CommonJS `require()` implementation that started
shipping with Node as of [v0.1.16][api-change]. So, I sat down to design, and
later (when it was [met by deaf ears][commonjs-thread]), implement, a
replacement. This is that; originally implemented as a part of
[`poopy.js`][poopy], `from` has now split off into its own project.

The `from` system supports Python-style ‘index’ files for packages, as well as
an analogue to Python’s `import … from` feature. `from` also features Ruby-
style ‘a file is just a package’ (which also, more importantly, could be
thought of as  ‘a package is just a file’), and quite a few concepts I haven’t
seen in any other `require()`-esque system to date.

  [api-change]: http://github.com/ry/node/blob/master/ChangeLog#L166-182 "ChangeLog for Node.js v0.1.16"
  [commonjs-thread]: http://groups.google.com/group/commonjs/browse_thread/thread/9a17690dd164281f "CommonJS mailing list thread on my original design for `acquire()`"
  [poopy]: http://github.com/elliottcable/poopy.js#readme "The poopy.js project/contract"

Usage
-----
All in all, there’s two halves to `from`. There’s the ‘dumb’ half, which
simply operates on paths you give it, and the ‘intelligent’ half, that locates
and operates on packages of its own volition.

`from` also supports modifying *how* files are handled once they *are* found,
through `import()` and `export()`. We’ll get to that later.

### `from` basics
Every `from` method works in basically the same way: A file is located, and
then it is evaluated. If, within that file, you (the package author) utilize
the `return` keyword, then the value *you* choose will be returned to the
person acquiring your code via `from`.

In other words, `from` will help users *find* your code, but it’s up to *you*
what your code gives back.

Also, `from` is fully asynchronous, in true Node spirit. Every `node` API
method returns a `process.Promise`; you’ll have to either provide a callback
to be executed when the target is acquired, or use `Promise.wait()` to force
a sync `from`.

### `from.absolute()` and `from.relative()`
The first half, the ‘dumb’ half of `from`, is very basic. It’s provided
through two APIs; the `absolute()` API and the `relative()` API. The former,
`absolute()`, works exactly as it sounds: it, given an absolute path,
evaluates the file found at that path, and hands you the result.

    from.absolute('/foo/bar/baz/qux.js').addCallback(function (qux) {
      // …
    });

The second of those two, `relative()`, bears a little more discussion. It
locates files *relative* to the file calling out to `from`, i.e. the
requesting file. Unfortunately, doing so is not all that easy; due to various
restrictions, `from.relative()` can only operate *within* `from`’s ‘world,’ so
to speak. Specifically, this means it won’t operate in a file you run with the
`node` binary, nor will it work in a file you acquired with `require()`
instead of `from.absolute()` (those two are, in fact, the same thing; the
`node` binary simply `require()`s the file at the path you give it on the
command line).

    var aQux = from.relative('baz/qux.js').wait();

To work around this, I provide `node-from` as a binary that preemptively
initializes the `from` interface, such that `from.relative()` (and, as you’ll
see later, `from.package()`) can operate as designed. Any JavaScript file run
from the command line with `node-from` will have all of the `from` APIs
immediately available for use.

    > node-from baz/qux.js

### `from.package()`
Most of `from`’s usefulness comes from its package support. Given some library
paths (usually already provided through `process.paths`, which defaults to a
system-wide `lib/node/libraries` directory, and a user-local
`~/.node_libraries` directory), it will find and acquire code distributed in a
‘library.’

    from.package('aPackage/thing').import().wait;

Unlike most package managers, there are no ‘gems’ or ‘eggs’ (I’m looking at
you, Ruby *glares*), thus greatly reducing complexity. A ‘library,’ for all
`from` cares, is simply a distributed folder of code, with a sub-folder named
‘lib’ that is full of code (specifically, full of ‘packages’). These package
libraries will generally be structured like this:

    myLibrary/
      ChangeLog
      lib/
        aPackage.js
      LICENSE
      README

`from` supports this, though it also supports more complex structures, such as
the following:

    myLibrary/
      bin/
        a_package (+x)
      ChangeLog
      lib/
        aPackage.js
        aPackage/
          something.node
          subPackage/
            subPackage.js
            bit.js
            otherBit.js
        separatePackage/
          separatePackage.js
      LICENSE
      README

There’s a lot more to be said about how `from.package()` expects libraries of
packages (and the packages themselves) to be structured, and what it supports;
you can read [`STRUCTURE.markdown`][STRUCTURE] for more information on that
topic than will be presented here.

  [STRUCTURE]: ./from/blob/Master/STRUCTURE.markdown "A detailed description of library structure for library authors"

### ’portin’
`from` supports moving objects back and forth between the compilation units of
the requesting file, and the `from`’d file. Specifically, you can ship values
*to* the target file with `export()`, and retrieve them *from* it with
`import()`.

`export()` will make values available to the scope of the file you are
acquiring. This is useful inside libraries, to make your root objects
available to subpackages.

    // Exposes `thing` from this scope as `parentThing` in the `from`’d file
    var subThing = from.relative('myThing/subThing.js')
                     .export({ 'parentThing' : myThing }).wait();

`import()` preforms the opposite task, of bringing values from the file you
are acquiring into *your* context. However, you also have to pass it a target
object into which you wish the elements to be imported, or it will use the
`GLOBAL` namespace (which is, generally, a bad thing).

    // Exposes `foo` and `bar` from `subThing.js` on `myThing`
    from.relative('myThing/subThing.js').import('foo', 'bar', myThing);

Installation
------------
Unfortunately, there’s no easy way to distribute or install packages for
Node.js at the moment. On top of that, if there *were*, it would probably be
specific to packages prepared for `require()`’s broken semantics, and thus be
incompatible with `from` *anyway*.

This means installation … is a bit of a bitch.

### Getting `from`
First off, you have to get the `from` source. If you have `git`, that’s as
easy as:

    git clone git://github.com/elliottcable/from.git elliottcable-from

If not, you have to acquire a tarball of the source, and extract it:

    > wget 'http://github.com/elliottcable/from/tarball/Master' \
        -O 'elliottcable-from-Master.tar.gz'
    > tar -x -f 'elliottcable-from-Master.tar.gz'

### Installing `from`
We want to move the `from` source such that it will be accessible to
`require()` *and* `from`… while also ensuring the `node-from` binary is in
your `$PATH`.

My preferred method is to store (or link) the `from` sourcecode in your
user-local `~/.node_libraries` folder, then link the `from.js` file itself
into that same file, and finally link `node-from` into your user-local
`~/.bin` folder (ensuring that folder is in your `$PATH`). For instance:

    > mv elliottcable-from*/ $HOME/.node_libraries/from
    > ln -s from/lib/from.js $HOME/.node_libraries/from.js
    > ln -s ../.node_libraries/from/bin/node-from $HOME/.bin/

You could just as well install `from` into the system-wide directories as a
root user, but that’s even more painful.

Hopefully, someday, we’ll have a friendly package management system to do this
for us; today is not that day.

License
-------
This project is released for public usage under the terms of the very-permissive [ISC license][] (a
modern evolution of the MIT / BSD licenses); more information is available in [COPYING][].

   [ISC license]: <http://choosealicense.com/licenses/isc/> "Information about the ISC license"
   [COPYING]: <./COPYING.text>
