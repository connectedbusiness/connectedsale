define(["jquery","mobile","underscore","backbone","shared/global","shared/shared","view/21.0.0/pos/keypad/keypad","text!template/21.0.0/pos/drawerbalance/closingamount.tpl.html"],function(e,t,n,i,a,o,l,s){var h=i.View.extend({_template:n.template(s),events:{"tap #keypad-done-btn":"btnSave_tap","tap #keypad-cancel-btn":"btnCancel_tap"},initialize:function(){this.AllowCancel=this.options.AllowCancel,this.render()},render:function(){this.$el.html(this._template({PaymentType:a.PaymentType})),this.ToggleButtons(),this.InitializePaymentDetail(),e("#main-transaction-blockoverlay").show(),setTimeout(function(){o.BlurItemScan()},200)},InitializePaymentDetail:function(){this.InitializeKeypadView()},Close:function(){this.Hide(),e("#main-transaction-blockoverlay").hide()},Show:function(e){this.AllowCancel=e,this.render(),this.$el.show()},Hide:function(){e(document).unbind("keydown"),this.$el.html(""),this.$el.hide()},btnSave_tap:function(e){e.preventDefault(),this.trigger("SaveAmount",this.GetAmount()),this.Close()},btnCancel_tap:function(e){e.preventDefault(),a.ClosingWorkStation=!1,this.Close()},InitializeKeypadView:function(){this.keypadView&&this.keypadView.remove(),this.keypadView=new l({el:e(".keypad")}),this.keypadView.on("enterTriggered",function(){e("#keypad-done-btn").tap()},this),this.keypadView.Show()},GetAmount:function(){return this.keypadView?this.keypadView.GetAmount():0},ToggleButtons:function(){this.AllowCancel||this.$(".popover-btn").hide()}});return h});