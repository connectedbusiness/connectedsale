define(["jquery","mobile","underscore","backbone","shared/global","shared/enum","collection/base","view/18.2.0/pos/cart/promobuyitem","view/18.2.0/pos/cart/promogetitem","text!template/18.2.0/pos/cart/promo.tpl.html"],function(e,t,o,i,n,r,s,m,l,a){return i.View.extend({template:o.template(a),tagName:"tbody",initialize:function(){0!=this.collection.length&&(this.$el.html(this.template({PromoDescription:this.collection.at(0).get("PromoDescription")})),this.$el.attr("id",this.collection.at(0).attributes.PromoDocumentCode)),this.$el.attr("style","background: #ECF5FE")},render:function(){return this.renderBuyandGetItems(),this},displayPromoCaption:function(){var e=document.getElementsByClassName("promo-item");for(x=0;x<=e.length-1;x++){var t=e[x];t.getElementsByClassName("promotag")[0].style.display="block"}},renderBuyandGetItems:function(){this.collection.each(this.renderBuyItem,this),this.collection.each(this.renderGetItem,this)},renderBuyItem:function(e){if(this.buyItemCode!==e.get("BuyItemCode")){var t=new m({model:e.attributes,getItemQty:this.options.getItemQty});this.$el.find("#buyitems").append(t.render().el),this.buyItemCode=e.get("BuyItemCode")}},renderGetItem:function(e){if(this.getItemCode!==e.get("GetItemCode")){var t=new l({model:e.attributes,getItemQty:this.options.getItemQty});this.$el.find("#getitems").append(t.render().el),this.getItemCode=e.get("GetItemCode")}}})});