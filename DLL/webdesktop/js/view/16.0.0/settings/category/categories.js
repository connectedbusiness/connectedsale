define(["jquery","mobile","underscore","backbone","shared/global","shared/service","shared/method","model/lookupcriteria","model/category","collection/preferences","collection/categories","collection/lookupcategories","view/16.0.0/settings/category/lookupcategories","view/16.0.0/settings/category/currentcategories","text!template/16.0.0/settings/category/categorypage.tpl.html","view/spinner"],function(e,t,i,o,r,n,s,c,a,l,u,g,h,C,p,d){function f(){return(65536*(1+Math.random())|0).toString(16).substring(1)}function y(){return f()+f()+"-"+f()+"-"+f()+"-"+f()+"-"+f()+f()+f()}var w=o.View.extend({_template:i.template(p),initialize:function(){this.render()},render:function(){this.$el.html(this._template),this.InitializeCurrentCategoryView()},InitializeCurrentCategoryView:function(){this.InitializeCategories(),this.categoriesView?(this.categoriesView.setElement(this.$("#currentCategory")),this.categoriesView.render()):this.categoriesView=new C({el:this.$("#currentCategory"),collection:this.currentCollection}),this.FetchPreference()},InitializeLookupCategoriesView:function(){this.InitializeLookupCategories(),this.lookupcategoriesView?(this.lookupcategoriesView.setElement(this.$("#lookupCategory")),this.lookupcategoriesView.render()):this.lookupcategoriesView=new h({el:this.$("#lookupCategory"),collection:this.lookupCategories,currentCollection:this.currentCollection}),this.FetchLookupCategories()},InitializeCategories:function(){this.currentCollection||(this.currentCollection=new u,this.currentCollection.on("setDefault",this.CurrentCategoryIsSelected,this),this.currentCollection.on("categoryRemoved",this.RemoveCurrentCategory,this))},InitializeLookupCategories:function(){this.lookupCategories||(this.lookupCategories=new g,this.lookupCategories.on("selected",this.LookupCategoryIsSelected,this))},InitializePreferences:function(){this.preferences||(this.preferences=new l)},FetchPreference:function(){var t=this;this.ShowSpinner(),e("#settings-category").trigger("create"),this.InitializePreferences(),this.preferences.url=r.ServiceUrl+n.POS+s.GETPREFERENCEBYWORKSTATION+r.POSWorkstationID,this.preferences.fetch({success:function(e,i){t.ResetCurrentCollection(i.Categories),t.InitializeLookupCategoriesView(),t.SetSelected(),t.HideActivityIndicator()},error:function(e,t,i){r.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.RequestError(t,"Error Retrieving Workstation Preferences")}})},ResetCurrentCollection:function(e){this.currentCollection.reset(e)},FetchLookupCategories:function(){var e=this,t=new c,i=100;t.set({StringValue:""}),t.url=r.ServiceUrl+n.PRODUCT+s.CATEGORYLOOKUP+i,t.save(null,{success:function(t,i){r.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.SetLookUpCategories(i.SystemCategories),e.EnableButton(),e.HideActivityIndicator()},error:function(e,t,i){r.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.RequestError(t,"Error Retrieving Categories")}})},SetLookUpCategories:function(e){var t=new u(e);t.each(function(e){var t=e.get("Description");e.set("FormattedCategoryDescription",t)}),this.lookupCategories.reset(t.models)},LookupCategoryIsSelected:function(e){this.CheckDupeCurrentCategory(e),this.ReloadListView()},CheckDupeCurrentCategory:function(e){var t=e.get("CategoryCode"),i=e.get("IsDefault"),o=e.get("FormattedCategoryDescription"),n=this.currentCollection.find(function(e){return e.get("CategoryCode")===t});n?console.log("category exist"):(this.lookupCategories.remove(e),this.currentCollection.add({CategoryCode:t,IsDefault:i,RowID:y(),WorkstationID:r.POSWorkstationID,FormattedCategoryDescription:o}),1===this.currentCollection.length&&this.CurrentCategoryIsSelected(this.currentCollection.at(0)))},ReloadListView:function(){e("#currentCategoryListContainer").listview("refresh"),e("#lookupCategoryListContainer").listview("refresh")},EnableButton:function(){e("#back-main").removeClass("setting-category-disable")},RemoveCurrentCategory:function(e){var t=e.get("IsDefault");this.CheckDupeLookupCategory(e),this.CheckIsDefault(t),this.SetSelected(),this.ReloadListView()},CheckDupeLookupCategory:function(t){var i=t.get("CategoryCode"),o=this.lookupCategories.find(function(e){return e.get("CategoryCode")===i});o?console.log("category exist"):(this.currentCollection.remove(t),t.set({IsDefault:!1}),this.lookupCategories.add(t),e("#lookupCategoryListContainer").empty(),this.lookupCategories.sort())},CheckIsDefault:function(e){e&&this.SetDefaultFirstCategory()},SetDefaultFirstCategory:function(){if(0!=this.currentCollection.length){var e=this.currentCollection.at(0);e.set({IsDefault:!0})}},SetSelected:function(){this.currentCollection.each(function(t){t.get("IsDefault")===!0&&(e("#currentCategoryListContainer li > img").remove(),e("#currentCategoryListContainer li").removeClass("ui-li-has-icon"),e("<img class='ui-li-icon' style ='height:25px;width:27px;'/>").attr({src:"img/check@2x.png"}).prependTo(e("#"+t.cid)),e("#currentCategoryListContainer").listview("refresh"))})},CurrentCategoryIsSelected:function(e){e.get("IsDefault")!==!0&&(this.ResetToNonDefault(e),e.set({IsDefault:!0}),this.RemoveCheckImage(e))},ResetToNonDefault:function(e){this.currentCollection.each(function(t){t!=e&&t.set({IsDefault:!1})})},RemoveCheckImage:function(t){e("#currentCategoryListContainer li > img").remove(),e("#currentCategoryListContainer li").removeClass("ui-li-has-icon"),e("<img class='ui-li-icon' style ='height:17px;width:18px;' src='img/check@2x.png'/>").prependTo(e("#"+t.cid)),e("#currentCategoryListContainer").listview("refresh")},Save:function(){if(this.currentCollection&&this.preferences&&0!==this.preferences.length){var e=this,t=this.preferences.at(0);t.set({Categories:this.currentCollection.toJSON()});var e=this;t.url=r.ServiceUrl+n.POS+s.UPDATEPREFERENCE,t.save(null,{success:function(t,i){e.SaveCompleted()},error:function(e,t,i){r.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),e.RequestError(t,"Error Saving Selected Categories")}})}},SaveCompleted:function(){r.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),this.trigger("SaveCompleted",this)},ShowSpinner:function(){e("#spin").remove(),e("#main-transaction-blockoverlay").show(),target=document.getElementById("settings-category"),this.ShowActivityIndicator(target),e("<h5>Loading...</h5>").appendTo(e("#spin"))},ShowActivityIndicator:function(t){e("<div id='spin'></div>").appendTo(t);var i=document.getElementById("spin");_spinner=d,_spinner.opts.color="#fff",_spinner.opts.lines=13,_spinner.opts.length=7,_spinner.opts.width=4,_spinner.opts.radius=10,_spinner.opts.top="auto",_spinner.opts.left="auto",_spinner.spin(i)},HideActivityIndicator:function(){r.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),_spinner=d,_spinner.stop(),e("#spin").remove()}});return w});