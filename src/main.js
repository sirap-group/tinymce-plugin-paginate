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
var ui = require('.utils/ui');
// var Page = require('./classes/Page');

tinymce.PluginManager.add('paginate', function(editor) {

  var display;
  var paginator;

  // Create and display pages navigation buttons
  ui.appendNavigationButtons();


  editor.on('init',function(evt){

    // console.log('editor.getWin()',editor.getWin().frameElement);

    paginator = new Paginator('A4','portait', editor.getDoc());

    // on first load, fill paginator with editor.getContent();
    // editor.once('change',function(evt){
    // });
    editor.on('change',function(evt){
      // console.log(new Error().stack);
      // console.log('change');
      paginator.fill(editor.getContent());
      // paginator.watchPage(paginator.pages[0]);
    });
  });



  editor.on('SetContent',function(evt,a){
    // console.log('setcontent',evt,a);
  });


});
