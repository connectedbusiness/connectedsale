define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'shared/service',
  'shared/method',
  'model/base',
  'model/lookupcriteria',
  'collection/base',
  'text!template/24.0.0/reports/list/reportlistcontent.tpl.html'
], function($, $$, _, Backbone, Global, Service, Method,
  BaseModel, LookUpCriteriaModel,
  BaseCollection,
  template, reportListTemplate) {
  var ReportListContentView = Backbone.View.extend({

    _template: _.template(template),

    BindEvents: function() {
      var self = this;
      $(this.classID.CID).on("tap", function() {
        self.SelectedItem();
      });
    },

    initialize: function() {
      this.classID = {
        CID: " #" + this.cid + " "
      }
      this.render();
    },
    SelectFirstModel: function(firstModel) {
      var reportCode = firstModel.get("ReportCode");
      if (this.model.get("ReportCode") == reportCode) {
        $(".report-lookup-content").removeClass('selected-blue');
        $(this.classID.CID).addClass('selected-blue');
      }

    },
    SelectedItem: function() {
      $(".report-lookup-content").removeClass('selected-blue');
      $(this.classID.CID).addClass('selected-blue');
      this.trigger('selected', this.model);
    },
    render: function() {
      var self = this;
      this.model.set({
        ModelID: self.cid
      });
      this.$el.append(this._template(this.model.toJSON()));

      return this;
    },
    InitializeChildViews: function() {
      this.BindEvents();
    },

  });

  return ReportListContentView;
});
