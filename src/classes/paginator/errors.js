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
InvalidPageHeightError.prototype = new Error;

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
InvalidCursorPosition.prototype = new Error;

//
// export Paginator.errors namespace
//
module.exports = {
  InvalidPageRankError:InvalidPageRankError,
  InvalidFocusedRangeError:InvalidFocusedRangeError,
  InvalidPageHeightError:InvalidPageHeightError,
  InvalidCursorPosition:InvalidCursorPosition
};
