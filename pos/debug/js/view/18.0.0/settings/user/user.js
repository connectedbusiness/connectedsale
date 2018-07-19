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
  'shared/shared',
  'collection/useraccounts',
  'model/lookupcriteria',
  'model/useraccount',
  'view/16.0.0/settings/user/userlist/userlist',
  'view/16.0.0/settings/user/usermaintenance/adduser',
  'view/16.0.0/settings/user/usermaintenance/maintainuser',
  'view/16.0.0/settings/modal/modal',
  'text!template/16.0.0/settings/user/user.tpl.html'
], function($, $$, _, Backbone, Global, Service, Method, Shared,
  UserAccountCollection,
  LookupCriteriaModel, UserAccountModel,
  UserListPreference, AddUserView, UserMaintenanceView, SettingsModal,
  template) {

  var UserSettingsView = Backbone.View.extend({
    _template: _.template(template),

    render: function() {
      this.InitializeDisplay();
      this.FetchUserAccounts("");
    },

    InitializeDisplay: function() {
      this.SetSelectedPage("User");
      this.$el.html(this._template());
      this.$el.trigger("create");
      // this.myScroll = new iScroll('right-pane-content');
      // $('#back-general').hide();
      this.EditMode = false;
      this.AddMode = false;
      this.HasChanges = false;
    },

    FetchUserAccounts: function(_criteria) {
      var _self = this;
      var _userRoleLookup = new LookupCriteriaModel();
      var _rowsToSelect = 100;

      //Initialize collection
      if (!this.userAccountCollection) {
        this.userAccountCollection = new UserAccountCollection();
        this.userAccountCollection.on("selected", this.GetItemSelected, this);
      }

      _userRoleLookup.set({
        StringValue: _criteria,
        ProductEdition: Global.ProductType,
      })

      _userRoleLookup.on('sync', this.ResetUserAccountCollection, this);
      _userRoleLookup.on('error', this.FetchSaveError, this);

      _userRoleLookup.url = Global.ServiceUrl + Service.POS + Method.USERACCOUNTLOOKUP + _rowsToSelect;
      _userRoleLookup.save();

    },

    FetchSaveError: function(model, xhr, options) {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      model.RequestError(xhr, "Error Fetching User Accounts");
    },

    InitializeUserListView: function() {
      this.userListView = new UserListPreference({
        el: this.$el,
        collection: this.userAccountCollection
      });
    },

    InitializeUserMaintenanceView: function() {
      // this.EditMode = true;

      // if (!this.maintainUserView) {
      //   this.maintainUserView = new UserMaintenanceView({
      //     el: $("#right-pane-content"),
      //   });
      //   this.maintainUserView.on('userUpdated', this.ResetDisplay, this);
      //   this.maintainUserView.on('userDeleted', this.ResetDisplay, this);
      //   this.maintainUserView.on('attributeChanged', this.SetHasChanged, this);
      //   // this.maintainUserView.InitailizeChildViews();
      //   // this.maintainUserView.BindToMain(this.mainView);
      // }
      // Shared.FixRightPanelPadding();
      // this.maintainUserView.HasChanges = false;
      // this.maintainUserView.model = this.model;
      // this.maintainUserView.Show();
      // this.maintainUserView.InitailizeChildViews();
      // //this.maintainUserView.BindToMain(this.mainView);
      this.settingsModal = new SettingsModal({
        el: $("#settings-modal-container"),
        model: this.model,
        preferencetype: "UserMaintenance",
        general: this
      });
      this.settingsModal.on('ModalClose', this.RemoveClassOnModal, this);
      this.settingsModal.maintainUserView.on('userUpdated', this.ResetDisplay, this);
      this.settingsModal.maintainUserView.on('userDeleted', this.ResetDisplay, this);
      this.settingsModal.maintainUserView.on('attributeChanged', this.SetHasChanged, this);      
    },

    RemoveClassOnModal: function(){        
      $("#settings-modal-container").removeClass("settings-modal-userMaintenance-template");
    },


    CloseModal: function(){
      if (this.settingsModal != null){
            this.settingsModal.close();
          }
    },

    SetHasChanged: function() {
      this.HasChanges = true;
    },

    InitializeAddUserView: function() {
      this.AddMode = true;
      this.HasChanges = true;
      Shared.FixRightPanelPadding();

      // if (!this.addUserView) {
      //   this.addUserView = new AddUserView({
      //     el: this.$el,
      //   });
      //   this.addUserView.on('NewUserAdded', this.ResetDisplay, this);
      // } else {
      //   this.addUserView.render();
      // }
       this.settingsModal = new SettingsModal({
        el: $("#settings-modal-container"),
        model: this.model,
        preferencetype: "UserAdd"        
      });
       this.settingsModal.addUserView.on('NewUserAdded', this.ResetDisplay, this);

    },

    ResetUserAccountCollection: function(model, response, options) {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      if (response.ErrorMessage) {
        this.NotifyMsg(response.ErrorMessage, 'Error Retrieving User Accounts');
        return;
      }

      this.userAccountCollection.reset(response.UserAccounts);

      this.InitializeUserListView();
      if (this.userAccountCollection.length === 0) {
        this.NotifyMsg("No user record found!", 'No Record.');
        return;
      }
      /* else { // User Role Filtering Removed. : 10.29.13 : CSL - 7273

                //BEGIN - CHECK IF USER ACCNTS AND ROLES
	                if(Global._UserIsCS){
	                    var toDelete = new Array();
	                    this.userAccountCollection.each(function(model){
	                        var _user = model.get("UserCode");
	                        if(!Global.IsAllowedUser(_user)) toDelete[toDelete.length] = model;
	                    });
	                    for(var i = 0; i < toDelete.length; i++){
	                        this.userAccountCollection.remove(toDelete[i]);
	                    }
	                }
                //END

            	}
            */

    },

    ReinitiazeUserView: function() {

    },

    ResetDisplay: function() {      
      this.InitializeDisplay();
      this.FetchUserAccounts("");
      this.CloseModal();
    },

    Save: function() {
      this.SaveCompleted();
    },

    initialize: function() {
      this.on('addNewUserView', this.InitializeAddUserView, this)
      this.on('searchUser', this.FetchUserAccounts, this);
      this.render();
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
      model.RequestError(xhr, "Error Saving Workstation Preference");
    },

    RemoveSearchTemplate: function() {
      $("#search-user").remove();
      $("#back-general").hide();
    },

    NotifyMsg: function(content, header) {
      console.log(content);
      navigator.notification.alert(content, null, header, "OK");
    },

    GetItemSelected: function(model) {
      if (!this.model) this.model = new UserAccountModel();
      this.model.set(model.attributes);
      // this.userListView.RemoveSearchContainer();
      this.InitializeUserMaintenanceView();
    },






  });
  return UserSettingsView;
});
