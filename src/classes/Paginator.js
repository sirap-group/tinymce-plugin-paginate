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

  if (!toPage) throw new Error('Cant navigate to undefined page');

  if (toPage !== currentPage) {

    // Show the destination page
    $(toPage.content()).css({ 'display': 'block' });

    // Hide all other pages
    $.each(pages,function(i, loopPage){
      if (toPage.rank !== loopPage.rank) {
        $(loopPage.content()).css({ 'display': 'none' });
      }
    });

    // Move cursor to the end of the destination page
    focusToBottom();

    // set the page as current page
    currentPage = toPage;
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
 */
var _getFocusedPageDiv = function(){
  var ret, selectedElement, parents;
  var currentRng = editor.selection.getRng();

  selectedElement = currentRng.startContainer;
  parents = editor.dom.getParents(selectedElement,'div',editor.getDoc().body);
  $.each(parents,function(i,parent){
    if ($(parent).attr('data-paginator')) {
      ret = parent;
    }
  });

  if (!ret) {
    console.error('No parent page found ! You are out of a page.');
    return null;
  } else {
    return ret;
  }
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
  newPage = new Page(this._defaultPage.format().label, this._defaultPage.orientation, nextRank, divWrapper[0]);
  pages.push(newPage);
  return newPage;
};

/**
 * Paginator class
 */
module.exports = Paginator;
