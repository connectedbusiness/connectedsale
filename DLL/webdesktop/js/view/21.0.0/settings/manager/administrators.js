define(["jquery","mobile","underscore","backbone","shared/global","shared/service","shared/method","model/userrole","model/lookupcriteria","collection/userroles","view/21.0.0/settings/manager/administrator","text!template/21.0.0/settings/manager/administrators.tpl.html"],function(e,t,r,i,o,s,n,l,c,a,d,h){var u=i.View.extend({_template:r.template(h),render:function(){e("#back-general").show(),this.$el.html(this._template),this.on("UpdateAdmin",this.UpdateUserRoleCollection,this)},CreateChild:function(e){var t=new d({model:e});t.on("Selected",this.ToggleCheckbox),this.$("#administrator-fieldset").append(t.render().el)},Show:function(){this.render(),this.FetchData()},SetPreferences:function(e){this.preferences=e},FetchData:function(){var e=this,t=new c,r=100,i="";this.userRoleCollection||(this.userRoleCollection=new a),t.set({StringValue:i}),t.url=o.ServiceUrl+s.POS+n.USERROLELOOKUP+r,t.save(null,{success:function(t,r){e.FetchDataCompleted(r.UserRoles)},error:function(e,t,r){o.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.RequestError(t,"Error Retrieving User Roles")}})},FetchDataCompleted:function(e){o.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),this.userRoleCollection.reset(e),this.UpdateSelected(),this.userRoleCollection.each(function(e){var t=e.get("RoleCode").replace(/[^A-Z0-9]+/gi,"");e.set({EditedRoleCode:t}),this.CreateChild(e),this.ToggleCheckbox(e.get("Selected"),t)},this),this.$(".administrator-list").trigger("create"),this.ToggleFields()},SetSelectedAdministratorUserRoles:function(e){this.selectedAdministratorUserRoles=e},ToggleCheckbox:function(t,r){t?(e("#"+r).find(".settings-manager-checkbox").addClass("icon-ok-sign").css("color",""),e("#"+r).find(".settings-manager-checkbox").removeClass("icon-circle-blank")):(e("#"+r).find(".settings-manager-checkbox").addClass("icon-circle-blank").css("color","#DADADA"),e("#"+r).find(".settings-manager-checkbox").removeClass("icon-ok-sign"))},Selected:function(e,t){this.ToggleCheckbox(e,t)},ToggleFields:function(){for(var t=this,r=0,i=t.selectedAdministratorUserRoles.length;r<i;r++){var s=t.selectedAdministratorUserRoles.at(r).get("RoleCode"),n=s.replace(/[^A-Z0-9]+/gi,""),l="#"+n;s!=o.UserInfo.RoleCode&&t.HasOverrideLevel(s)!==!0||e(l).parent().addClass("ui-disabled")}},HasOverrideLevel:function(e){var t=o.Preference.AutoAllocateOverrideLevel,r=o.Preference.DiscountOverrideLevel,i=o.Preference.PriceChangeOverrideLevel,s=o.Preference.ReturnsOverrideLevel,n=o.Preference.TransactionVoidOverrideLevel;return t===e||r===e||i===e||s===e||n===e},UpdateSelected:function(){for(var e=0,t=this.userRoleCollection.length;e<t;e++){var r=this.userRoleCollection.at(e),i=this.selectedAdministratorUserRoles.find(function(e){return e.get("RoleCode")===r.get("RoleCode")}),o=null!=i;r.set({Selected:o})}},UpdateUserRoleCollection:function(){var e=this.userRoleCollection.where({Selected:!0});this.userRoleCollection.reset(e),this.Save()},Save:function(){if(this.userRoleCollection&&this.preferences&&0!==this.preferences.length){var e=this,t=this.preferences.at(0);t.set({UserRoles:this.userRoleCollection}),t.url=o.ServiceUrl+s.POS+n.UPDATEPREFERENCE,t.save(null,{success:function(t,r){e.SaveCompleted()},error:function(e,t,r){e.RequestError(t,"Error Saving Manager Preference")}})}},SaveCompleted:function(){o.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),this.trigger("SaveCompleted",this)}});return u});