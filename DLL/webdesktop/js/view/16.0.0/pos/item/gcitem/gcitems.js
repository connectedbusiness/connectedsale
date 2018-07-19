define(["jquery","mobile","backbone","underscore","shared/enum","shared/shared","shared/global","view/16.0.0/pos/item/gcitem/gcitem","text!template/16.0.0/pos/item/gcitem/gcitems.tpl.html"],function(e,t,i,o,a,n,r,l,s){var c=i.View.extend({template:o.template(s),generatedSerial:0,events:{"tap #done-gcList":"done_tap","tap #cancel-gcList":"close_tap"},afterGeneration:function(){this.selectedModel.set({IsSerialGenerated:!0}),this.selectedModel=null,this.generatedSerial++},close_tap:function(t){t.preventDefault(),e("#main-transaction-blockoverlay").hide(),this.Hide()},done_tap:function(t){if(t.preventDefault(),this.totalGCItems>=1&&(0===this.generatedSerial||this.totalGCItems!=this.generatedSerial))switch(r.TransactionType){case a.TransactionType.SalesRefund:navigator.notification.alert("You must include serial(s) for the item(s) to be returned.",null,"Action not allowed","OK");break;default:navigator.notification.alert("You must generate serial(s) for the item(s) in order to proceed.",null,"Action not allowed","OK")}else e("#main-transaction-blockoverlay").hide(),this.Hide()},initialize:function(){this.serialCollection=this.options.serialCollection,this.render(),this.LoopGCItems(),e("#gcListContainer").listview("refresh")},render:function(){this.CountGCandSerial(),this.$el.html(this.template),r.TransactionType===a.TransactionType.SalesRefund?this.totalGCItems>=1&&this.totalSerialItems>=1?(this.$("#gclookup-title").text("Serial Generator"),this.$("#gclookup-info").append("<p>Item(s) in cart that needs serial generation.</p><p>Tap on each item to generate serial or lot number(s) to return.</p>")):this.totalGCItems>=1&&0===this.totalSerialItems?this.$("#gclookup-info").append("<p>Item(s) in cart that are Gift Card and Gift Certificate</p><p>Tap on each item to generate serial to return.</p>"):0===this.totalGCItems&&this.totalSerialItems>1&&(this.$("#gclookup-title").text("Serial and Lot"),this.$("#gclookup-info").append("<p>Item(s) in cart that have Serial or Lot as SerializeLot type.</p><p>Tap on each item to generate serial or lot number(s) to return.</p>")):this.totalGCItems>=1&&this.totalSerialItems>=1?(this.$("#gclookup-title").text("Serial Generator"),this.$("#gclookup-info").append("<p>Item(s) in cart that needs serial generation.</p><p>Tap on each item to generate serial.</p>")):this.totalGCItems>=1&&0===this.totalSerialItems?this.$("#gclookup-info").append("<p>Item(s) in cart that are Gift Card and Gift Certificate</p><p>Tap on each item to generate serial.</p>"):0===this.totalGCItems&&this.totalSerialItems>1&&(this.$("#gclookup-title").text("Serial and Lot"),this.$("#gclookup-info").append("<p>Item(s) in cart that have Serial or Lot as SerializeLot type.</p><p>Tap on each item to generate serial or lot number(s).</p>")),e("#gcListContainer").listview(),this.Hide(),this.$("#gclookup-content ").attr("style","height:508px;")},CountGCandSerial:function(){var e=this.collection.filter(function(e){return e.get("SerializeLot")===a.SerialLotType.Serial||e.get("SerializeLot")===a.SerialLotType.Lot}),t=this.collection.filter(function(e){return e.get("ItemType")===a.ItemType.GiftCard||e.get("ItemType")===a.ItemType.GiftCertificate});this.totalSerialItems=e.length,this.totalGCItems=t.length},Hide:function(){this.$("#gclookup").hide()},LoopGCItems:function(){var e=this,t=!1;this.collection.each(function(i){if(!n.IsNullOrWhiteSpace(e.serialCollection)&&e.serialCollection.length>0){var o=e.serialCollection.filter(function(e){return e.get("ItemCode")===i.get("ItemCode")&&e.get("UnitMeasureCode")===i.get("UnitMeasureCode")});n.IsNullOrWhiteSpace(o)||o.length!==i.get("QuantityOrdered")*i.get("UnitMeasureQty")?t=!1:(t=!0,e.generatedSerial++)}e.RenderItems(i,t)}),r.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),r.isBrowserMode?n.UseBrowserScroll("#gclookup-content"):n.Printer.LoadScroll(this.myScroll,"gclookup-content",{vScrollbar:!1,vScroll:!0,snap:!1,momentum:!0})},ProcessSelected:function(e){this.selectedModel=e,this.trigger("generateSerial",e)},RenderItems:function(t,i){var o=new l({model:t});o.on("selected",this.ProcessSelected,this),e("#gcListContainer").append(o.render().el),i&&o.disableItem(t)},Show:function(){this.$("#gclookup").show(),e("#main-transaction-blockoverlay").show()}});return c});