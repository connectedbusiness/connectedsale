define(["backbone","shared/global","shared/service","shared/method","model/base","model/lookupcriteria","collection/base","view/20.0.0/reports/print/preview","view/20.0.0/reports/list/reportlist","text!template/20.0.0/reports/reports-form.tpl.html","js/libs/iscroll.js"],function(e,i,t,n,r,o,s,l,h,w){var a=".right-pane",c=".left-pane",p=e.View.extend({_template:_.template(w),events:{swipeleft:"HideLeftPane",swiperight:"ShowLeftPane"},initialize:function(){this.render()},render:function(){return this.$el.html(this._template),this},InitializeRightPaneContent:function(){this.printPreviewView?(this.printPreviewView.unbind(),this.printPreviewView=new l({el:$(a)})):this.printPreviewView=new l({el:$(a)}),this.printPreviewView.on("togglePreview",this.ToggleShowFullScreen,this),this.printPreviewView.InitializeChildViews()},InitializeChildViews:function(){this.InitializeRightPaneContent(),this.InitializeLeftPaneContent(),this.LoadScroll()},ChangePreview:function(e){this.printPreviewView.ChangeReportPreview(e,!0)},NoPreviewFound:function(){this.printPreviewView.NoRecordFound(),this.printPreviewView.ShowPreviewMessage()},InitializeLeftPaneContent:function(){this.printListView?(this.printListView.unbind(),this.printListView=new h({el:$(c)})):this.printListView=new h({el:$(c)}),this.printListView.on("changePreview",this.ChangePreview,this),this.printListView.on("noRecordFound",this.NoPreviewFound,this),this.printListView.InitializeChildViews(),this.LoadScroll()},LoadScroll:function(){this.optionsScroll?this.optionsScroll.refresh():this.optionsScroll=new iScroll("reportsForm",{vScrollbar:!1,vScroll:!1,hScroll:!1,hScrollbar:!1,snap:!1,momentum:!0});var e=this;setTimeout(function(){e.optionsScroll.refresh()},1e3)},HideLeftPane:function(){var e=this;i.isBrowserMode||e.ToggleShowFullScreen(!0)},ShowLeftPane:function(){var e=this;i.isBrowserMode||e.ToggleShowFullScreen(!1)},ToggleShowFullScreen:function(e){var t=this,n=$(c),r=$(a),o=$("#previewControls"),s=$(".no-record-found"),l=$("#print-area"),h=$("#printFrame"),w=$("#customizePrintContainer"),p=$("#btn-printPreview > span"),u=p.hasClass("icon-fullscreen"),d=function(){t.ShowFullScreen(r,e),t.ShowFullScreen(o,e),t.ShowFullScreen(s,e),t.ShowFullScreen(w,e),i.isBrowserMode?t.ShowFullScreen(h,e):t.ShowFullScreen(l,e),i.isBrowserMode||t.printPreviewView.RefreshScroll()};if(e){if(!u)return;n.hide("slide",400),setTimeout(function(){d()},400)}else{if(u)return;d(),n.show("slide",400)}},ShowFullScreen:function(e,i){var t=$("#btn-printPreview > span");i?(e.addClass("reports-FullScreen"),t.removeClass("icon-fullscreen"),t.addClass("icon-resize-small")):(e.removeClass("reports-FullScreen"),t.addClass("icon-fullscreen"),t.removeClass("icon-resize-small"))}});return p});