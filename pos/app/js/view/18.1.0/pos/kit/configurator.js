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
  'view/18.1.0/pos/kit/kit',
  'view/18.1.0/pos/kit/preview',
  'text!template/18.1.0/pos/kit/configurator.tpl.html',
  'js/libs/iscroll.js'
], function($, $$, _, Backbone, BaseModel, BaseCollection, Global, Service, Shared, Method, Enum, KitItemDetailView, PreviewItemView, template) {
  return Backbone.View.extend({
    template: _.template(template),
    events: {
      "click #done": "done",
      "click #cancel": "cancel"
    },
    cancel: function(e) {
      e.preventDefault();
      this.close();
    },
    finish: function(e) {
      e.preventDefault();

      var stock = this.kitOption.filter(function(detail) {
        return detail.get('ItemType') === Enum.ItemType.Stock;
      });
      this.result.add(stock);
      this.trigger('getItems', this.result);
    },
    initialize: function() {
      this.$el.html(this.template({
        KitItemCode: this.model.get("ItemCode"),
        KitDescription: this.model.get("ItemDescription"),
        Total: this.model.get("Price"),
        Currency: Global.CurrencySymbol,
        Quantity: this.model.get("QuantityOrdered") ? this.model.get('QuantityOrdered') : 1
      }));
      this.coupon = this.options.coupon;
      this.getKitOptionGroup();
      this.kitPreview = this.$el.find('#kit-configurator-preview');
      this.result = new BaseCollection();
    },
    render: function() {
      $("#main-transaction-blockoverlay").show();
      return this;
    },
    getKitOptionGroup: function() {
      var model = new BaseModel(),
        code = this.model.get('ItemCode'),
        kitItems = JSON.parse(window.sessionStorage.getItem('kitItems-' + this.options.lineNum)),
        hasCachedKitItems = kitItems ? true : false,
        warehouseCode = (Global.Preference.DefaultLocation) ? '&warehouseCode='+ Global.Preference.DefaultLocation : '',
        defaultPrice = (Global.CurrentCustomer.DefaultPrice) ? '&defaultPrice='+ Global.CurrentCustomer.DefaultPrice : '&defaultPrice='+ Global.Preference.CustomerDefaultPrice,
        webSiteCode = (Global.Preference.WebSiteCode) ? '&websiteCode='+ Global.Preference.WebSiteCode : '';

      model.url = Global.ServiceUrl + Service.PRODUCT + Method.GETITEMKITDETAILS + '?itemKitCode='+code + defaultPrice + warehouseCode + webSiteCode;
      model.fetch({
        success: function(model, response, options) {
          this.kitOption = new BaseCollection(response.KitOptionDetail);

          this.kitDetails = new BaseCollection(response.KitDetails);

          this.kitDetails.each(function(detail) {
            if (hasCachedKitItems) {
              var cachedItem = _.find(kitItems, function(item) {
                return item.ItemCode === detail.get('ItemCode') && item.GroupCode === detail.get('GroupCode');
              });

              if (cachedItem) detail.set('IsDefault', cachedItem.IsDefault);
              else detail.set('IsDefault', false);
            }

            detail.get('IsDefault') ? detail.set('IsSelected', true) : detail.set('IsSelected', false);
          });

          this.kitOption.on('resetSelected', function() {
            var list = this.$('ul').children();
            _.each(list, function(li) {
              $(li).removeClass('selected');
            });
          }.bind(this));

          this.kitOption.on('selected_option', this.getKitItemDetails, this);
          this.kitDetails.on('selected_item', this.updateOptionGroupPrice, this);
          this.renderAllKitOptionGroup(true);
        }.bind(this),
        error: function(model, xhr, options) {
          navigator.notification.alert('Failed to retrieve Kit Detail', null, 'Error', 'OK');
        }.bind(this)
      });
    },
    updateOptionGroupPrice: function(data) {
      //always get First item from selected kit details
      var selected = this.kitOption.find(function(option) {
        return option.get('GroupCode') == data.at(0).get('GroupCode');
      });

      this.kitOption.each(function(option) {
        var sum = data.reduce(function(memo, num) {
          var pricing = (Global.CurrentCustomer.DefaultPrice) ? Global.CurrentCustomer.DefaultPrice : Global.Preference.CustomerDefaultPrice;
          if (pricing === 'Retail') return memo + num.get("RetailPrice");
          else return memo + num.get("WholeSalePrice");
        }, 0);

        if (data.length > 0 && data.at(0).get("GroupCode") == option.get("GroupCode")) option.set("Price", sum);
      }.bind(this));

      if (data.length > 0) {
        this.$('#kit-configurator-list').find('ul').empty();
        this.renderAllKitOptionGroup(false);
        this.$('#kit-configurator-list').find('ul').find('#' + selected.cid).addClass('selected');
      }
    },
    renderAllKitOptionGroup: function(isShowFirstItem) {
      this.kitOption.each(this.renderOneKitOption, this);
      this.$('#kit-configurator-list').find('ul').listview().listview('refresh');
      if (isShowFirstItem) this.getKitItemDetails(this.kitOption.at(0));

      if (isShowFirstItem) this.$('#kit-configurator-list').find('ul').find('li:first-child').addClass('selected');
      this.loadScrollOptions();
    },
    render: function() {
      $("#main-transaction-blockoverlay").show();
      return this;
    },
    renderOneKitOption: function(model, i) {
      var data = this.kitDetails.filter(function(detail) {
        return detail.get("GroupCode") == model.get("GroupCode") && detail.get("IsSelected") == true;
      });

      var kitDetailView = new KitItemDetailView({
        model: model,
        collection: this.kitDetails
      });
      this.$('#kit-configurator-list').find('ul').append(kitDetailView.render().el);
      kitDetailView.setSelectedPrice(new BaseCollection(data));
    },
    getKitItemDetails: function(data) {
      var model = new BaseModel(),
        code = data.get('GroupCode'),
        kitCode = data.get('ItemKitCode');
      var kitDetailByItemCode = new BaseCollection(this.kitDetails.filter(function(detail) {
        return detail.get("GroupCode") === code
      }));
      this.renderKitItemDetails(kitDetailByItemCode, code);
    },
    renderKitItemDetails: function(data, code) {
      var groupType = this.kitOption.find(function(option) {
        return option.get('GroupCode') === code;
      }),
      self = this;
      this.groupType = groupType.get("GroupType");
      this.itemKitcode = groupType.get("ItemKitCode");
      this.$('#kit-configurator-preview').find('ul').empty();
      data.each(function(detail) {
        self.renderOneKitDetail(detail, self.groupType, code);
      });
      this.$('#kit-configurator-preview').find('ul').listview().listview('refresh');
      this.loadScrollDetails();
    },
    renderOneKitDetail: function(model, type, code) {
      var kitPreviewView = new PreviewItemView({
        model: model,
        groupType: type,
        collection: this.kitDetails,
        groupCode: code,
        group: this.kitOption
      });
      this.$('#kit-configurator-preview').find('ul').append(kitPreviewView.render().el);
      kitPreviewView.setSelected(model.cid);
    },
    close: function() {
      $('#main-transaction-blockoverlay').hide();
      this.unbind();
      this.remove();
    },
    done: function(e) {
      e.preventDefault();
      //this.close();
      var model = new BaseModel(),
        data = null,
        saleItem = new BaseModel(),
        transactionType = Global.TransactionType,
        self = this;

      this.kitDetails.each(function(kit){
          kit.set("OriginalQuantity",kit.get("Quantity"));
        });
        
      var itemCodes = this.kitDetails.filter(function(detail) {
        return detail.get("IsSelected") === true
      });

      var requiredCodes = _.filter(itemCodes, function(detail) {
        return detail.get("GroupType") == self.groupType;
      });

      if (requiredCodes.length == 0) {
        navigator.notification.alert('You are required to select at least one (1) item for this Require group', null, 'Action not Allowed', 'OK');
        return;
      }

      if (Global.TransactionType == Enum.TransactionType.UpdateInvoice) transactionType = Enum.TransactionType.ResumeSale;

      var taxCode = window.sessionStorage.getItem('selected_taxcode'),
        couponID = (this.coupon) ? this.coupon.get('CouponID') : null,
        qty = this.$el.find('#qty').val();

      saleItem.set({
        ItemCode: this.itemKitcode,
        CustomerCode: Global.CustomerCode,
        WarehouseCode: Global.LocationCode,
        UnitMeasureCode: 'EACH',
        IsTaxByLocation: Global.Preference.TaxByLocation,
        CouponId: couponID,
        ShipToCode: Global.ShipTo.ShipToCode,
        WebsiteCode: Shared.GetWebsiteCode(),
        DiscountPercent: Global.ShipTo.DiscountPercent,
        DiscountType: Global.ShipTo.DiscountType,
        LineNum: null,
        TaxCode: (taxCode) ? taxCode : Global.ShipTo.TaxCode,
        TransactionType: transactionType,
        QuantityOrdered: parseInt(qty)
      });

      model.url = Global.ServiceUrl + Service.SOP + 'salekititemtax/';
      model.set("KitDetails", itemCodes);
      model.set("SaleItemGroup", saleItem);
      model.save(null, {
        success: function(model, response, options) {
          if (response.ErrorMessage) {
            navigator.notification.alert(response.ErrorMessage, null, 'Error', 'OK');
            return;
          }

          if (self.options.isEditMode) self.trigger('editItems', response);
          else self.trigger('getItems', response);
          self.close();
        },
        error: function(model, xhr, options) {
          navigator.notification.alert("There seem to be a problem computing tax for kit item(s)", null, "Error", "OK");
        }
      });
    },
    loadScrollDetails: function() {
      var id = 'kit-configurator-preview',
      scrollAttrib = {
        vScrollbar: false,
        vScroll: true,
        snap: false,
        momentum: true,
        hScrollbar: true,
        onBeforeScrollStart: function(e) {
          var target = e.target;
          while (target.nodeType != 1) target = target.parentNode;

          if (target.tagName != 'INPUT') e.preventDefault();
        }
      };

      if (Global.isBrowserMode) Shared.UseBrowserScroll('#' + id);
      else {
        if (!this.myScrollDetails) this.myScrollDetails = new iScroll(id, scrollAttrib);
        else this.myScrollDetails.refresh();
      }
    },
    loadScrollOptions: function() {
      var id = 'kit-configurator-list',
      scrollAttrib = {
        vScrollbar: false,
        vScroll: true,
        snap: false,
        momentum: true,
        hScrollbar: true
      };

      if (Global.isBrowserMode) Shared.UseBrowserScroll('#' + id);
      else {
        if (!this.myScrollOptions) this.myScrollOptions = new iScroll(id, scrollAttrib);
        else this.myScrollOptions.refresh();
      }
    }
  });
});
