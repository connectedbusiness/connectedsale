define(["jquery","mobile","underscore","backbone","shared/global","shared/method","text!template/18.1.0/pos/item/header-info/company/companyinfo.tpl.html"],function(e,t,n,a,i,o,r){var l=a.View.extend({_template:n.template(r),initialize:function(){this.render()},render:function(){var e=(i.CompanyName.replace(/[^a-z0-9\s]/gi,"").replace(/[_\s]/g," "),i.ServiceUrl+o.COMPANYIMAGE+this.model.get("CompanyImageLocation")+".png");this.model.set({ImageLocation:e},{silent:!0}),this.$el.prepend(this._template(this.model.toJSON()))}});return l});