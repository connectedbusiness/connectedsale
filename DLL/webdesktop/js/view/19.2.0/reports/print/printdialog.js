define(["backbone","shared/global","shared/service","shared/method","shared/shared","model/base","model/lookupcriteria","collection/base","collection/reportcriterias","view/19.2.0/reports/print/reportcriteria/options","view/19.2.0/reports/print/reportcriteria/criteria","text!template/19.2.0/reports/print/printdialog.tpl.html","text!template/19.2.0/reports/print/printdialog/criteria-options.tpl.html","text!template/19.2.0/reports/print/printdialog/criteria-items.tpl.html","text!template/19.2.0/reports/print/printdialog/criteria-items-content.tpl.html","js/libs/iscroll.js","js/libs/format.min.js"],function(i,t,e,r,a,o,l,s,n,c,h,p,d,u,C){var m,f=".dialog-left-pane",S=".dialog-right-pane",O="#printDialog-spinner",g="#reportCriteriaTableContainer",w=i.View.extend({_template:_.template(p),_critriaOptionsTemplate:_.template(d),_criteriaItemsTemplate:_.template(u),_criteriaItemsContentTemplate:_.template(C),events:{"tap #btnCancel":"Close","tap #btnApply ":"Apply_Tap","keyup  #txtSearch ":"FindCriteria","keyup .searchField #txtSearch ":"ShowClearButton","focus .searchField #txtSearch ":"ShowClearButton","blur .searchField #txtSearch ":"HideClearButton","tap .searchField .clearTxt ":"ClearText","tap #btnSearch ":"btnSearch_Tap"},initialize:function(){this.render()},Close:function(){t.isPrintDialog=!1,$(modalBg).hide(),$(O).hide(),this.$el.hide()},render:function(){return m=this,this.$el.html(this._template()),$(modalBg).show(),this},Show:function(){$(modalBg).show(),t.isPrintDialog=!0,this.$el.show()},InitializeCriteriaCollection:function(){this.criteriaCollection=new n,this.criteriaCollection.reset(),this.criteriaCollectionCache=new n,this.criteriaCollectionCache.reset()},InitializeChildViews:function(i,t){this.InitializeCriteriaCollection(),this.InitializeCriteriaOptions(i,t),this.InitializeCriteriaItems(),this.isLoaded=!0,this.reportCode=t},InitializeCriteriaOptions:function(i,a){this.$(f).html(this._critriaOptionsTemplate());var l=this,s=i,n=a;this.filterModel=new o,this.filterModel.set({StringValue:s,ReportCode:n}),this.filterModel.url=t.ServiceUrl+e.POS+r.REPORTFILTERCRITERIA,this.filterModel.save(null,{success:function(i,e){t.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),l.LoadFilterCriteriaOptions(e)}})},ClearText:function(){$(".searchField #txtSearch").val("")},ShowClearButton:function(){$(".searchField .clearTxt").show()},HideClearButton:function(){$(".searchField .clearTxt").hide()},btnSearch_Tap:function(i){this.FindCriteria(i,"find")},FindCriteria:function(i,t){if(13===i.keyCode||!this.IsNullOrWhiteSpace(t)){var e="#criteriaOptions";this.criteriaOptions=this.criteriaOptionsCache;var r=this.$("#txtSearch").val().toString().toUpperCase(),a=new s;this.IsNullOrWhiteSpace(r)?this.LoadFilterCriteriaOptions():(this.criteriaOptions.each(function(i){var t=i.get("ColumnName").toString().toUpperCase();t.indexOf(r)>-1&&a.add(i)}),a.length>0?this.LoadFilterCriteriaOptions("",a):this.$(e).html(""))}},LoadFilterCriteriaOptions:function(i,e){if(this.IsNullOrWhiteSpace(this.criteriaOptions)){this.criteriaOptions=new s,this.criteriaOptions.reset(i.ReportViews);var r=null;this.criteriaOptions.each(function(i){"@IsPrintFromPOS"==i.get("ColumnName")&&(r=i)}),r&&this.criteriaOptions.remove(r),console.log(this.reportCode),this.criteriaOptionsCache=this.criteriaOptions}this.IsNullOrWhiteSpace(e)||(this.criteriaOptions=e);var o="#criteriaOptions";this.$(o).html("");var l=this;this.SortVar="ColumnName",this.criteriaOptions.sortedField=this.SortVar,this.criteriaOptions.comparator=function(i){return i.get(l.SortVar)},console.log(this.criteriaOptions.length),this.criteriaOptions.sort(this.SortVar).each(function(i){l.AddFilterOptions(i)}),this.criteriaCollectionCache.length>0&&(t.isBrowserMode?a.UseBrowserScroll("#reportCriteriaTableContainer"):this.LoadCriteriaScroll()),this.IsNullOrWhiteSpace(i)||this.LoadDefaultFilters(i),t.isBrowserMode?a.UseBrowserScroll("#criteriaOptionsTable"):this.LoadOptionsScroll()},AddFilterOptions:function(i){var t="#criteriaOptions";this.filterOptionsView=new c({el:$(t),model:i}),this.filterOptionsView.on("AddCriteria",this.AddCriteria,this),this.filterOptionsView.InitializeChildViews()},LoadDefaultFilters:function(i){if(!a.IsNullOrWhiteSpace(i)){var t=new s;t.reset(i.DefaultFilterCriteria);var e=this,r=new o;t.length>0&&t.each(function(i){var t=i.get("Parameter"),a=i.get("Value");r=e.criteriaOptions.find(function(i){i.get("ColumnName")==t&&("?"!=a&&i.set({DefaultValue:a}),e.filterOptionsView.trigger("AddCriteria",i))})}),this.LoadFilterCriteriaOptions()}},AddCriteria:function(i){var t="#criteriaItems";0==this.criteriaCollectionCache.length&&($(g).html(""),$(g).html(this._criteriaItemsContentTemplate()),console.log("ReinitializeCriteriaTable")),this.criteriaView=new h({el:$(t),model:i}),this.criteriaView.on("RemoveCriteria",this.RemoveCriteria,this),this.criteriaView.on("updateLineItem",this.UpdateCriteria,this),this.criteriaOptions.remove(i),this.criteriaOptionsCache.remove(i),this.criteriaCollection.add(i),this.criteriaCollectionCache.add(i),this.LoadFilterCriteriaOptions(),this.criteriaView.InitializeChildViews()},UpdateCriteria:function(i){this.criteriaCollectionCache.each(function(t){t.get("ColumnName")==i.get("ColumnName")&&t.set(i)})},RemoveCriteria:function(i){this.criteriaOptions.add(i),this.criteriaOptionsCache.add(i),this.LoadFilterCriteriaOptions(),this.criteriaCollectionCache.remove(i)},InitializeCriteriaItems:function(){this.$(S).html(this._criteriaItemsTemplate())},IsNullOrWhiteSpace:function(i){return!i||(""===i||null===i||void 0===i)},LoadOptionsScroll:function(){this.IsNullOrWhiteSpace(this.optionsScroll)?this.optionsScroll=new iScroll("criteriaOptionsTable",{vScrollbar:!0,vScroll:!0,snap:!1,momentum:!0}):this.optionsScroll.refresh();var i=this;setTimeout(function(){i.optionsScroll.refresh()},1e3)},RefreshCriteriaScroll:function(){this.criteriaScroll=new iScroll("reportCriteriaTableContainer",{vScrollbar:!0,vScroll:!0,snap:!1,momentum:!0,hideScrollbar:!1,onBeforeScrollStart:function(i){for(var t=i.target;1!=t.nodeType;)t=t.parentNode;"SELECT"!=t.tagName&&"INPUT"!=t.tagName&&"TEXTAREA"!=t.tagName&&i.preventDefault()}})},LoadCriteriaScroll:function(){this.IsNullOrWhiteSpace(this.criteriaScroll)?this.RefreshCriteriaScroll():this.criteriaScroll.refresh();var i=this;setTimeout(function(){i.criteriaScroll.refresh()},1e3)},ValidateInput:function(i){var t=".dialog-message",e=this,r="",a=!0,o="";return i.each(function(i){var t=i.get("CriteriaValue");e.IsNullOrWhiteSpace(o)&&e.IsNullOrWhiteSpace(t)&&t!==!1&&(o=i.get("ColumnName"),a=!1)}),this.IsNullOrWhiteSpace(o)||(r="   "+o+" is Required.",$(t+"> span").html(r),$(t).slideDown("fast"),setTimeout(function(){$(t).slideUp("fast")},2e3)),a},Apply_Tap:function(i){i.preventDefault(),this.ValidateInput(this.criteriaCollectionCache)&&(this.trigger("Apply",this.reportCode,this.criteriaCollectionCache),$(O).show())}});return w});