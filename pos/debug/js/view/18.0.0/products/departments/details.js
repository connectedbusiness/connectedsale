
define([
	'jquery',
	'mobile',
	'underscore',
	'backbone',
	'shared/global',
	'shared/shared',		
	'view/16.0.0/products/departments/detail/general',
	'view/16.0.0/products/departments/detail/sortorder',
	'text!template/16.0.0/products/departments/details.tpl.html',
	'text!template/16.0.0/products/departments/detailsmenu.tpl.html'	
], function($, $$, _, Backbone, Global, Shared, GeneralView, SortOrderView, template, menuTemplate){
	
	var _departmentDetailContainer_el = "#departmentDetailsContainer";
	
	var DepartmentDetailView = Backbone.View.extend({
		_template : _.template( template ),
		_menuTemplate :_.template(menuTemplate),
		
		events : {
			'tap #department-General' : 'General_Tap',
			//'tap #department-SortOrder' : 'SortOrder_Tap',
		},
		
		initialize : function(){
			this.render();
		},
		General_Tap : function(){

			Global.IsLoaded = false;
			this.SetSelectedTab("General");
			this.generalView = new GeneralView({
				el : $(_departmentDetailContainer_el),
				model : this.model,
                IsReadOnly : this.options.IsReadOnly
			});
			this.generalView.BindToForm(this.mainView);
		
			
		},
		BindToForm  : function(mainView){
			this.mainView = mainView;
		},
		SortOrder_Tap : function(){
			// this.SetSelectedTab("SortOrder");
				// if(Global.IsLoaded == false){
					// Global.IsLoaded = true;
					// this.sortOrderView  = new SortOrderView({
					// el : $(_departmentDetailContainer_el),
						// model : this.model
					// });
					// this.sortOrderView.LoadScroll();	
				// }		
		},

		DisplayNoRecordFound : function() {
            Shared.Products.DisplayNoRecordFound("#right-panel", ".list-wrapper", this.toBeSearched);
        },

		SetSelectedTab : function(type){

			this.$("#department-General").removeClass("selectedTab");this.$("#department-General").addClass("unSelectedTab");
			this.$("#department-SortOrder").removeClass("selectedTab");this.$("#department-SortOrder").addClass("unSelectedTab");
			this.$("#department-"+type).removeClass("unSelectedTab");
			this.$("#department-"+type).addClass("selectedTab");
			this.$("#department-"+type).css("color","black");
				
			
		},
		render : function() {
			this.$el.html( this._template );
			Global.IsNewCatagory = true;
			Global.IsLoaded = false;
		},
		InitializeChildViews : function(){
			if(this.model){
				this.$("#departmentDetails > #departmentMenu").html(this._menuTemplate);
				this.SetSelectedTab("General");this.General_Tap();
			}else{
				this.DisplayNoRecordFound();
			}
			
		}
	

	});
	return DepartmentDetailView;
})
