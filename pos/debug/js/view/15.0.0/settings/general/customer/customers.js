/**
 * @author Connected Business
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/shared',
  'shared/global',
  'view/15.0.0/settings/general/customer/customer',
  'text!template/15.0.0/settings/general/customer/customerpage.tpl.html',
  'text!template/15.0.0/settings/general/customer/search.tpl.html',
  'js/libs/iscroll.js',
], function($, $$, _, Backbone, Shared, Global, CustomerPreference, template, searchTemplate) {
  var CustomersPreference = Backbone.View.extend({
    _template: _.template(template),
    _search: _.template(searchTemplate),

    initialize: function() {
      $("#settings-customer-search").remove();
      this.render();
    },

    render: function() {
      $("#back-general").show();
      this.$el.html(this._template);

      $("#right-pane-content").before(this._search);

      this.$el.trigger("create");
      this.collection.each(this.LoadCustomer, this);

      if (Global.isBrowserMode) Shared.ApplyListScroll();
      else this.myScroll = new iScroll('right-pane-content');
    },

    LoadCustomer: function(model) {
      var custName = model.get("CustomerName");
      model.set({
        FormattedCustomerName: Shared.Escapedhtml(custName)
      });
      this.customerPreference = new CustomerPreference({
        model: model
      });
      this.$("#customerListPreference").append(this.customerPreference.render().el);
      this.$("#customerListPreference").listview("refresh");
    },
  });
  return CustomersPreference;
});
