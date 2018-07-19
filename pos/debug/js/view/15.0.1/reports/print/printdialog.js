define([
  'backbone',
  'shared/global',
  'shared/service',
  'shared/method',
  'shared/shared',
  'model/base',
  'model/lookupcriteria',
  'collection/base',
  'collection/reportcriterias',
  'view/15.0.1/reports/print/reportcriteria/options',
  'view/15.0.1/reports/print/reportcriteria/criteria',
  'text!template/15.0.1/reports/print/printdialog.tpl.html',
  'text!template/15.0.1/reports/print/printdialog/criteria-options.tpl.html',
  'text!template/15.0.1/reports/print/printdialog/criteria-items.tpl.html',
  'text!template/15.0.1/reports/print/printdialog/criteria-items-content.tpl.html',
  'js/libs/iscroll.js',
  'js/libs/format.min.js'
], function(Backbone, Global, Service, Method, Shared,
  BaseModel, LookUpCriteriaModel,
  BaseCollection, ReportCriteriaCollection,
  ReportCriteriaOptionsView, CriteriaView,
  template, criteriaOptionsTemplate, criteriaItemsTemplate, criteriaItemsContentTemplate) {

  var _printDialog;
  var leftPane_el = ".dialog-left-pane";
  var rightPane_el = ".dialog-right-pane";
  var modelBg = "#modalBg";
  var printdialogSpinner_el = "#printDialog-spinner";
  var _criteriaTable_el = "#reportCriteriaTableContainer";
  var PrintDialogView = Backbone.View.extend({

    _template: _.template(template),
    _critriaOptionsTemplate: _.template(criteriaOptionsTemplate),
    _criteriaItemsTemplate: _.template(criteriaItemsTemplate),
    _criteriaItemsContentTemplate: _.template(criteriaItemsContentTemplate),
    events: {
      "tap #btnCancel": "Close",
      "tap #btnApply ": "Apply_Tap",
      "keyup  #txtSearch ": "FindCriteria",
      "keyup .searchField #txtSearch ": "ShowClearButton",
      "focus .searchField #txtSearch ": "ShowClearButton",
      "blur .searchField #txtSearch ": "HideClearButton",
      "tap .searchField .clearTxt ": "ClearText",
      "tap #btnSearch ": "btnSearch_Tap"
    },

    initialize: function() {
      this.render();
    },

    Close: function() {
      Global.isPrintDialog = false;
      $(modalBg).hide();
      $(printdialogSpinner_el).hide();
      this.$el.hide();
    },
    render: function() {
      _printDialog = this;
      this.$el.html(this._template());
      $(modalBg).show();
      return this;
    },
    Show: function() {
      $(modalBg).show();
      Global.isPrintDialog = true;
      this.$el.show();
    },
    InitializeCriteriaCollection: function() {
      this.criteriaCollection = new ReportCriteriaCollection(); // temporary storage
      this.criteriaCollection.reset();
      this.criteriaCollectionCache = new ReportCriteriaCollection(); //permanent storage
      this.criteriaCollectionCache.reset();
    },
    InitializeChildViews: function(filterCriteria, reportCode) {
      this.InitializeCriteriaCollection();
      this.InitializeCriteriaOptions(filterCriteria, reportCode);
      this.InitializeCriteriaItems();
      this.isLoaded = true;
      this.reportCode = reportCode;
    },
    InitializeCriteriaOptions: function(filterCriteria, reportCode) {
      this.$(leftPane_el).html(this._critriaOptionsTemplate());
      var self = this;
      var _criteria = filterCriteria;
      var _reportCode = reportCode;
      this.filterModel = new BaseModel();
      this.filterModel.set({
        StringValue: _criteria,
        ReportCode: _reportCode
      });
      this.filterModel.url = Global.ServiceUrl + Service.POS + Method.REPORTFILTERCRITERIA;
      this.filterModel.save(null, {
        success: function(model, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          self.LoadFilterCriteriaOptions(response);
        }
      });

    },
    ClearText: function() {
      $(".searchField #txtSearch").val('');
    },
    ShowClearButton: function() {
      $(".searchField .clearTxt").show();
    },
    HideClearButton: function() {
      $(".searchField .clearTxt").hide();
    },
    btnSearch_Tap: function(e) {
      this.FindCriteria(e, "find")
    },
    FindCriteria: function(e, find) {
      if (e.keyCode === 13 || !this.IsNullOrWhiteSpace(find)) {
        var _el = "#criteriaOptions";
        this.criteriaOptions = this.criteriaOptionsCache;
        var _search = this.$("#txtSearch").val().toString().toUpperCase();
        var _searchCollection = new BaseCollection();

        if (!this.IsNullOrWhiteSpace(_search)) {

          this.criteriaOptions.each(function(model) {
            var toFind = model.get("ColumnName").toString().toUpperCase();
            if (toFind.indexOf(_search) > -1) {
              _searchCollection.add(model);
            }
          });

          if (_searchCollection.length > 0) {
            this.LoadFilterCriteriaOptions("", _searchCollection);
          } else {
            this.$(_el).html('');
          }
        } else {
          this.LoadFilterCriteriaOptions();
        }
      }
    },

    LoadFilterCriteriaOptions: function(response, search) {
      if (this.IsNullOrWhiteSpace(this.criteriaOptions)) {
        this.criteriaOptions = new BaseCollection();
        this.criteriaOptions.reset(response.ReportViews);
        var toDelete = null;
        this.criteriaOptions.each(function(criteriaModel) {
          if (criteriaModel.get("ColumnName") == "@IsPrintFromPOS") {
            toDelete = criteriaModel;
          }
        });
        if (toDelete) this.criteriaOptions.remove(toDelete);
        console.log(this.reportCode);
        //filtercritria section
        this.criteriaOptionsCache = this.criteriaOptions;

      }
      if (!this.IsNullOrWhiteSpace(search)) {
        this.criteriaOptions = search;
      }
      var _el = "#criteriaOptions";
      this.$(_el).html('');

      var self = this;
      this.SortVar = "ColumnName";
      this.criteriaOptions.sortedField = this.SortVar;
      this.criteriaOptions.comparator = function(collection) {
        return (collection.get(self.SortVar));
      };
      console.log(this.criteriaOptions.length);
      this.criteriaOptions.sort(this.SortVar).each(function(model) {
        self.AddFilterOptions(model);
      });
      if (this.criteriaCollectionCache.length > 0) {
        if (Global.isBrowserMode) Shared.UseBrowserScroll('#reportCriteriaTableContainer');
        else this.LoadCriteriaScroll();
      }
      if (!this.IsNullOrWhiteSpace(response)) {
        this.LoadDefaultFilters(response);
      }

      if (Global.isBrowserMode) Shared.UseBrowserScroll("#criteriaOptionsTable");
      else this.LoadOptionsScroll();

    },
    AddFilterOptions: function(model) {
      var _el = "#criteriaOptions";
      this.filterOptionsView = new ReportCriteriaOptionsView({
        el: $(_el),
        model: model
      });
      this.filterOptionsView.on('AddCriteria', this.AddCriteria, this)
      this.filterOptionsView.InitializeChildViews();

    },
    LoadDefaultFilters: function(response) {
      if (Shared.IsNullOrWhiteSpace(response)) return;
      var defaultFilters = new BaseCollection();
      defaultFilters.reset(response.DefaultFilterCriteria)

      var self = this;
      var tempModel = new BaseModel();
      if (defaultFilters.length > 0) {
        defaultFilters.each(function(filterCriteria) {
          var filterName = filterCriteria.get("Parameter");
          var filterValue = filterCriteria.get("Value");
          tempModel = self.criteriaOptions.find(function(options) {
            if (options.get("ColumnName") == filterName) {
              if (filterValue != "?") {
                options.set({
                  DefaultValue: filterValue
                });
              }

              self.filterOptionsView.trigger('AddCriteria', options);
            }
          });
        });
      }
      this.LoadFilterCriteriaOptions();
    },

    AddCriteria: function(model) {
      var _el = "#criteriaItems";
      if (this.criteriaCollectionCache.length == 0) {
        $(_criteriaTable_el).html('');
        $(_criteriaTable_el).html(this._criteriaItemsContentTemplate());
        console.log("ReinitializeCriteriaTable");
      }
      this.criteriaView = new CriteriaView({
        el: $(_el),
        model: model
      });
      this.criteriaView.on('RemoveCriteria', this.RemoveCriteria, this);
      this.criteriaView.on('updateLineItem', this.UpdateCriteria, this);

      this.criteriaOptions.remove(model);
      this.criteriaOptionsCache.remove(model);
      this.criteriaCollection.add(model);
      this.criteriaCollectionCache.add(model);
      this.LoadFilterCriteriaOptions();
      this.criteriaView.InitializeChildViews();

    },
    UpdateCriteria: function(_model) {
      this.criteriaCollectionCache.each(function(model) {
        if (model.get("ColumnName") == _model.get("ColumnName")) {
          model.set(_model);
        }
      });
    },
    RemoveCriteria: function(model) {
      this.criteriaOptions.add(model);
      this.criteriaOptionsCache.add(model);
      this.LoadFilterCriteriaOptions();

      this.criteriaCollectionCache.remove(model);
    },

    InitializeCriteriaItems: function() {
      this.$(rightPane_el).html(this._criteriaItemsTemplate());

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
    LoadOptionsScroll: function() {
      if (this.IsNullOrWhiteSpace(this.optionsScroll)) {
        this.optionsScroll = new iScroll('criteriaOptionsTable', {
          vScrollbar: true,
          vScroll: true,
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
    RefreshCriteriaScroll: function() {
      this.criteriaScroll = new iScroll('reportCriteriaTableContainer', {
        vScrollbar: true,
        vScroll: true,
        snap: false,
        momentum: true,
        hideScrollbar: false,
        onBeforeScrollStart: function(e) {
          var target = e.target;
          while (target.nodeType != 1) target = target.parentNode;

          if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA')
            e.preventDefault();
        }
      });
    },
    LoadCriteriaScroll: function() {
      if (this.IsNullOrWhiteSpace(this.criteriaScroll)) {

        this.RefreshCriteriaScroll();
      } else {
        this.criteriaScroll.refresh();
      }
      var self = this;
      setTimeout(function() {
        self.criteriaScroll.refresh();
      }, 1000);
    },
    ValidateInput: function(collection) { //jj
      var message_el = ".dialog-message";
      var self = this;
      var message = "";
      var isValid = true;

      var _requiredField = "";
      collection.each(function(model) {
        var colVal = model.get("CriteriaValue");
        if (self.IsNullOrWhiteSpace(_requiredField)) {
          if (self.IsNullOrWhiteSpace(colVal) && !(colVal === false)) {
            _requiredField = model.get("ColumnName")
            isValid = false;
          }
        } else {
          return;
        }
      });
      if (!this.IsNullOrWhiteSpace(_requiredField)) {
        message = "   " + _requiredField + " is Required.";
        $(message_el + "> span").html(message)
        $(message_el).slideDown('fast');
        setTimeout(function() {
          $(message_el).slideUp('fast');
        }, 2000);
      }
      return isValid;
    },
    Apply_Tap: function(e) {
      e.preventDefault();
      if (this.ValidateInput(this.criteriaCollectionCache)) {
        this.trigger('Apply', this.reportCode, this.criteriaCollectionCache);
        $(printdialogSpinner_el).show();
      }
    }
  });

  return PrintDialogView;
});
