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
  'model/base',
  'view/15.0.1/settings/general/website/websitecontent',
  'text!template/15.0.1/settings/general/website/websitelist.tpl.html',
  'text!template/15.0.1/settings/general/website/search.tpl.html',
  'js/libs/iscroll.js',
], function($, $$, _, Backbone, Global, Shared, BaseModel, WebsiteContentPreference, template, searchTemplate) {
  var WebsiteListPreference = Backbone.View.extend({
    _template: _.template(template),
    _search: _.template(searchTemplate),

    initialize: function() {
      $("#settings-website-search").remove();
      this.render();
    },

    render: function() {
      $("#back-general").show();
      this.$el.html(this._template);
      $("#right-pane-content").before(this._search);
      this.$el.trigger("create");
      //console.log("IsUseISEImage : " + this.options.preferenceCollection.attributes.IsUseISEImage);
      //if (!this.options.preferenceCollection.attributes.IsUseISEImage) this.AddOptionNone();
      this.collection.each(this.LoadWebsiteContent, this);

      if (Global.isBrowserMode) Shared.UseBrowserScroll('right-pane-content');
      else this.myScroll = new iScroll('right-pane-content');
      this.SetSelected();
    },

    SetSelected: function(websiteCode) {
      //_selectedReportCode = this.GetSelectedReportCode();
      this.collection.each(function(website) {
        if (website.get("WebSiteCode") === websiteCode) {
          $("<img class='ui-li-icon' style ='height:17px;width:18px;'/>").attr({
            src: "img/check@2x.png"
          }).prependTo($('#' + website.cid));
          $("#website-list-preference").listview("refresh");
        }
      });
    },

    LoadWebsiteContent: function(model) {
      this.websiteContentPref = new WebsiteContentPreference({
        model: model
      });
      this.$("#website-list-preference").append(this.websiteContentPref.render().el);
      this.$("#website-list-preference").listview("refresh");
    },


  });
  return WebsiteListPreference;
});
