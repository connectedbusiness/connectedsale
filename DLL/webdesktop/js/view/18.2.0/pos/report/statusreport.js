define(["jquery","mobile","underscore","backbone","shared/global","shared/shared","text!template/18.2.0/pos/report/statusreport.tpl.html","js/libs/moment.min.js","js/libs/jquery.ui.core.js","js/libs/jquery.ui.datepicker.js","js/libs/timepicker.js","js/libs/format.min.js"],function(e,t,a,i,r,n,s){var o=i.View.extend({_template:a.template(s),events:{"tap #btn-cancel":"button_CancelReport","tap #btn-print":"button_GetReportType","change #report-list":"button_ChangedReportType","change #start-date":"StartDateOnChange","change #end-date":"EndDateOnChange"},button_CancelReport:function(e){e.preventDefault(),this.Close()},button_ChangedReportType:function(t){t.preventDefault();var a=e("#report-list").find(":selected").val();this.EnableDate(a)},button_GetReportType:function(t){t.preventDefault();var a=e("#report-list").find(":selected").val();this.GetReportType(a,!0)},initialize:function(){this.render()},StartDateOnChange:function(){var t=e("#report-list").find(":selected").val();if("DateZtape"==t&&""==e("#end-date").val()){var a=e("#start-date").val();e("#end-date").val(a)}},EndDateOnChange:function(){var t=e("#report-list").find(":selected").val();if("DateZtape"==t&&""==e("#start-date").val()){var a=e("#end-date").val();e("#start-date").val(a)}},InitializeBrowserModeDatePicker:function(){r.isBrowserMode&&(e("#start-date").attr("readonly","readonly"),e("#end-date").attr("readonly","readonly"),e("#start-date").prop("type","text"),e("#end-date").prop("type","text"),e("#start-date").datepicker({showButtonPanel:!0,beforeShow:function(t){setTimeout(function(){var a=e(t).datepicker("widget").find(".ui-datepicker-buttonpane");e("<button >",{"class":"ui-datepicker-close ui-state-default ui-priority-primary ui-corner-all",text:"Clear",click:function(){t.value="",e.datepicker._hideDatepicker()}}).appendTo(a)},1)}}),e("#end-date").datepicker({showButtonPanel:!0,beforeShow:function(t){setTimeout(function(){var a=e(t).datepicker("widget").find(".ui-datepicker-buttonpane");e("<button >",{"class":"ui-datepicker-close ui-state-default ui-priority-primary ui-corner-all",text:"Clear",click:function(){t.value="",e.datepicker._hideDatepicker()}}).appendTo(a)},1)}}),e("button.ui-datepicker-current").live("click",function(){e.datepicker._curInst.input.datepicker("setDate",new Date).datepicker("hide")}))},render:function(){this.$el.html(this._template),this.$el.trigger("create"),e(".report-date").addClass("ui-disabled"),e("#main-transaction-blockoverlay").show(),this.InitializeBrowserModeDatePicker(),this.EnableTimePicker(),console.log(moment().format("HH:mm:ss"))},Close:function(){this.Hide(),e("#spin").is(":visible")||e("#main-transaction-blockoverlay").hide()},GetCurrentDate:function(){var e=new Date,t="";if(r.isBrowserMode)t=this.JSONtoDate(e);else{var a="YYYY-MM-DD";t=moment(e).format(a)}return t},GetEndTime:function(){var e="HH:mm";return moment().eod().format(e)},GetStartTime:function(){var e="HH:mm";return moment().sod().format(e)},EnableDate:function(t){var a=this.GetCurrentDate();switch(t){case"Xtape":e(".report-date").addClass("ui-disabled"),e("#start-date").val(""),e("#start-time").val(""),e("#end-date").val(""),e("#end-time").val("");break;case"LastZtape":e(".report-date").addClass("ui-disabled"),e("#end-date").addClass("ui-disabled"),e("#end-time").addClass("ui-disabled"),e("#start-date").val(""),e("#start-time").val(""),e("#end-date").val(""),e("#end-time").val("");break;case"SpecificZtape":e(".report-date").removeClass("ui-disabled"),e("#end-date").addClass("ui-disabled"),e("#end-time").addClass("ui-disabled"),e("#start-time").addClass("ui-disabled"),e("#start-date").val(a),e("#start-time").val(this.GetStartTime()),e("#end-date").val(""),e("#end-time").val("");break;case"DateZtape":e(".report-date").removeClass("ui-disabled"),e("#end-date").removeClass("ui-disabled"),e("#end-time").removeClass("ui-disabled"),e("#start-time").removeClass("ui-disabled"),e("#start-date").val(a),e("#end-date").val(a),e("#start-time").val(this.GetStartTime()),e("#end-time").val(this.GetEndTime())}},EnableTimePicker:function(){r.isBrowserMode&&(e("#startTime-container").show(),e("#endTime-container").show())},JSONtoDate:function(e){var t="MM/DD/YYYY",a=moment(e).format(t);return a},FormatDateToJSON:function(e){return moment(e).format("M/D/YYYY hh:mm:ss A")},GetReportType:function(t,a){var i,n,s,o="";switch(t){case"Xtape":this.trigger(t,this);break;case"LastZtape":this.trigger(t,this);break;case"SpecificZtape":i=e("#start-date").val(),n=e("#start-time").val(),r.isBrowserMode?i=i+" "+n:(i=i+"T"+n,console.log("OPENDATE: "+i)),""===i?(navigator.notification.alert("Please specify a date before printing.",null,"Date is Required","OK"),console.log("Please Specify a date before printing.."),a=!1):this.trigger(t,i,this);break;case"DateZtape":i=e("#start-date").val(),n=e("#start-time").val(),s=e("#end-date").val(),o=e("#end-time").val(),console.log("BEFORE OPEN: "+i),r.isBrowserMode?(i=i+" "+n,s=s+" "+o):(i=i+"T"+n,s=s+"T"+o,console.log("OPENDATE: "+i),console.log("CLOSEDATE: "+s)),""===i&&""===s?(navigator.notification.alert("Please specify a date before printing.",null,"Date is Required","OK"),console.log("Please Specify a date before printing.."),a=!1):(""===i&&""!=s&&(i=s),""==s&&""!=i&&(s=i),this.trigger(t,i,s,this))}a&&this.Close()},Hide:function(){this.$el.html(""),this.$el.hide(),n.FocusToItemScan()},SetDateToday:function(){if(r.isBrowserMode){var t=new Date,a=t.getMonth().length+1===1?t.getMonth()+1:"0"+(t.getMonth()+1),i=t.getHours(),n=t.getMinutes();t.getMinutes()<10&&(n="0"+t.getMinutes()),t.getHours()<10&&(i="0"+t.getHours());var s=i+":"+n,o=t.getDate().length+1===1?t.getDate():"0"+t.getDate(),d=t.getFullYear()+"-"+a+"-"+o+" "+s;e("#start-date").val(d),e("#end-date").val(d)}},Show:function(){this.render(),this.$el.show()}});return o});