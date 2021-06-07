define([
 'jquery',
  'mobile',
  'underscore',
  'backbone',
  'model/base',
  'collection/base',
  'shared/global',
  'shared/service',
  'shared/shared',
  'shared/method',
  'shared/enum',
  'view/21.0.0/pos/bundle/bundle',
  'view/21.0.0/pos/bundle/preview',
  'text!template/21.0.0/pos/bundle/configurator.tpl.html',
  'js/libs/iscroll.js'
], function($, $$, _, Backbone, BaseModel, BaseCollection, Global, Service, Shared, Method, Enum, BundleItemDetailView, PreviewItemView, template) {
  var BundleConfiguratorView = Backbone.View.extend({
    template: _.template(template),
    events: {
      "click #done": "done",
      //"keypress #qty": "updateQty",
      "click #cancel": "cancel"
    },
    cancel: function(e) {
      e.preventDefault();
      this.close();
    },
    finish: function(e) {
      e.preventDefault();

      var stock = this.bundleDetail.filter(function(detail) {
        return detail.get('ItemType') === Enum.ItemType.Stock;
      });

      this.result.add(stock);
      this.trigger('getitems', this.result);
    },
    done: function(e) {
      e.preventDefault();
      //this.close();
      var model = new BaseModel(),
        data = null, //JSON.parse(window.sessionStorage.getItem('matrix_attributes')),
        saleItem = new BaseModel(),
        transactionType = Global.TransactionType,
        qty = this.$el.find('#qty').val(),
        self = this;

      if (!this.result) {
        navigator.notification.alert('Please select attributes for the matrix item(s) in the list', null, 'Action not Allowed', 'OK');
        this.close();
        return;
      }

      var stockItems = this.bundleDetail.filter(function(detail) {
        return detail.get('ItemType') === Enum.ItemType.Stock;
      });

      var itemCodes = this.result.add(stockItems);

      if (Global.TransactionType == Enum.TransactionType.UpdateInvoice) transactionType = Enum.TransactionType.ResumeSale;

      var taxCode = window.sessionStorage.getItem('selected_taxcode');

      saleItem.set({
        ItemCode: null,
        CustomerCode: Global.CustomerCode,
        WarehouseCode: Global.LocationCode,
        UnitMeasureCode: 'EACH',
        IsTaxByLocation: Global.Preference.TaxByLocation,
        CouponId: null,
        ShipToCode: Global.ShipTo.ShipToCode,
        WebsiteCode: Shared.GetWebsiteCode(),
        DiscountPercent: Global.ShipTo.DiscountPercent,
        DiscountType: Global.ShipTo.DiscountType,
        LineNum: null,
        TaxCode: (taxCode) ? taxCode : Global.ShipTo.TaxCode,
        TransactionType: transactionType,
        QuantityOrdered: parseInt(qty),
        IsUsePOSShippingMethod: Global.Preference.IsUsePOSShippingMethod,
        POSShippingMethod: Global.Preference.POSShippingMethod
      });

      model.url = Global.ServiceUrl + Service.SOP + 'salebundlegrouptax/';
      //model.set("MatrixItem", this.result);
      //model.set("InventoryStockItem", stockItems);
      model.set("BundleCodes", itemCodes.toJSON());
      model.set("SaleItemGroup", saleItem);
      //model.set("QuantityOrdered", parseInt(this.$el.find('#qty').val()));

      model.save(null, {
        success: function(model, response, options) {
          if (response.ErrorMessage) {
            navigator.notification.alert(response.ErrorMessage, null, 'Error', 'OK');
            return;
          }
          console.log('success');
          self.trigger('getitems', response.SaleItems);
          self.close();
        },
        error: function(model, xhr, options) {
          navigator.notification.alert('There seem to be a problem with computing tax for bundle item(s)', null, 'Error', 'OK');
        }
      });
    },
    updateQty: function(e) {
      if (e.keyCode === 13) {
        this.$el.find('ul').empty();
        this.bundleDetail.reset(this.items);
        this.updateBundleQty(parseInt(e.currentTarget.value));
        //this.populateItemQty();
        this.renderAllBundleDetail();
      }
    },
    initialize: function() {
      this.$el.html(this.template({
        BundleCode: this.model.get('ItemCode'),
        BundleDescription: this.model.get('ItemDescription'),
        Total: this.model.get('Price'),
        Currency: Global.CurrencySymbol
      }));

      this.getBundleDetail();

      this.bundlePreview = this.$el.find('#bundle-configurator-preview');
      this.result = new BaseCollection();
    },
    render: function() {
      $("#main-transaction-blockoverlay").show();
      //this.loadScroll();
      return this;
    },
    close: function() {
      $('#main-transaction-blockoverlay').hide();
      window.sessionStorage.removeItem('matrix_attributes');
      this.unbind();
      this.remove();
    },
    loadScroll: function() {
      if (Global.isBrowserMode) Shared.UseBrowserScroll('#bundle-configurator-list');
      else {
        if (!this.myScroll) this.myScroll = new iScroll('bundle-configurator-list');
        else this.myScroll.refresh();
      }
    },
    getBundleDetail: function() {
      var model = new BaseModel(),
        code = this.model.get('ItemCode'),
        pricing =  (Global.CurrentCustomer.DefaultPrice) ? '&defaultPrice=' + Global.CurrentCustomer.DefaultPrice : '&defaultPrice=' + Global.Preference.CustomerDefaultPrice,
        warehouseCode = (Global.Preference.DefaultLocation) ? '&warehouseCode=' + Global.Preference.DefaultLocation : '',
        websiteCode = (Global.Preference.WebsiteCode) ? '&websiteCode=' + Global.Preference.WebSiteCode : '',
        self = this;

      model.url = Global.ServiceUrl + Service.PRODUCT + Method.GETBUNDLEDETAIL + '?bundleCode='+code + pricing + warehouseCode + websiteCode;
      model.fetch({
        success: function(model, response, options) {
          self.matrixItems = new BaseCollection(response.MatrixItems);
          self.bundleDetail = new BaseCollection(response.Items);
          self.items = response.Items;
          self.bundleDetail.on('resetSelected', function() {
            self.$('ul').find('li').removeClass('selected');
          });
          self.bundleDetail.on('selected_matrix', self.getMatrixGroupAttributes, self);
          self.bundleDetail.on('selected_stock', self.renderStockAttributes, self);
          self.bundleDetail.on('updateAttribDisplay', self.updateAttribDisplay, self);
          //this.populateItemQty();
          self.renderAllBundleDetail();
        },
        error: function(model, xhr, options) {
          navigator.notification.alert('Failed to retrieve Bundle Detail', null, 'Error', 'OK');
        }
      });
    },
    getMatrixGroupAttributes: function(data) {
      var model = new BaseModel(),
         code = '?itemCode=' + data.get('ItemCode'),
        type = data.get('ItemType'),
        warehouseCode = '&warehouseCode=' + Global.Preference.DefaultLocation,
        self = this;

      model.url = Global.ServiceUrl + Service.PRODUCT + Method.GETMATRIXGROUPATTRIBUTES + code + warehouseCode;
      model.fetch({
        success: function(model, response, options) {
          self.matrixAttributes = new BaseCollection(response.MatrixAttributes);
          self.renderMatrixAttributes(type, code, data);
        },
        error: function(model, xhr, options) {
          navigator.notification.alert('Failed to retrieve Matrix group attributes', null, 'Error', 'OK');
        }
      });
    },
    renderAllBundleDetail: function() {
      this.populateItemQty();
      this.totalStockItems();
      this.bundleDetail.each(this.renderOneBundleDetail, this);
      this.$el.find('ul').listview().listview('refresh');
      this.loadScroll();

      //render first item
      if (this.bundleDetail.at(0).get('ItemType') === Enum.ItemType.Stock) {
        this.renderStockAttributes(this.bundleDetail.at(0));
      } else {
        this.getMatrixGroupAttributes(this.bundleDetail.at(0));
      }

      this.$el.find('ul').find('li:first-child').addClass('selected');
    },
    computeStockItems: function() {
      var stockItems = this.bundleDetail.filter(function(data) {
        return data.get('ItemType') === Enum.ItemType.Stock;
      });

      return price = _.reduce(stockItems, function(num, data) {
        var pricing = (Global.CurrentCustomer.DefaultPrice) ? Global.CurrentCustomer.DefaultPrice : Global.Preference.CustomerDefaultPrice;
        if (pricing === 'Retail' && data.get('ItemType') === Enum.ItemType.Stock) {
          return data.get('RetailPrice') + num;
        } else {
          return data.get('WholeSalePrice') + num;
        }
      }, 0);
    },
    totalStockItems: function() {
      this.$el.find('#total > span').text(this.computeTotal((this.computeStockItems()) ? price : 0));
    },
    renderOneBundleDetail: function(model) {
      if (model.get('ItemType') != Enum.ItemType.MatrixItem) {
        var bundleDetailView = new BundleItemDetailView({
          model: model
        });
        this.$el.find('ul').append(bundleDetailView.render().el);
      }
    },
    renderMatrixAttributes: function(type, code, data) {
      var previewItemView = new PreviewItemView({
        collection: this.matrixAttributes,
        matrixItems: this.matrixItems,
        model: data,
        type: type,
        code: code
      });

      this.bundlePreview.html(previewItemView.render().el);
      previewItemView.loadScroll();
    },
    renderStockAttributes: function(data) {
      var previewItemView = new PreviewItemView({
        model: data,
        type: data.get('ItemType'),
        code: data.get('ItemCode')
      });

      this.bundlePreview.html(previewItemView.render().el);
      previewItemView.loadScroll();
    },
    computeTotal: function(price) {
      var qty = this.$el.find('#qty').val();
      var total = 0; //this.$el.find('#total > span').text();

      total = (parseFloat(price) * parseInt(qty));

      return total.toFixed(2);
    },
    updateAttribDisplay: function(data) {
      if (data) {
        var el = this.$el.find('#' + data.ID);
        var model = data.model;
        var item = this.result.find(function (item) {
          return item.get('ItemID') == model.get('ItemID');
        });
        
        if (item) this.result.remove(item);
        
        this.result.add(model);


        var price = (this.result.length != 0) ? this.result.reduce(function(memo, num) {
            return memo + num.get('Price')
          }, 0) : data.price(false),
          total = this.computeStockItems() + price;

        el.find('.item-attrib').text(data.value());
        el.find('.item-price').find('h5').html(data.price(true));
        this.$el.find('#total').find('span').text(this.computeTotal(total));
      }
    },
    populateItemQty: function() {
      var addItems = [];

      var filteredItem = this.bundleDetail.filter(function (model) {
        return model.get('ItemType') != Enum.ItemType.Stock;
      });

      if (filteredItem) {
        _.each(filteredItem, function (item) {
          var modelClone;

          for (var i = 1; i < item.get('Quantity'); i++) {
            modelClone = _.clone(item);
            addItems.push(modelClone.attributes);
          }
        }.bind(this));
      }

      this.bundleDetail.add(addItems);

      this.bundleDetail.each( function (dtl, i) {
        //add detailLineNum
        dtl.set('DetailLineNum', i + 1);
      });

      this.bundleDetail.comparator = function (dtl) {
        return dtl.get('DetailLineNum');
      };

      this.bundleDetail.sort();
    },
    updateBundleQty: function(qty) {
      var addItems = [];
      this.bundleDetail.comparator = function(model) {
        return model.get('ItemType');
      };

      this.bundleDetail.sort();

      this.bundleDetail.each(function(model) {
        for (var i = 1; i < qty; i++) {
          var modelClone = _.clone(model);
          addItems.push(modelClone.attributes);
        }
      }.bind(this));
      this.bundleDetail.add(addItems);
    }
  });
  return BundleConfiguratorView;
});
