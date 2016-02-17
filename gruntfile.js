var shell = require("shelljs");

module.exports = function (grunt) {
    require('load-grunt-tasks')(grunt);

    grunt.initConfig({
      jshint: {
        all: [ 'gruntfile.js', 'index.js' ]
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
          pushTo: 'origin',
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
    grunt.registerTask('default', ['browserify','jshint','uglify','jsdoc']);
};
