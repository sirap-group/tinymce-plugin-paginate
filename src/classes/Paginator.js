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
