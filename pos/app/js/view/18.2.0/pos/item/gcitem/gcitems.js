
define([
  'jquery',
  'mobile',
  'backbone',
  'underscore',
  'shared/enum',
  'shared/shared',
  'shared/global',
  'view/18.2.0/pos/item/gcitem/gcitem',
  'text!template/18.2.0/pos/item/gcitem/gcitems.tpl.html',
], function($, $$, Backbone, _, Enum, Shared, Global, GCItemView, Template) {
  var GCItemListView = Backbone.View.extend({
    template: _.template(Template),

    generatedSerial: 0,

    events: {
      "tap #done-gcList": "done_tap",
      "tap #cancel-gcList": "close_tap"
    },

    afterGeneration: function() {
      this.selectedModel.set({
        IsSerialGenerated: true
      });
      this.selectedModel = null;
      this.generatedSerial++;
    },

    close_tap: function(e) {
      e.preventDefault();
      $("#main-transaction-blockoverlay").hide();
      this.Hide();
    },

    done_tap: function(e) {
      e.preventDefault();

      //if (this.generatedSerial === 0 || this.totalGCItems != this.generatedSerial) {
      //    switch (Global.TransactionType) {
      //        case Enum.TransactionType.SalesRefund:
      //            navigator.notification.alert('You must include serial(s) for the item(s) to be returned.', null, 'Action not allowed', 'OK');
      //            break;
      //        default:
      //            navigator.notification.alert('You must generate serial(s) for the item(s) below in order to proceed.', null, 'Action not allowed', 'OK');
      //            break;
      //    }
      //    return;
      //}

      if (this.totalGCItems >= 1) {
        if (this.generatedSerial === 0 || this.totalGCItems != this.generatedSerial) {
          switch (Global.TransactionType) {
            case Enum.TransactionType.SalesRefund:
              navigator.notification.alert('You must include serial(s) for the item(s) to be returned.', null, 'Action not allowed', 'OK');
              break;
            default:
              navigator.notification.alert('You must generate serial(s) for the item(s) in order to proceed.', null, 'Action not allowed', 'OK');
              break;
          }
          return;
        }
      }
      $("#main-transaction-blockoverlay").hide();
      this.Hide();
    },

    initialize: function() {
      this.serialCollection = this.options.serialCollection;
      this.render();
      this.LoopGCItems();
      $("#gcListContainer").listview("refresh");
    },

    render: function() {
      this.CountGCandSerial();

      this.$el.html(this.template);
      if (Global.TransactionType === Enum.TransactionType.SalesRefund) {
        if (this.totalGCItems >= 1 && this.totalSerialItems >= 1) {
          this.$("#gclookup-title").text("Serial Generator");
          this.$("#gclookup-info").append("<p>Item(s) in cart that needs serial generation.</p><p>Tap on each item to generate serial or lot number(s) to return.</p>");
        } else if (this.totalGCItems >= 1 && this.totalSerialItems === 0) {
          this.$("#gclookup-info").append("<p>Item(s) in cart that are Gift Card and Gift Certificate</p><p>Tap on each item to generate serial to return.</p>");
        } else if (this.totalGCItems === 0 && this.totalSerialItems > 1) {
          this.$("#gclookup-title").text("Serial and Lot");
          this.$("#gclookup-info").append("<p>Item(s) in cart that have Serial or Lot as SerializeLot type.</p><p>Tap on each item to generate serial or lot number(s) to return.</p>");
        }
      } else {
        if (this.totalGCItems >= 1 && this.totalSerialItems >= 1) {
          this.$("#gclookup-title").text("Serial Generator");
          this.$("#gclookup-info").append("<p>Item(s) in cart that needs serial generation.</p><p>Tap on each item to generate serial.</p>");
        } else if (this.totalGCItems >= 1 && this.totalSerialItems === 0) {
          this.$("#gclookup-info").append("<p>Item(s) in cart that are Gift Card and Gift Certificate</p><p>Tap on each item to generate serial.</p>");
        } else if (this.totalGCItems === 0 && this.totalSerialItems > 1) {
          this.$("#gclookup-title").text("Serial and Lot");
          this.$("#gclookup-info").append("<p>Item(s) in cart that have Serial or Lot as SerializeLot type.</p><p>Tap on each item to generate serial or lot number(s).</p>");
        }

      }
      $("#gcListContainer").listview();
      this.Hide();
      this.$("#gclookup-content ").attr("style", "height:508px;");
    },

    CountGCandSerial: function() {
      var countSerial = this.collection.filter(function(model) {
        return (model.get("SerializeLot") === Enum.SerialLotType.Serial || model.get("SerializeLot") === Enum.SerialLotType.Lot);
      });

      var countGC = this.collection.filter(function(model) {
        return (model.get("ItemType") === Enum.ItemType.GiftCard || model.get("ItemType") === Enum.ItemType.GiftCertificate);
      });

      this.totalSerialItems = countSerial.length;
      this.totalGCItems = countGC.length;
    },

    Hide: function() {
      this.$("#gclookup").hide();
    },

    LoopGCItems: function() {
      var self = this;
      var isDisabled = false;
      this.collection.each(function(model) {
        if (!Shared.IsNullOrWhiteSpace(self.serialCollection) && self.serialCollection.length > 0) {
          var serialItems = self.serialCollection.filter(function(serial) {
            return serial.get("ItemCode") === model.get("ItemCode") && serial.get("UnitMeasureCode") === model.get("UnitMeasureCode");
          });

          if (!Shared.IsNullOrWhiteSpace(serialItems) && (serialItems.length === (model.get("QuantityOrdered") * model.get("UnitMeasureQty")))) {
            isDisabled = true;
            self.generatedSerial++;
          } else {
            isDisabled = false;
          }
        }
        self.RenderItems(model, isDisabled);
      });
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      if (!Global.isBrowserMode) Shared.Printer.LoadScroll(this.myScroll, 'gclookup-content', {
        vScrollbar: false,
        vScroll: true,
        snap: false,
        momentum: true
      });
      else Shared.UseBrowserScroll("#gclookup-content");
    },

    ProcessSelected: function(model) {
      this.selectedModel = model;
      this.trigger('generateSerial', model);
    },

    RenderItems: function(model, isDisabled) {
      var gcItemView = new GCItemView({
        model: model
      });
      gcItemView.on('selected', this.ProcessSelected, this);
      $("#gcListContainer").append(gcItemView.render().el);
      if (isDisabled) gcItemView.disableItem(model);
    },

    Show: function() {
      this.$("#gclookup").show();
      $("#main-transaction-blockoverlay").show();
    }
  });
  return GCItemListView;
})
