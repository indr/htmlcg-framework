'use strict';

module.exports = function ($, window, document) {
  return function Toolbox () {
    var TAG = 'HtmlCg/Toolbox: ';

    $(function () {
      var $body = $('body');
      $body.addClass('debug');

      // console.debug(TAG + 'Appending debug toolbox');
      var $div = $('<div id="htmlcg-toolbox" class="htmlcg-toolbox"><div class="modal-dialog"><div class="modal-content">' +
        '<div class="modal-header"><div class="htmlcg-dialog-title">htmlcg</div></div>' +
        '<div class="modal-body">' +
        '<table><tr>' +
        '<td><button type="button" onclick="play()">Play</button></td>' +
        '<td><button type="button" onclick="next()">Next</button></td>' +
        '<td><button type="button" onclick="stop()">Stop</button></td>' +
        '</tr><tr>' +
        '<td colspan="2"><input type="text" id="htmlcg_input_invoke"></td>' +
        '<td><button type="button" onclick="(function(){ var name = $(\'#htmlcg_input_invoke\').val().replace(/[^a-z0-9]/ig, \'\'); eval(name + \'()\');}())">Invoke</button></td>' +
        '</tr><tr>' +
        '<td colspan="3"><textarea id="htmlcg_input_update" rows="5"></textarea></td>' +
        '</tr><tr>' +
        '<td colspan="3"><button type="button" onclick="update($(\'#htmlcg_input_update\').val())">Update</button></td>' +
        '</tr></table>' +
        '</div>' + // modal-body
        '</div></div></div>'
      ).appendTo('body');

      $div.find('.htmlcg-dialog-title').text(document.title);

      var KEY = 'htmlcg.toolbox.';

      $div.css('top', Math.max(0, Math.min(window.innerHeight - $div.outerHeight(), parseInt(window.localStorage.getItem(KEY + '.top')) || Number.MAX_VALUE)));
      $div.css('left', Math.max(0, Math.min(window.innerWidth - $div.outerWidth(), parseInt(window.localStorage.getItem(KEY + '.left')) || Number.MAX_VALUE)));

      $div.find('div.modal-header').css('cursor', 'move').on("mousedown", function (e) {
        var $drag = $div.addClass('draggable');
        var z_idx = $drag.css('z-index'),
          drg_h = $drag.outerHeight(),
          drg_w = $drag.outerWidth(),
          pos_y = $drag.offset().top + drg_h - e.pageY,
          pos_x = $drag.offset().left + drg_w - e.pageX;
        $drag.css('z-index', 1000).parents().on("mousemove", function (e) {
          $('.draggable').offset({
            top: e.pageY + pos_y - drg_h,
            left: e.pageX + pos_x - drg_w
          });
        });
        e.preventDefault(); // disable selection
      }).on("mouseup", function () {
        $div.removeClass('draggable');
        window.localStorage.setItem(KEY + '.top', $div.css('top'));
        window.localStorage.setItem(KEY + '.left', $div.css('left'));
      });
    });
  }
};