define(["jquery","mobile","underscore","backbone","text!template/19.2.0/settings/manager/userrole.tpl.html"],function(e,t,n,i,r){var a=i.View.extend({_template:n.template(r),tagName:"span",events:{"change input":"radio_change"},render:function(){return this.$el.html(this._template(this.model.toJSON())),this},radio_change:function(){var e=this.model.get("RoleCode"),t=document.getElementById(e).checked;t&&this.trigger("Selected",e,this)}});return a});