/**
 * @author Connected Business
 */
define([
	'jquery',
	'mobile',
	'underscore',
	'backbone',
	'shared/global',
	'shared/method',
	'shared/shared',
	'text!template/20.1.0/pos/item/item.tpl.html'
],function($, $$, _, Backbone, Global, Method, Shared, template){
	var ItemView = Backbone.View.extend({
		_template: _.template(template),
		initialize : function(){
			this.$el.attr("class", "item-list");
			this.$el.attr("id", this.model.cid);
		},
		
		events:{
    		"tap" : "SelectItem",
		},
		
		render :function(){
			var _currencySymbol = Global.CurrencySymbol,
			_imageLoc = Global.ServiceUrl + Method.IMAGES + this.model.get("ItemCode") + ".png?"+Math.random();
			
			if(Global.IsUseISEImage) _imageLoc = this.AssignISEImageLocation(this.model.get("Filename")); ;
			//console.log(_imageLoc);
			var _defaultImg = Global.ServiceUrl + Method.IMAGES + "Interprise.jpg";			
			this.CheckDefaultPrice(this.model);			
			this.model.set({
				DefaultImg: _defaultImg,
				ImageLocation: _imageLoc,
				CurrencySymbol: _currencySymbol,
				type: this.model.get('ItemType').charAt(0)
			}, {silent:true});
			//this.model.set({ImageLocation : _imageLoc},{silent:true});
			
			/*var _itemName = this.model.get("ItemName");
    		
			if(Global.Preference.IsUseItemDescription){
				 _itemName = this.model.get("ItemDescription");				
			}*/

		 	var _itemName = Shared.Escapedhtml((Global.Preference.IsUseItemDescription) ? this.model.get('ItemName') : this.model.get('ItemDescription'));	
		 
		 	if(_itemName.length > 25) {
			 	_itemName=_itemName.substring(0,20) + '...';
			 	this.$('.item-desc').attr('style','word-break:keep-all;max-height:55px;overflow:hidden;margin-top:10px;min-width:100px;');
		 	}
    
		 	this.model.set({ItemName : _itemName}, {silent:true});
			this.$el.html(this._template(this.model.toJSON()));

			return this;
		},
		
		CheckDefaultPrice : function(model){
			var _retailPrice = model.get("RetailPrice");
			var _wholePrice = model.get("WholesalePrice");
			switch(Global.DefaultPrice){
				case "Retail" :
					model.set({Price : _retailPrice}, {silent:true});
					break;
				case "Wholesale" :
					model.set({Price : _wholePrice}, {silent:true});
					break;
			}
		},
		
		SelectItem: function(e) {
			e.preventDefault();
			this.model.select();
    },
   
    AssignISEImageLocation : function(itemFilename) {
			return Global.WebSiteURL + '/' + Method.ISEIMAGES + Global.ISEImageSize + itemFilename;
		}
    	
	});
	return ItemView;
});
