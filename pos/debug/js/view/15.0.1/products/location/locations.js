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
	'collection/countries',
    'view/15.0.1/products/controls/generic-list',
    'view/15.0.1/products/location/locationDetail',
	'text!template/15.0.1/products/location/locationform.tpl.html',
	'text!template/15.0.1/products/controls/generic-layout.tpl.html'
], function($, $$, _, Backbone,
	Global, Method, Service, Shared,
	BaseModel, LookupCriteriaModel, 
	BaseCollection, CountryCollection, 
	GenericListView, LocationDetailView,
	locationTemplate, GenericLayoutTemplate) {
	
	var ClassID = {
        SearchInput: "#txt-search",
        LocationForm: "#location-form"
    }
	
	var LocationsView = Backbone.View.extend({
		
		_locationTemplate : _.template(locationTemplate),
		_genericLayoutTemplate : _.template(GenericLayoutTemplate),
		
		initialize : function() {
			this.UnloadConfirmationMessage = null;
			this.IsNew = false;
			currentInstance = this;
		},
		
		render : function() {
			this.$el.html( this._locationTemplate );
			this.$(ClassID.LocationForm).html( this._genericLayoutTemplate );
		},
		
		Show : function() {
			this.LoadCountry();
		},
		
		HasChanges: function () {
            if (this.IsNew) {
                this.UnloadConfirmationMessage = "Do you want to cancel this new record?";
                return true;
            }
        },
		
		InitializeLocationLookup : function() {
			if(!this.locationLookup){
				this.locationLookup = new LookupCriteriaModel();
				this.locationLookup.on('sync', this.LookupSuccess, this);
				this.locationLookup.on('error', this.LookupError, this);
			}
		},
		
		LookupSuccess : function(model, response, options) {	
			if(!this.locationActive) this.locationActive = new BaseCollection();
			if(!this.locationList) this.locationList = new BaseCollection();
					
			var _location = _.reject( response.Warehouses, function(location){
				return location.IsActive == false;
			});
					
			this.locationActive.reset(_location);
			this.locationList.reset(response.Warehouses);
			this.DisplayLocation();	
			Shared.Products.Overlay.Hide();	
		},
		
		LookupError : function(model, error, response) {
			Shared.Products.RequestTimeOut();
		},
		
		LoadLocation : function(locationCode) {
			this.recentModel = null;
			this.InitializeLocationLookup();
			
			this.locationLookup.set({
				StringValue : locationCode
			});

			this.locationLookup.url = Global.ServiceUrl + Service.PRODUCT + Method.GETLOCATIONLOOKUP + "100";
			this.locationLookup.save()
			Shared.Products.Overlay.Show();
		},
		
		DisplayLocation : function() {
			if (!this.genericListView) {
			    this.genericListView = new GenericListView({ el: "#left-panel", DisableAdd: this.options.IsReadOnly });
                this.genericListView.on("search", this.SearchItem, this);	
                this.genericListView.on("selected", this.SelectedItem, this);
                this.genericListView.on("add", this.AddMode, this);
                this.genericListView.collection = this.locationActive;
                this.genericListView.SetPlaceHolder("Search Location");
                this.genericListView.SetDisplayField("WarehouseCode");
                this.genericListView.Show();
            } else {
                this.genericListView.RefreshList(this.locationActive);
            }
            
			if(!this.recentModel){
				this.SelectedItem();
			}else{
				this.SetSelectedAfterSave(this.recentModel);
			}
		},
		
		SetSelectedAfterSave : function(model) {
        	if (this.genericListView) this.genericListView.TriggerItemSelect(model);
        	Shared.Products.Overlay.Hide();
        },
		
		AddMode : function() {
			if (this.locationDetailView) {
				if (this.genericListView) this.genericListView.ClearSearchBox();
                this.locationDetailView.ForceAdd();
                this.IsNew = true;
            }
		},
		
		SelectedItem: function () {
            if (this.genericListView) {
                if (!this.locationDetailView) this.InitializeLocationDetailView();
                if (this.genericListView.GetSelectedModel()) {
                    this.locationDetailView.model = new BaseModel();
                    this.locationDetailView.model.set(this.genericListView.GetSelectedModel().attributes);
                } else {
                    if (this.locationActive) if (this.locationActive.models.length > 0) {
                        this.locationDetailView.model = new BaseModel();
                        this.locationDetailView.model.set(this.locationActive.at(0));
                    }
                    else this.locationDetailView.model = null;
                }
                this.locationDetailView.IsNew = this.IsNew;
                this.locationDetailView.toBeSearched = this.genericListView.GetItemToSearch();
                this.locationDetailView.Show();
            }
        },
		
        SearchItem: function () {
            if (this.genericListView) this.LoadLocation(this.genericListView.GetItemToSearch());
        },
        
        InitializeLocationDetailView : function() {
        	this.locationDetailView = new LocationDetailView({ 
        		el: "#right-panel", 
        		collection: this.locationList,
        		countries : this.countryCollection,
                IsReadOnly : this.options.IsReadOnly
        	});
        	
        	this.locationDetailView.on('cancel', this.CancelNew, this);
            this.locationDetailView.on("saved", this.Saved, this);
            this.locationDetailView.on("delete", this.Deleted, this);
            this.locationDetailView.on("updated", this.Saved, this);
            this.locationDetailView.on("failed", this.LoadPreviousModel, this);
        },
        
        LoadCountry : function() {
        	if(!this.countryCollection){
        		this.countryCollection = new CountryCollection();	
        	}
        	
        	var self = this;
        	var countryLookup = new LookupCriteriaModel();
        	
        	countryLookup.url = Global.ServiceUrl + Service.CUSTOMER + Method.COUNTRYCODELOOKUP + 300;
        	countryLookup.save(null, {
        		success : function(model, response, options) {
        			if(response) self.countryCollection.reset(response.Countries);                           			
        			self.LoadLocation();
					self.render();
        		},
        		error : function() {
        			Shared.Products.RequestTimeOut();
        		}
        	})
        	
        },

        CancelNew: function () {
            this.ConfirmCancelChanges("DoCancelNew");    
        },

         DoCancelNew: function () {
             this.recentModel = this.locationActive.at(0);
             this.IsNew = false;
             this.LoadLocation();
             
         },
        
        Saved : function(model) {
        	this.LoadLocation();
        	this.recentModel = model;
        	this.IsNew = false;
            this.locationDetailView.ResetTemplates();
        },
        
        Deleted : function(model) {
        	if(model){
	        	var _toBeRemoved = this.locationActive.find( function(location) {
					return location.get("WarehouseCode").toUpperCase() === model.get("WarehouseCode").toUpperCase();
				});
					
				if(_toBeRemoved) this.locationActive.remove(_toBeRemoved);	
        	}
	        
	        this.recentModel = this.locationActive.at(0);	
        	this.LoadLocation();
        	this.IsNew = false;
        },

        LoadPreviousModel : function(model) {
        	this.LoadLocation();
        	this.recentModel = model;
        	this.IsNew = false;
        },

         ConfirmCancelChanges: function (onYes, onNo) {
             this.DoOnCancel = onNo;
             this.DoOnConfirm = onYes;
             if (this.HasChanges()) {
                 navigator.notification.confirm(this.UnloadConfirmationMessage, cancelChanges, "Confirmation", ['Yes','No']);
             } else {
                 this.ConfirmExecute();
             }
         },

         ConfirmExecute: function () {
             if (!this.DoOnConfirm) return;
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

	return LocationsView;
})
