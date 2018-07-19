define(["jquery","mobile","underscore","backbone","shared/global","shared/shared","view/18.1.0/pos/item/category/category","text!template/18.1.0/pos/item/category/categories.tpl.html","js/libs/swipe.min.js"],function(e,t,r,i,a,o,n,c){var s=4,l=0,g=0,h=i.View.extend({_template:r.template(c),events:{"tap #cat-arrow-right":"RightArrow_tapped","tap #cat-arrow-left":"LeftArrow_tapped"},initialize:function(){this.collection.bind("reset",this.LoadItems,this),_collection=this.collection},render:function(){this.$el.html(this._template)},LeftArrow_tapped:function(e){e.preventDefault(),e.stopPropagation(),a.isBrowserMode&&this._currentPage<=1||(this.swipe.prev(),o.FocusToItemScan(),this._currentPage--)},RightArrow_tapped:function(e){e.preventDefault(),e.stopPropagation(),a.isBrowserMode&&this._currentPage>=g||(this.swipe.next(),o.FocusToItemScan(),this._currentPage++)},InitializeSwipe:function(t){this._currentPage=1,this.swipe=new Swipe(document.getElementById(t),{callback:function(){var t=this.index+1;e("#categoryContainerBullet em").css("color","#CCC"),e("#"+t+"catBullet").css("color","#6D6D6D")}});var r=this.swipe.index+1;e("#"+r+"catBullet").css("color","#6D6D6D")},LoadItems:function(){this._currentPage=0;for(var e="",t=(_collection.length,0);a.CategoryDuplucates!=t;)_collection.each(function(r){r.get("CategoryCode")==e&&(t+=1,r.destroy()),e=r.get("CategoryCode")});l=_collection.length;var r=l/s;this.render(),g=Math.ceil(r);for(var i=1;i<=g;i++)this.PaginateCategories(4,i,l),l-=s;var o=this.$("#categoryList").attr("id");this.InitializeSwipe(o),a.isBrowserMode&&g>1&&this.ShowPageNavigator()},PaginateCategories:function(t,r,i){var a=_collection.paginate(t,r,i);e(".categoryListContainer").append("<li><div id=category-"+r+"/></li>"),e("#categoryContainerBullet").append("<em id="+r+"catBullet>&#8226;</em>");for(var o=0;o<a.length;o++){var c=a[o];this.categoryView=new n({model:c}),e("#category-"+r).append(this.categoryView.render().el);var s=c.get("FormattedCategoryDescription");s.length>25&&this.$(".cat-desc").attr("style","word-break: break-all"),3!==o&&6!==o&&9!==o&&12!==o||e("#"+c.cid).css({"margin-left":"0px","margin-right":"0px"})}},ShowPageNavigator:function(){e("#cat-arrow-right").removeAttr("style"),e("#cat-arrow-left").removeAttr("style")}});return h});