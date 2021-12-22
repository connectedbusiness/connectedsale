/**
 * Connected Business | 05-1-2012
 * Required: model
 * Edited by: Alexis A. Banaag
 * Changes : added quick edit in cart Item; Alphabeticalized functions
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
  'shared/service',
  'shared/method',
  'view/22.0.0/pos/reason/itemreason',
  'view/22.0.0/pos/manageroverride/manageroverride',
  'model/lookupcriteria',
  'model/reason',
  'model/override',
  'model/base',
  'collection/reasons',
  'collection/base',
  'text!template/22.0.0/pos/cart/cartItem.tpl.html',
  'js/libs/format.min.js'
], function($, $$, _, Backbone, BigDecimal, Enum, Global, Shared, Service, Method,
  ItemReasonView, ManagerOverrideView,
  LookupCriteriaModel, ReasonModel, OverrideModel, BaseModel,
  ReasonCollection, BaseCollection,
  template) {
  var discount = "";
  var FieldName = {
    Discount: "Discount",
    Price: "SalesPriceRate",
    Quantity: "QuantityOrdered"
  };

  var ClassID = {
    Price: " #changePrice-input ",
    Qauntity: " #changeQuantity-input ",
    Discount: " #changeDiscount-input "
  }

  var ItemView = Backbone.View.extend({
    _template: _.template(template),
    tagName: "tbody",

    events: {
      "swipeleft td": "td_swipeleft",
      "swiperight td": "td_swiperight",
      "tap .remove-itembutton": "removeItem_tap",
      "tap #display-kit": "displayKit"
    },

    resetItemTapEvents: function() {
      this.$("#" + this.model.cid).find(".itemName").find("#display-itemName").off("tap").on("tap", function(e) {
        this.itemName_tap(e);
      }.bind(this));
    },

    displayKit: function(e) {
      e.stopImmediatePropagation();
      var code = this.model.get('ItemCode') + '-' + this.model.get('LineNum');
      var element = $("#kit-" + code);
      if (element.is(":hidden")) {
        element.show().fadeIn('slow');
        this.$(e.currentTarget).find("i").attr("class", "icon-chevron-up");
      } else {
        element.hide().fadeOut('slow');
        this.$(e.currentTarget).find("i").attr("class", "icon-chevron-down");
      }
    },

    bindEvents: function() {      
      $("#kit-" + this.model.get('ItemCode') + '-' + this.model.get('LineNum')).find('#kit-edit').on("tap", function(e) {
        e.preventDefault();
        this.model.editKit();
      }.bind(this));

      if (Global.TransactionType != Enum.TransactionType.SalesPayment && Global.TransactionType != Enum.TransactionType.VoidTransaction) {
        //$("#"+this.cid+" #quantityDisplay").on("tap",  function(e){  self.changeQty_tap();  });
        //$("#"+this.cid+" #changeQuantity-input").on("change", function(e) { self.finalizeChangeQty_tap(e); });
        //$("#"+this.cid+" #changeQuantity-input").on("focusout", function(e) { self.finalizeFocusOutQty_tap(e); });
        //$("#"+this.cid+" #changeQuantity-input").on("focus", function(e) { 	Shared.Input.NonNegative("#"+self.cid+" #changeQuantity-input"); });
        this.$el.find("#quantityDisplay").on("tap", function(e) {
          e.preventDefault();
          this.changeQty_tap();
        }.bind(this));
      }

    //  if (Global.Preference.AllowItemDiscount && ((Global.TransactionType != Enum.TransactionType.SalesRefund && Global.TransactionType != Enum.TransactionType.Return) && Global.TransactionType != Enum.TransactionType.SalesPayment && Global.TransactionType != Enum.TransactionType.VoidTransaction)) {
      if (Global.Preference.AllowItemDiscount && (Global.TransactionType != Enum.TransactionType.Return && Global.TransactionType != Enum.TransactionType.SalesPayment && Global.TransactionType != Enum.TransactionType.VoidTransaction)) {
        //$("#"+this.cid+" #discountDisplay").on("tap",  function(e){  self.changeDiscount_tap();  });
        //$("#"+this.cid+" #changeDiscount-input").on("change", function(e) { self.finalizeChangeDiscount_tap(e); });
        //$("#"+this.cid+" #changeDiscount-input").on("focusout", function(e) { self.finalizeFocusOutDiscount_tap(e); });
        //$("#"+this.cid+" #changeDiscount-input").on("focus", function(e) { Shared.Input.NonNegative("#"+self.cid+" #changeDiscount-input"); });
        this.$el.find("#discountDisplay").on("tap", function(e) {
          e.preventDefault();
          this.changeDiscount_tap();
        }.bind(this));
      }

      if (Global.Preference.AllowChangePrice && ((Global.TransactionType != Enum.TransactionType.SalesRefund && Global.TransactionType != Enum.TransactionType.Return) && Global.TransactionType != Enum.TransactionType.SalesPayment && Global.TransactionType != Enum.TransactionType.VoidTransaction) && this.model.get('ItemType') != Enum.ItemType.Kit) {
        //$("#"+this.cid+" #itemPriceDisplay").on("tap",  function(e){  self.changePuurice_tap();  });
        //$("#"+this.cid+" #changePrice-input").on("change", function(e) { self.finalizeChangePrice_tap(e); });
        //$("#"+this.cid+" #changePrice-input").on("focusout", function(e) { self.finalizeFocusOutPrice_tap(e); });
        //$("#"+this.cid+" #changePrice-input").on("focus", function(e) { Shared.Input.NonNegative("#"+self.cid+" #changePrice-input"); });
        this.$el.find("#itemPriceDisplay").on("tap", function(e) {
          e.preventDefault();
          this.changePrice_tap();
        }.bind(this));
      }
      this.PreventRemoveItem();
    },

    HasCoupon: function() {
      if (!Global.Coupon) return false;
      if (!Global.Coupon.get("CouponCode") || Global.Coupon.get("CouponCode") == "") return false;
      return true;
    },

    toggleBindEvents: function(inputID, isBind) {
      //var self = this;
      switch (inputID) {
        case ClassID.Qauntity:
          if (Global.TransactionType != Enum.TransactionType.SalesPayment && Global.TransactionType != Enum.TransactionType.VoidTransaction) {
            if (isBind) {
              var id = "#" + this.cid + " #changeQuantity-input";
              $(id).on("keypress", function(e) {
                if (Global.TransactionType !== Enum.TransactionType.SalesRefund)
                  if ($(id).val().length == 0 && e.which == 48) return false;
              }.bind(this));

              $(id).on("change", function(e) {
                this.finalizeChangeQty_tap(e);
              }.bind(this));

              $("#" + this.cid + " #changeQuantity-input").on("focusout", function(e) {
                this.finalizeFocusOutQty_tap(e);
              }.bind(this));

              if (this.ValidateNegativeQuantity(-1) && !this.HasCoupon() && !this.IsGiftCredits()) {
                $(id).on("focus", function(e) {
                  Shared.Input.Integer("#" + this.cid + " #changeQuantity-input");
                }.bind(this));
              } else {
                $(id).on("focus", function(e) {
                  Shared.Input.NonNegative("#" + self.cid + " #changeQuantity-input");
                }.bind(this));
              }
            } else {
              $("#" + this.cid + " #changeQuantity-input").off("change");
              $("#" + this.cid + " #changeQuantity-input").off("focusout");
              $("#" + this.cid + " #changeQuantity-input").off("focus");
            }
          }
          break;
        case ClassID.Discount:
          //if (Global.Preference.AllowItemDiscount && ((Global.TransactionType != Enum.TransactionType.SalesRefund && Global.TransactionType != Enum.TransactionType.Return) && Global.TransactionType != Enum.TransactionType.SalesPayment && Global.TransactionType != Enum.TransactionType.VoidTransaction)) {
          if (Global.Preference.AllowItemDiscount && (Global.TransactionType != Enum.TransactionType.Return && Global.TransactionType != Enum.TransactionType.SalesPayment && Global.TransactionType != Enum.TransactionType.VoidTransaction)) {
            if (isBind) {
              var id = "#" + this.cid + " #changeDiscount-input";

              $(id).on("change", function(e) {
                this.finalizeChangeDiscount_tap(e);
              }.bind(this));

              $(id).on("focusout", function(e) {
                this.finalizeFocusOutDiscount_tap(e);
              }.bind(this));

              $(id).on("focus", function(e) {
                Shared.Input.NonNegative("#" + this.cid + " #changeDiscount-input");
              }.bind(this));

              $(id).on("keypress", function(e) {
                Shared.MaxDecimalPlaceValidation(this.$("#changeDiscount-input"), e, "#" + this.cid)
              }.bind(this));
            } else {
              $("#" + this.cid + " #changeDiscount-input").off("change");
              $("#" + this.cid + " #changeDiscount-input").off("focusout");
              $("#" + this.cid + " #changeDiscount-input").off("focus");
            }
          }
          break;
        case ClassID.Price:
          if (Global.Preference.AllowChangePrice && ((Global.TransactionType != Enum.TransactionType.SalesRefund &&
                Global.TransactionType != Enum.TransactionType.Return) &&
              Global.TransactionType != Enum.TransactionType.SalesPayment &&
              Global.TransactionType != Enum.TransactionType.VoidTransaction)) {
            if (isBind) {
              var id = "#" + this.cid + " #changePrice-input";

              $(id).on("change", function(e) {
                this.finalizeChangePrice_tap(e);
              }.bind(this));

              $(id).on("focusout", function(e) {
                this.finalizeFocusOutPrice_tap(e);
              }.bind(this));

              $(id).on("focus", function(e) {
                console.log('FOCUS' + e.currentTarget.value);
                Shared.Input.NonNegative("#" + this.cid + " #changePrice-input");
              }.bind(this));

              $(id).on("keypress", function(e) {
                Shared.MaxDecimalPlaceValidation(this.$("#changePrice-input"), e, "#" + this.cid);
              }.bind(this));

              $(id).on("keyup", function(e) {
                if (e.currentTarget.value == '.') {
                  $(id).val("0.").focus();
                }
              }.bind(this));
            } else {
              $("#" + this.cid + " #changePrice-input").off("change");
              $("#" + this.cid + " #changePrice-input").off("focusout");
              $("#" + this.cid + " #changePrice-input").off("focus");
            }
          }
          break;
      }
    },

    changeDiscount_tap: function() {
      if (this.model.get("QuantityOrdered") < 0) return;
      $("#" + this.cid + " #discountDisplay").hide();
      $("#" + this.cid + " #changeDiscount-container").show();
      $("#" + this.cid + " #changeDiscount-input").val("");
      this.toggleBindEvents(ClassID.Discount, true);
      $("#" + this.cid + " #changeDiscount-input").focus();
    },

    changePrice_tap: function() {
      if (Global.TransactionType == Enum.TransactionType.Recharge) return;
      $("#" + this.cid + " #itemPriceDisplay").hide();
      $("#" + this.cid + " #changePrice-container").show();
      $("#" + this.cid + " #changePrice-input").val("");
      this.toggleBindEvents(ClassID.Price, true);
      $("#" + this.cid + " #changePrice-input").focus();
    },

    changeQty_tap: function() {
      if (Global.TransactionType == Enum.TransactionType.Recharge) return;
      $("#" + this.cid + " #quantityDisplay").hide();
      $("#" + this.cid + " #changeQuantity-container").show();
      $("#" + this.cid + " #changeQuantity-input").val("");
      this.toggleBindEvents(ClassID.Qauntity, true);
      $("#" + this.cid + " #changeQuantity-input").focus();
    },

    finalizeChangeDiscount_tap: function(e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      if (!this.ContinueNextLine()) return;
      if (e.type == "change") $("#" + this.cid + " #changeDiscount-input").off("focusout");
      this.processDiscount();
      this.HideKeyboard();
    },

    finalizeChangePrice_tap: function(e) {
      e.stopImmediatePropagation();
      if (e.type == "change") $("#" + this.cid + " #changePrice-input").off("focusout");
      var priceInput = $("#" + this.cid + " #changePrice-input");
      console.log("PRICE: " + priceInput.val())
      this.processPrice();
    },

    finalizeChangeQty_tap: function(e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      if (e.type == "change") $("#" + this.cid + " #changeQuantity-input").off("focusout");
      this.processQuantity();
    },

    finalizeFocusOutDiscount_tap: function(e) {
      e.preventDefault();
      e.stopImmediatePropagation();
      if (e.type == "focusout") $("#" + this.cid + " #changeDiscount-input").off("change");
      this.processDiscount();
    },

    finalizeFocusOutPrice_tap: function(e) {
      e.stopImmediatePropagation();
      if (e.type == "focusout") $("#" + this.cid + " #changePrice-input").off("change");
      this.processPrice();
    },

    finalizeFocusOutQty_tap: function(e) {
      e.stopImmediatePropagation();
      if (e.type == "focusout") $("#" + this.cid + " #changeQuantity-input").off("change");
      this.processQuantity();
    },

    itemName_tap: function(e) {
      e.preventDefault();
      this.ViewDetails();
    },

    magnifier_touchstart: function(e) {
      e.preventDefault();
      this.ViewDetails();
    },

    td_swipeleft: function(e) {
      e.stopPropagation;
      if (Global.TransactionType == Enum.TransactionType.Recharge) {
        this.NotifyMsg('Item modification is not allowed in recharge Transaction.', 'Invalid action');
      } else {
        if (Global.TransactionType == Enum.TransactionType.ConvertQuote)
          if (this.model.get("QuantityOrdered") == 0) return;
        if (this.IsAllowedToDeductQuantity()) {
          this.SubtractQuantity();
        }
      }
    },

    td_swiperight: function(e) {
      e.stopPropagation;
      if (Global.TransactionType == Enum.TransactionType.Recharge) {
        this.NotifyMsg('Item modification is not allowed in recharge Transaction.', 'Invalid action');
      } else this.AddQuantity();
    },

    processDiscount: function() {
      var newDiscount = $("#" + this.cid + " #changeDiscount-input").val().trim();
      if (!this.IsNullOrWhiteSpace(newDiscount)) {
        if (this.ValidateDiscount("Discount")) {
          this.UpdateFieldValue(FieldName.Discount);
          //return;  //<-- ORIGINALLY HERE (added for scenario of changing discount but putting the same value and pressing return/enter and the click on discount of another line item) BY: Jhenson
        }
      }

      $("#" + this.cid + " #discountDisplay").show();
      $("#" + this.cid + " #changeDiscount-container").hide();
      this.toggleBindEvents(ClassID.Discount, false);
    },

    processPrice: function() {
      var newPrice = $("#" + this.cid + " #changePrice-input").val().trim();
      this.price = newPrice;
      if (!this.IsNullOrWhiteSpace(newPrice)) {
        Global.ActionType = Enum.ActionType.ChangePrice;
        if (this.ValidateManagerOverride(Global.ActionType)) {
          this.UpdateFieldValue(FieldName.Price);
        }
      }

      $("#" + this.cid + " #itemPriceDisplay").show();
      $("#" + this.cid + " #changePrice-container").hide();
      this.toggleBindEvents(ClassID.Price, false);
    },

    processQuantity: function() {
      var newQty = $("#" + this.cid + " #changeQuantity-input").val().trim();
      if (!this.IsNullOrWhiteSpace(newQty)) {
        this.UpdateFieldValue(FieldName.Quantity);
      }

      $("#" + this.cid + " #quantityDisplay").show();
      $("#" + this.cid + " #changeQuantity-container").hide();
      this.toggleBindEvents(ClassID.Qauntity, false);
    },

    removeItem_tap: function(e) {
      e.preventDefault();
      //if (Global.TransactionType === Enum.TransactionType.SalesPayment || Global.TransactionType === Enum.TransactionType.VoidTransaction ||
      //	Global.TransactionType === Enum.TransactionType.Recharge || Global.TransactionType === Enum.TransactionType.SalesRefund) return;
      if (this.PreventRemoveItem()) return;

      this.CheckReason(Enum.ActionType.VoidItem);
    },

    HideKeyboard: function() {
      //Hide keyboard
      if (!Global.isBrowserMode) {
        document.activeElement.blur();
        $("input").blur();
      }
    },

    initialize: function() {      
      this.type = this.options.type;
      this.totalDiscount = this.options.totalDiscount;
      this.model.on("change", this.UpdateCart, this);
      this.model.on("remove", this.RemoveItemFromCart, this);

      if (this.model.get("IsPromoItem")) this.$el.attr('style', 'background: #ECF5FE');
    },

    render: function() {      
      this.ManageBinding();
      var cid = this.model.cid;
      var tmpModel = new BaseModel();
      tmpModel.set(this.model.attributes);
      tmpModel.set({
        cid: cid
      });

      switch (this.type) {
        case "POS":
          this.$el.html(this._template(tmpModel.toJSON()));
          break;
      }

      this.$el.attr("id", this.cid);
      //toggle outstanding column visibility
      var _showOutstanding = (Global.TransactionType === Enum.TransactionType.SalesRefund);
      this.ShowOutstanding(_showOutstanding);
      this.PreventRemoveItem();
      this.AdjustElementStyle();

      this.resetItemTapEvents();

      if (this.model.get("IsPromoItem")){        
        this.$el.find(".cart-details").addClass("promo-item");        
      }

      this.displayPromoCaption();
      return this;
    },

    displayPromoCaption: function(){             
      var promoel = document.getElementsByClassName("promo-item");
        for (x=0;x<=promoel.length-1;x++){
          var child = promoel[x];
          //child.getElementsByClassName("icon-remove-sign")[0].style.display = "none";
           child.getElementsByClassName("promotag")[0].style.display = "block";
        };
    },


    renderKit: function() {
      this.$el.html(this.kitTemplate());
      return this;
    },

    AdjustElementStyle: function() {
      var _itemName = this.model.get("ItemName");
      var exceedsCharLimit = false;
      if (Global.Preference.IsUseItemDescription) _itemName = this.model.get("ItemDescription");
      if (_itemName.length > 12) {
        var substr = _itemName.split(' '),
          exceedsTwelveChar = false;

        for (var i in substr) {
          if (substr[i].length > 11) exceedsCharLimit = true;
        }

        if (exceedsCharLimit) this.$('#cart-itemName').css('word-break', 'break-all');
      }

      if (this.model.get('ItemType') != Enum.ItemType.Kit) {
        this.$el.find('#display-itemName').attr('style', 'display: table-cell;');
      } else {
        this.$el.find('#display-kit').show().attr('style', 'display: table-cell; width: 20%; vertical-align: middle;');
      }
    },

    CheckOnLoadIfPhasedOut: function() {
      var el_id = "#" + this.cid;
      var self = this;
      var value = this.model.get("QuantityOrdered");
      if (Shared.CheckIfItemIsPhaseout(this.model, value, 0, false, Global.CartCollection, true)) {
        if (Global.TransactionType == Enum.TransactionType.ConvertQuote) {
          // $(el_id).css('color','red');
          if (Shared.IsNullOrWhiteSpace(Global.AdjustedQtyItemCollection)) Global.AdjustedQtyItemCollection = new BaseCollection();
          if (Shared.AdjustPhasedOutItem(this.model, value, Global.CartCollection)) {
            Global.AdjustedQtyItemCollection.add(this.model);
          }
          navigator.notification.alert("One or more Item(s) is already phased out. The quantity must be lower than or equal the freestock", null, "Action Not Allowed", "OK");
        }
      }
      if (!Shared.IsNullOrWhiteSpace(Global.AdjustedQtyItemCollection)) {
        Global.AdjustedQtyItemCollection.each(function(item) {
          if (self.model.get("ItemCode") == item.get("ItemCode") && self.model.get("UnitMeasureCode") == item.get("UnitMeasureCode")) {
            $(el_id).css('color', 'red');
          }
        });
      }

    },
    PreventRemoveItem: function() {

      if (Global.TransactionType === Enum.TransactionType.SalesPayment || Global.TransactionType === Enum.TransactionType.VoidTransaction ||
        Global.TransactionType === Enum.TransactionType.Recharge /*|| Global.TransactionType === Enum.TransactionType.SalesRefund*/ ) {
        $("#" + this.cid + " .remove-itembutton i").css("color", "gray");
        return true;
      }

      if (Global.TransactionType === Enum.TransactionType.ConvertOrder) {
        if (Global.CurrentOrders)
          if (Global.CurrentOrders.length > 0) {
            var isCurrentOrder = false;
            var self = this;
            Global.CurrentOrders.each(function(model) {
              if (isCurrentOrder) return;
              if (self.model.get("ItemCode") == model.get("ItemCode") && self.model.get("UnitMeasureCode") == model.get("UnitMeasureCode")) isCurrentOrder = true;
            });
            if (isCurrentOrder) {
              $("#" + this.cid + " .remove-itembutton i").css("color", "gray");
              return true;
            }
          }
      }
      return false;
    },

    AcceptManagerOverride: function(username, password) {
      var self = this;
      var origUsername = Global.Username;
      var origPassword = Global.Password;
      var overrideModel = new OverrideModel();

      //Need to set the username and password for authentication
      Global.Username = username;
      Global.Password = password;
      overrideModel.url = Global.ServiceUrl + Service.POS + Method.MANAGEROVERRIDE + Global.POSWorkstationID + "/" + Global.OverrideMode;
      overrideModel.save(null, {
        success: function(model, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          self.AcceptManagerOverrideCompleted(model, response);
        },
        error: function(model, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          model.RequestError(error, "Error Saving Manager Override");
        }
      });

      //Reset the original username and password after manager override process
      Global.Username = origUsername;
      Global.Password = origPassword;
    },

    AcceptManagerOverrideCompleted: function(model, response) {
      if (response.ErrorMessage == null || response.ErrorMessage == "") {
        mode = Global.OverrideMode;

        if (mode === Enum.ActionType.ItemDiscount) {
          var newDiscount = $("#" + this.cid + " #changeDiscount-input").val().trim();

          if (!this.IsNullOrWhiteSpace(newDiscount)) this.UpdateFieldValue(FieldName.Discount);

          $("#" + this.cid + " #discountDisplay").show();
          $("#" + this.cid + " #changeDiscount-container").hide();

          if (Global.Preference.IsReasonDiscount) {
            this.SaveReason();
          }
        } else if (mode === "ChangePrice") {
          this.UpdateFieldValue(FieldName.Price); //this.processPrice();
        }
        this.managerOverrideView.Close();
      } else {
        console.log(response.ErrorMessage);
        navigator.notification.alert(response.ErrorMessage, null, "Override Failed", "OK");
      }
    },

    AcceptReason: function() {
      Global.ReasonViewRendered = false;
      switch (Global.ActionType) {
        case Enum.ActionType.ItemDiscount:
          if (this.ValidateManagerOverride(Global.ActionType)) {
            this.SaveReason();
            //this.UpdateFieldValue(FieldName.Discount);
          }
          break;
        default:
          if (this.ValidateManagerOverride(Global.ActionType)) {
            this.SaveReason();
            this.RemoveThisItem(this.model);
          }
      }
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

    AddQuantity: function() {
      var el_id = "#" + this.cid;
      $(el_id).css('color', 'black');
      if (Global.TransactionType === Enum.TransactionType.SalesPayment || Global.TransactionType === Enum.TransactionType.VoidTransaction) {
        return;
      }

      this.model.addQuantity();
    },

    CheckReason: function(type) {
      switch (type) {
        case Enum.ActionType.VoidItem:
          if (Global.ReasonCode.Item && Global.TransactionType != Enum.TransactionType.SalesRefund) {
            this.LoadReason(100, "", type);
          } else {
            this.model.removeSerial();
            this.model.removeItem();
          }
          break;
        default:
          this.LoadReason(100, "", type);
          break;
      }
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

    InitializeManagerOverrideView: function() {
      if (!this.managerOverrideView) {
        this.managerOverrideView = new ManagerOverrideView({
          el: $("#managerOverrideContainer")
        });
        this.managerOverrideView.on("ManagerOverrideAccepted", this.AcceptManagerOverride, this);
        this.managerOverrideView.on("CloseClicked", this.ResetValue, this);
      }
    },

    IsNullOrWhiteSpace: function(str) {
      if (!str) return true;
      if (str === "" || str === null || str === undefined) return true;
      return false;
    },

    IsNumeric: function(data) {
      return _.isNumber(data);
    },

    IsZero: function(str) {
      if (!str) return true;
      if (str === "0" || str === 0) return true;
      return false;
    },

    LoadReason: function(rows, criteria, type) {
      var i;
      if (i) i++;
      console.log("REPEAT:" + i);
      var _self = this;
      var _reasonLookup = new LookupCriteriaModel();
      var _rowsToSelect = rows;
      var _actionType = Global.ActionType;

      //Initialize collection
      if (this.itemReasonCollection) {
        this.itemReasonCollection.reset();
      } else {
        this.itemReasonCollection = new ReasonCollection();
        this.itemReasonCollection.unbind();
        this.itemReasonCollection.on('acceptReason', this.AcceptReason, this);

        if (type === Enum.ActionType.ItemDiscount || type === Enum.ActionType.SaleDiscount || type === Enum.ActionType.VoidItem) {
          this.itemReasonCollection.on('savedItem', this.ProceedToAction, this);
        } else this.itemReasonCollection.off('savedItem', this.ProceedToAction, this);
      }


      _reasonLookup.set({
        StringValue: criteria
      })

      _reasonLookup.url = Global.ServiceUrl + Service.POS + Method.REASONLOOKUP + _rowsToSelect;
      _reasonLookup.save(null, {
        success: function(model, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator(); //CSL-5031
          _self.itemReasonCollection.reset(response.Reasons, {
            silent: true
          });
          _self.ShowReasonView(_self.itemReasonCollection, type);
        },
        error: function(model, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator(); //CSL-5031
          model.RequestError(error, "Error Loading Reason Codes");
        }
      });

    },

    ManageBinding: function() {
      var hasSubItem = false;
      var _quantityDisplay, limit = 12;
      var _outstandingQuantity = this.model.get("Outstanding");
      var _coupounLenght = 1;
      var _couponDiscountLineBreak = "<br />";
      var _itemNamelineBreak = "<br />";

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
      if (Global.Preference.IsUseItemDescription) _itemName = this.model.get("ItemDescription");

      _itemName = Shared.Escapedhtml(_itemName);

      //format coupon
      var _couponCode = this.model.get("CouponCode");

      if (_couponCode == null || _couponCode.trim() === "") {
        if (Global.Coupon)
          if (Global.Coupon.get("CouponID") != null) {
            _couponCode = Global.Coupon.get("CouponCode");
          }
      }

      var _formattedCouponDiscountAmount = this.model.get("CouponDiscountAmount");
      if (this.IsReturn() && this.model.get("Outstanding") < 1) _formattedCouponDiscountAmount = 0;

      if (!this.IsNullOrWhiteSpace(_formattedCouponDiscountAmount)) {
        _coupounLenght = _formattedCouponDiscountAmount.length;
      }


      if (_couponCode == null || _couponCode.trim() === "") {
        _itemNamelineBreak = "";
        _couponDiscountLineBreak = "";
        _formattedCouponDiscountAmount = "";
      } else {
        if (_formattedCouponDiscountAmount) {
          if (this.model.get("CouponDiscountType") === "Percent") _formattedCouponDiscountAmount = _formattedCouponDiscountAmount + " %";
          else _formattedCouponDiscountAmount = "(" + _formattedCouponDiscountAmount.toFixed(2) + ")";
        }

        if (_itemName.length > limit) _couponCode = "" + _couponCode;

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
      if (!this.IsNullOrWhiteSpace(_couponCode) && !(this.model.get("IsNewLine") && Global.TransactionType == Enum.TransactionType.SalesRefund /*CSL-9780*/ )) {
        hasSubItem = true;
        hasCoupon = true;
      }

      if (Global.Preference.AllowTaxOnLineItems == true) hasSubItem = true;
      if (hasSubItem == true) _cartAlign = "top";

      var _salesTaxAmt = this.model.get("SalesTaxAmountRate");
      var itemTax = format("#,##0.00", this.RoundNumber(_salesTaxAmt, 2));
      var taxLabel = "Sales Tax";

      if (this.IsReturn()) {
        var _rnd = parseFloat(parseFloat(_salesTaxAmt).toFixed(4));
        var _trim = parseFloat(this.preciseRound(_salesTaxAmt, 2));

        if (parseFloat((_rnd - _trim).toFixed(3)) == 0.005) itemTax = _trim;
        else itemTax = _rnd;

        itemTax = format("#,##0.00", this.RoundNumber(itemTax, 2));
      }

      if (this.IsNullOrWhiteSpace(itemTax) || parseFloat(itemTax) == 0) {
        itemTax = "";
        taxLabel = "";
      } else hasTax = true;

      var showTax = "none";
      var showCoupon = "none";
      if (hasCoupon == true) showCoupon = "";

      if (hasTax == true && Global.Preference.AllowTaxOnLineItems == true) showTax = "";
      else if (hasCoupon == true) _couponDiscountLineBreak = "";



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
      })
    },

    //method that slice down the decimal places.
    preciseRound: function(value, numOfDecimals) {
      if (numOfDecimals == null) numOfDecimals = 2;
      var num = value.toString();
      if (num.indexOf('.') == -1) return num;
      return num.substr(0, num.indexOf('.') + numOfDecimals + 1);
    },

    RoundNumber: function(value, decimalPlaces) {
      if (!value) return value;
      var formattedValue = format("0.0000", value)
      var bigDecimal = new BigDecimal.BigDecimal(formattedValue);
      return parseFloat(bigDecimal.setScale(decimalPlaces, BigDecimal.MathContext.ROUND_HALF_UP) * 1);
    },

    IsReturn: function() {
      if (Global.TransactionType === Enum.TransactionType.SalesRefund) return true;
      if (Global.TransactionType === Enum.TransactionType.SalesCredit) return true;
      return false;
    },

    ResetValue: function() {
      if (this.ItemReasonView) return;
      $("#" + this.cid + " #changePrice-input").val("");
      $("#" + this.cid + " #changeQuantity-input").val("");
      $("#" + this.cid + " #changeDiscount-input").val("");
    },

    RemoveItemFromCart: function() {
      $('#kit-' + this.model.get('ItemCode') + '-' + this.model.get('LineNum')).remove();
      $("#" + this.model.get("PromoDocumentCode")).remove();
      this.remove();
    },

    RemoveThisItem: function() {
      this.model.removeItem();
      this.trigger("RemoveItem");
    },

    SaveReason: function() {
      if (this.ItemReasonView) this.ItemReasonView.SaveReason();
    },

    SetActionType: function(type) {
      Global.ActionType = type;
    },

    ShowDeleteButton: function() {
      if (Global.TransactionType === Enum.TransactionType.SalesPayment || Global.TransactionType === Enum.TransactionType.SalesRefund) {
        return;
      }
      $(".deletebtn-overlay").hide();
      this.$(".deletebtn-overlay").show();
    },

    ShowManagerOverride: function() {
      this.InitializeManagerOverrideView();
      this.managerOverrideView.Show();
      return false;
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

    ShowReasonView: function(collection, type) {
      console.log('reasonView type :' + type);
      $("#reasonPageContainer").append("<div id='reasonMainContainer'></div>");
      if (this.ItemReasonView) {
        this.ItemReasonView.remove();
        this.ItemReasonView.unbind();
        this.ItemReasonView = null;
      } //this.ItemReasonView.Show(type, $("#reasonMainContainer"));

      this.ItemReasonView = new ItemReasonView({
        el: $("#reasonMainContainer"),
        collection: collection,
        type: type
      });
      Global.ActionType = type;
    },

    SubtractQuantity: function() {
      var el_id = "#" + this.cid;
      $(el_id).css('color', 'black');
      if (Global.TransactionType === Enum.TransactionType.SalesPayment || Global.TransactionType === Enum.TransactionType.VoidTransaction) return;
      if (this.ValidateSubtractQuantity()) this.model.subtractQuantity();
    },

    UpdateCart: function() {
      this.render();
      this.bindEvents();      
    },

    UpdateFieldValue: function(fieldName) {
      var element, value;
      switch (fieldName) {
        case FieldName.Quantity:
          element = $("#" + this.cid + " #changeQuantity-input");
          break;
        case FieldName.Discount:
          element = $("#" + this.cid + " #changeDiscount-input");
          break;
        case FieldName.Price:
          this.SetActionType(Enum.ActionType.ChangePrice);
          element = $("#" + this.cid + " #changePrice-input");
          break;
      }

      value = element.val().trim();
      if (isNaN(value)) value = 0;


      var isQuantityUpdated = fieldName === "QuantityOrdered";

      if (isQuantityUpdated) {
        if (this.IsGiftCredits()) {
          if (!this.IsValidGiftCreditsQty(value)) return;
        } else {
          if (this.cartHasGiftCredit() == true && value < 0) {
            element.blur();
            navigator.notification.alert('Item exchange is not allowed for transactions with Gift Cards. Please create a separate transaction.', null, 'Negative Quantity', 'OK');
            return;
          }
        }
      }

      if (!this.ValidateNegativeQuantity(value)) { //bk
        var transactionType = Global.TransactionType;

        if (Global.TransactionType === Enum.TransactionType.SalesRefund || Global.TransactionType === Enum.TransactionType.Return) {
          transactionType = Enum.TransactionType.Return;
          element.val(this.model.get("Good")); //Originally Defective
        } else {
          //element.val(this.model.get(fieldName));
        }

        var errorMessage = "Negative quantities are not allowed for " + transactionType + " transactions.";
        navigator.notification.alert(errorMessage, null, "Negative Quantity", "OK");
        return;
      }

      switch (Global.TransactionType) {
        case Enum.TransactionType.SalesRefund:
          var outstandingValue = this.model.get("Outstanding");
          if (isQuantityUpdated) {
            if (value > outstandingValue) {
              element.val(this.model.get("Good")); //Originally Defective
              navigator.notification.alert("Value must be less than or equal to the Outstanding quantity.", null, "Incorrect Value", "OK");
              return;
            } else if (this.model.get("ItemType") == Enum.ItemType.GiftCard) {
              var _numOfActivatedGCard = this.model.get("NumOfActivatedGCard");
              var _remaining = 0;
              if (_numOfActivatedGCard > 0) {
                _remaining = (outstandingValue - _numOfActivatedGCard) - value;
                if (_remaining < 0) {
                  element.val(this.model.get("Good")); //Originally Defective
                  navigator.notification.alert("Returning an activated gift card is not allowed.", null, "Action Not Allowed", "OK");
                  return null;
                }
              }
            }
          }
          break;
        default:
          value = element.val().trim();

          if (isNaN(value)) value = 0;

          if (!this.IsNullOrWhiteSpace(value)) element.val().trim();

          var self = this;
          var _isPhasedOutItem = false;

          // if(!Shared.IsNullOrWhiteSpace(Global.AdjustedQtyItemCollection)){
          // _isPhasedOutItem = Global.AdjustedQtyItemCollection.find(function(item){
          // return (self.model.get("ItemCode") == item.get("ItemCode") && self.model.get("UnitMeasureCode") == item.get("UnitMeasureCode"));
          // });
          // }

          if (isQuantityUpdated && this.IsZero(value) && ((!this.model.get("Status") == "P") || this.IsGiftCredits())) {
            element.val(this.model.get(fieldName));
            console.log("Please enter at least 1 quantity.");
            navigator.notification.alert("Please enter at least 1 quantity.", null, "Quantity Required", "OK");
            return;
          }

          //CSL - 10762 : 09.10.2013
          if (isQuantityUpdated) {
            var qtyAdded = value - this.model.get("QuantityOrdered");
            var el_id = "#" + this.cid;
            $(el_id).css('color', 'black');
            //if(Shared.CheckIfItemIsPhaseout(this.model,value,qtyAdded,false,Global.CartCollection)){
            //	// if(Global.TransactionType == Enum.TransactionType.ConvertQuote) $(el_id).css('color','red');
            //	return;
            //}
          }
          break;
      }

      this.UpdateModel(fieldName, value);
    },

    IsValidGiftCreditsQty: function(value) {
      var _itemType = this.model.get("ItemType");
      if (this.IsNegative(value)) {
        navigator.notification.alert("Negative quantity is not allowed for " + _itemType + " item", null, "Negative Quantity", "OK");
        return false;
      }
      return true;
    },

    UpdateModel: function(fieldName, value) {
      this.delegateEvents();

      switch (fieldName) {
        case FieldName.Quantity:
          if (Global.TransactionType === Enum.TransactionType.SalesRefund || Global.TransactionType === Enum.TransactionType.Return) this.model.updateQuantityGood(parseInt(value)); //Originally updateQuantityDefective
          else this.model.updateQuantityOrdered(parseInt(value));
          break;
        case FieldName.Discount:
          this.model.updateDiscount(parseFloat(value));
          break;
        case FieldName.Price:
          this.model.set({
            DoNotChangePrice: true,
            Pricing: Global.Username
          });
          this.model.updateSalesPriceRate(parseFloat(value), "UpdatePrice");
          break;
      }

    },

    ValidateDiscount: function(mode) {
      var element = $("#" + this.cid + " #changeDiscount-input"),
        discount = parseFloat(element.val().trim()),
        discountManager = Global.Preference.DiscountOverrideLevel,
        maxDiscount = Global.Preference.MaxItemDiscount,
        minDiscount = Global.Preference.MinItemDiscount,
        maxSaleDiscount = parseFloat(window.sessionStorage.getItem('MaxSaleDiscount')),
        itemDiscount = parseFloat(this.model.get('Discount'));

      if (mode === "Discount") this.SetActionType(Enum.ActionType.ItemDiscount);

      if (discount > 0) {
        if (this.ValidateReason(mode)) {
          if (this.ValidateManagerOverride(Global.ActionType)) {
            if (!Global.Preference.AllowSaleDiscount) return true;
            if (itemDiscount > 0) maxSaleDiscount += itemDiscount;


            if ((maxSaleDiscount - discount) < 0) {
              navigator.notification.alert("Discount must not exceed max sale discount of " + Global.Preference.MaxSaleDiscount + "%", null, "Action Not Allowed", "OK");
              return false;
            } else {
              maxSaleDiscount -= discount
              window.sessionStorage.setItem('MaxSaleDiscount', maxSaleDiscount);
              return (maxSaleDiscount >= 0) ? true : (function() {
                navigator.notification.alert("Discount must not exceed max sale discount of " + Global.Preference.MaxSaleDiscount + "%", null, "Action Not Allowed", "OK");
                return false;
              })();
            }

            //						 else {
            //							navigator.notification.alert("Discount must not exceed max sale discount of " +Global.Preference.MaxSaleDiscount+ "%", null,"Action Not Allowed","OK");
            //							return false;
            //						}
          }
        }

        return true;
      } else if (discount > maxDiscount) {
        navigator.notification.alert("Discount must not exceed max item discount of " + maxDiscount + "%", null, "Action Not Allowed", "OK");
        return false;
      } else if (discount < 0) {
        navigator.notification.alert("Please enter a valid discount amount", null, "Action Not Allowed", "OK");
        return false;
      } else if (discount == 0) {
        maxSaleDiscount += itemDiscount;
        window.sessionStorage.setItem('MaxSaleDiscount', maxSaleDiscount);
      }


      // if (discount > 0) {
      // 	if ((discount > maxDiscount || discount > 100) && discountManager === null) {
      // 		if (discount > 100) {
      // 			this.NotifyMsg("Discount must not exceed 100%", "Action Not Allowed");
      // 			return false;
      // 		}
      // 	//console.log("Discount must not exceed max discount of " + maxDiscount+ "%");
      // 		navigator.notification.alert("Discount must not exceed max discount of " + maxDiscount+ "%", null,"Action Not Allowed","OK");
      // 		return false;
      // 	}else{
      // 		if(discount > 100) {
      // 			var msg = "Discount must not exceed 100%"
      // 			if(!this.IsDiscountManagerOverrideLevel()) msg = "Discount must not exceed max discount of " + maxDiscount+ "%";
      // 			this.NotifyMsg(msg,"Action Not Allowed");
      // 			return false;
      // 		} else if (this.ValidateReason(mode)) {
      // 			if (this.ValidateManagerOverride(Global.ActionType)) return true;
      // 		}
      //
      // 		return false;
      // 	}
      //
      // } else if (discount < 0 || discount > 100) {
      // 	console.log("Please enter a valid discount amount");
      // 	navigator.notification.alert("Please enter a valid discount amount",null,"Maximum Discount Reached","OK");
      // 	return false;
      // }

      return true;
    },

    IsDiscountManagerOverrideLevel: function() {
      var overrideLevel = (Global.Preference.DiscountOverrideLevel).toLowerCase();
      var currentUser = (Global.UserInfo.RoleCode).toLowerCase();
      if (!overrideLevel) return true;
      if (overrideLevel == currentUser) return true;
      return false;
    },

    ValidateManagerOverride: function(mode) {
      var overrideLevel = null;

      if (mode === Enum.ActionType.ItemDiscount) {
        var maxDiscount = 0;
        var discount = $("#" + this.cid + " #changeDiscount-input").val().trim();

        maxDiscount = Global.Preference.MaxItemDiscount;

        if ( /*maxDiscount <= 0 ||*/ discount <= maxDiscount) {
          return true;
        }

        overrideLevel = Global.Preference.DiscountOverrideLevel;
      } else if (mode === Enum.ActionType.ChangePrice) {
        overrideLevel = Global.Preference.PriceChangeOverrideLevel;
      }

      if (overrideLevel != "" && overrideLevel != null) {
        if (Global.UserInfo.RoleCode != overrideLevel) {
          Global.OverrideMode = mode;
          this.ShowManagerOverride();
          return false;
        }
      }
      return true;
    },

    ValidateNegativeQuantity: function(value) {

      if ((Global.TransactionType === Enum.TransactionType.SalesRefund ||
          Global.TransactionType === Enum.TransactionType.Return ||
          Global.TransactionType != Enum.TransactionType.Sale) ||
        (Global.ApplicationType === "Kiosk")) {
        if (value < 0) return false;
      }
      return true;
    },

    ValidateReason: function(mode) {
      var isReason = Global.ReasonCode.Discount;
      if (isReason) {
        var reasonType = Global.ActionType;

        this.CheckReason(reasonType);
        return false;
      }
      return true;
    },

    ValidateSubtractQuantity: function() {
      if (Global.TransactionType != Enum.TransactionType.SalesRefund) {
        var condition1 = this.model.get("QuantityOrdered") === 1;
        var condition2 = (Global.TransactionType != Enum.TransactionType.Sale || Global.ApplicationType === "Kiosk");
        //var condition3 = (this.model.get("ItemType") == Enum.ItemType.GiftCard || this.model.get("ItemType") == Enum.ItemType.GiftCertificate);
        if (condition1 && condition2) return false;
      }
      return true;
    },

    ViewDetails: function() {
      this.model.viewDetails();
    },

    ContinueNextLine: function() {
      var _val = $("#" + this.cid + " #changeDiscount-input").val();
      if (!this.prevDiscValue) this.prevDiscValue = 0;
      if (_val != this.prevDiscValue) {
        this.prevDiscValue = _val;
        return true;
      }
      return false;
    },

    IsNegative: function(value) {
      if (value < 0) return true;
      return false;
    },

    IsGiftCredits: function(itemType) {
      var _itemType = itemType;
      if (!_itemType) _itemType = this.model.get("ItemType");
      if (_itemType === Enum.ItemType.GiftCard || _itemType === Enum.ItemType.GiftCertificate) {
        return true;
      }
      return false;
    },

    IsAllowedToDeductQuantity: function() {
      var _itemType = this.model.get("ItemType");
      var _qty = this.model.get("QuantityOrdered");

      if (Global.TransactionType !== Enum.TransactionType.SalesRefund || Global.TransactionType != Enum.TransactionType.Return) {
        if (Global.TransactionType !== Enum.TransactionType.Sale) {
          if (_qty == 1) {
            navigator.notification.alert("This item must have at least 1 quantity..", null, "Quantity Required", "OK");
            return false;
          }
        } else {
          if (this.IsGiftCredits(_itemType) && _qty == 1) {
            navigator.notification.alert("This item must have at least 1 quantity..", null, "Quantity Required", "OK");
            return false;
          }
        }
      }

      if (this.IsGiftCredits(_itemType)) {
        if (this.IsZero(_qty)) {
          navigator.notification.alert("Negative quantity is not allowed for " + _itemType + " item", null, "Negative Quantity", "OK");
          return false;
        }
      }
      return true;
    },

    cartHasGiftCredit: function() {
      var cartCollection = Global.CartCollection;
      var gifts = cartCollection.find(function(model) {
        return model.get("ItemType") == Enum.ItemType.GiftCard || model.get("ItemType") == Enum.ItemType.GiftCertificate;
      });
      if (!gifts) return false;
      return true;
    },

    NotifyMsg: function(content, header) {
      navigator.notification.alert(content, null, header, "OK");
    },
  });
  return ItemView;
});
