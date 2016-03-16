var shell = require("shelljs");

module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
      jshint: {
        gruntfile: ['gruntfile.js'],
        scripts: ['scripts/**/*.js'],
        js: {
          options: {
            node: true,
            browser: true,
            browserify: true,
            globals: {
              '$': true,
              'jQuery': true,
              'tinymce': true
            }
          },
          files: {
            src: ['src/**/*.js']
          }
        }
      },
      browserify: {
        dist: {
          src: 'index.js',
          dest: 'plugin.js'
        }
      },
      uglify: {
        dist: {
          files: {
            'plugin.min.js': ['plugin.js']
          }
        }
      },
      watch: {
        gruntfile: {
          files: 'Gruntfile.js',
          tasks: ['jshint:gruntfile'],
        },
        js: {
          files: ['src/**/*.js'],
          tasks: ['jshint:js','browserify','watch'],
        }
      },
      bump: {
        options: {
          files: ['package.json','bower.json'],
          updateConfigs: [],
          commit: true,
          commitMessage: 'Release v%VERSION%',
          commitFiles: ['package.json','bower.json'],
          createTag: true,
          tagName: 'v%VERSION%',
          tagMessage: 'Version %VERSION%',
          push: true,
          pushTo: 'gh-sirap-group',
          gitDescribeOptions: '--tags --always --abbrev=1 --dirty=-d',
          globalReplace: false,
          prereleaseName: false,
          regExp: false
        }
      },
    });

    grunt.registerTask('jsdoc', function(){
      shell.exec('npm run jsdoc');
    });

    grunt.registerTask('build', ['jshint', 'browserify', 'uglify', 'jsdoc']);

    grunt.registerTask('dev', ['jshint', 'browserify', 'watch']);

    grunt.registerTask('default', ['dev']);
};
