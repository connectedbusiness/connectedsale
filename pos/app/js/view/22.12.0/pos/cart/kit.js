define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'shared/enum',
  'collection/base',
  'view/22.12.0/pos/cart/kititem',
  'text!template/22.12.0/pos/cart/kit.tpl.html'
], function($, $$, _, Backbone, Global, Enum, BaseCollection, KitItemView, template) {

  return Backbone.View.extend({
    template: _.template(template),
    tagName: 'tbody',
    initialize: function() {            
      this.$el.html(this.template({
        id: this.options.id
      }));
      this.$el.attr('id', 'kit-' + this.options.id);
      this.$el.attr('class', 'cartKitDetails');
      this.$el.attr('style', 'display:none; background: #E1E1E1; box-shadow:0px 8px 7px #CFCFCF inset;');
      if (Global.TransactionType == Enum.TransactionType.SalesRefund) {
        this.$el.find('#kit-edit').hide();
        this.$el.find('#items').attr('colspan', 8);
        this.$el.find('#summary').attr('colspan', 8);
      }
    },
    render: function() {
      var self = this;
      setTimeout(function () {
        self.renderItems();
      }, 100);
      return this;
    },
    renderItems: function () {        
      var kitItems = _.flatten(JSON.parse(window.sessionStorage.getItem('kitItems-'+this.options.lineNum)));
      var items = new BaseCollection(kitItems);

      items.each(this.renderItem, this);

      this.$el.find('#summary').find('div:first-child').html(items.length + ' item(s)');
    },
    renderItem: function (model, i) {
      model.set('LineNum', i+1);
      var kitItemView = new KitItemView({
        model: model
      });

      this.$el.find('#items').append(kitItemView.render().el);
    }
    /*getItems: function() {
      var kitItems = _.flatten(JSON.parse(window.sessionStorage.getItem('kitItems-' + this.options.lineNum))),
        hasBundle = _.find(kitItems, function(item) {
          return (item.ItemType == Enum.ItemType.Kit) ? true : false;
        }),
        items = new BaseCollection(kitItems),
        outputString = '',
        price = 0;


      items.each(function(item, i) {
        var price = Global.CurrencySymbol + ' ' + item.get('Total').toFixed(2),
          lineNum = i + 1,
          code = item.get('ItemCode'),
          name = item.get('ItemName'),
          qty = item.get('Quantity'),
          type = item.get('ItemType');

        this.$el.find('#items').append('<div id="' + lineNum + '" style="padding: 0px 5px;"></div>');
        if (type === Enum.ItemType.Bundle) this.getBundleItems(lineNum, code);
        outputString = '<span>' + lineNum + ') ' + name + ' x ' + qty + ' (' + price + ')</span></br>';
        this.$el.find('#items').find('div#' + lineNum).prepend(outputString);
      }.bind(this));

      
    }*/
  });
});
