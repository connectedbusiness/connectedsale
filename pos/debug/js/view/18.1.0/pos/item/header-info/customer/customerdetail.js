/**
 * @author Connected Business
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'shared/shared',
  'view/18.1.0/pos/item/header-info/customer/customerform',
  'text!template/18.1.0/pos/item/header-info/customer/customerdetail.tpl.html'
], function($, $$, _, Backbone, Global, Shared, CustomerFormView, CustomerDetailTemplate) {
  var CustomerDetailView = Backbone.View.extend({
    _template: _.template(CustomerDetailTemplate),

    events: {
      "tap #customer-edit": "buttonTapEdit"
    },

    buttonTapEdit: function(e) {
      e.preventDefault();
      console.log("edit customer");
      Global.EditCustomerLoaded = false;
      this.InitializeCustomerForm();
    },

    initialize: function() {
      this.render();
    },

    InitializeCustomerForm: function() {
      $("#customer").remove();
      $("#headerInfoContainer").append("<div id='FormContainer'></div>");
      var customerform = new CustomerFormView({
        el: $("#FormContainer"),
        FormType: "Edit Customer"
      });

      customerform.on('updatedCustomer', this.ProcessCustomer, this);
      customerform.on('formLoaded', this.EditCustomer, this);

      $("#main-transaction-blockoverlay").show();
    },

    render: function() {
      this.AssignFormattedName();
      var address = "";
      if (!Shared.IsNullOrWhiteSpace(this.model.get("Address"))) {
        address = this.model.get("Address");
        address = address.substr(0, 40) + "...";
      }

      this.model.set({
        DisplayAddress: address,
        OutstandingPoints: Math.round(this.model.attributes.OutstandingPoints),
      });

      this.$el.html(this._template(this.model.toJSON()));
      this.$el.trigger("create");
    },

    AssignFormattedName: function() {
      var custName = this.model.get("CustomerName");
      var _formattedName = Shared.Escapedhtml(custName);
      if (custName.length > 40) _formattedName = Shared.Escapedhtml(custName.substring(0, 40))

      this.model.set({
        FormattedCustomerName: _formattedName
      });
    },

    ProcessCustomer: function(model) {
      this.trigger("ProcessCustomer", model);
    },

    EditCustomer: function(view) {
      if (view) view.EditCustomer(this.model);
    },
  });
  return CustomerDetailView;
});
