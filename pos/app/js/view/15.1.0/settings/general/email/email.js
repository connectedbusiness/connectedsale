/**
 * @author Connected Business, MJF
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'base64',
  'shared/global',
  'shared/shared',
  'model/base',
  'view/15.1.0/settings/general/email/formats',
  'text!template/15.1.0/settings/general/email/email.tpl.html',
  'text!template/15.1.0/settings/general/email/defaultmessage.tpl.html',
  'js/libs/iscroll.js'
], function($, $$, _, Backbone, base64, Global, Shared, BaseModel, FormatsView, EmailTemplate, DefaultMessageTemplate) {
  var EmailPreference = Backbone.View.extend({

    events: {
      "keydown #main-body-source": "onTextKeydown",
      "change #main-body-source": "onMainBodySource_Change"
    },

    _template: _.template(EmailTemplate),

    _defaultMessageTemplate: _.template(DefaultMessageTemplate),

    initialize: function() {
      $("#settings-location-search").remove();
      this.render();
    },

    render: function() {
      $("#back-general").show();
      this.$el.html(this._template);

      var content = Base64.decode(this.model.get('B64EmailTemplate') || '');
      if (content && (content || '').trim() != '') {
        this.$el.find('#main-body-source').text(content);
        this.updateModel();
      } else {
        this.useDefaultTemplate();
      }

      this.$el.trigger("create");

      this.initFormattingTools();
      this.refreshIScroll();
      this.changeModalSize(); 
    },

    useDefaultTemplate: function() {
      this.$el.find('#main-body-source').val(this._defaultMessageTemplate());
      this.updateModel();
    },

    refreshIScroll: function() {      
      return; //--x
      if (Global.isBrowserMode) Shared.UseBrowserScroll('#right-pane-content');
      else {
        if (this.myScroll) {
          this.myScroll.refresh();
          return;
        }
        this.myScroll = new iScroll('editor' /*'right-pane-content'*/ , {
          onBeforeScrollStart: function(e) {
            var target = e.target;
            while (target.nodeType != 1) target = target.parentNode;

            if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA' && $('#editor').find(target).length == 0)
              e.preventDefault();
          }
        });

      }
    },

    initFormattingTools: function() {
      if (!this.formatsView) this.formatsView = new FormatsView({
        el: "#formatting-controls",
        editor: $("#editor")
      });
      this.formatsView.on('update-model', this.updateModel, this);
      this.formatsView.on('save-changes', this.savePreference, this);
      this.formatsView.on('reset-template', this.resetTemplate, this);
    },

    resetTemplate: function() {
      var self = this;
      navigator.notification.confirm("Are you sure you want to reset email template to default?",
        function(btn) {
          if (btn == 1) self.useDefaultTemplate();
        }, "Reset Template", "Yes,No");
    },

    onMainBodySource_Change: function(e) {
      this.updateModel();
    },

    onTextKeydown: function(e) {            
      //Handle Tab Indents
      if (e.keyCode == 9 || event.which == 9) {
        e.preventDefault();
        var self = e.target;
        var s = self.selectionStart;
        self.value = self.value.substring(0, self.selectionStart) + "\t" + self.value.substring(self.selectionEnd);
        self.selectionEnd = s + 1;
      }
    },

    updateModel: function() {
      //this.validateFields();

      var content = this.$el.find('#main-body-source').val() || '';
      //content = content.replace(new RegExp('contenteditable', 'g'),'');
      content = Base64.encode(content);
      this.model.set({
        B64EmailTemplate: content
      });

      this.refreshIScroll();
    },

    validateFields: function() {
      var flds = this.$el.find('.cs-field');
      if (!flds) return;
      if (flds.length > 0) {
        var cnt = 1;
        while (cnt <= flds.length) {
          var fld = $(flds[cnt - 1]),
            txtVal = fld.html() || '',
            attVal = fld.attr('cs-field-value') || '';
          if (txtVal.length > attVal.length) {
            fld.text(attVal);
          } else {
            if (attVal != txtVal) fld.remove();
          }
          cnt++;
        }
      }
    },

    savePreference: function(onSucess, onError) {
      this.updateModel();
      var self = this;
      var tmp = new BaseModel();
      tmp.url = Global.ServiceUrl + 'System/maintainpickupemailpreference/';
      tmp.set(self.model.attributes);
      tmp.save(tmp, {
        success: function(model, response) {
          if (response.ErrorMessage) {
            Shared.ShowNotification(response.ErrorMessage, true);
            if (onError) onError();
            return;
          }
          if (onSucess) onSucess();
        },
        error: function(model, error, response) {
          Shared.ShowNotification('Error saving email template.', true);
          if (onError) onError();
        }
      });
    },

    changeModalSize: function(){            
      $("#settings-modal-container").addClass("settings-modal-email-template");
      $("#settings-modal").css("width", "auto");
    }

  });
  return EmailPreference;
});
