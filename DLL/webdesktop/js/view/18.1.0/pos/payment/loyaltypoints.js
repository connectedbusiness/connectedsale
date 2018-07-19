define(["backbone","shared/global","shared/service","shared/method","shared/shared","model/base","model/lookupcriteria","collection/base","text!template/18.1.0/pos/payment/loyaltypoints.tpl.html","js/libs/format.min.js"],function(t,e,i,s,n,a,o,l,r){var h="#txtAccumulatedPoints",u="#txtRedeemedPoints",c="#txtOutStanding",d="#txtApplyPoints",p="#txtApplyMonetary",P="#txtReservedPoints",m=".dialog-message",y="#cmdDone",g=t.View.extend({_template:_.template(r),events:{"keyup #txtApplyPoints":"Points_Keyup","keyup #txtApplyMonetary":"Points_Keyup","blur #txtApplyPoints ":"ApplyInput_Blur","blur #txtApplyMonetary":"ApplyInput_Blur","focus #txtApplyPoints":"AssignNumericValidation","focus #txtApplyMonetary":"AssignNumericValidation","keypress #txtApplyMonetary":"txtKeypress"},initialize:function(){},txtKeypress:function(t){n.MaxDecimalPlaceValidation($("#"+t.target.id),t)},AssignNumericValidation:function(t){var e=t.target.id;n.IsNullOrWhiteSpace($("#"+e).val())||$("#"+e).val(""),"txtApplyPoints"==e?n.Input.NonNegativeInteger("#"+e):n.Input.NonNegative("#"+e)},render:function(t){return this.$el.html(this._template),this.trigger("create"),this.balance=t,this.GetCustomerLoyaltyPoints(),this},SetKioskActualBalance:function(t){this.kioskActualBalance=t},GetCustomerLoyaltyPoints:function(){var t=this;this.model=new a;var o;o=n.IsNullOrWhiteSpace(e.CurrentCustomer.CustomerCode)?e.CustomerCode:e.CurrentCustomer.CustomerCode,this.model.set({StringValue:o}),this.model.url=e.ServiceUrl+i.SOP+s.GETCUSTOMERLOYALTYPOINTS,this.model.save(null,{success:function(i,s){e.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),t.LoadCustomerLoyaltyPoins(s)}})},FocusElement:function(t){var e=document.getElementById(t);e.select()},LoadCustomerLoyaltyPoins:function(t){this.collection=new l,this.collection.reset(t.LoyaltyPoints),this.advancePreferenceCollection=new l,this.advancePreferenceCollection.reset(t.LoyaltyPointsAdvancePreference);if(this.accumulatedPoints=0,this.redeemPoints=0,this.outstandingPoints=0,this.purchaseMultiplier=0,this.redemptionMultiplier=0,this.monetaryPoints=0,this.reservedPoints=0,this.collection.length>0?(this.accumulatedPoints=parseFloat(this.collection.at(0).get("AccumulatedPoints")),this.redeemPoints=parseFloat(this.collection.at(0).get("RedeemedPoints")),this.outstandingPoints=this.CalculateOutStandingPoints(this.collection.at(0).attributes),this.reservedPoints=parseFloat(this.collection.at(0).get("ReservedPoints")),this.advancePreferenceCollection.length>0?(this.purchaseMultiplier=this.advancePreferenceCollection.at(0).get("Value"),this.redemptionMultiplier=this.advancePreferenceCollection.at(1).get("Value"),n.Focus(p)):(this.$(p).addClass("ui-readonly"),this.$(d).addClass("ui-readonly"))):(this.$(p).addClass("ui-readonly"),this.$(d).addClass("ui-readonly")),this.$(P).val(Math.round(this.reservedPoints).toLocaleString("en")),this.$(h).val(Math.round(this.accumulatedPoints).toLocaleString("en")),this.$(u).val(Math.round(this.redeemPoints).toLocaleString("en")),this.$(c).val(Math.round(this.outstandingPoints).toLocaleString("en")),this.outstandingPoints>0){this.monetaryPoints=parseFloat(this.balance);var i=0;this.balance>0&&(i=this.monetaryPoints/this.redemptionMultiplier,i>this.outstandingPoints&&(this.monetaryPoints=Math.round(this.outstandingPoints)*this.redemptionMultiplier)),this.$(p).val(format("#,##0.00",this.monetaryPoints)),this.$(d).val(this.outstandingPoints.toLocaleString("en")),this.CalculatePoints("monetary",!0),e.TermDiscount>0&&$(".term-discount").attr("style","margin-top:0px;")}else this.$(d).val(this.outstandingPoints.toLocaleString("en")),this.$(p).val(format("#,##0.00",this.monetaryPoints)),$(y).hide(),$(m+" > span").text("  Insufficient Points !"),$(m).slideDown("fast")},Points_Keyup:function(t){13===t.keyCode&&this.CalculatePoints(t.target.id)},ApplyInput_Blur:function(t){this.CalculatePoints(t.target.id)},ValidateCalculatedPoints:function(){return!n.IsNullOrWhiteSpace(this.kioskActualBalance)&&this.monetaryPoints>this.kioskActualBalance?($(y).hide(),$(m+" > span").text("  Monetary points should not be greater than the remaining balance."),void $(m).slideDown("fast")):void(this.applyPoints>this.outstandingPoints?($(y).hide(),$(m+" > span").text("  Insufficient Points !"),$(m).slideDown("fast")):this.applyPoints<0?($(y).hide(),$(m+" > span").text("  Negative Points is not Allowed !"),$(m).slideDown("fast")):($(y).show(),$(m).slideUp("fast")))},CalculatePoints:function(t,e){n.IsNullOrWhiteSpace(e)&&(""!=this.$(d).val()&&(this.applyPoints=parseInt(this.$(d).val().toLocaleString("en").replace(/,/g,""))),""!=this.$(p).val()&&(this.monetaryPoints=parseFloat(this.$(p).val().replace(/,/g,"")))),"txtApplyPoints"==t?""!=this.$(d).val()?(this.monetaryPoints=this.applyPoints*this.redemptionMultiplier,this.$(p).val(format("#,##0.00",this.monetaryPoints)),this.ValidateCalculatedPoints()):(this.$(d).val(parseInt(Math.ceil(this.applyPoints)).toLocaleString("en")),this.ValidateCalculatedPoints()):""!=this.$(p).val()?(0==this.monetaryPoints?this.applyPoints=0:this.applyPoints=Math.round(this.monetaryPoints/this.redemptionMultiplier),this.$(d).val(parseInt(Math.ceil(this.applyPoints)).toLocaleString("en")),this.ValidateCalculatedPoints()):(this.$(p).val(format("#,##0.00",this.monetaryPoints)).blur(),this.ValidateCalculatedPoints())},CalculateOutStandingPoints:function(t){return t.AccumulatedPoints-t.RedeemedPoints-t.ReservedPoints}});return g});