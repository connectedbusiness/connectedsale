/**
 * Connected Business | 07-10-2012
 * Required: el
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'shared/shared',
  'text!template/22.12.0/pos/manageroverride/manageroverride.tpl.html',
], function($, $$, _, Backbone, Global, Shared, template) {

  var PrintOptionView = Backbone.View.extend({
    _template: _.template(template),

    events: {
      "tap .right-popover-btn": "btnDone_tap",
      "tap .left-popover-btn": "btnClose_tap",
      // "keyup .password-input" : "password_keyup"
      "keypress .password-input": "password_keypress"
    },

    render: function() {
      this.$el.html(this._template);
      this.$("#managerOverrideBody").trigger("create");
      this.$("#managerOverrideBody > div > #username-input").focus();
    },

    Close: function() {
      this.$("input").blur();
      this.Hide();
      this.trigger("CloseClicked", this);
    },

    Show: function() {
      this.render();
      this.$el.show();
      this.IsHidden = false;
      Shared.BlurItemScan();
      //this.SetFocusedField();
    },

    SetFocusedField: function() {
      //for some reason, this does not work :(
      this.$("#username-input").focus();
      //$("#username-input:text:visible:first").focus();
    },

    Hide: function() {
      this.IsHidden = true;
      this.$el.hide();
      Shared.FocusToItemScan();
    },

    ValidateFields: function() {
      var username = this.$("#username-input").val();
      var password = this.$("#password-input").val();
      if (username === null || username === "") {
        console.log("Username is required.")
        navigator.notification.alert("Username is required.", null, "Override Failed", "OK");
        return false;
      } else if (password === null || password === "") {
        console.log("Password is required.")
        navigator.notification.alert("Password is required.", null, "Override Failed", "OK");
        return false;
      }
      return true;
    },

    AcceptManagerOverride: function() {
      var username = this.$("#username-input").val();
      var password = this.$("#password-input").val();
      this.trigger("ManagerOverrideAccepted", username, password, this);
    },

    btnDone_tap: function(e) {
      if (this.IsHidden) return;
      e.preventDefault();
      if (this.ValidateFields()) {
        this.AcceptManagerOverride();
      }
    },

    btnClose_tap: function(e) {
      if (this.IsHidden) return;
      e.preventDefault();
      this.Close();
    },

    //password_keyup : function(e) {
    password_keypress: function(e) {
      if (this.IsHidden) return;
      var _password = this.$("#password-input").val();
      if (_password === "" || _password === null) return;

      if (e.keyCode === 13) {
        this.$("#password-input").blur();
        if (this.ValidateFields()) {
          this.AcceptManagerOverride();
        }
      }
    }

  });

  return PrintOptionView;
});
