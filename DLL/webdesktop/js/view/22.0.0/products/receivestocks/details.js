define(["jquery","mobile","underscore","shared/shared","backbone","view/22.0.0/products/receivestocks/detail/general","text!template/22.0.0/products/receivestocks/details.tpl.html","text!template/22.0.0/products/receivestocks/detailsmenu.tpl.html"],function(e,t,s,i,l,a,o,n){var c="#stockDetailsContainer",d=l.View.extend({_template:s.template(o),_menuTemplate:s.template(n),initialize:function(){},render:function(){this.$el.html(this._template),this.InitializeChildViews()},DisplayNoRecordFound:function(){i.Products.DisplayNoRecordFound("#right-panel",".list-wrapper",this.toBeSearched)},InitializeChildViews:function(){this.model?(this.$("#stockDetails > #stockMenu").html(this._menuTemplate),this.SetSelectedTab("General"),this.LoadGeneralView()):this.DisplayNoRecordFound()},LoadGeneralView:function(){this.SetSelectedTab("General");new a({el:e(c),model:this.model})},SetSelectedTab:function(e){this.$("#stock-General").removeClass("selectedTab "),this.$("#stock-General").addClass("unSelectedTab"),this.$("#stock-"+e).removeClass("unSelectedTab"),this.$("#stock-"+e).addClass("selectedTab"),this.$("#stock-"+e).css("color","black")},Show:function(e){this.model=e,this.render()}});return d});