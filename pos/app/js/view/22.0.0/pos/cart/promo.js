define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'shared/enum',
  'collection/base',
  'view/23.0.0/pos/cart/promobuyitem',
  'view/23.0.0/pos/cart/promogetitem',
  'text!template/23.0.0/pos/cart/promo.tpl.html'
], function($, $$, _, Backbone, Global, Enum, BaseCollection, PromoBuyItemView, PromoGetItemView, template) {

  return Backbone.View.extend({

    template: _.template(template),
    tagName: 'tbody',

    initialize: function() {       
	if(this.collection.length != 0){
      this.$el.html(this.template({
        PromoDescription: this.collection.at(0).get("PromoDescription"),        
      }));
	
      this.$el.attr('id', this.collection.at(0).attributes.PromoDocumentCode);
		}
      // this.$el.css("background-color", "#ECF5FE");
       this.$el.attr('style', 'background: #ECF5FE');
    },

    render: function() {                    
      this.renderBuyandGetItems();
      return this;
    },

    displayPromoCaption: function(){             
    var promoel = document.getElementsByClassName("promo-item");
    for (x=0;x<=promoel.length-1;x++){
          var child = promoel[x];
          //child.getElementsByClassName("icon-remove-sign")[0].style.display = "none";
           child.getElementsByClassName("promotag")[0].style.display = "block";
        };
    },

    renderBuyandGetItems: function () {
      this.collection.each(this.renderBuyItem, this)
      this.collection.each(this.renderGetItem, this)
    },

    renderBuyItem: function (buyitem) {      
      if (this.buyItemCode === buyitem.get("BuyItemCode")) return;
      var promoBuyItemView = new PromoBuyItemView({
        model: buyitem.attributes,
        getItemQty: this.options.getItemQty
      });
      this.$el.find('#buyitems').append(promoBuyItemView.render().el);
      this.buyItemCode = buyitem.get("BuyItemCode");
    },

    renderGetItem: function (getitem) {    
      if (this.getItemCode === getitem.get("GetItemCode")) return;
      var promoGetItemView = new PromoGetItemView({
        model: getitem.attributes,
        getItemQty: this.options.getItemQty
      });
      this.$el.find('#getitems').append(promoGetItemView.render().el);
      this.getItemCode = getitem.get("GetItemCode");
    }

  });
});
