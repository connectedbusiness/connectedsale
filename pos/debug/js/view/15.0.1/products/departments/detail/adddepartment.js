
define([
	'jquery',
	'mobile',
	'underscore',
	'backbone',
	'shared/global',
	'shared/service',
	'shared/method',	
	'shared/shared',
	'model/department',
    'collection/departments',
	'text!template/15.0.1/products/departments/detail/adddepartment.tpl.html'
], function($, $$, _, Backbone, Global, Service, Method, Shared, DepartmentModel, DepartmentCollection, template){

	var AddCategoryView = Backbone.View.extend({
		_template : _.template( template ),

		events : {
			"tap .saveBtn " : "saveBtn_Tap",
			"tap .cancelBtn " : "cancelBtn_Tap",
			"change #departmentCode" : "departmentCode_Change"
		},
		
		initialize : function(){
		    currentInstance = this;
			this.render();
		},
		
		render : function() {
			this.$el.html( this._template);
			
		},

		InitializeChildViews : function(){
			this.InitializeParentDepartments();
			$("departmentStatus-div").trigger('create');
		},

		BindToForm  : function(mainView){
			this.mainView = mainView;
		},

		InitializeParentDepartments : function(){
			this.productLookUp = new DepartmentModel();
			var _rowsToSelect =  100;
			var _self = this;
			this.productLookUp.url = Global.ServiceUrl + Service.PRODUCT + Method.GETDEPARTMENTDETAILS + _rowsToSelect;
            this.productLookUp.save(null,{
            	success : function(collection,response){
            		if(!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
            		_self.LoadParentDepartments(response.Departments);
            	}
            }); 
		},

		LoadParentDepartments : function(response){
		    $('#cmbParentDepartment > option[val !=""]').remove();
			this.departmentCollection = new DepartmentCollection();
			this.departmentCollection.reset(response);
			this.departmentCollection.sortVar = "DepartmentCode";

			this.departmentCollection.comparator = function (_collection) {
			    return _collection.get("DepartmentCode");
			};
			this.departmentCollection.add({ DepartmentCode: 'DEFAULT' })
			this.departmentCollection.sort({ silent: true });

			if(this.departmentCollection.length >  0){
					this.departmentCollection.each(function(model){
						var parentDepartment = model.get("DepartmentCode");
						$("#cmbParentDepartment").append( new Option(parentDepartment,parentDepartment) );
					});
					
					var found = [];
					$("select option").each(function() {
					  if($.inArray(this.value, found) != -1) $(this).remove();
					  found.push(this.value);
					});
			}
			$("#cmbParentDepartment").val("DEFAULT");
		},

		saveBtn_Tap : function(e){
			e.preventDefault();
			e.stopImmediatePropagation();
			this.ValidateFields();
		},

		cancelBtn_Tap : function(e){
			e.preventDefault();
			e.stopImmediatePropagation();
			navigator.notification.confirm("Do you want to cancel Adding new Department?", confirmCancelNew, "Confirmation", ['Yes','No']);
		},

        DoCancelNew: function () {
            Global.FormHasChanges = false;
            this.mainView.LoadItems();
        },

		ValidateFields : function(){
			this.departmentCode = $("#departmentCode").val();
			this.parentDepartment = $("#cmbParentDepartment").val();
			this.description = $("#description").val();

			//this.isActive = $('#departmentStatus').is(':checked')
			
			if(this.IsNullOrWhiteSpace($.trim(this.departmentCode))){
				Shared.Products.ShowNotification("Department Code is Required.",true);
			   return;
			}
			if(this.IsNullOrWhiteSpace(this.parentDepartment)){
				Shared.Products.ShowNotification("Parent Department is Required.",true);
				return;
			}
			if(this.IsNullOrWhiteSpace($.trim(this.description))){
				Shared.Products.ShowNotification("Description is Required.",true);
				return;
			}

				Shared.Products.Overlay.Show();	
				this.CreateDepartment();
			
		},

		IsNullOrWhiteSpace : function(str){
			if(!str){
				return true;
			}
			if(str === "" || str === null || str === undefined){
				return true;
			}
			return false;
		},

		CreateDepartment : function(){
			this.departmentModel  = new DepartmentModel();
			
			this.departmentModel.set({
				DepartmentCode : this.departmentCode,
				ParentDepartment : this.parentDepartment,
				IsActive : true,
				Description : this.description
			});
			var _self  = this;
			this.departmentModel.url = Global.ServiceUrl + Service.PRODUCT + Method.CREATESELLINGDEPARTMENT;
			this.departmentModel.save(null,{
			
				success : function(model,response){
					if(!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
					_self.DepartmentSavedCompleted(response);
				},
				error : function(model,error,response){
					if(!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
					model.RequestError(error, "Error");
				}
			 	
			});
		},

		DepartmentSavedCompleted : function(response){
			if(response.ErrorMessage){
				navigator.notification.alert(response.ErrorMessage, null, "Failed to Add Department", "OK");
				Shared.Products.Overlay.Hide();	
			}else{
				Shared.Products.ShowNotification("Department Succesfully Saved.");
				Shared.Products.Overlay.Hide();	
				Global.FormHasChanges = false;
	
				this.mainView.LoadItems("",response);
			}
		},

		departmentCode_Change : function(e) {
			e.preventDefault();
			this.AssignDescriptionFromDepartmentCode();
		},

		AssignDescriptionFromDepartmentCode : function() {
        	var code = $("#departmentCode").val();
			var desc = $("#description").val();
			
			if (code == null || code == "") return;
			if (desc != null && desc != "") return;

			this.AssignDescription(code);
        },

        AssignDescription : function(desc) {
			$("#description").val(desc);
        }

	});

    var currentInstance;
    var confirmCancelNew = function (button) {
        if (button == 1) {
            currentInstance.DoCancelNew();
        }
    }

	return AddCategoryView;
})
