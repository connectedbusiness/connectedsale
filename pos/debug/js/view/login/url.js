/**
 * @author Connected Business
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'model/url',
  'view/login/urlitem',
  'text!template/login/url.tpl.html'
], function($, $$, _, Backbone, UrlModel, UrlItemView, template) {
  var UrlView = Backbone.View.extend({
    _template: _.template(template),
    initialize: function() {
      this.$el.html(this._template);
      this.render();
    },
    render: function() {
      this.collection.each(this.RenderItem, this);
        setTimeout(function(){
            $("#urlList").listview().listview("refresh");
        }),2500;
    },

    RenderItem: function(url) {
      var urlitemview = new UrlItemView({
        model: url
      });
      $("#urlList").prepend(urlitemview.render().el);

      urlitemview.bindEvents();
    }
  });
  return UrlView;
});
