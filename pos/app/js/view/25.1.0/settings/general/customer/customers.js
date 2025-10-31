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
  'view/25.1.0/settings/general/customer/customer',
  'text!template/25.1.0/settings/general/customer/customerpage.tpl.html',
  'text!template/25.1.0/settings/general/customer/search.tpl.html',
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

      $("#settings-modal-content").before(this._search);
 
      this.$el.trigger("create");
      this.collection.each(this.LoadCustomer, this);

      if (Global.isBrowserMode) Shared.ApplyListScroll();
      else this.myScroll = new iScroll('scroll-wrapper');
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

    SetSelected: function(customerCode){
      this.collection.each(function(customer){        
        if (customer.get("CustomerCode") === customerCode){          
           $("<img class='ui-li-icon' style ='height:25px;width:27px;'/>").attr({
            src: "img/check@2x.png"
          }).prependTo($('#' + customer.cid));
          $("#customerListPreference").listview("refresh");
        }
      });
    }

  });
  return CustomersPreference;
});
