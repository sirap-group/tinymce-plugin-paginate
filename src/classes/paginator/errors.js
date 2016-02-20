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
