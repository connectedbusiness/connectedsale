define(["jquery","mobile","underscore","backbone","shared/global","shared/service","shared/method","model/userrole","collection/userroles","view/21.0.0/settings/manager/userrole","text!template/21.0.0/settings/manager/userroles.tpl.html"],function(e,t,r,i,o,s,n,l,c,a,d){var h=i.View.extend({_template:r.template(d),initialize:function(){this.preferenceCollection=this.options.preferenceCollection,this.userRoleCollection=this.options.userRoleCollection,this.on("UpdateUserOverride",this.Save,this)},render:function(){e("#back-general").show(),this.$el.html(this._template)},CreateChild:function(e){var t=new a({model:e});this.$(".userRoles-fieldset").append(t.render().el),t.on("Selected",this.UserRoleSelected,this)},CreateChildren:function(){this.AddNoneOption(),this.userRoleCollection.each(function(e){this.CreateChild(e)},this),this.$(".userRole-list").trigger("create")},Show:function(){this.render(),this.CreateChildren(),this.ToggleFields()},SetPreferences:function(e){this.preferences=e},SetType:function(e){this.Type=e},AddNoneOption:function(){if(!r.find(this.userRoleCollection.models,function(e){return"None"==e.attributes.RoleCode})){var e=new l;e.set({RoleCode:"None"}),this.userRoleCollection.add(e)}},ToggleFields:function(){var e="";switch(this.Type){case"Discount":e=this.preferenceCollection.at(0).get("DiscountOverrideLevel");break;case"Price":e=this.preferenceCollection.at(0).get("PriceChangeOverrideLevel");break;case"Void":e=this.preferenceCollection.at(0).get("TransactionVoidOverrideLevel");break;case"Return":e=this.preferenceCollection.at(0).get("ReturnsOverrideLevel");break;case"AutoAllocate":e=this.preferenceCollection.at(0).get("AutoAllocateOverrideLevel")}""!==e&&null!==e||(e="None"),this.selectedRoleCode=e;var t="#"+e;this.$(t).prop("checked",!0).checkboxradio("refresh")},Save:function(){if(this.UpdatePreference(),this.preferenceCollection&&0!==this.preferenceCollection.length&&this.preferences&&0!==this.preferences.length){var e=this,t=this.preferences.at(0);t.set({Preference:this.preferenceCollection.at(0)}),t.url=o.ServiceUrl+s.POS+n.UPDATEPREFERENCE,t.save(null,{success:function(t,r){e.SaveCompleted()},error:function(e,t,r){e.RequestError(t,"Error Saving Manager Preference")}})}},SaveCompleted:function(){o.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),this.trigger("SaveCompleted",this)},UpdatePreference:function(){switch("None"===this.selectedRoleCode&&(this.selectedRoleCode=null),this.Type){case"Discount":this.preferenceCollection.at(0).set({DiscountOverrideLevel:this.selectedRoleCode});break;case"Price":this.preferenceCollection.at(0).set({PriceChangeOverrideLevel:this.selectedRoleCode});break;case"Void":this.preferenceCollection.at(0).set({TransactionVoidOverrideLevel:this.selectedRoleCode});break;case"Return":this.preferenceCollection.at(0).set({ReturnsOverrideLevel:this.selectedRoleCode});break;case"AutoAllocate":this.preferenceCollection.at(0).set({AutoAllocateOverrideLevel:this.selectedRoleCode})}},UserRoleSelected:function(e){this.selectedRoleCode=e}});return h});