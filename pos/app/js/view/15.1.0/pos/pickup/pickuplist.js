/**
 * @author Connected Business, MJF
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/enum',
  'shared/service',
  'shared/method',
  'shared/global',
  'shared/shared',
  'model/lookupcriteria',
  'collection/base',
  'view/15.1.0/pos/pickup/pickupitem',
  'text!template/15.1.0/pos/pickup/pickuplist.tpl.html',
  'js/libs/iscroll.js'
], function($, $$, _, Backbone, Enum, Service, Method, Global, Shared, LookupCriteria, BaseCollection, PickupItemView, EmailTemplate) {
  var PickupListView = Backbone.View.extend({

    events: {},

    _template: _.template(EmailTemplate),

    initialize: function() {
      var self = this;
      this.on('update-list', this.updateCollection, this)
      this.show();
    },

    render: function() {
      this.$el.html(this._template);
      this.show();
      this.loadPickups();
      return this.$el;
    },

    show: function() {
      this.$el.show();
    },

    hide: function() {
      this.$el.hide();
    },

    printPickingTicket: function(model) {
      this.trigger('print-picking-ticket', model);
    },

    readyForInvoice: function(model) {
      this.trigger('ready-for-invoice', model);
    },

    updateCollection: function(soCode, isPickingTickedPrinted) {
      if (!this.orderCollection) return;
      if (this.orderCollection.length == 0) return;
      var self = this;
      var toRemove = null;
      this.orderCollection.each(function(model) {
        if (soCode == model.get('SalesOrderCode')) {
          if (isPickingTickedPrinted) model.trigger('printed');
          toRemove = model;
        }
      });
      if (!isPickingTickedPrinted && toRemove) {
        toRemove.trigger('destroy');
        this.orderCollection.remove(toRemove);
      }
      if (this.orderCollection)
        if (this.orderCollection.length == 0) {
          this.resetOrderCollection(null);
        }
    },

    loadPickups: function() {
      this.RefreshMyScroll(true);
      this.$el.find('#pickup-list-ul').html(this.setDefaultDisplay('Loading...'));

      var self = this;
      var lookup = new LookupCriteria();
      var rowsToSelect = "100";

      lookup.set({
        CriteriaString: '',
        DateTimeTicks: 0,
        IsTrackStorePickUp: Global.Preference.IsTrackStorePickUp,
        PickupStage: '4',
        WarehouseCode: Global.Preference.DefaultLocation
      });

      lookup.url = Global.ServiceUrl + Service.SOP + Method.ORDERLOOKUP + rowsToSelect;
      lookup.save(null, {
        success: function(model, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          self.resetOrderCollection(response.SalesOrders);
        },
        error: function(model, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
        }
      });

    },

    RefreshMyScroll: function(isRemove) {
      if (Global.isBrowserMode) return;

      if (isRemove && this.myScroll) {
        this.myScroll.destroy();
        this.myScroll = null;
        return;
      }

      if (!this.myScroll) {
        this.myScroll = new iScroll('pickup-list', {
          vScrollbar: true,
          vScroll: true,
          snap: false,
          momentum: true,
          zoom: false
        });
      } else {
        this.myScroll.refresh();
      }
    },


    resetOrderCollection: function(salesOrders) {
      if (!this.orderCollection) {
        this.orderCollection = new BaseCollection();

        this.orderCollection.off('print-picking-ticket');
        this.orderCollection.on('print-picking-ticket', this.printPickingTicket, this);

        this.orderCollection.off('ready-for-invoice');
        this.orderCollection.on('ready-for-invoice', this.readyForInvoice, this);

        this.orderCollection.off('refresh-scroll');
        this.orderCollection.on('refresh-scroll', this.RefreshMyScroll, this)
      }
      this.orderCollection.reset(salesOrders);

      this.$el.find('#pickup-list-ul').html('');
      if (this.orderCollection.length == 0) this.$el.find('#pickup-list-ul').html(this.setDefaultDisplay('No New Pickup Order Found.'));

      this.displayPickups();
    },

    setDefaultDisplay: function(val) {
      return '<li class="no-record"><div>' + val + '</div></li> ';
    },

    displayPickups: function() {
      var self = this;
      this.orderCollection.each(function(model) {
        self.addOne(model);
      });
      this.RefreshMyScroll();
    },

    addOne: function(model) {
      var self = this;
      var container = document.createElement('li');
      self.$el.find('#pickup-list-ul').append(container);
      var pickup = new PickupItemView({
        el: container,
        model: model
      });
    }

  });

  return PickupListView;
});
