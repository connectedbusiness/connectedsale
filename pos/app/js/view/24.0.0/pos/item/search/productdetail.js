/**
 * @author Connected Business
 */
define([
	'jquery',
	'mobile',
	'underscore',
	'backbone',
	'model/base',
	'shared/global',
	'shared/method',
    'shared/shared',
	'shared/service',
	'text!template/24.0.0/pos/item/search/productdetail.tpl.html'
], function($, $$, _, Backbone,BaseModel, Global, Method,Shared, Service, template){
	var ProductDetailView = Backbone.View.extend({
		_template : _.template(template),

		initialize : function(){
			this.render();
		},
		
		GenerateItemImageByCode : function(){
			this.generateImage = new BaseModel();
			this.generateImage.set({
				StringValue : this.model.get("ItemCode")
			});
			this.generateImage.url = Global.ServiceUrl + Service.PRODUCT +  Method.GENERATEITEMIMAGEBYCODE;
			this.generateImage.save();
			this.generateImage.on('sync',this.ShowItemDetails,this);
		},
		ShowItemDetails : function(){
			if(!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
			var _imageLoc = Global.ServiceUrl + Method.IMAGES + this.model.get("ItemCode") + ".png?"+Math.random();
			if (Global.IsUseISEImage) { _imageLoc = this.AssignISEImageLocation(this.model.get("Filename")); }
			console.log(_imageLoc)
			this.model.set({ImageLocation : _imageLoc},{silent:true});
			var _unitsInStock = this.model.get("UnitsInStock");
			//_unitsInStock = Math.round(_unitsInStock);
			var splitVal  = _unitsInStock.toString().split(".");
			if(splitVal[1] === 0){
				_unitsInStock = parseFloat(_unitsInStock);
			}
			this.model.set({UnitsInStock : _unitsInStock,
			    CurrencySymbol: Global.CurrencySymbol
			},
							{silent:true});
			
			$("#lookup-inner").html( this._template(this.model.toJSON()));			
			this.DisplayWholesalePrice();
			this.CheckItemType();
			$("#lookup-detail-content").trigger("create");

			$("#lookup-detail-content").find(".category-detail").css("max-width", "80%");
			$("#lookup-detail-content").find(".category-detail").css("white-space", "nowrap");
			$("#lookup-detail-content").find(".category-detail").css("overflow", "hidden");

			//$("#lookup-inner").find('#onHand-btn').find('a').addClass('ui-state-disabled');

			return this;
		},
		render : function(){
			this.GenerateItemImageByCode();
		},
		CheckItemType : function(){
			var itemType = this.model.get("ItemType");
			console.log('culprint here');
			if(itemType == "Service" || itemType == "Non-Stock" || itemType == 'Kit'){
				$("#onHand-btn").hide();
			}else{
				$("#onHand-btn").show();
			}
			
		},
		DisplayWholesalePrice : function() {
			switch (Global.Preference.ShowWholesalePrice) {
				case true :
					$(".li-wholesalePrice").show();
					break;
				case false :
					$(".li-wholesalePrice").hide();
					break;
			}
		},
		
		AssignISEImageLocation : function(itemFilename) {
			//console.log(itemFilename);
			return Global.WebSiteURL + '/' + Method.ISEIMAGES + Global.ISEImageSize + itemFilename;
		},	
	});
	return ProductDetailView;
});
