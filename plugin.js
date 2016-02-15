(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

/* jshint node: true */

require('./src/main');

},{"./src/main":7}],2:[function(require,module,exports){
'use strict';

/**
 * Create the test DPI element
 * @function
 */
function createTestDPIElement(){
  testDPIElement = $('<div/>')
  .attr('id','dpi-test')
  .css({
    position: 'absolute',
    top: '-100%',
    left: '-100%',
    height: '1in',
    width: '1in',
    border: 'red 1px solid'
  });
  $('body').prepend(testDPIElement);
}

/**
 * @constructor
 */
function Display(_document){
  this.document = _document;
  this._setScreenDPI();
}

/**
 * @property
 * @private
 */
var testDPIElement;

/**
 * @method
 * @return the screen DPI
 */
Display.prototype._setScreenDPI = function screenDPI(){
  createTestDPIElement();

  if (testDPIElement[0].offsetWidth !== testDPIElement[0].offsetHeight)
    throw new Error('FATAL ERROR: Bad Screen DPI !');

  this.screenDPI = testDPIElement[0].offsetWidth;
};

/**
 * @method
 * @param DOMDocument _document
 * @param String unit
 *
 * @return `_document` body height in `unit` unit

 */
Display.prototype.height = function(unit){
  if (!unit) throw new Error('Explicit unit for getting document height is required');

  var pixels = $('body',this.document).height();
  
  if (unit === 'px') return pixels;
  if (unit === 'mm') return this.px2mm(pixels);
};

/**
 * Converts pixels amount to milimeters, in function of current display DPI
 *
 * Calculus rule
 * 1 dpi := pixel / inch
 * 1 in = 254 mm
 * size in mm = pixels * 254 / DPI
 *
 * @method
 * @param {Number} px   The amount of pixels to Converts
 * @return {Number}   The amount of milimeters converted
 */
Display.prototype.px2mm = function(px){
  if (!this.screenDPI)
    throw new Error('Screen DPI is not defined. Is Display object instantied ?');
  return px * 254 / this.screenDPI;
};

/**
 * Converts milimeters amount in pixels, in function of current display DPI
 *
 * Calculus rule
 * 1 dpi := pixel / inch
 * 1 in = 254 mm
 * size in px = mm * DPI / 254
 *
 * @method
 * @param {Number} mm   The amount of milimeters to converts
 * @return {Number} px  The amount of pixels converted
 */
Display.prototype.mm2px = function(mm){
  if (!this.screenDPI)
    throw new Error('Screen DPI is not defined. Is Display object instantied ?');
  return mm * this.screenDPI() / 254;
};

module.exports = Display;

},{}],3:[function(require,module,exports){
'use strict';

var supportedFormats = require('../utils/page-formats');



function BadOrientationError(){}
BadOrientationError.prototype = Error.prototype;

/**
 * @constructor
 * @param {String} formatLabel
 * @param {Sring} orientation
 * @param {Number} rank
 * @param {DOMElement} wrappedPageDiv
 */
function Page(formatLabel, orientation, rank, wrappedPageDiv){
  this._content = null;
  this.rank = null;

  this.format(formatLabel);
  this.orientate(orientation);

  if (rank !== undefined) {
    this.rank = rank;
  }

  if (wrappedPageDiv !== undefined || wrappedPageDiv !== null) {
    this.content(wrappedPageDiv);
  }
}

/**
 * Getter-setter for page content Elements
 * @method set the page's content
 * @param {DOMElement} wrappedPageDiv The content to fill the page
 * @return {HTMLCollection|void}
 */
Page.prototype.content = function(wrappedPageDiv){
  if (wrappedPageDiv === undefined) {
    return this._content;
  } else {
    console.log('wrappedPageDiv',wrappedPageDiv);
    this._content = wrappedPageDiv.children;
    console.log('page._content',this._content);
  }
};

/**
 * getter-setter of the orientation
 * @method
 * @param <string> orientation
 * @return void
 */
Page.prototype.orientate = function(orientation){
  if ( typeof(orientation) !== 'string' && !(orientation.toLowerCase() in ['portrait','paysage']) )
    throw new BadOrientationError('orientation must be `portrait` or `paysage`');

  this.orientation = orientation;

  if (orientation === 'portrait') {
    this.width = this.format.short;
    this.height = this.format.long;
  } else {
    this.width = this.format.long;
    this.height = this.format.short;
  }

};

/**
 * @method getter-setter for the page format
 * @param {String} label The format's label to set if used as setter, undefined to use it as getter
 * @return {Format | Page}
 * - the defined format for the page if used as getter,
 * - or the page instance if used as setter (to permit chaining)
 */
Page.prototype.format = function(label){
  if (label !== undefined) {
    if (!supportedFormats[label])
    throw new Error('Format '+ label +' is not supported yet.');

    this._format = supportedFormats[label];
    return this;
  }

  else return this._format;
};

module.exports = Page;

},{"../utils/page-formats":8}],4:[function(require,module,exports){
/**
 * Paginator class module
 * @module classes/Paginator
 */

'use strict';

// var _ = require('lodash');
var Display = require('./Display');
var Page = require('./Page');
var parser = require('./paginator/parser');

var errors = require('./paginator/errors'),
  InvalidPageRankError = errors.InvalidPageRankError;

/**
 * Paginator is the page manager
 * @constructor
 * @param {string} pageFormatLabel The label of the paper format for all pages. For example, 'A4'
 * @param {string} pageOrientation The label of the orientation for all pages. May be 'portait' or 'landscape'
 * @param {DOMDocument} doc The document given by editor.getDoc() of the tinymce API
 *
 * @example
 paginator = new Paginator('A4','portait', editor.getDoc());
 *
 * @see utils/page-formats
 */
function Paginator(pageFormatLabel, pageOrientation, doc){

  /**
   * @property {DOMDocument} _document The DOMDocument given in the constructor
   */
  this._document = doc;
  /**
   * @property {Display} _display The Display to manage screen and dimensions
   */
  this._display = new Display(doc);
  this._defaultPage = new Page(pageFormatLabel, pageOrientation);
  this._body = doc.getElementsByTagName('body');

}

/**
 * @property {Page} currentPage
 * @private
 */
var currentPage;

/**
 * @property {Array} pages
 * @private
 */
var pages = [];

/***************************************
 * Getters
 */

/**
 * @method getCurrentPage
 * @return {Page} the current page loaded in editor
 */
Paginator.prototype.getCurrentPage = function(){
  return currentPage;
};

/**
 * @method getPage Get the page with the given rank
 * @param {Number} rank The requested page rank
 * @return {Page} The requested page
 */
Paginator.prototype.getPage = function(rank){
  if (rank-1 < 0 || rank-1 > pages.length) throw new InvalidPageRankError(rank);
  else return pages[rank-1];
};

/**
 * @method getPages Get all pages in paginator
 * @return {Array<Page>} all paginator pages
 */
Paginator.prototype.getPages = function(){
  return pages;
};

/**
 * @method getPrevious Return the previous page
 * @return {Page} The previous page
 */
Paginator.prototype.getPrevious = function(){
  try {
    return this.getPage(currentPage.rank-1);
  } catch(err) {
    return null;
  }
};

/**
 * @method getNext Get the next page
 * @return {Page} The next page
 */
Paginator.prototype.getNext = function(){
  try {
    return this.getPage(currentPage.rank+1);
  } catch(err) {
    return null;
  }
};

/***************************************
 * Navigation
 */

/**
 * @method gotoPage Navigate to the given page
 * @param {Page} the page to navigate to
 */
Paginator.prototype.gotoPage = function(page){

  /**
   * @TODO the method must be implemented
   */

};

/**
 * @method previous Navigate to the previous page
 * @return {Page} The previous page after navigation is done
 */
Paginator.prototype.gotoPrevious = function(){
  return this.gotoPage(this.getPrevious());
};

/**
 * @method next Navigate to the next page
 * @return {Page} The next page after navigation is done
 */
Paginator.prototype.next = function(){
  return this.gotoPage(this.getNext());
};

/**
 * Watch the current page, to check if content overflows the page's max-height.
 * @todo If it overflows, put the content that overflows in the next page, else, check if
 * the text on the next page can fill the current one without overflowing.
 */
Paginator.prototype.watchPage = function(){

  console.log('body clientHeight', this._body.clientHeight,'body scrollHeight', this._body.scrollHeight);

  var padding = {
    top: $(this._body).css('padding-top'),
    right: $(this._body).css('padding-right'),
    bottom: $(this._body).css('padding-bottom'),
    left: $(this._body).css('padding-left')
  };

  console.log('padding',padding);

  // console.log('default height:', this._defaultPage.height);
  // console.log('page (Display) height (px): ', this._display.height('px') + ' px');
  // console.log('page (Display) height (mm): ', this._display.height('mm') + ' mm');
  // console.log('page content', page.content());
};

/**
 * @method init Initialize the paginator
 * @return void
 */
Paginator.prototype.init = function(){
  function findPageWrappers(){
    return $('div[data-paginator-page-rank]',that._body);
  }
  var that = this;

  // search the paginator page wrappers
  var wrappedPages = findPageWrappers();
  var wp ;

  // wrap unwrapped content
  if (!wrappedPages.length){
    $(this._body).wrapInner('<div data-paginator-page-rank="1"></div>');
    wrappedPages = findPageWrappers();
  }

  $.each(wrappedPages,function(i,el){
    pages.push(new Page(that._defaultPage.format().label, that._defaultPage.orientation, i+1, el));
  });

  // this.watchPage(firstPage);
};

/**
 * Paginator class
 */
module.exports = Paginator;

},{"./Display":2,"./Page":3,"./paginator/errors":5,"./paginator/parser":6}],5:[function(require,module,exports){
'use strict';


exports.InvalidPageRankError = (function(){
  /**
   * @constructor InvalidPageRankError Must be thrown when trying to access a page with an invalid rank
   * @param {Number} rank The invalid page rank
   */
  function InvalidPageRankError(rank){
    this.name = 'InvalidPageRankError';
    this.message = rank + ' is an invalid page rank';
    this.stack = (new Error()).stack;
  }
  InvalidPageRankError.prototype = new Error;
  return InvalidPageRankError;
})();

},{}],6:[function(require,module,exports){
'use strict';

module.exports = {};

},{}],7:[function(require,module,exports){
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

},{"./classes/Paginator":4,"./utils/ui":9}],8:[function(require,module,exports){
'use strict';

function Format(label,long,short){
  this.label = label;
  this.long = long;
  this.short = short;
}

var supportedFormats = {
  'A4': {
    long: '297',
    short: '210'
  }
};

$.each(supportedFormats,function(label,format){
  exports[label] = new Format(label, format.long, format.short);
});

},{}],9:[function(require,module,exports){
'use strict';

/**
 * @function appendNavigationButtons
 * @return void
 */
exports.appendNavigationButtons = function(){
  var body = $('body');
  var selector = '<button></button>';
  var commonClasses = 'btn btn-default btn-large glyphicon';
  var commonCss = {
    'position': 'absolute',
    'right': '25px',
    'z-index': '999'
  };
  // navigate to previous page
  $(selector)
    .css($.extend( { 'top': (window.screen.height/2)+'px', }, commonCss ))
    .addClass(commonClasses + ' glyphicon-chevron-up')
    .appendTo(body)
  ;
  // navigate to next page
  $(selector)
    .css($.extend( { 'top': (window.screen.height/2 + 30)+'px', }, commonCss ))
    .addClass(commonClasses + ' glyphicon-chevron-down')
    .appendTo(body)
  ;
};

},{}]},{},[1]);
