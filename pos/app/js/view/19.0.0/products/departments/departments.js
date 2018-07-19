
define([
	'backbone',
	'shared/global',	
	'shared/service',
	'shared/method',	
    'model/department',
    'collection/departments',
    'view/19.0.0/products/departments/details',
    'view/19.0.0/products/departments/detail/adddepartment',
    'view/19.0.0/products/controls/generic-list',
	'text!template/19.0.0/products/departments/departments.tpl.html',
    'text!template/19.0.0/products/controls/generic-layout.tpl.html'    
], function (Backbone, Global, Service, Method, 
             DepartmentModel, 
             DepartmentCollection,DepartmentDetailView,AddDepartmentView,
             GenericListView,
             DeparmentTemplate, GenericLayOutTemplate) {
  	
  	var _currentForm = "",_proceed = false;
  	
	var proceedToSearch = function (button) {
        if (button === 1) {
        	_currentForm.LoadSearchItem();
        }
     };
     var proceedToSelectedItem = function (button) {
        if (button === 1) {
        	 _currentForm.LoadSelectedItem();
        }
     };
    var ClassID = {
        SearchInput: "#txt-search",
        DepartmentsForm : "#departments-form"
    }

    var DepartmentsView = Backbone.View.extend({

        _departmentsFormTemplate: _.template(DeparmentTemplate),
        _genericLayoutTemplate: _.template(GenericLayOutTemplate),

        initialize: function () {
        },

        render: function () {
            this.$el.html(this._departmentsFormTemplate);
            this.$(ClassID.DepartmentsForm).html(this._genericLayoutTemplate);
            _currentForm  = this;
            return this;
        },

        btnSearch: function (e) {
            this.LoadItems($(ClassID.SearchInput).val());
        },

        Show: function () {
            this.LoadItems();
            this.render();
        },

        InitializeChildViews: function () {
        },


        InitializeDepartmentLookUp: function () {
            if (!this.departmentLookup) {
                this.departmentLookup = new DepartmentModel();
                this.departmentLookup.on('sync', this.DepartmentLookUpLoadSuccess, this);
                this.departmentLookup.on('error', this.DepartmentLookUpLoadError, this);
            }
        },

        DepartmentLookUpLoadSuccess: function (model, response, options) {
        	if(!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
         	 this.departments = new DepartmentCollection();
            this.departments.reset(response.Departments);
            this.DisplayItemList();
        },
        HasChanges: function () {
            if (Global.FormHasChanges) {
                this.UnloadConfirmationMessage = "Do you want to cancel Adding new Depertment?";
                return true;
            }
        },
		AddDepartment : function(){
			if(Global.FormHasChanges === false){
				if(!this.IsNullOrWhiteSpace(this.addnewDepartment)){
					this.addnewDepartment.unbind();
				}
				
				this.addnewDepartment = new AddDepartmentView({
	            	el : $("#right-panel"),
	           });
			
	           	this.addnewDepartment.InitializeChildViews();
	           	this.addnewDepartment.BindToForm(this);
	           	Global.FormHasChanges = true;
           }
		},
        DepartmentLookUpLoadError: function (model, error, options) {
            if(!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
        },

        LoadItems: function (departmentCode,newModel) {
        	if(!this.IsNullOrWhiteSpace(newModel)){this.isNewLyAdded = true; this.newModel = newModel;}
            this.InitializeDepartmentLookUp();
			var _rowsToSelect = 1000;
            this.departmentLookup.set({
	    		StringValue : departmentCode
	    	});
	    	var _self  = this;
			this.departmentLookup.url = Global.ServiceUrl + Service.PRODUCT + Method.GETDEPARTMENTDETAILS + _rowsToSelect;
            this.departmentLookup.save(); 
           
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
		GetFirstItem : function(response){
			var _model = new  DepartmentModel();
			if(!this.IsNullOrWhiteSpace(this.isNewLyAdded) || this.isNewLyAdded == true){_model.set(this.newModel);}
				else{ _model = this.genericListView.GetFirstModel();}
			if(!this.IsNullOrWhiteSpace(this.departmentDetailView)){
				this.departmentDetailView.unbind();
			}
				this.departmentDetailView = new DepartmentDetailView({
		            		el : $("#right-panel"),
		            		model : this.genericListView.GetFirstModel(),
                            IsReadOnly : this.options.IsReadOnly
		            	});
                    this.departmentDetailView.toBeSearched = this.genericListView.GetItemToSearch();
		           this.departmentDetailView.BindToForm(this);
		           this.departmentDetailView.InitializeChildViews();
				this.isNew=false;	
			if(!this.IsNullOrWhiteSpace(this.isNewLyAdded) || this.isNewLyAdded == true){this.SelectNewlyAddedItem()}
		},
		 SelectNewlyAddedItem : function(){
        	var _model = new DepartmentModel();
        	_model.set(this.newModel);
        	this.genericListView.SelectByAttribute("DepartmentCode",_model.get("DepartmentCode"));
        	this.LoadSelectedItem(this.newModel);
        	this.newModel = null;
        	this.isNewLyAdded = false;
        },
        DisplayItemList: function () {
            if (!this.genericListView) {
                this.genericListView = new GenericListView({ el: "#left-panel", DisableAdd : this.options.IsReadOnly });
                this.genericListView.on("search", this.SearchItem, this);
                 this.genericListView.on("selected", this.SelectedItem, this);
                 this.genericListView.on("add",this.AddDepartment, this);
                this.genericListView.on('loaded',this.GetFirstItem,this);
                this.genericListView.collection = this.departments;
                this.genericListView.SetPlaceHolder("Search Department");
                this.genericListView.SetDisplayField("DepartmentCode");
                this.genericListView.Show();
            } else {
                this.genericListView.RefreshList(this.departments);
            }
        },

        SearchItem: function () {
            if (this.genericListView){
            	if(Global.FormHasChanges == true){
       			 navigator.notification.confirm("Do you want to cancel changes?", proceedToSearch, "Confirmation", ['Yes','No']);
       			}else{
       				this.LoadSearchItem();
       			}
            }
            	 
        },
        LoadSearchItem : function(){
        	this.LoadItems(this.genericListView.GetItemToSearch());
        	 Global.FormHasChanges = false;
        },
        LoadSelectedItem : function(model){
        	if(!model){
        			this.departmentModel = this.genericListView.GetSelectedModel();
        	}else{
        		var newModel = new DepartmentModel();
        		newModel.set(model);
        		this.departmentModel = newModel;
        	}
        
        	if(!this.IsNullOrWhiteSpace(this.departmentDetailView)){
        		this.departmentDetailView.unbind();
        	}
        			this.departmentDetailView = new DepartmentDetailView({
	            		el : $("#right-panel"),
	            		model : this.departmentModel,
                        IsReadOnly : this.options.IsReadOnly
	            	});   	
	         this.departmentDetailView.BindToForm(this);
	         this.departmentDetailView.InitializeChildViews();
	         Global.FormHasChanges = false;
        },
 		SelectedItem: function () {
            if (this.genericListView){
	            if(Global.FormHasChanges == true){
	       			 navigator.notification.confirm("Do you want to cancel changes?", proceedToSelectedItem, "Confirmation", ['Yes','No']);
	       		}else{
	       			this.LoadSelectedItem();
	       		}	
            }
        }


    });

    return DepartmentsView;
});



