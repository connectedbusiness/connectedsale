define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'model/base',
  'collection/base',
  'shared/global',
  'shared/service',
  'shared/shared',
  'shared/method',
  'shared/enum',
  'view/19.0.0/pos/promotion/promotionlist',
  'text!template/19.0.0/pos/promotion/promotion.tpl.html',
  'view/19.0.0/pos/promotion/promotionitemlist',
  'js/libs/iscroll.js'
], function($, $$, _, Backbone, BaseModel, BaseCollection, Global, Service, Shared, Method, Enum, PromotionListView, template, PromotionItemListView) {

  var View = Backbone.View.extend({
    template: _.template(template),
    rules: new BaseCollection(),
    events: {
      "click #close": "close"
    },

    initialize: function(){
        this.$el.html(this.template({
			
        }));
		this.getPromoItems(this.collection);
		this.getPromoItems2(this.options.promoitems);
    },

    render: function(){
      $("#main-transaction-blockoverlay").show();
      return this;
    },

    close: function() {
	  var result = new BaseCollection(this.collection.filter(function(detail) {
	        return detail.get("IsSelected") == true
	     }.bind(this)));

 

    this.collection.each(function(promoitem){
      this.options.promoitems.each(function(promoitem2){
        if (promoitem.get("GetItemCode") == promoitem2.get("GetItemCode") && promoitem.get("IsSelected") == true){
          promoitem2.set("IsSelected", true);
        }

      });
    }.bind(this));

       var result2 = new BaseCollection(this.options.promoitems.filter(function(detail) {
          return detail.get("IsSelected") == true
       }.bind(this)));
    

	  var model = new BaseModel();
	var itemModel = new BaseModel();
	
	  this.collection.each(function(items){
	  	if(items.get('IsSelected') == false)
        model = items;
		itemModel.url = Global.ServiceUrl + "Transactions/" + "DeleteNotIncludedItems?PromoDocumentCode=" + model.get('PromoDocumentCode') + '&GetItemCode=' + model.get('ItemCode');
        itemModel.save(null, {

		});
	  });
	  this.trigger('getPromoItems', result, result2);
      $('#main-transaction-blockoverlay').hide();
      this.unbind();
      this.remove();

    },

    getPromoItems: function(collection){
      var self = this;
		self.rules = new BaseCollection();
		
		collection.each(function(model){
			model.set('IsSelected',false);
			self.renderPromoPerItem(model);
		});
		
		this.rules.on('resetSelected', function() {
            var list = this.$('ul').children();
            _.each(list, function(li) {
              $(li).removeClass('selected');
            });
          }.bind(this));
		
//		collection.each(function(model){
//			if(self.rules.length == 0) {
//				self.renderPromoPerItem(model);
//				self.rules.add(model);
//			 } else {
//				self.rules.each(function(items){
//					if (items.get('RuleID') != model.get('RuleID'))
//					{
//						self.renderPromoPerItem(model);
//						self.rules.add(model);
//					}
//				});
//			 }
//			model.set('IsSelected',false);
//			});
//		

		
//	  this.rules.on('selected_option', this.getItemDetails, this);
    },

     getPromoItems2: function(collection){
      var self = this;
    self.rules = new BaseCollection();
    
    collection.each(function(model){
      model.set('IsSelected',false);      
    });
    
    this.rules.on('resetSelected', function() {
            var list = this.$('ul').children();
            _.each(list, function(li) {
              $(li).removeClass('selected');
            });
          }.bind(this));
  },

    renderPromoPerItem: function(model){
      var promoItemView = new PromotionListView({
        model: model,
		collection: this.collection
      });      
      this.$('#promo-form-list').find('ul').append(promoItemView.render().el);
	  promoItemView.setSelected(model.cid);
    },
	  
//	  renderItemDetails: function(data,ruleID){
//		  var self = this;
//		this.$('#promo-configurator-preview').find('ul').empty();
//		  data.each(function(detail){
//		  	self.renderOnePromoDetail(detail);
//		  });
//       this.$('#promo-configurator-preview').find('ul').listview().listview('refresh');
//	  },
//	  
//	 renderOnePromoDetail: function(model) {
//		  var promoItemListView = new PromotionItemListView({
//			model: model,
//		  });  
//		  this.$('#promo-configurator-preview').find('ul').append(promoItemListView.render().el);
//		  promoItemListView.setSelected(model.cid);
//    },
//	  
//	 getItemDetails: function(model){
//		  var item = new BaseModel(),
//			  ruleID = model.get('RuleID'),
//			  itemCode = model.get('ItemCode');
//
//		  var itemDetailCode = new BaseCollection(this.collection.filter(function(detail) {
//			return detail.get("RuleID") === ruleID
//		  }));
//	 	this.renderItemDetails(itemDetailCode,ruleID);
//	  },
	  
    });

    return View;
});
