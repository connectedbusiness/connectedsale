define(["jquery","mobile","underscore","backbone","shared/enum","shared/global","shared/method","shared/service","shared/shared","view/18.2.0/pos/reason/itemreason","view/18.2.0/pos/manageroverride/manageroverride","model/reason","model/override","model/lookupcriteria","model/base","collection/base","collection/reasons","collection/currentorders","collection/stocks","text!template/18.2.0/pos/itemdetail/item.tpl.html"],function(e,t,i,a,n,s,o,r,l,u,c,d,h,p,m,y,T,f,v,g){var C,D,w="",I=function(e){1===e&&_itemView.RemoveThisItem()},O=a.View.extend({_template:i.template(g),events:{"keyup #price-input":"inputPrice_KeyUp","tap .add":"add_touchstart","tap .minus":"minus_touchstart","tap #applyDiscount":"applyDiscount_touchstart","tap #applyItemDiscount":"applyItemDiscount_touchstart","change #qtyOrdered-input":"inputQtyOrdered_changed","change #price-input":"inputPrice_changed","focus #discount-input":"inputDiscount_Focus","keypress #discount-input":"inputDiscount_Keypress","tap #li-freestock":"liFreestock_touchstart","tap #li-accessory":"liAccessory_touchstart","tap #li-substitute":"liSubstitute_touchstart","tap #li-serialLot":"liSerialLot_touchstart","tap #li-notes":"liNotes_touchstart","change #itemDetail-umList":"selectUnitMeasure_touchstart","change #itemDetail-warehouseList":"selectWarehouseCode_touchstart","tap #itemDetail-warehouseList":"selectWarehouseCode_tap","focus #qtyOrdered-input":"qty_focus","tap #qtyOrdered-input":"qtyOrdered_tapped","blur #qtyOrdered-input":"ValidateValue_FocusChanged","tap #qtyOrdered-inputClearBtn":"ClearText","keypress #price-input":"Price_Keypress","keyup #price-input":"Price_Keyup","focus #price-input":"price_focus","tap  #price-input":"ChangePrice_tapped","blur #price-input":"ValidateValue_FocusChanged","tap  #price-inputClearBtn":"ClearText","blur #discount-input":"ValidateValue_FocusChanged","tap  #discount-inputClearBtn":"ClearText","tap  #btn-remove-item":"btnRemove_tap"},render:function(e,t){this.model=e,this.type=t,this.ManageBinding(),this.model._callbacks.discounted&&(this.model._callbacks.discounted=null),this.model.on("change",this.UpdateValue,this),this.model.on("discounted",this.ApplyDiscountToAllWithValidation,this),this.model.on("revertWarehouseCode",this.revertWarehouseCode,this),this.$el.html(this._template(this.model.toJSON())),w=this.model.get("WarehouseCode"),this.LoadWareHouseCodes(),this.delegateEvents(),this.ToggleFields(),this.ToggleButtons();var i=this.model.get("ItemCode"),a=this.model.get("LineNum");this.isCurrentOrder=!1;var o=this;switch(void 0!=s.CurrentOrders&&null!=s.CurrentOrders&&(this.currentOrderCollection=new f,this.currentOrderCollection=s.CurrentOrders,this.currentOrderCollection.each(function(e){e.get("ItemCode")===i&&e.get("LineNum")==a&&(o.isCurrentOrder=!0)})),this.isCurrentOrder===!0&&this.$("#btn-remove-item").addClass("ui-disabled"),s.TransactionType){case n.TransactionType.SalesPayment:case n.TransactionType.VoidTransaction:this.$("#btn-remove-item").addClass("ui-disabled"),this.$("#itemDetail-umList").attr("disabled",!0),this.$("#itemDetail-umList").addClass("ui-disabled"),this.$("#itemDetail-warehouseList").attr("disabled",!0),this.$("#itemDetail-warehouseList").addClass("ui-disabled"),this.$("#price-input").attr("readonly",!0);break;case n.TransactionType.SalesRefund:this.$("#price-input").attr("readonly",!0),1!=this.model.get("IsNewLine")&&(this.$("#itemDetail-umList").attr("disabled",!0),this.$("#itemDetail-umList").addClass("ui-disabled"));break;case n.TransactionType.ConvertOrder:this.model.get("IsNewLine")||(this.$("#itemDetail-umList").attr("disabled",!0),this.$("#itemDetail-umList").addClass("ui-disabled"))}switch(console.log("item type :"+this.model.get("ItemType")),this.model.get("ItemType")){case n.ItemType.Service:case n.ItemType.GiftCard:case n.ItemType.GiftCertificate:case n.ItemType.NonStock:this.$("#li-freestock").addClass("ui-disabled"),this.$("#itemDetail-warehouse").hide()}return s.TransactionType==n.TransactionType.Recharge&&this.DisableControls(),this},DisableControls:function(){this.$("#qtyOrdered-input").attr("readonly",!0),this.$("#price-input").attr("readonly",!0),this.$("#itemDetail-umList").attr("disabled",!0),this.$("#itemDetail-umList").addClass("ui-disabled"),this.$("#itemDetail-warehouseList").attr("disabled",!0),this.$("#itemDetail-warehouseList").addClass("ui-disabled"),this.$("#btn-remove-item").addClass("ui-disabled"),this.$("#li-notes").addClass("ui-disabled")},revertWarehouseCode:function(e){this.model.set({WarehouseCode:this.warehouseCode},{silent:!0}),this.$("#itemDetail-warehouseList").val(this.warehouseCode),this.$("#itemDetail-warehouseList").trigger("change"),this.$("#itemDetail-warehouseList").selectmenu(),this.$("#itemDetail-warehouseList").selectmenu("refresh")},LoadWareHouseCodes:function(){var e=this;this.model.get("ItemCode");this.warehouseCollection=new v,"P"==this.model.get("Status")?this.warehouseCollection.url=s.ServiceUrl+r.PRODUCT+"getactivewarehousebyitemstatus/"+this.model.get("ItemCode"):this.warehouseCollection.url=s.ServiceUrl+r.PRODUCT+o.GETACTIVEWAREHOUSE,this.DisableWarehouse(),this.warehouseCollection.fetch({success:function(t,i){e.LoadRetreiveWareHouseCode(i.Warehouses)},error:function(e,t,i){e.RequestError(t,"Error Loading Stock Location")}})},IsMultiLocation:function(){return!!s.AccountingPreference&&!!s.AccountingPreference.IsLocation},DisableWarehouse:function(){(this.IsMultiLocation()||s.TransactionType==n.TransactionType.ConvertOrder&&1==this.isCurrentOrder)&&(this.$("#itemDetail-warehouseList").attr("disabled",!0),this.$("#itemDetail-warehouseList").addClass("ui-disabled"),this.$("#itemDetail-warehouse .ui-icon-arrow-d").addClass("ui-disabled"))},LoadRetreiveWareHouseCode:function(t){e('#itemDetail-warehouseList > option[val !=""]').remove(),this.$("#itemDetail-warehouseList").append(new Option(w,w)),this.$("#itemDetail-warehouseList").selectmenu(),this.$("#itemDetail-warehouseList").selectmenu("refresh"),this.warehouseCollection.reset(t),this.warehouseCollection.each(this.LoadWareHouseCodeOptions,this),this.DisableWarehouse()},LoadWareHouseCodeOptions:function(e){var t=e.get("IsActive"),e=e.get("WarehouseCode"),i=this,a=i.$("#itemDetail-warehouseList"),n=i.$("#itemDetail-warehouseList option");if(e!=w&&t){var s=!1;n.each(function(){if(this.value==e)return s=!0,!1}),s||a.append(new Option(e,e))}},selectWarehouseCode_tap:function(e){if(e.stopPropagation(),this.IsMultiLocation())return void navigator.notification.alert("The account set up in Accounting Preference is By Location, the system will not allow you to change the location per line item.\n Please open Connected Business to change this preference.",null,"Action not allowed","OK")},selectWarehouseCode_touchstart:function(t){t.stopPropagation();var i=e("#itemDetail-warehouseList option:selected").val();this.warehouseCode=this.model.previous("WarehouseCode"),this.model.set({WarehouseCode:i}),s.TransactionType==n.TransactionType.SalesRefund&&this.model.get("Outstanding")||this.ViewWarehouseCode()},DisplayClearBtn:function(t){t.stopPropagation();var i=t.target.id,a=e("#"+i).val(),n=a.length,s=e("#"+i).position();e("#"+i).width();n<=0?this.HideClearBtn():(null===s&&""===s||e("#"+i+"ClearBtn").css({top:s.top+7,left:s.left+5}),e("#"+i+"ClearBtn").show())},qtyOrdered_tapped:function(t){t.stopPropagation(),s.TransactionType!=n.TransactionType.VoidTransaction&&s.TransactionType!=n.TransactionType.SalesPayment&&s.TransactionType!=n.TransactionType.Recharge&&setTimeout(function(){e("#qtyOrdered-input").val("")},500)},ChangePrice_tapped:function(t){if(t.stopPropagation(),s.TransactionType!=n.TransactionType.VoidTransaction&&s.TransactionType!=n.TransactionType.SalesPayment&&s.TransactionType!=n.TransactionType.SalesRefund&&s.TransactionType!=n.TransactionType.Recharge&&s.Preference.AllowChangePrice&&"Kiosk"!=this.type){var i=t.target.id;e("#"+i).val("")}},HideClearBtn:function(){e(".clearTextBtn").fadeOut()},ClearText:function(t){if(s.TransactionType!=n.TransactionType.Recharge){var i=t.target.id,a=i.substring(0,i.indexOf("ClearBtn"));e("#"+a).val(""),e(".clearTextBtn").hide()}},IsElementReadOnly:function(t){return!!e("#"+t).is("[readonly]")},ValidateValue_FocusChanged:function(t){t.preventDefault();var i=t.target.id,a=this.$("#"+i).val().trim();if(e.isNumeric(a)===!1){if(this.IsElementReadOnly(i))return;if("price-input"===i&&this.UpdatePriceWithValidation(),"discount-input"===i){if(s.ReasonCode.Discount&&s.ReasonViewRendered)return;this.UpdateDiscountWithValidation()}"qtyOrdered-input"===i&&console.log("ValidateValue_FocusChanged : UpdateFieldValue")}e(".clearTextBtn").hide()},btnRemove_tap:function(e){e.preventDefault(),console.log("culprit"),this.CheckReason(n.ActionType.VoidItem)},RemoveItemNotification:function(){_itemView=this,navigator.notification.confirm("Are you sure you want to remove this item inside from your transaction?",I,"Remove Item",["Yes","No"])},RemoveThisItem:function(){this.model.removeItem(),this.trigger("RemoveItem")},ManageBinding:function(){switch(s.TransactionType){case n.TransactionType.SalesRefund:this.model.set({QuantityDisplay:this.model.get("Good")},{silent:!0});break;default:this.model.set({Outstanding:0,QuantityDisplay:this.model.get("QuantityOrdered")},{silent:!0})}},add_touchstart:function(e){e.stopImmediatePropagation(),s.TransactionType!=n.TransactionType.Recharge&&this.AddQuantityOrdered()},minus_touchstart:function(e){e.stopImmediatePropagation(),s.TransactionType!=n.TransactionType.Recharge&&(s.TransactionType==n.TransactionType.ConvertQuote&&0==this.model.get("QuantityOrdered")||this.SubtractQuantityOrdered())},applyDiscount_touchstart:function(t){t.stopImmediatePropagation();var i=e("#discount-input").val();0===i.length?e("#discount-input").val(this.currentDiscValue):e.isNumeric(i)||e("#discount-input").val(parseFloat(i)),this.ValidateDiscount("DiscountAll")&&(this.PreventApplyDiscountConfirmation||(C=this.model,D=this,this.itemDiscountTimeOut&&clearTimeout(this.itemDiscountTimeOut),this.model.discountItem()))},applyItemDiscount_touchstart:function(t){if(t.stopImmediatePropagation(),s.Preference.AllowItemDiscount){var i=e("#discount-input").val().trim();""==i&&0!==i||this.ValidateDiscount("Discount")&&this.UpdateDiscountWithValidation()}},AddQuantityOrdered:function(){s.TransactionType!==n.TransactionType.SalesPayment&&s.TransactionType!==n.TransactionType.VoidTransaction&&(this.model.addQuantity(),this.ToggleFields())},ValidateSubtractQuantity:function(){var e=1===this.model.get("QuantityOrdered"),t=s.TransactionType!=n.TransactionType.Sale||"Kiosk"===s.ApplicationType;return!e||!t},SubtractQuantityOrdered:function(){s.TransactionType!==n.TransactionType.SalesPayment&&s.TransactionType!==n.TransactionType.VoidTransaction&&this.ValidateSubtractQuantity()&&this.IsAllowedToDeductQuantity()&&(this.model.subtractQuantity(),this.ToggleFields())},IsAllowedToDeductQuantity:function(){var e=this.model.get("ItemType"),t=this.model.get("QuantityOrdered");if(s.TransactionType!==n.TransactionType.SalesRefund)if(s.TransactionType!==n.TransactionType.Sale){if(1==t)return navigator.notification.alert("This item must have at least 1 quantity.",null,"Quantity Required","OK"),!1}else if(this.IsGiftCredits(e)&&1==t)return navigator.notification.alert("This item must have at least 1 quantity.",null,"Quantity Required","OK"),!1;return!this.IsGiftCredits(e)||!this.IsZero(t)||(navigator.notification.alert("Negative quantity is not allowed for "+e+" item",null,"Negative Quantity","OK"),!1)},IsValidGiftCreditsQty:function(e){var t=this.model.get("ItemType");return!this.IsNegative(e)||(navigator.notification.alert("Negative quantity is not allowed for "+t+" item",null,"Negative Quantity","OK"),!1)},IsGiftCredits:function(){var e=this.model.get("ItemType");return e==n.ItemType.GiftCard||e==n.ItemType.GiftCertificate},IsZero:function(e){return 0==e},IsNegative:function(e){return e<0},UpdateValue:function(){switch(s.TransactionType){case n.TransactionType.SalesRefund:this.$("#qtyOrdered-input").val(this.model.get("Good"));break;default:this.$("#qtyOrdered-input").val(this.model.get("QuantityOrdered"))}},inputPrice_KeyUp:function(t){if(s.TransactionType!=n.TransactionType.Recharge){var i=e("#price-input").val().trim();13===t.keyCode?""!=i&&(l.IsNullOrWhiteSpace(this.isPriceChangeTriggered)&&this.UpdatePriceWithValidation(),this.isPriceChangeTriggered=!1):this.DisplayClearBtn(t)}},inputPrice_changed:function(){if(s.Preference.AllowChangePrice&&s.TransactionType!=n.TransactionType.SalesRefund&&s.TransactionType!=n.TransactionType.Return&&s.TransactionType!=n.TransactionType.SalesPayment&&s.TransactionType!=n.TransactionType.VoidTransaction&&this.model.get("ItemType")!=n.ItemType.Kit){var t=e("#price-input").val().trim();""!=t&&(this.isPriceChangeTriggered=!0,this.UpdatePriceWithValidation())}else navigator.notification.alert("Changing the item price is not allowed.",null,"Action Not Allowed","OK")},inputQtyOrdered_KeyUp:function(t){if(t.preventDefault(),s.TransactionType!=n.TransactionType.Recharge)if(13===t.keyCode){e("#qtyOrdered-input").val().trim()}else this.DisplayClearBtn(t)},inputQtyOrdered_changed:function(t){t.preventDefault();var i=e("#qtyOrdered-input").val().trim();if(""!=i){if(i==this.myQty)return;this.myQty=i,this.UpdateFieldValue("QuantityOrdered"),this.ToggleFields()}},HasCoupon:function(){return!!s.Coupon&&!(!s.Coupon.get("CouponCode")||""==s.Coupon.get("CouponCode"))},inputDiscount_KeyUp:function(t){if(13===t.keyCode){if(s.Preference.AllowItemDiscount){var i=e("#discount-input").val().trim();""!=i&&this.UpdateDiscountWithValidation()}}else this.DisplayClearBtn(t)},inputDiscount_Focus:function(t){l.Input.NonNegative("#"+t.target.id),this.qtyFocused=!1,s.TransactionType!==n.TransactionType.SalesRefund&&s.TransactionType!==n.TransactionType.SalesPayment&&s.TransactionType!==n.TransactionType.VoidTransaction&&(this.currentDiscValue=parseFloat(e("#discount-input").val()),this.$("#discount-input").val(""))},Price_Keypress:function(e){l.MaxDecimalPlaceValidation(this.$("#"+e.target.id),e)},inputDiscount_Keypress:function(e){l.MaxDecimalPlaceValidation(this.$("#"+e.target.id),e)},UpdateDiscountWithValidation:function(){var e=this;this.itemDiscountTimeOut&&clearTimeout(this.itemDiscountTimeOut),this.itemDiscountTimeOut=setTimeout(function(){e.DoUpdateDiscountWithValidation()},500)},DoUpdateDiscountWithValidation:function(){var e=s.Preference.DiscountOverrideLevel;console.log("UserRole : "+s.UserInfo.RoleCode+", Discount Manager : "+e),this.ValidateDiscount("Discount")&&this.UpdateFieldValue("Discount")},UpdateFieldValue:function(e){var t,i,a=!1;switch(e){case"QuantityOrdered":t=this.$("#qtyOrdered-input"),a=!0;break;case"SalesPriceRate":this.SetActionType(n.ActionType.ChangePrice),t=this.$("#price-input");break;case"Discount":t=this.$("#discount-input")}if(i=t.val().trim(),this.prevQty==i)return void this.RevertFieldValue(t,e,i);"QuantityOrdered"==e&&(this.prevQty=i),""===i&&(i=0);var o="QuantityOrdered"===e,r=this.HasCoupon()&&i<0;if(o)if(this.IsGiftCredits()){if(!this.IsValidGiftCreditsQty(i))return t.val(this.model.get(e)),void(this.prevQty=this.model.get(e))}else if(1==this.cartHasGiftCredit()&&i<0)return navigator.notification.alert("Item exchange is not allowed for transactions with Gift Cards. Please create a separate transaction.",null,"Negative Quantity","OK"),t.val(this.model.get(e)),void(this.prevQty=this.model.get(e));if(s.TransactionType!==n.TransactionType.SalesRefund&&o&&this.IsZero(i))return navigator.notification.alert("Please enter at least 1 quantity.",null,"Quantity Required","OK"),t.val(this.model.get(e)),void(this.prevQty=this.model.get(e));if(o&&(this.ValidateNegativeQuantity(i)===!1||r)){var l=s.TransactionType;s.TransactionType===n.TransactionType.SalesRefund?(l="Return",t.val(this.model.get("Good"))):t.val(this.model.get(e));var u="Negative quantity is not allowed.\nPlease remove coupon first.";return this.ValidateNegativeQuantity(i)===!1&&(u=this.model.get("ItemType")==n.ItemType.GiftCard||this.model.get("ItemType")==n.ItemType.GiftCertificate?"Negative quantity is not allowed for "+this.model.get("ItemType")+" item":"Negative quantity is not allowed for "+l+" transaction."),void navigator.notification.alert(u,null,"Negative Quantity","OK")}switch(s.TransactionType){case n.TransactionType.SalesRefund:var c=this.model.get("Outstanding");if(o&&i>c)return t.val(this.model.get("Good")),console.log("Value must be less than or equal to the Outstanding quantity."),void navigator.notification.alert("Value must be less than or equal to the Outstanding quantity.",null,"Incorrect Value","OK");break;default:if(i=t.val().trim(),""===i||null===i)return void t.val(this.model.get(e));if(o&&(0===i||"0"===i))return t.val(this.model.get(e)),console.log("Please enter at least 1 quantity."),void navigator.notification.alert("Please enter at least 1 quantity.",null,"Quantity Required","OK");if(o){i-this.model.get("QuantityOrdered")}}i=t.val().trim(),this.IsNumeric(i,a)?"Discount"===e&&i>100?this.RevertFieldValue(t,e,i):this.UpdateModel(e,i):this.RevertFieldValue(t,e,i)},RevertFieldValue:function(e,t,i){e.val(this.model.get(t)),""===i||null===i||(console.log("Invalid input"),navigator.notification.alert("The value you entered is not valid.",null,"Invalid Format","OK"))},UpdateSalesTaxAmountField:function(t){e("#tax-input").val(t.toFixed(2))},UpdateExtPriceField:function(t){e("#extPrice-input").val(t.toFixed(2))},UpdateModel:function(e,t){switch(this.delegateEvents(),e){case"QuantityOrdered":s.TransactionType===n.TransactionType.SalesRefund?this.model.updateQuantityGood(parseInt(t)):this.model.updateQuantityOrdered(parseInt(t));break;case"SalesPriceRate":this.model.set({DoNotChangePrice:!0,Pricing:s.Username}),this.model.updateSalesPriceRate(parseFloat(t),"UpdatePrice");break;case"Discount":this.model.updateDiscount(parseFloat(t))}},IsNumeric:function(t,i){return e.isNumeric(t)!==!1&&!(i&&!this.isInt(t))},CheckMaxDiscount:function(e){var t=s.Preference.MaxItemDiscount,i=s.Preference.MaxSaleDiscount;return!(e>t&&e>i)||(console.log("Discount must not exceed max discount of "+t+"%"),navigator.notification.alert("Discount must not exceed max discount of "+t+"%",null,"Action Not Allowed","OK"),!1)},ApplyDiscountToAllWithValidation:function(e){this.ValidateDiscount("DiscountAll")&&this.ApplyDiscountToAll(e)},ApplyDiscountToAll:function(t){var i=parseFloat(e("#discount-input").val());t.applyDiscountToAll(i)},liFreestock_touchstart:function(e){e.preventDefault(),console.log("test"),this.ViewFreeStock()},liAccessory_touchstart:function(t){this.ViewAccessory(),t.preventDefault(),t.stopPropagation(),e("#li-accessory").addClass("ui-disabled")},liSubstitute_touchstart:function(t){this.ViewSubstitute(),t.preventDefault(),t.stopPropagation(),e("#li-substitute").addClass("ui-disabled")},liSerialLot_touchstart:function(e){this.ViewSerialLot(),e.preventDefault(),e.stopPropagation()},liNotes_touchstart:function(e){this.ViewNotes(),e.preventDefault(),e.stopPropagation()},PhasedOutItemChangeUnitMeasure:function(e,t){var i=new m,a=(e.get("WarehouseCode"),e.get("ItemCode"));i.set({CriteriaString:a}),i.url=s.ServiceUrl+r.PRODUCT+o.UNITMEASURECODELOOKUP+100+"/"+this.model.get("ItemCode"),i.save(null,{success:function(e,i,a){s.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),t(i)},error:function(e,t,i){s.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.RequestError(t,"Error")}})},ValidatePhasedOutItem:function(t){var i=this,a=(e("#qtyOrdered-input").val(),this.model.get("UnitMeasureCode"),this.model.get("UnitMeasureQty"),e("#itemDetail-umList option:selected").val()),n=(this.model.get("ItemCode"),new y);n.reset(t.UnitMeasures),n.length>0&&n.each(function(e){e.get("UnitMeasureCode")===a&&i.model.set({UnitMeasureCode:a,UnitMeasureQty:e.get("UnitMeasureQty")})}),this.model.set({UnitMeasureCode:a}),this.ViewUnitOfMeasure()},ValidateChangeUnitMeasure:function(){var t=e("#itemDetail-umList option:selected").val();switch(this.model.get("Status")){case"P":var i=this,a=function(e){i.ValidatePhasedOutItem(e)};this.PhasedOutItemChangeUnitMeasure(this.model,a);break;default:this.$("#itemDetail-content").addClass("ui-disabled"),this.model.set({UnitMeasureCode:t}),this.ViewUnitOfMeasure()}},selectUnitMeasure_touchstart:function(e){this.ValidateChangeUnitMeasure(),e.preventDefault(),e.stopPropagation()},ViewFreeStock:function(){this.model.viewFreeStock()},ViewAccessory:function(){this.model.viewAccessory()},ViewSubstitute:function(){this.model.viewSubstitute()},ViewSerialLot:function(){this.model.viewSerialLot()},ViewUnitOfMeasure:function(){this.model.updateUnitMeasure()},ViewWarehouseCode:function(){this.model.updateWarehouseCode()},ViewNotes:function(){this.model.viewNotes("LineItem")},isInt:function(e){return e%1===0},ToggleButtons:function(){this.ToggleAccessoryButton(),this.ToggleSubstituteButton(),this.ToggleSerialLotButton(),this.ToggleNotesButton()},ToggleAccessoryButton:function(){switch(s.TransactionType){case n.TransactionType.SalesPayment:case n.TransactionType.SalesRefund:this.$("#li-accessory").addClass("ui-disabled");break;default:this.$("#li-accessory").removeClass("ui-disabled")}},ToggleSubstituteButton:function(){switch(s.TransactionType){case n.TransactionType.SalesPayment:case n.TransactionType.SalesRefund:this.$("#li-substitute").addClass("ui-disabled");break;default:this.$("#li-substitute").removeClass("ui-disabled")}},ToggleSerialLotButton:function(){switch(s.TransactionType){case n.TransactionType.Order:case n.TransactionType.Quote:case n.TransactionType.SalesPayment:case n.TransactionType.VoidTransaction:this.$("#li-serialLot").addClass("ui-disabled");break;default:"None"!==this.model.get("SerializeLot")&&null!==this.model.get("SerializeLot")&&void 0!==this.model.get("SerializeLot")||this.model.get("ItemType")==n.ItemType.GiftCard||this.model.get("ItemType")==n.ItemType.GiftCertificate?this.$("#li-serialLot").removeClass("ui-disabled"):this.$("#li-serialLot").addClass("ui-disabled")}},ToggleNotesButton:function(){switch(s.TransactionType){case n.TransactionType.VoidTransaction:this.$("#li-notes").addClass("ui-disabled");break;default:this.$("#li-notes").removeClass("ui-disabled")}},ToggleFields:function(){var e=!0;switch(s.TransactionType){case n.TransactionType.SalesRefund:this.$("#price-input").attr("readonly","readonly"),this.$("#discount-input").removeAttr("readonly"),this.$(".applyDiscount").removeClass("ui-disabled"),this.$(".applyItemDiscount").removeClass("ui-disabled"),e=!0;break;case n.TransactionType.SalesPayment:case n.TransactionType.VoidTransaction:this.$("#price-input").attr("readonly","readonly"),this.$("#discount-input").attr("readonly","readonly"),this.$(".applyDiscount").addClass("ui-disabled"),this.$(".applyItemDiscount").addClass("ui-disabled"),e=!1;break;default:this.$("#price-input").removeAttr("readonly"),this.$("#discount-input").removeAttr("readonly"),this.$(".applyDiscount").removeClass("ui-disabled"),this.$(".applyItemDiscount").removeClass("ui-disabled"),e=!0}s.ApplicationType&&this.$("#price-input").attr("readonly","readonly"),s.TransactionType!==n.TransactionType.SalesPayment&&s.TransactionType!==n.TransactionType.VoidTransaction||this.$("#qtyOrdered-input").attr("readonly","readonly"),s.Preference.AllowSaleDiscount===!1?this.$(".applyDiscount").addClass("ui-disabled"):e&&this.$(".applyDiscount").removeClass("ui-disabled"),s.Preference.AllowItemDiscount===!1?(this.$(".applyItemDiscount").addClass("ui-disabled"),this.$(".applyDiscount").addClass("ui-disabled"),this.$("#discount-input").addClass("ui-disabled").attr("disabled",!0)):e&&this.$(".applyItemDiscount").removeClass("ui-disabled"),s.Preference.AllowItemDiscount===!1&&s.Preference.AllowSaleDiscount===!1?this.$("#discount-input").addClass("ui-disabled").attr("disabled",!0):e&&this.$("#discount-input").removeClass("ui-disabled"),s.Preference.AllowChangePrice===!1?this.$("#price-input").attr("disabled","disabled"):s.TransactionType!==n.TransactionType.SalesRefund&&(this.$("#price-input").removeAttr("disabled"),this.$("#price-input").removeAttr("readonly")),this.model.get("QuantityOrdered")<0&&(this.$(".applyDiscount").addClass("ui-disabled"),this.$(".applyItemDiscount").addClass("ui-disabled"),this.$("#discount-input").attr("readonly","readonly"),this.$("#discount-input").val(0))},ExceedsMaxDiscountValue:function(t){return!(t<=100)&&(navigator.notification.alert("Discount must not exceed 100%.",null,"Action Not Allowed","OK"),e("#discount-input").val(this.currentDiscValue),!0)},ValidateDiscount:function(e){var t=this.$("#discount-input").val(),i=(this.$("#discount-input"),s.Preference.DiscountOverrideLevel);if(console.log("UserRole : "+s.UserInfo.RoleCode+", Discount Manager : "+i),t>0){var a=0,o=0;if("Discount"===e?(a=s.Preference.MaxItemDiscount,o==s.Preference.MinItemDiscount,this.SetActionType(n.ActionType.ItemDiscount)):"DiscountAll"===e&&(a=s.Preference.MaxSaleDiscount,o==s.Preference.MinItemDiscount,this.SetActionType(n.ActionType.SaleDiscount)),0!=t){if((t>a||t>100)&&null===i)return t>100?(navigator.notification.alert("Discount must not exceed 100%",null,"Action Not Allowed","OK"),!1):(console.log("Discount must not exceed max discount of "+a+"%"),navigator.notification.alert("Discount must not exceed max discount of "+a+"%",null,"Action Not Allowed","OK"),!1);if(t>100){var r="Discount must not exceed 100%";return this.IsDiscountManagerOverrideLevel()||(r="Discount must not exceed max discount of "+a+"%"),navigator.notification.alert(r,null,"Action Not Allowed","OK"),!1}return!(!this.ValidateReason(e)||!this.ValidateManagerOverride(s.ActionType))}if(t>100){var r="Discount must not exceed 100%";return this.IsDiscountManagerOverrideLevel()||(r="Discount must not exceed max discount of "+a+"%"),navigator.notification.alert(r,null,"Action Not Allowed","OK"),!1}return this.ValidateReason(e)}return!(t<0||t>100)||(console.log("Please enter a valid discount amount"),navigator.notification.alert("Please enter a valid discount amount",null,"Maximum Discount Reached","OK"),!1)},ValidateReason:function(e){var t=s.ReasonCode.Discount;if(t===!0){var i=s.ActionType;return this.CheckReason(i),!1}return!0},CheckReason:function(e){switch(e){case n.ActionType.VoidItem:this.SetActionType(e),s.ReasonCode.Item&&s.TransactionType!=n.TransactionType.SalesRefund?this.LoadReason(100,"",e):(this.model.removeSerial(),this.model.removeItem());break;default:this.LoadReason(100,"",e)}},ProceedToAction:function(e){var t=e.get("Action");switch(t){case"VoidItem":this.RemoveThisItem();break;default:s.ReasonCode.Discount=!0}},ShowReasonView:function(t,i){console.log("reasonView type :"+i),e("#reasonPageContainer").append("<div id='reasonMainContainer'></div>"),this.ItemReasonView&&(this.ItemReasonView.remove(),this.ItemReasonView.unbind(),this.ItemReasonView=null),this.ItemReasonView=new u({el:e("#reasonMainContainer"),collection:t,type:i})},LoadReason:function(e,t,i){var a=this,n=new p,l=e;s.ActionType;this.itemReasonCollection=new T,this.itemReasonCollection.unbind(),this.itemReasonCollection.on("acceptReason",this.AcceptReason,this),this.itemReasonCollection.on("savedItem",this.ProceedToAction,this),n.set({StringValue:t}),n.url=s.ServiceUrl+r.POS+o.REASONLOOKUP+l,n.save(null,{success:function(e,t){s.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),a.itemReasonCollection.reset(t.Reasons),a.ShowReasonView(a.itemReasonCollection,i)},error:function(e,t,i){s.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.RequestError(t,"Error Loading Reason Codes")}})},SetActionType:function(e){s.ActionType=e},AcceptReason:function(){switch(s.ActionType){case n.ActionType.ItemDiscount:this.ValidateManagerOverride(s.ActionType)&&(this.SaveReason(),this.UpdateFieldValue("Discount"));break;case n.ActionType.SaleDiscount:this.ValidateManagerOverride(s.ActionType)&&(this.SaveReason(),this.ApplyDiscountToAll(this.model));break;default:this.ValidateManagerOverride(s.ActionType)&&(this.SaveReason(),this.RemoveThisItem(this.model))}},SaveReason:function(){this.ItemReasonView&&this.ItemReasonView.SaveReason()},IsDiscountManagerOverrideLevel:function(){if(!s.Preference.DiscountOverrideLevel)return!0;var e=s.Preference.DiscountOverrideLevel.toLowerCase(),t=s.UserInfo.RoleCode.toLowerCase();return!e||e==t},ValidateManagerOverride:function(e){var t=null;if(e===n.ActionType.ItemDiscount||e===n.ActionType.SaleDiscount){var i=0,a=this.$("#discount-input").val();if(i=e===n.ActionType.ItemDiscount?s.Preference.MaxItemDiscount:s.Preference.MaxSaleDiscount,a<=i)return!0;t=s.Preference.DiscountOverrideLevel}else e===n.ActionType.ChangePrice&&(t=s.Preference.PriceChangeOverrideLevel);return""==t||null==t||s.UserInfo.RoleCode==t||(s.OverrideMode=e,this.ShowManagerOverride(),!1)},ShowManagerOverride:function(){return this.InitializeManagerOverrideView(),this.managerOverrideView.Show(),!1},InitializeManagerOverrideView:function(){this.managerOverrideView||(this.managerOverrideView=new c({el:e("#managerOverrideContainer")}),this.managerOverrideView.on("ManagerOverrideAccepted",this.AcceptManagerOverride,this))},AcceptManagerOverride:function(e,t){var i=this,a=s.Username,n=s.Password,l=new h;s.Username=e,s.Password=t,l.url=s.ServiceUrl+r.POS+o.MANAGEROVERRIDE+s.POSWorkstationID+"/"+s.OverrideMode,l.save(null,{success:function(e,t){s.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),i.AcceptManagerOverrideCompleted(e,t)},error:function(e,t,i){s.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.RequestError(t,"Error Saving Manager Override")}}),s.Username=a,s.Password=n},AcceptManagerOverrideCompleted:function(e,t){null==t.ErrorMessage||""==t.ErrorMessage?(mode=s.OverrideMode,mode===n.ActionType.ItemDiscount||mode===n.ActionType.SaleDiscount?(mode===n.ActionType.ItemDiscount?this.UpdateFieldValue("Discount"):this.ApplyDiscountToAll(this.model),s.Preference.IsReasonDiscount&&this.SaveReason()):"ChangePrice"===mode&&this.UpdateFieldValue("SalesPriceRate"),this.managerOverrideView.Close()):(console.log(t.ErrorMessage),navigator.notification.alert(t.ErrorMessage,null,"Override Failed","OK"))},UpdatePriceWithValidation:function(){s.ActionType=n.ActionType.ChangePrice,this.ValidateManagerOverride(s.ActionType)&&this.UpdateFieldValue("SalesPriceRate")},cartHasGiftCredit:function(){var e=s.CartCollection,t=e.find(function(e){return e.get("ItemType")==n.ItemType.GiftCard||e.get("ItemType")==n.ItemType.GiftCertificate});return!!t},ValidateNegativeQuantity:function(e){return s.TransactionType!==n.TransactionType.SalesRefund&&s.TransactionType==n.TransactionType.Sale&&"Kiosk"!==s.ApplicationType&&this.model.get("ItemType")!=n.ItemType.GiftCard&&this.model.get("ItemType")!=n.ItemType.GiftCertificate||!(e<0)},qty_focus:function(e){this.IsGiftCredits()?l.Input.NonNegativeInteger("#"+e.target.id):l.Input.Integer("#"+e.target.id)},price_focus:function(e){l.Input.NonNegative("#"+e.target.id)},Price_Keyup:function(t){"0."==t.currentTarget.value&&(e(t.target).val("0.0"),e(t.target).val("0."),e(t.target).focus())}});return O});