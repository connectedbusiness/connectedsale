define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'text!template/19.2.0/settings/payment/confirmpassword.tpl.html'
], function($, $$, _, Backbone, template) {

  var ConfirmPasswordView = Backbone.View.extend({
    _template: _.template(template),

    events: {
      "tap #confirmBtn": "ConfirmPassword_Tap",
      "tap #btn-close": "Close"
    },

    Close: function() {
      this.$el.html("");
      this.$el.hide();
      this.trigger("closed", this);
    },

    Show: function(changePassword) {
      var _buttonLabel = "Save Password";
      if (changePassword) _buttonLabel = "Change Password";
      this.render(_buttonLabel);
      this.$("#newmerchantpassword").focus();
    },

    render: function(_buttonLabel) {
      this.$el.show();
      this.$el.html(this._template({
        ButtonLabel: _buttonLabel
      }));
      this.$("#confirmPasswordContainer").trigger("create");
    },

    EncryptPassword: function(pass) {
      return Base64.encode(pass);
    },

    ConfirmPassword_Tap: function(e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      this.ValidatePassword();
    },

    ValidatePassword: function() {
      var password = this.$("#newmerchantpassword").val();
      var confirmPassword = this.$("#confirmmerchantpassword").val();
      if (password === confirmPassword) {
        password = this.EncryptPassword(password);
        this.trigger("passwordChanged", password);
        this.Close();
      } else {
        navigator.notification.alert("Make sure the passwords are identical.", null, "Password Mismatch", "OK");
        this.$("#newmerchantpassword").val("");
        this.$("#confirmmerchantpassword").val("");
        this.$("#newmerchantpassword").focus();
      }
    },

  });
  return ConfirmPasswordView;
});
