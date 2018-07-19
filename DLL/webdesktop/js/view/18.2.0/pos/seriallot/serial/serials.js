define(["jquery","mobile","underscore","backbone","shared/global","shared/enum","shared/shared","model/serialnumber","model/lotnumber","collection/base","view/18.2.0/pos/seriallot/serial/serial","text!template/18.2.0/pos/seriallot/serial/serials.tpl.html","js/libs/iscroll.js"],function(e,t,i,s,o,l,r,a,n,h,m,c){var d=s.View.extend({_template:i.template(c),initialize:function(){this.type=this.options.type,this.lineNum=this.options.lineNum,this.itemCode=this.options.itemCode,this.uom=this.options.uom,this.itemType=this.options.itemType,this.autoGenerate=this.options.autoGenerate,this.collection.on("startRendering",this.Show,this)},render:function(){this.$el.html(this._template);try{this.$("#serialListNumber").listview()}catch(e){console.log("listview for serialListNumber already initalialized. Skip this message")}},DesignateSerial:function(e,t){switch(e){case"ItemType":this.ShowCollection(t);break;case"SerializeLot":this.ShowSerialLot(t)}},HideElements:function(){o.TransactionType===l.TransactionType.SalesRefund?(e(".checkbox-serialLot").show(),e("#input-serialLot").addClass("ui-disabled"),e("#add-serialLot").addClass("ui-disabled")):!this.autoGenerate||this.itemType!==l.ItemType.GiftCard&&this.itemType!==l.ItemType.GiftCertificate?(e(".checkbox-serialLot").hide(),e("#input-serialLot").removeClass("ui-disabled"),e("#add-serialLot").removeClass("ui-disabled")):(e(".checkbox-serialLot").hide(),e("#input-serialLot").addClass("ui-disabled"),e("#add-serialLot").addClass("ui-disabled"))},InitializeSerialItem:function(e){var t=new m({model:e});this.$("#serialListNumber").append(t.render().el),t.Bind(),this.RefreshListView(),this.LoadScroll()},IsItemCodeExist:function(e,t,i){var s=this.collection.find(function(s){return s.get("ItemCode")===e&&s.get("UnitMeasureCode")===t&&s.get("LineNum")===i});return!s},LoadScroll:function(){var e=this;this.scrollAttrib={vScrollbar:!1,vScroll:!0,snap:!1,momentum:!0,hScrollbar:!0,onBeforeScrollStart:function(e){for(var t=e.target;1!=t.nodeType;)t=t.parentNode;"INPUT"!=t.tagName&&e.preventDefault()}},o.isBrowserMode?r.UseBrowserScroll("#serialLot-content"):this.myScroll?setTimeout(function(){e.scroll=new iScroll("serialLot-content",e.scrollAttrib),e.myScroll.refresh()},500):this.myScroll=new iScroll("serialLot-content",this.scrollAttrib)},ProcessAddedData:function(e){e.get("ItemType")!=l.ItemType.GiftCard&&e.get("ItemType")!=l.ItemType.GiftCertificate?this.ShowFilteredResult("SerializeLot",e.get("SerializeLot"),this.itemCode,this.uom,this.lineNum):this.ShowFilteredResult("ItemType",e.get("ItemType"),this.itemCode,this.uom,this.lineNum)},ProcessDeletedData:function(e){this.serialItemView.deleteSerialLot()},RefreshListView:function(t){e("#serialListNumber").listview("refresh"),e("#input-serialLot").val(""),this.HideElements()},Show:function(){switch(this.render(),r.IsNullOrWhiteSpace(this.type)){case!0:this.IsItemCodeExist(this.itemCode,this.uom,this.lineNum)||this.ShowGift(this.collection);break;case!1:this.ShowSerialLot(this.collection)}this.RefreshListView()},ShowCollection:function(e){var t=this;e&&e.length>0&&e.each(function(e){t.InitializeSerialItem(e)})},ShowFilteredResult:function(t,i,s,o,l){e("#serialListNumber").html("");var r=new h,a=this.collection.filter(function(e){return e.get(t)===i&&e.get("ItemCode")===s&&e.get("UnitMeasureCode")===o&&e.get("LineNum")===l});a&&("SerializeLot"!=t?this.DesignateSerial(t,r.reset(a)):this.DesignateSerial(t,this.collection))},ShowGift:function(e){var t=this;e&&e.length>0&&e.each(function(e){e.get("ItemType")===t.itemType&&e.get("ItemCode")===t.itemCode&&e.get("UnitMeasureCode")===t.uom&&e.get("LineNum")===t.lineNum&&t.InitializeSerialItem(e)})},ShowSerialLot:function(e){var t=this;e&&e.length>0&&e.each(function(e){r.IsNullOrWhiteSpace(e.get("UnitMeasureCode"))?e.get("ItemCode")===t.itemCode&&e.get("LineNum")===t.lineNum&&t.InitializeSerialItem(e):e.get("ItemCode")===t.itemCode&&e.get("UnitMeasureCode")===t.uom&&e.get("LineNum")===t.lineNum&&t.InitializeSerialItem(e)})}});return d});