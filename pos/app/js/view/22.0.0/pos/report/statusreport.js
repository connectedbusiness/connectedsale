/**
 * @author Connected Business
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'shared/shared',
  'text!template/19.0.0/pos/report/statusreport.tpl.html',
  'js/libs/moment.min.js',
  'js/libs/jquery.ui.core.js',
  'js/libs/jquery.ui.datepicker.js',
  'js/libs/timepicker.js',
  'js/libs/format.min.js'
], function($, $$, _, Backbone, Global, Shared, template) {
  var StatusReportView = Backbone.View.extend({
    _template: _.template(template),

    events: {
      "tap #btn-cancel": "button_CancelReport",
      "tap #btn-print": "button_GetReportType",
      "change #report-list": "button_ChangedReportType",
      "change #start-date": "StartDateOnChange",
      "change #end-date": "EndDateOnChange",
    },

    button_CancelReport: function(e) {
      e.preventDefault();
      this.Close();
    },

    button_ChangedReportType: function(e) {
      e.preventDefault();
      var reportType = $("#report-list").find(":selected").val();
      //$("#start-date").val("");
      //$("#end-date").val("");
      this.EnableDate(reportType);
    },

    button_GetReportType: function(e) {
      e.preventDefault();
      var reportType = $("#report-list").find(":selected").val();
      this.GetReportType(reportType, true);
    },

    initialize: function() {
      this.render();
    },

    StartDateOnChange: function() {
      var reportType = $("#report-list").find(":selected").val();
      if (reportType == "DateZtape") {
        if ($("#end-date").val() == "") {
          var startDAte = $("#start-date").val();
          $("#end-date").val(startDAte);
        }
      }
    },
    EndDateOnChange: function() {
      var reportType = $("#report-list").find(":selected").val();
      if (reportType == "DateZtape") {
        if ($("#start-date").val() == "") {
          var endDate = $("#end-date").val();
          $("#start-date").val(endDate);
        }
      }
    },

    InitializeBrowserModeDatePicker: function() {
      if (Global.isBrowserMode) {
        $("#start-date").attr('readonly', 'readonly');
        $("#end-date").attr('readonly', 'readonly');
        $("#start-date").prop('type', 'text');
        $("#end-date").prop('type', 'text');

        $("#start-date").datepicker({
          showButtonPanel: true,
          beforeShow: function(input) {
            setTimeout(function() {
              var buttonPane = $(input).datepicker("widget").find(".ui-datepicker-buttonpane");
              $("<button >", {
                class: "ui-datepicker-close ui-state-default ui-priority-primary ui-corner-all",
                text: "Clear",
                click: function() {
                  input.value = "";
                  $.datepicker._hideDatepicker();
                }
              }).appendTo(buttonPane);
            }, 1);
          }

        });

        $("#end-date").datepicker({
          showButtonPanel: true,
          beforeShow: function(input) {
            setTimeout(function() {
              var buttonPane = $(input).datepicker("widget").find(".ui-datepicker-buttonpane");
              $("<button >", {
                class: "ui-datepicker-close ui-state-default ui-priority-primary ui-corner-all",
                text: "Clear",
                click: function() {
                  input.value = "";
                  $.datepicker._hideDatepicker();
                }
              }).appendTo(buttonPane);
            }, 1);
          }
        });
        $('button.ui-datepicker-current').live('click', function() {
          $.datepicker._curInst.input.datepicker('setDate', new Date()).datepicker('hide');
        });
      }
    },
    render: function() {
      this.$el.html(this._template);
      this.$el.trigger("create");
      $(".report-date").addClass("ui-disabled");
      $("#main-transaction-blockoverlay").show();
      this.InitializeBrowserModeDatePicker();
      //this.SetDateToday();
      this.EnableTimePicker();

      console.log(moment().format('HH:mm:ss'));
      //$("#start-date").val(moment().format('L'));
      //$("#end-date").val(moment().format('L'));
      //$("#start-time").val(moment().format('HH:m:s'));
      //$("#end-time").val(moment().format('HH:m:s'));
    },

    Close: function() {
      this.Hide();
      if (!$("#spin").is(":visible")) $("#main-transaction-blockoverlay").hide();
    },

    GetCurrentDate: function() {
      var date = new Date();
      var _currentDate = "";
      if (Global.isBrowserMode) {
        _currentDate = this.JSONtoDate(date);
      } else {
        var DateFormat = 'YYYY-MM-DD';
        _currentDate = moment(date).format(DateFormat);
      }
      return _currentDate;
    },

    GetEndTime: function() {
      var _format = "HH:mm";
      return moment().eod().format(_format); //returns 23:59:59 or 11:59 PM
    },

    GetStartTime: function() {
      var _format = "HH:mm";
      return moment().sod().format(_format); //returns 00:00 or 12:00 AM
    },

    EnableDate: function(type) {
      var currentDate = this.GetCurrentDate();
      switch (type) {
        case "Xtape":
          $(".report-date").addClass("ui-disabled");

          $("#start-date").val("");
          $("#start-time").val("");
          $("#end-date").val("");
          $("#end-time").val("");
          break;
        case "LastZtape":
          $(".report-date").addClass("ui-disabled");
          $("#end-date").addClass("ui-disabled");
          $("#end-time").addClass("ui-disabled");

          $("#start-date").val("");
          $("#start-time").val("");
          $("#end-date").val("");
          $("#end-time").val("");
          break;
        case "SpecificZtape":
          $(".report-date").removeClass("ui-disabled");
          $("#end-date").addClass("ui-disabled");
          $("#end-time").addClass("ui-disabled");
          $("#start-time").addClass("ui-disabled");

          $("#start-date").val(currentDate);
          $("#start-time").val(this.GetStartTime());
          $("#end-date").val("");
          $("#end-time").val("");
          break;
        case "DateZtape":
          $(".report-date").removeClass("ui-disabled");
          $("#end-date").removeClass("ui-disabled");
          $("#end-time").removeClass("ui-disabled");
          $("#start-time").removeClass("ui-disabled");

          $("#start-date").val(currentDate);
          $("#end-date").val(currentDate);

          $("#start-time").val(this.GetStartTime());
          $("#end-time").val(this.GetEndTime());
          break;
      }
    },

    EnableTimePicker: function() {
      if (Global.isBrowserMode) {
        $("#startTime-container").show();
        $("#endTime-container").show();
      }
    },

    JSONtoDate: function(transactionDate) {
      //var DateFormat = 'YYYY-MM-DD';
      var DateFormat = 'MM/DD/YYYY';
      var _tDate = moment(transactionDate).format(DateFormat);

      return _tDate;
    },
    FormatDateToJSON: function(date) {
      return moment(date).format("M/D/YYYY hh:mm:ss A");
    },

    GetReportType: function(type, isPrinted) {
      var openDate, openTime, closeDate, closeTime = "";

      switch (type) {
        case "Xtape":
          this.trigger(type, this);
          break;
        case "LastZtape":
          this.trigger(type, this);
          break;
        case "SpecificZtape":
          openDate = $("#start-date").val();
          openTime = $("#start-time").val();

          if (!Global.isBrowserMode) {
            openDate = openDate + "T" + openTime;

            console.log("OPENDATE: " + openDate);
          } else {
            openDate = openDate + " " + openTime;
          }

          if (openDate === "") {
            navigator.notification.alert("Please specify a date before printing.", null, "Date is Required", "OK");
            console.log("Please Specify a date before printing..");
            isPrinted = false;
          } else {
            //openDate = this.FormatDateToJSON(openDate);
            this.trigger(type, openDate, this);
          }

          break;
        case "DateZtape":
          openDate = $("#start-date").val();
          openTime = $("#start-time").val();

          closeDate = $("#end-date").val();
          closeTime = $("#end-time").val();

          console.log("BEFORE OPEN: " + openDate);
          if (!Global.isBrowserMode) {
            openDate = openDate + "T" + openTime;
            closeDate = closeDate + "T" + closeTime;

            console.log("OPENDATE: " + openDate);
            console.log("CLOSEDATE: " + closeDate);
          } else {
            openDate = openDate + " " + openTime;
            closeDate = closeDate + " " + closeTime;
          }

          if (openDate === "" && closeDate === "") {
            navigator.notification.alert("Please specify a date before printing.", null, "Date is Required", "OK");
            console.log("Please Specify a date before printing..");
            isPrinted = false;
          } else {

            ////openDate = this.FormatDateToJSON( openDate );
            ////closeDate = this.FormatDateToJSON( closeDate );
            if (openDate === "" && closeDate != "") {
              openDate = closeDate;
            }
            if (closeDate == "" && openDate != "") {
              closeDate = openDate;
            }
            this.trigger(type, openDate, closeDate, this);
          }
          break;
      }

      if (isPrinted) {
        this.Close();
      }

    },

    Hide: function() {
      this.$el.html("");
      this.$el.hide();
      Shared.FocusToItemScan();
    },

    SetDateToday: function() {
      if (Global.isBrowserMode) {
        var fullDate = new Date()
        var month = ((fullDate.getMonth().length + 1) === 1) ? (fullDate.getMonth() + 1) : '0' + (fullDate.getMonth() + 1);
        var hour = fullDate.getHours();
        var min = fullDate.getMinutes();
        if (fullDate.getMinutes() < 10) min = "0" + fullDate.getMinutes();
        if (fullDate.getHours() < 10) hour = "0" + fullDate.getHours();
        var time = hour + ":" + min;
        var day = ((fullDate.getDate().length + 1) === 1) ? (fullDate.getDate()) : '0' + (fullDate.getDate());

        var currentDate = fullDate.getFullYear() + "-" + month + "-" + day + " " + time;
        $("#start-date").val(currentDate);
        $("#end-date").val(currentDate);
      }
    },

    Show: function() {
      this.render();
      this.$el.show();
    }
  });
  return StatusReportView;
});
