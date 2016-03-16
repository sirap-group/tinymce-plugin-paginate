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
