define(["jquery","mobile","underscore","backbone","view/20.0.0/pos/item/search/stock/stock"],function(e,t,o,i,n){var r=i.View.extend({initialize:function(){e("#list-detail-content").empty(),this.render()},render:function(){console.log(this.collection),this.collection.each(function(e){var t=e.get("UnitMeasureQty"),o=e.get("FreeStock");o/=t;var i=o.toString().split(".");o=i[1]>0?o.toFixed(2):parseFloat(o),e.set({FreeStock:o}),this.stockitem=new n({model:e})}),this.myScroll?this.myScroll.refresh():this.myScroll=new iScroll("detail-content",{vScrollbar:!0,vScroll:!0})}});return r});