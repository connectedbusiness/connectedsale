define(["jquery","mobile","underscore","backbone","shared/enum","shared/global","shared/shared","model/coupon","collection/coupons","view/18.2.0/pos/coupon/couponlist","view/18.2.0/pos/coupon/couponscan","text!template/18.2.0/pos/coupon/coupon.tpl.html","text!template/18.2.0/pos/coupon/couponscan.tpl.html"],function(o,n,t,e,i,u,s,c,p,l,a,r,h){var C,d=e.View.extend({_template:t.template(r),_scanTemplate:t.template(h),events:{"tap .btn-Done":"btnDone_tap","tap .li-coupon":"liCoupon_tap","tap .btn-Back":"btnBack_tap","tap #btn-remove-coupon":"btnRemove_tap"},initialize:function(){this.couponModel&&(s.IsNullOrWhiteSpace(this.couponModel.get("CustomerCode"))||this.couponModel.get("CustomerCode")==u.CustomerCode||this.ClearCouponForm()),this.couponModel=this.model,this.render()},render:function(){this.AllowShowCouponForm()&&(this.couponModel&&this.couponModel.get("CouponID")||this.CreateEmptyCoupon(),this.ManageBinding(),this.$el.html(this._template(this.couponModel.toJSON())),this.$("#couponBody").trigger("create"),this.$(".btn-Back").hide(),o("#main-transaction-blockoverlay").show())},ManageBinding:function(){var o=this.couponModel.get("DiscountPercent"),n=this.couponModel.get("DiscountAmount"),t=this.couponModel.get("RequiresMinimumOrderAmount");this.couponModel.get("IsEmpty")||(o=o.toFixed(2)+" %",n=(u.CurrencySymbol||"$")+" "+n.toFixed(2),t=(u.CurrencySymbol||"$")+" "+t.toFixed(2)),this.couponModel.set({DiscountPercentDisplay:o,DiscountAmountDisplay:n,MinimumAmountDisplay:t},{silent:!0}),null==this.couponModel.get("Description")&&this.couponModel.set({Description:this.couponModel.get("CouponCode")})},Close:function(){this.Hide()},Show:function(){this.AllowShowCouponForm()&&(u.isBrowserMode&&s.BlurItemScan(),this.couponModel&&(s.IsNullOrWhiteSpace(this.couponModel.get("CustomerCode"))||this.couponModel.get("CustomerCode")==u.CustomerCode||this.ClearCouponForm()),this.render(),this.$el.show())},Hide:function(){this.$el.hide(),o("#main-transaction-blockoverlay").hide()},btnDone_tap:function(o){o.stopPropagation(),this.AcceptCoupon(),s.FocusToItemScan()},liCoupon_tap:function(o){o.preventDefault(),this.AllowModifyCoupon()&&(u.Preference.ShowCouponList?this.ShowCouponList():this.ShowCouponScan())},btnBack_tap:function(o){o.preventDefault(),this.render()},btnRemove_tap:function(o){o.preventDefault(),this.RemoveCoupon()},ShowCouponList:function(){this.$("#couponBody").empty(),this.InitializeCouponListView(),this.$(".btn-Back").show()},ShowCouponScan:function(){this.InitializeCouponCollection(),this.couponScanView?this.couponScanView.Show():(this.couponScanView=new a({el:o("#scanCouponContainer"),collection:this.couponCollection}),this.couponScanView.on("FormClosed",this.Show,this)),this.Close(),o("#main-transaction-blockoverlay").show()},InitializeCouponListView:function(){this.InitializeCouponCollection();new l({el:this.$("#couponBody"),collection:this.couponCollection})},InitializeCouponCollection:function(){this.couponCollection||(this.couponCollection=new p,this.couponCollection.on("selected",this.CouponSelected,this))},CouponSelected:function(o){this.LoadCoupon(o),this.render()},RemoveCoupon:function(){this.AllowModifyCoupon()&&(this.couponModel.get("IsEmpty")||(C=this,navigator.notification.confirm("Are you sure you want to remove this coupon?",m,"Remove Coupon",["Yes","No"])))},ClearCouponForm:function(){this.ClearCoupon(),this.render(),this.Close(),this.trigger("RemoveCoupon"),o("#main-transaction-blockoverlay").hide()},AcceptCoupon:function(){this.couponModel.get("IsEmpty")?this.Close():this.trigger("AcceptCoupon",this.couponModel)},ClearCoupon:function(){this.couponModel=null},CreateEmptyCoupon:function(){this.couponModel=new c,this.couponModel.set({CouponCode:"Select a coupon...",Description:"",DiscountType:"",CouponComputation:"",DiscountPercent:"",DiscountAmount:"",RequiresMinimumOrderAmount:"",IsEmpty:!0})},LoadCoupon:function(o){this.couponModel=o},AllowModifyCoupon:function(){switch(u.TransactionType){case i.TransactionType.SalesPayment:return!1;case i.TransactionType.SalesRefund:return!1;default:return!0}},TransactionHasCoupon:function(){return!(!this.couponModel||!this.couponModel.get("CouponID"))},AllowShowCouponForm:function(){if(!this.AllowModifyCoupon()&&!this.TransactionHasCoupon()){var n="The current transaction does not allow coupons.";return console.log(n),navigator.notification.alert(n,null,"Action Not Allowed","OK"),o("#main-transaction-blockoverlay").hide(),!1}return!0}}),m=function(o){1===o&&C.ClearCouponForm()};return d});