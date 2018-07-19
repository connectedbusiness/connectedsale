/**
 * Connected Business | 5-14-2013
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'shared/shared',
  'model/base',
  'view/15.0.1/secondarydisplay/logout',
  'text!template/15.0.1/secondarydisplay/options.tpl.html',
], function($, $$, _, Backbone, Global, Shared, BaseModel, SecondaryDisplayLogoutView, template) {

  var OptionsView = Backbone.View.extend({
    _template: _.template(template),

    className: "popover",

    attributes: {
      style: 'display:none'
    },

    events: {
      "tap .btn-action-connectto": "btnClick_ConnectTo",
      "tap .btn-action-dashboard": "btnClick_Dashboard",
      "tap .btn-action-logout": "btnClick_LogOut"
    },

    btnClick_ConnectTo: function(e) {
      e.preventDefault();
      this.trigger("ShowConnectToOptions", this);
    },

    btnClick_Dashboard: function(e) {
      e.preventDefault();
      this.ShowAccountForm();
    },

    btnClick_LogOut: function(e) {
      e.preventDefault();
      this.trigger("LogOut", this);
    },

    render: function() {
      var _version = Global.ServerVersion;
      this.$el.html(this._template({
        Version: _version
      }));
      this.Close();
      return this;
    },

    AccountAccepted: function() {
      this.trigger("BackToDashboard", this);
    },

    Close: function() {
      this.Hide();
    },

    Hide: function() {
      this.$el.hide();
    },

    ShowAccountForm: function() {
      this.secondaryDisplayLogoutView = new SecondaryDisplayLogoutView();

      this.secondaryDisplayLogoutView.unbind();
      this.secondaryDisplayLogoutView.on('stop', this.AccountAccepted, this);

      $("#secondarydisplay-logout").append(this.secondaryDisplayLogoutView.render().el);

      this.secondaryDisplayLogoutView.Show("SECONDARYDISPLAY");
    },

    Show: function() {
      this.$el.show();
      this.$el.trigger('create');
    },


  });
  return OptionsView;
});
