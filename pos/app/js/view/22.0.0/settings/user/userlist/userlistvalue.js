/**
 * @author Connected Business
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'text!template/22.0.0/settings/user/userlist/userlistvalue.tpl.html'
], function($, $$, _, Backbone, template) {
  var UserListValuePreference = Backbone.View.extend({
    _template: _.template(template),
    tagName: 'li',
    events: {
      "tap ": "SetSelected"
    },
    initialize: function() {
      //	this.render();
    },
    SetSelected: function() {
      this.model.select();
      this.trigger('selected', this.model);
    },
    render: function(model) {
      this.model = model;
      this.$el.attr("id", this.model.cid);
      //this.$el.on('tap',this.SetSelected,this);
      this.$el.html(this._template(this.model.toJSON()));
      return this;
    },
  });
  return UserListValuePreference;
});
