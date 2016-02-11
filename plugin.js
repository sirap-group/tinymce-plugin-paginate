(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
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

var Paginator = require('./src/classes/Paginator');
var Page = require('./src/classes/Pages');

tinymce.PluginManager.add('paginate', function(editor) {

  var paginator = new Paginator();
  var page = new Page();

  editor.on('change',function(evt){
    var doc = editor.getDoc();
    var height = $(doc).height();
    console.log(height);
  });

});

},{"./src/classes/Pages":2,"./src/classes/Paginator":3}],2:[function(require,module,exports){
'use strict';

function Page(){}

module.exports = Page;

},{}],3:[function(require,module,exports){
'use strict';

// var _ = require('lodash');

function Paginator(){}


module.exports = Paginator;

},{}]},{},[1]);
