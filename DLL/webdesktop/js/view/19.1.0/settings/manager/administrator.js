define(["jquery","mobile","underscore","backbone","text!template/19.1.0/settings/manager/administrator.tpl.html"],function(e,t,i,l,n){var s=l.View.extend({_template:i.template(n),tagName:"li",events:{click:"Selected"},render:function(){return this.$el.html(this._template(this.model.toJSON())),this},Selected:function(){var e=(this.model.get("EditedRoleCode"),this.GetCheckState());this.model.set({Selected:!e}),this.trigger("Selected",this.model.get("Selected"),this.model.get("RoleCode"))},GetCheckState:function(){return!!this.$el.find(".settings-manager-checkbox").hasClass("icon-ok-sign")}});return s});