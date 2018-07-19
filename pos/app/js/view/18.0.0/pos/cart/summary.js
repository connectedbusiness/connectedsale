/**
 * Connected Business | 05-2-2012
 * Required: model
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'model/base',
  'shared/enum',
  'shared/global',
  'shared/method',
  'shared/shared',
  'shared/service',
  'text!template/16.0.0/pos/cart/summary.tpl.html'
], function($, $$, _, Backbone, BaseModel, Enum, Global, Method, Shared, Service, template) {
  var ItemView = Backbone.View.extend({
    _template: _.template(template),

    events: {
      "tap #view-payment": "payment_tap",
      "tap #view-notes": "ordernotes_tap",
      "tap #view-signature": "signature_tap",
      "tap #view-tax": "taxList_tap",
      "tap .taxqs": "showTaxName"
    },

    attributes: {
      id: "summary"
    },

    initialize: function() {
      this.type = this.options.type;
      this.model.bind("change", this.render, this);
    },

    render: function() {
      this.RecomputeBalance();
      this.model.set({
        CurrencySymbol: Global.CurrencySymbol
      })
      this.LoadCompanyImg();
      //this.model.set({ TaxCode: taxCode });
      //this.$(".summary-right").remove(); //remove the first div to replace
      this.$el.html(this._template(this.model.attributes));
      //this.$el.append(this._template);
      this.ToggleFields();
      //this.LoadWarehouseTaxCode();
      if (!Global.Preference.AllowChangeTaxCode) {
        $('#view-tax').attr('style', 'color: #666; cursor: default');
      }
      return this;
    },

    RecomputeBalance: function() {
      if (this.model) {
        var _balance = parseFloat(this.model.Balance());
        var _displayBal = _balance
        if (Global.TransactionType == Enum.TransactionType.ConvertOrder)
          if (_balance < 0) {
            _displayBal = 0.00;
          };
        this.model.set({
          Balance: _displayBal
        }, {
          silent: true
        })
      } else {
        return 0.00;
      }
    },

    LoadCompanyImg: function() {
      var _imageLoc = Global.ServiceUrl + Method.COMPANYIMAGE + Global.CompanyName + ".png";
      this.model.set({
        ImageLocation: _imageLoc
      }, {
        silent: true
      });
    },

    payment_tap: function(e) {
      e.preventDefault();
      this.ViewPayments();
    },

    signature_tap: function(e) {
      e.preventDefault();
      this.ViewSignature();
    },

    ordernotes_tap: function(e) {
      e.preventDefault();
      this.LoadOrderNotes();
    },

    taxList_tap: function(e) {
      if (Global.Preference.AllowChangeTaxCode && (Global.TransactionType != Enum.TransactionType.SalesRefund && Global.TransactionType != Enum.TransactionType.SalesPayment)) {
        e.preventDefault();
        this.ViewTaxOverrideList();
      }
    },

    ViewPayments: function() {
      this.trigger("viewPayments", this);
    },

    ViewTaxOverrideList: function() {
      this.trigger("viewTaxOverrideList", this);
    },

    ToggleFields: function() {
      var isHide = (Global.TransactionType != Enum.TransactionType.Order &&
        Global.TransactionType != Enum.TransactionType.ConvertInvoice &&
        Global.TransactionType != Enum.TransactionType.UpdateOrder &&
        Global.TransactionType != Enum.TransactionType.ConvertQuote &&
        Global.TransactionType != Enum.TransactionType.Sale &&
        Global.TransactionType != Enum.TransactionType.UpdateInvoice &&
        Global.TransactionType != Enum.TransactionType.ResumeSale &&
        Global.TransactionType != Enum.TransactionType.Quote &&
        Global.TransactionType != Enum.TransactionType.UpdateQuote);

      //this.$('.summary-right').find('#view-tax').attr('style', 'color:#0B4A8D; cursor: pointer;');

      this.ToggleOrderNotes(isHide);
      if (Global.TransactionType === Enum.TransactionType.SalesRefund) {
        //this.$(".payment-value").html("---");
        this.$(".summary-right").children("div:last-child").hide();
        this.$('.summary-right').find('#view-tax').attr('style', 'color: #666; cursor: default;');
      }

      if (Global.TransactionType === Enum.TransactionType.SalesPayment) {
        this.$('.summary-right').find('#view-tax').attr('style', 'color: #666; cursor: default;');
      }
    },

    ViewSignature: function() {
      this.trigger("viewSignature", this);
    },

    ToggleOrderNotes: function(isHide) {
      //Shared.ShowHideOrderNotes("view-notes", isHide);
    },

    LoadOrderNotes: function() {
      this.trigger("loadOrderNotes", "OrderNotes");
    },

    showTaxName: function(e) {

      e.preventDefault();
      var taxCode = window.sessionStorage.getItem('selected_taxcode');
      taxCode = (taxCode) ? taxCode : Global.ShipTo.TaxCode;

      this.$(e.currentTarget).find('.taxpopover').html(taxCode).show().delay(2000).fadeOut();
    },

    LoadWarehouseTaxCode: function() {
      var model = new BaseModel();

      model.url = Global.ServiceUrl + Service.SOP + Method.GETLOCATIONTAXCODE + Global.DefaultLocation + '/' + Global.CustomerCode;
      model.fetch({
        success: function(model, response, options) {
          console.log(response);
        }.bind(this),
        error: function(model, xhr, options) {
          console.log(xhr);
        }.bind(this)
      });
    }

  });
  return ItemView;
});
