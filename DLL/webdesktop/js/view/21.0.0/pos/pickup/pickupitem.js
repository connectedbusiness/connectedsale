define(["jquery","mobile","underscore","backbone","shared/global","shared/shared","model/base","collection/base","text!template/21.0.0/pos/pickup/pickupitem.tpl.html","js/libs/iscroll.js"],function(t,e,i,n,o,r,s,l,a){var c=n.View.extend({events:{"tap .btn-pickup-more":"btnMore_Tap","tap .btn-pickup-print":"btnPrint_Tap","tap .btn-pickup-reprint":"btnPrint_Tap","tap .btn-pickup-confirm":"btnConfirm_Tap"},_template:i.template(a),initialize:function(){this.render(),this.model.on("destroy",function(){this.unbind(),this.remove()},this),this.model.on("printed",function(){this.$el.find(".btn-pickup-print").hide(),this.$el.find(".btn-pickup-reprint").show()},this)},render:function(){var t=this.model.get("SalesOrderDate");t=new Date(parseInt(t.substr(6)));var e=t.getMonth()+1,i=t.getDate(),n=t.getFullYear(),o=r.Escapedhtml(this.model.get("BillToName"));return t=e+"/"+i+"/"+n,this.model.set({FormattedBillToName:o,FormattedDate:t}),this.$el.html(this._template(this.model.toJSON())),this},btnPrint_Tap:function(t){this.model.trigger("print-picking-ticket",this.model)},btnConfirm_Tap:function(t){this.model.trigger("ready-for-invoice",this.model)},btnMore_Tap:function(t){this.toggleMore()},toggleMore:function(){var t=this.$el.find(".pickup-items"),e=this.$el.find(".btn-pickup-more i"),i=(this.$el.find(".btn-pickup-more"),this);"none"!=t.css("display")?(t.hide("fast",function(){i.model.trigger("refresh-scroll")}),e.addClass("icon-chevron-down"),e.removeClass("icon-chevron-up")):(t.show("fast",function(){i.model.trigger("refresh-scroll")}),e.removeClass("icon-chevron-down"),e.addClass("icon-chevron-up"),this.loadDetails())},loadDetails:function(){if(this.itemCollection)return void this.displayItems();var t=this;this.itemCollection=new l,this.itemCollection.url=o.ServiceUrl+"Transactions/loadorderdetail/"+(this.model.get("SalesOrderCode")||""),this.itemCollection.parse=function(t){return t.SalesOrderDetails},this.itemCollection.fetch({success:function(e,i){t.displayItems()},error:function(t,e,i){}})},displayItems:function(){var t=this,e=this.$el.find(".pickup-items ul");e.html("");var i=!0;t.itemCollection.each(function(t){e.append('<li class="'+(i?"isDarkerRow":"")+'">'+t.get("ItemDescription")+"<span>"+t.get("QuantityOrdered")+"</span></li>"),i=!i}),t.model.trigger("refresh-scroll")}});return c});