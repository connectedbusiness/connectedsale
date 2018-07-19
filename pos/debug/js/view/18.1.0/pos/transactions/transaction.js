/**
 * Connected Business | 05-21-2012
 * Required: model
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/enum',
  'shared/global',
  'shared/shared',
  'text!template/18.1.0/pos/transactions/invoice.tpl.html',
  'text!template/18.1.0/pos/transactions/order.tpl.html',
  'text!template/18.1.0/pos/transactions/return.tpl.html',
], function($, $$, _, Backbone, Enum, Global, Shared, InvoiceTemplate, OrderTemplate, ReturnTemplate) {
  var ItemView = Backbone.View.extend({
    _InvoiceTemplate: _.template(InvoiceTemplate),
    _OrderTemplate: _.template(OrderTemplate),
    _ReturnTemplate: _.template(ReturnTemplate),

    tagName: "tr",
    id: "tr-transaction",

    events: {
      "tap": "transaction_tap"
    },

    initialize: function() {
      this.model.bind("change", this.UpdateCart, this);
      this.model.bind("remove", this.RemoveItemFromCart, this);
      this.model.on('destroy-view', this.destroy, this)
    },

    destroy: function() {
      this.unbind();
      this.remove();
    },

    render: function() {
      var _transactionDate;
      var _transactionCode;
      var _template;
      switch (Global.LookupMode) {
        case Enum.LookupMode.Invoice:
          _transactionDate = this.model.get("InvoiceDate");
          _transactionCode = this.model.get("InvoiceCode");
          _template = this._InvoiceTemplate;
          break;
        case Enum.LookupMode.Order:
          _transactionDate = this.model.get("SalesOrderDate");
          _transactionCode = this.model.get("SalesOrderCode");
          _template = this._OrderTemplate;
          break;
        case Enum.LookupMode.Quote:
          _transactionDate = this.model.get("SalesOrderDate");
          _transactionCode = this.model.get("SalesOrderCode");
          _template = this._OrderTemplate;
          break;
        case Enum.LookupMode.Return:
          _transactionDate = this.model.get("ReturnDate");
          _transactionCode = this.model.get("ReturnCode");
          _template = this._ReturnTemplate;
          break;
        case Enum.LookupMode.Suspend:
          _transactionDate = this.model.get("InvoiceDate");
          _transactionCode = this.model.get("InvoiceCode");
          _template = this._InvoiceTemplate;
          break;
      }

      //format the date for display
      _transactionDate = new Date(parseInt(_transactionDate.substr(6)));
      var month = _transactionDate.getMonth() + 1;
      var day = _transactionDate.getDate();
      var year = _transactionDate.getFullYear();
      var _billtoName = Shared.Escapedhtml(this.model.get("BillToName"));
      _transactionDate = month + "/" + day + "/" + year;

      this.model.set({
        FormattedBillToName: _billtoName,
        FormattedDate: _transactionDate,
        TransactionCode: _transactionCode,
        TransactionType: Global.LookupMode,
        CurrencySymbol: Global.CurrencySymbol
      });


      this.$el.html(_template(this.model.toJSON()));
      return this;
    },

    transaction_tap: function(e) {
      e.preventDefault();
      e.stopPropagation();

      var x_coord = e.offsetX ? (e.offsetX) : e.pageX - document.getElementById("tr-transaction").offsetLeft;
      var y_coord = e.offsetY ? (e.offsetY) : e.pageY - document.getElementById("tr-transaction").offsetTop;
      if (Global.isBrowserMode) {
        var is_chrome = navigator.userAgent.toLowerCase().indexOf('chrome') > -1;
        if (is_chrome) {
          var x = new Number();
          var y = new Number();
          x = e.clientX;
          y = e.clientY;
          x_coord = x;
          y_coord = y;
        }
      }
      this.SelectTransaction(x_coord, y_coord);
    },

    SelectTransaction: function(x_coord, y_coord) {
      this.model.select(x_coord, y_coord);
    }

  });
  return ItemView;
});
