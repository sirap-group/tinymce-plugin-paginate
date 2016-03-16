var inquirer = require('inquirer');
var cli = require('commander');
var exec = require('child_process').exec;
var q = require('q');

/**
 * Deferize a function running exec(), resloving and logging stdout on success, and rejecting and logging stderr on fails.
 * @function
 * @inner
 * @param {string} The command to pass to exec().
 * @returns {function} the deferized function.
 */
function deferizeExec(cmd){
  /**
   * The deferized function.
   * @function
   * @inner
   * @returns {Promise} the promise of the exec() call.
   */
  return function deferizedExec(){
    var d = q.defer();
    exec(cmd,function(err,stdout,stderr){
      if (err) {
        console.error(stderr);
        d.reject();
      } else {
        console.log(stdout);
        d.resolve();
      }
    });
    return d.promise;
  };
}

function confirmPrompt(){
  var d = q.defer();
  if (cli.continue) {
    d.resolve(true);
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

var gitCheckoutMaster = deferizeExec('git checkout master');
var gitPullUpstream = deferizeExec('git pull gh-sirap-group master');
var gruntBuild = deferizeExec('grunt build');
var gruntBump = function(level){ return deferizeExec('grunt bump:'+level); };
var gitPushRemote = function(remote){ return deferizeExec('git push '+remote+' master'); };
var gitPushTags = function(remote){ return deferizeExec('git push --tags '+remote); };
var gitStash = deferizeExec('git stash');
var gruntAddBuildedFiles = deferizeExec('git add . --all');
var gruntCommitBuild = function(semverLevel){ return deferizeExec('git commit -m "build dist and docs to release '+semverLevel+'"'); };


cli.option('-c --continue', 'Do not prompt for confirmation');

cli.arguments('<semverLevel>').action(function(semverLevel){

  console.log('Prepare to release a new tag...');

  confirmPrompt() // if -c or --continue is not defined in the command line.
  .then(function(confirmation){
    if (confirmation) {
      return gitStash()
      .then(gitCheckoutMaster)
      .then(gitPullUpstream)
      .then(gruntBuild(semverLevel))
      .then(gruntAddBuildedFiles)
      .then(gruntCommitBuild)
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
