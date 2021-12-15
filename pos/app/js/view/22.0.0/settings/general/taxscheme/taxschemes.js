/**
 * @author Connected Business
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/shared',
  'shared/global',
  'view/19.0.0/settings/general/taxscheme/taxscheme',
  'text!template/19.0.0/settings/general/taxscheme/taxschemepage.tpl.html',
  'text!template/19.0.0/settings/general/taxscheme/search.tpl.html',
  'js/libs/iscroll.js',
], function($, $$, _, Backbone, Shared, Global, TaxSchemePreference, template, searchTemplate) {
  var TaxSchemesPreference = Backbone.View.extend({
    _template: _.template(template),
    _search: _.template(searchTemplate),

    initialize: function() {
      $("#settings-salesexempttaxcode-search").remove();
      this.render();
    },

    render: function() {
      $("#back-general").show();
      this.$el.html(this._template);

      $("#right-pane-content").before(this._search);

      this.$el.trigger("create");
      this.collection.each(this.LoadTaxSchemes, this);

      if (Global.isBrowserMode) Shared.ApplyListScroll();
      else this.myScroll = new iScroll('right-pane-content');
    },

    LoadTaxSchemes: function(model) {
      var taxCode = model.get("TaxCode");
      model.set({
        FormattedTaxCode: Shared.Escapedhtml(taxCode),
        SalesExemptTaxCode: taxCode
      });
      this.taxSchemePreference = new TaxSchemePreference({
        model: model
      });
      this.$("#TaxSchemeListPreference").append(this.taxSchemePreference.render().el);
      this.$("#TaxSchemeListPreference").listview("refresh");
    },
  });
  return TaxSchemesPreference;
});
