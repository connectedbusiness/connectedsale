/**
 * @author Connected Business
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'shared/shared',
  'model/base',
  'text!template/24.0.0/pos/actions/actions.tpl.html'
], function($, $$, _, Backbone, Global, Shared,
  BaseModel, ActionsTemplate) {
  var _id = "";
  var ActionsView = Backbone.View.extend({
    _template: _.template(ActionsTemplate),
    className: "popover",
    id: "actions-popover",
    attributes: {
      style: 'display:none'
    },

    events: {
      "tap a": "CheckTransaction",
    },

    Selected: function(_id) {
      switch (_id) {
        case "settings":
          window.location.hash = 'settings';
          break;
        case "logout":
          this.trigger("LogOut", this);
          break;
        case "opencashdrawer":
          this.trigger("OpenCashDrawer", this);
          break;
        case "closeworkstation":
          this.trigger("CloseWorkstation", this);
          break;
        case "printtape":
          this.trigger("PrintWorkstationReport", this);
          break;
        case "backtodashboard":
          window.location.hash = "dashboard";
		      this.trigger('stopSignalR', this);
          break;
      }
    },

    CheckTransaction: function(e) {
      if (e) {
        e.preventDefault();
        _id = e.currentTarget.id;
      }
      _self = this;
      if (this.hasOpenTransaction) {
        navigator.notification.confirm("The current transaction will be cancelled if you continue. Do you want to continue?", _voidTransaction, "Cancel Transaction", "Yes,No");
        return;
      }
      this.Selected(_id);
    },

    render: function() {
      var currentServerVersion = Shared.GetVersionAttributes(Global.ServerVersion);
      var serverVersion =  currentServerVersion.Major + "." + currentServerVersion.Minor;
      var _version = Global.ServerVersion;
      this.$el.html(this._template({
        Version: serverVersion
      }));
      this.Close();
      return this;
    },

    Close: function() {
      this.Hide();
    },

    Show: function() {
      this.ToggleDisplay();
      this.$el.show();
      this.$el.trigger('create');
    },

    Hide: function() {
      this.$el.hide();
    },

    ToggleDisplay: function() {

      switch (Global.Preference.TrackDrawerBalance) {
        case true:
          this.$("#closeworkstation").show();
          break;
        case false:
          this.$("#closeworkstation").hide();
          break;
      }

    if (!Global.Preference.IsAllowViewZXTape)
    {
         if (!Global.AdministratorRole && !(Global._HasStations && !Global._HasAdmins)) // jjx
         { 
            this.$("#printtape").hide();
         } else {
            this.$("#printtape").show();
         }
    } else {
        this.$("#printtape").show();
    }
        
    },

    SetHasOpenTransaction: function(hasOpenTransaction) {
      this.hasOpenTransaction = hasOpenTransaction;
    }

  });

  var _self;
  var _voidTransaction = function(button) {
    if (button === 1) {
      _self.trigger("VoidTransaction", _self);
    } else {
      return;
    }
  }

  return ActionsView;
});
