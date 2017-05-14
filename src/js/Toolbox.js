'use strict';

module.exports = function ($, window, document) {
  return function Toolbox () {
    var TAG = 'HtmlCg/Toolbox: ';
    var self = this;

    var filename = window.location.href.substr(window.location.href.lastIndexOf("/") + 1);
    var KEY = 'htmlcg.toolbox.' + filename + '.';

    function btnInvokeOnClick () {
      var value = self.$toolbox.find('[name="inputInvoke"]').val();
      window.localStorage.setItem(KEY + '.inputInvoke', value);
      window.eval(value.replace(/[^a-z0-9]/ig, '') + '()');
    }

    function btnUpdateOnClick () {
      var value = self.$toolbox.find('[name="inputUpdate"]').val();
      window.localStorage.setItem(KEY + '.inputUpdate', value);
      window.update(value);
    }

    $(function () {
      var $body = $('body');
      $body.addClass('debug');

      // console.debug(TAG + 'Appending debug toolbox');
      self.$toolbox = $('<div id="htmlcg-toolbox" class="htmlcg-toolbox"><div class="modal-dialog"><div class="modal-content">' +
        '<div class="modal-header"><div class="htmlcg-dialog-title">htmlcg</div></div>' +
        '<div class="modal-body">' +
        '<table><tr>' +
        '<td><button type="button" name="btnPlay" onclick="play()">Play</button></td>' +
        '<td><button type="button" name="btnNext" onclick="next()">Next</button></td>' +
        '<td><button type="button" name="btnStop" onclick="stop()">Stop</button></td>' +
        '</tr><tr>' +
        '<td colspan="2"><input type="text" name="inputInvoke" id="htmlcg_input_invoke"></td>' +
        '<td><button type="button" name="btnInvoke">Invoke</button></td>' +
        '</tr><tr>' +
        '<td colspan="3"><textarea name="inputUpdate" id="htmlcg_input_update" rows="5"></textarea></td>' +
        '</tr><tr>' +
        '<td colspan="3"><button type="button" name="btnUpdate">Update</button></td>' +
        '</tr></table>' +
        '</div>' + // modal-body
        '</div></div></div>'
      ).appendTo('body');

      self.$toolbox.find('[name="btnInvoke"]').click(btnInvokeOnClick);
      self.$toolbox.find('[name="btnUpdate"]').click(btnUpdateOnClick);

      self.$toolbox.find('.htmlcg-dialog-title').text(document.title);

      // Set/reset position
      self.$toolbox.css('top', Math.max(0, Math.min(window.innerHeight - self.$toolbox.outerHeight(), parseInt(window.localStorage.getItem(KEY + '.top')) || Number.MAX_VALUE)));
      self.$toolbox.css('left', Math.max(0, Math.min(window.innerWidth - self.$toolbox.outerWidth(), parseInt(window.localStorage.getItem(KEY + '.left')) || Number.MAX_VALUE)));

      // Restore input values
      self.$toolbox.find('[name="inputInvoke"]').val(window.localStorage.getItem(KEY + '.inputInvoke'));
      self.$toolbox.find('[name="inputUpdate"]').val(window.localStorage.getItem(KEY + '.inputUpdate'));

      // Make toolbox draggable
      self.$toolbox.find('div.modal-header').css('cursor', 'move').on("mousedown", function (e) {
        var $drag = self.$toolbox.addClass('draggable');
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
        self.$toolbox.removeClass('draggable');
        window.localStorage.setItem(KEY + '.top', self.$toolbox.css('top'));
        window.localStorage.setItem(KEY + '.left', self.$toolbox.css('left'));
      });
    });
  }
};