/**
 * @author Connected Business
 */
define([
  'model/base'
], function(BaseModel) {
  var TransactionModel = BaseModel.extend({
    initialize: function() {
      this.isTransactionModel = true;
    },
    parse: function(response) {
      return response;
    },

    select: function(x_coord, y_coord) {
      this.trigger("selected", x_coord, y_coord, this);
    },

    applyPayment: function() {
      this.trigger("applyPayment", this);
    },

    updateOrder: function() {
      this.trigger("updateOrder", this);
    },

    convertOrder: function() {
      this.trigger("convertOrder", this);
    },

    convertQuote: function() {
      this.trigger("convertQuote", this);
    },

    updateQuote: function() {
      this.trigger("updateQuote", this);
    },

    returnInvoice: function() {
      this.trigger("returnInvoice", this);
    },

    printTransaction: function() {
      this.trigger("printTransaction", this);
    },

    resumeTransaction: function() {
      this.trigger("resumeTransaction", this);
    },

    printPickNote: function() {
      this.trigger("printPickNote", this);
    },

    readyForPickUp: function() {
      this.trigger("readyForPickUp", this);
    },

    repickItem: function() {
      this.trigger("repickItem", this);
    }

  });
  return TransactionModel;
});
