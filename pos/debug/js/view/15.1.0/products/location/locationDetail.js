/**
 * @author alexis.banaag
 */
define([
	'jquery',
	'mobile',
	'underscore',
	'backbone',
	'shared/shared',
	'shared/global',
	'shared/service',
	'shared/method',
	'model/base',
	'model/postal',
	'collection/postal',
	'text!template/15.1.0/products/location/locationdetail.tpl.html',
	'text!template/15.1.0/products/location/locationdetail/locationinfo.tpl.html',
	'view/15.1.0/pos/postal/addpostal',
], function($, $$, _, Backbone,
	Shared, Global, Service, Method,
	BaseModel, PostalModel, 
	PostalCollection,
	LocationDetailTemplate, LocationInfoTemplate,AddPostalView) {
	
	var ClassID = {
		Body   : '.locationdetail-body div',
		Footer : '.locationdetail-footer'
	}

	 var confirmAddPostal = function (button) {
        if (button == 1) {
            currentInstance.AddNewPostal(); 
        }else{
        	currentInstance.ClearPostalDetails();
        }
    }
	var currentInstance;
	var doProcessDelete = function (button) {
        if (button === 1) {
            currentInstance.CheckIfAllowedToDelete();
        }
    };
	
	var LocationDetailView = Backbone.View.extend({
		_locationDetailTemplate : _.template( LocationDetailTemplate ),
		_locationInfoTemplate   : _.template( LocationInfoTemplate ),

		events : {
			"tap #btn-finish": "btnClick_Finish",
			"tap #btn-cancel": "btnClick_Cancel",
			"tap #btn-Save"  : "btnClick_Update",
			"tap #btn-Delete": "btnClick_Delete",			
			"keyup #data-locationPostal"    : "keyupPostal",
            "change #data-locationPostal"     : "CheckLoadPostal",
            //"change #data-locationPostal"    : "changePostal",
            "change #data-locationCode" 	: "locationCode_Change",            
            "focus #data-locationTelephone" : "AssignNumericValidation",
            "keyup #data-locationTelephone"	: "keyupTel",
            "blur #data-locationTelephone": "RevertPreviousValue",
            "change #data-locationCountry" : "CountryChanged"
		},
		
		CheckLoadPostal: function (e) {
		    console.log("ChangePOstal");
        	if(!this.proceedToEvent) { this.proceedToEvent = true; return; }
			var postal = $("#data-locationPostal").val();								
			if(postal != "") this.LoadPostal(postal);
			else this.ClearCityAndState();        
        },

        keyupPostal: function (e) {
            console.log("KeyupPOStal");
            if (e.keyCode === 13) {
             //   if (!this.proceedToEvent) { this.proceedToEvent = true; return; }
				var postal = $("#data-locationPostal").val();								
				if(postal != "") this.LoadPostal(postal);
				this.proceedToEvent = false;				
			}
		},
		
		changePostal : function(e) {
			e.preventDefault();
			var postal = $("#data-locationPostal").val();
								
			if(postal != "") this.LoadPostal(postal);
			else this.ClearCityAndState();
		},
		
		btnClick_Cancel : function (e) { 
			e.preventDefault(); 
			this.trigger('cancel', this); 
		},

        DoCancel : function(){
			this.ClearFields();
			$("#location-title").text("Location Details");
			$("#paddingRight div").css("visibility", "visible");
			
			this.$(ClassID.Footer).hide();
			this.IsNew = false;          
        },

		btnClick_Finish : function (e) { 	
			e.preventDefault(); 
			if(this.ValidateBeforeProcess()){
				if(this.ValidateNewRecord()){
					this.SaveNewLocation();	
				}else $("#data-locationCode").removeAttr("readonly");	
			}
		},
		
		btnClick_Update : function (e) {
			e.preventDefault(); 

			if(this.ValidateBeforeProcess()){	
				this.UpdateLocation();	
			}
		},
		
		btnClick_Delete : function (e) {
			e.preventDefault(); 
			//this.DeleteLocation();	
			navigator.notification.confirm("Are you sure you want to delete this location?", doProcessDelete, "Confirmation", ['Yes','No']);
		},
		
		CheckIfAllowedToDelete : function () {
			Shared.Products.Overlay.Show();		
			var self = this;
			var warehouseCode = this.model.get("WarehouseCode");
			var tmp = new BaseModel();		
			
			tmp.on('sync', this.FetchComplete, this)
			tmp.on('error', this.FetchFailed, this)
			
			tmp.url = Global.ServiceUrl + Service.POS + Method.CHECKIFDEFAULTLOCATION;
			tmp.set({ StringValue : warehouseCode })
			tmp.save();				
		},
		
		FetchComplete : function(model, response, options) {	
			Shared.Products.Overlay.Hide();		
			if (!response) this.DeleteLocation();
			else { 							
				var msg = "This location cannot be deleted because it is being used as default location.";
				Shared.Products.ShowNotification(msg,true);
			}			
			
		},
		
		FetchFailed : function(model, error, response) {			
			Shared.Products.RequestTimeOut();	
		},

		DisplayNoRecordFound : function() {
            Shared.Products.DisplayNoRecordFound("#right-panel", ".list-wrapper", this.toBeSearched);
        },

		initialize : function() {
			currentInstance = this;
			this._country = this.options.countries;
			this.isPostalValid = true;
			this.IsNew = false;
		},
		
		InitializePostal : function(){
			if(!this.postalmodel) this.postalmodel = new PostalModel();			
			if(!this.postalCollection) this.postalCollection = new PostalCollection();
		},
		
		
		render : function() {
			if(this.model){
				this.$el.html( this._locationDetailTemplate );
				this.$(ClassID.Footer).hide();
			}else{
				this.$el.html("");
				this.DisplayNoRecordFound();
			}

            this.CheckReadOnlyMode();
		},
		
        CheckReadOnlyMode: function () {
            if (this.options.IsReadOnly) { 
		        $("#data-locationCode").addClass('ui-readonly');
		        $("#data-locationDescription").addClass('ui-readonly');
		        $("#data-locationAddress").addClass('ui-readonly');
		        $("#data-locationCountry").addClass('ui-readonly');
		        $("#data-locationCity").addClass('ui-readonly');
		        $("#data-locationState").addClass('ui-readonly');
		        $("#data-locationPostal").addClass('ui-readonly');
		        $("#data-locationCounty").addClass('ui-readonly');
		        $("#data-locationEmail").addClass('ui-readonly');
		        $("#data-locationTelephone").addClass('ui-readonly');
		        $("#data-locationWebsite").addClass('ui-readonly');
		        $("#data-locationTaxCode").addClass('ui-readonly'); 

                $("#btn-Save").addClass('ui-disabled'); 
                $("#btn-Delete").addClass('ui-disabled');  
            }             
        },

		Show : function() {
			this.render();
			if(this.model){
				Shared.Products.DisplayWait();
				this.LoadSelectedLocation();
			}
			this.CheckReadOnlyMode(); 
		},
		
		LoadSelectedLocation : function() {
			this.$(ClassID.Body).html( this._locationInfoTemplate() );
			
			this.BindCountries(this._country);
			this.BindCities(this.model);
			this.BindFields(this.model);
			this.FetchTaxSchemes();
		},

		

		BindFields : function(model) {
			$("#data-locationCode").val( model.get("WarehouseCode") );
			$("#data-locationDescription").val( model.get("WarehouseDescription") );
			$("#data-locationAddress").val( model.get("Address") );
			$("#data-locationCountry option[value='"+model.get("Country")+"']").attr("selected", "selected");
			$("#data-locationCity option[value='"+model.get("City")+"']").attr("selected", "selected");
			$("#data-locationState").val( model.get("State") );
			$("#data-locationPostal").val( model.get("PostalCode") );
			$("#data-locationCounty").val( model.get("County") );
			$("#data-locationEmail").val( model.get("Email") );
			$("#data-locationTelephone").val( model.get("Telephone") );
			$("#data-locationWebsite").val( model.get("Website") );
			$("#data-locationTaxCode").val( model.get("SalesTaxCode") );
		},
		
		BindCountries : function(collection) {
			collection.each( function(model){
				$("#data-locationCountry").append( new Option(model.get("CountryCode"), model.get("CountryCode")));	
			});
		},
		
		BindCities : function(cities) {
			$('#data-locationCity > option[val !=""]').remove(); 
			if(cities.models){
				cities.each( function(model){
					if(model.get("City") != null) $("#data-locationCity").append( new Option(model.get("City"), model.get("City")));	
				});	
				this.BindStates(cities);
			}else{
				if(cities.get("City") != null || cities.get("State") != null){
					$("#data-locationCity").append( new Option(cities.get("City"), cities.get("City")));	
					$("#data-locationState").val( cities.get("State") );
				}
				
			}				
		},
		
		BindStates : function(cities) {
			var city  = $("#data-locationCity option:selected").val();
			
			var state = cities.find( function(model){
				return model.get("City") == city;
			});
			
			if(state) $("#data-locationState").val( state.get("StateCode") );
		},

		LoadPostal : function(postal) {
			var postalCollection = new PostalCollection();
			var self = this;
			var country  = $("#data-locationCountry option:selected").val();

            Shared.LoadPostalByCode(postal, 
                function(collection){ 
                    postalCollection.reset(collection);                        
                    postalCollection.reset(self.FilterPostalByCountry(postalCollection, country));						
                    if(postalCollection.length > 0) {
					    self.BindCities(postalCollection); 
					    self.isPostalValid = true;
				    }else {
					    self.isPostalValid = false; 
					    // navigator.notification.alert("Zip Code '" + postal + "' does not exist in the Country selected.", null, "Invalid Postal Code", "OK");
                        // self.ClearCityAndState();
					    
					    if (Shared.IsNullOrWhiteSpace(self.isPostalViewLoaded)) {
					        navigator.notification.confirm("The Postal Code '" + postal + "' does not exist in the country selected. Do you want to add '" + postal + "' ?", confirmAddPostal, "Postal Not Found", ['Yes', 'No']);
					    }
				    }   
                }, 
                function(error){
                    postalCollection.reset();
                    postalCollection.RequestError(error, "Error Loading Postal Code");
                    if(self.model) $("#data-locationPostal").val(self.model.get("PostalCode"));
                    else self.ClearCityAndState();
                });  

			/* OLD POSTAL RETRIEVAL PROCESS
			postalCollection.url = Global.ServiceUrl + Service.CUSTOMER + Method.LOADPO<>STALCODE + postal;
			postalCollection.fetch({
				success : function(collection, response, options){
                    if(!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
					if(response){
						collection.reset(self.FilterPostalByCountry(collection, country));
						if(collection.length > 0) {
							self.BindCities( collection ); 
							self.isPostalValid = true;
						}else {
							self.isPostalValid = false;
							//Shared.Products.ShowNotification("Zip Code '" + postal + "' does not exist in the Country selected.", true);
							navigator.notification.alert("Zip Code '" + postal + "' does not exist in the Country selected.", null, "Invalid Postal Code", "OK");
							self.ClearCityAndState();
						}
					}
				},
				error : function(collection, error, response){
                    if(!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
					collection.RequestError(error, "Error Loading Postal Code");
					console.log("error");
                    if(self.model) $("#data-locationPostal").val(self.model.get("PostalCode"));
                    else self.ClearCityAndState();
				}
			});
            */
		},
		AddNewPostal : function(){
		    var _el = $("#addPostalCodeContainer");
		    var _postal = $("#data-locationPostal").val();
		    var country  = $("#data-locationCountry option:selected").val();
		    $(_el).html("<div id='addPostalContainer' style='display: none'></div>");
		    var _postalContainer = $("#addPostalContainer");
		    if (Shared.IsNullOrWhiteSpace(this.newPostalView)) {
		        this.newPostalView = new AddPostalView({
		            el: _postalContainer
		        });
		    } else {
		        this.newPostalView.remove();
		        this.newPostalView = new AddPostalView({
		            el: _postalContainer
		        });
		    }
		    Shared.Products.Overlay.Show();
		    this.isPostalViewLoaded = true;
		    this.newPostalView.on("AcceptPostal", this.AcceptPostal, this);
		    this.newPostalView.on("ClearPostal", this.ClearPostalDetails, this);
		    this.newPostalView.Show(_postal, country, this._country);
		},
		AcceptPostal: function (response) {
		    this.isPostalViewLoaded = false;
		    $("#data-locationCountry").val(response.CountryCode);
		    $("#data-locationCountry").trigger('change');
		    $("#data-locationPostal").val(response.PostalCode);
		    $("#data-locationState").val(response.StateCode);
		    var _postal = response.PostalCode;
		    var _city = response.City;
		    this.LoadPostal(_postal);
		    $('#data-locationCity > option[val !=""]').remove();
		    if (!Shared.IsNullOrWhiteSpace(_city)) {
		        $("#data-locationCity").append(new Option(_city, _city));
		    }
		},
		CountryChanged : function(){
		    this.ClearPostalDetails();
		    this.ClearCityAndState();
		},
		ClearPostalDetails: function () {
		    this.isPostalViewLoaded = false;
			$("#data-locationPostal").val("");
			this.ClearCityAndState();	
		},

		ClearCityAndState : function() {
			if(this.isPostalValid) this.isPostalValid = true;
			$('#data-locationCity > option[val !=""]').remove(); 
			$("#data-locationState").val("");
            $("#data-locationPostal").val("");
		},
		
		FilterPostalByCountry : function(postals, country) {
			var result = postals.reject( function(model){
				return model.get("CountryCode") != country;
			});

			return result;
		},

		AddMode: function () {
			this.IsNew = true;
			$("#data-locationCode").removeAttr("readonly");
			$("#location-title").text("New Location");
			$("#paddingRight div").css("visibility", "hidden");
			
        	this.$(ClassID.Footer).show();
        	this.ClearFields();
        	
        	this.RetrieveLocationDefaults();
        },
        
        ForceAdd : function() {
        	this.$el.html( this._locationDetailTemplate );
        	this.$(ClassID.Body).html( this._locationInfoTemplate() );
        	this.BindCountries(this._country);
        	this.AddMode();
        },
		
		ClearFields : function() {
        	$("#data-locationCode").val("");
			$("#data-locationDescription").val("");
			$("#data-locationAddress").val("");
			$("#data-locationPostal").val("");
			$("#data-locationState").val("");
			$("#data-locationCity").empty();
			$("#data-locationCountry").prop('selectedIndex',0);
			$("#data-locationTelephone").val("");
			$("#data-locationCounty").val("");
			$("#data-locationEmail").val("");
			$("#data-locationWebsite").val("");
        },
        
        InitializeLocation : function () {
			var inventoryLocation  = new BaseModel();
	           	
	        inventoryLocation.on('sync', this.SaveSuccess, this);
	        inventoryLocation.on('error', this.SaveError, this);	
	        
	        return inventoryLocation;
        },
        
        RetrieveLocationDefaults : function() {
        	var self = this;
        	inventoryLocation = this.InitializeLocation();
        	
        	inventoryLocation.url = Global.ServiceUrl + Service.PRODUCT + Method.GETINVENTORYLOCATIONDEFAULTS;
        	inventoryLocation.fetch({
        		success : function(model, response, options){
        			Shared.Products.Overlay.Hide();
        			self.BindCities(model);
        			self.SetSalesTax(model);
        			self.BindFields(model);     
        			self.FetchTaxSchemes(model);   		
        		}, 
        		error : function() {
					Shared.Products.RequestTimeOut();
            	}
        	});
        },
        
        SetSalesTax : function(model) {
        	if (model.get("SalesTaxCode") == null || model.get("SalesTaxCode") == "") {
        		model.set({SalesTaxCode : this.GetDefaultSalesTax});
        	}        	
        },
        
        SaveNewLocation : function() {
			inventoryLocation = this.InitializeLocation();
			
			inventoryLocation.set({
				IsActive : true,
				WarehouseDescription : $("#data-locationDescription").val(),
				Address : $("#data-locationAddress").val(),
				WarehouseCode : $("#data-locationCode").val(),
				City : $("#data-locationCity option:selected").val(),
				State : $("#data-locationState").val(),
				PostalCode : $("#data-locationPostal").val(),
				Country : $("#data-locationCountry option:selected").val(),
				County : $("#data-locationCounty").val(),
				Email : $("#data-locationEmail").val(),
				Telephone : $("#data-locationTelephone").val(),
				Website : $("#data-locationWebsite").val(),
				SalesTaxCode : $("#data-locationTaxCode").val()
				
			});
			Shared.Products.Overlay.Show("Saving in Progress.. This may take a while..");
			inventoryLocation.url = Global.ServiceUrl + Service.PRODUCT + Method.CREATEINVENTORYLOCATION;
			inventoryLocation.save(null, {timeout:0});
			
		},

		DeleteLocation : function() {
			var self = this;
			inventoryLocation = this.InitializeLocation();
			
			inventoryLocation.set({
				IsActive : true,
				WarehouseDescription : $("#data-locationDescription").val(),
				Address : $("#data-locationAddress").val(),
				WarehouseCode : $("#data-locationCode").val(),
				City : $("#data-locationCity option:selected").val(),
				State : $("#data-locationState").val(),
				PostalCode : $("#data-locationPostal").val(),
				Country : $("#data-locationCountry option:selected").val(),
				County : $("#data-locationCounty").val(),
				Email : $("#data-locationEmail").val(),
				Telephone : $("#data-locationTelephone").val(),
				Website : $("#data-locationWebsite").val(),
				SalesTaxCode : $("#data-locationTaxCode").val()
			});
			Shared.Products.Overlay.Show("Deleting Location.. This may take a while..");	
			inventoryLocation.url = Global.ServiceUrl + Service.PRODUCT + Method.DELETEINVENTORYLOCATION;
			inventoryLocation.save(null, {
				success : function(model, response, options) {
					if(!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();	
					if(response){
						Shared.Products.ShowNotification("This location cannot be deleted because there are item(s) associated with this record.", true);
						self.trigger('delete', null);
					}else{	
						Shared.Products.ShowNotification("Location '" + inventoryLocation.get("WarehouseCode") + "' was successfully deleted!");
						self.trigger('delete', inventoryLocation);
					}
					
					$("#location-title").text("Location Details");
            		Shared.Products.Overlay.Hide();	
				},
				error : function() {
					Shared.Products.RequestTimeOut();
				},
			});
			//Shared.Products.Overlay.Show();
		},
		
		UpdateLocation : function() {
			var self = this;
			inventoryLocation = this.InitializeLocation();
			
			inventoryLocation.set({
				IsActive : true,
				WarehouseCode : $("#data-locationCode").val(),
				WarehouseDescription : $("#data-locationDescription").val(),
				Address : $("#data-locationAddress").val(),
				City : $("#data-locationCity option:selected").val(),
				State : $("#data-locationState").val(),
				PostalCode : $("#data-locationPostal").val(),
				Country : $("#data-locationCountry option:selected").val(),
				County : $("#data-locationCounty").val(),
				Email : $("#data-locationEmail").val(),
				Telephone : $("#data-locationTelephone").val(),
				Website : $("#data-locationWebsite").val(),
				SalesTaxCode : $("#data-locationTaxCode").val()
			});
			Shared.Products.Overlay.Show("Saving in Progress.. This may take a while..");
			inventoryLocation.url = Global.ServiceUrl + Service.PRODUCT + Method.UPDATEINVENTORYLOCATION;
			inventoryLocation.save(null, {
				timeout:0,
				success : function(model, response, options){
					if(!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();	
					if(response.ErrorMessage === "" || response.ErrorMessage === null){
						Shared.Products.ShowNotification("Changes successfully saved!");
						Shared.Products.Overlay.Hide();
						$("#location-title").text("Location Details");
						self.trigger("updated", model);
					}else{						
						Shared.Products.ShowNotification(response.ErrorMessage, true);
						self.trigger("failed", self.model);
					}
				}, 
				error : function() {
					Shared.Products.RequestTimeOut();
				}
			});
			
		},
		
		ResetTemplates : function() {
			this.ClearFields();
			this.$(ClassID.Footer).hide();
			$("#location-title").text("Location Details");
			this.IsNew = false;
		},
				
		SaveSuccess : function(model, response, options) {
			if(!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();	
			Shared.Products.Overlay.Hide();
			$("#data-locationCode").attr("readonly", "readonly");
			$("#paddingRight div").css("visibility", "visible");
			if(response){
				if(response.ErrorMessage){
					Shared.Products.ShowNotification(response.ErrorMessage, true);
					//this.trigger('failed', this.model);
					return;
				}else{
					Shared.Products.ShowNotification("Location '" + model.get("WarehouseCode") + "' was successfully created!");
					this.trigger('saved', model);
				}
    			// this.ClearFields();
				// this.$(ClassID.Footer).hide();
				// $("#location-title").text("Location Details");
				// this.IsNew = false;
            }
		},

		SaveError : function() {
			Shared.Products.RequestTimeOut();
		},
		
		ValidateFields : function(){

			var locationCode = $("#data-locationCode").val();
			var locationDescription = $("#data-locationDescription").val();
			var locationAddress = $("#data-locationAddress").val();
			var locationCity = $("#data-locationCity option:selected").val();
			var locationState = $("#data-locationState").val();
			var locationCountry = $("#data-locationCountry option:selected").val();
			var locationPostal = $("#data-locationPostal").val();

			//if(locationDescription === "") return false;
			//if(locationAddress === "") return false;
			//if(locationCity === "") return false;
			//if(locationState === "") return false;
			//if(locationPostal === "") this.isPostalValid = true;
			if(Shared.IsNullOrWhiteSpace(locationCode)) return false;
			
			return true;
		},

		ValidateLocationCodeFormat : function() {
			var locationCode = $("#data-locationCode").val();
			var newStr = locationCode.replace(/\"/g, ' ');
			if(newStr.indexOf("'") !== -1) return false;
			return true;
		},
		
		ValidateNewRecord : function() {
			var locationCode = $("#data-locationCode").val();
			
			var _exist = this.collection.find( function(model){
				return model.get("WarehouseCode").toUpperCase() === locationCode.toUpperCase();
			});
			
			if(_exist){
				console.log("CAN'T EXIST");
				Shared.Products.ShowNotification("The Location "+ locationCode +" entered already exist. Try again.", true);
				return false;
			}else{
				return true;
			}
		},
		
		ValidateEmail : function() {
			var locationEmail = $("#data-locationEmail").val();
			
			if(locationEmail != ""){
				if(!Shared.ValidateEmailFormat(locationEmail)){
					//navigator.notification.alert("Email format is invalid.",null, "Invalid Email", "OK");
					return true;
				}
				return false;
			}else return true;
		},
		
		ValidateUrl : function() {
			var locationWebsite = $("#data-locationWebsite").val();
			
			if(locationWebsite != ""){
				if(!Shared.ValidateUrlFormat(locationWebsite)) return true;
				return false;
			}else return true;
		},
		
		ValidateBeforeProcess : function() {
			var isFieldsValid    = this.ValidateFields();
			var isEmailValid     = this.ValidateEmail();
			var isUrlValid       = this.ValidateUrl();
			var isLocationCodeValid = this.ValidateLocationCodeFormat();
			var isBothValid      = false;
			
			if(!isEmailValid && !isUrlValid){
				isBothValid = true;
			}

			if(!isFieldsValid) Shared.Products.ShowNotification("Please fill out all fields before continuing.", true);
			
			if(!isLocationCodeValid) Shared.Products.ShowNotification("Location code must not contain single quote (').", true);

			if(!isEmailValid && !isBothValid) Shared.Products.ShowNotification("Email format is invalid.", true);

			if(!isUrlValid && !isBothValid) Shared.Products.ShowNotification("URL format is invalid.", true);
			
			if((!isEmailValid && !isUrlValid) && isBothValid) Shared.Products.ShowNotification("Email and URL format is invalid.", true);
			
			if(!this.isPostalValid) Shared.Products.ShowNotification("Postal Code is invalid.", true); 
			
			if(!this.isPostalValid && !isUrlValid) Shared.Products.ShowNotification("Postal Code and URL is invalid.", true); 
			
			if(!this.isPostalValid && !isEmailValid) Shared.Products.ShowNotification("Postal Code and Email is invalid.", true); 
			
			if(isFieldsValid && isEmailValid && isUrlValid && this.isPostalValid && isLocationCodeValid){
				return true;
			}
			return false;
		},
		
		GetDefaultSalesTax : function() {
			return "Sales No Tax";
		},
		
		AssignNumericValidation : function(e) {
			this.lastVal = $('#' + e.target.id).val();
			Shared.Input.NonNegativeInteger('#' + e.target.id);
		},
		
		RevertPreviousValue : function(e) {
        	var val = $('#' + e.target.id).val();
        	if(!this.keyUpTriggered || val === '') return;        	
        	this.keyUpTriggered = false;
        	this.lastVal = parseFloat(val); 
        	$('#' + e.target.id).val(this.lastVal)
        },
        
        keyupTel : function(e) {
        	this.keyUpTriggered = true;
        },

		locationCode_Change : function(e) {
			e.preventDefault();
			this.AssignDescriptionFromLocationCode();
		},

		AssignDescriptionFromLocationCode : function() {
        	var code = $("#data-locationCode").val();
			var desc = $("#data-locationDescription").val();
			
			if (!this.IsNew) return;
			if (code == null || code == "") return;
			if (desc != null && desc != "") return;

			this.AssignDescription(code);
        },

        AssignDescription : function(desc) {
			$("#data-locationDescription").val(desc);
        },


        // Begin : CSL-10976 : 08.08.2013
		FetchTaxSchemes : function() {		
			var _mdl = new BaseModel();			
			
			_mdl.on('sync', this.FetchTaxSchemeSuccess, this)
			_mdl.on('error', this.FetchTaxSchemeFailed, this)
			
			_mdl.url = Global.ServiceUrl + Service.PRODUCT + Method.LOCATIONTAXSCHEMELOOKUP + 100 ;	
			_mdl.set({ StringValue : "" });
			_mdl.save();
		},
		
		FetchTaxSchemeSuccess : function(model, response) {
			if(!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();			
			if (!Shared.IsNullOrWhiteSpace(response.ErrorMessage)) { 
				navigator.notification.alert('Fetching Tax Response : ' + response.ErrorMessage, null, "Error", "OK"); return;
			}
			this.ResetTaxSchemes(response.SystemTaxSchemes);	
		},
		
		FetchTaxSchemeFailed : function(error, xhr, options) {
			if(!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
	    	navigator.notification.alert("Error Fetching Tax Schemes", null, "");			
		},

		ResetTaxSchemes : function(taxSchemes) {		
			$('#data-locationTaxCode > option[val !=""]').remove(); 
			this.taxSchemeCollection = new PostalCollection();
			this.taxSchemeCollection.reset(taxSchemes);		
			this.taxSchemeCollection.each(this.FillTaxCombobox, this);				
			this.SetSelectedTaxCode(this.model.get("SalesTaxCode"));
		},

		FillTaxCombobox : function(model) {		
			var _taxDesctiption = model.get('TaxDescription');
			var _taxCode = model.get('TaxCode');
			$('#data-locationTaxCode').append(new Option( _taxDesctiption, _taxCode ))
		},

		TaxCodeChanged : function(e) {
			var _id  = e.target.id;			
			var _val = $('#'+_id).val(); 	
			this.taxCode = _val;
		},

		SetSelectedTaxCode : function (taxCode) {
			if(this.IsNew || !taxCode) $('#data-locationTaxCode').val(this.GetDefaultSalesTax).change();
			else $('#data-locationTaxCode').val(taxCode).change();
		},
		// Begin : CSL-10976 : 08.08.2013
		
	});
	return LocationDetailView;
})
