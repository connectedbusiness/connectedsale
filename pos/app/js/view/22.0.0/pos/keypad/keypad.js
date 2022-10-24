/**
 * Connected Business | 05-24-2012
 * Required: el, collection
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'text!template/23.0.0/pos/keypad/keypad.tpl.html',
  'js/libs/format.min.js'
], function($, $$, _, Backbone, Global, template) {

  var PaymentsView = Backbone.View.extend({
    _template: _.template(template),
    _currentAmount: '',

    events: {
      "tap a": "button_tap"
    },

    render: function() {
      this.$el.html(this._template({
        CurrencySymbol: Global.CurrencySymbol,
      }));
      this.isFromInitialize = true;
      if (Global.isBrowserMode) this.BindKeyDownEvent();
    },

    BindKeyDownEvent: function() {
      var self = this;
      $(document).bind('keydown', function(e) {
        var tag = e.target.tagName.toLowerCase();
        if (tag != 'input' && tag != 'textarea') {
          self.DoBindKeypressValues(e);
        }
      });
    },

    DoBindKeypressValues: function(e) {
      switch (e.which) {
        case 96:
        case 48:
          $("#num-zero").tap();
          break;
        case 97:
        case 49:
          $("#num-one").tap();
          break;
        case 98:
        case 50:
          $("#num-two").tap();
          break;
        case 99:
        case 51:
          $("#num-three").tap();
          break;
        case 100:
        case 52:
          $("#num-four").tap();
          break;
        case 101:
        case 53:
          $("#num-five").tap();
          break;
        case 102:
        case 54:
          $("#num-six").tap();
          break;
        case 103:
        case 55:
          $("#num-seven").tap();
          break;
        case 104:
        case 56:
          $("#num-eight").tap();
          break;
        case 105:
        case 57:
          $("#num-nine").tap();
          break;

        case 13:
          this.trigger('enterTriggered');
          console.log('enter');
          break;
        case 46:
          $("#num-clear").tap();
          break;
        case 189:
        case 109:
          $("#num-sign").tap();
          break;
      }
      if (e.preventDefault) e.preventDefault(); //CSL-22605
    },

    Show: function() {
      this.render();
    },

    button_tap: function(e) {
      e.preventDefault();
      if (e.target.text) {
        this.ProcessKeyPressed(e.target.text);
      }
    },

    ProcessKeyPressed: function(value) {
      if (this.isFromInitialize) {
        this.ResetAmount();
        this.isFromInitialize = false;
      }

      var _currentAmount = this.$(".keypad-amount").html();
      var _lastAmount = _currentAmount; //jj
      //var _currentAmount = this._currentAmount;

      if (value === "+/-") {
        this.ApplyNegativeValue();
        return;
      }

      //remove the decimal point
      _currentAmount = _currentAmount.replace(".", "");

      switch (value) {
        case "1":
          _currentAmount = _currentAmount + "1";
          break;
        case "2":
          _currentAmount = _currentAmount + "2";
          break;
        case "3":
          _currentAmount = _currentAmount + "3";
          break;
        case "4":
          _currentAmount = _currentAmount + "4";
          break;
        case "5":
          _currentAmount = _currentAmount + "5";
          break;
        case "6":
          _currentAmount = _currentAmount + "6";
          break;
        case "7":
          _currentAmount = _currentAmount + "7";
          break;
        case "8":
          _currentAmount = _currentAmount + "8";
          break;
        case "9":
          _currentAmount = _currentAmount + "9";
          break;
        case "0":
          _currentAmount = _currentAmount + "0";
          break;
        case "C":
          _currentAmount = "0.00";
          this.ResetAmount();
      }

      var _newAmount = "0.00"; //var displayAmount ="0.00";
      if (_currentAmount != "0.00") {
        var _startIndex = 0;
        var _length = _currentAmount.length - 2;
        var _negative = "";

        if (_currentAmount.charAt(0) === "0") {
          _startIndex = 1;
          _length = _currentAmount.length - 3;
        } else if (_currentAmount.charAt(0) === "-" && _currentAmount.charAt(1) === "0") {
          _startIndex = 2;
          _length = _currentAmount.length - 4;
          _negative = "-";
        }

        //get first part - before the decimal

        var str1 = _currentAmount.substr(_startIndex, _length);
        //get second part - decimal
        var str2 = _currentAmount.substr(_currentAmount.length - 2);

        //insert decimal point

        if (_lastAmount.length - 2 < 15) //jj
        {
          _newAmount = _negative + str1 + "." + str2;
          this.ModifyAmountStyle(_newAmount);
          this.$(".keypad-amount").html(this.formatAmount(_newAmount)); //jj
        } else {
          this.ModifyAmountStyle(_lastAmount);
          this.$(".keypad-amount").html(this.formatAmount(_lastAmount)); //jj
        } //jj
      }
    },

    ModifyAmountStyle: function(amount) {
      if (amount.length > 15) this.$("div.calcfield").attr("style", "font-size: 37px;")
    },

    formatAmount: function(nStr) /*jj*/ {
      var i = nStr.replace(",", "");
      var display = i.replace(",", "");
      var val = format("#,##0.00", display.replace(",", ""));
      return val;
    },

    GetActualAmount: function(num) {
      var i = num.replace(",", "");
      var display = i.replace(",", "");
      var val = display.replace(",", "");
      return val;
    },

    ResetAmount: function() {
      this.$(".keypad-amount").html("0.00");
    },

    ApplyNegativeValue: function() {
      var _currentAmount = this.$(".keypad-amount").html();
      var _newAmount = ""

      if (_currentAmount.charAt(0) === "-") {
        //remove the negative
        _newAmount = _currentAmount.replace("-", "");
      } else {
        //add the negative
        _newAmount = "-" + _currentAmount;
      }

      this.$(".keypad-amount").html(this.formatAmount(_newAmount));
    },

    GetAmount: function() {
      var _amount = this.$(".keypad-amount").html();
      var _newAmount = this.GetActualAmount(_amount);
      return parseFloat(_newAmount);
      //return parseFloat(this.$(".keypad-amount").html());
    },

    SetAmount: function(amount) {
      if (amount.length > 12) this.$("div.calcfield").attr("style", "font-size: 37px;")
      this.$(".keypad-amount").html(this.formatAmount(amount));
      this._currentAmount = amount;
    }

  });
  return PaymentsView;
});
