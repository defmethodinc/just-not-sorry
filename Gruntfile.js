module.exports = function(grunt) {

  var pkg = grunt.file.readJSON('package.json');
  var mnf = grunt.file.readJSON('code/manifest.json');

  var fileMaps = { browserify: {}, uglify: {} };
  var file, files = grunt.file.expand({cwd:'code/js'}, ['*.js']);
  for (var i = 0; i < files.length; i++) {
    file = files[i];
    fileMaps.browserify['build/unpacked-dev/js/' + file] = 'code/js/' + file;
    fileMaps.uglify['build/unpacked-prod/js/' + file] = 'build/unpacked-dev/js/' + file;
  }

  //
  // config
  //

  grunt.initConfig({

    clean: ['build/unpacked-dev', 'build/unpacked-prod', 'build/*.zip'],

    mkdir: {
      unpacked: { options: { create: ['build/unpacked-dev', 'build/unpacked-prod'] } },
      js: { options: { create: ['build/unpacked-dev/js'] } }
    },

    jshint: {
      options: grunt.file.readJSON('lint-options.json'), // see http://www.jshint.com/docs/options/
      all: { src: ['package.json', 'lint-options.json', 'Gruntfile.js', 'code/**/*.js',
                   'code/**/*.json', '!code/js/libs/*'] }
    },

    copy: {
      main: { files: [ {
        expand: true,
        cwd: 'code/',
        src: ['**', '!js/**', '!**/*.md'],
        dest: 'build/unpacked-dev/'
      } ] },
      prod: { files: [ {
        expand: true,
        cwd: 'build/unpacked-dev/',
        src: ['**', '!js/*.js'],
        dest: 'build/unpacked-prod/'
      } ] },
      artifact: { files: [ {
        expand: true,
        cwd: 'build/',
        src: [pkg.name + '-' + pkg.version + '.crx'],
        dest: process.env.CIRCLE_ARTIFACTS
      } ] }
    },

    browserify: {
      build: {
        files: fileMaps.browserify,
        options: { browserifyOptions: {
          debug: true,  // for source maps
          standalone: pkg['export-symbol']
        } }
      }
    },

    exec: {
      zip: {
        cmd: './package.sh'
      }
      // crx: {
      //   cmd: [
      //     './crxmake.sh build/unpacked-prod ./mykey.pem',
      //     'mv -v ./unpacked-prod.crx build/' + pkg.name + '-' + pkg.version + '.crx'
      //   ].join(' && ')
      // }
    },

    uglify: {
      min: { files: fileMaps.uglify }
    }

  });

  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-mkdir');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-exec');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-watch');

  //
  // custom tasks
  //

  grunt.registerTask(
    'manifest', 'Extend manifest.json with extra fields from package.json',
    function() {
      var fields = ['version', 'description'];
      for (var i = 0; i < fields.length; i++) {
        var field = fields[i];
        mnf[field] = pkg[field];
      }
      grunt.file.write('build/unpacked-dev/manifest.json', JSON.stringify(mnf, null, 4) + '\n');
      grunt.log.ok('manifest.json generated');
    }
  );

  //
  // DEFAULT
  //

  grunt.registerTask('default', ['clean', 'mkdir:unpacked', 'copy:main', 'manifest',
    'mkdir:js', 'browserify', 'copy:prod', 'uglify', 'exec']);

};
