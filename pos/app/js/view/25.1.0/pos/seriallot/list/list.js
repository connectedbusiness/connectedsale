
/**
 * @author alexis.banaag
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'text!template/25.1.0/pos/seriallot/list/list.tpl.html',
], function($, $$, _, Backbone, Template) {
  var ListView = Backbone.View.extend({
    tagName: 'li',

    template: _.template(Template),

    events: {
      "tap": "selectSerial_tap"
    },

    removeSelected: function() {
      this.model.destroy();
      this.remove();
    },

    selectSerial_tap: function(e) {
      e.preventDefault();
      this.trigger('selected', this.ProcessSelectedSerial(this.model));
    },

    initialize: function() {
      this.model.on('remove', this.removeSelected, this);
    },

    render: function() {
      this.$el.append(this.template(this.model.toJSON()));
      return this;
    },

    ProcessSelectedSerial: function(model) {
      return model.set({
        IsIncluded: true
      });
    }

  });
  return ListView;
})
