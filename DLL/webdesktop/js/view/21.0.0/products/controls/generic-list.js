define(["jquery","mobile","underscore","shared/shared","backbone","shared/global","model/base","collection/base","view/21.0.0/products/receivestocks/controls/generic-item","text!template/21.0.0/products/controls/generic-list-cid.tpl.html","js/libs/iscroll.js"],function(t,e,i,s,l,r,a,n,c,o){var h=l.View.extend({_genericListTemplate:i.template(o),events:{},btnAdd_click:function(t){t.preventDefault(),this.trigger("add")},btnSearch_click:function(t){t.preventDefault(),this.TriggerSearch()},btnClear_Click:function(e){e&&e.preventDefault(),t(this.ClassID.SearchInput).val(""),t(this.ClassID.SearchInput).focus()},txtSearch_Focus:function(){t(this.ClassID.ClearButton).fadeIn()},txtSearch_Blur:function(){t(this.ClassID.ClearButton).fadeOut()},txtSearch_keyup:function(t){13===t.keyCode&&this.TriggerSearch()},initialize:function(){this.Sorted=!0,this.DisplayField="ItemDescription",this.ExtDisplayField=null,this.PlaceHolder="Search",this.SelectedModel=null,this.FirstModel=null,this.$el.show(),this.BindEvents()},BindEvents:function(){var e=this,i="-"+this.cid;this.$el.addClass(this.cid),this.ClassID={SearchInput:"#txt-search"+i,SearchButton:"#btn-search"+i,ClearButton:"#btn-clear"+i,AddButton:"#btn-add"+i,List:"#list"+i,ListWrapper:"#list-wrapper"+i,CID:"."+this.cid},t(this.ClassID.CID).on("keyup",e.ClassID.SearchInput,function(t){e.txtSearch_keyup(t)}),t(this.ClassID.CID).on("focus",e.ClassID.SearchInput,function(t){e.txtSearch_Focus(t)}),t(this.ClassID.CID).on("blur",e.ClassID.SearchInput,function(t){e.txtSearch_Blur(t)}),t(this.ClassID.CID).on("tap",e.ClassID.AddButton,function(t){e.btnAdd_click(t)}),t(this.ClassID.CID).on("tap",e.ClassID.SearchButton,function(t){e.btnSearch_click(t)}),t(this.ClassID.CID).on("tap",e.ClassID.ClearButton,function(t){e.btnClear_Click(t)})},render:function(){return this.$el.html(this._genericListTemplate({PlaceHolder:this.PlaceHolder,cid:this.cid})),this.IsPopUp&&t("#list-header-"+this.cid).addClass("list-header-popup"),this.options.DisableAdd?t(this.ClassID.AddButton).addClass("ui-disabled"):t(this.ClassID.AddButton).removeClass("ui-disabled"),this},Show:function(){this.render(),this.DisplayItemList()},InitializeChildViews:function(){},SetDisplayField:function(t){this.DisplayField=t},SetExtDisplayField:function(t){this.ExtDisplayField=t},SetPlaceHolder:function(e){this.PlaceHolder=e,t(this.ClassID.SearchInput).attr("placeholder",e)},GetItemToSearch:function(){return t(this.ClassID.SearchInput).val()},ClearSearchBox:function(){t(this.ClassID.SearchInput).val("")},GetSelectedModel:function(){return this.SelectedModel},GetFirstModel:function(){return this.FirstModel},TriggerSearch:function(e){e&&t(this.ClassID.SearchInput).val(e),this.trigger("search")},TriggerItemSelect:function(t){this.SelectedModel=t,this.HighlightItem(t),this.trigger("selected")},HighlightItem:function(e){if(!this.IsPopUp){var i=e.get("ViewID");t(".list .item").removeClass("selectedItem"),t("#"+i).addClass("selectedItem")}},SelectByAttribute:function(t,e,i,s){if(t&&e&&this.collection){var l=null;if(this.collection.each(function(i){i.attributes[t]==e&&(l||(l=i))}),l){if(this.HighlightItem(l),i)return;if(this.myScroll){var r=l.get("ViewID");this.myScroll.scrollToElement("#"+r,100),this.myScroll.refresh()}}return s&&(this.SelectedModel=l),l}},RefreshiScroll:function(){r.isBrowserMode||(this.myScroll?(this.myScroll.refresh(),t(this.ClassID.List).height()<t(this.ClassID.ListWrapper).height()&&this.myScroll.scrollToElement("li:first-child",100)):this.myScroll=new iScroll("list-"+this.cid,{vScrollbar:!0,vScroll:!0,snap:!0,momentum:!0}))},RefreshList:function(t){t&&(this.collection=t),this.DisplayItemList()},DisplayItemList:function(){var e=this;if(this.SelectedModel=null,this.FirstModel=null,this.collection){t(this.ClassID.ListWrapper).html("<ul></ul>");var i="",s="",l=!1,e=this,r=function(){return new a},o=function(i){var s=new c;s.model=i,t(e.ClassID.ListWrapper+" ul").append(s.render().$el.html()),i.attributes.IsHeader||t("#"+s.cid).on("tap",function(){e.TriggerItemSelect(i)})};this._copiedCollection=new n,this._copiedCollection.reset(this.collection.models),this._copiedCollection.sortedField=this.DisplayField,this._copiedCollection.comparator=function(t){var e=this;return t.get(e.sortedField).toUpperCase()};var h=!0,d=function(t){if(s=t.get(e.DisplayField).substr(0,1).toUpperCase(),s!=i){var a=r();a.attributes.IsHeader=!0,a.attributes.IsItem=!1,a.attributes.IsColored=!1,a.attributes.DisplayText=s,a.attributes.IsSelected=!1,a.attributes.ExtDisplayField=null,o(a),l=!1}i=s,t.attributes.IsHeader=!1,t.attributes.IsItem=!0,t.attributes.IsColored=l,t.attributes.DisplayText=t.get(e.DisplayField),e.ExtDisplayField?t.attributes.ExtDisplayField=t.get(e.ExtDisplayField):t.attributes.ExtDisplayField=null,e.IsPopUp?t.attributes.IsSelected=!1:t.attributes.IsSelected=h,h&&(e.FirstModel=t),h=!1,o(t),l=!l};this.Sorted?this._copiedCollection.sort(this.DisplayField).each(d):this._copiedCollection.each(d),this.RefreshiScroll(),this.trigger("loaded")}}});return h});