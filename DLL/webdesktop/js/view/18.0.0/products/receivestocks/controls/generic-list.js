define(["jquery","mobile","underscore","backbone","shared/global","model/base","collection/base","view/16.0.0/products/controls/generic-item","text!template/16.0.0/products/controls/generic-list.tpl.html","js/libs/iscroll.js","js/libs/format.min.js"],function(t,e,i,l,r,s,n,a,c){var o={SearchInput:"#txt-search",ClearButton:"#btn-clear"},h=l.View.extend({_genericListTemplate:i.template(c),events:{"tap #btn-search":"btnSearch_click","keypress #txt-search":"txtSearch_keypress","blur #txt-search":"txtSearch_Blur","focus #txt-search":"txtSearch_Focus","tap #btn-add":"btnAdd_click","tap #btn-clear":"btnClear_Click"},btnAdd_click:function(t){t.preventDefault(),this.trigger("add")},btnSearch_click:function(t){t.preventDefault(),this.TriggerSearch()},btnClear_Click:function(e){e&&e.preventDefault(),t(o.SearchInput).val(""),t(o.SearchInput).focus()},txtSearch_Focus:function(){t(o.ClearButton).fadeIn()},txtSearch_Blur:function(){t(o.ClearButton).fadeOut()},txtSearch_keypress:function(t){13===t.keyCode&&this.TriggerSearch()},initialize:function(){this.Sorted=!0,this.DisplayField="ItemDescription",this.ExtDisplayField=null,this.PlaceHolder="Search",this.SelectedModel=null,this.FirstModel=null,this.$el.show()},render:function(){return this.$el.html(this._genericListTemplate({PlaceHolder:this.PlaceHolder})),this.options.DisableAdd?t("#btn-add").addClass("ui-disabled"):t("#btn-add").removeClass("ui-disabled"),this},Show:function(){this.render(),this.DisplayItemList()},InitializeChildViews:function(){},SetDisplayField:function(t){this.DisplayField=t},SetExtDisplayField:function(t){this.ExtDisplayField=t},SetPlaceHolder:function(t){this.PlaceHolder=t},GetItemToSearch:function(){return t(o.SearchInput).val()},ClearSearchBox:function(){t(o.SearchInput).val("")},GetSelectedModel:function(){return this.SelectedModel},GetFirstModel:function(){return this.FirstModel},TriggerSearch:function(e){e&&t(o.SearchInput).val(e),this.trigger("search")},TriggerItemSelect:function(t){this.SelectedModel=t,this.HighlightItem(t),this.trigger("selected")},HighlightItem:function(e){var i=e.get("ViewID");t(".list .item").removeClass("selectedItem"),t("#"+i).addClass("selectedItem")},SelectByAttribute:function(t,e,i){if(t&&e&&this.collection){var l=null;if(this.collection.each(function(i){i.attributes[t]==e&&(l||(l=i))}),l){if(this.HighlightItem(l),i)return;if(this.myScroll){var r=l.get("ViewID");this.myScroll.scrollToElement("#"+r,100),this.myScroll.refresh()}}}},RefreshiScroll:function(){r.isBrowserMode||(this.myScroll?(this.myScroll.refresh(),t("#list").height()<t("#list-wrapper").height()&&this.myScroll.scrollToElement("li:first-child",100)):this.myScroll=new iScroll("list",{vScrollbar:!0,vScroll:!0,snap:!0,momentum:!0}))},RefreshList:function(t){t&&(this.collection=t),this.DisplayItemList()},JsonToAspDate:function(t){var e=Date.parse(t),i=new Date(e),l=i.getMonth(),r=i.getDate(),s=i.getFullYear();return i=Date.UTC(s,l,r),i="/Date("+i+")/"},JSONtoDate:function(t){var e="YYYY-MM-DD",i=moment(t).format(e);return i},DisplayItemList:function(){if(this.SelectedModel=null,this.FirstModel=null,this.collection){t("#list-wrapper").html("<ul></ul>");var e="",i="",l=!1,r=this,c=function(){return new s},o=function(e){var i=new a;i.model=e,t("#list-wrapper ul").append(i.render().$el.html()),e.attributes.IsHeader||t("#"+i.cid).on("tap",function(){r.TriggerItemSelect(e)})};this._copiedCollection=new n,this._copiedCollection.reset(this.collection.models),this._copiedCollection.sortedField=this.DisplayField,this._copiedCollection.comparator=function(t){var e=this;return t.get(e.sortedField)};var h=!0,r=this,d=function(t){var s=r.JSONtoDate(t.get("TransactionDate"));if(i=s,i!=e){var n=c();n.attributes.IsHeader=!0,n.attributes.IsItem=!1,n.attributes.IsColored=!1,n.attributes.DisplayText=i,n.attributes.IsSelected=!1,n.attributes.ExtDisplayField=null,o(n),l=!1}e=i,t.attributes.IsHeader=!1,t.attributes.IsItem=!0,t.attributes.IsColored=l,t.attributes.DisplayText=t.get(r.DisplayField),r.ExtDisplayField?t.attributes.ExtDisplayField=t.get(r.ExtDisplayField):t.attributes.ExtDisplayField=null,t.attributes.IsSelected=h,h&&(r.FirstModel=t),h=!1,o(t),l=!l};this.Sorted?this._copiedCollection.sort(this.DisplayField).each(d):this._copiedCollection.each(d),this.RefreshiScroll(),this.trigger("loaded")}}});return h});