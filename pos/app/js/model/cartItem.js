/**
 * Connected Business | 05-1-2012
 */
define([
  'model/base'
], function(BaseModel) {
  var CartItem = BaseModel.extend({
    addQuantity: function() { this.trigger("quantityAdded", this); },

    applyDiscountToAll: function(value) { this.trigger("discountAppliedToAll", value, this); },

    subtractQuantity: function() { this.trigger("quantitySubtracted", this); },

    updateDiscount: function(value) {
      this.set({
          Discount: value,
          EventTriggered: "UpdateDiscount"
      }, {silent: true});

      this.trigger("discountUpdated", this);
    },

    updateQuantityOrdered: function(value) {
      this.set({QuantityOrdered: value}, {silent: true});

      this.trigger("quantityOrderedUpdated", this, 0, "QuantityOrderedUpdated", true);
    },

    updateQuantityDefective: function(value) {
      this.set({Defective: value}, {silent: true});

      this.trigger("quantityDefectiveUpdated", this, 0, "quantityDefectiveUpdated", true);
    },

    updateQuantityGood: function(value) {
      this.set({Good: value}, {silent: true});

      this.trigger("quantityGoodUpdated", this, 0, "quantityGoodUpdated", true);
    },

    updateSalesPriceRate: function(value, eventName) {
      this.set({
        SalesPrice: value,
        SalesPriceRate: value
      }, {silent: true});

      this.trigger("salesPriceRateUpdated", this, 0, eventName, false, true);
    },

    updateWarehouseCode: function() { this.trigger("warehouseCodeUpdated", this); },

    updateUnitMeasure: function() { this.trigger("unitMeasureUpdated", this); },

    viewDetails: function() { this.trigger("viewDetails", this); },

    viewFreeStock: function() { this.trigger("viewFreeStock", this); },

    viewAccessory: function() { this.trigger("viewAccessory", this); },

    viewSubstitute: function() { this.trigger("viewSubstitute", this); },

    viewUnitofMeasure: function() { this.trigger("viewUnitofMeasure", this); },

    viewSerialLot: function() { this.trigger("viewSerialLot", this); },

    viewNotes: function(type) { this.trigger("viewNotes", type, this); },

    removeItem: function() { this.trigger("itemRemoved", this); },

    removeSerial: function() { this.trigger("removeSerialLot", this); },

    clearTransaction: function() { this.trigger("clearedTransaction", this); },

    discountItem: function() { this.trigger("discounted", this); },

    revertWarehouseCode: function() { this.trigger("revertWarehouseCode", this); },

    editKit: function() { this.trigger('editKitItem', this); }
  });
  return CartItem;
});
