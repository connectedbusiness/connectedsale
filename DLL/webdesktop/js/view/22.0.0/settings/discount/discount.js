define(["jquery","mobile","underscore","backbone","shared/global","shared/service","shared/method","collection/preferences","text!template/19.0.0/settings/discount/discount.tpl.html","js/libs/mobile-range-slider.js","js/libs/ui.checkswitch.min.js"],function(e,t,i,n,o,s,l,c,r){var a,u,h=n.View.extend({_template:i.template(r),events:{"tap #AllowSaleDiscount , #AllowItemDiscount":"Chkbox_click"},initialize:function(){this.render()},render:function(){this.FetchPreference()},InitializeDisplay:function(){this.$el.html(this._template(this.preferenceCollection.at(0).toJSON())),this.ToggleCheckboxes(),this.$("#settings-discount").trigger("create"),this.RenderRangeSlider(this.preferenceCollection.at(0))},InitializePreferences:function(){this.preferences||(this.preferences=new c)},InitializePreferenceCollection:function(){this.preferenceCollection||(this.preferenceCollection=new c)},FetchPreference:function(){var e=this;this.InitializePreferences(),this.InitializePreferenceCollection(),this.preferences.url=o.ServiceUrl+s.POS+l.GETPREFERENCEBYWORKSTATION+o.POSWorkstationID,this.preferences.fetch({success:function(t,i){e.ResetPreferenceCollection(i.Preference)},error:function(e,t,i){o.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.RequestError(t,"Error Retrieving Workstation Preference")}})},hasChanged:function(e){var t=e.changedAttributes();console.log(t)},Chkbox_click:function(e){e.preventDefault();var t="#"+e.currentTarget.id,i=this.GetCheckState(t);this.SetChkState(e.currentTarget.id,!i)},GetCheckState:function(t){return!!e(t).hasClass("icon-ok-sign")},ToggleCheckbox:function(t,i){i?(e("#"+t).addClass("icon-ok-sign").css("color",""),e("#"+t).removeClass("icon-circle-blank")):(e("#"+t).addClass("icon-circle-blank").css("color","#DADADA"),e("#"+t).removeClass("icon-ok-sign"))},SetChkState:function(e,t){var i=this;switch(e){case"AllowSaleDiscount":i.allowSaleDiscount=t,i.DisableMaxRangeSlider(e,t);break;case"AllowItemDiscount":i.allowItemDiscount=t,i.DisableMaxRangeSlider(e,t)}i.ToggleCheckbox(e,t)},Save:function(){if(this.preferenceCollection&&0!==this.preferenceCollection.length&&this.preferences&&0!==this.preferences.length){this.UpdatePreference();var e=this,t=this.preferences.at(0);t.set({Preference:this.preferenceCollection.at(0)}),t.url=o.ServiceUrl+s.POS+l.UPDATEPREFERENCE,t.save(null,{success:function(t,i){e.SaveCompleted()},error:function(e,t,i){o.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.RequestError(t,"Error Saving Discount Preference")}})}},SaveCompleted:function(){o.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),this.trigger("SaveCompleted",this)},ToggleCheckboxes:function(){var t=this,n=this.preferenceCollection.at(0),o=["AllowSaleDiscount","AllowItemDiscount"];i.each(o,function(i){var o="#"+i;switch(i){case"AllowSaleDiscount":t.allowSaleDiscount=n.attributes.AllowSaleDiscount;break;case"AllowItemDiscount":t.allowItemDiscount=n.attributes.AllowItemDiscount}n.get(i)?(t.ToggleCheckbox(i,!0),e(o+"-max").removeClass("ui-disabled")):(t.ToggleCheckbox(i,!1),e(o+"-max").addClass("ui-disabled"))})},DisableMaxRangeSlider:function(t,i){switch(t){case"AllowSaleDiscount":i?e("#"+t+"-max").removeClass("ui-disabled"):e("#"+t+"-max").addClass("ui-disabled");break;case"AllowItemDiscount":i?e("#"+t+"-max").removeClass("ui-disabled"):e("#"+t+"-max").addClass("ui-disabled")}},ResetPreferenceCollection:function(e){o.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),this.preferenceCollection.reset(e),this.InitializeDisplay()},UpdatePreference:function(){var e=this,t=this.preferenceCollection.at(0),n=["AllowSaleDiscount","AllowItemDiscount"];i.each(n,function(i){var n=!1;switch(i){case"AllowSaleDiscount":n=e.allowSaleDiscount,t.set({AllowSaleDiscount:n});break;case"AllowItemDiscount":n=e.allowItemDiscount,t.set({AllowItemDiscount:n})}}),e.preferenceCollection.reset(t)},RenderRangeSlider:function(t){a=new MobileRangeSlider("maxSale-Slider",{value:t.get("MaxSaleDiscount"),min:0,max:100,change:function(i){value=i,e("#maxSale").text(i+"%"),t.set({MaxSaleDiscount:i})}}),u=new MobileRangeSlider("maxItem-Slider",{value:t.get("MaxItemDiscount"),min:0,max:100,change:function(i){value=i,e("#maxItem").text(i+"%"),t.set({MaxItemDiscount:i})}})}});return h});