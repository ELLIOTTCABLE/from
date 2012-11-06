module.exports = (G) ->
   
   # Project configuration.
   G.initConfig
      pkg: G.file.readJSON 'package.json'
      
      concat:
         dist:
            src         : 'lib/from.js'
            dest        : 'dist/<%= pkg.name %>-<%= pkg.version %>.js'
            stripBanners:  true
         test:
            src         :['lib/<%= pkg.name %>.js', 'test/<%= pkg.name %>.test.js']
            dest        : 'test/<%= pkg.name %>.concat.js'
      
      clean:
         dist: '<%= concat.dist.dest %>'
         test: '<%= concat.test.dest %>'
      
      jshint:
         all      :['lib/**/*.js', 'test/**/*.js']
         jshintrc : '.jshintrc'
         
         options:    #  Environments
            browser  :  yes
            node     :  yes
                     #  Enforce
            eqeqeq   :  on
            forin    :  on
            noempty  :  on
            undef    :  on
            unused   :  on
                     #  Relax
            asi      :  on
            laxcomma :  on
            laxbreak :  on
            loopfunc :  on
            multistr :  on
            shadow   :  on
            supernew :  on
                     # Specific to `from`. ):
            latedef  :  off
            noarg    :  off
            strict   :  off
            es5      :  off
            esnext   :  off
            evil     :  on
            proto    :  on
            
            globals:
               'From'   :  no
               'OTHER'  :  no
      
      watch:
         jshint:
            files : '<%= jshint.all %>'
            tasks : 'jshint'
            
      
   G.loadNpmTasks 'grunt-contrib-concat'
   G.loadNpmTasks 'grunt-contrib-clean'
   G.loadNpmTasks 'grunt-contrib-jshint'
   G.loadNpmTasks 'grunt-contrib-watch'
   
   G.registerTask 'test', ->
      # FIXME: NYI
   
   # Default tasks
   G.registerTask 'default', ['concat:test']
