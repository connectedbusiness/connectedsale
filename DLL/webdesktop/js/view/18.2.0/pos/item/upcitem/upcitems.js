define(["backbone","shared/global","shared/service","shared/method","shared/shared","shared/enum","model/base","collection/base","view/18.2.0/pos/item/upcitem/upcitem","text!template/18.2.0/pos/item/upcitem/upcitems.tpl.html"],function(e,t,i,o,a,c,n,l,r,s){var p=!1,h="#txtSearchUpcItem",m=e.View.extend({_template:_.template(s),events:{"tap #cmdDone-upcitem":"Tap_Done","tap #cmdCancel-upcitem":"Tap_Cancel","tap #chkSelectAll":"SelectAllUpcChange","keypress #txtSearchUpcItem":"SearchUpc","focus #txtSearchUpcItem ":"ShowClearButton","blur #txtSearchUpcItem ":"HideClearButton","tap #clearUpcText ":"ClearText"},initialize:function(){this.render()},render:function(){this.$el.html(this._template()),this.trigger("create"),this.options.parentEl.show()},ClearText:function(){$(h).val("")},ShowClearButton:function(){$("#clearUpcText").show()},HideClearButton:function(){$("#clearUpcText").fadeOut()},InitializeChildViews:function(e){$(".upcItemHeader").text('Items with "'+e+'" UPC Code.'),this.LoadUpcItems(this.collection),this.RefreshScroll()},LoadUpcItems:function(e){var t=this,i=e.pluck("ItemName"),o=_.groupBy(i,function(e){return e.charAt(0).toUpperCase()});for(var a in o)$("#upcItemList").append("<ol class='gradient-black'>"+a+"</ol>"),e.each(function(e){e.set({IsSelected:!1});var i=e.get("ItemName");i.charAt(0).toUpperCase()===a.toUpperCase()&&(t.upcItemView=new r({el:$("#upcItemList"),model:e}),t.upcItemView.InitializeChildViews(),t.upcItemView.on("UpdateItemState",t.UpdateItemState,t))})},UpdateItemState:function(e){var t=e.get("ItemCode"),i=e.get("IsSelected"),o=e.get("UnitMeasureCode");this.collection.each(function(e){t==e.get("ItemCode")&&o==e.get("UnitMeasureCode")&&e.set({IsSelected:i})})},Tap_Done:function(e){e.preventDefault();var t=this.collection.filter(function(e){return e.get("IsSelected")===!0});this.Hide(),this.trigger("AddSelectedItem",new l(t))},Hide:function(e){$("#main-transaction-blockoverlay").hide(),console.log("hide Overlay!"),this.options.parentEl.hide()},Tap_Cancel:function(e){e.preventDefault(),this.Hide(!0)},SelectAllUpcChange:function(e){e.preventDefault(),p=a.CustomCheckBoxChange("#chkSelectAll",p)},SearchUpc:function(e){var t=$(h).val().toString().toUpperCase();if(this.ShowClearButton(),13===e.keyCode){var i="#upcItemList",o=new l;a.IsNullOrWhiteSpace(t)?(this.$(i).html(""),this.LoadUpcItems(this.collection)):(this.collection.each(function(e){var i=e.get("ItemName").toString().toUpperCase(),a=e.get("ItemDescription").toString().toUpperCase(),c=e.get("ItemCode").toString().toUpperCase();(i.indexOf(t)>-1||a.indexOf(t)>-1||c.indexOf(t)>-1)&&o.add(e)}),o.length>0?(this.$(i).html(""),this.LoadUpcItems(o)):this.$(i).html(""))}},RefreshScroll:function(){if(t.isBrowserMode)$("#upcItemlistContainer").css({"overflow-x":"hidden","overflow-y":"auto"});else{this.myScroll?this.myScroll.refresh():this.myScroll=new iScroll("upcItemlistContainer",{vScrollbar:!0,vScroll:!0,snap:!1,momentum:!0,hScrollbar:!1,hScroll:!1,onBeforeScrollStart:function(e){for(var t=e.target;1!=t.nodeType;)t=t.parentNode;"SELECT"!=t.tagName&&"INPUT"!=t.tagName&&"TEXTAREA"!=t.tagName&&e.preventDefault()}});var e=this;setTimeout(function(){e.myScroll.refresh()},1e3)}}});return m});