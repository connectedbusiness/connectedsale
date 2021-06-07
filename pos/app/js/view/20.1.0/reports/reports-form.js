define([
  'backbone',
  'shared/global',
  'shared/service',
  'shared/method',
  'model/base',
  'model/lookupcriteria',
  'collection/base',
  'view/20.1.0/reports/print/preview',
  'view/20.1.0/reports/list/reportlist',
  'text!template/20.1.0/reports/reports-form.tpl.html',
  'js/libs/iscroll.js'
], function(Backbone, Global, Service, Method,
  BaseModel, LookUpCriteriaModel,
  BaseCollection,
  PrintPreviewView, ReportListView,
  template) {
  var rightPane_el = ".right-pane";
  var leftPane_el = ".left-pane";
  var printDialog_el = "#printDialog-div";
  var printSetup_el = "#printerSetup-div";
  var ReportsFormView = Backbone.View.extend({

    _template: _.template(template),

    events: {
      "swipeleft": "HideLeftPane",
      "swiperight": "ShowLeftPane"
    },

    initialize: function() {
      this.render();
    },

    render: function() {
      this.$el.html(this._template);
      return this;
    },
    InitializeRightPaneContent: function() {
      if (!this.printPreviewView) {
        this.printPreviewView = new PrintPreviewView({
          el: $(rightPane_el)
        });
      } else {
        this.printPreviewView.unbind();
        this.printPreviewView = new PrintPreviewView({
          el: $(rightPane_el)
        });
      }
      this.printPreviewView.on('togglePreview', this.ToggleShowFullScreen, this);
      this.printPreviewView.InitializeChildViews();
    },
    InitializeChildViews: function() {
      this.InitializeRightPaneContent();
      this.InitializeLeftPaneContent();
      this.LoadScroll();
    },
    ChangePreview: function(model) {
      this.printPreviewView.ChangeReportPreview(model, true);
    },
    NoPreviewFound: function() {

      this.printPreviewView.NoRecordFound();
      this.printPreviewView.ShowPreviewMessage();
    },

    InitializeLeftPaneContent: function() {
      if (!this.printListView) {
        this.printListView = new ReportListView({
          el: $(leftPane_el)
        });
      } else {
        this.printListView.unbind();
        this.printListView = new ReportListView({
          el: $(leftPane_el)
        });
      }
      this.printListView.on('changePreview', this.ChangePreview, this);
      this.printListView.on('noRecordFound', this.NoPreviewFound, this);
      this.printListView.InitializeChildViews();
      this.LoadScroll();
    },

    LoadScroll: function() { //dont remove - to contain child elements, purpose after input on text box layout will not be distorted
      if (!this.optionsScroll) {
        this.optionsScroll = new iScroll('reportsForm', {
          vScrollbar: false,
          vScroll: false,
          hScroll: false,
          hScrollbar: false,
          snap: false,
          momentum: true
        });
      } else {
        this.optionsScroll.refresh();
      }
      var self = this;
      setTimeout(function() {
        self.optionsScroll.refresh();
      }, 1000);
    },

    HideLeftPane: function() {
      var self = this;
      if (Global.isBrowserMode) return;
      self.ToggleShowFullScreen(true);
    },


    ShowLeftPane: function() {
      var self = this;
      if (Global.isBrowserMode) return;
      self.ToggleShowFullScreen(false);
    },

    ToggleShowFullScreen: function(isFullScreen) {
      var self = this,
        leftPane = $(leftPane_el),
        rightPane = $(rightPane_el),
        previewControls = $('#previewControls'),
        noRecordFoundEl = $('.no-record-found'),
        printArea = $('#print-area'),
        printFrame = $('#printFrame'),
        printContainer = $('#customizePrintContainer'),
        printPreviewbtn = $("#btn-printPreview > span"),
        isNormalPreview = printPreviewbtn.hasClass('icon-fullscreen');

      var proccessShowFullScreen = function() {
        self.ShowFullScreen(rightPane, isFullScreen);
        self.ShowFullScreen(previewControls, isFullScreen);
        self.ShowFullScreen(noRecordFoundEl, isFullScreen);
        self.ShowFullScreen(printContainer, isFullScreen);
        if (Global.isBrowserMode) {
          self.ShowFullScreen(printFrame, isFullScreen);
        } else {
          self.ShowFullScreen(printArea, isFullScreen);
        }
        if (!Global.isBrowserMode) self.printPreviewView.RefreshScroll();
      }

      if (isFullScreen) {
        if (!isNormalPreview) return;
        leftPane.hide("slide", 400);
        setTimeout(function() {
          proccessShowFullScreen();
        }, 400);
      } else {
        if (isNormalPreview) return;
        proccessShowFullScreen();
        leftPane.show("slide", 400);
      }

    },

    ShowFullScreen: function(el, isFullScreen) {
      var self = this,
        printPreviewbtn = $("#btn-printPreview > span");
      if (isFullScreen) {
        el.addClass('reports-FullScreen');
        printPreviewbtn.removeClass('icon-fullscreen');
        printPreviewbtn.addClass('icon-resize-small');
      } else {
        el.removeClass('reports-FullScreen');
        printPreviewbtn.addClass('icon-fullscreen');
        printPreviewbtn.removeClass('icon-resize-small');
      }
    }

  });

  return ReportsFormView;
});
