define(["jquery","mobile","underscore","backbone","shared/shared","text!template/16.0.0/settings/category/category.tpl.html"],function(e,t,i,o,a,r){var l=o.View.extend({_template:i.template(r),tagName:"li",events:{tap:"SelectCategory","tap #categoryItemDelete-btn":"DeleteCategoryItem"},initialize:function(){this.$el.attr("id",this.model.cid),this.$el.attr("class","currentCategoryLi"),this.model.bind("remove",this.RemoveItem,this)},render:function(){return this.$el.html(this._template(a.EscapedModel(this.model).toJSON())),this.$("#deletebtn-overlay").show().fadeIn("slow"),this},DeleteCategoryItem:function(){this.model.removeItem()},RemoveItem:function(){this.remove()},SelectCategory:function(t){t.stopPropagation(),e(this.el).undelegate(".currentCategoryLi","tap"),this.model.setDefault()}});return l});