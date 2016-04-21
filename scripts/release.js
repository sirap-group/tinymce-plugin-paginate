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
    console.log('>>> Running command «'+cmd+'» ...');
    var d = q.defer();
    exec(cmd,function(err,stdout,stderr){
      if (err) {
        console.error(stderr);
        console.log('... FAIL ! <<<');
        d.reject(err);
      } else {
        console.log(stdout);
        console.log('... SUCCES ! <<<');
        d.resolve();
      }
    });
    return d.promise;
  };
}

function confirmPrompt(msg){
  var d = q.defer();
  if (cli.continue) {
    d.resolve(true);
  } else {
    try {
      inquirer.prompt({
        name: 'confirmRelease',
        type: 'confirm',
        message: msg,
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

cli.option('-c --continue', 'Do not prompt for confirmation');

cli.arguments('<semverLevel>').action(function(semverLevel){

  console.log('Prepare to release a new tag...');

  var confirmPromptMessage = 'Did you made a pull request of your last commits to upstream before building a new release ?';

  confirmPrompt(confirmPromptMessage) // if -c or --continue is not defined in the command line.
  .then(function(confirmation){
    if (confirmation) {
      return deferizeExec('git stash')()
        .then(deferizeExec('git checkout master'))
        .then(deferizeExec('git pull gh-sirap-group master'))
        .then(deferizeExec('grunt build'))
        .then(deferizeExec('git add . --all'))
        .then((function(level){
          return deferizeExec('git commit -m "build dist and docs to release '+level+'"')()
          .catch(function(err){
            // if there is nothing to commit, the child_process will end with error code at 1
            // but we want to continue, its not really an error, but a warning.
            // We will ask to confirm for continuing.
            confirmPromptMessage = 'WARNING: It seems there is nothing to commit. Do you want to continue ?';
            return confirmPrompt(confirmPromptMessage);
          })
          .then(function(confirmation){
            if (!confirmation) throw new Error('Aborted by user because there is nothing to commit for this release.');
            else return true;
          });
        })(semverLevel))
        .then((function(level){
          return deferizeExec('grunt bump:'+level)();
        })(semverLevel))
        .then(deferizeExec('git push origin master'))
        .then(deferizeExec('git push gl-open-source master'))
        .then(deferizeExec('git push origin --tags'))
        .then(deferizeExec('git push gl-open-source --tags'))
        .then(deferizeExec('git push gh-sirap-group --tags'))
      ;
    } else {
      console.log('Aborted by user');
    }
  }).catch(function(err){
    console.error('Error');
    console.error(err);
    console.error(err.stack);
  });


}).parse(process.argv);
