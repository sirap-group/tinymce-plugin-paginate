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

  var display;
  var paginator;

  // Create and display pages navigation buttons
  ui.appendNavigationButtons();

  editor.on('init',function(evt){
    // Instantiate the paginator
    paginator = new Paginator('A4','portait', editor.getDoc());

    editor.once('change',function(evt){
      console.log(editor.getContent());
      console.info('content changed once');
      alert('content changed once');
      paginator.init();
    });
    editor.on('SetContent',function(evt){
      if (evt.content) {
        paginator.init();
      }
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
