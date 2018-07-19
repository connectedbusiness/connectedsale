/**
 * @author Connected Busibess : Paulo Renz Ebron
 */

define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'shared/service',
  'shared/method',
  'collection/userroles',
  'collection/useraccounts',
  'collection/preferences',
  'model/lookupcriteria',
  'model/useraccount',
  'text!template/15.0.0/settings/user/usermaintenance/adduserform.tpl.html'
], function($, $$, _, Backbone, Global, Service, Method,
  UserRoleCollection, UserAccountCollection, PreferenceCollection,
  LookupCriteriaModel, UserAccountModel,
  template) {
  var validUserCode = false;
  var UserMaintenanceView = Backbone.View.extend({
    _template: _.template(template),

    events: {
      "click #save-btn": "saveUserTapped",
      "blur #user-code": "CheckUserCodeAvailability"
    },

    initialize: function() {
      this.render();
    },

    render: function() {
      console.log(Global.POSWorkstationID);
      this.InitializeDisplay();
      this.GenerateNewUserSchema();
      this.FetchUserRoles();
    },

    InitializeDisplay: function() {
      this.SetSelectedPage("User");
      this.$el.html(this._template());
      this.$el.trigger("create");
    },

    GenerateNewUserSchema: function() {
      var self = this;
      this.userSchemaModel = new UserAccountModel
      this.userSchemaModel.url = Global.ServiceUrl + Service.POS + Method.GETNEWUSERACCOUNTSCHEMA;
      this.userSchemaModel.fetch({
        success: function(model, response, options) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          self.SetUserAccountSchema(response);
        },
        error: function(model, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          model.RequestError(error, "Error Retrieving User Schema");
        }
      });
    },

    SetUserAccountSchema: function(schema) {
      this.dnsName = schema.DNSName;
      this.ipAddress = schema.IPAddress;
      this.countryCode = schema.CountryCode;
      this.LanguageCode = schema.LanguageCode;
      this.RoleCode = schema.RoleCode;
      //this.passwordIV = schema.UserPasswordIV;
      //this.passwordSalt = schema.UserPasswordSalt;
    },

    saveUserTapped: function(e) {
      e.preventDefault();
      if (this.IsReadyToSave()) {
        this.saveNewUser();
      }
    },

    saveNewUser: function() {
      var _self = this;
      var _userAccountModel = new UserAccountModel();
      var _rowsToSelect = 100;

      if (!this.userRoleCollection) {
        this.userRoleCollection = new UserRoleCollection();
      }

      _userAccountModel.set(_self.NewAttribute());

      _userAccountModel.on('sync', this.NewUserAdded, this);
      _userAccountModel.on('error', this.SaveFailed, this);

      _userAccountModel.url = Global.ServiceUrl + Service.POS + Method.CREATEUSERACCOUNT;
      _userAccountModel.save();
    },

    NewUserAdded: function(model, response, options) {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      if (response.ErrorMessage) {
        this.NotifyMsg(response.ErrorMessage, "Error Saving New User");
        return;
      }
      if (response.ProductRightsMessage) {
        this.NotifyMsg(response.ProductRightsMessage, "Error assigning product rights");
      }
      this.trigger("NewUserAdded", this);
    },

    FetchUserRoles: function(_criteria) {
      var _self = this;
      var _userRoleLookup = new LookupCriteriaModel();
      var _rowsToSelect = 100;

      //Initialize collection
      if (!this.userRoleCollection) {
        this.userRoleCollection = new UserRoleCollection();
      }

      _userRoleLookup.set({
        StringValue: _criteria
      })

      _userRoleLookup.on('sync', this.FetchSuccess, this);
      _userRoleLookup.on('error', this.FetchSaveError, this);

      //_userRoleLookup.url = Global.ServiceUrl + Service.POS + Method.GETCONNECTEDSALEUSERROLELOOKUP + _rowsToSelect; USERROLELOOKUP
      _userRoleLookup.url = Global.ServiceUrl + Service.POS + Method.USERROLELOOKUP + _rowsToSelect;
      _userRoleLookup.save();

    },

    FetchSuccess: function(model, response, options) {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      this.userRoleCollection.reset(response.UserRoles);
      this.PopulateUseRoleElement();
    },

    PopulateUseRoleElement: function() {
      this.index = 0;
      //console.log(this.userRoleCollection.length);
      if (this.userRoleCollection.length <= 0) {
        console.log('no user roles retrieved.');
      } else {
        $('#role-code > option[val !=""]').remove();
        this.userRoleCollection.each(this.SetRoleOptions, this);
        $("#role-code").prop("selectedIndex", this.defaultRoleIndex);
      }
    },

    SetRoleOptions: function(roleModel) {
      var _role = roleModel.get("RoleCode")
      $('#role-code').append(new Option(_role, _role));
      if (_role === "Administrator") {
        this.defaultRoleIndex = this.index;
        $('#role-code').trigger("change");
      }
      this.index++;
    },

    Save: function() {
      this.SaveCompleted();
    },

    SetSelectedPage: function(page) {
      this.selectedPage = page;
    },

    SaveCompleted: function(model, response, options) {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      this.trigger("SaveCompleted", this);
    },

    SaveFailed: function(model, xhr, options) {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      model.RequestError(xhr, "Error User Account");
    },

    NewAttribute: function() {
      var self = this;
      var _attrib = {
        UserCode: this.userCode,
        RoleCode: this.roleCode,
        UserName: this.userName,
        UserPassword: self.EncryptPassword(this.password),
        //UserPasswordIV		: this.passwordIV,
        //UserPasswordSalt	: this.passwordSalt,
        IsActive: true,
        DNSName: this.dnsName,
        IPAddress: this.ipAddress,
        CountryCode: this.countryCode,
        LanguageCode: this.LanguageCode,
        IsEncrypted: false,
        ProductEdition: "Connected Sale"
      }
      return _attrib;
    },

    IsReadyToSave: function() {
      this.GetElementValues();
      if (this.userCode === "") {
        this.NotifyMsg("User ID is required.", 'Missing Input.');
        return false;
      } else if (this.userName === "") {
        this.NotifyMsg("User Name is required.", 'Missing Input.');
        return false;
      } else if (this.password === "") {
        this.NotifyMsg("Password is required.", 'Missing Input.');
        return false;
      } else if (this.confirmPassword === "") {
        this.NotifyMsg("Please confirm password.", 'Missing Input.');
        return false;
      } else if (this.password.length < 5) {
        this.NotifyMsg("Password is too short.", 'Password Validation.');
        return false;
      } else if (this.hasWhiteSpace(this.userCode)) {
        this.NotifyMsg('User Code must not contain whitespaces.', 'Invalid Entry');
        return false;
      } else if (this.password !== this.confirmPassword) {
        this.NotifyMsg('Passwords don\'t matched', 'Invalid Password');
        return false;
      } else if (!validUserCode) {
        this.NotifyMsg("User ID Already Exist.", 'Invalid User Name');
        return false;
      }

      return true;
    },

    GetElementValues: function() {
      this.userCode = $("#user-code").val();
      this.roleCode = $("#role-code").val();
      this.userName = $("#user-name").val();
      this.password = $("#password1").val();
      this.confirmPassword = $("#confirm-password").val();
    },

    clearFields: function() {
      $("#user-code").val() = "";
      $("#role-code").val() = "";
      $("#user-name").val() = "";
      $("#password1").val() = "";
      $("#confirm-password").val() = "";
    },


    CheckUserCodeAvailability: function() {
      var _usercode = $("#user-code").val();
      var self = this;
      var tmp = new LookupCriteriaModel();
      tmp.url = Global.ServiceUrl + Service.POS + Method.VALIDATEUSERCODE;
      tmp.set({
        StringValue: _usercode
      })
      $("#btn-save").addClass('ui-disabled');
      tmp.save(null, {
        success: function(model, response, options) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          self.AssignUserCodeAvailability(response)
          self.EnableSaveButton();
        },
        error: function(model, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          model.RequestError(error, "Error Retrieving User Code");
          self.EnableSaveButton();
        }
      });
    },

    EnableSaveButton: function() {
      $("#btn-save").removeClass("ui-disabled");
    },

    AssignUserCodeAvailability: function(isAvailable) {
      validUserCode = isAvailable;
    },

    hasWhiteSpace: function(str) {
      return str.indexOf(' ') >= 0;
    },

    hasSpecialCharacters: function(str) {
      var specialChars = "<>@!#$%^&*()_+[]{}?:;|'\"\\,./~`-="
    },

    EncryptPassword: function(pass) {
      return Base64.encode(pass);
    },

    NotifyMsg: function(content, header) {
      console.log(content);
      navigator.notification.alert(content, null, header, "OK");
    }

  });

  return UserMaintenanceView;
});
