
define([
	'jquery',
	'mobile',
	'underscore',
	'backbone',
	'shared/global',
	'shared/service',
	'shared/method',	
	'model/department',
    'collection/departments',
	'view/19.0.0/products/departments/detail/sortorder/sortorderlist',
	'text!template/19.0.0/products/departments/detail/sortorder.tpl.html'
], function($, $$, _, Backbone, Global, Service, Method, DepartmentModel, DepartmentCollection, SortOrderListView, template){
	
	var DepartmentSortOrderView = Backbone.View.extend({
		_template : _.template( template ),

		events : {
			
		},
		
		initialize : function(){
			this.render()
		},
		
		render : function() {
			this.$el.html( this._template);
			this.InitializeChildViews();
		},
		InitializeChildViews : function(){
			this.InitializeSortOrderView();
		},
		InitializeSortOrderView  : function(){
			
			this.departmentLookUp = new DepartmentModel();
			var _rowsToSelect =  100;
			var _self = this;
		 		this.departmentLookUp.set({
			    	SortOrderCriteria : "ParentNode"
			 });
			this.departmentLookUp.url = Global.ServiceUrl + Service.PRODUCT + Method.GETDEPARTMENTDETAILS + _rowsToSelect;
            this.departmentLookUp.save(null,{
            	success : function(collection,response){
            		_self.DisplayParentNode(response.Departments);
            		_self.InitializeParentNode();
            	}
            }); 
			
		},
		DisplayParentNode : function(response){
			this.departmentCollection = new DepartmentCollection();
			this.departmentCollection.reset(response);
			this.departmentCollection.each(function(model){
				var parentNode = model.get("ParentDepartment");
				parentNode = parentNode.replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '-');
				model.set({
					ParentID : parentNode
				});
				var sortOrderList = new SortOrderListView({
					el: $("#sortOrderList"),
					model : model
				})
			});
			
			

		},
		InitializeParentNode : function(){
			this.departmentLookUp = new DepartmentModel();
			var _rowsToSelect =  100;
			var _self = this;
	
		 	this.departmentLookUp.set({
			    	SortOrderCriteria : "ChildNode"
			 });
			this.departmentLookUp.url = Global.ServiceUrl + Service.PRODUCT + Method.GETDEPARTMENTDETAILS + _rowsToSelect;
            this.departmentLookUp.save(null,{
            	success : function(collection,response){
            		_self.DisplayChildNode(response.Departments);
            	}
            }); 
		},
		DisplayChildNode : function(response){
			this.parentDepartmentItemCollection = new DepartmentCollection();
			this.parentDepartmentItemCollection.reset(response);
				
			var self = this;
			this.parentDepartmentItemCollection.each(function(model){
				
				var parentNode = model.get("ParentDepartment");
				parentNode = parentNode.replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '-');
				var modelID = model.get("DepartmentCode").replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, '-'); 
				model.set({
					ParentID : parentNode,
					ModelID : modelID,
				});
				if($("#"+parentNode).hasClass('childNode')){
						$("#"+parentNode).html("");
						$("#"+parentNode).append("<label>"+model.get("ParentDepartment")+"</label><input type='checkbox' checked='checked' /><ol><li class='file childNode' id ="+modelID +"><a>"+model.get("DepartmentCode")+"</a></li><ol>");
						$("#"+parentNode).removeClass('childNode');
						$("#"+parentNode).addClass('childNodeParent');
				}else{
					if($("#"+parentNode).hasClass('childNodeParent')){
						$("#"+parentNode + " > ol").append("<li class='file childNode' id ="+modelID +"><a>"+model.get("DepartmentCode")+"</a></li>");
					}else{
						$("#"+parentNode + "> input").removeAttr("disabled");
						$("#"+parentNode + "> ol").append("<li class='file childNode' id ="+modelID +"><a>"+model.get("DepartmentCode")+"</a></li>");
					}
				}
			
			});
			
			
		}
	});
	return DepartmentSortOrderView;
})
