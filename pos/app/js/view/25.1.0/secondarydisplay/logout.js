/**
 * @author Connected Business
 */
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
  'text!template/25.1.0/secondarydisplay/logout.tpl.html'
], function($, $$, _, Backbone, Global, Service, Method, Shared,
  BaseModel, template) {
  var KioskLogoutView = Backbone.View.extend({
    _template: _.template(template),

    events: {
      "tap #logout-cancel": "buttonCancel_tap",
      "tap #logout-submit": "buttonSubmit_tap",
      "keyup #logout-password": "keyupSubmit"
    },

    buttonCancel_tap: function(e) {
      e.preventDefault();
      this.Close();
    },

    buttonSubmit_tap: function(e) {
      e.preventDefault();
      this.PerformAction();
    },

    keyupSubmit: function(e) {
      e.preventDefault();
      if (e.keyCode === 13) this.PerformAction();
    },

    render: function() {
      this.$el.html(this._template);
      this.Close();
      return this;
    },

    AcceptManagerOverride: function(username, password) {
      var self = this;
      var origUsername = Global.Username;
      var origPassword = Global.Password;
      var overrideModel = new OverrideModel();

      //Need to set the username and password for authentication
      Global.Username = username;
      Global.Password = password;
      overrideModel.url = Global.ServiceUrl + Service.POS + Method.MANAGEROVERRIDE + Global.POSWorkstationID + "/" + Global.OverrideMode;
      overrideModel.save(null, {
        success: function(model, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          self.AcceptManagerOverrideCompleted(model, response);
        },
        error: function(model, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          model.RequestError(error, "Error Saving Manager Override");
        }
      });

      //Reset the original username and password after manager override process
      Global.Username = origUsername;
      Global.Password = origPassword;
    },

    BackToDashboard: function() {
      window.location.hash = "dashboard";
    },

    Close: function() {
      $("#logout-password").val("");
      this.Hide();
      $("#main-transaction-blockoverlay").hide();
    },

    Hide: function() {
      this.$el.hide();
      Shared.FocusToItemScan();
    },

    IsNullOrWhiteSpace: function(str) {
      if (!str) return true;
      if (str === "" || str === null || str === undefined) return true;
      return false;
    },

    PerformAction: function() {
      var isCurrentUser = false;
      var self = this;
      var username = this.$("#logout-username").val();
      var password = this.$("#logout-password").val();
      var userRoles = [];
      var _username, _password = "";

      _username = Global.Username; //pass original username
      _password = Global.Password; //pass original password

      if (!this.IsNullOrWhiteSpace(username.toLowerCase()) && !this.IsNullOrWhiteSpace(password.toLowerCase())) { //V14
        if (username.toLowerCase() === Global.UserInfo.UserCode.toLowerCase() || Global.UserRole.length === 0) isCurrentUser = true;

        var model = new BaseModel();

        model.url = Global.ServiceUrl + Service.POS + Method.SIGNOUTWITHPERMISSION + isCurrentUser;
        _.each(Global.UserRole, function(userRole) {
          if (userRole.RoleCode.toLowerCase() != Global.UserInfo.RoleCode.toLowerCase() || !isCurrentUser) {
            userRoles.push(userRole);
          }
        });

        Global.Username = username; //pass original username
        Global.Password = password; //pass original password

        model.set({
          UserRoles: userRoles
        });
        model.save(model, {
          success: function(model, response, options) {
            if (self.IsNullOrWhiteSpace(response.ErrorMessage)) {
              self.Close();
              if (self.logoutMode === "SECONDARYDISPLAY") {
                console.log("SECONDARYDISPLAY");
                self.trigger('stop', this);
              };
            } else {
              this.$("#logout-password").val("");
              this.$("#logout-username").val("");
              if (response.ErrorMessage.indexOf("permission") > -1)
                navigator.notification.alert(response.ErrorMessage + " Please try again.", null, "User Permission", "OK");
              else navigator.notification.alert(response.ErrorMessage + " Please try again.", null, response.ErrorMessage, "OK");
              self.$("#kiosk-username").focus();
            }
          }
        });

        Global.Username = _username; //pass original username
        Global.Password = _password;
      } else {
        this.$("#logout-password").val("");
        this.$("#logout-username").val("");
        navigator.notification.alert("Missing fields, Please try again.", null, "Missing Fields", "OK");
        this.$("#logout-username").focus();
      }
    },

    ProcessLogout: function() {
      var _model = new BaseModel();
      _model.url = Global.ServiceUrl + Service.POS + Method.SIGNOUT;
      _model.save(null, {
        success: function() {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          var _url = window.location.href.split('#')[0];
          _url = _url + "#login";
          window.location.href = _url;
        },
        error: function(error) {
          navigator.notification.alert("An error occured while trying to sign out. Please try again.", null, "Error Signing Out", "OK");
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
        }
      });
    },

    SetLogoutMode: function(mode) {
      //MODES: Log Out (LOGOUT), Back to Dashboard (DASHBOARD)
      this.logoutMode = mode;
    },

    Show: function(mode) {
      this.SetLogoutMode(mode);
      this.$el.show();
      this.$("#logoutformContent").trigger('create');
      this.$("#logout-username").focus();
      $("#main-transaction-blockoverlay").show();
    }
  });
  return KioskLogoutView;
});
