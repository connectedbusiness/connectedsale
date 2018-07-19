/**
 * @author Connected Business
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/shared',
  'view/15.0.1/pos/item/header-info/shipto/shipto',
  'text!template/15.0.1/pos/item/header-info/shipto/shiptos.tpl.html',
  'js/libs/iscroll.js'
], function($, $$, _, Backbone, Shared, ShipToView, template) {
  var ShipTosView = Backbone.View.extend({
    _template: _.template(template),
    initialize: function() {
      this.Show();
      this.collection.on('reset', this.LoadItems, this);
      $("#shipto-content").trigger("create");
    },

    LoadItems: function() {
      Shared.BlurItemScan();
      this.GroupByShipToName(this.collection);
      $("#shiptoListContainer").listview("refresh");
      if (this.myScroll) {
        this.myScroll.refresh()
      } else {
        this.myScroll = new iScroll('shipto-content', {
          hScroll: false
        });
      }
    },

    GroupByShipToName: function(collection) {
      var _collection = collection.pluck('ShipToName');
      var _result = _.groupBy(_collection, function(shipto) {

        return shipto.charAt(0).toUpperCase();

      });

      for (var shipto in _result) {

        $("#shiptoListContainer").append("<li data-role='list-divider'>" + shipto + "</li>");

        collection.each(function(model) {

          var _shipto = model.get("ShipToName");

          model.set({
            DisplayShipToName: Shared.Escapedhtml(_shipto)
          });

          if (_shipto.charAt(0).toUpperCase() === shipto.toUpperCase()) {

            this.shiptoView = new ShipToView({
              model: model
            });
            $("#shiptoListContainer").append(this.shiptoView.render().el);

          }
        })
      }

    },

    Show: function() {
      this.$el.html(this._template);
    }
  });
  return ShipTosView;
});
