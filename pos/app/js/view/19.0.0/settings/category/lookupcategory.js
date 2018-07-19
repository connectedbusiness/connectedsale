/**
 * @author Connected Business
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/shared',
  'text!template/19.0.0/settings/category/category.tpl.html'
], function($, $$, _, Backbone, Shared, template) {
  var LookupCategoryView = Backbone.View.extend({
    _template: _.template(template),
    tagName: 'li',
    events: {
      "tap": "SelectCategory",
    },
    initialize: function() {
      this.$el.attr("id", this.model.cid);
      this.model.bind('remove', this.RemoveItem, this);
    },
    render: function() {
      this.$el.html(this._template(Shared.EscapedModel(this.model).toJSON()));
      this.$("#deletebtn-overlay").hide();
      this.$(".td-categ-desc").css('width', '100%');
      this.$(".td-categ-del").css('display', 'none');
      return this;
    },
    RemoveItem: function() {
      this.remove();
    },
    SelectCategory: function(e) {
      e.stopPropagation();
      this.model.select();
    },
  });
  return LookupCategoryView;
});
