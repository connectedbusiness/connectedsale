define(["jquery","mobile","underscore","backbone","shared/global","shared/service","shared/method","model/lookupcriteria","collection/coupons","view/spinner","text!template/20.1.0/pos/coupon/couponscan.tpl.html"],function(t,e,o,n,i,s,r,c,u,l,p){var a,h=function(t){1!==t&&a.Close()},C=n.View.extend({_template:o.template(p),events:{"keypress #text-coupon":"textCoupon_KeyPress","tap .btn-done":"btnDone_tap","blur #text-coupon":"HideClearBtn","focus #text-coupon":"ShowClearBtn","tap #text-couponClearBtn":"ClearText"},initialize:function(){this.render(),this.SetFocusOnCoupon()},render:function(){this.$el.html(this._template),this.$("#coupon-scan-content").trigger("create")},FetchCoupons:function(){var t=this,e=this.$("#text-coupon").val(),o=new c,n=100;e||(e=""),o.set({CustomerCode:i.CustomerCode,CriteriaString:e}),this.ShowActivityIndicator(),o.url=i.ServiceUrl+s.SOP+r.COUPONLOOKUP+n,o.save(null,{success:function(e,o){t.ResetCouponCollection(o.Coupons)},error:function(t,e,o){t.RequestError(e,"Error Retrieving Coupons")}})},ResetCouponCollection:function(t){if(this.HideActivityIndicator(),null==t||0===t.length||t.length>1){var e=this.$("#text-coupon").val();a=this;var o="Coupon '"+e+"' does not exist. Do you want to continue searching?";console.log(o),navigator.notification.confirm(o,h,"Coupon Not Found",["Yes","No"])}else this.collection.reset(t),this.SelectCoupon()},SelectCoupon:function(){this.collection.at(0).select(),this.Close()},btnDone_tap:function(t){t.preventDefault(),this.$("#text-coupon").blur(),this.CouponHasText()?this.FetchCoupons():this.Close()},Show:function(){this.render(),this.$el.show(),this.SetFocusOnCoupon()},Close:function(){this.trigger("FormClosed",this),this.Hide()},Hide:function(){this.$el.hide()},CouponHasText:function(){var t=this.$("#text-coupon").val();return!(!t||""===t)},textCoupon_KeyPress:function(t){13===t.keyCode?this.CouponHasText()&&(this.$("#text-coupon").blur(),this.FetchCoupons()):this.ShowClearBtn(t)},ShowClearBtn:function(e){e.stopPropagation();var o=e.target.id,n=t("#"+o).val(),i=n.length,s=t("#"+o).position(),r=t("#"+o).width();i<=0?this.HideClearBtn():(console.log(o),null===s&&""===s||(t("#"+o+"ClearBtn").css({top:s.top+8,left:s.left+(r-23)}),t("#"+o+"ClearBtn").show()))},HideClearBtn:function(){t(".clearTextBtn").fadeOut()},ClearText:function(e){var o=e.target.id,n=o.substring(0,o.indexOf("ClearBtn"));t("#"+n).val(""),this.HideClearBtn()},ShowActivityIndicator:function(){t("#spin").remove(),t("<div id='spin'></div>").appendTo(this.$("#coupon-scan-content"));var e=document.getElementById("spin");this._spinner=l,this._spinner.opts.color="#fff",this._spinner.opts.lines=13,this._spinner.opts.length=7,this._spinner.opts.width=4,this._spinner.opts.radius=10,this._spinner.spin(e),t("<h5>Searching...</h5>").appendTo(t("#spin"))},HideActivityIndicator:function(){t("#spin").remove(),this._spinner.stop()},SetFocusOnCoupon:function(){this.$("#text-coupon").focus()}});return C});