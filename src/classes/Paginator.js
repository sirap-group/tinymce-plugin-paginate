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
 * Get the currently focused page div
 * @method
 * @return {Element} The parent div element having an attribute data-paginator
 */
Paginator.prototype.getFocusedPageDiv = function(){
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
 * Go to the page having the focus
 * @method
 * @return void
 */
Paginator.prototype.gotoFocusedPage = function(){
  var focusedDiv = this.getFocusedPageDiv();
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
Paginator.prototype.watchPage = function(){

  var maxHeight = Math.ceil(this._getPageInnerHeight());
  var currentHeight = Number($(currentPage.content()).css('height').split('px').join(''));
  console.info('normal inner page height',maxHeight);
  console.info('currentPage inner height',currentHeight);

  if (currentHeight > maxHeight) {
    alert('Dépassement de page !');
    this._repage();
  }


  // console.log('padding',padding);

  // console.log('default height:', this._defaultPage.height);
  // console.log('page (Display) height (px): ', this._display.height('px') + ' px');
  // console.log('page (Display) height (mm): ', this._display.height('mm') + ' mm');
  // console.log('page content', page.content());
};

/**
 * Get the current computed padding
 * @method
 * @return {object}
 */
Paginator.prototype._getDocPadding = function(){
  var that = this;
  return {
    top: $(that._body).css('padding-top'),
    right: $(that._body).css('padding-right'),
    bottom: $(that._body).css('padding-bottom'),
    left: $(that._body).css('padding-left')
  };
}

/**
 * Compute the page inner height in pixels
 * @method
 * @return {Number} The resulted height in pixels
 */
Paginator.prototype._getPageInnerHeight = function(){

  var outerHeight = Number(this._display.mm2px(this._defaultPage.height)*10); // @TODO (*10) is a bug fix
  var docPadding = this._getDocPadding();
  var paddingTop = Number(docPadding.top.split('px').join(''));
  var paddingBottom = Number(docPadding.bottom.split('px').join(''));

  var innerHeight = outerHeight - paddingTop - paddingBottom;

  return innerHeight-1 // -1 because of a bug in border-bottom pdf rendering
};

/**
 * Initialize the paginator
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
  var wrapper = $('<div>');
  wrapper.attr({
    'data-paginator': true,
    'data-paginator-page-rank': 1
  }).css({
    'page-break-after': 'always',
    'height': that._getPageInnerHeight(),
    // 'border': 'solid red 1px',
    // 'background': 'yellow',
    'overflow': 'hidden'
  });

  // wrap unwrapped content
  if (!wrappedPages.length){
    $(this._body).wrapInner(wrapper);
    wrappedPages = findPageWrappers();
  }

  pages = [];
  $.each(wrappedPages,function(i,el){
    pages.push(new Page(that._defaultPage.format().label, that._defaultPage.orientation, i+1, el));
  });


  console.log(pages);

};

/**
 * Paginator class
 */
module.exports = Paginator;
