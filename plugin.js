(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

/* jshint node: true */

require('./src/main');

},{"./src/main":7}],2:[function(require,module,exports){
/**
 * Display class module
 * @module class/Display
 */

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
 * 1 in = 25.4 mm
 * size in mm = pixels * 25.4 / DPI
 *
 * @method
 * @param {Number} px   The amount of pixels to Converts
 * @return {Number}   The amount of milimeters converted
 */
Display.prototype.px2mm = function(px){
  if (!this.screenDPI)
    throw new Error('Screen DPI is not defined. Is Display object instantied ?');
  return px * 25.4 / this.screenDPI;
};

/**
 * Converts milimeters amount in pixels, in function of current display DPI
 *
 * Calculus rule
 * 1 dpi := pixel / inch
 * 1 in = 25.4 mm
 * size in px = mm * DPI / 25.4
 *
 * @method
 * @param {Number} mm   The amount of milimeters to converts
 * @return {Number} px  The amount of pixels converted
 */
Display.prototype.mm2px = function(mm){
  if (!this.screenDPI)
    throw new Error('Screen DPI is not defined. Is Display object instantied ?');
  return mm * this.screenDPI / 25.4;
};

module.exports = Display;

},{}],3:[function(require,module,exports){
/**
 * Page class module
 * @module class/Page
 */

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
  var wrapper = _createEmptyDivWrapper.call(this,1);

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
 * @throws {Error}
 * @throws {InvalidPageRankError}
 */
Paginator.prototype.getPage = function(rank){
  try{
    rank = Number(rank);
  } catch(err){
    throw new InvalidPageRankError(rank);
  }
  if (!pages.length)
    throw new Error('Paginator pages length in null. Can\'t iterate on it.');

  var ret;
  var isLower = rank-1 < 0;
  var isGreater = rank-1 > pages.length;

  if (isLower || isGreater) throw new InvalidPageRankError(rank);
  else {
    $.each(pages,function(i,page){
      if (page.rank === rank) ret = page;
    });
    return ret;
  }
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
    return this.getPage(this.getCurrentPage().rank-1);
  } catch(err) {
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
  /**
   * Set cursor location to the bottom of the destination page
   * @function
   * @inner
   * @return void
   */
  function focusToBottom(){
    /**
     * Get all text nodes from a given node
     * @function
     * @inner
     * @param {Node} node The parent, given node
     * @param {number} nodeType The number matching the searched node type
     * @param {array} result The result passed for recursive iteration
     */
    function getTextNodes(node, nodeType, result){
      var children = node.childNodes;
      nodeType = nodeType ? nodeType : 3;
      result = !result ? [] : result;
      if (node.nodeType === nodeType) {
          result.push(node);
      }
      if (children) {
        for (var i=0; i<children.length; i++) {
          result = getTextNodes(children[i], nodeType, result);
        }
      }
      return result;
    }
    // get all Textnodes from lastchild, calc length
    var content, lastChild, textNodes, lastNode, locationOffset, cursorLocation;
    content = toPage.content();
    if (content.length) {
      lastChild = content[0].lastChild;
    } else {
      lastChild = content.lastChild;
    }
    if (lastChild) {
      textNodes = getTextNodes(lastChild) ;

      if (textNodes.length) {
        lastNode = textNodes[textNodes.length-1];
        locationOffset = lastNode.textContent.length;
      } else {
        lastNode = lastChild;
        locationOffset = 0;
      }
    } else {
      lastNode = content;
      locationOffset = 0;
    }
    // set Cursor to last position
    editor.selection.setCursorLocation(lastNode, locationOffset);
  }

  var that = this;
  var fromPage = currentPage;
  var fromPageContent = this.getPage(fromPage.rank).content();
  var toPageContent = this.getPage(toPage.rank).content();

  if (!toPage) throw new Error('Cant navigate to undefined page');

  if (toPage !== fromPage) {

    $(fromPageContent).hide('slide', { direction: 'up' }, 200, function(){
      $(toPageContent).show('slide', { direction: 'down' }, 200);
    });

    // Move cursor to the end of the destination page
    focusToBottom();

    // set the page as current page
    currentPage = toPage;

    editor.dom.fire(editor.getDoc(),'PageChange',{
      fromPage: fromPage,
      toPage: toPage
    });

  }

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
 * @return {Page|null} The previous page after navigation is done, null if previous page doesn'nt exist.
 */
Paginator.prototype.gotoPrevious = function(){
  var prevPage = this.getPrevious();
  if (prevPage) return this.gotoPage(prevPage);
  else return null;
};

/**
 * Navigate to the next page
 * @method
 * @return {Page|null} The next page after navigation is done, null if next page doesn'nt exist.
 */
Paginator.prototype.gotoNext = function(){
  var nextPage = this.getNext();
  if (nextPage) return this.gotoPage(nextPage);
  else return null;
};

/**
 * Watch the current page, to check if content overflows the page's max-height.
 * @method
 * @return void
 */
Paginator.prototype.watchPage = function(){
  var maxHeight = _getPageInnerHeight.call(this);
  var currentHeight = _getPageContentHeight.call(this);
  if (currentHeight > maxHeight) {
    _repage.call(this);
  }
};

/**
 * Get the currently focused page div
 * @method
 * @private
 * @return {Element} The parent div element having an attribute data-paginator
 * @throws InvalidFocusedRangeError
 */
var _getFocusedPageDiv = function(){
  var ret, selectedElement, parents;
  var currentRng = editor.selection.getRng();

  selectedElement = currentRng.startContainer;
  parents = $(selectedElement).closest('div[data-paginator="true"]');
  if (!parents.length) {
    throw new InvalidFocusedRangeError();
  } else {
    ret = parents[0];
  }

  return ret;
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
  var nextPage = this.getNext() || _createNextPage.call(this);

  switch (lastBlock.nodeName) {
    case 'DIV':
    case 'P':
      // Prepend element to page
      $(lastBlock).prependTo($(nextPage.content()));
      // Append page to document
      $(nextPage.content()).appendTo(this._body);
      // Goto nextPage
      this.gotoNext();
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
 */
var _getPageInnerHeight = function(){

  var outerHeight = Number(this._display.mm2px(this._defaultPage.height));
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
 * @method
 * @private
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
    'min-height': _getPageInnerHeight.call(that),
    'background': 'linear-gradient(#FFF0F5,#FFFACD)' // @TODO remove for production
  });
};

/**
 * Create the next page with or without a content to put in, and append it to the paginator available pages.
 * @method
 * @private
 * @param {NodeList} contentNodeList The optional node list to put in the new next page.
 * @returns {Page} The just created page
 */
var _createNextPage = function(contentNodeList){
  var newPage;
  var nextRank = (currentPage) ? (currentPage.rank+1) : 1 ;
  var divWrapper = _createEmptyDivWrapper.call(this,nextRank);
  if (contentNodeList) {
    $(contentNodeList).appendTo(divWrapper);
  }
  newPage = new Page(this._defaultPage.format().label, this._defaultPage.orientation, nextRank, divWrapper[0]);
  pages.push(newPage);
  return newPage;
};

/**
 * Paginator class
 */
module.exports = Paginator;

},{"./Display":2,"./Page":3,"./paginator/errors":5,"./paginator/parser":6}],5:[function(require,module,exports){
/**
 * Paginator errors module
 * @module classes/paginator/errors
 * @namespace Pagiantor.errors
 */
'use strict';

/**
 * Must be thrown when trying to access a page with an invalid rank
 * @class
 * @memberof  Paginator.errors
 * @extends Error
 * @param {Number} rank The invalid page rank
 */
function InvalidPageRankError(rank){
  this.name = 'InvalidPageRankError';
  this.message = rank + ' is an invalid page rank';
  this.stack = (new Error()).stack;
}
InvalidPageRankError.prototype = new Error;

/**
 * Must be thrown when the DOM range of the text cursor is out of a paginated DOM tree.
 * @class
 * @memberof  Paginator.errors
 * @extends Error
 */
function InvalidFocusedRangeError(){
  this.name = 'InvalidFocusedRangeError';
  this.message = 'The text cursor if out of any page.';
  this.stack = (new Error()).stack;
}
InvalidFocusedRangeError.prototype = new Error;


//
// export namespace
//
exports.InvalidPageRankError = InvalidPageRankError;
exports.InvalidFocusedRangeError = InvalidFocusedRangeError;

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
    !paginatorStartListening && paginator.init();
    paginatorStartListening = true;
    ui.appendNavigationButtons(paginator);
    editor.dom.bind(editor.getDoc(),'PageChange',onPageChange);
  });
  editor.once('change',function(){
    paginatorStartListening = !!paginator;
    paginatorStartListening && paginator.init();
  });
  editor.on('change',function(){
    paginatorStartListening && paginator.watchPage();
  });
  editor.on('SetContent',function(){
    // paginatorStartListening && paginator.init();
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

},{"./classes/Paginator":4,"./utils/ui":9}],8:[function(require,module,exports){
/**
 * page-formats module
 * @module utils/page-formats
 * @type array<Format>
 * @description When required, this module exports an array of formats supported by the application
 */

'use strict';

/**
 * Define a page format
 * @constructor
 * @param {string} label The format's label
 * @param {number} long The format's long dimension in milimeters
 * @param {number} short The format's short dimension in milimeters
 */
function Format(label,long,short){
  this.label = label;
  this.long = long;
  this.short = short;
}

/**
 * Register the only formats supported now by the application
 * @var supportedFormats
 * @global
 *
 * @todo this should be a plugin parameter defined in the setup function of the editor
 */
var supportedFormats = {
  'A4': {
    long: '297',
    short: '210'
  }
};

var exp = [];
$.each(supportedFormats,function(label,format){
  exp[label] = new Format(label, format.long, format.short);
});


module.exports = exp;

},{}],9:[function(require,module,exports){
/**
 * ui module provide ui functions
 * @module utils/ui
 */

'use strict';

/**
 * Append "previous page" and "next page" navigation buttons
 * @function appendNavigationButtons
 * @static
 * @param {Paginator} paginator The instancied paginator binded to the matched editor.
 * @returns void
 */
exports.appendNavigationButtons = function(paginator){

  /**
   * Validate input page rank and request a page change if input is valid
   * @callback
   * @param {Event} evt The change callback event
   * @returns void
   */
  function onInputRankChanges(evt){
    var toPage;
    var rank = evt.target.valueAsNumber;
    var actualRank = paginator.getCurrentPage().rank;
    if (rank !== actualRank) {
      try {
        toPage = paginator.getPage(rank);
        paginator.gotoPage(toPage);
      } catch (e) {
        if (e instanceof require('../classes/paginator/errors').InvalidPageRankError) {
          alert('Il n\'y a pas de page #'+rank);
          console.log($(this));
          $(this).val(actualRank);
        } else throw e;
      }
    }
  }

  var navbar;
  var navbarElements = {};

  var body = $('body');
  var btnSelector = '<a></a>';
  var btnCommonClasses = 'btn glyphicon';
  var btnCommonStyles = {'background': 'white', 'width':'100%', 'top':'0'};

  // Create a div vertical wrapper to append nav elements into
  navbar = $('<div></div>').css({
    'width': '60px',
    'position': 'absolute',
    '-moz-box-shadow': '0px 0px 10px 10px #000000',
    '-webkit-box-shadow': '0px 0px 10px 10px #000000',
    '-o-box-shadow': '0px 0px 10px 10px #000000',
    'box-shadow': '0px 0px 10px 10px #000000',
    'filter':'progid:DXImageTransform.Microsoft.Shadow(color=#000000, Direction=NaN, Strength=10)',
    '-moz-border-radius': '50%',
    '-webkit-border-radius': '50%',
    'border-radius': '50%',
    'top': (window.screen.height/2 -35)+'px',
    'right': '40px',
    'z-index': '999'
  }).appendTo(body);

  // navigate to previous page
  navbarElements.btnPrevious = $(btnSelector)
    .attr('href','javascript:void(0)')
    .css($.extend(btnCommonStyles,{
      'border-top-left-radius': '50%',
      'border-top-right-radius': '50%',
      'border-bottom-left-radius': '0',
      'border-bottom-right-radius': '0'
    }))
    .addClass(btnCommonClasses + ' glyphicon-chevron-up')
    .click(function(){ paginator.gotoPrevious(); })
    .appendTo(navbar)
  ;

  // input to show and control current page
  navbarElements.inputRank = $('<input></input>')
    .attr('type','number').attr('id','input-rank')
    .css({ 'width': '100%', 'line-height': '30px', 'text-align': 'center' })
    .change(onInputRankChanges).appendTo(navbar)
  ;

  // navigate to next page
  navbarElements.btnNext = $(btnSelector)
    .attr('href','javascript:void(0)')
    .css($.extend(btnCommonStyles,{
      'width': '100%',
      'border-top-left-radius': '0',
      'border-top-right-radius': '0',
      'border-bottom-left-radius': '50%',
      'border-bottom-right-radius': '50%'
    }))
    .addClass(btnCommonClasses + ' glyphicon-chevron-down')
    .click(function(){ paginator.gotoNext() })
    .appendTo(navbar)
  ;
};

exports.updatePageRankInput = function(rank){
  $('#input-rank').val(rank);
};

},{"../classes/paginator/errors":5}]},{},[1]);
