define(["backbone","shared/global","shared/service","shared/method","shared/shared","model/base","model/lookupcriteria","collection/base","view/21.0.0/reports/list/reportlist-content","text!template/21.0.0/reports/list/reportlist.tpl.html","text!template/21.0.0/reports/list/reportlistcontent.tpl.html"],function(e,t,r,o,i,s,l,n,a,c,h){var p="#reportList > ul",d=".no-record-found",u=e.View.extend({_template:_.template(c),_reportListTemplate:_.template(h),events:{"keypress #searchReport #txtSearch":"SearchReport","tap #btn-Search":"SearchBtn_Tap","keyup #searchReport #txtSearch ":"ShowClearButton","focus #searchReport #txtSearch ":"ShowClearButton","blur #searchReport #txtSearch ":"HideClearButton","tap #searchReport .clearTxt ":"ClearText"},initialize:function(){this.render()},render:function(){return this.$el.html(this._template),this},InitializeChildViews:function(){this.ShowReportList()},SearchBtn_Tap:function(e){e.preventDefault();var t=$("#searchReport #txtSearch").val();this.ShowReportList(t)},ClearText:function(){$("#searchReport #txtSearch").val(""),$("#searchReport #txtSearch").focus()},ShowClearButton:function(){$("#searchReport .clearTxt").fadeIn()},HideClearButton:function(){$("#searchReport .clearTxt").fadeOut()},SearchReport:function(e){var t=$("#"+e.target.id).val();13==e.keyCode&&this.ShowReportList(t)},SelectedItem:function(e){0==!e.get("ReportCode")&&this.trigger("changePreview",e)},IsNullOrWhiteSpace:function(e){return!e||(""===e||null===e||void 0===e)},ShowReportList:function(e){var i=this;$(p).html(""),this.reportModel=new s,this.IsNullOrWhiteSpace(e)||this.reportModel.set({StringValue:e}),this.reportModel.url=t.ServiceUrl+r.POS+o.REPORTLOOKUP+100,this.reportModel.save(null,{success:function(e,r){t.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),i.ReportListLoadComplete(r)},error:function(e,r){t.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),i.ReportLoadError()}})},ReportLoadError:function(){$(d).show(),this.trigger("noRecordFound")},ReportListLoadComplete:function(e){$(d).hide();this.reportCollection?(this.reportCollection.reset(),this.reportCollection=new n):this.reportCollection=new n,e&&this.LoadItems(e),this.IsNullOrWhiteSpace(e.ReportViews)&&this.ReportLoadError(),t.isBrowserMode?i.UseBrowserScroll("#reportList"):this.LoadScroll()},LoadItems:function(e){var t=this;$("#print-preview-container > tbody").html(""),this.firstModel="",this.reportCollection.reset(e.ReportViews),this.reportCollection.pluck("ReportName");var r=this.reportCollection,o=r.pluck("ReportName"),i=_.groupBy(o,function(e){return e.charAt(0).toUpperCase()});for(var l in i)$(p).append("<ol>"+l+"</ol>"),r.each(function(e){""==t.firstModel&&(t.firstModel=new s,t.firstModel.set(e));var r=e.get("ReportName");r.charAt(0).toUpperCase()===l.toUpperCase()&&t.AppendItem(e)});this.IsNullOrWhiteSpace(this.firstModel)||this.SelectFirstModel(this.firstModel)},AppendItem:function(e){this.reportListContentView=new a({el:$(p),model:e}),this.reportListContentView.SelectFirstModel(this.firstModel),this.reportListContentView.on("selected",this.SelectedItem,this),this.reportListContentView.InitializeChildViews()},SelectFirstModel:function(e){this.SelectedItem(e)},LoadScroll:function(){this.myScroll?this.myScroll.refresh():this.myScroll=new iScroll("reportList",{vScrollbar:!0,vScroll:!0,snap:!1,momentum:!0,onBeforeScrollStart:function(e){for(var t=e.target;1!=t.nodeType;)t=t.parentNode;"SELECT"!=t.tagName&&"INPUT"!=t.tagName&&"TEXTAREA"!=t.tagName&&e.preventDefault()}});var e=this;setTimeout(function(){e.myScroll.refresh()},1e3)}});return u});