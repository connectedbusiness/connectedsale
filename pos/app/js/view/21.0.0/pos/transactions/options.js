/**
 * Connected Business | 05-22-2012
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/enum',
  'shared/global',
  'text!template/19.2.0/pos/transactions/options.tpl.html',
], function($, $$, _, Backbone, Enum, Global, template) {

  var OptionsView = Backbone.View.extend({
    _template: _.template(template),
    className: "popover",
    id: "transaction-options-popover",
    attributes: {
      style: "display: none;"
    },

    events: {
      "tap .btn-options-cancel": "btnOptionsCancel_tap",
      "tap .btn-options-payment": "btnOptionsPayment_tap",
      "tap .btn-options-updateorder": "btnOptionsUpdateOrder_tap",
      "tap .btn-options-convertorder": "btnOptionsConvertOrder_tap",
      "tap .btn-options-convertquote": "btnOptionsConvertQuote_tap",
      "tap .btn-options-updatequote": "btnOptionsUpdateQuote_tap",
      "tap .btn-options-return": "btnOptionsReturn_tap",
      "tap .btn-options-print": "btnOptionsPrint_tap",
      "tap .btn-options-resume": "btnOptionsResume_tap",
      "tap .btn-options-printpicknote": "btnOptionsPrintPickNote_tap",
      "tap .btn-options-readyforpickup": "btnOptionsReadyForPickUp_tap",
      "tap .btn-options-repickitem": "btnOptionsRepickItem_tap"

    },

    render: function() {
      this.$el.html(this._template());
      return this;
    },

    Close: function() {
      this.Hide();
    },

    Show: function(x_coord, y_coord, model, opt) {
      opt = opt || {
        PickupStage: 0
      };
      this.model = model;
      this.DisplayButtons(opt);

      y_coord = this._generatePopupCoordinates(y_coord) //Added by Paulo Renz D. Ebron
      x_coord = (x_coord + 3) + "px";

      this.$el.css({
        left: x_coord,
        top: y_coord,
      })

      this.$el.show();
      this.$el.trigger("create");
    },

    //function added by Paulo Renz Ebron for bug option layout fixing purposes.
    //function that detects and manipulates the y coordinate of the option layout..
    _generatePopupCoordinates: function(temp_y_coord) {
      var popupHeight = this.ComputePopUpHeight();
      temp_y_coord = temp_y_coord + 10;
      if (temp_y_coord > 510) {
        $(".arrow").hide();
        $(".arrow-bottom").show();
        temp_y_coord = (temp_y_coord - popupHeight) + "px";
      } else {
        $(".arrow").show();
        $(".arrow-bottom").hide();
        temp_y_coord = (temp_y_coord) + "px";
      }

      return temp_y_coord;
    },

    ComputePopUpHeight: function() {
      var popupHeight, arrowHeight = 16,
        cancelBtnHeight = 61,
        marginHeight;
      BUTTONHEIGHT = 41;
      if (this.ctr <= 2) {
        popupHeight = (BUTTONHEIGHT * (this.ctr - 1)) + arrowHeight + cancelBtnHeight;
      } else {
        popupHeight = (BUTTONHEIGHT * (this.ctr - 1)) + arrowHeight + cancelBtnHeight + (3.25 * this.ctr);
      }
      return popupHeight;
    },

    DisplayButtons: function(opt) {
      this.ctr = 1; //determines how many buttons are present inside the popup containter. code added by Paulo Renz Ebron

      //Hide All Store Pickup Buttons
      if (Global.LookupMode == Enum.LookupMode.Order && Global.Preference.IsTrackStorePickUp === true) {
        if (opt.PickupStage == 1 || opt.PickupStage == 2) {

          var btnPrintPickNote = this.$el.find(".btn-options-printpicknote .ui-btn-text");
          if (btnPrintPickNote.length == 0) btnPrintPickNote = this.$el.find(".btn-options-printpicknote");

          if (opt.PickupStage == 2) btnPrintPickNote.text('Reprint Picking Ticket');
          else btnPrintPickNote.text('Print Picking Ticket');

          this.$(".btn-options-printpicknote").show();
          this.ctr++;
        } else this.$(".btn-options-printpicknote").hide();

        if (!Global.Preference.AllowOrders) {
          this.$(".btn-options-readyforpickup").hide();
          this.$(".btn-options-repickitem").hide();
        } else {
          if (opt.PickupStage == 1 || opt.PickupStage == 2) {
            this.$(".btn-options-readyforpickup").show();
            this.ctr++;
          } else this.$(".btn-options-readyforpickup").hide();

          if (opt.PickupStage == 3) {
            this.$(".btn-options-repickitem").show();
            this.ctr++;
          } else this.$(".btn-options-repickitem").hide()
        }
      } else {
        this.$(".btn-options-printpicknote").hide();
        this.$(".btn-options-readyforpickup").hide();
        this.$(".btn-options-repickitem").hide();
      }

      switch (Global.LookupMode) {
        case Enum.LookupMode.Invoice:
          if (Global.Preference.AllowSales === true) {
            //Need to Clarify if Retun buttons has to be hidden if AllowReturn is Off and AllowSales is ON.
            if (Global.Preference.AllowReturns === true) {
              this.$(".btn-options-return").show();
              this.ctr++;
            } else {
              this.$(".btn-options-return").hide();
            }
            this.$(".btn-options-payment").show();
            this.ctr++;
            this.$(".btn-options-convertorder").hide();
            this.$(".btn-options-updateorder").hide();
            this.$(".btn-options-convertquote").hide();
            this.$(".btn-options-updatequote").hide();
            this.$(".btn-options-resume").hide();
            this.$(".btn-options-print").show();
            this.ctr++;
          } else {
            this.$(".btn-options-payment").hide();
            if (Global.Preference.AllowReturns === true) {
              this.$(".btn-options-return").show();
              this.ctr++;
            } else {
              this.$(".btn-options-return").hide();
            }
            this.$(".btn-options-convertorder").hide();
            this.$(".btn-options-updateorder").hide();
            this.$(".btn-options-convertquote").hide();
            this.$(".btn-options-updatequote").hide();
            this.$(".btn-options-resume").hide();
            this.$(".btn-options-print").show();
            this.ctr++;
          }

          break;
        case Enum.LookupMode.Order:
          if (Global.Preference.AllowOrders === true) {
            if ((Global.Preference.AllowSales === true) && (opt.PickupStage == 0 || opt.PickupStage == 3)){
              this.$(".btn-options-convertorder").show();
              this.ctr++;
            } else {
              this.$(".btn-options-convertorder").hide();
            }
            this.$(".btn-options-return").hide();
            this.$(".btn-options-payment").hide();
            this.$(".btn-options-updateorder").show();
            this.ctr++;
            this.$(".btn-options-convertquote").hide();
            this.$(".btn-options-updatequote").hide();
            this.$(".btn-options-resume").hide();
            this.$(".btn-options-print").show();
            this.ctr++;
          } else {
            if ((Global.Preference.AllowSales === true) && (opt.PickupStage == 0 || opt.PickupStage == 3)){
              this.$(".btn-options-convertorder").show();
              this.ctr++;
            } else {
              this.$(".btn-options-convertorder").hide();
            }
            this.$(".btn-options-return").hide();
            this.$(".btn-options-payment").hide();
            this.$(".btn-options-updateorder").hide();
            this.$(".btn-options-convertquote").hide();
            this.$(".btn-options-updatequote").hide();
            this.$(".btn-options-resume").hide();
            this.$(".btn-options-print").show();
            this.ctr++;
          }
          break;
        case Enum.LookupMode.Quote:
          if (Global.Preference.AllowQuotes === true) {
            if (Global.Preference.AllowOrders === true) {
              this.$(".btn-options-convertquote").show();
              this.ctr++;
            } else {
              this.$(".btn-options-convertquote").hide();
            }
            this.$(".btn-options-return").hide();
            this.$(".btn-options-payment").hide();
            this.$(".btn-options-convertorder").hide();
            this.$(".btn-options-updateorder").hide();
            this.$(".btn-options-updatequote").show();
            this.ctr++;
            this.$(".btn-options-resume").hide();
            this.$(".btn-options-print").show();
            this.ctr++;
          } else {
            if (Global.Preference.AllowOrders === true) {
              this.$(".btn-options-convertquote").show();
              this.ctr++;
            } else {
              this.$(".btn-options-convertquote").hide();
            }
            //this.$(".btn-options-convertquote").hide();
            this.$(".btn-options-return").hide();
            this.$(".btn-options-payment").hide();
            this.$(".btn-options-convertorder").hide();
            this.$(".btn-options-updateorder").hide();
            this.$(".btn-options-updatequote").hide();
            this.$(".btn-options-resume").hide();
            this.$(".btn-options-print").show();
            this.ctr++;
          }
          break;
        case Enum.LookupMode.Return:
          this.$(".btn-options-return").hide();
          this.$(".btn-options-payment").hide();
          this.$(".btn-options-convertorder").hide();
          this.$(".btn-options-updateorder").hide();
          this.$(".btn-options-convertquote").hide();
          this.$(".btn-options-updatequote").hide();
          this.$(".btn-options-resume").hide();
          this.$(".btn-options-print").show();
          this.ctr++;
          break;
        case Enum.LookupMode.Suspend:
          this.$(".btn-options-return").hide();
          this.$(".btn-options-payment").hide();
          this.$(".btn-options-convertorder").hide();
          this.$(".btn-options-updateorder").hide();
          this.$(".btn-options-convertquote").hide();
          this.$(".btn-options-updatequote").hide();
          this.$(".btn-options-print").show();
          this.ctr++;
          if (Global.Preference.AllowSales === true) {
            this.$(".btn-options-resume").show();
            this.ctr++;
          } else {
            this.$(".btn-options-resume").hide();
          }
          break;
      }
    },

    Hide: function() {
      this.$el.hide();
    },

    btnOptionsCancel_tap: function(e) {
      e.preventDefault();
      this.Hide();
    },

    btnOptionsPayment_tap: function(e) {
      e.preventDefault();
      this.model.applyPayment();
    },

    btnOptionsUpdateOrder_tap: function(e) {
      e.preventDefault();
      this.model.updateOrder();
    },

    btnOptionsConvertOrder_tap: function(e) {
      e.preventDefault();
      this.model.convertOrder();
    },

    btnOptionsConvertQuote_tap: function(e) {
      e.preventDefault();
      this.model.convertQuote();
    },

    btnOptionsUpdateQuote_tap: function(e) {
      e.preventDefault();
      this.model.updateQuote();
    },

    btnOptionsReturn_tap: function(e) {
      e.preventDefault();
      this.model.returnInvoice();
    },

    btnOptionsPrint_tap: function(e) {
      e.preventDefault();
      this.model.printTransaction();
    },

    btnOptionsResume_tap: function(e) {
      e.preventDefault();
      this.model.resumeTransaction();
    },

    btnOptionsPrintPickNote_tap: function(e) {
      e.preventDefault();
      this.model.printPickNote();
    },

    btnOptionsReadyForPickUp_tap: function(e) {
      e.preventDefault();
      this.model.readyForPickUp();
    },

    btnOptionsRepickItem_tap: function(e) {
      e.preventDefault();
      this.model.repickItem();
    }


  });
  return OptionsView;
});
