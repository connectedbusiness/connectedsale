/**
 * @author Connected Business, MJF
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'shared/shared',
  'model/base',
  'collection/base',
  'text!template/19.1.0/settings/general/email/formats.tpl.html',
  'text!template/19.1.0/settings/general/email/help.tpl.html'
], function($, $$, _, Backbone, Global, Shared, BaseModel, BaseCollection, FormatsTemplate, HelpTemplate) {
  var FormatsView = Backbone.View.extend({

    events: {
      "tap #btn-Fields": "onFields_Tap",
      "tap #btn-Link": "onLink_Tap",
      "tap #btn-TestSend": "onTestSend_Tap",
      "tap #btn-Bold": "onBold_Tap",
      "tap #btn-Italic": "onItalic_Tap",
      "tap #btn-Underlined": "onUnderlined_Tap",
      "tap [cs-field-value]": "onFiledItem_Tap",
      "tap #btn-Help": "onHelp_Tap",
      "tap #btn-Close-Help": "onCloseHelp_Tap",
      "tap .wrap-button": "wrapButton_Tap",
      "tap #btn-Send": "onSend_Tap",
      "tap #btn-Reset": "onReset_Tap"
    },

    _template: _.template(FormatsTemplate),

    _helpTemplate: _.template(HelpTemplate),

    initialize: function(opt) {
      opt = opt || {};
      this.editor = opt.editor;
      this.render();
      this.editor.focus();
      this.trigger('update-model');
      this.selectedTextAreaID = 'main-body-source';
    },

    render: function() {
      this.$el.html(this._template);
      this.loadFields();
      this.initialBarHeight = $('#formatting-controls').outerHeight(true);
      this.initialEditorHeight = this.editor.height();
    },

    updateHeight: function() {      
      var self = this;
      var intr = setInterval(function() {
        var newHeight = (self.initialEditorHeight + (self.initialBarHeight - $('#formatting-controls').outerHeight(true))) + 'px';
        if (self.isDoneAnimating) clearInterval(intr);
        self.editor.height(newHeight);
      }, 100);
    },

    loadFields: function() {
      var self = this;
      var tmp = new BaseCollection();
      tmp.parse = function(response) {
        return response.EmailFields;
      }
      tmp.url = Global.ServiceUrl + 'Transactions/getemailtemplatefields';
      tmp.fetch({
        success: function(collection, response) {
          self.renderFields(collection);
        },
        error: function(collection, error, response) {
          console.log('Error Loading Email Fields');
        }
      });
    },

    renderFields: function(collection) {
      if (!collection) return;
      var self = this;
      _.each(collection.where({
        IsDetailField: false
      }), function(field) {
        self.addFieldToPool(field);
      });
      this.$el.find('#grp-Fields').append('<div style="width: 100%;background: transparent;height: 1px;padding: 0;margin: 0; border: none;"></div>');
      _.each(collection.where({
        IsDetailField: true
      }), function(field) {
        self.addFieldToPool(field);
      });
    },

    addFieldToPool: function(field) {
      var name = field.get('DataColumn'),
        value = field.get('EmailField').toUpperCase(),
        isDetailField = field.get('IsDetailField')
      isImage = field.get('IsImage');

      name = isDetailField ? ('Row Field: ' + name) : name;
      var dtlClass = isDetailField ? 'IsDetailField' : '';
      if (isImage) dtlClass += ' IsImage';
      this.$el.find('#grp-Fields').append('<div class="' + dtlClass + '" title="' + name + '" cs-field-value="{' + value + '}">{' + value + '}</div>');
    },

    onLink_Tap: function(e) {
      e.preventDefault();
      var self = this;
      self.isDoneAnimating = false;
      self.updateHeight();
      if (this.$el.find('#btn-Link').hasClass('selected')) {
        this.resetSubControls(function() {
          self.isDoneAnimating = true;
        });
      } else {
        this.resetSubControls(function() {
          self.$el.find('#grp-Link').show('slow', function() {
            self.isDoneAnimating = true;
          });
        });
        self.$el.find('#btn-Link').addClass('selected');
      }
    },

    onTestSend_Tap: function(e) {
      e.preventDefault();
      var self = this;
      self.isDoneAnimating = false;
      self.updateHeight();
      if (this.$el.find('#btn-TestSend').hasClass('selected')) {
        this.resetSubControls(function() {
          self.isDoneAnimating = true;
        });
      } else {
        this.resetSubControls(function() {
          self.$el.find('#grp-TestSend').show('slow', function() {
            self.isDoneAnimating = true;
          });
        });
        self.$el.find('#btn-TestSend').addClass('selected');
      }
    },

    onFields_Tap: function(e) {
      e.preventDefault();
      var self = this;
      self.isDoneAnimating = false;
      self.updateHeight();
      if (this.$el.find('#btn-Fields').hasClass('selected')) {
        this.resetSubControls(function() {
          self.isDoneAnimating = true;
        });
      } else {
        this.resetSubControls(function() {
          self.$el.find('#grp-Fields').show('slow', function() {
            self.isDoneAnimating = true;
          });
        });
        self.$el.find('#btn-Fields').addClass('selected');
      }
    },

    InsertCodeInTextArea: function(textValue) {
      //Get textArea HTML control
      var txtArea = document.getElementById(this.selectedTextAreaID);

      //IE
      if (document.selection) {
        txtArea.focus();
        var sel = document.selection.createRange();
        sel.text = textValue;
        this.trigger('update-model');
        return;
      }
      //Firefox, chrome, mozilla
      else if (txtArea.selectionStart || txtArea.selectionStart == '0') {
        var startPos = txtArea.selectionStart;
        var endPos = txtArea.selectionEnd;
        var scrollTop = txtArea.scrollTop;
        txtArea.value = txtArea.value.substring(0, startPos) + textValue + txtArea.value.substring(endPos, txtArea.value.length);
        txtArea.focus();
        txtArea.selectionStart = startPos + textValue.length;
        txtArea.selectionEnd = startPos + textValue.length;
      } else {
        txtArea.value += textArea.value;
        txtArea.focus();
      }

      this.trigger('update-model');
    },


    resetSubControls: function(afterAnimte) {
      var self = this;
      this.$el.find("#grp-Formats div").removeClass('selected');
      this.$el.find('#grp-Fields').hide('fast', function() {
        self.$el.find('#grp-Link').hide('fast', function() {
          self.$el.find('#grp-TestSend').hide('fast', afterAnimte);
        });
      });
    },

    onHelp_Tap: function(e) {
      e.preventDefault();
      this.$el.find('#help-body').html(this._helpTemplate());
      this.$el.find('#help-tool').show();
    },

    onCloseHelp_Tap: function(e) {
      e.preventDefault();
      this.$el.find('#help-body').html('');
      this.$el.find('#help-tool').hide();
    },

    wrapButton_Tap: function(e) {
      e.preventDefault();
      var i = $(e.currentTarget).find('i');
      var turnOn = false;

      if (i.hasClass('icon-check-empty')) {
        i.removeClass('icon-check-empty');
        i.addClass('icon-check');
        turnOn = true;
      } else {
        i.removeClass('icon-check');
        i.addClass('icon-check-empty');
      }

      if (e.currentTarget.id == "mb-wrap") {
        $("#main-body-source").attr('wrap', (turnOn ? 'on' : 'off'));
      }
    },

    onFiledItem_Tap: function(e) {
      e.preventDefault();
      var self = this;
      var newElement = $(document.createElement('span'));
      var fldVal = $(e.target).attr('cs-field-value') || '';
      var isImage = $(e.target).hasClass('IsImage');
      fldVal = isImage ? '<img src="data:image/png;base64,' + fldVal + '">' : fldVal;
      self.InsertCodeInTextArea(fldVal);
    },

    onSend_Tap: function(e) {
      e.preventDefault();
      var self = this;

      var emailAddress = this.$el.find('#txtTestEmail').val();
      emailAddress = (emailAddress || '').trim();
      if (!emailAddress) {
        Shared.ShowNotification('Email Address is required', true);
        return;
      }

      if (Shared.ValidateEmailFormat(emailAddress)) {
        Shared.ShowNotification('Invalid Email Address', true);
        return;
      }

      self.toggleSendButton(true, true);
      this.trigger('save-changes',
        function() {
          self.doSend(emailAddress);
        },
        function() {
          self.toggleSendButton();
        });
    },

    onReset_Tap: function(e) {
      e.preventDefault();
      this.trigger('reset-template');
    },

    doSend: function(emailAddress) {
      var self = this;
      var mail = new BaseModel();

      mail.url = Global.ServiceUrl + 'Transactions/sendtestemail';
      mail.set({
        UserName: Global.Username,
        RecipientEmailAddress: emailAddress,
        IsReadyForInvoice: true,
        WorkStationID: Global.POSWorkstationID
      });

      self.toggleSendButton(true);

      mail.save(mail, {
        success: function(model, response) {
          self.toggleSendButton();
          if (response.Value) {
            Shared.ShowNotification('Test Email Sent!');
          } else {
            Shared.ShowNotification(response.ErrorMessage || 'Error Sending Email', true);
          }
        },
        error: function(model, error, response) {
          self.toggleSendButton();
          Shared.ShowNotification('An error was encountered when trying to Send Test Email', true);
        }
      });
    },

    toggleSendButton: function(isSending, isSaving) {
      if (isSending) {
        this.$el.find('#btn-Send i').removeClass('icon-envelope');
        this.$el.find('#btn-Send i').addClass('icon-spinner');
        this.$el.find('#btn-Send i').addClass('icon-spin');
        this.$el.find('#btn-Send').addClass('ui-disabled');
        this.$el.find('#btn-Send span').text(isSaving ? 'Saving...' : 'Sending...');
      } else {
        this.$el.find('#btn-Send i').removeClass('icon-spinner');
        this.$el.find('#btn-Send i').removeClass('icon-spin');
        this.$el.find('#btn-Send i').addClass('icon-envelope');
        this.$el.find('#btn-Send').removeClass('ui-disabled');
        this.$el.find('#btn-Send span').text('Send');
      }
    },

    insertNewElement: function(newElement) {
      try {
        this.editor.focus();
        var range = window.getSelection().getRangeAt(0);
        range.deleteContents();
        range.insertNode(newElement);
      } catch (err) {
        console.log(err.message);
      }
    },

    onBold_Tap: function(e) {
      e.preventDefault();
      document.execCommand("Bold", false, null);
      this.updateBoldElements();
      this.trigger('update-model');
    },

    onItalic_Tap: function(e) {
      e.preventDefault();
      document.execCommand("Italic", false, null);
    },

    onUnderlined_Tap: function(e) {
      e.preventDefault();
      document.execCommand("Underline", false, null);
      this.trigger('update-model');
    },

    updateBoldElements: function() {
      Shared.SetStyle($(this.editor.find('b')), 'font-weight', 'bold !important');
    }

  });
  return FormatsView;
});
