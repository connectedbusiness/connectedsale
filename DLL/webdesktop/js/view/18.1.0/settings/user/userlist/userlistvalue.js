define(["jquery","mobile","underscore","backbone","text!template/18.1.0/settings/user/userlist/userlistvalue.tpl.html"],function(e,t,i,l,s){var n=l.View.extend({_template:i.template(s),tagName:"li",events:{"tap ":"SetSelected"},initialize:function(){},SetSelected:function(){this.model.select(),this.trigger("selected",this.model)},render:function(e){return this.model=e,this.$el.attr("id",this.model.cid),this.$el.html(this._template(this.model.toJSON())),this}});return n});