define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'shared/service',
  'shared/method',
  'shared/shared',
  'model/useraccount',
  'collection/userroles',
  'text!template/15.0.0/settings/user/usermaintenance/confirmpassword.tpl.html'
], function($, $$, _, Backbone, Global, Service, Method, Shared, UserAccountModel, UserAccountCollection, template) {


  var MaintainUserAccountView = Backbone.View.extend({
    _template: _.template(template),

    events: {
      'tap #confirmBtn': 'ConfirmPassword_Tap',
      'tap #btn-done ': 'Close'
    },


    initialize: function() {

    },

    Close: function() {
      $("#confirmPasswordContainer").removeClass("confirmPasswordContainer");
      this.$el.html("");
      this.$el.hide();
      $("#settings-blockoverlay").hide();
    },

    Show: function() {
      $("#settings-blockoverlay").show();
      this.render();
    },

    render: function() {
      this.$el.show();
      this.$el.html(this._template(this.model.toJSON()));
    },

    InitailizeChildViews: function() {
      $("#confirmPasswordContainer").addClass("confirmPasswordContainer");
      $("#confirmPasswordContainer").trigger("create");
    },

    SetCurrentUserAccountFields: function() {
      this.userName = this.model.get("UserName");
      this.userCode = this.model.get("UserCode");
      this.roleCode = this.model.get("RoleCode");
      this.passwordIV = this.model.get("UserPasswordIV");
      this.passwordSalt = this.model.get("UserPasswordSalt");
      this.currentPassword = this.model.get("UserPassword");
      this.password = this.$("#current-password").val();
    },

    EncryptPassword: function(pass) {
      return Base64.encode(pass);
    },

    ConfirmPassword_Tap: function(e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      //if(!Global.IsConfirmTap || Global.IsConfirmTap === false){
      var currentPassword = $("#current-password").val();
      if (this.IsNullOrWhiteSpace(currentPassword) === true) {
        navigator.notification.alert("Please input Current Password.", null, "Required", "OK");
      } else {
        this.ValidateCurrentPassword();
      }
      //}
    },

    ValidateCurrentPassword: function() {
      var self = this;
      this.SetCurrentUserAccountFields();
      if (!this.userAccountModel) this.userAccountModel = new UserAccountModel();
      this.userAccountModel.set({
        UserName: this.userName,
        UserPassword: this.password,
        UserPasswordIV: this.passwordIV,
        UserPasswordSalt: this.passwordSalt,
        UserCode: this.userCode,
        RoleCode: this.roleCode,
        IsActive: true
      })
      this.userAccountModel.url = Global.ServiceUrl + Service.POS + Method.VALIDATECURRENTPASSWORD;
      this.userAccountModel.save(null, {
        success: function(model, response) {
          self.CheckEncryptedPassword(response);
        }
      });
    },

    CheckEncryptedPassword: function(response) {
      if (response === true) {
        this.ValidatePassword();
      } else {
        navigator.notification.alert("Current Password is Invalid.", null, "Error", "OK");
        $("#current-password").val('');
      }
    },

    IsNullOrWhiteSpace: function(str) {
      if (str === "" || str === null || str === undefined) {
        return true;
      }
      return false;
    },

    ValidatePassword: function() {
      var password = this.$("#cp-password").val();
      var confirmPassword = this.$("#confirm-password").val();

      if (this.IsNullOrWhiteSpace(password)) {
        navigator.notification.alert("Please input password.", null, "Required", "OK");
      } else if (password.length < 5) {
        navigator.notification.alert("Password is too short.", null, "Password Validation", "OK");
        this.$("#cp-password").val('');
        this.$("#confirm-password").val('');
      } else if (this.IsNullOrWhiteSpace(confirmPassword)) {
        navigator.notification.alert("Please input confirm password.", null, "Required", "OK");
      } else if (password === confirmPassword) {
        Shared.ShowNotification("Password has been changed.", false, null, true);
        this.newPassword = password;
        this.trigger('passwordChanged', password);
        this.Close();
      } else {
        navigator.notification.alert("Password did not match.", null, "Error", "OK");
        this.$("#cp-password").val('');
        this.$("#confirm-password").val('');
        this.$("#cp-password").focus();
      }
    }

  });
  return MaintainUserAccountView;
});
