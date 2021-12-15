/**
 * Connected Business | 5-14-2013
 * Required: el, collection
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'shared/service',
  'shared/method',
  'model/lookupcriteria',
  'view/19.0.0/secondarydisplay/workstations/workstation',
  'text!template/19.0.0/secondarydisplay/workstations/workstations.tpl.html',
  'view/spinner',
  'js/libs/iscroll.js'
], function($, $$, _, Backbone, Global, Service, Method,
  LookupCriteriaModel, WorkstationView, template, Spinner) {
  var WorkstationListView = Backbone.View.extend({
    _template: _.template(template),

    events: {
      "keyup #workstation-search": "keyUp_workstationSearch",
      "tap .btn-Close": "btnClick_Close"
    },

    initialize: function() {
      this.collection.on('reset', this.AddAllWorkstations, this);
    },

    render: function() {
      this.$el.html(this._template);
      this.FetchWorkstations();
    },

    Close: function() {
      this.trigger("ViewClosed");
      this.$el.hide();
    },

    FetchWorkstations: function() {
      var _self = this;
      var _criteria = this.$("#workstation-search").val();
      var _workstationLookup = new LookupCriteriaModel();
      var _rowsToSelect = 100;

      if (!_criteria) _criteria = "";

      _workstationLookup.set({
        StringValue: _criteria
      })

      this.ShowActivityIndicator();

      _workstationLookup.url = Global.ServiceUrl + Service.POS + Method.PREFERENCELOOKUP + _rowsToSelect;
      _workstationLookup.save(null, {
        success: function(model, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          _self.ResetWorkstationCollection(response.Preferences);
        },
        error: function(model, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          model.RequestError(error, "Error Retrieving Workstations");
          _self.HideActivityIndicator();
        }
      });
    },

    ResetWorkstationCollection: function(workstations) {
      this.collection.reset(workstations);
      this.ApplyJQM();
      this.RefreshScroll();
    },

    AddOneWorkstation: function(workstation) {
      var workstationView = new WorkstationView({
        model: workstation
      });
      this.$("#workstationListContainer").append(workstationView.render().el);
    },

    RefreshScroll: function() {
      if (Global.isBrowserMode) {
        $("#workstation-content").css('overflow-y', 'scroll');
        return;
      }
      if (this.myScroll) {
        this.myScroll.destroy();
        this.myScroll = null;
      }
      this.myScroll = new iScroll('workstation-content');
    },

    ApplyJQM: function() {
      try {
        $(".workstationContainer").trigger("create");
        $("#workstationListContainer").listview("refresh");
      } catch (err) {
        console.log("error encountered: " + err);
      }
    },

    ShowNoData: function() {
      this.$(".no-data").show();
    },

    HideNoData: function() {
      this.$(".no-data").hide();
    },

    AddAllWorkstations: function() {
      if (!this.collection.length > 0) {
        this.ShowNoData();
      } else {
        this.HideNoData();
      }

      this.$("#workstationListContainer").empty();
      this.collection.each(this.AddOneWorkstation, this);
      this.HideActivityIndicator();
    },

    Show: function() {
      this.render();
      this.$el.show();
    },

    keyUp_workstationSearch: function(e) {
      if (e.keyCode === 13) {
        this.FetchWorkstations();
      }
    },

    btnClick_Close: function(e) {
      e.preventDefault();
      this.Close();
    },

    ShowActivityIndicator: function() {
      if (document.getElementById('workstation-form')) {
        $("#spin").remove();
        $("<div id='spin' class='spin'></div>").appendTo(this.$("#workstation-form"));
        var _target = document.getElementById('spin');
        this._spinner = Spinner;
        this._spinner.opts.color = '#fff'; //The color of the spinner
        this._spinner.opts.lines = 13; // The number of lines to draw
        this._spinner.opts.length = 7; // The length of each line
        this._spinner.opts.width = 4; // The line thickness
        this._spinner.opts.radius = 10; // The radius of the inner circle
        this._spinner.opts.top = 'auto'; // Top position relative to parent in px
        this._spinner.opts.left = 'auto'; // Left position relative to parent in px
        this._spinner.spin(_target);
        $("<h5>Loading...</h5>").appendTo($("#spin"));
      }
    },

    HideActivityIndicator: function() {
      if (this._spinner) {
        $("#spin").remove();
        this._spinner.stop();
      }
    },

  });
  return WorkstationListView;
})
