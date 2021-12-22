define(["jquery","mobile","underscore","backbone","shared/global","shared/shared","view/20.1.0/settings/category/lookupcategory","text!template/20.1.0/settings/category/lookupcategories.tpl.html","js/libs/iscroll.js"],function(e,t,o,i,r,n,a,s){var l,c,h=i.View.extend({_template:o.template(s),initialize:function(){this.collection.bind("reset",this.LoadItems,this),this.collection.bind("add",this.AddOneItem,this),l=this.collection,c=this.options.currentCollection,this.render()},render:function(){this.$el.html(this._template),this.$("#lookupCategoryListContainer").empty(),e("#lookupCategory").trigger("create")},LoadItems:function(){this.CheckDupe(),this.GetCategoryItem(l),r.isBrowserMode?(n.UseBrowserScroll("#category-left-pane-content"),n.UseBrowserScroll("#category-right-pane-content")):(this.myScroll=new iScroll("category-left-pane-content"),this.myScroll=new iScroll("category-right-pane-content"))},CheckDupe:function(){c.each(this.RemoveDupe,this)},AddOneItem:function(e){this.view=new a({model:e}),this.$("#lookupCategoryListContainer").append(this.view.render().el)},RemoveDupe:function(e){l.each(function(t){e.get("CategoryCode")===t.get("CategoryCode")&&l.remove(t)})},GetCategoryItem:function(t){var i=t.pluck("FormattedCategoryDescription"),r=o.groupBy(i,function(e){return e.charAt(0).toUpperCase()});for(var n in r)e("#lookupCategoryListContainer").append("<li data-role='list-divider' data-id="+n+">"+n+"</li>"),t.each(function(e){var t=e.get("FormattedCategoryDescription");t.charAt(0).toUpperCase()===n.toUpperCase()&&this.RenderCollection(e)}.bind(this));e("#lookupCategoryListContainer").listview("refresh")},RenderCollection:function(e){this.categoryView=new a({model:e}),this.$("#lookupCategoryListContainer").append(this.categoryView.render().el)}});return h});