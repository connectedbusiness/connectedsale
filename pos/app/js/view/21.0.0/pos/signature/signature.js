/**
 * Connected Business | 05-14-2012
 * Required: el
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'shared/global',
  'backbone',
  'text!template/21.0.0/pos/signature/signature.tpl.html',
  'view/spinner',
  'js/libs/jSignature.min.js'
], function($, $$, _, Global, Backbone, template, Spinner) {

  var SignatureView = Backbone.View.extend({
    _template: _.template(template),

    events: {
      "tap .btn-Cancel": "btnCancel_tap",
      "tap .btn-Done": "btnDone_tap",
      "tap .btn-clear-signature": "btnClear_tap",
      "tap #btn-ask-to-sign": "btn_AskToSign",
      "tap #btn-stop-asking": "btnCancel_Retrieval",
    },

    initialize: function() {
      signatureHasChanges = false;
      this.render();
    },

    render: function() {
      console.log('render sig')
      this.$el.html('');
      this.$el.html(this._template);
      this.$("#signature").jSignature({
        height: "120px",
        width: "480px"
      });
      this.$("#signature").bind("change", this.SignatureChanged);
      this.$("#signatureBody").trigger("create");
      $("#main-transaction-blockoverlay").show();
    },

    SignatureChanged: function(e) {
      signatureHasChanges = true;
    },

    Close: function() {
      this.sketchView = false;
      this.Hide();
    },

    Show: function(signatureSVG) {
      switch (signatureSVG != null) {
        case true:
          this.ViewOnly = true;
          this.LoadSignature(signatureSVG);
          break;
        case false:
          this.ViewOnly = false;
          signatureHasChanges = false;
          break;
      }
      this.ToggleDisplay();
      if (Global.OnRechargeProcess) this.$(".btn-Cancel").hide();
      this.$el.show();
      $("#main-transaction-blockoverlay").show();
    },

    ToggleDisplay: function() {
      if (this.viewType == "POS") {
        switch (this.ViewOnly) {
          case true:
            this.$(".signatureDisplay").show();
            this.$(".btn-Cancel").show();
            this.$(".btn-clear-signature").show();
            this.$(".btn-ask-to-sign").show();
            this.$("#signature").hide();
            break
          case false:
            this.$(".signatureDisplay").hide();
            this.$(".btn-Cancel").show();
            this.$(".btn-clear-signature").show();
            this.$(".btn-ask-to-sign").show();
            this.$("#signature").show();
            break;
        }
        if (this.ReadOnly) {
          this.$(".btn-clear-signature").hide();
          this.$(".btn-ask-to-sign").hide();
        }
      } else {
        this.$(".signatureDisplay").hide();
        this.$(".btn-ask-to-sign").hide();
        this.$(".btn-clear-signature").removeClass('left-btn');
        this.$(".btn-clear-signature").show();

        if (this.viewType == "SecondaryDisplay") this.$(".btn-Cancel").hide();
        else this.$(".btn-Cancel").show();
      }

    },

    SketchSignature: function(base64String) {
      signatureHasChanges = true;
      this.ViewOnly = true;
      this.render();
      this.ToggleDisplay();
      this.LoadSignature(base64String);
      this.sketchView = true;
    },

    Hide: function() {
      this.ResetSignature();
      this.$el.hide();
      this.trigger('formClosed', this);
    },

    ResetSignature: function() {
      this.$("#signature").jSignature('reset');
      signatureHasChanges = false;
    },

    GetSignature: function() {
      if (this.sketchView) return;
      var datapair = this.$("#signature").jSignature("getData", "svgbase64");
      if (datapair) {
        Global.Signature = datapair[1];
        return datapair[1];
      }
      Global.Signature = null;
      return null;
    },

    LoadSignature: function(signatureSVG) {
      if (signatureSVG != null) {
        var i = new Image();
        i.src = "data:image/svg+xml;base64," + signatureSVG
        this.$(".signatureDisplay").html($(i));
      }
    },

    ValidateSignature: function() {
      if (signatureHasChanges === false) {
        console.log("A signature from the customer is required.");
        navigator.notification.alert("A signature from the customer is required.", null, "Signature is Required", "OK");
        return false;
      }
      return true;
    },

    btnClear_tap: function(e) {
      e.preventDefault();
      if (this.sketchView) {
        this.ToggleDisplay();
        this.trigger('deleteSavedSignature', Global.Signature, this);
      } else this.ResetSignature();
      this.sketchView = false;
    },


    btn_AskToSign: function(e) {
      e.preventDefault();
      console.log('btn_AskToSign');
      this.$('.btn-ask-to-sign').attr('id', 'btn-stop-asking');
      //'.btn-ask-to-sign'
      //'btn-ask-to-sign'
      _showActivityIndicator();
      this.trigger("allowUserToAttachSign", this);
    },

    btnCancel_Retrieval: function(e) {
      e.preventDefault();
      this.$('.btn-ask-to-sign').attr('id', 'btn-ask-to-sign');
      _revertTextBack();
      this.trigger("cancelSignRetrieval", this);
    },

    btnCancel_tap: function(e) {
      e.preventDefault();
      if (this.IsWaiting()) return;
      this.trigger('deleteSavedSignature', Global.Signature, this);
      this.ResetSignature();
      this.trigger("CancelSignature");
      this.Close();
      $("#main-transaction-blockoverlay").hide();
    },

    btnDone_tap: function(e) {
      e.preventDefault();
      if (this.IsWaiting()) return;
      switch (this.ViewOnly) {
        case true:
          this.Close();
          $("#main-transaction-blockoverlay").hide();
          break
        case false:
          if (this.ValidateSignature()) {
            this.GetSignature();
            this.trigger("SignatureAdded", this);
            this.Close();
          }
          break;
      }
      this.sketchView = false;
    },

    IsWaiting: function() {
      var _wait = this.$('#signature').hasClass('ui-disabled');
      if (_wait) navigator.notification.alert("Waiting for customer's signature", null, "Invalid Action", "OK")
      return _wait;
    },

  });

  var signatureHasChanges = false;

  var _showActivityIndicator = function() {
    var target = document.getElementById('btn-stop-asking');

    _spinner = Spinner;
    _spinner.opts.left = 10; // Left position relative to parent in px
    _spinner.opts.radius = 3;
    _spinner.opts.lines = 9;
    _spinner.opts.length = 4; // The length of each line
    _spinner.opts.width = 3; // The line thickness

    _spinner.opts.color = '#000';

    _spinner.spin(target, "Cancel");
    $("#btn-stop-asking .ui-btn-text").text("Cancel");
    //$(".btn-ask-to-sign").css("text-align", "right");
    $("#signature").addClass("ui-disabled");
  }

  var _hideActivityIndicator = function() {
    _spinner = Spinner;
    _spinner.stop();
  }

  var _revertTextBack = function() {
    $(".btn-ask-to-sign .ui-btn-text").text("Allow User To Sign");
    $(".btn-ask-to-sign").css("text-align", "center");
    _hideActivityIndicator();
    $("#signature").removeClass("ui-disabled");
  }


  return SignatureView;
});
