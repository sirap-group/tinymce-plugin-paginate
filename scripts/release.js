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
  return
  /**
   * The deferized function.
   * @function
   * @inner
   * @returns {Promise} the promise of the exec() call.
   */
  function deferizedExec(){
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
  }
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

var gitCheckoutMaster = deferizedExec('git checkout master');
var gitPullUpstream = deferizedExec('git pull gh-sirap-group master');
var gruntBuild = deferizedExec('grunt build');
var gruntBump = function(level){ return deferizedExec('grunt bump:'+level); };
var gitPushRemote = function(remote){ return deferizedExec('git push '+remote+' master'); };
var gitPushTags = function(remote){ return deferizedExec('git push --tags '+remote); };
var gitStash = deferizedExec('git stash');


cli.option('-c --continue', 'Do not prompt for confirmation');

cli.arguments('<semverLevel>').action(function(semverLevel){

  console.log('Prepare to release a new tag...');

  confirmPrompt() // if -c or --continue is not defined in the command line.
  .then(function(confirmation){
    if (confirmation) {
      return gitCheckoutMaster()
      .then(gitPullUpstream)
      .then(gruntBuild)
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
