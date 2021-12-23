define(["jquery","mobile","underscore","backbone","shared/global","model/base","model/lookupcriteria","collection/base","view/21.0.0/products/openingbalance/controls/ob-item","text!template/21.0.0/products/controls/generic-list.tpl.html","js/libs/iscroll.js"],function(t,e,i,l,r,s,n,c,o,a){var h={SearchInput:"#txt-search",ClearButton:"#btn-clear"},u="ConvertedTransactionDate",d=l.View.extend({_genericListTemplate:i.template(a),events:{"tap #btn-search":"btnSearch_click","keypress #txt-search":"txtSearch_keypress","blur #txt-search":"txtSearch_Blur","focus #txt-search":"txtSearch_Focus","tap #btn-add":"btnAdd_click","tap #btn-clear":"btnClear_Click"},btnAdd_click:function(t){t.preventDefault(),this.trigger("add")},btnSearch_click:function(t){t.preventDefault(),this.TriggerSearch()},btnClear_Click:function(e){e&&e.preventDefault(),t(h.SearchInput).val(""),t(h.SearchInput).focus()},txtSearch_Focus:function(){t(h.ClearButton).fadeIn()},txtSearch_Blur:function(){t(h.ClearButton).fadeOut()},txtSearch_keypress:function(t){13===t.keyCode&&this.TriggerSearch()},initialize:function(){this.DisplayField="ItemDescription",this.ExtDisplayField=null,this.PlaceHolder="Search",this.SelectedModel=null,this.FirstModel=null,this.$el.show()},render:function(){return this.$el.html(this._genericListTemplate({PlaceHolder:this.PlaceHolder})),this.options.DisableAdd?t("#btn-add").addClass("ui-disabled"):t("#btn-add").removeClass("ui-disabled"),this},Show:function(){this.render(),this.DisplayItemList()},InitializeChildViews:function(){},SetDisplayField:function(t){this.DisplayField=t},SetExtDisplayField:function(t){this.ExtDisplayField=t},SetPlaceHolder:function(t){this.PlaceHolder=t},GetItemToSearch:function(){return t(h.SearchInput).val()},ClearSearchBox:function(){t(h.SearchInput).val("")},GetSelectedModel:function(){return this.SelectedModel},GetFirstModel:function(){return this.FirstModel},TriggerSearch:function(e){e&&t(h.SearchInput).val(e),this.trigger("search")},TriggerItemSelect:function(t){this.SelectedModel=t,this.HighlightItem(t),this.trigger("selected")},HighlightItem:function(e){var i=e.get("ViewID");t(".list .item").removeClass("selectedItem"),t("#"+i).addClass("selectedItem")},SelectByAttribute:function(t,e,i){if(t&&e&&this.collection){var l=null;if(this.collection.each(function(i){i.attributes[t]==e&&(l||(l=i))}),l){if(this.HighlightItem(l),i)return;if(this.myScroll){var r=l.get("ViewID");this.myScroll.scrollToElement("#"+r,100),this.myScroll.refresh()}}}},RefreshiScroll:function(){r.isBrowserMode||(this.myScroll?(this.myScroll.refresh(),t("#list").height()<t("#list-wrapper").height()&&this.myScroll.scrollToElement("li:first-child",100)):this.myScroll=new iScroll("list",{vScrollbar:!0,vScroll:!0,snap:!0,momentum:!0}))},RefreshList:function(t){t&&(this.collection=t),this.DisplayItemList()},DisplayItemList:function(){if(this.SelectedModel=null,this.FirstModel=null,this.collection){t("#list-wrapper").html("<ul></ul>");var e="",i="",l=!1,n=this,a=!0,h=function(){return new s},d=function(e){var i=new o;i.model=e,t("#list-wrapper ul").append(i.render().$el.html()),e.attributes.IsHeader||t("#"+i.cid).on("tap",function(){n.TriggerItemSelect(e)})};this._copiedCollection=new c,this._copiedCollection.reset(this.collection.models),this._copiedCollection.sortedField=u,this._copiedCollection.each(function(t){if(i=t.get(u),i!=e){var s=h();s.attributes.IsHeader=!0,s.attributes.IsItem=!1,s.attributes.IsColored=!1,s.attributes.DisplayText=i,s.attributes.IsSelected=!1,s.attributes.ExtDisplayField=null,s.attributes.Type="ConvertedTransactionDate",d(s),l=!1}e=i,t.attributes.IsHeader=!1,t.attributes.IsItem=!0,t.attributes.IsColored=l,t.attributes.DisplayText=t.get(u),t.attributes.Type="ConvertedTransactionDate",t.attributes.Quantity=t.get("Quantity"),t.attributes.Cost=t.get("Cost").toFixed(2),t.attributes.UoM=t.get("UnitMeasureCode"),t.attributes.CurrencySymbol=r.CurrencySymbol,t.attributes.IsSelected=a,a&&(this.FirstModel=t),a=!1,d(t),l=!l}),r.isBrowserMode||this.RefreshiScroll()}}});return d});