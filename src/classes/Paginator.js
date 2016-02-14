'use strict';

// var _ = require('lodash');
var Display = require('./Display');
var Page = require('./Page');
var parser = require('./paginator/parser');

var errors = require('./paginator/errors'),
  InvalidPageRankError = errors.InvalidPageRankError;

/**
 * @constructor
 * @param pageFormatLabel
 */
function Paginator(pageFormatLabel, pageOrientation, doc){

  this._document = doc;
  this._display = new Display(doc);
  this._defaultPage = new Page(pageFormatLabel, pageOrientation);

}

/**
 * @property {Page} currentPage
 * @private
 */
var currentPage;

/**
 * @property {Array} pages
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
   * @TODO
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

Paginator.prototype.watchPage = function(page){
  // console.log('default height:', this._defaultPage.height);
  // console.log('page (Display) height (px): ', this._display.height('px') + ' px');
  // console.log('page (Display) height (mm): ', this._display.height('mm') + ' mm');
  // console.log('page content', page.content());
};

/**
 * @method fill the paginator with the full document content
 * @param {String} content to be filled in paginator
 * @return void
 */
Paginator.prototype.fill = function(content){
  this._fullContent = content;

  var parsedDoc = parser.document(this._document,content);
  console.log('parsedDoc',parsedDoc);

  // console.log('content',content);

  // var firstPage = new Page(this._defaultPage.format().label, this._defaultPage.orientation, 1, content);
  // pages.push(firstPage);
  //
  // this.watchPage(firstPage);
};

module.exports = Paginator;
