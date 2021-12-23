define(["jquery","mobile","underscore","backbone","shared/enum","shared/global","text!template/19.1.0/pos/transactions/options.tpl.html"],function(t,e,o,i,n,s,p){var r=i.View.extend({_template:o.template(p),className:"popover",id:"transaction-options-popover",attributes:{style:"display: none;"},events:{"tap .btn-options-cancel":"btnOptionsCancel_tap","tap .btn-options-payment":"btnOptionsPayment_tap","tap .btn-options-updateorder":"btnOptionsUpdateOrder_tap","tap .btn-options-convertorder":"btnOptionsConvertOrder_tap","tap .btn-options-convertquote":"btnOptionsConvertQuote_tap","tap .btn-options-updatequote":"btnOptionsUpdateQuote_tap","tap .btn-options-return":"btnOptionsReturn_tap","tap .btn-options-print":"btnOptionsPrint_tap","tap .btn-options-resume":"btnOptionsResume_tap","tap .btn-options-printpicknote":"btnOptionsPrintPickNote_tap","tap .btn-options-readyforpickup":"btnOptionsReadyForPickUp_tap","tap .btn-options-repickitem":"btnOptionsRepickItem_tap"},render:function(){return this.$el.html(this._template()),this},Close:function(){this.Hide()},Show:function(t,e,o,i){i=i||{PickupStage:0},this.model=o,this.DisplayButtons(i),e=this._generatePopupCoordinates(e),t=t+3+"px",this.$el.css({left:t,top:e}),this.$el.show(),this.$el.trigger("create")},_generatePopupCoordinates:function(e){var o=this.ComputePopUpHeight();return e+=10,e>510?(t(".arrow").hide(),t(".arrow-bottom").show(),e=e-o+"px"):(t(".arrow").show(),t(".arrow-bottom").hide(),e+="px"),e},ComputePopUpHeight:function(){var t,e=16,o=61;return BUTTONHEIGHT=41,t=this.ctr<=2?BUTTONHEIGHT*(this.ctr-1)+e+o:BUTTONHEIGHT*(this.ctr-1)+e+o+3.25*this.ctr},DisplayButtons:function(t){if(this.ctr=1,s.LookupMode==n.LookupMode.Order&&s.Preference.IsTrackStorePickUp===!0){if(1==t.PickupStage||2==t.PickupStage){var e=this.$el.find(".btn-options-printpicknote .ui-btn-text");0==e.length&&(e=this.$el.find(".btn-options-printpicknote")),2==t.PickupStage?e.text("Reprint Picking Ticket"):e.text("Print Picking Ticket"),this.$(".btn-options-printpicknote").show(),this.ctr++}else this.$(".btn-options-printpicknote").hide();s.Preference.AllowOrders?(1==t.PickupStage||2==t.PickupStage?(this.$(".btn-options-readyforpickup").show(),this.ctr++):this.$(".btn-options-readyforpickup").hide(),3==t.PickupStage?(this.$(".btn-options-repickitem").show(),this.ctr++):this.$(".btn-options-repickitem").hide()):(this.$(".btn-options-readyforpickup").hide(),this.$(".btn-options-repickitem").hide())}else this.$(".btn-options-printpicknote").hide(),this.$(".btn-options-readyforpickup").hide(),this.$(".btn-options-repickitem").hide();switch(s.LookupMode){case n.LookupMode.Invoice:s.Preference.AllowSales===!0?(s.Preference.AllowReturns===!0?(this.$(".btn-options-return").show(),this.ctr++):this.$(".btn-options-return").hide(),this.$(".btn-options-payment").show(),this.ctr++,this.$(".btn-options-convertorder").hide(),this.$(".btn-options-updateorder").hide(),this.$(".btn-options-convertquote").hide(),this.$(".btn-options-updatequote").hide(),this.$(".btn-options-resume").hide(),this.$(".btn-options-print").show(),this.ctr++):(this.$(".btn-options-payment").hide(),s.Preference.AllowReturns===!0?(this.$(".btn-options-return").show(),this.ctr++):this.$(".btn-options-return").hide(),this.$(".btn-options-convertorder").hide(),this.$(".btn-options-updateorder").hide(),this.$(".btn-options-convertquote").hide(),this.$(".btn-options-updatequote").hide(),this.$(".btn-options-resume").hide(),this.$(".btn-options-print").show(),this.ctr++);break;case n.LookupMode.Order:s.Preference.AllowOrders===!0?(s.Preference.AllowSales!==!0||0!=t.PickupStage&&3!=t.PickupStage?this.$(".btn-options-convertorder").hide():(this.$(".btn-options-convertorder").show(),this.ctr++),this.$(".btn-options-return").hide(),this.$(".btn-options-payment").hide(),this.$(".btn-options-updateorder").show(),this.ctr++,this.$(".btn-options-convertquote").hide(),this.$(".btn-options-updatequote").hide(),this.$(".btn-options-resume").hide(),this.$(".btn-options-print").show(),this.ctr++):(s.Preference.AllowSales!==!0||0!=t.PickupStage&&3!=t.PickupStage?this.$(".btn-options-convertorder").hide():(this.$(".btn-options-convertorder").show(),this.ctr++),this.$(".btn-options-return").hide(),this.$(".btn-options-payment").hide(),this.$(".btn-options-updateorder").hide(),this.$(".btn-options-convertquote").hide(),this.$(".btn-options-updatequote").hide(),this.$(".btn-options-resume").hide(),this.$(".btn-options-print").show(),this.ctr++);break;case n.LookupMode.Quote:s.Preference.AllowQuotes===!0?(s.Preference.AllowOrders===!0?(this.$(".btn-options-convertquote").show(),this.ctr++):this.$(".btn-options-convertquote").hide(),this.$(".btn-options-return").hide(),this.$(".btn-options-payment").hide(),this.$(".btn-options-convertorder").hide(),this.$(".btn-options-updateorder").hide(),this.$(".btn-options-updatequote").show(),this.ctr++,this.$(".btn-options-resume").hide(),this.$(".btn-options-print").show(),this.ctr++):(s.Preference.AllowOrders===!0?(this.$(".btn-options-convertquote").show(),this.ctr++):this.$(".btn-options-convertquote").hide(),this.$(".btn-options-return").hide(),this.$(".btn-options-payment").hide(),this.$(".btn-options-convertorder").hide(),this.$(".btn-options-updateorder").hide(),this.$(".btn-options-updatequote").hide(),this.$(".btn-options-resume").hide(),this.$(".btn-options-print").show(),this.ctr++);break;case n.LookupMode.Return:this.$(".btn-options-return").hide(),this.$(".btn-options-payment").hide(),this.$(".btn-options-convertorder").hide(),this.$(".btn-options-updateorder").hide(),this.$(".btn-options-convertquote").hide(),this.$(".btn-options-updatequote").hide(),this.$(".btn-options-resume").hide(),this.$(".btn-options-print").show(),this.ctr++;break;case n.LookupMode.Suspend:this.$(".btn-options-return").hide(),this.$(".btn-options-payment").hide(),this.$(".btn-options-convertorder").hide(),this.$(".btn-options-updateorder").hide(),this.$(".btn-options-convertquote").hide(),this.$(".btn-options-updatequote").hide(),this.$(".btn-options-print").show(),this.ctr++,s.Preference.AllowSales===!0?(this.$(".btn-options-resume").show(),this.ctr++):this.$(".btn-options-resume").hide()}},Hide:function(){this.$el.hide()},btnOptionsCancel_tap:function(t){t.preventDefault(),this.Hide()},btnOptionsPayment_tap:function(t){t.preventDefault(),this.model.applyPayment()},btnOptionsUpdateOrder_tap:function(t){t.preventDefault(),this.model.updateOrder()},btnOptionsConvertOrder_tap:function(t){t.preventDefault(),this.model.convertOrder()},btnOptionsConvertQuote_tap:function(t){t.preventDefault(),this.model.convertQuote()},btnOptionsUpdateQuote_tap:function(t){t.preventDefault(),this.model.updateQuote()},btnOptionsReturn_tap:function(t){t.preventDefault(),this.model.returnInvoice()},btnOptionsPrint_tap:function(t){t.preventDefault(),this.model.printTransaction()},btnOptionsResume_tap:function(t){t.preventDefault(),this.model.resumeTransaction()},btnOptionsPrintPickNote_tap:function(t){t.preventDefault(),this.model.printPickNote()},btnOptionsReadyForPickUp_tap:function(t){t.preventDefault(),this.model.readyForPickUp()},btnOptionsRepickItem_tap:function(t){t.preventDefault(),this.model.repickItem()}});return r});