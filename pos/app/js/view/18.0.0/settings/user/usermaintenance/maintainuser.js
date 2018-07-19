define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'shared/service',
  'shared/method',
  'shared/shared',
  'model/base',
  'model/useraccount',
  'model/lookupcriteria',
  'collection/userroles',
  'view/16.0.0/settings/user/usermaintenance/confirmpassword',
  'text!template/16.0.0/settings/user/usermaintenance/maintainuser.tpl.html'
], function($, $$, _, Backbone, Global, Service, Method, Shared, BaseModel, UserAccountModel, LookupCriteriaModel, UserRoleCollection, ConfirmPasswordView, template) {
  var _this = null;
  var MaintainUserAccountView = Backbone.View.extend({
    _template: _.template(template),

    events: {
      'tap #saveBtn ': 'Save_Tap',
      'tap #removeBtn ': 'Remove_Tap',
      'tap #password ': 'Password_Tap',
      'keydown #userName': 'TriggerHasChanged',
      'change #drpRoleCode': 'TriggerHasChanged'
    },

    TriggerHasChanged: function() {
      if (!this.allowToProceed) {
        this.allowToProceed = true;
        return;
      }
      if (this.HasChanges) return;
      this.trigger('attributeChanged');
      this.HasChanges = true;
      //console.log('has changes.')
    },

    BindToMain: function(mainView) {
      this.mainView = mainView;
    },

    Show: function() {
      this.render();
    },

    BackToUserAccounts: function() {
      this.unbind();
      this.remove();
    },

    initialize: function() {
      _this = this;
      //currentView = this;
    },

    render: function() {
      this.SetSelectedPage("User");
      this.$el.html(this._template(this.model.toJSON()));
      this.$el.trigger("create");
      $("#back-general").show();
      this.InitializeUserRole();
      this.changeModalSize();
      //$("#settings-user-container").remove();
      //$("#back-general").show();
    },

    InitailizeChildViews: function() {
      //this.$("#maintanUserAccount").hide();
      //this.InitializeUserRole();
    },

    SetSelectedPage: function(page) {
      this.selectedPage = page;
    },

    InitializeUserAccount: function() {
      this.$("#userID").val(this.model.get("UserCode"));
      this.$("#userName").val(this.model.get("UserName"));
    },

    InitializeUserRole: function() {
      var userRoleLookUp = new LookupCriteriaModel();
      var _rowsToSelect = 100;

      userRoleLookUp.on('sync', this.LoadUserRoleSuccess, this);
      userRoleLookUp.on('error', this.LoadUserRoleFailed, this);

      //userRoleLookUp.url = Global.ServiceUrl + Service.POS + Method.GETCONNECTEDSALEUSERROLELOOKUP + _rowsToSelect;
      userRoleLookUp.url = Global.ServiceUrl + Service.POS + Method.USERROLELOOKUP + _rowsToSelect;
      userRoleLookUp.save();
    },

    LoadUserRoleSuccess: function(model, response) {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      if (model.get("ErrorMessage")) {
        navigator.notification.alert(response.ErrorMessage, null, "Saving Error", "OK");
        return;
      }
      if (!this.userRoleCollection) this.userRoleCollection = new UserRoleCollection();
      this.userRoleCollection.reset(response.UserRoles);
      this.LoadUserRoles();
    },

    LoadUserRoleFailed: function(model, error, response) {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      navigator.notification.alert("An error was encounter when trying to load user role!", null, "Saving Error", "OK");
    },

    LoadUserRoles: function() {
      $('#drpRoleCode > option[val !=""]').remove();
      var self = this;
      if (this.userRoleCollection.length > 0) {
        this.userRoleCollection.each(function(model) {
          var _roleCode = model.get("RoleCode");
          //console.log(_roleCode);
          self.$("#drpRoleCode").append(new Option(_roleCode, _roleCode));
        });
        this.allowToProceed = false;
        $("#drpRoleCode").val(this.model.get("RoleCode")).trigger("change");
      }
    },

    Password_Tap: function(e) {
      e.preventDefault();
      //$('#confirm-password-div').html("");
      $('#confirmPasswordContainer').html("");
      var confirmPasswordView = new ConfirmPasswordView({
        //el : $('#confirm-password-div')
        el: $('#confirmPasswordContainer')
      })
      confirmPasswordView.on('passwordChanged', this.ChangePassword, this);
      //this.confirmPasswordView.$el = $('#confirm-password-div');
      confirmPasswordView.model = this.model;
      confirmPasswordView.Show();
      confirmPasswordView.InitailizeChildViews();

    },

    ChangePassword: function(password) {
      var _newPassword = password;
      //console.log("new pass :" + password);
      this.passWord = _newPassword;
      this.trigger('attributeChanged');
    },

    Save_Tap: function(e) {    
      e.preventDefault();
      //if(!Global.IsAtionTap || Global.IsAtionTap == false){
      this.ValidateFields();
      Global.IsAtionTap = true;
      //}

    },

    IsNullOrWhiteSpace: function(str) {
      if (!str) {
        return true;
      }
      if (str === "" || str === null || str === undefined) {
        return true;
      }
      return false;
    },

    SetUserAccountFields: function() {
      this.userName = this.$("#userName").val();
      this.userCode = this.model.get("UserCode");
      this.roleCode = this.$("#drpRoleCode").val();
      this.confirmPassword = this.$("#confirm-password").val();
      this.dnsName = this.model.get("DNSName");
      this.ipAddress = this.model.get("IPAddress");
      this.countryCode = this.model.get("CountryCode");
      this.LanguageCode = this.model.get("LanguageCode");
      this.passwordIV = this.model.get("UserPasswordIV");
      this.passwordSalt = this.model.get("UserPasswordSalt");
      this.currentPassword = this.model.get("UserPassword");
      this.WebSiteCode = this.model.get("WebSiteCode");
      //this.passWord = this.$("#password").val();
    },

    ValidateFields: function() {
      this.SetUserAccountFields();
      if (this.IsNullOrWhiteSpace(this.userCode) === true) {
        navigator.notification.alert("Please input User Name.", null, "User Name is Required.", "OK");
        return;
      } else if (this.IsNullOrWhiteSpace(this.roleCode) === true) {
        navigator.notification.alert("Please select Type.", null, "Type is Required.", "OK");
        return;
      }
      navigator.notification.confirm("Are you sure want to Update this User Account?", this.doCheckIfLoggedIn, "Confirmation", ['Yes', 'No']);
    },

    SetParameters: function() {
      return parameters;
    },

    IsUserLoggedIn: function() {
      this.SetUserAccountFields();
      var self = this;
      var mdl = new BaseModel();
      mdl.url = Global.ServiceUrl + Service.POS + Method.CHECKUSERLOGGEDIN;
      mdl.set({
        UserCode: this.userCode
      });
      mdl.save(null, {
        success: function(model, response, options) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          self.CheckIfLoggedIn(response);
        }
      })
    },

    CheckIfLoggedIn: function(loggedIn) {

      if (loggedIn) this.WarnUser();
      else this.SaveUserAccount();
    },



    WarnUser: function() {
      navigator.notification.confirm("This account is currently logged in on other location. Do you still want to update this account?", this.doUpdate, "Confirmation", ['Yes', 'No']);
    },

    SaveUserAccount: function() {      
      var self = this;
      this.SetUserAccountFields();
      jsonPassEncr = this.SetPasswordAndEncrypted(this.passWord);
      if (!this.updateUserAccount) this.updateUserAccount = new UserAccountModel();
      this.isActive = true;

      this.updateUserAccount.set({
        WebSiteCode: this.WebSiteCode,
        UserName: this.userName,
        UserPassword: jsonPassEncr.UserPassword,
        UserPasswordIV: this.passwordIV,
        UserPasswordSalt: this.passwordSalt,
        UserCode: this.userCode,
        RoleCode: this.roleCode,
        IsActive: true,
        DNSName: this.dnsName,
        IPAddress: this.ipAddress,
        CountryCode: this.countryCode,
        LanguageCode: this.LanguageCode,
        IsEncrypted: jsonPassEncr.IsEncrypted
      });
      var self = this;
      if (this.updateUserAccount != null) {
        this.updateUserAccount.url = Global.ServiceUrl + Service.POS + Method.UPDTEUSERACCOUNT;
        this.updateUserAccount.save(null, {
          success: function(model, response, options) {
            if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
            self.UpdateCompleted(response)
          }
        });
        this.updateUserAccount = null;
      }

    },

    doCheckIfLoggedIn: function(button) {
      if (button === 1) {
        _this.IsUserLoggedIn();
      }
    },

    doUpdate: function(button) {
      if (button === 1) {
        _this.SaveUserAccount();
      }
    },

    doRemove: function(button) {
      if (button === 1) {
        _this.RemoveUserAccount();
        return;
      } else {
        return;
      }
    },


    UpdateCompleted: function(response) {      
      if (!this.IsNullOrWhiteSpace(response.ErrorMessage)) {
        navigator.notification.alert(response.ErrorMessage, null, "Saving Failed", "OK");
        Global.IsAtionTap = false;
      } else {
        //console.log(" response.UserCode "+ response.UserCode + " != Global.Username "+ Global.Username);
        if ((response.UserCode).toLowerCase() == Global.Username.toLowerCase()) {
          //console.log("!this.IsNullOrWhiteSpace(this.passWord) : not "+ this.IsNullOrWhiteSpace(this.passWord));
          //console.log(" Global.Password "+ Global.Password + " != this.passWord "+ this.passWord);
          Global.UserInfo.RoleCode = response.RoleCode;
          if (!this.IsNullOrWhiteSpace(this.passWord) && Global.Password !== this.passWord) {
            Global.Password = this.passWord;
            this.passWord = null;
            var _self = this;
            Shared.ShowNotification("Saving Successful.", false, null, true);
            navigator.notification.alert("New password has been saved. You will need to relogin your account.", _self.ProcessLogout, "Account Updated", "OK", true);
          } else {
            Shared.ShowNotification("Saving Successful.", false, null, true);
            //navigator.notification.alert("Saving Successful", null, "Successful" ,"OK");
            this.passWord = null;
            this.trigger("userUpdated", this);
          }
        } else {
          Shared.ShowNotification("Saving Successful.", false, null, true);
          //navigator.notification.alert("Saving Successful", null, "Successful" ,"OK");
          this.passWord = null;
          this.trigger("userUpdated", this);
        }

        //Global.IsAtionTap = false;
        //this.Close();
      }
    },

    ProcessLogout: function() {
      //this.ShowActivityIndicator();
      $("<h5>Logging Out...</h5>").appendTo($("#spin"));
      var _model = new BaseModel();
      _model.url = Global.ServiceUrl + Service.POS + Method.SIGNOUT;
      _model.save(null, {
        wait: true,
        success: function() {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          var _url = window.location.href.split('#')[0];
          _url = _url + "#login";
          window.location.href = _url;
          //_self.HideActivityIndicator();
        },
        error: function(model, error, response) {
          //_self.HideActivityIndicator();
          model.RequestError(error, "Error Logging out.");
        }
      });
    },

    EncryptPassword: function(pass) {
      return Base64.encode(pass);
    },

    Remove_Tap: function(e) {
      e.preventDefault();
      this.SetUserAccountFields();
      //if(!Global.IsAtionTap || Global.IsAtionTap == false){
      Global.IsAtionTap = true;
      if (!this.CheckIfAllowedToDelete()) return;
      navigator.notification.confirm("Are you sure want to Remove this User Account?", this.doRemove, "Confirmation", ['Yes', 'No']);
      //}

    },

    CheckIfAllowedToDelete: function() {
      var _userCode = this.userCode;
      if (_userCode === "admin") {
        this.NotifyMsg("Cannot delete this user account.", "Unable to delete");
      } else if (Global.Username === _userCode) {
        this.NotifyMsg("This user account is currently logged in. Unable to delete.", "Unable to delete");
      } else {
        return true;
      }
      return false;

    },

    SetPasswordAndEncrypted: function() {
      var password, isEncrypted = false;
      if (this.IsNullOrWhiteSpace(this.passWord) === false) {
        password = this.passWord;
        password = this.EncryptPassword(password);
        isEncrypted = false
      } else {
        password = this.currentPassword;
        isEncrypted = true
      }
      //returns json;
      return {
        UserPassword: password,
        IsEncrypted: isEncrypted
      }
    },


    RemoveUserAccount: function() {
      var self = this,
        jsonPassEncr = {};
      this.SetUserAccountFields();
      jsonPassEncr = this.SetPasswordAndEncrypted(this.passWord);

      removeUserAccount = new UserAccountModel();
      this.isActive = false;

      removeUserAccount.set({
        UserName: this.userName,
        UserPassword: jsonPassEncr.UserPassword,
        UserPasswordIV: this.passwordIV,
        UserPasswordSalt: this.passwordSalt,
        UserCode: this.userCode,
        RoleCode: this.roleCode,
        IsActive: false,
        DNSName: this.dnsName,
        IPAddress: this.ipAddress,
        CountryCode: this.countryCode,
        LanguageCode: this.LanguageCode,
        IsEncrypted: jsonPassEncr.IsEncrypted,
        WebSiteCode: this.WebSiteCode,
      });

      removeUserAccount.url = Global.ServiceUrl + Service.POS + Method.DELETEUSERACCOUNT;
      removeUserAccount.on('sync', this.RemoveCompleted, this);
      removeUserAccount.on('error', this.RemoveFailed, this);
      removeUserAccount.save();
    },

    RemoveCompleted: function(model, response, options) {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      if (response) {
        navigator.notification.alert('Unable to Remove Account. ' + response.ErrorMessage, null, "Remove Failed");
      } else {
        Shared.ShowNotification("User Account Successfully Removed.", false, null, true);
        //navigator.notification.alert("User Account Successfully Removed", null, "Successful" ,"OK");
        this.trigger('userDeleted');
      }

    },

    RemoveFailed: function(model, error, response) {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      navigator.notification.alert("An error was encountered during deletion of user account!", null, "Deleting Error", "OK");
    },

    Close: function() {
      this.mainView.InitializeUserSettings();
      this.unbind();
    },

    NotifyMsg: function(content, header) {
      console.log(content);
      navigator.notification.alert(content, null, header, "OK");
    },

    changeModalSize: function(){        
      $("#settings-modal-container").addClass("settings-modal-userMaintenance-template");
      $("#settings-modal").css("width", "auto");
      $("#settings-modal").css("min-height", "410px");     
    }

  });
  return MaintainUserAccountView;
});
