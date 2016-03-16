var inquirer = require('inquirer');
var cli = require('commander');
var exec = require('child_process').exec;
var q = require('q');

function confirmPrompt(){
  var d = q.defer();
  if (cli.continue) {
    d.resolve();
  } else {
    try {
      inquirer.prompt({
        name: 'confirmRelease',
        type: 'confirm',
        message: 'Did you made a pull request of your last commits to upstream before building a new release ?',
        'default': false
      },function(confirmation){
        d.resolve(confirmation.confirmRelease);
      });
    } catch(err){
      d.reject(err);
    }
  }
  return d.promise;
}

function gitCheckoutMaster(){
  var d = q.defer();
  exec('git checkout master',function(err){
    if (err) {
      d.reject(err);
    } else {
      d.resolve();
    }
  });
  return d.promise;
}

function gitPullUpstream(){
  var d = q.defer();
  exec('git pull gh-sirap-group master',function(err){
    if (err) {
      d.reject(err);
    } else {
      d.resolve();
    }
  });
  return d.promise;
}

function gruntBump(level){
  return function(){
    var d = q.defer();
    exec('grunt bump:'+level, function(err){
      if (err) {
        d.reject(err);
      } else {
        d.resolve();
      }
    });
    return d.promise;
  }
}

function gitPushRemote(remote){
  return function(){
    var d = q.defer();
    exec('git push '+remote+' master', function(err){
      if (err) {
        d.reject(err);
      } else {
        d.resolve();
      }
    });
    return d.promise;
  };
}

function gitPushTags(remote){
  return function(){
    var d = q.defer();
    exec('git push --tags '+remote, function(err){
      if (err) {
        d.reject(err);
      } else {
        d.resolve();
      }
    });
    return d.promise;
  };
}

cli.option('-c --continue', 'Do not prompt for confirmation');

cli.arguments('<semverLevel>').action(function(semverLevel){

  console.log('Prepare to release a new tag...');

  confirmPrompt() // if -c or --continue is not defined in the command line.
  .then(function(confirmation){
    if (confirmation) {
      return gitCheckoutMaster()
      .then(gitPullUpstream)
      .then(gruntBump(semverLevel))
      .then(gitPushRemote('origin'))
      .then(gitPushRemote('gl-open-source'));
    } else {
      console.log('Aborted by user');
    }
  }).catch(function(err){
    console.error('Error');
    console.error(err);
  });


}).parse(process.argv);
