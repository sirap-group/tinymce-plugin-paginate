/**
 * Paginator errors module
 * @module classes/paginator/errors
 * @namespace Pagiantor.errors
 */
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
