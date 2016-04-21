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
 * @constructor
 */
function Display(_document){
  /**
  * @property {Element}
  */
  this._testDPIElement = null;
  this.document = _document;
  this._setScreenDPI();
}

/**
 * Create the test DPI element
 * @method
 * @private
 */
var _createTestDPIElement = function(){
  this._testDPIElement = $('<div/>')
  .attr('id','dpi-test')
  .css({
    position: 'absolute',
    top: '-100%',
    left: '-100%',
    height: '1in',
    width: '1in',
    border: 'red 1px solid'
  });
  $('body').prepend(this._testDPIElement);
};

/**
 * @method
 * @return the screen DPI
 */
Display.prototype._setScreenDPI = function(){
  _createTestDPIElement.call(this);

  if (this._testDPIElement[0].offsetWidth !== this._testDPIElement[0].offsetHeight)
    throw new Error('FATAL ERROR: Bad Screen DPI !');

  this.screenDPI = this._testDPIElement[0].offsetWidth;
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
   * Must be thrown when trying to orientate a page with an invalid orientation label
   * @constructor
   * @param {string} label The invalid orientation label
   */
  function InvalidOrientationLabelError(label){
    this.name = 'InvalidOrientationLabelError';
    this.message = label + ' is an invalid orientation label !';
    this.stack = (new Error()).stack;
  }
  InvalidOrientationLabelError.prototype = Error.prototype;
  InvalidOrientationLabelError.prototype.name = 'InvalidOrientationLabelError';
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

/**
 * Compute the real height of the page's content. It must equals the page inner height, except the time where the content overflows it, juste before to be repaged by the `Paginator::_repage()` method that bring back the content height to the page inner one.
 * @method
 * @returns {Number} The resulted height in pixels.
 */
Page.prototype.getContentHeight = function() {
  var contentHeight = $(this.content()).css('height');
  var inPixels = contentHeight.split('px').join('');
  return Number(inPixels);
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

var errors = require('./paginator/errors');
var InvalidPageRankError = errors.InvalidPageRankError;
var InvalidFocusedRangeError = errors.InvalidFocusedRangeError;
var InvalidPageHeightError = errors.InvalidPageHeightError;
var InvalidCursorPosition = errors.InvalidCursorPosition;


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

  /**
   * The current page
   * @property {Page}
   */
  this._currentPage = null;

  /**
   * The list of pages
   * @property {Array}
   */
  this._pages = [];

  /**
   * Current editor
   * @property {Editor}
   */
  this._editor = ed;

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

Paginator.prototype.destroy = function(){
  this._pages = null;
  this._currentPage = null;
  this._editor = null;
  this._document = null;
  this._display = null;
  this._defaultPage = null;
  this._body = null;
};

/**
 * Set of the two constant values representing the `origin` or the `end` of possible ranges to focus when focusing/navigating to a page.
 * @type {object}
 * @property {string} ORIGIN equals 'ORIGIN'
 * @property {string} END equals 'END'
 */
Paginator.prototype.CURSOR_POSITION = { ORIGIN:'ORIGIN', END: 'END' };

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
    this._editor.save();
    wrappedPages = findPageWrappers();
  }

  this._pages = [];
  $.each(wrappedPages,function(i,el){
    that._pages.push(new Page(that._defaultPage.format().label, that._defaultPage.orientation, i+1, el));
  });

};

/**
 * Get the current page
 * @method
 * @return {Page} the current page loaded in editor
 */
Paginator.prototype.getCurrentPage = function(){
  return this._currentPage;
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
  if (!this._pages.length)
    throw new Error('Paginator pages length in null. Can\'t iterate on it.');

  var ret;
  var isLower = rank-1 < 0;
  var isGreater = rank-1 > this._pages.length;

  if (isLower || isGreater) throw new InvalidPageRankError(rank);
  else {
    $.each(this._pages,function(i,page){
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
  return this._pages;
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
 * @param {Page} toPage - The page to navigate to
 * @param {string} [cursorPosition] - The requested cursor  position to set after navigating to
 * @return void
 */
Paginator.prototype.gotoPage = function(toPage,cursorPosition){

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
    var content, lastChild, textNodes, lastNode, locationOffset;
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
    that._editor.selection.setCursorLocation(lastNode, locationOffset);
  }

  /**
   * Set cursor location to the bottom of the destination page
   * @function
   * @inner
   * @return void
   */
  function focusToTop(){
    var content, firstNode;
    content = toPage.content();
    firstNode = content.firstChild;
    // set Cursor to last position
    that._editor.selection.setCursorLocation(firstNode, 0);
  }

  function focusToNode(node){
    that._editor.selection.setCursorLocation(node,0);
  }

  var that = this;
  var toPageContent = this.getPage(toPage.rank).content();
  var fromPage = this._currentPage;
  var fromPageContent;
  if (fromPage) {
    fromPageContent = this.getPage(fromPage.rank).content();
  }

  if (!toPage) throw new Error('Cant navigate to undefined page');

  if (toPage !== fromPage) {

    $.each(this.getPages(),function(i,page){
      if (page.rank === toPage.rank) {
        $(toPageContent).css({ display:'block' });
      } else if (fromPage && page.rank === fromPage.rank) {
        $(fromPageContent).css({ display:'none' });
      } else {
        $(that.getPage(page.rank).content()).css({ display:'none' });
      }
    });

    // cursorPosition may be a DOM Element, `ORIGIN`, `END` or undefined
    if (typeof(cursorPosition) === 'object'){
      console.info('focus to node',cursorPosition);
      focusToNode(cursorPosition);
    } else if (cursorPosition === this.CURSOR_POSITION.ORIGIN){
      console.info('focus to top');
      focusToTop();
    } else if (cursorPosition === this.CURSOR_POSITION.END) {
      console.info('focus to bottom');
      focusToBottom();
    } else if (cursorPosition !== undefined){
      console.error('InvalidCursorPosition');
      throw new InvalidCursorPosition(cursorPosition);
    } else {
      console.error('no valid cursor position');
      console.log(cursorPosition);
    }

    this._editor.focus();

    // set the page as current page
    this._currentPage = toPage;

    this._editor.dom.fire(this._editor.getDoc(),'PageChange',{
      fromPage: fromPage,
      toPage: toPage,
      timestamp: new Date().getTime()
    });

  }

};

/**
 * Go to the page having the focus
 * @method
 * @return void
 */
Paginator.prototype.gotoFocusedPage = function(){
  var focusedPage, focusedDiv;

  try {
    var pageRank;
    focusedDiv = _getFocusedPageDiv.call(this);
    pageRank = $(focusedDiv).attr('data-paginator-page-rank');
    focusedPage = this.getPage(pageRank);
  } catch (e) {
    // if there is no focused page div, focus to the first page
    focusedPage = this.getPage(1);
    focusedDiv = focusedPage.content();
    this._editor.selection.select(focusedDiv, true);
  } finally {
    this.gotoPage(focusedPage,this.CURSOR_POSITION.END);
  }
};

/**
 * Navigate to the previous page
 * @method
 * @param {string} [cursorPosition] - The requested cursor  position to set after navigating to
 * @return {Page|null} The previous page after navigation is done, null if previous page doesn'nt exist.
 */
Paginator.prototype.gotoPrevious = function(cursorPosition){
  var prevPage = this.getPrevious();
  cursorPosition = cursorPosition || this.CURSOR_POSITION.END;
  return (prevPage) ? this.gotoPage(prevPage,cursorPosition) : null;
};

/**
 * Navigate to the next page
 * @method
 * @param {string} [cursorPosition] - The requested cursor  position to set after navigating to
 * @return {Page|null} The next page after navigation is done, null if next page doesn'nt exist.
 */
Paginator.prototype.gotoNext = function(cursorPosition){
  var nextPage = this.getNext();
  cursorPosition = cursorPosition || this.CURSOR_POSITION.END;
  return (nextPage) ? this.gotoPage(nextPage,cursorPosition) : null;
};

/**
 * Watch the current page, to check if content overflows the page's max-height.
 * @method
 * @return void
 * @throws {InvalidPageHeightError} if `currentHeight` fall down to zero meaning the link with DOM element is broken
 */
Paginator.prototype.watchPage = function(){
  var maxHeight;
  var currentHeight;
  var iteratee = -1; // pass to zero during the first loop
  var cursorPositionAfterRepaging;
  var lastBlock, savedLastBlock;

  // check if the current page is overflown by its content
  // if true, repage the content
  do {
    if (lastBlock) savedLastBlock = lastBlock;
    iteratee++; lastBlock = null;

    maxHeight = _getPageInnerHeight.call(this);
    currentHeight = this.getCurrentPage().getContentHeight();

    if (currentHeight===0) throw new InvalidPageHeightError(currentHeight);

    if (currentHeight > maxHeight) {
      lastBlock = _repage.call(this);
    }

  } while ( lastBlock );

  // if more than one loop ocured, there was be repaging.
  if (iteratee) {
    // pass the saved lastblock to the gotoNext() method for focusing on it after page change.
    this.gotoNext(savedLastBlock);
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
  var currentRng = this._editor.selection.getRng();

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
 * @returns {boolean} True if success to move last block to the next page.
 *
 * @todo If it overflows, put the content that overflows in the next page, then, check if
 * the text on the next page can fill the current one without overflowing.
 */
var _repage = function(){ console.info('repaging...');
  var currentRng = this._editor.selection.getRng();
  var children = $(this._currentPage.content()).children();
  var lastBlock = children[children.length - 1];
  var nextPage = this.getNext() || _createNextPage.call(this);

  switch (lastBlock.nodeName) {
    case 'DIV':
    case 'P':
      // Prepend element to page
      $(lastBlock).prependTo($(nextPage.content()));
      // Append page to document
      $(nextPage.content()).appendTo(this._body);

    break;

    default:
      window.alert('Une erreur est survenue dans le plugin de pagination. Merci de visionner l\'erreur dans la console et de déclarer cette erreur au support «support@sirap.fr»');
      throw new Error('Unsupported block type for repaging: '+lastBlock.nodeName);

  }

  return lastBlock;
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
  var nextRank = (this._currentPage) ? (this._currentPage.rank+1) : 1 ;
  var divWrapper = _createEmptyDivWrapper.call(this,nextRank);
  if (contentNodeList) {
    $(contentNodeList).appendTo(divWrapper);
  }
  newPage = new Page(this._defaultPage.format().label, this._defaultPage.orientation, nextRank, divWrapper[0]);
  this._pages.push(newPage);
  return newPage;
};


// Exports Paginator class
exports = module.exports = Paginator;

// Bind errors to the classes/paginator module.
exports.errors = errors;

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
InvalidPageRankError.prototype = Error.prototype;
InvalidPageRankError.prototype.name = 'InvalidPageRankError';

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
InvalidFocusedRangeError.prototype = Error.prototype;
InvalidFocusedRangeError.prototype.name = 'InvalidFocusedRangeError';

/**
 * Must be thrown when the current page height doesn't match required values
 * @class
 * @memberof  Paginator.errors
 * @extends Error
 */
function InvalidPageHeightError(height){
  this.name = 'InvalidPageHeightError';
  this.message = height + 'px is an invalid page height.';
  this.stack = (new Error()).stack;
}
InvalidPageHeightError.prototype = Error.prototype;
InvalidPageHeightError.prototype.name = 'InvalidPageHeightError';

/**
 * Must be thrown when the requested cursor position doesn't match required values.
 * @class
 * @memberof  Paginator.errors
 * @extends Error
 */
function InvalidCursorPosition(requestedPosition){
  this.name = 'InvalidCursorPosition';
  this.message = requestedPosition + 'is an invalid cursor position.';
  this.stack = (new Error()).stack;
}
InvalidCursorPosition.prototype = Error.prototype;
InvalidCursorPosition.prototype.name = 'InvalidCursorPosition';

//
// export Paginator.errors namespace
//
module.exports = {
  InvalidPageRankError:InvalidPageRankError,
  InvalidFocusedRangeError:InvalidFocusedRangeError,
  InvalidPageHeightError:InvalidPageHeightError,
  InvalidCursorPosition:InvalidCursorPosition
};

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


/**
 * Tinymce library - injected by the plugin loader.
 * @external tinymce
 * @see {@link https://www.tinymce.com/docs/api/class/tinymce/|Tinymce API Reference}
 */
/*global tinymce:true */

/**
 * The jQuery plugin namespace - plugin dependency.
 * @external "jQuery.fn"
 * @see {@link http://learn.jquery.com/plugins/|jQuery Plugins}
 */
/*global jquery:true */

/**
 * Paginator class
 * @type {Paginator}
 * @global
 */
var Paginator = require('./classes/Paginator');

/**
 * Paginator ui module
 * @type {object}
 * @global
 */
var ui = require('./utils/ui');

/**
 * InvalidPageHeightError
 * @type {InvalidPageHeightError}
 * @global
 */
var InvalidPageHeightError = Paginator.errors.InvalidPageHeightError;

/**
 * Tinymce plugin paginate
 * @function
 * @global
 * @param {tinymce.Editor} editor - The injected tinymce editor.
 * @returns void
 */
function tinymcePluginPaginate(editor) {

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
      // alert('pause after "init" event');
    });
    editor.on('change',function(evt){
      myevents.push({'change':evt});
      mycount.change ++;
      console.log(myevents,mycount);
      // alert('pause after "change" event');
    });
    editor.on('NodeChange',function(evt){
      myevents.push({'NodeChange':evt});
      mycount.nodechange ++;
      console.log(myevents,mycount);
      // alert('pause after "NodeChange" event');
    });
    editor.on('SetContent',function(evt){
      myevents.push({'SetContent':evt});
      mycount.setcontent ++;
      console.log(myevents,mycount);
      // alert('pause after "SetContent" event');
    });

    window.logEvents = myevents;
    window.logCount = mycount;
  }

  /**
   * On 'PageChange' event listener. Update page rank input on paginator's navigation buttons.
   * @function
   * @private
   */
  function onPageChange(evt){
    ui.updatePageRankInput(evt.toPage.rank);
    editor.nodeChanged();
  }

  function onRemoveEditor(evt){
    ui.removeNavigationButtons();
    paginator.destroy();
    watchPageIterationsCount = 0;
    paginatorListens = false;
  }

  /**
   * Wrap Paginator#watchPage() in try catch statements and private function to allow watch recursively on error
   * @function
   * @private
   * @returns void
   * @throws {Error} if error thrown is not instance of InvalidPageHeightError
   */
  function watchPage(){
    try {
      paginator.watchPage();
    } catch (e) {
      watchPageIterationsCount++;
      // Due to a suspecte bug in tinymce that break the binding of DOM elements with the paginator.
      if (e instanceof InvalidPageHeightError) {
        console.error(e.message+'... re-init paginator then watch page again...');
        paginator.init();
        if (watchPageIterationsCount<10) {
          watchPage();
        } else {
          watchPageIterationsCount = 0;
        }
      } else throw e;
    }
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
   * @global
   */
  var display;

  /**
   * Is set to true when paginator is initialized.
   * @var {Boolean} paginatorListens
   * @global
   */
  var paginatorListens = false;

  /**
   * Count of the iterations of watchPage() calls triggered by thrown of `InvalidPageHeightError`. This is a temporary bugfix
   * @var {integer}
   * @global
   */
  var watchPageIterationsCount=0;

  /**
   * The watch of active page is enabled if this var is true
   * @var
   * @global
   */
  var watchPageEnabled = false;

  // _debugEditorEvents();

  /**
   * Plugin method that disable the wath of page (to allow edition of extenal elements like headers and footers)
   * @method
   * @returns void
   */
  this.disableWatchPage = function(){  // jshint ignore:line
    watchPageEnabled = false;
  };
  /**
   * Plugin method that enable the wath of page (after used this#disableWatchPage())
   * @method
   * @returns void
   */
  this.enableWatchPage = function(){ // jshint ignore:line
    watchPageEnabled = true;
  };

  /**
   * Get the current page
   * @returns {Page} the paginator current page.
   */
  this.getCurrentPage = function(){ // jshint ignore:line
    return paginator.getCurrentPage();
  };

  editor.once('init',function(){
    paginator = new Paginator('A4','portrait', editor);
    editor.dom.bind(editor.getDoc(),'PageChange',onPageChange);
    setTimeout(function(){
      paginator.init();
      paginator.gotoFocusedPage();
      paginatorListens = true;
      watchPageEnabled = true;
      ui.appendNavigationButtons(paginator);
    },500);
  });

  editor.on('remove',onRemoveEditor);

  editor.on('change',function(evt){
    // var newContent, beforeContent;
    // if (evt.level && evt.lastLevel) {
    //     newContent = evt.level.content;
    //     beforeContent = evt.lastLevel.content;
    //
    //     if (newContent === '<p><br data-mce-bogus="1"></p>') {
    //       if ( $('div[data-paginator]', $('<div>').append(beforeContent)).length ) {
    //         editor.setContent(beforeContent);
    //         paginator.init();
    //         paginator.gotoFocusedPage();
    //       }
    //     }
    // }

    if(paginatorListens && watchPageEnabled) paginator.watchPage();
  });

  editor.on('SetContent',function(){
    //if(paginatorStartListening) paginator.init();
  });

  editor.on('NodeChange',function(evt){
    if (evt.element && $(evt.element).attr('data-paginator')) {
      if (paginatorListens && watchPageEnabled) {
        try {
          paginator.gotoFocusedPage();
        } catch (e) {
          console.info('Can\'t go to focused page now.');
          console.error(e.stack);
        }
      }
    }
  });

}

// Add the plugin to the tinymce PluginManager
tinymce.PluginManager.add('paginate', tinymcePluginPaginate);

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
          window.alert('Il n\'y a pas de page #'+rank);
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
  var btnCommonStyles = {
    'background': 'whitesmoke',
    'width':'100%',
    'top':'0'
  };

  // Create a div vertical wrapper to append nav elements into
  navbar = $('<div></div>')
  .attr('id','paginator-navbar')
  .css({
    'width': '60px',
    'position': 'absolute',
    'top': (window.screen.height/2 -35)+'px',
    'right': '40px',
    'z-index': '999'
  }).appendTo(body);

  // navigate to previous page
  navbarElements.btnPrevious = $(btnSelector)
    .attr('href','#')
    .attr('title','Previous page')
    .css($.extend(btnCommonStyles,{
      'border-top-left-radius': '25%',
      'border-top-right-radius': '25%',
      'border-bottom-left-radius': '0',
      'border-bottom-right-radius': '0'
    }))
    .addClass(btnCommonClasses + ' glyphicon-chevron-up')
    .click(function(){
      paginator.gotoPrevious();
      return false;
    })
    .appendTo(navbar)
  ;

  // input to show and control current page
  navbarElements.inputRank = $('<input></input>')
    .attr('type','number').attr('id','input-rank')
    .css({ 'width': '100%', 'line-height': '30px', 'text-align': 'center' })
    .change(onInputRankChanges).appendTo(navbar)
  ;

  setTimeout(function(){
    navbarElements.inputRank.val(paginator.getCurrentPage().rank);
  },500);

  // navigate to next page
  navbarElements.btnNext = $(btnSelector)
    .attr('href','#')
    .attr('title','Next page')
    .css($.extend(btnCommonStyles,{
      'width': '100%',
      'border-top-left-radius': '0',
      'border-top-right-radius': '0',
      'border-bottom-left-radius': '25%',
      'border-bottom-right-radius': '25%'
    }))
    .addClass(btnCommonClasses + ' glyphicon-chevron-down')
    .click(function(){
      paginator.gotoNext();
      return false;
    })
    .appendTo(navbar)
  ;
};

/**
 * Remove navigation buttons
 * @function
 * @static
 */
exports.removeNavigationButtons = function(){
  $('#paginator-navbar').remove();
};

exports.updatePageRankInput = function(rank){
  $('#input-rank').val(rank);
};

},{"../classes/paginator/errors":5}]},{},[1]);
