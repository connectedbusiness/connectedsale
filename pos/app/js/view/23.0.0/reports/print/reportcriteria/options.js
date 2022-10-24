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
  'text!template/23.0.0/reports/print/printdialog/reportcriteria/options.tpl.html'
], function($, $$, _, Backbone, Global, Service, Method,
  BaseModel, LookUpCriteriaModel,
  BaseCollection,
  template, reportListTemplate) {
  var CriteriaOptionsView = Backbone.View.extend({

    _template: _.template(template),

    BindEvents: function() {
      var self = this;
      //$(this.classID.CID +" .addCriteria").on("tap",function(e){ self.SelectedItem(e); });
      $(this.classID.CID).on("tap", function(e) {
        self.SelectedItem(e);
      });
    },

    initialize: function() {
      this.classID = {
        CID: " #" + this.cid + " "
      }
      this.render();
    },
    SelectedItem: function(e) {
      e.preventDefault();
      this.trigger('AddCriteria', this.model);
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

  return CriteriaOptionsView;
});
