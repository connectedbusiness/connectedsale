define(["jquery","mobile","underscore","backbone","shared/shared","text!template/20.1.0/settings/category/category.tpl.html"],function(e,t,i,s,o,n){var a=s.View.extend({_template:i.template(n),tagName:"li",events:{tap:"SelectCategory"},initialize:function(){this.$el.attr("id",this.model.cid),this.model.bind("remove",this.RemoveItem,this)},render:function(){return this.$el.html(this._template(o.EscapedModel(this.model).toJSON())),this.$("#deletebtn-overlay").hide(),this.$(".td-categ-desc").css("width","100%"),this.$(".td-categ-del").css("display","none"),this},RemoveItem:function(){this.remove()},SelectCategory:function(e){e.stopPropagation(),this.model.select()}});return a});