/**
 * Connected Business | 05-16-2013
 * Required: el, model
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'text!template/20.0.0/secondarydisplay/summary.tpl.html',
], function($, $$, _, Backbone, Global, template) {

  var SummaryView = Backbone.View.extend({
    _template: _.template(template),

    render: function(jsonmodel) {
      if (jsonmodel == null) jsonmodel = this.model.toJSON();
      jsonmodel.CurrencySymbol = Global.CurrencySymbol;
      this.$el.html(this._template(jsonmodel));
      return this;
    }

  });
  return SummaryView;
});
