define(["jquery","mobile","underscore","backbone","shared/global","shared/shared","shared/enum","model/base","view/19.1.0/secondarydisplay/cartitem","view/19.1.0/secondarydisplay/summary","view/19.1.0/secondarydisplay/kit","text!template/19.1.0/secondarydisplay/cart.tpl.html","js/libs/iscroll.js"],function(t,e,i,a,r,n,s,l,o,d,c,m){var h=a.View.extend({_template:i.template(m),initialize:function(){this.collection.on("add",this.ModelAdded,this),this.collection.on("reset",this.ReinitializeCart,this),this.render()},render:function(){this.$el.html(this._template),this.InitializeSummary()},InitializeSummary:function(){this.summaryView||(this.InitializeSummaryModel(),this.summaryView=new d({el:t(".cartSummary"),model:this.summaryModel})),this.summaryView.render()},InitializeSummaryModel:function(){this.summaryModel=new l({TotalQuantity:0,Total:0,TotalDiscount:0,TaxRate:0,Payment:0,BalanceRate:0,CurrencySymbol:r.CurrencySymbol,Type:"Sale"})},ManageCartCSS:function(){t(".secondarydisplay-page div.rightpane div.cartSummary").css("width","360px")},LoadiScroll:function(){var e="cartContent",i="cartListContainer",a=(t("#"+e).offset().top+t("#"+e).height(),t("#"+i).offset().top+t("#"+i).height());return r.isBrowserMode?(n.UseBrowserScroll("#cartContent"),this.ManageCartCSS(),void(a>570&&t("#"+e).animate({scrollTop:t("#"+i)[0].scrollHeight},100))):void(this.myScroll?(this.myScroll.refresh(),a>570&&this.myScroll.scrollToElement("tbody:last-child",100)):this.myScroll=new iScroll(e,{snap:!0,momentum:!0}))},AddOneItemToCart:function(t){var e=new o({model:t});if(this.$("#cartListContainer").append(e.render().el),t.get("ItemType")===s.ItemType.Kit){var i=new c({id:t.get("ItemCode")+"-"+t.get("LineNum"),lineNum:t.get("LineNum"),collection:t.get("KitDetails")});this.$("#cartListContainer").append(i.render().el)}},ModelAdded:function(t){this.AddOneItemToCart(t),this.RefreshCartTable()},RefreshCartTable:function(){this.$(".cartHeader .itemName").width(this.$("#cartListContainer .cart-details .itemName").width()),this.$(".cartHeader .itemQty").width(this.$("#cartListContainer .cart-details .itemQty").width()),this.$(".cartHeader .itemRemaining").width(this.$("#cartListContainer .cart-detailst .itemRemaining").width()),this.$(".cartHeader .itemPrice").width(this.$("#cartListContainer .cart-details .itemPrice").width()),this.$(".cartHeader .itemDiscount").width(this.$("#cartListContainer .cart-details .itemDiscount").width()),this.$(".cartHeader .itemExtPrice").width(this.$("#cartListContainer .cart-details .itemExtPrice").width()),this.$(".cartHeader .itemViewDetail").width(this.$("#cartListContainer .cart-details .itemViewDetail").width()),this.LoadiScroll()},ClearCart:function(){this.$("#cartListContainer tbody").empty(),this.myScroll&&(this.myScroll.destroy(),this.myScroll=null,this.$("#cartListContainer").removeAttr("style"))},ReinitializeCart:function(){this.ClearCart()},SetTotal:function(t){this.$(".total-amount").html(t)},UpdateSummary:function(t){this.summaryView.render(t)}});return h});