'use strict';

/**
 * @function appendNavigationButtons
 * @return void
 */
exports.appendNavigationButtons = function(){
  var body = $('body');
  var selector = '<button></button>';
  var commonClasses = 'btn btn-default btn-large glyphicon';
  var commonCss = {
    'position': 'absolute',
    'right': '25px',
    'z-index': '999'
  };
  // navigate to previous page
  $(selector)
    .css($.extend( { 'top': (window.screen.height/2)+'px', }, commonCss ))
    .addClass(commonClasses + ' glyphicon-chevron-up')
    .appendTo(body)
  ;
  // navigate to next page
  $(selector)
    .css($.extend( { 'top': (window.screen.height/2 + 30)+'px', }, commonCss ))
    .addClass(commonClasses + ' glyphicon-chevron-down')
    .appendTo(body)
  ;
};
