/*global module:false*/
module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    // Task configuration.
	defaults: {
		replacementUrls: {
			development: "http://127.0.0.1:1337/",
			git: "https://rawgithub.com/DadaMonad/sevianno/master/widgets/",
			ftp: "http://dbis.rwth-aachen.de/~jahns/role-widgets/sevianno/"
		}
	},
	'ftp-deploy': {
		build: {
			auth: {
				host: 'manet.informatik.rwth-aachen.de',
				port: 21,
				//authKey: 'key1'
			},
			src: './widgets',
			dest: '/home/jahns/public_html/role-widgets/sevianno',
			exclusions: []
		}
	},
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
      mainGit: {
        src: ['widgets/*.xml'],             // source files array (supports minimatch)
        dest: 'widgets/',             // destination directory or file
        replacements: [{
          from: "<%= defaults.replacementUrls.development %>",
          to: "<%= defaults.replacementUrls.git %>"
        }]      
      },
      jsGit: {
        src: ['widgets/js/*.js'],             // source files array (supports minimatch)
        dest: 'widgets/js/',             // destination directory or file
        replacements: [{
          to: "<%= defaults.replacementUrls.git %>",                   // string replacement
          from: "<%= defaults.replacementUrls.development %>"
        }]      
      },
      cssGit: {
        src: ['widgets/css/*.css'],             // source files array (supports minimatch)
        dest: 'widgets/css/',             // destination directory or file
        replacements: [{
          to: "<%= defaults.replacementUrls.git %>",                   // string replacement
          from: "<%= defaults.replacementUrls.development %>"
        }]      
      },
	  readmeGit: {
        src: ['README.md'],       // source files array (supports minimatch)
        dest: 'README.md',             // destination directory or file
        replacements: [{
          from: "<%= defaults.replacementUrls.development %>",
          to: "<%= defaults.replacementUrls.git %>"                   // string replacement
        }]      
      },
	  mainFtp: {
        src: ['widgets/*.xml'],             // source files array (supports minimatch)
        dest: 'widgets/',             // destination directory or file
        replacements: [{
          from: "<%= defaults.replacementUrls.development %>",
          to: "<%= defaults.replacementUrls.ftp %>"
        }]      
      },
      jsFtp: {
        src: ['widgets/js/*.js'],             // source files array (supports minimatch)
        dest: 'widgets/js/',             // destination directory or file
        replacements: [{
          to: "<%= defaults.replacementUrls.ftp %>",                   // string replacement
          from: "<%= defaults.replacementUrls.development %>"
        }]      
      },
      cssFtp: {
        src: ['widgets/css/*.css'],             // source files array (supports minimatch)
        dest: 'widgets/css/',             // destination directory or file
        replacements: [{
          to: "<%= defaults.replacementUrls.ftp %>",                   // string replacement
          from: "<%= defaults.replacementUrls.development %>"
        }]      
      },
	  readmeFtp: {
        src: ['README.md'],       // source files array (supports minimatch)
        dest: 'README.md',             // destination directory or file
        replacements: [{
          from: "<%= defaults.replacementUrls.development %>",
          to: "<%= defaults.replacementUrls.ftp %>"                   // string replacement
        }]      
      },
      maindev: {
        src: ['widgets/*.+(xml|md)'],             // source files array (supports minimatch)
        dest: 'widgets/',             // destination directory or file
        replacements: [{
          from: "<%= defaults.replacementUrls.git %>",                   // string replacement
          to: "<%= defaults.replacementUrls.development %>"
        },{
		  from: "<%= defaults.replacementUrls.ftp %>",                   // string replacement
          to: "<%= defaults.replacementUrls.development %>" 
		}]      
      },
      jsdev: {
        src: ['widgets/js/*.js)'],             // source files array (supports minimatch)
        dest: 'widgets/js/',             // destination directory or file
        replacements: [{
          from: "<%= defaults.replacementUrls.git %>",                   // string replacement
          to: "<%= defaults.replacementUrls.development %>"
        },{
		  from: "<%= defaults.replacementUrls.ftp %>",                   // string replacement
          to: "<%= defaults.replacementUrls.development %>" 
		}]      
      },
      cssdev: {
        src: ['widgets/css/*.css'],             // source files array (supports minimatch)
        dest: 'widgets/css/',             // destination directory or file
        replacements: [{
          from: "<%= defaults.replacementUrls.git %>",                   // string replacement
          to: "<%= defaults.replacementUrls.development %>"
        },{
		  from: "<%= defaults.replacementUrls.ftp %>",                   // string replacement
          to: "<%= defaults.replacementUrls.development %>" 
		}]      
      },
      readmedev: {
        src: ['README.md'],       // source files array (supports minimatch)
        dest: 'README.md',             // destination directory or file
        replacements: [{
          from: "<%= defaults.replacementUrls.git %>",                   // string replacement
          to: "<%= defaults.replacementUrls.development %>"
        },{
		  from: "<%= defaults.replacementUrls.ftp %>",                   // string replacement
          to: "<%= defaults.replacementUrls.development %>" 
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
  grunt.loadNpmTasks('grunt-ftp-deploy');


  // Default task.
  grunt.registerTask('replaceUrlsProduction', ['replace:mainGit', 'replace:jsGit', 'replace:cssGit', 'replace:readmeGit']);
  grunt.registerTask('replaceUrlsFtp', ['replace:mainFtp', 'replace:jsFtp', 'replace:cssFtp', 'replace:readmeFtp']);
  grunt.registerTask('replaceUrlsDevelopment', ['replace:maindev', 'replace:jsdev', 'replace:cssdev', 'replace:readmedev']);
  grunt.registerTask('servewidgets', ['connect']);
  grunt.registerTask('save-githooks', ['githooks']);
  grunt.registerTask('deploy', ['replaceUrlsFtp', 'ftp-deploy', 'replaceUrlsDevelopment'])


};
