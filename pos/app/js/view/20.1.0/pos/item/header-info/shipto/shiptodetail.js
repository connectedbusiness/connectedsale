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
  'view/20.1.0/pos/item/header-info/shipto/shiptoform',
  'text!template/20.1.0/pos/item/header-info/shipto/shiptodetail.tpl.html'
], function($, $$, _, Backbone, Global, Shared, ShipToFormView, template) {
  var ShipToDetailView = Backbone.View.extend({
    _template: _.template(template),

    events: {
      "tap #editShipto": "buttonTapEdit"
    },

    buttonTapEdit: function(e) {
      e.preventDefault();
      //console.log("edit customer");
      Global.EditShipToLoaded = false;
      this.InitializeShipToForm();
    },

    initialize: function() {
      this.render();
    },

    render: function() {
      //Shared.Escapedhtml()
      var shipToName = this.model.get("ShipToName")
      var address = "";
      if (!Shared.IsNullOrWhiteSpace(this.model.get("Address"))) {
        address = this.model.get("Address");
        address = address.substr(0, 40) + "...";
      }


      this.model.set({
        DisplayAddress: address,
        FormattedShipToName: Shared.Escapedhtml(shipToName)
      });
      this.$el.html(this._template(this.model.toJSON()));
      this.$el.trigger("create");
    },

    InitializeShipToForm: function() {
      $("#shipto").remove();
      $("#headerInfoContainer").append("<div id='FormContainer'></div>");
      var shiptoForm = new ShipToFormView({
        el: $("#FormContainer"),
        FormType: "Edit Ship To"
      });

      shiptoForm.on('updatedShipto', this.ProcessShipTo, this);
      shiptoForm.on('formLoaded', this.EditShipTo, this);

      //shiptoForm.EditShipTo(this.model);

      $("#main-transaction-blockoverlay").show();
    },

    ProcessShipTo: function(model) {
      this.trigger("ProcessShipTo", model);
    },

    EditShipTo: function(view) {
      if (view) view.EditShipTo(this.model);
    }
  });
  return ShipToDetailView;
});
