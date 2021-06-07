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
  'view/20.1.0/pos/item/header-info/customer/customer',
  'text!template/20.1.0/pos/item/header-info/customer/customers.tpl.html',
  'js/libs/iscroll.js'
], function($, $$, _, Backbone, Shared, Global, CustomerView, CustomersTemplate) {
  var CustomersView = Backbone.View.extend({
    _template: _.template(CustomersTemplate),
    initialize: function() {
      this.Show();
      this.collection.on('reset', this.LoadItems, this);
      $("#customer-content").trigger("create");
      Shared.BlurItemScan();
    },

    LoadItems: function() {
      Shared.BlurItemScan();
      this.GroupByCustomerName(this.collection);
      $("#customerListContainer").listview("refresh");
      if (Global.isBrowserMode) return;
      if (this.myScroll) {
        this.myScroll.refresh()
      } else {
        this.myScroll = new iScroll('customer-content', {
          hScroll: false
        });
      }
    },

    GroupByCustomerName: function(collection) {
      var _collection = collection.pluck('CustomerName');
      var _result = _.groupBy(_collection, function(customer) {
        return customer.charAt(0).toUpperCase();
      });

      for (var customer in _result) {

        $("#customerListContainer").append("<li data-role='list-divider'>" + customer + "</li>");

        collection.each(function(model) {
          var _customer = model.get("CustomerName");

          model.set({
            DisplayCustomerName: Shared.Escapedhtml(_customer)
          });

          if (_customer.charAt(0).toUpperCase() === customer.toUpperCase()) {
            this.customerView = new CustomerView({
              model: model
            });
            $("#customerListContainer").append(this.customerView.render().el);
          }
        });
      }

    },

    Show: function() {
      this.$el.html(this._template);
    }
  });
  return CustomersView;
});
