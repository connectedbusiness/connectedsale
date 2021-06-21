/**
 * Connected Business | 05-1-2012
 * Required: el, collection
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'bigdecimal',
  'shared/global',
  'shared/enum',
  'shared/shared',
  'view/22.0.0/pos/cart/total',
  'view/22.0.0/pos/cart/cartItem',
  'view/22.0.0/pos/cart/kit',
  'view/22.0.0/pos/cart/promo',
  'view/22.0.0/pos/cart/summary',
  'view/22.0.0/pos/itemdetail/itemdetail',
  'view/22.0.0/pos/seriallot/seriallot',
  'model/summary',
  'text!template/22.0.0/pos/cart/cart.tpl.html',
  'js/libs/iscroll.js',
  'js/libs/format.min.js',
  'model/base',
], function($, $$, _, Backbone, BigDecimal, Global, Enum, Shared,
  TotalView, CartItemView, KitView, PromoView, SummaryView, ItemDetailView, SerialLotView, SummaryModel, template,BaseModel) {
  var CartView = Backbone.View.extend({
    _template: _.template(template),

    initialize: function() {
      this.summaryModel = this.options.summary;
      this.accessory = this.options.accessory;
      this.type = this.options.type;
      this.collection.on("add", this.ModelAdded, this);
      this.collection.on("change", this.ModelChanged, this);
      this.collection.on("viewDetails", this.ShowItemDetails, this);
      this.collection.on("viewFreeStock", this.ShowFreeStock, this);
      this.collection.on("viewAccessory", this.ShowAccessory, this);
      this.collection.on("viewSubstitute", this.ShowSubstitute, this);
      this.collection.on("itemRemoved", this.RemoveItem, this);
      this.collection.on("reset", this.ReinitializeCart, this);
      this.collection.on("removeSerialLot", this.RemoveSerial, this);
      this.collection.on("viewSerialLot", this.ShowSerialLot, this);
      this.collection.on("viewNotes", this.ShowNotes, this);
      this.collection.on("change:SalesPriceRate", this.PriceChanged, this);
      //this.collection.on("change:QuantityOrdered", this.QuantityChanged, this);
      this.collection.on("showItems", this.ShowItems, this);
      this.collection.on("editKitItem", this.EditKit, this);
      this.render();
      this.on("serialLotReady", this.FetchSerialLotCollection, this);
      this.on("updateKitDisplay", this.UpdateKitDisplay, this);
      this.on("updatePromoDisplay", this.UpdatePromoDisplay, this);

      if (Global.Preference.AllowSaleDiscount) window.sessionStorage.setItem('MaxSaleDiscount', Global.Preference.MaxSaleDiscount);
    },

    PriceChanged: function(model) {
      this.ReloadModel();
    },

    UpdateKitDisplay: function(model) { 
      var code = model.get('ItemCode') + '-' + model.get('LineNum');
      var element = this.$el.find('tbody#kit-' + code),
        prevElement = element.prev();
      element.remove();
      if (model.get('ItemType') == Enum.ItemType.Kit) {
        var kitView = new KitView({
          id: code,
          lineNum: model.get('LineNum')
        });
        prevElement.after(kitView.render().el);
      }
    },

  UpdatePromoDisplay: function(collection, getItemQty){
       var promoView = new PromoView({
        collection: collection,
        getItemQty: getItemQty
       });  
       this.$('#cartListContainer').append(promoView.render().el);

       this.LoadiScroll();
    },

    ShowItems: function(collection) {
      var self = this;
      $("#cartContent").hide();
      collection.each(function(cart) {
        self.ModelAdded(cart);
      });
      $("#cartContent").show();
    },

    render: function() {
      switch (this.type) {
        case "POS":
          this.$el.html(this._template);
          this.InitializeTotalView(".total");
          this.InitializeSummaryView(".transactionSummary");
          //this.LoadiScroll(); //this.myScroll = new iScroll('cartContent',{vScrollbar:false, vScroll:true, snap:true, momentum: true});
          break;
      }

    },

    LoadiScroll: function() {
      var _contentID = 'cartContent';
      var _tableID = 'cartListContainer';

      var cartContentBottom = $('#' + _contentID).offset().top + $('#' + _contentID).height();
      var cartListBottom = $('#' + _tableID).offset().top + $('#' + _tableID).height();

      if (Global.isBrowserMode) {
        if (cartListBottom > cartContentBottom) $("#" + _contentID).animate({
          scrollTop: $('#' + _tableID)[0].scrollHeight
        }, 100);
        return;
      }

      if (this.myScroll) {
        this.myScroll.refresh();
        if (cartListBottom > cartContentBottom) this.myScroll.scrollToElement('tbody:last-child', 100);
      } else {
        this.myScroll = new iScroll(_contentID, {
          vScrollbar: true,
          vScroll: true,
          snap: true,
          momentum: true,
          onBeforeScrollStart: function(e) {
            var target = e.target;
            while (target.nodeType != 1) target = target.parentNode;

            if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA')
              e.preventDefault();
          }
        });
      }
    },

    RefreshScroll: function() {
      var self = this;
      if (this.myScroll) {
        setTimeout(function() {
          self.myScroll.refresh();
        }, 500);
      }
    },

    AddOneItemToCart: function(item) {      
      if (this.collection.total() <= 10000000000.00) {
        var _cartItemView = new CartItemView({
          model: item,
          totalDiscount: this.collection.totalDiscount(),
          type: Global.ApplicationType,
        });
        _cartItemView.on('editKitItem', function() {
          this.trigger('editKitItem');
        }.bind(this));

        this.$("#cartListContainer").append(_cartItemView.render().el);
     if(item.get('IsPromoItem') == true)
      {
        $("#" + item.cid + ' #quantityDisplay').addClass('ui-disabled');
        $("#" + item.cid + ' #display-itemName').addClass('ui-disabled');
        $("#" + item.cid + ' #itemPriceDisplay').addClass('ui-disabled');
        $("#" + item.cid + ' #discountDisplay').addClass('ui-disabled');
        $("#" + item.cid + ' #extPriceRate-td').addClass('ui-disabled');        

        _cartItemView.displayPromoCaption();
      }
       
        if (item.get('ItemType') === Enum.ItemType.Kit) {
          var kitView = new KitView({
            id: item.get('ItemCode') + '-' + item.get('LineNum'),
            lineNum: item.get('LineNum')
          });

          this.$('#cartListContainer').append(kitView.render().el);

 		}
        this.AddNetToInvoiceTotal(item, "add");
        _cartItemView.bindEvents();
        //this.LoadiScroll();
        var _showOutstanding = (Global.TransactionType === Enum.TransactionType.SalesRefund);
        this.ShowOutstanding(_showOutstanding);
        //if(Global.TransactionType == Enum.TransactionType.ConvertQuote)_cartItemView.CheckOnLoadIfPhasedOut();
      }
    },

    InitializeTotalView: function(element) {
      this.totalView = new TotalView({
        collection: this.collection,
        model: this.summaryModel,
        el: $(element),
        type: Global.ApplicationType
      });
    },

    InitializeSummaryView: function(element) {
      this.summaryView = new SummaryView({
        model: this.summaryModel,
        type: Global.ApplicationType
      });
      this.summaryView.on("viewPayments", this.ViewPayments, this);
      this.summaryView.on("viewSignature", this.ViewSignature, this);
      this.summaryView.on("viewTaxOverrideList", this.ViewTaxList, this);
      this.summaryView.on("loadOrderNotes", this.LoadOrderNotes, this);
      this.summaryView.on("orderNotesSaved", this.ProcessSavedNotes, this);

      this.$(element).html(this.summaryView.render().el);
    },

    /**
     Initialize Serialize Lot View

     @method IntializeSerializeLot
     **/
    InitializeSerializeLot: function(type, itemCode, itemName, lineNum, itemType) {
      if (!this.serializeLot) {
        this.serializeLot = new SerialLotView({
          el: $("#serialLotContainer"),
          type: type,
          itemCode: itemCode,
          itemName: itemName,
          lineNum: lineNum,
          itemType: itemType,
          collection: this.serialLot
        });
      } else {
        this.serializeLot.Show(this.serialLot, type, itemCode, itemName, lineNum, itemType, $("#serialLotContainer"));
      }
    },

    InitializeSummaryModel: function() {
      this.summaryModel = new SummaryModel();
    },

    ModelAdded: function(model) {
      this.AddOneItemToCart(model);
      this.RefreshCartTable();
    },

    ModelChanged: function(model) {
      this.AddNetToInvoiceTotal(model, "update")
      // this.RefreshCartTable();
    },

    RefreshCartTable: function() {
      this.$(".cartDetails .itemName").width(this.$("#cartListContainer .cart-details .itemName").width());
      this.$(".cartDetails .itemQty").width(this.$("#cartListContainer .cart-details .itemQty").width());
      this.$(".cartDetails .itemRemaining").width(this.$("#cartListContainer .cart-details .itemRemaining").width());
      this.$(".cartDetails .itemPrice").width(this.$("#cartListContainer .cart-details .itemPrice").width());
      this.$(".cartDetails .itemDiscount").width(this.$("#cartListContainer .cart-details .itemDiscount").width());
      this.$(".cartDetails .itemExtPrice").width(this.$("#cartListContainer .cart-details .itemExtPrice").width());
      this.$(".cartDetails .itemViewDetail").width(this.$("#cartListContainer .cart-details .itemViewDetail").width());
    
        

      this.LoadiScroll();
    },

    AddNetToInvoiceTotal: function(item, type) {
      var _extendedPrice = 0.00,
        _salesTaxAmountRate = 0.00,
        _balance = 0.00,
        _quantity = 0,
        _quantityField = "QuantityOrdered",
        _discount = 0.00,
        _tax = this.summaryModel.get("TotalTax"),
        _subtotal = this.collection.total(),
        _payment = this.summaryModel.get("Payment"),
        _totalQty = this.summaryModel.get("Qty"),
        sumSalesPrice = 0,
        sumExtSalesPrice = 0,
        _totalDiscount = this.summaryModel.get("TotalDiscount"),
        _hasDiscount = 0;


      if (Global.TransactionType === Enum.TransactionType.SalesRefund || Global.TransactionType === Enum.TransactionType.Return) _quantityField = "Good"; //Originally Defective

      switch (type) {
        case "add":
          _extendedPrice = item.get("ExtPriceRate");
          _salesTaxAmountRate = item.get("SalesTaxAmountRate");
          //_subtotal = _subtotal + _extendedPrice;
          _quantity = item.get(_quantityField);
          _totalQty += _quantity;
          //_totalDiscount += this.computeDiscount(item);
          break
        case "update":
           _extendedPrice = item.get("ExtPriceRate") - item.previous("ExtPriceRate");
           _salesTaxAmountRate = item.get("SalesTaxAmountRate") - item.previous("SalesTaxAmountRate");
           _quantity = item.get(_quantityField) - item.previous(_quantityField);

          //_subtotal = _subtotal + _extendedPrice;       
          _discount = this.computeDiscount(item);
          _totalQty = _totalQty + _quantity;
          //_totalDiscount = _totalDiscount + _discount;
          break;
        case "delete":
          _extendedPrice = item.get("ExtPriceRate");
          _salesTaxAmountRate -= item.get("SalesTaxAmountRate");
          //_subtotal = _subtotal - _extendedPrice;
          _quantity = item.get(_quantityField);

          _totalQty -= _quantity;
          //_totalDiscount -= (_extendedPrice * item.get("Discount")) / 100;
          break;
      }

      //CSL-9780
      // if (Global.TransactionType === Enum.TransactionType.SalesRefund) {
      //  _payment = 0;
      // }

      //_tax = _tax + parseFloat(this.RoundOff(_salesTaxAmountRate.toFixed(3)));
      _tax = _tax + _salesTaxAmountRate;
      _balance = _subtotal + _tax - _payment;
//      _tax = parseFloat(this.RoundNumber(format("0.00000", _tax + _salesTaxAmountRate), 2));
//      _balance = parseFloat(this.RoundNumber(format("0.00000", _subtotal + _tax - _payment), 2));

      //force two(2) fixed decimal points because there is an issue with float in javascript
      _subtotal = parseFloat(_subtotal.toFixed(2));
		_tax = parseFloat(this.RoundNumber(format("0.00000", _tax), 4));
      var _taxDisplay = parseFloat(this.RoundNumber(format("0.00000", _tax), 4));

      if (this.IsReturn()) {
        var _rnd = parseFloat(parseFloat(_tax).toFixed(4)),
          _trim = parseFloat(this.preciseRound(_tax, 4));

        if (parseFloat((_rnd - _trim).toFixed(3)) == 0.005) _taxDisplay = _trim;
        else _taxDisplay = _rnd;
        _taxDisplay = format("#,##0.00", this.RoundNumber(format("0.00000", _taxDisplay), 4));
      }

       _taxDisplay =  parseFloat(this.RoundNumber(format("0.00000", _taxDisplay), 2));

      // Commented: CSL-14624
      // if(_tax < 0){
      //  _tax = _tax * (-1);// force to make negative value to positive
      // }

    _balance = parseFloat(_balance.toFixed(2));
    //  _balance =  parseFloat(this.RoundNumber(format("0.00000", _balance), 2));
      
        
       if (Global.TransactionType == Enum.TransactionType.SalesRefund) {
        if (this.collection.length > 0) {
          this.collection.each(function(data) {
            var goodQty = data.get("Good"); 
            var refundSalesPriceRate =  data.get("SalesPriceRate");
            var refundExtPriceRate =  data.get("ExtPriceRate");
            var refundQtyOrder =  data.get("QuantityOrdered");
            var newrefundSalesPriceRate = refundSalesPriceRate * refundQtyOrder;
            if (goodQty > 0) {
             sumSalesPrice = sumSalesPrice + newrefundSalesPriceRate;
             sumExtSalesPrice = sumExtSalesPrice + refundExtPriceRate;
            }
         
            if (data.get("Discount") > 0 || data.get("CouponDiscountAmount") > 0) {
              _hasDiscount = 1;
            }
          });
          if (_hasDiscount == 1) {
            _totalDiscount = sumSalesPrice - _subtotal;
          }
        } else {
          _totalDiscount = 0;
        }
      }

      else {
        if (Global.TransactionType != Enum.TransactionType.Return) {
          if (this.collection.length > 0) {
          this.collection.each(function(data) {
            sumSalesPrice += (data.get("SalesPriceRate") * data.get("QuantityOrdered"));
            sumExtSalesPrice += data.get("ExtPriceRate");
            if (data.get("Discount") > 0 || data.get("CouponDiscountAmount") > 0) {
              _hasDiscount = 1;
            }
          });
          if (sumSalesPrice != _subtotal && _hasDiscount == 1) {
            _totalDiscount = sumSalesPrice - _subtotal;
          }
        } else {
          _totalDiscount = 0;
        }
        }
     
      }

      var _totalCreditMemoAmount = 0;
      var _totalCreditMemoAmountDisplay = _totalCreditMemoAmount;
        if (Global.TransactionType === Enum.TransactionType.SalesRefund) {
          _totalCreditMemoAmount = _subtotal + _tax;
        }

      _totalCreditMemoAmountDisplay =  parseFloat(this.RoundNumber(format("0.00000", _totalCreditMemoAmount), 2));

      this.summaryModel.set({
        SubTotal: _subtotal,
        TotalTax: _tax,
        Payment: _payment,
        Balance: _balance,
        Qty: this.RetrieveSubtotal(),
        TaxDisplay: _taxDisplay,
        TotalDiscount: _totalDiscount,
        TotalCreditMemoAmount: _totalCreditMemoAmountDisplay,
      });

      Global.Summary = this.summaryModel.attributes;
    },

    IsReturn: function() {
      if (Global.TransactionType === Enum.TransactionType.SalesRefund) return true;
      if (Global.TransactionType === Enum.TransactionType.SalesCredit) return true;
      if (Global.TransactionType === Enum.TransactionType.Return) return true;
      return false;
    },

    computeDiscount: function(item) {
      var discount = item.get("Discount"), 
        prevDiscount = item.previous("Discount"),
        couponType = item.get("CouponDiscountType"),
        couponAmount = item.get("CouponDiscountAmount"),
        couponDiscount = item.get("CouponDiscount"),
        couponCode = item.get("CouponCode"),
        price = item.get("SalesPrice"),
        extPrice = item.get("ExtPriceRate"),
        computedDiscount = 0;

      computedDiscount = (price * (discount - prevDiscount)) / 100;

      if (couponCode) {
        switch (couponType) {
          case "Percent":
            computedDiscount += (extPrice * (discount - prevDiscount)) / 100;
            break;
        }
      }

      return computedDiscount;
    },

    //method that slice down the decimal places.
    preciseRound: function(value, numOfDecimals) {
      if (numOfDecimals == null) numOfDecimals = 2;
      var num = value.toString();
      if (num.indexOf('.') == -1) return num;
      return num.substr(0, num.indexOf('.') + numOfDecimals + 1);
    },

    //Added CSL - 17445
    //Retrieve and Total the final QuantityOrdered or Defective items
    RetrieveSubtotal: function() {
      var qtyField = "QuantityOrdered";
      var total = 0;

      if (Global.TransactionType === Enum.TransactionType.SalesRefund && Global.TransactionType === Enum.TransactionType.Return) {
        qtyField = "Good"; //Originally Defective
      }

      this.collection.each(function(cart, i) {
        total += (cart.get(qtyField) < 0) ? 0 : cart.get(qtyField);
      });

      return total;
    },

    /**
     Round off numbers

     @method RoundNumber
     **/
    RoundNumber: function(value, dec) {
      var bigDecimal = new BigDecimal.BigDecimal(value);
      return bigDecimal.setScale(dec, BigDecimal.MathContext.ROUND_HALF_UP);
    },

    ReloadModel: function() {
      var element = "#itemDetailContainer";

      if ($(element).is(':visible')) {
        if (this.itemDetailView) {
          if (this.itemDetailView.model) {
            var _itemCode = this.itemDetailView.model.attributes.ItemCode;
            var _unitMeasureCode = this.itemDetailView.model.attributes.UnitMeasureCode;
            var _lineNum = this.itemDetailView.model.attributes.LineNum;
            var _self = this;

            this.collection.each(function(model) {
              if (model.get("ItemCode") === _itemCode && model.get("UnitMeasureCode") === _unitMeasureCode && model.get("LineNum") === _lineNum) {
                _self.ShowItemDetails(model);
              }
            });
          }
        }
      }
    },

    ShowItemDetails: function(model) {
      var element = "#itemDetailContainer";

      if (this.isItemDetailViewOpen) this.itemDetailView = null; // this.itemDetailView.Close();

      if (!this.itemDetailView) {
        this.itemDetailView = new ItemDetailView({
          el: $(element),
          model: model,
          collection: this.accessory,
          type: this.type
        });
      } else {
        this.itemDetailView.Show(model, "Item");
      }

      this.CurrentItemDetailViewID = this.itemDetailView.cid;
      this.CurrentItemDetailModel = model;
      this.itemDetailView.SetCartInstance(this);

      this.isItemDetailViewOpen = true;
    },

    ShowFreeStock: function(model) {
      this.itemDetailView.Show(model, "FreeStock");
    },

    ShowAccessory: function(model) {
      this.itemDetailView.Show(model, "Accessory");
    },

    ShowSubstitute: function(model) {
      this.itemDetailView.Show(model, "Substitute");
    },

    ShowSerialLot: function(model) {
      this.trigger("ShowSerialLot", model);
    },

    RemoveItem: function(model) {      
    var self = this;
      Global.ManagerValidated = false;
      var maxDiscount = parseFloat(window.sessionStorage.getItem('MaxSaleDiscount'));
      window.sessionStorage.setItem('MaxSaleDiscount', (maxDiscount + model.get('Discount')));

      this.LastItemRemoved = model.attributes;
      this.RemoveKitItem(model);
  
/*  This will remove free items
   this.collection.each(function(freeItems){
    if(freeItems.get('BuyItemCode') != null){
      if(freeItems.get('BuyItemCode')[0].BuyItemCode.length == 1){
        if (freeItems.get('BuyItemCode')[0].BuyItemCode[0] == model.get('ItemCode')){
          self.collection.remove(freeItems);
          model.url = Global.ServiceUrl + "Transactions/" + "deletelinenum?PromoDocumentCode=" + model.get('PromoDocumentCode') + '&PromoID=' + model.get('PromoID') + '&RuleID=' + model.get('RuleID') + "&LineNum=" + model.get('BuyLineNum');
          model.save(null, {
          });
        }
      }
      else {
         for(i=0 ;i<freeItems.get('BuyItemCode')[0].BuyItemCode.length; i++){
          if(freeItems.get('BuyItemCode')[0].BuyItemCode[i] == model.get('ItemCode')){
            self.collection.remove(freeItems);
            model.url = Global.ServiceUrl + "Transactions/" + "deletelinenum?PromoDocumentCode=" + model.get('PromoDocumentCode') + '&PromoID=' + model.get('PromoID') + "&LineNum=" + model.get('BuyLineNum');
            model.save(null, {
               });
          }
         }
         }
       }
    });*/

    this.collection.remove(model);
      if (Global.TransactionType != Enum.TransactionType.SalesRefund) this.UpdateLineNum();
      Global.HasChanges = true;
      this.AddNetToInvoiceTotal(model, "delete");
      //this.LoadiScroll();
      this.trigger("ItemRemoved");
      this.trigger("updateSerialLot", model.get("ItemCode"));
      if (this.isItemDetailViewOpen) {
        this.itemDetailView.Close(); //INTMOBA-281
        this.isItemDetailViewOpen = false;
      }
      this.RefreshCartTable();
    },

    RemoveKitItem: function(model) {
      if (model.get('ItemType') == Enum.ItemType.Kit) {
        window.sessionStorage.removeItem('kitItems-' + model.get('LineNum'));
        window.sessionStorage.removeItem('kitBundleItems-' + model.get('LineNum'));
      }
    },

    UpdateLineNum: function() {      
      var updatedLineNum = this.collection.length + 1;
      this.collection.each(function(model, i) {
        model.set({
          LineNum: i + 1
        });
      })
    },

    RemoveSerial: function(model) {
      if (this.serialLot) {
        var _serialLot = this.serialLot.filter(function(serial) {
          if (Shared.IsNullOrWhiteSpace(serial.get("UnitMeasureCode"))) {
            return serial.get("ItemCode") === model.get("ItemCode") && serial.get("LineNum") === model.get("LineNum");
          } else return serial.get("ItemCode") === model.get("ItemCode") && serial.get("UnitMeasureCode") === model.get("UnitMeasureCode") && serial.get("LineNum") === model.get("LineNum");
        });


        if (_serialLot) {
          this.serialLot.remove(_serialLot);
        }
      }
    },

    ClearCart: function() {
      //this.$("#cartListContainer tbody").html("");
      this.$("#cartListContainer").html("");
      this.ResetSummaryModel();

      if (this.myScroll) {
        this.myScroll.destroy();
        this.myScroll = null;
        this.$("#cartListContainer").removeAttr("style");
      }
    },

    ResetSummaryModel: function() {
      this.summaryModel.set({
        SubTotal: 0,
        TotalTax: 0,
        Payment: 0,
        Balance: 0,
        Qty: 0,
        TaxDisplay: 0,
        TotalDiscount: 0,
        TotalCreditMemoAmount: 0,
      });
    },

    ViewPayments: function() {
      this.trigger("viewPayments", this);
    },

    ViewSignature: function() {
      this.trigger("viewSignature", this);
    },

    ViewTaxList: function() {
      this.trigger("viewTaxOverrideList", this);
    },

    ReinitializeCart: function() {
      if (Global.Preference.AllowSaleDiscount) window.sessionStorage.setItem('MaxSaleDiscount', Global.Preference.MaxSaleDiscount);
      this.ClearCart();
      this.totalView.render();
      this.ShowOutstanding(false);
    },

    ShowOutstanding: function(show) {
      if (show) {
        $(".itemRemaining").show();
        $(".itemName").addClass("itemNameRefund");
        $(".itemExtPrice").addClass("itemExtPriceRefund");
      } else {
        $(".itemRemaining").hide();
        $(".itemName").removeClass("itemNameRefund");
        $(".itemExtPrice").removeClass("itemExtPriceRefund");
      }
    },

    FetchSerialLotCollection: function(collection) {
      this.serialLot = collection;
      console.log(collection.toJSON());
    },

    LoadOrderNotes: function(type) {
      this.trigger("loadOrderNotes", type);
    },

    ShowNotes: function(type, model) {
      this.trigger("showNotes", type, model, Global.MaintenanceType.UPDATE);
    },

    UpdateSalesTaxAmountField: function(value, item) {
      this.UpdateField("SalesTaxAmountRate", value, item);
    },

    UpdateExtPriceField: function(value, item) {
      this.UpdateField("ExtPriceRate", value, item);
    },

    UpdateField: function(field, value, item) {
      if ($('#itemDetailContainer').is(':visible')) {
        if (this.itemDetailView) {
          if (this.itemDetailView.model) {
            var _self = this;
            var _itemCode = this.itemDetailView.model.attributes.ItemCode;
            var _unitMeasureCode = this.itemDetailView.model.attributes.UnitMeasureCode;
            var _lineNum = this.itemDetailView.model.attributes.LineNum;

            if (this.IsSameItem(this.itemDetailView.model, item)) {
              this.collection.each(
                function(model) {
                  if (model.get("ItemCode") === _itemCode &&
                    model.get("UnitMeasureCode") === _unitMeasureCode &&
                    model.get("LineNum") === _lineNum) {

                    if (field == "ExtPriceRate") _self.itemDetailView.UpdateExtPriceField(value);
                    else if (field == "SalesTaxAmountRate") _self.itemDetailView.UpdateSalesTaxAmountField(value);
                  }
                });
            }
          }
        }
      }
    },

    IsSameItem: function(_tmpModel, _srcModel) {
      var _mdl1 = _tmpModel.attributes;
      var _mdl2 = _srcModel.attributes;

      if (_mdl1.ItemCode === _mdl2.ItemCode && _mdl1.UnitMeasureCode === _mdl2.UnitMeasureCode && _mdl1.LineNum === _mdl2.LineNum) return true;
      return false;
    },

    EditKit: function(model) {
      this.trigger('editKitItem', model, true);
    }
  });
  return CartView;
});