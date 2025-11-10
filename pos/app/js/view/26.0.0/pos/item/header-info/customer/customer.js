/**
 * @author Connected Business
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'text!template/26.0.0/pos/item/header-info/customer/customer.tpl.html'
], function($, $$, _, Backbone, CustomerTemplate) {
  var CustomerView = Backbone.View.extend({
    _template: _.template(CustomerTemplate),
    tagName: 'li',
    events: {
      "tap": "ViewDetail",
      "tap #select-customer-btn": "Selected",
      "tap #select-customer": "Selected",
      "tap #customer-save-btn": "ViewDetail"
    },

    initialize: function() {},

    render: function() {
      this.$el.html(this._template(this.model.toJSON()));
      return this;
    },

    Selected: function(e) {
      e.stopPropagation();
      this.model.select();
    },

    ViewDetail: function(e) {
      e.stopPropagation();
      this.model.viewDetail();
    }

  });
  return CustomerView;
});
