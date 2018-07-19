/**
 * @author alexis.banaag
 */
define([
	'jquery',
	'mobile',
	'underscore',
	'backbone',
	'shared/global',
	'shared/method',
	'shared/service',
	'shared/shared',
	'model/base',
	'model/lookupcriteria',
	'collection/base',
    'view/15.0.1/products/controls/generic-list',
    'view/15.0.1/products/unitmeasure/unitmeasuredetail',
	'text!template/15.0.1/products/unitmeasure/uomform.tpl.html',
	'text!template/15.0.1/products/controls/generic-layout.tpl.html'
], function($, $$, _, Backbone, 
	Global, Method, Service, Shared, 
	BaseModel, LookupCriteriaModel,
	BaseCollection,
	GenericListView, UnitMeasureDetailView,
	UOMFormTemplate, GenericLayoutTemplate){
	
	var ClassID = {
        SearchInput: "#txt-search",
        UOMForm: "#uom-form"
    }
	
	var UnitMeasureView = Backbone.View.extend({
		
		_uomFormTemplate       : _.template(UOMFormTemplate),
		_genericLayoutTemplate : _.template(GenericLayoutTemplate),
		
		initialize : function() {
			this.UnloadConfirmationMessage = null;
			this.IsNew = false;
			currentInstance = this;
		},
		
		render : function() {
			this.$el.html( this._uomFormTemplate );
			this.$(ClassID.UOMForm).html(this._genericLayoutTemplate);
			console.log("IsAllowFractional : " + Global.InventoryPreference.IsAllowFractional);
		},
		
		Show : function() {
			this.LoadUOM();
			this.render();
		},
		
		InitializeUnitMeasureLookup : function() {
			if(!this.unitMeasureLookup){
				this.unitMeasureLookup = new LookupCriteriaModel();
				this.unitMeasureLookup.on('sync', this.LookupSuccess, this);
				this.unitMeasureLookup.on('error', this.LookupError, this);
			}
		},
		
		LookupSuccess : function(model, response, options) {
			if(!this.uomActive) this.uomActive = new BaseCollection();
			if(!this.uomList) this.uomList = new BaseCollection();
				
			var _uom = _.reject( response.SystemUnitMeasure, function(systemUnitMeasure){
				return systemUnitMeasure.IsActive == false;
			});
				
			this.uomActive.reset(_uom);
			this.uomList.reset(response.SystemUnitMeasure);
			this.DisplayUOM();
			Shared.Products.Overlay.Hide();		
		},
		
		LookupError : function(model, error, response) {
			console.log("ERR "+error);
			Shared.Products.Overlay.Hide();
		},
		
		HasChanges: function () {
            if (this.IsNew) {
                this.UnloadConfirmationMessage = "Do you want to cancel this new record?";
                return true;
            }
        },
		
		LoadUOM : function(unitMeasureCode) {
			this.recentModel = null;
			this.InitializeUnitMeasureLookup();
			
			this.unitMeasureLookup.set({
				StringValue : unitMeasureCode
			});

			this.unitMeasureLookup.url = Global.ServiceUrl + Service.PRODUCT + Method.UNITOFMEASURELOOKUP + "100";
			this.unitMeasureLookup.save()
			Shared.Products.Overlay.Show();
		},
		
		DisplayUOM : function() {
			if (!this.genericListView) {
			    this.genericListView = new GenericListView({ el: "#left-panel", DisableAdd: this.options.IsReadOnly });
                this.genericListView.on("search", this.SearchItem, this);	
                this.genericListView.on("selected", this.SelectedItem, this);
                this.genericListView.on("add", this.AddMode, this);
                this.genericListView.collection = this.uomActive;
                this.genericListView.SetPlaceHolder("Search Unit of Measure");
                this.genericListView.SetDisplayField("UnitMeasureCode");
                this.genericListView.Show();
            } else {
                this.genericListView.RefreshList(this.uomActive);
            }
            
            if(!this.recentModel){
				this.SelectedItem();
			}else{
				this.SetSelectedAfterSave(this.recentModel);
			}
            
		},
		
		SelectedItem: function () {
            if (this.genericListView) {
                if (!this.uomDetailView) this.InitializeUOMDetailView();
                if (this.genericListView.GetSelectedModel() || this.genericListView.GetFirstModel()) {
                    this.uomDetailView.model = new BaseModel();
                    var tmpModel = this.genericListView.GetSelectedModel() || this.genericListView.GetFirstModel();
                    this.uomDetailView.model.set(tmpModel.attributes);
                } else {
                    if (this.uomActive) if (this.uomActive.models.length > 0) {
                        this.uomDetailView.model = new BaseModel();
                        this.uomDetailView.model.set(this.uomActive.at(0));
                    }
                    else this.uomDetailView.model = null;
                }
                this.uomDetailView.toBeSearched = this.genericListView.GetItemToSearch();
                this.uomDetailView.Show();
            }
        },
        
        SearchItem: function () {
            if (this.genericListView) this.LoadUOM(this.genericListView.GetItemToSearch());
        },
        
        SetSelectedAfterSave : function(model) {
        	if (this.genericListView) this.genericListView.TriggerItemSelect(model);
        	Shared.Products.Overlay.Hide();
        },
        
        InitializeUOMDetailView : function() {
            this.uomDetailView = new UnitMeasureDetailView({ el: "#right-panel", collection: this.uomList, IsReadOnly: this.options.IsReadOnly });
        	this.uomDetailView.on('cancel', this.CancelNew, this);
            this.uomDetailView.on("saved", this.Saved, this);
            this.uomDetailView.on("updated", this.Saved, this);
            this.uomDetailView.on("delete", this.Deleted, this);
        },
        
        AddMode: function () {
            if (this.uomDetailView) {
            	if (this.genericListView) this.genericListView.ClearSearchBox();
                this.uomDetailView.ForceAdd();
                this.IsNew = true;
            }
        },
        
        CancelNew: function () {
            this.ConfirmCancelChanges("DoCancelNew");     
        },

        DoCancelNew: function () {
            this.uomDetailView.DoCancel();
            this.recentModel = this.uomActive.at(0);
        	this.LoadUOM();
        	this.IsNew = false;
        },
        
        Saved : function(model) {
        	this.LoadUOM();
        	this.recentModel = model;
        	this.IsNew = false;
        },
        
        Deleted : function(model) {
        	var _toBeRemoved = this.uomActive.find(function(uom){
        		return uom.get("UnitMeasureCode").toUpperCase() === model.get("UnitMeasureCode");
        	});
        	
        	if(_toBeRemoved) this.uomActive.remove(_toBeRemoved);
        	this.recentModel = this.uomActive.at(0);
        	this.LoadUOM();
        	this.IsNew = false;
        },

        ConfirmCancelChanges: function(onYes, onNo){            
            this.DoOnCancel = onNo;
            this.DoOnConfirm = onYes;
            if(this.HasChanges()){
                navigator.notification.confirm(this.UnloadConfirmationMessage, cancelChanges, "Confirmation", ['Yes','No']);                            
            } else {
                this.ConfirmExecute();
            }
        },

        ConfirmExecute : function(){
            if(!this.DoOnConfirm) return;
            this[this.DoOnConfirm]();
        },

        CancelExecute: function () {
            if (!this.DoOnCancel) return;
            this[this.DoOnCancel]();
        }

	});

     var currentInstance;
     var cancelChanges = function (button) {
         if (button == 1) {
             currentInstance.ConfirmExecute();
         } else {
             currentInstance.CancelExecute();
         }
     }
	
	return UnitMeasureView;
});
