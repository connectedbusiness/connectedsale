/**
 * @author Connected Business
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'shared/shared',
  'text!template/login/urlitem.tpl.html'
], function($, $$, _, Backbone, Global, Shared, template) {
  var UrlItemView = Backbone.View.extend({
    _template: _.template(template),
    tagName: 'li',

    events: {
      //"tap #urlItemDelete-btn" : "DeleteUrlItem",
      //"tap #urlItemEdit-btn"   : "EditUrlItem",
      "tap": "Selected"
    },

    bindEvents: function() {
      var self = this;
      $("#" + self.cid + " .urlItem-controls > #urlItemDelete-btn").on("tap", function(e) {
        self.DeleteUrlItem(e)
      });
      $("#" + self.cid + " .urlItem-controls > #urlItemEdit-btn").on("tap", function(e) {
        self.EditUrlItem(e)
      });
    },

    initialize: function() {
      this.$el.attr("id", this.cid);
      this.$el.css({
        'font-weight': 'normal'
      });
      this.model.on('remove', this.RemoveUrl, this);
    },

    render: function() {
      this.$el.prepend(this._template(this.model.toJSON()));

      var _elementId = $('#' + this.cid);
      _elementId.removeClass('.ui-li-icon');
      _elementId.css({
        'font-weight': 'normal',
        'color': '#000000'
      });

      if (this.model.get("isSelected") === 1) {
        var _value = this.model.get("url");
        //if(Shared.IsNullOrWhiteSpace($("#serviceUrl").val())){
        //$("#serviceUrl").val( _value );
        //}
        Global.ServiceUrl = _value;
        this.$el.css({
          'font-weight': 'bold',
          'color': '#324f85'
        });
        //$("<img class='ui-li-icon' width='32px' height='32px'/>").attr({src:"img/check@2x.png"}).prependTo( this.el );
        this.$(".icon-ok").show();
      }

      //this.$('#deletebtn-overlay').fadeIn();
      return this;
    },

    Selected: function(e) {
      e.preventDefault();
      this.model.select();
    },

    DeleteUrlItem: function(e) {
      e.preventDefault();
      //$('#'+this.model.get("id")).off("tap");
      this.model.removeUrl();
    },

    EditUrlItem: function(e) {
      e.stopPropagation();
      //$('#'+this.model.get("id")).off("tap");
      this.model.editUrl();
    },

    RemoveUrl: function() {
      this.remove();
      $("#urlList").listview("refresh");
    },

    ShowDeleteButton: function(e) {
      e.stopPropagation();
      $(".deletebtn-overlay").hide();
      this.$(".deletebtn-overlay").show().fadeIn("slow");
    }
  });

  return UrlItemView;
});
