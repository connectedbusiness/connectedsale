define([
  'backbone',
  'shared/global',
  'shared/service',
  'shared/method',
  'shared/shared',
  'model/base',
  'model/lookupcriteria',
  'collection/base',
  'view/26.0.0/reports/list/reportlist-content',
  'text!template/26.0.0/reports/list/reportlist.tpl.html',
  'text!template/26.0.0/reports/list/reportlistcontent.tpl.html'
], function(Backbone, Global, Service, Method, Shared,
  BaseModel, LookUpCriteriaModel,
  BaseCollection,
  ReportListContentView,
  template, reportListTemplate) {
  var reportList_el = "#reportList > ul";
  var no_record_el = ".no-record-found";
  var ReportListView = Backbone.View.extend({

    _template: _.template(template),
    _reportListTemplate: _.template(reportListTemplate),

    events: {
      // "keyup #searchReport #txtSearch" : "SearchReport",
      "keypress #searchReport #txtSearch": "SearchReport",
      "tap #btn-Search": "SearchBtn_Tap",
      "keyup #searchReport #txtSearch ": "ShowClearButton",
      "focus #searchReport #txtSearch ": "ShowClearButton",
      "blur #searchReport #txtSearch ": "HideClearButton",
      "tap #searchReport .clearTxt ": "ClearText"
    },

    initialize: function() {
      this.render();
    },

    render: function() {
      this.$el.html(this._template);
      return this;
    },
    InitializeChildViews: function() {
      this.ShowReportList();
    },
    SearchBtn_Tap: function(e) {
      e.preventDefault();
      var criteria = $("#searchReport #txtSearch").val();
      this.ShowReportList(criteria);
    },
    ClearText: function() {
      $("#searchReport #txtSearch").val('');
      $("#searchReport #txtSearch").focus();
    },
    ShowClearButton: function() {
      $("#searchReport .clearTxt").fadeIn();
    },
    HideClearButton: function() {
      $("#searchReport .clearTxt").fadeOut();
    },

    SearchReport: function(e) {
      var criteria = $("#" + e.target.id).val();
      if (e.keyCode == 13) {
        this.ShowReportList(criteria);
      }
    },

    SelectedItem: function(model) {
      if (!model.get("ReportCode") == false) {
        this.trigger('changePreview', model);
      }

    },
    IsNullOrWhiteSpace: function(str) {
      if (!str) {
        return true;
      }
      if (str === "" || str === null || str === undefined) {
        return true;
      }
      return false;
    },
    ShowReportList: function(criteria) {
      var self = this;
      $(reportList_el).html('');
      this.reportModel = new BaseModel();
      if (!this.IsNullOrWhiteSpace(criteria)) {
        this.reportModel.set({
          StringValue: criteria
        });
      }

      this.reportModel.url = Global.ServiceUrl + Service.POS + Method.REPORTLOOKUP + 100;
      this.reportModel.save(null, {
        success: function(model, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          self.ReportListLoadComplete(response);
        },
        error: function(model, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          self.ReportLoadError();
        }
      });
    },
    ReportLoadError: function() {
      $(no_record_el).show();
      this.trigger('noRecordFound');
    },
    ReportListLoadComplete: function(response) {
      $(no_record_el).hide();
      var self = this;
      if (!this.reportCollection) {
        this.reportCollection = new BaseCollection();
      } else {
        this.reportCollection.reset();
        this.reportCollection = new BaseCollection();
      }
      if (response) {
        this.LoadItems(response);
      }
      if (this.IsNullOrWhiteSpace(response.ReportViews)) {
        this.ReportLoadError();
      }

      if (Global.isBrowserMode) Shared.UseBrowserScroll('#reportList');
      else this.LoadScroll();
    },
    LoadItems: function(response) {
      var self = this;
      $("#print-preview-container > tbody").html('');
      this.firstModel = "";
      this.reportCollection.reset(response.ReportViews);
      this.reportCollection.pluck('ReportName');
      var collection = this.reportCollection;
      var _collection = collection.pluck('ReportName');
      var _result = _.groupBy(_collection, function(item) {
        return item.charAt(0).toUpperCase();
      });
      for (var item in _result) {
        $(reportList_el).append("<ol>" + item + "</ol>");

        collection.each(function(model) {
          if (self.firstModel == "") {
            self.firstModel = new BaseModel();
            self.firstModel.set(model);
          }
          var _item = model.get("ReportName");

          if (_item.charAt(0).toUpperCase() === item.toUpperCase()) {
            self.AppendItem(model);
          }
        })
      }
      if (!this.IsNullOrWhiteSpace(this.firstModel)) {
        this.SelectFirstModel(this.firstModel);
      }

    },
    AppendItem: function(model) {
      this.reportListContentView = new ReportListContentView({
        el: $(reportList_el),
        model: model
      });
      this.reportListContentView.SelectFirstModel(this.firstModel);
      this.reportListContentView.on('selected', this.SelectedItem, this)
      this.reportListContentView.InitializeChildViews();
    },
    SelectFirstModel: function(model) {
      this.SelectedItem(model);
    },
    LoadScroll: function() {

      if (!this.myScroll) {
        this.myScroll = new iScroll('reportList', {
          vScrollbar: true,
          vScroll: true,
          snap: false,
          momentum: true,
          onBeforeScrollStart: function(e) {
            var target = e.target;
            while (target.nodeType != 1) target = target.parentNode;

            if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA')
              e.preventDefault();
          }
        });
      } else {
        this.myScroll.refresh();
      }

      var self = this;
      setTimeout(function() {
        self.myScroll.refresh();
      }, 1000);

    },

  });

  return ReportListView;
});
