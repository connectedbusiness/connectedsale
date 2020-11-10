/**
 * @author alexis.banaag
 */
define([
	'jquery',
	'mobile',
	'underscore',
	'backbone',
	'shared/global',
	'shared/service',
	'shared/shared',
	'shared/method',
	'model/base',
	'collection/base',
	'text!template/19.2.0/products/unitmeasure/uomdetail.tpl.html',
	'text!template/19.2.0/products/unitmeasure/uomdetail/uom-info.tpl.html'
], function($, $$, _, Backbone, Global, Service, Shared, Method,
	BaseModel, BaseCollection, 
	UOMDetailTemplate, UOMInfoTemplate){
	
	var ClassID = {
		Body   : '.uomdetail-body div',
		Footer : '.uomdetail-footer'
	}
		
	var currentInstance;
	var doProcessDelete = function (button) {
        if (button === 1) {
            currentInstance.DeleteUOM();
        }
    };

	var UnitMeasureDetailView = Backbone.View.extend({
		
		_uomDetailTemplate : _.template( UOMDetailTemplate ),
		_uomInfoTemplate   : _.template( UOMInfoTemplate ),
		
		events : {
			"tap #btn-finish" : "btnClick_Finish",
			"tap #btn-cancel" : "btnClick_Cancel",
			"tap #btn-Save"   : "btnClick_Update",
			"tap #btn-Delete" : "btnClick_Delete",
			"focus #data-UOMQuantity" : "SaveAndClearValue",
			"blur #data-UOMQuantity" : "RevertPreviousValue",
			"change #data-UOMCode" : "UOMCode_Change"
		},

		initialize : function() {
			currentInstance = this;
			this.IsNew = false;
		},
		
		render : function() {
			if(this.model){
				this.$el.html( this._uomDetailTemplate );
				this.$(ClassID.Footer).hide();
			}else{
				this.$el.html("");
				this.DisplayNoRecordFound();
			}

            this.CheckReadOnlyMode();
			return this;
		}, 
		
        CheckReadOnlyMode: function () {
            if (this.options.IsReadOnly) {  
                $("#data-UOMCode").addClass('ui-readonly'); 
                $("#data-UOMDescription").addClass('ui-readonly'); 
                $("#data-UOMQuantity").addClass('ui-readonly'); 

                $("#btn-Save").addClass('ui-disabled'); 
                $("#btn-Delete").addClass('ui-disabled');  
            }             
        },


		btnClick_Cancel : function (e) { 
			e.stopImmediatePropagation(); 
            this.trigger('cancel', this);
		},

        DoCancel : function(){
			this.ClearFields();
			this.$(ClassID.Footer).hide();
			this.IsNew = false;         
        },
		
		btnClick_Finish : function (e) { 
			e.preventDefault(); 

			if(this.ValidateBeforeProcess()){
				if(this.ValidateNewRecord()) this.SaveNewUOM();	
				else $("#data-UOMCode").removeAttr("readonly");	
			}
		},
		
		btnClick_Update : function (e) {
			e.preventDefault(); 
			if(this.ValidateBeforeProcess()){
				this.UpdateUOM();	
			}
		},
		
		btnClick_Delete : function (e) {
			e.preventDefault(); 

			navigator.notification.confirm("Are you sure you want to delete this unit of measure?", doProcessDelete, "Confirmation", ['Yes','No']);
		},

        AddMode: function () {
        	this.IsNew = true;
        	this.$(ClassID.Footer).show();
        	$("#data-UOMCode").removeAttr("readonly");
        	$("#uom-title").text("New Unit of Measure");
        	this.$("#paddingRight div").css("visibility","hidden");
        	this.ClearFields();
        	
        	this.LoadUnitMeasureSchema();
        },

        AssignDescriptionFromUOMCode : function() {
        	var code = $("#data-UOMCode").val();
			var desc = $("#data-UOMDescription").val();
			
			if (!this.IsNew) return;
			if (code == null || code == "") return;
			if (desc != null && desc != "") return;

			this.AssignDescription(code);
        },

        AssignDescription : function(desc) {
			$("#data-UOMDescription").val(desc);
        },

        ClearFields : function() {
        	$("#data-UOMCode").val("");
			$("#data-UOMDescription").val("");
			$("#data-UOMQuantity").val("");
        },

		DeleteUOM : function() {
			var self = this;
			uom = this.InitializeUOM();
			
			uom.set({
				IsActive : this.model.get("IsActive"),
				UnitMeasureDescription : $("#data-UOMDescription").val(),
				UnitMeasureQuantity : $("#data-UOMQuantity").val(),
				UnitMeasureCode : $("#data-UOMCode").val()
			});
			
			Shared.Products.Overlay.Show();			
			uom.url = Global.ServiceUrl + Service.PRODUCT + Method.DELETEUNITOFMEASURE;
			uom.save(null, {
				success : function(model, response, options) {
					if(response){
						Shared.Products.ShowNotification(response.ErrorMessage, true);
					}else{
						Shared.Products.ShowNotification("Unit of Measure '" + $("#data-UOMCode").val() + "' was successfully deleted!");
					}
					
            		self.trigger('delete', uom);
            		Shared.Products.Overlay.Hide();
				}, 
				error : function() {
					Shared.Products.RequestTimeOut();
				}
			});
		},

		DisplayNoRecordFound : function() {
            Shared.Products.DisplayNoRecordFound("#right-panel", ".list-wrapper", this.toBeSearched);
        },

		ForceAdd : function() {
        	this.$el.html( this._uomDetailTemplate );
        	this.$(ClassID.Body).html( this._uomInfoTemplate() );
        	
        	this.AddMode();
        },

		InitializeUOM: function () {
			var uom  = new BaseModel();
	           	
	        uom.on('sync', this.SaveSuccess, this);
	        uom.on('error', this.SaveError, this);	
	        
	        return uom;
        },
		
		LoadSelectedUOM : function() {
			var self = this;
			if (!this.model) return;
			this.$(ClassID.Body).html( this._uomInfoTemplate() );
			
			$("#data-UOMCode").val( this.model.get("UnitMeasureCode") );
			$("#data-UOMIsActive").prop('checked', this.model.get("IsActive"));
			$("#data-UOMDescription").val( this.model.get("UnitMeasureDescription") );
			$("#data-UOMQuantity").val( this.model.get("UnitMeasureQuantity") );

			
		},

		LoadUnitMeasureSchema : function() {
        	$("#data-UOMQuantity").val("1");
        },

		SaveNewUOM : function() {
			uom = this.InitializeUOM();
			
			uom.set({
				IsActive : true,
				UnitMeasureDescription : $("#data-UOMDescription").val(),
				UnitMeasureQuantity : $("#data-UOMQuantity").val(),
				UnitMeasureCode : $("#data-UOMCode").val()
			});
			
			uom.url = Global.ServiceUrl + Service.PRODUCT + Method.CREATEUNITOFMEASURE;
			uom.save();
			Shared.Products.Overlay.Show();
		},

		SaveSuccess : function(model, response, options) {
			Shared.Products.Overlay.Hide();
			if(response){
				if(response.ErrorMessage){
					Shared.Products.ShowNotification(response.ErrorMessage, true);
				}else{
					Shared.Products.ShowNotification("Unit of Measure '" + response.UnitMeasureCode + "' was successfully created!");
				}
            	this.ClearFields();
				this.$(ClassID.Footer).hide();
				$("#data-UOMCode").attr("readonly", "readonly");
				this.$("#paddingRight div").css("visibility","visible");
				this.trigger('saved', model);
				this.IsNew = false;
            }
				
		},
		
		SaveError : function () {
			Shared.Products.RequestTimeOut();
		},		

		Show : function() {
			this.render();
			Shared.Products.DisplayWait();
			this.LoadSelectedUOM();
            this.CheckReadOnlyMode();
		},

        UpdateUOM : function() {
			var self = this;
			uom = this.InitializeUOM();

			uom.set({
				IsActive : this.model.get("IsActive"),
				UnitMeasureDescription : $("#data-UOMDescription").val(),
				UnitMeasureQuantity : $("#data-UOMQuantity").val(),
				UnitMeasureCode : $("#data-UOMCode").val()
			});
			
			Shared.Products.Overlay.Show();
			uom.url = Global.ServiceUrl + Service.PRODUCT + Method.UPDATEUNITOFMEASURE;
			uom.save(null, {
				success : function(model, response, options){
					if(response){
						self.trigger("updated", model);
						Shared.Products.ShowNotification("Changes successfully saved!");
						Shared.Products.Overlay.Hide();
					}
				}
			});
		},

		UOMCode_Change : function(e) {
			e.preventDefault();
			this.AssignDescriptionFromUOMCode();			
		},

		ValidateFields : function(){
			var UnitMeasureDescription = $("#data-UOMDescription").val();
			var UnitMeasureQuantity = $("#data-UOMQuantity").val();
			var UnitMeasureCode = $("#data-UOMCode").val();
			
			if (Shared.IsNullOrWhiteSpace(UnitMeasureQuantity)) return false;
			if (Shared.IsNullOrWhiteSpace(UnitMeasureCode)) return false;
			
			return true;
		},
		
		ValidateQuantity : function(e) {
		    var UnitMeasureQuantity = 0;
		    if (Global.InventoryPreference.IsAllowFractional) {
		        UnitMeasureQuantity = parseFloat($("#data-UOMQuantity").val());
		    } else {
		        UnitMeasureQuantity = parseInt($("#data-UOMQuantity").val());
		    }
			
			if(UnitMeasureQuantity != 0 && UnitMeasureQuantity > 0){
				return true;
			}
			
			return false;
		},

		ValidateBeforeProcess : function() {
			var isFieldsValid       = this.ValidateFields();
			var isQuantityValid     = this.ValidateQuantity();
			var isBothValid         = false;
			
			if(!isFieldsValid) Shared.Products.ShowNotification("Please fill out all fields before continuing.", true);
			
			if(!isQuantityValid && !isBothValid) Shared.Products.ShowNotification("Quantity must not be zero(0) and must be a positive number.", true);
			
			if(!isQuantityValid && isBothValid) Shared.Products.ShowNotification("Please fill out all fields before continuing.", true);
			
			if(isFieldsValid && isQuantityValid){
				return true;
			}
			
			return false;
		},
		
		ValidateNewRecord : function() {
			var UnitMeasureCode = $("#data-UOMCode").val();
			
			var _exist = this.collection.find( function(model){
				return model.get("UnitMeasureCode").toUpperCase() === UnitMeasureCode.toUpperCase();
			});
			
			if(_exist){
				console.log("CAN'T EXIST");
				Shared.Products.ShowNotification("Unit of Measure '" + UnitMeasureCode + "' entered already exist. Try again..", true);
				return false;
			}else{
				return true;
			}
		}, 
		
		AssignNumericValidation: function (e) {
		    if (Global.InventoryPreference.IsAllowFractional) {
		        Shared.Input.NonNegative('#' + e.target.id);
		    } else {
		        Shared.Input.NonNegativeInteger('#' + e.target.id);
		    }
		},
		
		SaveAndClearValue: function (e) {
        	var elem = '#' + e.target.id;
        	var val = $(elem).val();        	
        	this.lastQty = val;        	 	
        	$(elem).val('');
        	this.AssignNumericValidation(e);
        },   
		
		RevertPreviousValue : function(e) {
			var elemID = '#' + e.target.id
        	var val = $(elemID).val();
        	var lastVal = ''; 
        	
        	if(val !== '') lastVal = parseFloat(val);
        	else lastVal = this.lastQty;
        	
        	$(elemID).val(lastVal)
        },
		
	});
	
	return UnitMeasureDetailView;
})
