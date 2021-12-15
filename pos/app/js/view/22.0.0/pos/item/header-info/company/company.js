/**
 * @author Connected Business
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'shared/method',
  'text!template/19.0.0/pos/item/header-info/company/companyinfo.tpl.html'
], function($, $$, _, Backbone, Global, Method, template) {
  var CompanyView = Backbone.View.extend({
    _template: _.template(template),

    initialize: function() {
      this.render();
    },

    render: function() {
      var compName = Global.CompanyName.replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, ' ')
      var _imageLoc = Global.ServiceUrl + Method.COMPANYIMAGE + this.model.get("CompanyImageLocation") + '.png';

      this.model.set({
        ImageLocation: _imageLoc
      }, {
        silent: true
      });

      this.$el.prepend(this._template(this.model.toJSON()));
    }
  });
  return CompanyView;
});
