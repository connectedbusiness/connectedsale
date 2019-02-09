define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'text!template/19.1.0/pos/tax/tax.tpl.html'
], function($, $$, _, Backbone, Global, template) {
  return Backbone.View.extend({
    template: _.template(template),
    tagName: 'li',
    isSelected: false,
    initialize: function() {
      this.$el.html(this.template(this.model.attributes));
      this.$el.attr('id', this.model.cid);
      this.$el.attr('data-icon', false);
      this.$el.find('.chk').hide();

      var taxCode = window.sessionStorage.getItem('selected_taxcode');

      taxCode = (taxCode === null) ? Global.ShipTo.TaxCode : taxCode;

      if (taxCode === this.model.get('TaxCode')) {
        this.isSelected = true;
        this.$el.find('.chk').show();
      }
    },
    render: function() {
      return this;
    },
    events: {
      "click": "selected"
    },
    selected: function(e) {
      e.preventDefault();
      this.model.trigger('selected', this.model);
      this.$el.parent().find('.chk').hide();
      this.$el.find('.chk').show();
    }
  });
});
