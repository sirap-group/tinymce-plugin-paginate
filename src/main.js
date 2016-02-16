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

/*global tinymce:true */

var Paginator = require('./classes/Paginator');
var ui = require('./utils/ui');

tinymce.PluginManager.add('paginate', function(editor) {

  function initPaginator(){
    if (!paginator) {
      paginator = new Paginator('A4','portrait', editor);
      // Create and display pages navigation buttons
      ui.appendNavigationButtons(paginator);
    }
    paginator.init();
  }

  var display;
  var paginator;


  editor.once('change',function(evt){
    // Instantiate the paginator
    initPaginator();
  });
  editor.on('init',function(evt){
    // Instantiate the paginator
    initPaginator();

    editor.on('SetContent',function(evt){
      initPaginator();
    });

    editor.on('NodeChange',function(evt){
      try {
        paginator.gotoFocusedPage();
      } catch (e) {
        console.info('cant go to focused page now');
        console.error(e);
        console.error(e.stack);
      }
    });

    editor.on('change',function(evt){
      paginator.watchPage();
    });

  });

});
