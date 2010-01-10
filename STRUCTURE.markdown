Structure
=========
This file is intended to go into more detail on how one should structure
libraries and packages when developing for `from` and the `poopy.js`
ecosystem.

First we’ll discuss library structure, then package structure, and finally
file structure. Each carries its own requirements.

Library directory structure
---------------------------
A ‘library’ is a group of packages, distributed together, with common purpose,
developers, concepts, goals, documentation, or elements.

Really, how you structure your library for distribution, is up to you. The
only requirement on `from`’s part, is that you provide a `./lib/` directory
containing your packages. However, I’ll provide some extra tips, while I’m on
the topic.

### `README`
First off, you *must* have a `README`. Any project without a `README`
explaining *why your project is worth someone’s time*… is generally *not* a
project worth their time. And people know this. If that’s not enough
motivation, [GitHub][] (the primary distribution system for source code and
projects, nowadays) displays your `README`, if you have one, to visitors
interested in your project.

I generally prefer Markdown `README`s, because Markdown looks just as good in
source form as it does when parsed, such as on GitHub or within documentation
generators. This is important, because `README`s are traditionally read in a
terminal or source code editor, in a monospace font; they are *not* generally
displayed pre-parsed for the reader. GitHub is unique in that fashion.

### Library root
Generally, it’s a good idea to keep the root directory (`./`) of your library
clean, sparse even. Less distractions means more people clicking your
`README`, right? And more people clicking your `README` means more people
interested in your project, more eyes, perhaps more forks or source
contributions.

For me, it generally contains (of course) `lib/`, which is a necessary
repository of the actual source code packages of the project. Occasionally, if
your project contains *executable* files that are versioned in the repository
(as opposed to built object/binary files, which often don’t need consideration
until compile-time), then a `bin/` directory is necessary to contain those as
well. Beyond that, you need a `README` (as stated above), and possibly (if
you’re extremely anal about licensing, and don’t think somebody will notice it
and follow it if it’s in a subdirectory) a `LICENSE` file.

If I find I need to ship anything else with a project… pre-built
documentation, screenshots, code coverage and other stats… I generally store
it in a `meta/` directory, which is dedicated to project meta-data.

Package directory structure
---------------------------
The relationships between individual files in a package are a bit more
structured. Generally speaking, a ‘package’ is either a single file, or a
collection of related files in a directory. For example, a package might look
like this:

    thing/
      thing.js
      foo.js
      bar.js

In this example, `thing.js` is the ‘index’ of the package. This is similar to
the `index.html` file in a directory on the web; it is responsible for linking
the other portions of the package together.

`foo.js` could also be considered a sub-package of `thing`; in fact, if you
find that it would make sense to split portions of `foo` off into their own,
separate, files, you can simply provide them with their own directory, as a
part of the `foo` package:

    thing/
      thing.js
      foo.js
      foo/
        qux.js
        corge.js
      bar.js

However, at this point, `foo.js` is separated from the other code related to
it, so you can also move `foo.js` itself into the `foo` directory with the
other portions of related code.

    thing/
      thing.js
      foo/
        foo.js
        qux.js
        corge.js
      bar.js

`from` supports this, allowing you to keep the source code to your (sub-)
package in a single file when it’s small, and move it out into separate files
(and even its own subdirectory) when it’s larger or more complex.

Due to this, it’s generally best to start with a single file, and branch your
package into subpackages only when it’s necessary. It saves you time and
effort when starting a new project.

File structure
--------------
The files of a package themselves generally create an object of some sort, and
modify it in ways to make it useful… and finally return that object:

    // thing.js
    var thing = function () {
      // …
    };
    
    return thing;

Generally, however, you are expected to wrap the content of your files in a
self-executing anonymous function, to provide a private lexical scope for your
package’s private variables:

    // thing.js
    return (function(){
      var thing = function () {
        // …
      };
      
      return thing;
    })()

Note the `return` keyword on the second line; you still have to return *some*
value from the top scope of your file, if you want `from` to have access to
anything from your file.
