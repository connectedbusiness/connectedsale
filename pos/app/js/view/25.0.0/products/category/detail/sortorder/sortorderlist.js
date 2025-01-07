define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'text!template/25.0.0/products/category/detail/sortorder/sortorderlist.tpl.html'
], function($, $$, _, Backbone, template) {

  var CategorySortOrderListView = Backbone.View.extend({
    _template: _.template(template),

    initialize: function() {
      this.render()
    },
    render: function() {
      this.$el.append(this._template(this.model.toJSON()));
    },
  });
  return CategorySortOrderListView;
})
