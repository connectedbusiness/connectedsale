define(["jquery","mobile","underscore","backbone","shared/shared","model/base","model/lookupcriteria","collection/base","text!template/19.2.0/products/openingbalance/detail/general.tpl.html","js/libs/moment.min.js","js/libs/format.min.js"],function(e,t,n,i,s,a,o,l,r){var m=i.View.extend({_generalTemplate:n.template(r),events:{},initialize:function(){this.$el.show(),this.IsNew=!1},ConvertTransactionDate:function(){var e="L",t=moment(this.model.get("TransactionDate")).format(e);this.model.set({ConvertedTransactionDate:t})},SetEscapedHtml:function(){var e=this.model.get("ItemName");e=s.Escapedhtml(e),this.model.set({ItemName:e})},render:function(){return this.ConvertTransactionDate(),this.SetEscapedHtml(),this.$el.html(this._generalTemplate(this.model.toJSON())),this},Show:function(){this.render()},Close:function(){this.remove(),this.unbind()},InitializeChildViews:function(){}});return m});