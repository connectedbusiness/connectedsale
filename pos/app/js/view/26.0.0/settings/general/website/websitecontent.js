/**
 * @author Connected Business
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'text!template/26.0.0/settings/general/website/websitecontent.tpl.html'
], function($, $$, _, Backbone, template) {
  var WebsiteContentPreference = Backbone.View.extend({
    _template: _.template(template),
    tagName: 'li',
    events: {
      "tap": "Selected"
    },

    initialize: function() {      
      this.render();
    },

    render: function() {
      this.$el.attr("id", this.model.cid);
      this.$el.html(this._template(this.model.toJSON()));
      return this;
    },

    Selected: function() {
      this.model.select();
    }
  });
  return WebsiteContentPreference;
});
