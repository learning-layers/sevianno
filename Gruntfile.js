/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Task configuration.
    jshint: {
      options: {
        curly: true,
        eqeqeq: true,
        immed: true,
        latedef: true,
        newcap: true,
        noarg: true,
        sub: true,
        undef: true,
        unused: true,
        boss: true,
        eqnull: true,
        browser: true,
        globals: {}
      },
      gruntfile: {
        src: 'Gruntfile.js'
      },
      lib_test: {
        src: ['widgets/**/*.js', 'test/**/*.js']
      }
    },
    githooks: {
      all: {
        // Will run the jshint and test:unit tasks at every commit
        'pre-commit': 'replaceUrlsProduction',
        'post-commit': 'replaceUrlsDevelopment'
      }
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      lib_test: {
        files: '<%= jshint.lib_test.src %>',
        tasks: ['jshint:lib_test', 'qunit']
      }
    },
    connect: {
      server: {
        options: {
          hostname: '*',
          port: 1337,
          base: 'widgets',
          keepalive: true
        }
      }
    },
    replace: {
      main: {
        src: ['widgets/*.xml'],             // source files array (supports minimatch)
        dest: 'widgets/',             // destination directory or file
        replacements: [{
          from: 'http://127.0.0.1:1337/',
          to: 'https://raw.github.com/DadaMonad/sevianno/master/widgets/'
        }]      
      },
      js: {
        src: ['widgets/js/*.js'],             // source files array (supports minimatch)
        dest: 'widgets/js/',             // destination directory or file
        replacements: [{
          to: 'https://raw.github.com/DadaMonad/sevianno/master/widgets/',                   // string replacement
          from: 'http://127.0.0.1:1337/'
        }]      
      },
      css: {
        src: ['widgets/css/*.css'],             // source files array (supports minimatch)
        dest: 'widgets/css/',             // destination directory or file
        replacements: [{
          to: 'https://raw.github.com/DadaMonad/sevianno/master/widgets/',                   // string replacement
          from: 'http://127.0.0.1:1337/'
        }]      
      },
      maindev: {
        src: ['widgets/*.+(xml|md)'],             // source files array (supports minimatch)
        dest: 'widgets/',             // destination directory or file
        replacements: [{
          from: 'https://raw.github.com/DadaMonad/sevianno/master/widgets/',                   // string replacement
          to: 'http://127.0.0.1:1337/'
        }]      
      },
      jsdev: {
        src: ['widgets/js/*.js)'],             // source files array (supports minimatch)
        dest: 'widgets/js/',             // destination directory or file
        replacements: [{
          from: 'https://raw.github.com/DadaMonad/sevianno/master/widgets/',                   // string replacement
          to: 'http://127.0.0.1:1337/'
        }]      
      },
      cssdev: {
        src: ['widgets/css/*.css'],             // source files array (supports minimatch)
        dest: 'widgets/css/',             // destination directory or file
        replacements: [{
          from: 'https://raw.github.com/DadaMonad/sevianno/master/widgets/',                   // string replacement
          to: 'http://127.0.0.1:1337/'
        }]      
      },
      readme: {
        src: ['README.md'],       // source files array (supports minimatch)
        dest: 'README.md',             // destination directory or file
        replacements: [{
          from: 'http://127.0.0.1:1337/',
          to: 'https://raw.github.com/DadaMonad/sevianno/master/widgets/'                   // string replacement
        }]      
      },
      readmedev: {
        src: ['README.md'],       // source files array (supports minimatch)
        dest: 'README.md',             // destination directory or file
        replacements: [{
          from: 'https://raw.github.com/DadaMonad/sevianno/master/widgets/',                   // string replacement
          to: 'http://127.0.0.1:1337/'
        }]      
      }
    }
  });

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-connect');
  grunt.loadNpmTasks('grunt-text-replace');
  grunt.loadNpmTasks('grunt-githooks');

  // Default task.
  grunt.registerTask('replaceUrlsProduction', ['replace:main', 'replace:js', 'replace:css', 'replace:readme']);
  grunt.registerTask('replaceUrlsDevelopment', ['replace:maindev', 'replace:jsdev', 'replace:cssdev', 'replace:readmedev']);
  grunt.registerTask('servewidgets', ['connect']);
  grunt.registerTask('save-githooks', ['githooks']);
  grunt.registerTask('default', ['githooks']);


};
