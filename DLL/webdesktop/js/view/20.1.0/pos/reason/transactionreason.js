define(["jquery","mobile","underscore","backbone","shared/global","shared/method","shared/service","model/reason","view/20.1.0/pos/reason/reasons","text!template/20.1.0/pos/reason/transactionReason.tpl.html"],function(e,t,o,n,a,s,i,r,c,l){var d,h,u,v="",R=n.View.extend({_template:o.template(l),events:{"tap #transaction-select-reason-btn":"loadReason_touchstart","tap #transaction-cancel-reason":"cancel_touchstart","tap #transaction-save-reason":"save_touchstart","keyup #transaction-reason-textarea":"CheckReasonInput"},initialize:function(){e("#transaction-reason-textarea").focus(),e("#itemDetailContainer").hide(),this.collection.on("selected",this.LoadSelectedReason,this),collection=this.collection,h=this.options.type,console.log("type-handled : "+h),d=null,this.render()},InitializeReasonModel:function(){this.reasonModel?this.reasonModel.clear({silent:!0}):(this.reasonModel=new r,this.reasonModel.on("sync",this.SuccessComplete,this),this.reasonModel.on("error",this.ErrorSaving,this),this.reasonModel.url=a.ServiceUrl+i.POS+s.SAVEREASON)},render:function(){this.$el.html(this._template),this.CheckCollection(),this.CheckReasonInput(),v=e("#transaction-reason-textarea").val(),v.trim(),e("#reasonPage-inner").trigger("create"),e("#main-transaction-blockoverlay").show(),e("#transaction-reason-textarea").focus()},CheckCollection:function(){u=this.collection.length,0===u&&e("#transaction-select-reason-btn").addClass("ui-disabled")},CheckReasonInput:function(){var t=e("#transaction-reason-textarea").val();""===t?e("#transaction-save-reason").addClass("ui-disabled"):e("#transaction-save-reason").removeClass("ui-disabled")},CheckType:function(e){return"DiscountAll"===e&&(e="Discount"),e},Close:function(t){(t||"VoidTransaction"==h)&&e("#main-transaction-blockoverlay").hide(),this.remove(),this.unbind()},cancel_touchstart:function(e){e.preventDefault(),this.Close(!0)},save_touchstart:function(e){e.preventDefault(),console.log("to save >> type : "+h),this.LogReasonWithValidation()},loadReason_touchstart:function(t){t.preventDefault(),this.ShowReasonView(this.collection),e("#transaction-reason-textarea").blur()},LoadSelectedReason:function(t){d=t,this.render(),e("#transaction-save-reason").removeClass("ui-disabled"),e("#transaction-reason-textarea").val(t.get("Description")),v=t.get("Description")},SetReasonCode:function(e){var t="";return e&&(t=e.get("ReasonCode")),t},ShowReasonView:function(t){this.reasonsView=new c({el:e("#reasonPage-inner")}),this.reasonsView.render(t)},RemoveDummyModel:function(){this.collection.each(function(e){"removeThis"===e.get("ToRemove")&&this.collection.remove(e)})},SaveReason:function(){this.RemoveDummyModel(),this.reasonModel||this.InitializeReasonModel();var e=h,t=this.SetReasonCode(d);if(this.reasonModel.set({WorkstationID:a.POSWorkstationID,Reason:v,ReasonCode:t,TransactionCode:a.TransactionCode,TransactionType:a.TransactionType,Action:e}),"Sales Refund"==a.TransactionType&&"Return"==e){this.reasonModel.set({TransactionCode:null}),this.SuccessComplete(this.reasonModel,null);var o=null;return a.LoggedReasons.each(function(t){t.get("Action")==e&&(o=t)}),a.LoggedReasons.remove(o),void a.LoggedReasons.add(this.reasonModel.attributes)}this.reasonModel.save()},SuccessComplete:function(e,t){a.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),this.triggerSaveReason(e),this.Close()},ErrorSaving:function(e,t,o){a.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.RequestError(t,"Error Saving Reason Code")},triggerSaveReason:function(e){0===u?this.collection.add({Action:h},{silent:!0}):this.collection.at(0).set({Action:h},{silent:!0}),this.collection.at(0).saveTransactionReason()},AcceptReason:function(){this.collection.at(0).acceptReason()},ValidateReason:function(){v=e("#transaction-reason-textarea").val(),""!==v&&v?this.SaveReason():(console.log("Please enter a reason to proceed.."),navigator.notification.alert("Please enter a reason to proceed.",null,"Reason is Required","OK"))},LogReasonWithValidation:function(){return v=e("#transaction-reason-textarea").val(),console.log(v+"<<<"),""!==v&&v?void("Item"===h?this.SaveReason():(0===this.collection.length&&this.collection.push({ToRemove:"removeThis"},{silent:!0}),this.AcceptReason())):(console.log("Please enter a reason to proceed.."),navigator.notification.alert("Please enter a reason to proceed.",null,"Reason is Required","OK"),null)}});return R});