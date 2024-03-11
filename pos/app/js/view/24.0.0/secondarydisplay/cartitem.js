/**
 * Connected Business | 05-09-2013
 * Required: model
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'bigdecimal',
  'shared/enum',
  'shared/global',
  'shared/shared',
  'text!template/24.0.0/secondarydisplay/cartitem.tpl.html',
  'js/libs/format.min.js'
], function($, $$, _, Backbone, BigDecimal, Enum, Global, Shared, template) {

  var ItemView = Backbone.View.extend({
    _template: _.template(template),
    tagName: "tbody",

    initialize: function() {
      this.model.bind("change", this.UpdateCart, this);
    },

    render: function() {
      this.ManageBinding();
      this.$el.html(this._template(this.model.toJSON()));
      this.$el.attr("id", this.cid);

      if (this.model.get('ItemType') != Enum.ItemType.Kit) {
        this.$el.find('#display-itemName').attr('style', 'width:100%; display: table-cell;');
      } else {
        this.$el.find('#display-kit').show().attr('style', 'display: table-cell; width: 20%; vertical-align: middle;');
      }
      return this;
    },

    AddCommas: function(price) {
      price += '';
      x = price.split('.');
      x1 = x[0];
      x2 = x.length > 1 ? '.' + x[1] : '';
      var rgx = /(\d+)(\d{3})/;
      while (rgx.test(1)) {
        x1 = x1.replace(rgx, '$1' + ',' + '$2');
      }
      return x1 + x2;
    },


    ManageBinding: function() {
      var hasSubItem = false;
      var _quantityDisplay, limit = 12;
      var _outstandingQuantity = this.model.get("Outstanding");
      var _coupounLenght = 1;
      //Display Defective instead of Quantity Ordered for Return/Refund transactions
      switch (Global.TransactionType) {
        case Enum.TransactionType.SalesRefund:
          _quantityDisplay = this.model.get("Good"); //Originally Defective
          break;
        default:
          _quantityDisplay = this.model.get("QuantityOrdered");
          _outstandingQuantity = 0;
          break;
      }

      //break down the item name for display purposes
      var _itemName = this.model.get("ItemName");

      var _itemNamelineBreak = "<br />";
      var _couponDiscountLineBreak = "<br />";

      _itemName = Shared.Escapedhtml(_itemName);

      //format coupon
      var _couponCode = this.model.get("CouponCode");

      var _formattedCouponDiscountAmount = this.model.get("CouponDiscountRate");
      if (!this.IsNullOrWhiteSpace(_formattedCouponDiscountAmount)) {
        _coupounLenght = _formattedCouponDiscountAmount.length;
      }
      if (_couponCode == null || _couponCode.trim() === "") {
        _itemNamelineBreak = "";
        _couponDiscountLineBreak = "";
        _formattedCouponDiscountAmount = "";
      } else {
        if (_formattedCouponDiscountAmount) {
          if (this.model.get("CouponDiscountType") === "Percent") {
            _formattedCouponDiscountAmount = _formattedCouponDiscountAmount + " %";
          } else {
            _formattedCouponDiscountAmount = "(" + _formattedCouponDiscountAmount.toFixed(2) + ")";
          }
        }

        if (_itemName.length > limit) {
          _couponCode = "" + _couponCode;
        }
        limit = 14;

        //_couponCode = this.FormatName(_couponCode);
        /*
	    		if(_couponCode.length > limit){
	    			var _couponCode1 = _couponCode.substr(0,(limit-1));
	    			var _couponCode2 = _couponCode.substr((limit-1),_couponCode.length-1);
	    			if (_couponCode2.length > limit) {
	    				_couponCode2 = _couponCode.substr((limit-1), (limit-1)) + "...";
	    			}
	    			_couponCode = _couponCode1 + _couponDiscountLineBreak + _couponCode2;
	    			_couponCodeDiscountLineBreak = "";
		    	}*/
      }

      //add comma
      // jj support for vat invoice
      var hasTax = false;
      var hasCoupon = false;
      var _itemPrice = format("#,##0.00", this.model.get("ExtPriceRate"));
      if (this.model.get('IsIncludedInCoupon') === false && Global.CouponIncludeAll === false) {
        _couponCode = null;
        _formattedCouponDiscountAmount = null;
        _couponDiscountLineBreak = "";
        hasSubItem = false;
      }
      if (!this.IsNullOrWhiteSpace(_couponCode)) {
        hasSubItem = true;
        hasCoupon = true;
      }
      var _isAllowTaxOnLineItems = Global.WorkStationPreference.get("AllowTaxOnLineItems");
      if (_isAllowTaxOnLineItems == true) {
        hasSubItem = true;
      }
      if (hasSubItem == true) {
        _cartAlign = "top";
      }

      var _salesTaxAmt = this.model.get("SalesTaxAmountRate");
      var itemTax = format("#,##0.00", this.RoundNumber(_salesTaxAmt, 2));
      //var itemTax = format("#,##0.00", this.model.get("SalesTaxAmountRate"));
      var taxLabel = "Sales Tax";

      if (this.IsNullOrWhiteSpace(itemTax) || parseFloat(itemTax) == 0) {
        itemTax = "";
        taxLabel = "";
      } else {
        hasTax = true;
      }

      var showTax = "none";
      var showCoupon = "none";
      if (hasCoupon == true) {
        showCoupon = "";
      }
      if (hasTax == true && _isAllowTaxOnLineItems == true) {
        showTax = "";
      } else {
        if (hasCoupon == true) _couponDiscountLineBreak = "";
      }

      // end - jj support for vat invoice

      this.model.set({
        FormattedItemName: _itemName,
        Outstanding: _outstandingQuantity,
        QuantityDisplay: _quantityDisplay,
        DisplayExtPriceRate: _itemPrice,
        FormattedCouponCode: _couponCode,
        FormattedCouponDiscountAmount: _formattedCouponDiscountAmount,
        ItemNameLineBreak: _itemNamelineBreak,
        CouponDiscountLineBreak: _couponDiscountLineBreak,
        TaxLabel: taxLabel,
        TaxAmount: itemTax,
        ShowTax: showTax,
        ShowCoupon: showCoupon
      }, {
        silent: true
      });



    },

    RoundNumber: function(value, decimalPlaces) {
      if (!value) return value;
      var formattedValue = format("0.0000", value)
      var bigDecimal = new BigDecimal.BigDecimal(formattedValue);
      return parseFloat(bigDecimal.setScale(decimalPlaces, BigDecimal.MathContext.ROUND_HALF_UP) * 1);
    },


    IsNullOrWhiteSpace: function(str) { //jj
      if (!str) {
        return true;
      }
      if (str === "" || str === null || str === undefined) {
        return true;
      }
      return false;
    },
    FormatName: function(str) {
      var tmpCode = str.replace(/\s+/g, " ").trim(); //eliminates double white spaces @ beginning , inbetween and end of the string.
      var n = tmpCode.indexOf(" ");
      var wordArray = tmpCode.split(" ");
      var LINELIMIT = 12,
        LIMIT = 24,
        formattedArray = [];
      var _couponDiscountLineBreak = "<br />";

      if (tmpCode.length > LINELIMIT && (n > LINELIMIT || n === -1)) { //no whitespace and exceeds to linelimit.
        formattedArray[0] = tmpCode.substr(0, LINELIMIT - 1);
        formattedArray[1] = str.substr(LINELIMIT - 1, tmpCode.length);
      } else {
        var strLength = 0,
          clonedArray = wordArray;
        formattedArray[0] = '';
        for (var indx = 0; indx < clonedArray.length; indx++) {
          if (strLength < LIMIT) {
            if (wordArray[indx].length > LINELIMIT) { //checks if word exceeds the linelimit.
              formattedArray[0] = formattedArray[0] + clonedArray[indx].substr(0, LINELIMIT) + _couponDiscountLineBreak;
              var charLeft = clonedArray[indx].substr(LINELIMIT, clonedArray[indx].length)
              clonedArray[indx + 1] = charLeft + clonedArray[indx + 1] // adds the character left from previous value to the next array value.
            } else {
              formattedArray[0] = formattedArray[0] + clonedArray[indx] + ' ';
            }
            strLength = formattedArray[0].length;
            var lastIndx = indx;
          }
        }
        // assigsn formattedArray.
        if (lastIndx === wordArray.length) {
          formattedArray[0] = formattedArray[0];
        } else if (lastIndx < wordArray.length) {
          formattedArray[0] = formattedArray[0].substr(0, LIMIT - 3) + '...';
        } else { //if (formattedArray[1].length > LIMIT + 3) {
          formattedArray[0] = formattedArray[0].substr(0, LIMIT - 3) + '...';
        }
      }
      var formattedName = '',
        tmpLength = 0;
      formattedName = formattedArray[0];

      if (formattedArray[1] !== undefined) {
        console.log('in');
        if (formattedArray[1].length > LINELIMIT - 3) {
          formattedName = formattedName + _couponDiscountLineBreak + formattedArray[1].substr(0, LINELIMIT - 3) + '...';
        } else {
          formattedName = formattedName + formattedArray[1]
        }
      }

      console.log(formattedName)
      return formattedName;
    },

    UpdateCart: function() {
      this.render();
    }
  });
  return ItemView;
});
