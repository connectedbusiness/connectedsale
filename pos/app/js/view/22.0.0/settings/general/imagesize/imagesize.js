/**
 * @author Connected Business
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'shared/global',
  'backbone',
  'text!template/19.0.0/settings/general/imagesize/imagesize.tpl.html'
], function($, $$, _, Global, Backbone, template) {
  var ImageSizePreference = Backbone.View.extend({
    _template: _.template(template),

    events: {
      "change #radio-medium": "radioMedium_changed",
      "change #radio-large": "radioLarge_changed",
      "change #radio-icon": "radioIcon_changed",
      "change #radio-minicart": "radioMinicart_changed",
      "change #radio-mobile": "radioMobile_changed"
    },

    radioMedium_changed: function(e) {
      this.selectedImagesize = 0;
      Global.Preference.ImageSize = this.selectedImagesize;
      this.trigger("selected", this);
      this.SetSelected();

    },

    radioLarge_changed: function(e) {
      this.selectedImagesize = 1;
      Global.Preference.ImageSize = this.selectedImagesize;
      this.trigger("selected", this);
      this.SetSelected();
    },
    radioIcon_changed: function(e) {
      this.selectedImagesize = 2;
      Global.Preference.ImageSize = this.selectedImagesize;

      this.trigger("selected", this);
      this.SetSelected();
    },

    radioMinicart_changed: function(e) {
      this.selectedImagesize = 3;
      Global.Preference.ImageSize = this.selectedImagesize;

      this.trigger("selected", this);
      this.SetSelected();
    },

    radioMobile_changed: function(e) {
      this.selectedImagesize = 4;
      Global.Preference.ImageSize = this.selectedImagesize;

      this.trigger("selected", this);
      this.SetSelected();
    },

    initialize: function() {
      this.render();
    },


    ResetSelected: function() {
      $("#radio-medium").attr('checked', false).checkboxradio("refresh");
      $("#radio-large").attr('checked', false).checkboxradio("refresh");
      $("#radio-icon").attr('checked', false).checkboxradio("refresh");
      $("#radio-minicart").attr('checked', false).checkboxradio("refresh");
      $("#radio-mobile").attr('checked', false).checkboxradio("refresh");
    },

    SetSelected: function() {
      this.ResetSelected();
      switch (this.selectedImagesize) {
        case 0:
          $("#radio-medium").attr('checked', true).checkboxradio("refresh");
          break;
        case 1:
          $("#radio-large").attr('checked', true).checkboxradio("refresh");
          break;
        case 2:
          $("#radio-icon").attr('checked', true).checkboxradio("refresh");
          break;
        case 3:
          $("#radio-minicart").attr('checked', true).checkboxradio("refresh");
          break;
        case 4:
          $("#radio-mobile").attr('checked', true).checkboxradio("refresh");
          break;
      }

    },

    render: function() {
      $("#back-general").show();
      this.$el.html(this._template);
      this.$el.trigger("create");
      this.selectedImagesize = this.model.get("ISEImageSize");
      this.SetSelected();

    }
  });
  return ImageSizePreference;
})
