/**
 * @author Connected Business
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'view/18.1.0/pos/itemdetail/accessory/accessory',
  'text!template/18.1.0/pos/itemdetail/accessory/accessories.tpl.html',
  'js/libs/iscroll.js'
], function($, $$, _, Backbone, AccessoryView, template) {
  var AccessoriesView = Backbone.View.extend({
    _template: _.template(template),
    initialize: function() {
      this.Show();
      this.LoadItems(this.collection);
      $("#accessory-content").trigger("create");
    },

    LoadItems: function(collection) {
      this.GroupByCustomerName(collection);
      $("#accessoryListContainer").listview();
      if (this.myScroll) {
        this.myScroll.refresh()
      } else {
        this.myScroll = new iScroll('accessory-content', {
          hScroll: false
        });
      }
    },

    GroupByCustomerName: function(collection) {
      var _collection = collection.pluck('ItemName');
      var _result = _.groupBy(_collection, function(item) {

        return item.charAt(0).toUpperCase();

      });

      for (var item in _result) {

        $("#accessoryListContainer").append("<li data-role='list-divider'>" + item.charAt(0) + "</li>");

        collection.each(function(model) {

          var _item = model.get("ItemName");

          if (_item.charAt(0).toUpperCase() === item.toUpperCase()) {

            this.accessoryview = new AccessoryView({
              model: model
            });
            $("#accessoryListContainer").append(this.accessoryview.render().el);

          }
        })
      }

    },

    Show: function() {
      this.$el.html(this._template);
    }
  });
  return AccessoriesView;
});
