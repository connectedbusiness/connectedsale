define(["backbone","shared/global","shared/service","shared/method","shared/shared","model/base","model/lookupcriteria","collection/base","view/18.1.0/reports/reports-form","text!template/18.1.0/reports/reports.tpl.html","text!template/18.1.0/reports/header.tpl.html"],function(e,t,r,i,a,o,n,s,l,p,h){var d="#reportsPageContainer",u="#header",c="#printDialog-div",m="#printerSetup-div",P=e.View.extend({_template:_.template(p),_headerTemplate:_.template(h),events:{"tap #reports-back":"BackToDashBoard","tap #modalBg":"outsideMenuHandler"},BackToDashBoard:function(e){e.preventDefault(),t.Printer.isPrintedinPrinter=!1,this.DeletePreviousReport(),t.HasPrevReport=!1,window.location.hash="dashboard"},DeletePreviousReport:function(){0==!t.HasPrevReport&&1==t.HasPrevReport&&a.Printer.DeleteReport(t.prevPages,t.prevTransactionCode)},IsNullOrWhiteSpace:function(e){return!e||(""===e||null===e||void 0===e)},outsideMenuHandler:function(){(this.IsNullOrWhiteSpace(t.isPrintDialog)||0==t.isPrintDialog)&&($("#modalBg").hide(),$(c).hide(),$(m).hide())},render:function(){return this.$el.html(this._template()),t.Printer.isPrintedinPrinter=!1,this},InitializeChildViews:function(){this.$(u).html(this._headerTemplate()),this.InitializeReportsPage()},InitializeReportsPage:function(){this.reportsView?(this.reportsView.unbind(),this.reportsView=new l({el:$(d)})):this.reportsView=new l({el:$(d)}),this.reportsView.InitializeChildViews()}});return P});