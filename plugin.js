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
 * @property {Element}
 * @private
 */
var testDPIElement;

/**
 * @method
 * @return the screen DPI
 */
Display.prototype._setScreenDPI = function(){
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
  return mm * this.screenDPI / 254;
};

module.exports = Display;

},{}],3:[function(require,module,exports){
'use strict';

var supportedFormats = require('../utils/page-formats');


var InvalidOrientationLabelError = (function(){
  /**
   * @constructor InvalidOrientationLabelError Must be thrown when trying to orientate a page with an invalid orientation label
   * @param {string} label The invalid orientation label
   */
  function InvalidOrientationLabelError(label){
    this.name = 'InvalidOrientationLabelError';
    this.message = label + ' is an invalid orientation label !';
    this.stack = (new Error()).stack;
  }
  InvalidOrientationLabelError.prototype = new Error;
  return InvalidOrientationLabelError;
})();

/**
 * @constructor
 * @param {String} formatLabel A supported format mabel. For example: `A4`.
 * @param {Sring} orientation An orientation in `('portrait','landscape')`.
 * @param {Number} rank The page rank `(1..n)`
 * @param {HTMLDivElement} wrappedPageDiv The `div[data-paginator]` HTMLDivElement
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
 * Getter-setter for page div content Element
 * @method
 * @param {DOMElement} The content to fill the page
 * @return {DOMElement|void} The page div Element to return in getter usage
 */
Page.prototype.content = function(wrappedPageDiv){
  if (wrappedPageDiv === undefined) {
    return this._content;
  } else {
    this._content = wrappedPageDiv;
  }
};

/**
 * Append the given node list to the page content.
 * @method
 * @param {Array}<Node> nodes The nodes to insert.
 * @returns {Page} `this` page instance.
 */
Page.prototype.append = function(nodes){
  $(nodes).appendTo(this.content());
  return this;
};

/**
 * Prepend the given node list to the page content.
 * @method
 * @param {Array}<Node> nodes The nodes to insert.
 * @returns {Page} `this` page instance.
 */
Page.prototype.prepend = function(nodes){
  $(nodes).prependTo(this.content());
  return this;
};

/**
 * getter-setter of the orientation
 * @method
 * @param <string> orientation
 * @return void
 */
Page.prototype.orientate = function(orientation){
  var inValidType = (typeof(orientation) !== 'string');
  var inValidLabel = (orientation.toLowerCase() !== 'portrait' && orientation.toLowerCase() !== 'paysage') ;

  if (inValidType || inValidLabel)
    throw new InvalidOrientationLabelError(orientation);

  this.orientation = orientation;

  if (orientation === 'portrait') {
    this.width = this.format().short;
    this.height = this.format().long;
  } else {
    this.width = this.format().long;
    this.height = this.format().short;
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
function Paginator(pageFormatLabel, pageOrientation, ed){

  editor = ed;
  /**
   * The DOMDocument given in the constructor
   * @property {DOMDocument}
   * @private
   */
  this._document = ed.getDoc();
  /**
   * The Display to manage screen and dimensions
   * @property {Display}
   * @private
   */
  this._display = new Display(this._document);
  /**
   * The default abstract page from all real pages inherits
   * @property {Page}
   * @private
   */
  this._defaultPage = new Page(pageFormatLabel, pageOrientation);
  /**
   * The body element of the full document
   * @property {Element}
   * @private
   */
  this._body = this._document.getElementsByTagName('body');

}

/**
 * The current page
 * @property {Page}
 * @private
 */
var currentPage;

/**
 * The list of pages
 * @property {Array}
 * @private
 */
var pages = [];

/**
 * Current editor
 * @property {Editor}
 * @private
 */
var editor;

/**
 * Initialize the paginator. The editor and its content has to be loaded before initialize the paginator
 * @method
 * @return void
 */
Paginator.prototype.init = function(){
  function findPageWrappers(){
    return $('div[data-paginator-page-rank]',that._body);
  }
  var that = this;

  // search the paginator page wrappers
  var wrappedPages = findPageWrappers();
  var wrapper = _createEmptyDivWrapper.call(this);

  // wrap unwrapped content
  if (!wrappedPages.length){
    $(this._body).wrapInner(wrapper);
    wrappedPages = findPageWrappers();
  }

  pages = [];
  $.each(wrappedPages,function(i,el){
    pages.push(new Page(that._defaultPage.format().label, that._defaultPage.orientation, i+1, el));
  });

};

/**
 * Get the current page
 * @method
 * @return {Page} the current page loaded in editor
 */
Paginator.prototype.getCurrentPage = function(){
  return currentPage;
};

/**
 * Get the page with the given rank
 * @method
 * @param {Number} rank The requested page rank
 * @return {Page} The requested page
 */
Paginator.prototype.getPage = function(rank){
  if (!pages.length)
    throw new Error('Paginator pages length in null. Can\'t iterate on it.');

  var isLower = rank-1 < 0;
  var isGreater = rank-1 > pages.length;

  if (isLower || isGreater) throw new InvalidPageRankError(rank);
  else return pages[rank-1];
};

/**
 * Get all pages in paginator
 * @method
 * @return {Array<Page>} all paginator pages
 */
Paginator.prototype.getPages = function(){
  return pages;
};

/**
 * Return the previous page
 * @method
 * @return {Page} The previous page
 */
Paginator.prototype.getPrevious = function(){
  try {
    console.log('this.getCurrentPage()',currentPage);
    return this.getPage(this.getCurrentPage().rank-1);
  } catch(err) {
    console.error(err.stck);
    return null;
  }
};

/**
 * Get the next page
 * @method
 * @return {Page} The next page
 */
Paginator.prototype.getNext = function(){
  try {
    return this.getPage(this.getCurrentPage().rank+1);
  } catch(err) {
    return null;
  }
};

/**
 * Navigate to the given page
 * @method
 * @param {Page} the page to navigate to
 * @return void
 */
Paginator.prototype.gotoPage = function(toPage){

  // Show the destination page
  $(toPage._content).css({ 'display': 'block' });

  // Hide all other pages
  $.each(pages,function(i, loopPage){
    if (toPage.rank !== loopPage.rank) {
      $(loopPage._content).css({ 'display': 'none' });
    }
  });

  currentPage = toPage;

};

/**
 * Go to the page having the focus
 * @method
 * @return void
 */
Paginator.prototype.gotoFocusedPage = function(){
  var focusedDiv = _getFocusedPageDiv.call(this);
  var pageRank = $(focusedDiv).attr('data-paginator-page-rank');
  var focusedPage = this.getPage(pageRank);
  currentPage = focusedPage;
  this.gotoPage(focusedPage);
};

/**
 * Navigate to the previous page
 * @method
 * @return {Page} The previous page after navigation is done
 */
Paginator.prototype.gotoPrevious = function(){
  console.info('goto previous page');
  return this.gotoPage(this.getPrevious());
};

/**
 * Navigate to the next page
 * @method
 * @return {Page} The next page after navigation is done
 */
Paginator.prototype.gotoNext = function(){
  console.info('goto next page');
  return this.gotoPage(this.getNext());
};

/**
 * Watch the current page, to check if content overflows the page's max-height.
 * @method
 * @return void
 */
Paginator.prototype.watchPage = function(){ console.info('wathing page ...');

  var maxHeight = _getPageInnerHeight.call(this);
  var currentHeight = _getPageContentHeight.call(this);

  console.log('maxHeight',maxHeight,'currentHeight',currentHeight);

  if (currentHeight > maxHeight) {
    console.info('Dépassement de page !');
    _repage.call(this);
  }

};

/**
 * Get the currently focused page div
 * @method
 * @private
 * @return {Element} The parent div element having an attribute data-paginator
 */
var _getFocusedPageDiv = function(){
  var selectedElement = editor.selection.getRng().startContainer;
  var parents = editor.dom.getParents(selectedElement,'div',editor.getDoc().body);
  var ret;
  $.each(parents,function(i,parent){
    if ($(parent).attr('data-paginator')) {
      ret = parent;
    }
  });
  if (!ret) throw new Error('No parent page found ! You are out of a page.');
  else return ret;
};

/**
 * Move the overflowing content from the current page, to the next page.
 * Must be called when the page's content overflows.
 * @method
 * @private
 * @return void
 *
 * @todo If it overflows, put the content that overflows in the next page, then, check if
 * the text on the next page can fill the current one without overflowing.
 */
var _repage = function(){ console.info('repaging...');
  var currentRng = editor.selection.getRng();
  var children = $(currentPage.content()).children();
  var lastBlock = children[children.length - 1];

  console.log(lastBlock); //TODO remove for production

  var nextPage = this.getNext() || _createNextPage.call(this);

  switch (lastBlock.nodeName) {
    case 'DIV':
    case 'P':
      //TODO cloner le block dans divClone
      //  - vider divClone
      //  - déplacer le dernier block du div original dans le nouveau div
      $(lastBlock).prependTo($(nextPage.content()))
    break;

    default:
      alert('Une erreur est survenue dans le plugin de pagination. Merci de visionner l\'erreur dans la console et de déclarer cette erreur au support «support@sirap.fr»');
      throw new Error('Unsupported block type for repaging: '+lastBlock.nodeName);

  }

};

/**
 * Get the current computed padding
 * @method
 * @private
 * @return {object}
 */
var _getDocPadding = function(){
  var that = this;
  return {
    top: $(that._body).css('padding-top'),
    right: $(that._body).css('padding-right'),
    bottom: $(that._body).css('padding-bottom'),
    left: $(that._body).css('padding-left')
  };
};

/**
 * Compute the page inner height in pixels. It must maches the height of the `div[data-paginator]` block.
 * @method
 * @private
 * @return {Number} The resulted height in pixels.
 *
 * @todo Understand why the dirtyfix of the bug in border-bottom pdf rendering.
 */
var _getPageInnerHeight = function(){

  var outerHeight = Number(this._display.mm2px(this._defaultPage.height)*10); // @TODO (*10) is a bug fix
  var docPadding = _getDocPadding.call(this);
  var paddingTop = Number(docPadding.top.split('px').join(''));
  var paddingBottom = Number(docPadding.bottom.split('px').join(''));

  var innerHeight = outerHeight - paddingTop - paddingBottom;

  return Math.ceil(innerHeight-1); // -1 is the dirty fix mentionned in the todo tag
};

/**
 * Compute the real height of the page's content. It must equals the page inner height, except the time where the content overflows it, juste before to be repaged by the `Paginator::_repage()` method that bring back the content height to the page inner one.
 * @method
 * @private
 * @return {Number} The resulted height in pixels.
 */
var _getPageContentHeight = function(){
  return Number($(currentPage.content()).css('height').split('px').join(''));
};

/**
 * Create an empty HTML div element to wrap the futur content to fill a new page.
 * @param {number} pageRank The page rank to put in the attribute `data-paginator-page-rank`.
 * @returns {HTMLDivElement} The ready to fill div element.
 *
 * @todo Replace inline CSS style rules by adding an inner page CSS class. This CSS class has to be created and versionned carefully.
 */
var _createEmptyDivWrapper = function(pageRank){
  var that = this;
  return $('<div>').attr({
    'data-paginator': true,
    'data-paginator-page-rank': pageRank
  }).css({
    'page-break-after': 'always',
    'height': _getPageInnerHeight.call(that),
    'background': 'linear-gradient(#FFF0F5,#FFFACD)' // @TODO remove for production
  });
};

/**
 * Create the next page with or without a content to put in, and append it to the paginator available pages.
 * @method
 * @private
 * @param {NodeList} contentNodeList The optional node list to put in the new next page.
 * @returns {Page} The just created page
 *
 * @todo finish to implement the method.
 */
var _createNextPage = function(contentNodeList){
  var newPage;
  var nextRank = (currentPage) ? (currentPage.rank+1) : 1 ;
  var divWrapper = _createEmptyDivWrapper.call(this,nextRank);
  if (contentNodeList) {
    $(contentNodeList).appendTo(divWrapper);
  }
  newPage = new Page(_defaultPage.format().label, _defaultPage.orientation, nextRank, divWrapper);
  pages.push(newPage);

  return newPage;
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
exports.appendNavigationButtons = function(paginator){
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
    .click(function(){
      paginator.gotoPrevious();
    })
  ;
  // navigate to next page
  $(selector)
    .css($.extend( { 'top': (window.screen.height/2 + 35)+'px', }, commonCss ))
    .addClass(commonClasses + ' glyphicon-chevron-down')
    .appendTo(body)
    .click(function(){
      paginator.gotoNext()
    })
  ;
};

},{}]},{},[1]);
