define(["jquery","mobile","underscore","backbone","shared/global","shared/service","shared/method","shared/shared","view/18.1.0/products/category/detail/general","view/18.1.0/products/category/detail/sortorder","text!template/18.1.0/products/category/details.tpl.html","text!template/18.1.0/products/category/detailsmenu.tpl.html"],function(e,t,a,r,o,s,i,l,d,n,c,h){var y="#categoryDetailsContainer",g=r.View.extend({_template:a.template(c),_menuTemplate:a.template(h),events:{"tap #category-General":"General_Tap"},initialize:function(){this.render()},General_Tap:function(){o.IsLoaded=!1,this.SetSelectedTab("General"),this.generalView=new d({el:e(y),model:this.model,IsReadOnly:this.options.IsReadOnly}),this.generalView.BindToForm(this.mainCategoryView)},BindToForm:function(e){this.mainCategoryView=e},SortOrder_Tap:function(){this.SetSelectedTab("SortOrder"),0==o.IsLoaded&&(o.IsLoaded=!0,this.sortOrderView=new n({el:e(y),model:this.model}),this.sortOrderView.LoadScroll())},SetSelectedTab:function(e){this.$("#category-General").removeClass("selectedCategory "),this.$("#category-General").addClass("unSelectedCatagory"),this.$("#category-SortOrder").removeClass("selectedCategory"),this.$("#category-SortOrder").addClass("unSelectedCatagory"),this.$("#category-"+e).removeClass("unSelectedCatagory"),this.$("#category-"+e).addClass("selectedCategory"),this.$("#category-"+e).css("color","black")},render:function(){this.$el.html(this._template),o.IsNewCatagory=!0},InitializeChildViews:function(){this.model?(this.$("#categoryDetails > #categoryMenu").html(this._menuTemplate),this.SetSelectedTab("General"),this.General_Tap()):this.DisplayNoRecordFound()},DisplayNoRecordFound:function(){l.Products.DisplayNoRecordFound("#right-panel",".list-wrapper",this.toBeSearched)}});return g});