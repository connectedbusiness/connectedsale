define(["jquery","mobile","underscore","backbone","shared/shared","shared/global","view/20.1.0/settings/general/taxscheme/taxscheme","text!template/20.1.0/settings/general/taxscheme/taxschemepage.tpl.html","text!template/20.1.0/settings/general/taxscheme/search.tpl.html","js/libs/iscroll.js"],function(e,t,s,a,r,i,h,l,n){var c=a.View.extend({_template:s.template(l),_search:s.template(n),initialize:function(){e("#settings-salesexempttaxcode-search").remove(),this.render()},render:function(){e("#back-general").show(),this.$el.html(this._template),e("#right-pane-content").before(this._search),this.$el.trigger("create"),this.collection.each(this.LoadTaxSchemes,this),i.isBrowserMode?r.ApplyListScroll():this.myScroll=new iScroll("right-pane-content")},LoadTaxSchemes:function(e){var t=e.get("TaxCode");e.set({FormattedTaxCode:r.Escapedhtml(t),SalesExemptTaxCode:t}),this.taxSchemePreference=new h({model:e}),this.$("#TaxSchemeListPreference").append(this.taxSchemePreference.render().el),this.$("#TaxSchemeListPreference").listview("refresh")}});return c});