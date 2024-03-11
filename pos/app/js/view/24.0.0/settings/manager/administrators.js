/**
 * Connected Business | 07-09-2012
 * Required: el
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'shared/service',
  'shared/method',
  'model/userrole',
  'model/lookupcriteria',
  'collection/userroles',
  'view/24.0.0/settings/manager/administrator',
  'text!template/24.0.0/settings/manager/administrators.tpl.html'
], function($, $$, _, Backbone, Global, Service, Method,
  UserRoleModel, LookupCriteriaModel, UserRoleCollection, AdministratorView, template) {

  var AdministratorsView = Backbone.View.extend({
    _template: _.template(template),

    render: function() {
      $("#back-general").show();
      this.$el.html(this._template);
      this.on("UpdateAdmin", this.UpdateUserRoleCollection, this);
    },

    CreateChild: function(userRole) {
      var _administratorView = new AdministratorView({
        model: userRole
      });
      _administratorView.on("Selected", this.ToggleCheckbox);
      this.$("#administrator-fieldset").append(_administratorView.render().el);
    },

    Show: function() {
      this.render();
      this.FetchData();
    },

    SetPreferences: function(preferences) {
      //this is the collection that holds the entire POSPreferenceGroup
      this.preferences = preferences
    },

    FetchData: function() {
      var _self = this;
      var _userRoleLookup = new LookupCriteriaModel();
      var _rowsToSelect = 100;
      var _criteria = "";

      //Initialize collection
      if (!this.userRoleCollection) {
        this.userRoleCollection = new UserRoleCollection();
      }

      _userRoleLookup.set({
        StringValue: _criteria
      })

      _userRoleLookup.url = Global.ServiceUrl + Service.POS + Method.USERROLELOOKUP + _rowsToSelect;
      _userRoleLookup.save(null, {
        success: function(model, response) {
          _self.FetchDataCompleted(response.UserRoles);
        },
        error: function(model, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          model.RequestError(error, "Error Retrieving User Roles");
        }
      });
    },

    FetchDataCompleted: function(userRoles) {      
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      this.userRoleCollection.reset(userRoles);
      this.UpdateSelected();
        

      this.userRoleCollection.each(function(userRole) {
            var roleCode = userRole.get("RoleCode").replace(/[^A-Z0-9]+/ig,"");
            userRole.set({
            EditedRoleCode: roleCode
           });
        this.CreateChild(userRole);
        this.ToggleCheckbox(userRole.get("Selected"), roleCode)
      }, this);
      this.$(".administrator-list").trigger("create");
      this.ToggleFields();
    },

    SetSelectedAdministratorUserRoles: function(userRoles) {
      this.selectedAdministratorUserRoles = userRoles;
    },

    ToggleCheckbox: function(chkState, elementID){            
      if (!chkState){
        $("#" + elementID).find(".settings-manager-checkbox").addClass("icon-circle-blank").css("color","#DADADA");
        $("#" + elementID).find(".settings-manager-checkbox").removeClass("icon-ok-sign");
      }else{
        $("#" + elementID).find(".settings-manager-checkbox").addClass("icon-ok-sign").css("color","");
        $("#" + elementID).find(".settings-manager-checkbox").removeClass("icon-circle-blank");      
      }       
    },

    Selected: function(isSelected, roleCode){
      var self = this;
      this.ToggleCheckbox(isSelected, roleCode);
    },

    ToggleFields: function() {      
      var self = this;
      for (var i = 0, j = self.selectedAdministratorUserRoles.length; i < j; i++) {
        var _roleCode = self.selectedAdministratorUserRoles.at(i).get("RoleCode");
        var _newRoleCode = _roleCode.replace(/[^A-Z0-9]+/ig,"");
        var _elementID = "#" + _newRoleCode;
        // $(_elementID).prop("checked", true).checkboxradio("refresh");        

        //FIGUEROA JAN-19-2013 //Prevent user from unchecking own record.
        if (_roleCode == Global.UserInfo.RoleCode || self.HasOverrideLevel(_roleCode) === true) $(_elementID).parent().addClass('ui-disabled');
      };
    },

    HasOverrideLevel: function(roleCode) { //jj  check if the user role has manager override level
      var _autoAllocate = Global.Preference.AutoAllocateOverrideLevel;
      var _discount = Global.Preference.DiscountOverrideLevel;
      var _priceChange = Global.Preference.PriceChangeOverrideLevel;
      var _return = Global.Preference.ReturnsOverrideLevel;
      var _void = Global.Preference.TransactionVoidOverrideLevel;

      if (_autoAllocate === roleCode || _discount === roleCode || _priceChange === roleCode || _return === roleCode || _void === roleCode) {
        return true;
      }
      return false;
    },
    UpdateSelected: function() {
      for (var i = 0, j = this.userRoleCollection.length; i < j; i++) {
        var _userRoleModel = this.userRoleCollection.at(i);

        var _selectedAdministratorUserRoleModel = this.selectedAdministratorUserRoles.find(function(userRoleItem) {
          return userRoleItem.get("RoleCode") === _userRoleModel.get("RoleCode");
        });

        var _selected = _selectedAdministratorUserRoleModel != null;
        _userRoleModel.set({
          Selected: _selected
        });
      };
    },

    UpdateUserRoleCollection: function() {          
      var _selectedUserRoles = this.userRoleCollection.where({
        Selected: true
      });
      this.userRoleCollection.reset(_selectedUserRoles);
      this.Save();
    },

    Save: function() {
      if (!this.userRoleCollection || !this.preferences || this.preferences.length === 0) {
        return;
      } else {
        var _self = this;
        var _preferenceModel = this.preferences.at(0)
        _preferenceModel.set({
          UserRoles: this.userRoleCollection
        })
        _preferenceModel.url = Global.ServiceUrl + Service.POS + Method.UPDATEPREFERENCE;
        _preferenceModel.save(null, {
          success: function(model, response) {
            _self.SaveCompleted()
          },
          error: function(model, error, response) {
            model.RequestError(error, "Error Saving Manager Preference");
          }
        });
      }
    },

    SaveCompleted: function() {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      this.trigger("SaveCompleted", this);
    },

  });
  return AdministratorsView;
});
