/**
 * Connected Business | 07-03-2012
 * Required: el
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'text!template/25.0.0/pos/print/printoptions.tpl.html',
], function($, $$, _, Backbone, Global, template) {

  var PrintOptionView = Backbone.View.extend({
    _template: _.template(template),

    events: {
      "tap .print-no-btn": "btnNo_tap",
      "tap .print-yes-btn": "btnYes_tap",
      "change input:checkbox": "checkbox_change",
      "keyup #emailaddress-input": "inputEmailAddress_keyup",
    },

    initialize: function() {
      this.render();
    },

    render: function() {
      this.$el.html(this._template({
        CustomerEmail: this.GetEmailAddress()
      }));
      this.ToggleFields();
      this.EnableDisableControls();
      this.$("#printOptionsBody").trigger("create");
    },

    Close: function() {
      this.Hide();
      $("#main-transaction-blockoverlay").hide();
    },

    Show: function() {
      this.render();
      this.$el.show();
    },

    Hide: function() {
      this.$el.hide();
    },

    btnNo_tap: function(e) {
      e.preventDefault();
      this.RejectPrintOptions();
    },

    btnYes_tap: function(e) {
      e.preventDefault();
      this.AcceptPrintOptions();
    },

    GetEmailAddress: function() {
      if (this.TransactionToPrint != null) {
        return this.TransactionToPrint.get("DefaultContactEmail") || "";
      } else {

        return (Global.DefaultContactEmail || "");

        /* //Original Code
                if(Global.CurrentCustomer){
                    if(Global.CurrentCustomer instanceof Array){
                        return Global.CurrentCustomer[0].Email;
                    } else {
                        return Global.CurrentCustomer.Email;
                    }
                }
				return "";
                */
      }
    },

    AcceptPrintOptions: function() {
      this.SetPrintOptions();
      this.trigger("PrintReceipt", this.TransactionToPrint, true, this);
    },

    RejectPrintOptions: function() {
      Global.PreviousReprintValue = false;
      this.trigger("PrintReceipt", this.TransactionToPrint, false, this);
    },

    checkbox_change: function() {
      this.EnableDisableControls();
    },

    inputEmailAddress_keyup: function(e) {
      if (e.keyCode === 13) {
        this.$("#emailaddress-input").blur();
        this.AcceptPrintOptions();
      }
    },

    SetPrintOptions: function() {

      Global.PrintOptions.PrintReceipt = document.getElementById("print-checkbox").checked;
      Global.PrintOptions.SilentPrint = document.getElementById("silent-checkbox").checked;
      Global.PrintOptions.EmailReceipt = document.getElementById("email-checkbox").checked;

      //GEMINI : CSL-5609  (BUG #2) APR-18-2013
      Global.PrintOptions.EmailAddress = "";
      if (Global.PrintOptions.EmailReceipt) Global.PrintOptions.EmailAddress = this.$("#emailaddress-input").val();

    },

    SetTransactionToPrint: function(transaction) {
      this.TransactionToPrint = transaction;
    },

    ToggleFields: function() {
      document.getElementById("print-checkbox").checked = true;
      document.getElementById("silent-checkbox").checked = Global.Preference.AutoPrintReceipt;
      document.getElementById("email-checkbox").checked = Global.Preference.AutoEmailReceipt
    },

    EnableDisableControls: function() {
      var _checked = document.getElementById("print-checkbox").checked;
      switch (_checked) {
        case true:
          this.$("#silent-checkbox").removeAttr("disabled");
          break;
        case false:
          document.getElementById("silent-checkbox").checked = false;
          this.$("#silent-checkbox").attr("disabled", "disabled");
          break;
      }

      _checked = document.getElementById("email-checkbox").checked;
      switch (_checked) {
        case true:
          this.$("#emailaddress-input").removeAttr("readonly");
          break;
        case false:
          this.$("#emailaddress-input").attr("readonly", "readonly");
          break;
      }
    }

  });

  return PrintOptionView;
});
