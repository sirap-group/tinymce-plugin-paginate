'use strict';

/**
 * plugin.js
 *
 * Released under LGPL License.
 * Copyright (c) 2015 SIRAP SAS All rights reserved
 *
 * License: http://www.tinymce.com/license
 * Contributing: http://www.tinymce.com/contributing
 */

/**
 * plugin.js Tinymce plugin paginate
 * @file plugin.js
 * @module
 * @name tinycmce-plugin-paginate
 * @description Plugin for tinymce wysiwyg HTML editor that provide pagination in the editor.
 * @link https://github.com/sirap-group/tinymce-plugin-paginate
 * @author Rémi Becheras
 * @author Groupe SIRAP
 * @license GNU GPL-v2 http://www.tinymce.com/license
 * @listens tinymce.editor~event:init
 * @listens tinymce.editor~event:change
 * @listens tinymce.editor~event:SetContent
 * @listens tinymce.editor~event:NodeChange
 * @listens tinymce.editor.document~event:PageChange
 * @version 1.0.0
 */


/**
 * Tinymce library - injected by the plugin loader.
 * @external tinymce
 * @see {@link https://www.tinymce.com/docs/api/class/tinymce/|Tinymce API Reference}
 */
/*global tinymce:true */

/**
 * The jQuery plugin namespace - plugin dependency.
 * @external "jQuery.fn"
 * @see {@link http://learn.jquery.com/plugins/|jQuery Plugins}
 */
/*global jquery:true */

/**
 * Paginator class
 * @type {Paginator}
 * @global
 */
var Paginator = require('./classes/Paginator');

/**
 * Paginator ui module
 * @type {object}
 * @global
 */
var ui = require('./utils/ui');

/**
 * InvalidPageHeightError
 * @type {InvalidPageHeightError}
 * @global
 */
var InvalidPageHeightError = Paginator.errors.InvalidPageHeightError;

/**
 * Tinymce plugin paginate
 * @function
 * @global
 * @param {tinymce.Editor} editor - The injected tinymce editor.
 * @returns void
 */
function tinymcePluginPaginate(editor) {

  /**
   * Debug all useful editor events to see the order of their happen
   * @function
   * @private
   */
  function _debugEditorEvents(){
    var myevents = [];
    var mycount = {
      init: 0,
      change: 0,
      nodechange: 0,
      setcontent: 0
    };

    editor.on('init',function(evt){
      console.log(editor);
      myevents.push({'init':evt});
      mycount.init ++;
      console.log(myevents,mycount);
      // alert('pause after "init" event');
    });
    editor.on('change',function(evt){
      myevents.push({'change':evt});
      mycount.change ++;
      console.log(myevents,mycount);
      // alert('pause after "change" event');
    });
    editor.on('NodeChange',function(evt){
      myevents.push({'NodeChange':evt});
      mycount.nodechange ++;
      console.log(myevents,mycount);
      // alert('pause after "NodeChange" event');
    });
    editor.on('SetContent',function(evt){
      myevents.push({'SetContent':evt});
      mycount.setcontent ++;
      console.log(myevents,mycount);
      // alert('pause after "SetContent" event');
    });

    window.logEvents = myevents;
    window.logCount = mycount;
  }

  /**
   * On 'PageChange' event listener. Update page rank input on paginator's navigation buttons.
   * @function
   * @private
   */
  function onPageChange(evt){
    ui.updatePageRankInput(evt.toPage.rank);
  }

  /**
   * Wrap Paginator#watchPage() in try catch statements and private function to allow watch recursively on error
   * @function
   * @private
   * @returns void
   * @throws {Error} if error thrown is not instance of InvalidPageHeightError
   */
  function watchPage(){
    try {
      paginator.watchPage();
    } catch (e) {
      watchPageIterationsCount++;
      // Due to a suspecte bug in tinymce that break the binding of DOM elements with the paginator.
      if (e instanceof InvalidPageHeightError) {
        console.error(e.message+'... re-init paginator then watch page again...');
        paginator.init();
        if (watchPageIterationsCount<10) {
          watchPage();
        } else {
          watchPageIterationsCount = 0;
        }
      } else throw e;
    }
  }

  /**
  * A 'Paginator' object to handle all paginating behaviors.
  * @var {Paginator} paginator
  * @global
  */
  var paginator;

  /**
   * A 'Display' object to handle graphics behaviors for the paginator needs.
   * @var {Display} display
   * @global
   */
  var display;

  /**
   * Is set to true when paginator is initialized.
   * @var {Boolean} paginatorListens
   * @global
   */
  var paginatorListens = false;

  /**
   * Count of the iterations of watchPage() calls triggered by thrown of `InvalidPageHeightError`. This is a temporary bugfix
   * @var {integer}
   * @global
   */
  var watchPageIterationsCount=0;

  editor.once('init',function(){
    paginator = new Paginator('A4','portrait', editor);
    if(!paginatorListens) paginator.init();
    paginatorListens = true;
    ui.appendNavigationButtons(paginator);
    editor.dom.bind(editor.getDoc(),'PageChange',onPageChange);
  });
  editor.on('remove',ui.removeNavigationButtons);
  editor.once('change',function(){
    paginatorListens = !!paginator;
    if(paginatorListens) paginator.init();
  });
  editor.on('change',function(){
    if(paginatorListens) paginator.watchPage();
  });
  editor.on('SetContent',function(){
    //if(paginatorStartListening) paginator.init();
  });
  editor.on('NodeChange',function(){
    if (paginatorListens) {
      try {
        paginator.gotoFocusedPage();
      } catch (e) {
        console.info('Can\'t go to focused page now.');
        console.error(e.stack);
      }
    }
  });

}

// Add the plugin to the tinymce PluginManager
tinymce.PluginManager.add('paginate', tinymcePluginPaginate);
