define(["jquery","mobile","underscore","backbone","text!template/21.0.0/settings/general/location/location.tpl.html"],function(e,t,i,l,n){var o=l.View.extend({_locationTemplate:i.template(n),tagName:"li",events:{tap:"Selected"},initialize:function(){},render:function(){return this.$el.attr("id",this.model.cid),this.$el.html(this._locationTemplate(this.model.toJSON())),this},Selected:function(){this.model.select()}});return o});