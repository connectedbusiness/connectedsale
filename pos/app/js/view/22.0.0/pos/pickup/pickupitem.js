/**
 * @author Connected Business, MJF
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'shared/shared',
  'model/base',
  'collection/base',
  'text!template/19.0.0/pos/pickup/pickupitem.tpl.html',
  'js/libs/iscroll.js'
], function($, $$, _, Backbone, Global, Shared, BaseModel, BaseCollection, EmailTemplate) {
  var PickupItemView = Backbone.View.extend({

    events: {
      "tap .btn-pickup-more": "btnMore_Tap",
      "tap .btn-pickup-print": "btnPrint_Tap",
      "tap .btn-pickup-reprint": "btnPrint_Tap",
      "tap .btn-pickup-confirm": "btnConfirm_Tap"
    },

    _template: _.template(EmailTemplate),

    initialize: function() {
      this.render();

      //Event To Remove Order From List
      this.model.on('destroy', function() {
        this.unbind();
        this.remove();
      }, this);

      //Change Printing Button
      this.model.on('printed', function() {
        this.$el.find('.btn-pickup-print').hide();
        this.$el.find('.btn-pickup-reprint').show();
      }, this);
    },

    render: function() {

      //format the date for display
      var _transactionDate = this.model.get("SalesOrderDate");
      _transactionDate = new Date(parseInt(_transactionDate.substr(6)));
      var month = _transactionDate.getMonth() + 1;
      var day = _transactionDate.getDate();
      var year = _transactionDate.getFullYear();
      var _billtoName = Shared.Escapedhtml(this.model.get("BillToName"));
      _transactionDate = month + "/" + day + "/" + year;

      this.model.set({
        FormattedBillToName: _billtoName,
        FormattedDate: _transactionDate
      });

      this.$el.html(this._template(this.model.toJSON()));
      return this;
    },

    btnPrint_Tap: function(e) {
      this.model.trigger('print-picking-ticket', this.model)
    },

    btnConfirm_Tap: function(e) {
      this.model.trigger('ready-for-invoice', this.model);
    },

    btnMore_Tap: function(e) {
      this.toggleMore();
    },

    toggleMore: function() {
      var itemList = this.$el.find('.pickup-items');
      var moreIcon = this.$el.find('.btn-pickup-more i');
      var moreBtn = this.$el.find('.btn-pickup-more');
      var self = this;

      if (itemList.css('display') != 'none') {
        itemList.hide('fast', function() {
          self.model.trigger('refresh-scroll');
        });
        moreIcon.addClass('icon-chevron-down');
        moreIcon.removeClass('icon-chevron-up');
      } else {
        itemList.show('fast', function() {
          self.model.trigger('refresh-scroll');
        });
        moreIcon.removeClass('icon-chevron-down');
        moreIcon.addClass('icon-chevron-up');
        this.loadDetails();
      }
    },

    loadDetails: function() {
      if (this.itemCollection) {
        this.displayItems();
        return;
      }

      var self = this;
      this.itemCollection = new BaseCollection();
      this.itemCollection.url = Global.ServiceUrl + 'Transactions/loadorderdetail/' + (this.model.get('SalesOrderCode') || '');
      this.itemCollection.parse = function(response) {
        return response.SalesOrderDetails;
      }
      this.itemCollection.fetch({
        success: function(collection, response) {
          self.displayItems();
        },
        error: function(collection, error, response) {

        }
      });
    },

    displayItems: function() {
      var self = this;
      var itemList = this.$el.find('.pickup-items ul');
      itemList.html('');
      var isDarkerRow = true;
      self.itemCollection.each(function(model) {
        itemList.append('<li class="' + (isDarkerRow ? 'isDarkerRow' : '') + '">' + model.get('ItemDescription') + '<span>' + model.get('QuantityOrdered') + '</span></li>');
        isDarkerRow = !isDarkerRow;
      });
      self.model.trigger('refresh-scroll');
    }

  });

  return PickupItemView;
});
