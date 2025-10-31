
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
	'text!template/25.1.0/products/departments/detail/general.tpl.html'
], function($, $$, _, Backbone, Global, Service, Method, Shared, DepartmentModel, DepartmentCollection, template){
	
	var _proceed = false,_departmentForm;
     var deleteDepartment = function (button) {
        if (button === 1) {
        	 _departmentForm.ValidateRemoveDepartment();
        }else{
        	_departmentForm.CancelAction();
        }
     };
	var DepartmentGeneralView = Backbone.View.extend({
		_template : _.template( template ),

		events : {
			"tap #departmentSaveBtn" : "SaveDepartment",
			"tap #departmentRemoveBtn" : "RemoveDepartment",
		},
		
		initialize : function(){
			this.render();
		},
		
		render : function() {
			this.$el.html( this._template);
			this.InitializeGeneralView();
			_departmentForm = this;
			Global.FormHasChanges = false;
			Global.IsSaveChanges = false;
			$("departmentStatus-div").trigger('create'); 
            this.CheckReadOnlyMode();
		},
		
        CheckReadOnlyMode: function () {
            if (this.options.IsReadOnly) {
                $("#departmentSaveBtn").addClass('ui-disabled');
                $("#departmentRemoveBtn").addClass('ui-disabled');
                
                $("#description").addClass('ui-readonly');
				$("#departmentCode").addClass('ui-readonly');
				$("#cmbParentDepartment").addClass('ui-readonly');
            }
        },

		BindToForm  : function(mainView){
			this.mainView = mainView;
		},
		InitializeGeneralView  : function(){
			
			this.departmentLookUp = new DepartmentModel();
			var _rowsToSelect =  100;
			var _self = this;
			 this.departmentLookUp.set({
	    		StringValue : this.model.get("DepartmentCode")
	    	});
			this.departmentLookUp.url = Global.ServiceUrl + Service.PRODUCT + Method.GETDEPARTMENTDETAILS + _rowsToSelect;
            this.departmentLookUp.save(null,{
            	success : function(collection,response){
            		if(!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
            		_self.DisplayDepartmentDetails(response.Departments);
            	}
            }); 
			
			
		},
		CancelAction : function() {
			Global.IsSaveChanges = false;
		},
		DisplayDepartmentDetails : function(response){
			var self = this;
			var _departmentCollection  = new DepartmentCollection();
			_departmentCollection.reset(response);
			if(_departmentCollection.length > 0){
			_departmentCollection.each(function(model){
				if(model.get("DepartmentCode") == self.model.get("DepartmentCode")){
					$("#description").val(model.get("Description"));
					$("#departmentCode").val(model.get("DepartmentCode"));
					self.parentDepartment  = model.get("ParentDepartment");
				}
			
			});
				
				/*if(_departmentCollection.at(0).get("IsActive") === true){
					$("#departmentStatus").attr('checked', 'checked');
				}*/
			}
			this.InitializeParentDepartments();
		},
	
		InitializeParentDepartments : function(){
			this.departmentLookUp = new DepartmentModel();
			var _rowsToSelect =  100;
			var _self = this;
			this.departmentLookUp.url = Global.ServiceUrl + Service.PRODUCT + Method.GETDEPARTMENTDETAILS + _rowsToSelect;
            this.departmentLookUp.save(null,{
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
			 var self = this;
			 this.SortVar = "DepartmentCode";
			 this.departmentCollection.SortVar = "DepartmentCode";
			 this.departmentCollection.comparator = function (collection) {
                return (collection.get(self.SortVar));
			 };
			 this.departmentCollection.add({ DepartmentCode: 'DEFAULT' })
			 this.departmentCollection.sort({ silent: true });
            
			if(this.departmentCollection.length > 0 ){
				this.departmentCollection.sort("DepartmentCode").each(function(model){
					var parentDepartment = model.get("DepartmentCode");
					$("#cmbParentDepartment").append( new Option(parentDepartment,parentDepartment) );
				});
				
				var found = [];
				$("select option").each(function() {
				  if($.inArray(this.value, found) != -1) $(this).remove();
				  found.push(this.value);
				});
			}
			
			$("#cmbParentDepartment").val(this.parentDepartment);
		},
		SaveDepartment : function (e){
			e.preventDefault();
			e.stopImmediatePropagation();
			this.ValidateFields();
		},
		RemoveDepartment : function(e){
			e.preventDefault();
			e.stopImmediatePropagation();
			this.ConfirmationMessage();
			
		},
		ConfirmationMessage : function(type){

			if(!Global.IsSaveChanges || Global.IsSaveChanges  == false){
				Global.IsSaveChanges =true
				navigator.notification.confirm("Are you sure want to remove this Department?", deleteDepartment, "Confirmation", ['Yes','No']);
			}
			
		},
		ValidateRemoveDepartment : function(){
			this.departmentLookUp = new DepartmentModel();
			var _rowsToSelect =  100;
			var _self = this;
			this.departmentLookUp.url = Global.ServiceUrl + Service.PRODUCT + Method.GETDEPARTMENTDETAILS + _rowsToSelect;
            this.departmentLookUp.save(null,{
            	success : function(collection,response){
            		if(!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
            		_self.CheckIfParent(response.Departments);

            	}
            }); 
		},
		CheckIfParent : function(response){
			var isParent = false;
			var self = this;
			this.departmentCode = $("#departmentCode").val();
			this.parentDepartmentCollection = new DepartmentCollection();
			this.parentDepartmentCollection.reset(response);
			this.parentDepartmentCollection.each(function(model){
				if(model.get('ParentDepartment') == self.departmentCode){
					if(self.departmentCode = model.get("DepartmentCode")){
						isParent = false;
					}else{
						isParent = true;
					}
					
				}
			});
			if(isParent === true){
				var message = "This department cannot be deleted because there are item(s) associated with this record. Please remove this association then retry.";
				navigator.notification.alert(message, null, "Failed to Remove Department", "Ok");
				if(!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
			}else{
				this.RemoveDepartmentAccepted();
			}
		},
		RemoveDepartmentAccepted : function(){
			this.departmentModel  = new DepartmentModel();
			this.departmentCode = $("#departmentCode").val();
			this.parentDepartment= $("#cmbParentDepartment").val();
			this.departmentModel.set({
				DepartmentCode : this.departmentCode,
				ParentDepartment : this.parentDepartment,
				IsActive : true,
				Description : this.description
				
			});
			var _self  = this;
			this.departmentModel.url = Global.ServiceUrl + Service.PRODUCT + Method.DELETESELLINGDEPARTMENT;
			this.departmentModel.save(null,{
			
				success : function(model,response){
					_self.RemoveDepartmentCompleted(response);
				},
				error : function(model,error,response){
					_self.RemoveDepartmentCompleted(error);
				}
			 	
			});
		},
		RemoveDepartmentCompleted : function(response){
			Global.IsSaveChanges = false;
			if(!response){
				Shared.Products.ShowNotification("Department successfully deleted.");	
				this.mainView.LoadItems();
			}else{
				var error = response.ErrorMessage;
				//Shared.Products.ShowNotification(error,true);
				navigator.notification.alert(error, null, "Unable to Remove Department", "OK");
				if(!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
			}
		},
		ValidateFields : function(){
			this.departmentCode = $("#departmentCode").val();
			this.parentDepartment= $("#cmbParentDepartment").val();
			this.description = $("#description").val();

			//this.isActive = $('#departmentStatus').is(':checked')
			
			if(this.categoryCode === ""){
				Shared.Products.ShowNotification("Department Code is Required.",true);	
			   return;
			}
			if(this.parentCategory === ""){
				Shared.Products.ShowNotification("Parent Department is Required.",true);	
				return;
			}
			this.UpdateDepartment();
			
		},
		UpdateDepartment : function(){
			this.departmentModel  = new DepartmentModel();			
			this.departmentModel.set({
				DepartmentCode : this.departmentCode,
				ParentDepartment : this.parentDepartment,
				IsActive : true,
				Description : this.description
				
			});
			var _self  = this;
			this.departmentModel.url = Global.ServiceUrl + Service.PRODUCT + Method.UPDATESELLINGDEPARTMENT;
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
			
			if(response.ErrorMessage == null){
				Shared.Products.ShowNotification("Department Succesfuly Saved.");
				Global.IsSaveChanges = false;
				
			}else{
				navigator.notification.alert(response.ErrorMessage, null, "Saving Faiiled", "OK");
				Global.IsSaveChanges = false;
			}
		},
		
	});
	return DepartmentGeneralView;
})
