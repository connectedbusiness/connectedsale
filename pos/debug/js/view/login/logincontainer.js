/**
 * @author Connected Business
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'model/login',
  'view/login/login',
  'text!template/login/login.tpl.html',
], function($, $$, _, Backbone, LoginModel, LoginView, template) {
  var LoginContainer = Backbone.View.extend({
    _template: _.template(template),

    initialize: function() {
      this.render();
      this.InitializeChildViews();
    },

    render: function() {
      this.$el.html(this._template);
      return this;
    },

    InitializeChildViews: function() {
      this.InitializeLoginView();
    },

    InitializeLoginModel: function() {
      this.loginmodel = new LoginModel();
    },

    InitializeLoginView: function() {
      this.InitializeLoginModel();
      this.loginview = new LoginView({
        el: $("#login"),
        model: this.loginmodel
      });
    },

  })
  return LoginContainer;
});
