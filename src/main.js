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
var Page = require('./classes/Page');

tinymce.PluginManager.add('paginate', function(editor) {

  var paginator = new Paginator();
  var page = new Page();

  editor.on('change',function(evt){
    var doc = editor.getDoc();
    var height = $(doc).height();
    console.log(height);
  });

});
