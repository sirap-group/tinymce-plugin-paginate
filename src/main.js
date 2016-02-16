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

    editor.once('change',function(evt){
      console.log(editor.getContent());
      console.info('content changed once');
      alert('content changed once');
      paginator.init();
    });
    editor.on('SetContent',function(evt){
      initPaginator();
    });

    // on first load, fill paginator with editor.getContent();
    // editor.once('change',function(evt){
    // });

    editor.on('change',function(evt){
      // console.info('editor change event fired');
      paginator.watchPage();
      // console.log(new Error().stack);
      // paginator.watchPage(paginator.pages[0]);
    });


  });
  editor.on('NodeChange',function(evt){
    // console.info('editor NodeChange event fired',evt);
    // console.log(new Error().stack);
    // paginator.watchPage(paginator.pages[0]);
  });

});
