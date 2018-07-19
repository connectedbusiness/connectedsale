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
  'text!template/18.1.0/pos/itemdetail/accessory/accessory.tpl.html'
], function($, $$, _, Backbone, Global, Shared, template) {
  var AccessoryView = Backbone.View.extend({
    _template: _.template(template),
    tagName: 'li',
    events: {
      "tap": "Add",
      "tap #select-lookup": "Selected"
    },
    initialize: function() {

    },
    render: function() {
      var _itemName = Shared.Escapedhtml(this.model.get("ItemName"));
      var _itemDescription = Shared.Escapedhtml(this.model.get("ItemDescription"));
      var _freeStock = this.model.get("UnitsInStock");
      var splitVal = _freeStock.toString().split(".");
      if (splitVal[1] > 0) {
        _freeStock = _freeStock.toFixed(2);
      } else {
        _freeStock = parseFloat(_freeStock);
      }
      this.model.set({
        CurrencySymbol: Global.CurrencySymbol,
        UnitsInStock: _freeStock,
        ItemNameDisplay: _itemName,
        ItemDescriptionDisplay: _itemDescription
      });
      this.$el.html(this._template(this.model.toJSON()));
      return this;
    },

    Selected: function(e) {
      //e.preventDefault();
      e.stopPropagation();
      this.model.select();
    },

    Add: function(e) {
      e.preventDefault();
      //e.stopPropagation();
      this.model.itemAdd();
    }
  });

  return AccessoryView;
});
