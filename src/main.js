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


/*global tinymce:true */

var Paginator = require('./classes/Paginator');
var ui = require('./utils/ui');

tinymce.PluginManager.add('paginate', function(editor) {

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
    });
    editor.on('change',function(evt){
      myevents.push({'change':evt});
      mycount.change ++;
      console.log(myevents,mycount);
    });
    editor.on('NodeChange',function(evt){
      myevents.push({'NodeChange':evt});
      mycount.nodechange ++;
      console.log(myevents,mycount);
    });
    editor.on('SetContent',function(evt){
      myevents.push({'SetContent':evt});
      mycount.setcontent ++;
      console.log(myevents,mycount);
    });

    window.logEvents = myevents;
    window.logCount = mycount;
  }

  function onPageChange(evt){
    ui.updatePageRankInput(evt.toPage.rank);
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
   * @private
   */
  var display;

  /**
   * Is set to true when paginator is initialized.
   * @var {Boolean} paginatorStartListening
   * @private
   */
  var paginatorStartListening = false;

  editor.once('init',function(){
    paginator = new Paginator('A4','portrait', editor);
    if(!paginatorStartListening) paginator.init();
    paginatorStartListening = true;
    ui.appendNavigationButtons(paginator);
    editor.dom.bind(editor.getDoc(),'PageChange',onPageChange);
  });
  editor.once('change',function(){
    paginatorStartListening = !!paginator;
    if(paginatorStartListening) paginator.init();
  });
  editor.on('change',function(){
    if(paginatorStartListening) paginator.watchPage();
  });
  editor.on('SetContent',function(){
    //if(paginatorStartListening) paginator.init();
  });
  editor.on('NodeChange',function(){
    if (paginatorStartListening) {
      try {
        paginator.gotoFocusedPage();
      } catch (e) {
        console.info('Can\'t go to focused page now.');
        console.error(e.stack);
      }
    }
  });

});
