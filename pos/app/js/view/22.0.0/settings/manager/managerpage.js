/**
 * @author Connected Business
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'shared/method',
  'shared/service',
  'collection/preferences',
  'collection/userroles',
  'view/23.0.0/settings/manager/administrators',
  'view/23.0.0/settings/manager/userroles',
  'view/23.0.0/settings/modal/modal',
  'text!template/23.0.0/settings/manager/managerpage.tpl.html'
], function($, $$, _, Backbone, Global, Method, Service,
  PreferenceCollection, UserRoleCollection, AdministratorsView, UserRoleView, SettingsModal, template) {
  var ManagerSettingsView = Backbone.View.extend({
    _template: _.template(template),

    events: {
      "tap .administrators-li": "administrators_tap",
      "tap .discountOverrideLevel-li": "discountOverrideLevel_tap",
      "tap .priceChangeOverrideLevel-li": "priceChangeOverrideLevel_tap",
      "tap .transactionVoidOverrideLevel-li": "transactionVoidOverrideLevel_tap",
      "tap .returnsOverrideLevel-li": "returnsOverrideLevel_tap",
      "tap .autoAllocateOverrideLevel-li": "autoAllocateOverrideLevel_tap"
    },

    initialize: function() {
      this.render();
    },

    render: function() {      
      this.FetchPreference();
    },

    InitializeDisplay: function() {
      var _model = this.preferenceCollection.at(0);
      var _administrators = "";

      for (var i = 0; i < this.userRoleCollection.length; i++) {
        var _roleCode = this.userRoleCollection.at(i).get("RoleCode");
        if (i === 0) {
          _administrators = _roleCode
        } else {
          _administrators = _administrators + ", " + _roleCode;
        }
      };

      _model.set({
        Administrators: _administrators
      });
      this.$el.html(this._template(_model.toJSON()));
      this.$("#settings-manager").trigger("create");
    },

    InitializePreferences: function() {
      if (!this.preferences) {
        this.preferences = new PreferenceCollection();
      }
    },

    InitializePreferenceCollection: function() {
      if (!this.preferenceCollection) {
        this.preferenceCollection = new PreferenceCollection();
      }
    },

    InitializeUserRoleCollection: function() {
      if (!this.userRoleCollection) {
        this.userRoleCollection = new UserRoleCollection();
      }
    },

    FetchPreference: function() {
      var self = this;
      this.InitializePreferences();
      this.InitializePreferenceCollection();
      this.InitializeUserRoleCollection();
      this.preferences.url = Global.ServiceUrl + Service.POS + Method.GETPREFERENCEBYWORKSTATION + Global.POSWorkstationID;
      this.preferences.fetch({
        success: function(collection, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          self.ResetUserRoleCollection(response.UserRoles);
          self.ResetPreferenceCollection(response.Preference);
          self.InitializeDisplay();
        },
        error: function(collection, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          collection.RequestError(error, "Error Retrieving Workstation Preference");
        }
      });
    },

    ResetUserRoleCollection: function(userRoles) {
      this.userRoleCollection.reset(userRoles);
    },

    ResetPreferenceCollection: function(preferences) {
      this.preferenceCollection.reset(preferences);
      Global.Preference = preferences;
    },

    Save: function() {      
      switch (this.selectedPage) {
        case "Administrators":
          this.UpdateAdministrators();
          break;
        case "OverrideLevel":
          this.UpdateManagerOverrides();
          break;
        default:
          this.SaveCompleted();
      }
    },

    SetSelectedPage: function(page) {
      this.selectedPage = page;
    },

    administrators_tap: function(e) {
      e.preventDefault();
      this.ShowAdministratorList();
    },

    discountOverrideLevel_tap: function(e) {
      e.preventDefault();
      this.ShowUserRoleList("Discount");
    },

    priceChangeOverrideLevel_tap: function(e) {
      e.preventDefault();
      this.ShowUserRoleList("Price");
    },

    transactionVoidOverrideLevel_tap: function(e) {
      e.preventDefault();
      this.ShowUserRoleList("Void");
    },

    returnsOverrideLevel_tap: function(e) {
      e.preventDefault();
      this.ShowUserRoleList("Return");
    },

    autoAllocateOverrideLevel_tap: function(e) {
      e.preventDefault();
      this.ShowUserRoleList("AutoAllocate");
    },

    ShowAdministratorList: function() {      
      // if (!this.administratorsView) {
      //   this.administratorsView = new AdministratorsView();
      //   this.administratorsView.on("SaveCompleted", this.SaveCompleted, this);
      // }
      // this.administratorsView.$el = this.$("#settings-manager");
      // this.administratorsView.SetSelectedAdministratorUserRoles(this.userRoleCollection);
      // this.administratorsView.SetPreferences(this.preferences);
      // this.administratorsView.Show();

      this.SetSelectedPage("Administrators");
      this.settingsModal = new SettingsModal({
        el: $("#settings-modal-container"),
        collection: this.userRoleCollection,
        preferences: this.preferences,
        preferencetype: 'Admin'        
      });
      this.settingsModal.on('ModalClose', this.Save, this);      
      this.settingsModal.administratorsView.on("SaveCompleted", this.SaveCompleted, this);
    },

    UpdateAdministrators: function() {      
      this.settingsModal.administratorsView.trigger("UpdateAdmin", this);
      // if (this.administratorsView) {
      //   this.administratorsView.UpdateUserRoleCollection();
      // }
    },

    UpdateManagerOverrides: function() {
      this.settingsModal.userRoleView.trigger("UpdateUserOverride", this);
      // if (this.userRoleView) {
      //   this.userRoleView.Save();
      // }
    },

    ShowUserRoleList: function(type) {
      
      // if (!this.userRoleView) {
      //   this.userRoleView = new UserRoleView({
      //     preferenceCollection: this.preferenceCollection,
      //     userRoleCollection: this.userRoleCollection
      //   });
      //   this.userRoleView.on("SaveCompleted", this.SaveCompleted, this);
      // }
      // this.userRoleView.$el = this.$("#settings-manager");
      // this.userRoleView.SetPreferences(this.preferences);
      // this.userRoleView.SetType(type);
      // this.userRoleView.Show();
      this.SetSelectedPage("OverrideLevel");
      this.settingsModal = new SettingsModal({
        el: $("#settings-modal-container"),
        userRoleCollection: this.userRoleCollection,
        preferenceCollection: this.preferenceCollection,
        preferences: this.preferences,
        preferencetype: 'UserRole',
        userroletype: type        
      }); 
      this.settingsModal.on('ModalClose', this.Save, this);  
      this.settingsModal.userRoleView.on("SaveCompleted", this.SaveCompleted, this);
    },

    SaveCompleted: function() {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      this.trigger("SaveCompleted", this);
    }

  });
  return ManagerSettingsView;
});
