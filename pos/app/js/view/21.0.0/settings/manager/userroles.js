/**
 * Connected Business | 07-09-2012
 * Required: el, collection
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
  'collection/userroles',
  'view/19.2.0/settings/manager/userrole',
  'text!template/19.2.0/settings/manager/userroles.tpl.html'
], function($, $$, _, Backbone, Global, Service, Method,
  UserRoleModel, UserRoleCollection, UserRoleView, template) {

  var UserRolesView = Backbone.View.extend({
    _template: _.template(template),

    initialize: function() {
      this.preferenceCollection = this.options.preferenceCollection;
      this.userRoleCollection = this.options.userRoleCollection;
      this.on("UpdateUserOverride", this.Save, this);
    },

    render: function() {
      $("#back-general").show();
      this.$el.html(this._template);
    },

    CreateChild: function(userRole) {
      var _userRoleView = new UserRoleView({
        model: userRole
      });
      this.$(".userRoles-fieldset").append(_userRoleView.render().el);
      _userRoleView.on("Selected", this.UserRoleSelected, this);
    },

    CreateChildren: function() {
      this.AddNoneOption();
      this.userRoleCollection.each(function(userRole) {
        this.CreateChild(userRole);
      }, this);
      this.$(".userRole-list").trigger("create");
    },

    Show: function() {      
      this.render();
      this.CreateChildren();
      this.ToggleFields();
    },

    SetPreferences: function(preferences) {
      //this is the collection that holds the entire POSPreferenceGroup
      this.preferences = preferences
    },

    SetType: function(type) {
      this.Type = type;
    },

    AddNoneOption: function() {
      //add NONE Option
    if (!_.find(this.userRoleCollection.models, function(model) {return model.attributes.RoleCode == 'None'})){
      var _newModel = new UserRoleModel();
        _newModel.set({
          RoleCode: "None"
        })        
        this.userRoleCollection.add(_newModel);
    }},

    ToggleFields: function() {
      var _userRole = "";
      switch (this.Type) {
        case "Discount":
          _userRole = this.preferenceCollection.at(0).get("DiscountOverrideLevel");
          break;
        case "Price":
          _userRole = this.preferenceCollection.at(0).get("PriceChangeOverrideLevel");
          break;
        case "Void":
          _userRole = this.preferenceCollection.at(0).get("TransactionVoidOverrideLevel");
          break;
        case "Return":
          _userRole = this.preferenceCollection.at(0).get("ReturnsOverrideLevel");
          break;
        case "AutoAllocate":
          _userRole = this.preferenceCollection.at(0).get("AutoAllocateOverrideLevel");
          break;
      }

      if (_userRole === "" || _userRole === null) {
        _userRole = "None"
      }

      this.selectedRoleCode = _userRole;
      var _elementID = "#" + _userRole;
      this.$(_elementID).prop("checked", true).checkboxradio("refresh");
    },

    Save: function() {
      this.UpdatePreference();
      if (!this.preferenceCollection || this.preferenceCollection.length === 0 || !this.preferences || this.preferences.length === 0) {
        return;
      } else {
        var _self = this;
        var _preferenceModel = this.preferences.at(0)
        _preferenceModel.set({
          Preference: this.preferenceCollection.at(0)
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

    UpdatePreference: function() {
      if (this.selectedRoleCode === "None") {
        this.selectedRoleCode = null;
      }

      switch (this.Type) {
        case "Discount":
          this.preferenceCollection.at(0).set({
            DiscountOverrideLevel: this.selectedRoleCode
          })
          break;
        case "Price":
          this.preferenceCollection.at(0).set({
            PriceChangeOverrideLevel: this.selectedRoleCode
          })
          break;
        case "Void":
          this.preferenceCollection.at(0).set({
            TransactionVoidOverrideLevel: this.selectedRoleCode
          })
          break;
        case "Return":
          this.preferenceCollection.at(0).set({
            ReturnsOverrideLevel: this.selectedRoleCode
          })
          break;
        case "AutoAllocate":
          this.preferenceCollection.at(0).set({
            AutoAllocateOverrideLevel: this.selectedRoleCode
          })
          break;
      }
    },

    UserRoleSelected: function(userRole) {      
      this.selectedRoleCode = userRole;
    }


  });
  return UserRolesView;
});
