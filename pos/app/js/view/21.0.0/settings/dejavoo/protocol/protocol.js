/**
 * @author Connected Business
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'text!template/21.0.0/settings/dejavoo/protocol/protocol.tpl.html'
], function($, $$, _, Backbone, Global, template) {
  var POSPreference = Backbone.View.extend({
    _template: _.template(template),

    events: {
      "change #radio-https-dejavoo": "https_dejavoo_changed",
      "change #radio-http-dejavoo": "http_dejavoo_changed"
    },

    https_dejavoo_changed: function(e) {
      this.selectedProtocol = "HTTPS";
      Global.Preference.DejavooConnectionProtocol = this.selectedProtocol;

      this.trigger("selected", this);
      this.SetSelected();
    },

    http_dejavoo_changed: function(e) {
      this.selectedProtocol = "HTTP";
      Global.Preference.DejavooConnectionProtocol = this.selectedProtocol;

      this.trigger("selected", this);
      this.SetSelected();
    },

    initialize: function() {
      this.render();
    },

    ResetSelected: function() {
      $("#radio-https-dejavoo").attr('checked', false).checkboxradio("refresh");
      $("#radio-http-dejavoo").attr('checked', false).checkboxradio("refresh");
    },

    SetSelected: function() {
      this.ResetSelected();
      switch (this.selectedProtocol) {
        case "HTTPS":
          $('#radio-https-dejavoo').attr('checked', true).checkboxradio("refresh");
          break;
        case "HTTP":
          $("#radio-http-dejavoo").attr('checked', true).checkboxradio("refresh");
          break;
      }
    },

    render: function() {
      $("#back-general").show();
      this.$el.html(this._template);
      this.$el.trigger("create");
      this.selectedProtocol = this.model.get("DejavooConnectionProtocol");
      this.SetSelected();
    }

  });
  return POSPreference;
})
