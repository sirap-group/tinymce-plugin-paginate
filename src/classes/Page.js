'use strict';

var supportedFormats = require('../utils/page-formats');



function BadOrientationError(){}
BadOrientationError.prototype = Error.prototype;

/**
 * @constructor
 * @param {String} formatLabel
 * @param {Sring} orientation
 * @param {Number} rank
 * @param {String} content
 */
function Page(formatLabel, orientation, rank, content){
  this._content = null;
  this.rank = null;

  this.format(formatLabel);
  this.orientate(orientation);

  if (rank !== undefined) {
    this.rank = rank;
  }

  if (content !== undefined || content !== null) {
    this.content(content);
  }
}

/**
 * @method set the page's content
 * @param {String} content The content to fill the page
 * @return void
 */
Page.prototype.content = function(content){
  this._content = content;
};

/**
 * getter-setter of the orientation
 * @method
 * @param <string> orientation
 * @return void
 */
Page.prototype.orientate = function(orientation){
  if ( typeof(orientation) !== 'string' && !(orientation.toLowerCase() in ['portrait','paysage']) )
    throw new BadOrientationError('orientation must be `portrait` or `paysage`');

  this.orientation = orientation;

  if (orientation === 'portrait') {
    this.width = this.format.short;
    this.height = this.format.long;
  } else {
    this.width = this.format.long;
    this.height = this.format.short;
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
