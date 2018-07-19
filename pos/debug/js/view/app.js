/**
 * @author Connected Business
 */
define([
  'backbone',
  'shared/global',
  'view/login/logincontainer',
  'text!template/login/logincontainer.tpl.html'
], function(Backbone, Global, LoginContainerView, template) {

  var _preventScrolling = function() {
    document.body.addEventListener('touchmove', function(event) {
      event.preventDefault();
    }, false);
  };

  var AppView = Backbone.View.extend({
    _template: _.template(template),

    initialize: function() {
      _preventScrolling();
    },

    render: function() {
      this.$el.html(this._template);
      return this;
    },

    InitializeChildViews: function() {
      this.InitializeLoginContainerView();
    },

    InitializeLoginContainerView: function() {
      var _loginContainerView = new LoginContainerView({
        el: $("#login")
      });
    },

  });
  return AppView;
});
