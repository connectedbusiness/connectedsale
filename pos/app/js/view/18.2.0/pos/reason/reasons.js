/**
 * @author Connected Business
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'view/18.2.0/pos/reason/reason',
  'text!template/18.2.0/pos/reason/reasons.tpl.html'
], function($, $$, _, Backbone, ReasonView, template) {
  var ReasonsView = Backbone.View.extend({
    _template: _.template(template),
    initialize: function() {

    },

    render: function(_collection) {
      this.$el.html(this._template);

      $("#save-reason").addClass("ui-disabled");

      this.$el.trigger("create");

      _collection.each(this.LoadReasonView, this);
      this.myScroll = new iScroll('reasonList');
    },

    LoadReasonView: function(model) {
      var reasonView = new ReasonView({
        model: model
      });
      $("#reason-container").append(reasonView.render().el);
      $("#reason-container").listview("refresh");
    }
  });
  return ReasonsView;
});
