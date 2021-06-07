/*
 * @author alexis.banaag
 */
define([
  'jquery',
  'mobile',

  'underscore',
  'backbone',
  'bigdecimal',
  'shared/global',
  'shared/enum',
  'shared/service',
  'shared/method',
  'shared/shared',
  'model/lookupcriteria',
  'model/transaction',
  'model/summary',
  'model/salespayment',
  'model/creditmemo',
  'model/coupon',
  'model/print',
  'model/reportsetting',
  'model/override',
  'model/base',
  'model/workstation',
  'model/signature',
  'collection/base',
  'collection/items',
  'collection/cart',
  'collection/categories',
  'collection/itemprices',
  'collection/invoices',
  'collection/invoicedetails',
  'collection/salesorders',
  'collection/salesorderdetails',
  'collection/payments',
  'collection/products',
  'collection/stocks',
  'collection/preferences',
  'collection/transactions',
  'collection/accessories',
  'collection/reasons',
  'collection/coupons',
  'collection/localpreferences',
  'collection/customers',
  'collection/printers',
  'collection/reportsettings',
  'collection/shipto',
  'collection/currentorders',
  'collection/serialnumbers',
  'collection/lotnumbers',
  'collection/customersalereps',
  'view/22.12.0/pos/actions/actions',
  'view/22.12.0/pos/item/header-info/headerinfo',
  'view/22.12.0/pos/item/items',
  'view/22.12.0/pos/cart/cart',
  'view/22.12.0/pos/item/category/categories',
  'view/22.12.0/pos/payment/payment',
  'view/22.12.0/pos/tax/taxlist',
  'view/22.12.0/pos/item/search/product/products',
  'view/22.12.0/pos/item/search/productdetail',
  'view/22.12.0/pos/item/search/stock/stocks',
  'view/22.12.0/pos/transactiontype/transactiontype',
  'view/22.12.0/pos/transactions/transactions',
  'view/22.12.0/pos/payment/payments',
  'view/22.12.0/pos/coupon/coupon',
  'view/22.12.0/pos/signature/signature',
  'view/22.12.0/pos/reason/transactionreason',
  'view/22.12.0/pos/print/printoptions',
  'view/22.12.0/pos/print/printpreview',
  'view/22.12.0/pos/print/dynamicprint',
  'view/22.12.0/pos/print/printer',
  'view/22.12.0/pos/manageroverride/manageroverride',
  'view/22.12.0/pos/payment/refund',
  'view/22.12.0/pos/drawerbalance/openingamount',
  'view/22.12.0/pos/drawerbalance/closingamount',
  'view/22.12.0/pos/report/statusreport',
  'view/22.12.0/pos/payment/paymenttype',
  'view/22.12.0/pos/seriallot/seriallot',
  'view/22.12.0/pos/notes/notescontrol',
  'view/22.12.0/pos/customerpo/customerpo',
  'view/22.12.0/pos/giftcard/giftcard',
  'view/22.12.0/pos/item/upcitem/upcitems',
  'view/22.12.0/pos/item/gcitem/gcitems',
  'view/22.12.0/pos/pickup/pickuplist',
  'view/22.12.0/pos/bundle/configurator',
  'view/22.12.0/pos/kit/configurator',
  'view/22.12.0/pos/promotion/promotion',
  'text!template/22.12.0/header/header.tpl.html',
  'text!template/22.12.0/pos/item/search/search.tpl.html',
  'text!template/22.12.0/pos/item/search/lookup.tpl.html',
  'text!template/22.12.0/pos/pos.tpl.html',
  'view/spinner',
  'js/libs/iscroll.js',
  'js/libs/moment.min.js',
  'js/libs/format.min.js',
  'js/libs/signalr/jquery.signalR-2.0.3.js'
], function($, $$, _, Backbone, BigDecimal, Global, Enum, Service, Method, Shared,
  LookupCriteriaModel, TransactionModel, SummaryModel, SalesPaymentModel, CreditMemoModel,
  CouponModel, PrintModel, ReportSettingModel, OverrideModel, BaseModel, WorkstationModel, SignatureModel,
  BaseCollection, ItemCollection, CartCollection, CategoryCollection, ItemPriceCollection,
  InvoiceCollection, InvoiceDetailCollection,
  SalesOrderCollection, SalesOrderDetailCollection,
  PaymentCollection, ProductCollection, StockCollection, PreferenceCollection, TransactionCollection, AccessoryCollection,
  ReasonCollection, CouponCollection, LocalPreferenceCollection, CustomerCollection, PrinterCollection, ReportSettingCollection, ShipToCollection, CurrentOrderCollection,
  SerialNumberCollection, LotNumberCollection, CustomerSalesRepCollection,
  ActionsView, HeaderInfoView, ItemsView, CartView, CategoriesView, PaymentView, TaxListView,
  ProductsView, ProductDetailView, FreeStockView, TransactionTypeView, TransactionsView,
  PaymentsSummaryView, CouponView, SignatureView, TransactionReasonView, PrintOptionsView, PrintPreviewView, DynamicPrintPreview, PrinterView,
  ManagerOverrideView, RefundView, OpeningAmountView, ClosingAmountView, StatusReportView, PaymentTypeView, SerialLotView, NotesControlView,
  CustomerPOView, GiftCardView, UPCItemsView, GCItemListView, PickupListView, BundleConfiguratorView, KitConfiguratorView, PromotionConfiguratorView,
  HeaderTemplate, SearchTemplate, LookupTemplate, MainTemplate,
  Spinner
) {

  var _rows = 100,
    _criteria = "",
    sortVar = "ItemName",
    _itemCode = "",
    _unitMeasureCode = "",
    _model, _paymentType, _collection, _discountAmount, _cleared, _isReasoned = false,
    _naviThis, _view;
  var isClosedWorkstation = false;
  /**
  The main transaction screen of the Connected Sale

  @class maintemplate
  @namespace view.main
  @constructor
  @extends Backbone.View
  **/
  var PosView = Backbone.View.extend({
    _MainTemplate: _.template(MainTemplate),
    _SearchTemplate: _.template(SearchTemplate),
    _HeaderTemplate: _.template(HeaderTemplate),

    events: {
      "tap #review-transaction-btn": "buttonReviewTransaction_Tap",
      "tap #complete-btn": "buttonComplete_Tap",
      "tap #void-btn": "buttonCancel_Tap",
      "tap #coupon-btn": "buttonCoupon_Tap",
      "tap #searchGo-btn": "buttonSearchGo_Tap",
      //"keyup #search-input" : "inputSearch_KeyUp",
      "keypress #search-input": "inputSearch_KeyPress",
      "tap #search-input": "ShowClearBtn",
      "blur #search-input": "HideClearBtn",
      "focus #search-input": "SearchOnFocus",
      "tap #search-inputClearBtn": "ClearText",

      //Lookup Buttons
      "tap #lookup-btn": "ShowLookup",
      "tap #done-lookup": "LookupDone",
      "tap #back-details": "BackToDetails",
      "tap #back-products": "BackToProductLookup",

      "tap #lookup-product": "SortProductLookUp",
      "tap #lookup-category": "SortCategoryLookUp",
      "tap #onHand-btn": "LoadFreeStockView",
      "tap #add-lookup": "AddLookUpItemToCart",

      // "keyup #lookup-search" : "inputLookUpSearch_KeyUp",
      "keypress #lookup-search": "inputLookUpSearch_KeyPress",
      "tap #lookup-search": "ShowLookupClearBtn",
      "blur #lookup-search": "HideClearBtn",
      "tap #lookup-searchClearBtn": "ClearText",
      //End of Lookup Buttons

      "tap #transaction-selector": "ShowTransactionPopover",
      "tap #action-btn": "ShowActionsPopover",

      "tap #customer-lookup": "ShowCustomerList",
      "tap #customer-selector": "ShowCustomerPopover",
      "tap #lbl-customerName": "ShowCustomerList",

      "tap #gift-card-btn": "ShowGiftCardRecharge",

      "tap #content-wrapper": "FocusToItemScan",
      "tap #cartContainer": "FocusToItemScan",
      "tap .main-toolbar-header": "FocusToItemScan",
      "tap #button-container": "FocusToItemScan",

      "tap #notification-btn": "Notification_Tap",

      "tap #lbl-salesrepName": "ShowSalesRepList"

    },

    /**
    Renders the view

    @method render
    **/
    render: function() {
      //	Global.UserInfo.UserCode = ""; //test // CSL-22242  Cannot log off secondary display using admin credentials
      Global.PrintPluginLoaded = false;
      Global.ApplicationType = "POS";


// then to call it, plus stitch in '4' in the third group

      isClosedWorkstation = false; //RESET VARIABLE
      this.$el.html(this._MainTemplate);
      this.$("#searchContainer").html(this._SearchTemplate);
      var _customer = Global.CustomerName;
      var _salesrep = Global.SalesRepGroupName;
      var _commissionpercent = Global.CommissionPercent;
      this.$("#main-transaction-page").prepend(this._HeaderTemplate({
        type: Global.TransactionType,
        Customer: Shared.Escapedhtml(_customer),
        Salesrep: Shared.Escapedhtml(_salesrep),
        CommissionPercent: Shared.Escapedhtml(_commissionpercent)
      }));

      this.InitializeLoggedReasonsCollection();
      this.IsReloadedTransaction = false;
      this.StartSignalR();
      this.InitializeStorePickupChecker();
      return this;
    },

    InitializeStorePickupChecker: function() {
      if (Global.Preference.IsTrackStorePickUp === false) {
        this.UpdateBadge(null, true);
        return;
      }
      var self = this;
      if (!this.storePickupModel) this.storePickupModel = new BaseModel();
      this.storePickupModel.on('notify', function(val) {
        self.UpdateBadge(val);
      });
      Shared.StorePickup.StartChecker(this.storePickupModel);
    },

    UpdateBadge: function(params, hide) {
      params = params || {};

      var val = params.Value,
        badge = $('#notification-btn');

//      if (hide && badge.length > 0) {
//        badge.hide();
//        return;
//      }
        if(hide) {
          if(badge.length > 0) badge.hide();
          this.$('.toolbar-header-right').attr('style','width: 24.9%;');
          $(".label-transactioncode").css("width", "85%");
          return;
        }
        else {
          this.$('.toolbar-header-right').attr('style','width: 16.9%;');
          $(".label-transactioncode").css("width", "98%");
        }

      if (val > 0) {
        if (!badge.hasClass('notification-active')) badge.addClass('notification-active');
        badge.find('b').text(val > 99 ? '99+' : val);

        if (!params.Forced) {
          badge.find('div').removeClass('shake').addClass('shake');
          setTimeout(function() {
            badge.find('div').removeClass('shake');
          }, 2000);
        }
      } else {
        badge.find('div').removeClass('shake');
        badge.removeClass('notification-active').find('b').text('');
      }
      badge.show();
      this.UpdateTransactionPopoverPosition();
      this.UpdatePickupDropdownPosition();
    },

    Notification_Tap: function(e) {
      e.stopPropagation();

      if (this.HasOpenTransaction()) {
       // console.log("Please complete or void the current transaction first.");
        Shared.FocusToItemScan();
        navigator.notification.alert("Please complete or void the current transaction first.", null, "Action Not Allowed", "OK");
        return;
      }

      if (!this.pickupListView) {
        this.pickupListView = new PickupListView({
          el: "#pickup-list-container"
        });
        this.pickupListView.off('print-picking-ticket').on('print-picking-ticket', this.PrintPickNote, this);
        this.pickupListView.off('ready-for-invoice').on('ready-for-invoice', this.SendReadyForInvoiceEmailNotification, this);
      }

      this.pickupListView.render();
      this.TriggerUpdatePickupCount();

      this.UpdatePickupDropdownPosition();
      //this.ShowReviewTransactionsView(true);
    },

    UpdatePickupNotificationList: function(soCode, isPickingTicketPrinted) {
      if (this.pickupListView) {
        this.pickupListView.trigger('update-list', soCode, isPickingTicketPrinted);
      }
    },

    UpdatePickupDropdownPosition: function() {
      try {
        var notifBtn = $("#notification-btn"),
          notifDdwn = $("#pickup-list-container"),
          left = notifBtn.offset().left - notifDdwn.width() + (notifBtn.outerWidth() / 2) + 22;
        notifDdwn.offset({
          left: left
        });
      } catch (err) {
        console.log(err);
      }
    },

    TriggerUpdatePickupCount: function() {
      if (this.storePickupModel) this.storePickupModel.trigger('force-notify');
    },

    InitializeLoggedReasonsCollection: function() {
      if (!Global.LoggedReasons) Global.LoggedReasons = new BaseCollection();
      else Global.LoggedReasons.reset();
    },

    /**
    	Initializes the views that are contained within the MainView
      @method InitializeChildViews
    **/
    InitializeChildViews: function() {
      this.InitializeLocalPreference();
      this.InitializePreference();
      this.InitializeTransactionType(Global.TransactionType);
      this.InitializeCategory();
      this.InitializeCoupon();
      this.InitializeAccessory();
      this.InitializeCart();
      this.InitializeActionsView();
      Shared.FocusToItemScan();
      $('body, html,a').on('tap', this.outsideMenuHandler);

      navigator.notification.overrideAlert(true); //Notification
    },

    /**
      Initializes the TransactionTypeView. This view contains the menu options for the transaction type drop down.
      @method InitializeTransactionType
    **/
    InitializeTransactionType: function(type) {
      this.transactionTypeView = new TransactionTypeView();
      this.$(".main-toolbar-header").append(this.transactionTypeView.render(type).el);
      this.$(".main-toolbar-header").append(this.transactionTypeView.render(type).el);
      this.transactionTypeView.on("transactionTypeChanged", this.SetTransactionType, this);
    },

    /**
      Initializes the ActionsView. This view contains the menu options under the settings button.
      @method InitializeActionsView
      **/
    InitializeActionsView: function() {
      this.actionsView = new ActionsView({
        collection: this.cartCollection,
      });
      this.actionsView.on("LogOut", this.SignOut, this);
      this.actionsView.on("OpenCashDrawer", this.OpenCashDrawer, this);
      this.actionsView.on("CloseWorkstation", this.PromptCloseWorkstation, this);
      this.actionsView.on("PrintWorkstationReport", this.PromptWorkstationReport, this);
      this.actionsView.on("VoidTransaction", this.LeavePOSView, this);
	  this.actionsView.on("stopSignalR", this.StopSignalR, this);
      this.$(".main-toolbar-header").append(this.actionsView.render().el);
    },

	createGuid: function()
	{
		return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
			var r = Math.random()*16|0, v = c === 'x' ? r : (r&0x3|0x8);
			return v.toString(16);
		});
	},
    /**
      Initializes the LocalPreferenceCollection. This fetches the WorkstationID used by the device from the localstorage.
      @method InitializeLocalPreference
      **/
    InitializeLocalPreference: function() {
      	Global.GUID = this.createGuid();
		this.promoItemCollection = new BaseCollection();
      this.localpreference = new LocalPreferenceCollection();
      this.localpreference.fetch({
        success: function(collection, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          if (collection.length != 0) {
            Global.POSWorkstationID = collection.at(0).get("WorkstationID");
          }
          Global.Category = "" //reset value
        }
      });
    },
    /**
        Initializes Coupon Model.
        @method InitializeCoupon
      **/
    InitializeCoupon: function() {
      if (!this.couponModel) {
        this.couponModel = new CouponModel();
      }
    },

    /**
        This Prompt's OpenWorkstation. It checks if TrackDrawerBalance is enabled.
        @method PromptOpenWorkstation
      **/
    PromptOpenWorkstation: function() {
      switch (Global.Preference.TrackDrawerBalance) {
        case true:
          if (Global.Status === null || !Global.Status.IsOpen) this.ShowOpeningAmount();
          break;
      }
    },

    ShowCustomerList: function() {
      if (!this.headerinfo) this.InitializeMainTransactionHeader();
      this.headerinfo.ShowCustomerList();
    },

    ShowCustomerPopover: function(e) {
      e.stopPropagation();
      this.headerinfo.ShowCustomerPopover();
    },


    ShowSalesRepList: function() {
      this.headerinfo.ShowSalesRepList();
    },

    /**
        This Prompt's OpenWorkstation. It will allow user to input starting / opening amount for the day.
        @method ShowOpeningAmount
      **/
    ShowOpeningAmount: function() {
      if (!this.openingAmountView) {
        this.openingAmountView = new OpeningAmountView({
          el: $("#openingAmountContainer"),
        });
        this.openingAmountView.on("SaveAmount", this.OpenWorkstation, this);
      } else {
        this.openingAmountView.Show();
      }
    },

    /**
      	This will show a dropdown list containing Settings, Print Z-Tape/X-Tape, Close Workstation and Logout button
        @method ShowActionsPopover
      **/
    ShowActionsPopover: function(e) {
      e.stopPropagation();
      Shared.FocusToItemScan();
      this.actionsView.SetHasOpenTransaction(this.HasOpenTransaction());
      this.actionsView.Show();
    },

    /**
          This will show a dropdown list containing Sale, Order and Quote button.
          It will then set the selected transactionType as default transactionType.

          @method PromptOpenWorkstation
          **/
    ShowTransactionPopover: function(e) { //51x
      e.stopPropagation();
      Shared.FocusToItemScan();
      if (Global.TransactionType === Enum.TransactionType.SalesPayment ||
        Global.TransactionType === Enum.TransactionType.UpdateOrder ||
        Global.TransactionType === Enum.TransactionType.ConvertOrder ||
        Global.TransactionType === Enum.TransactionType.ConvertQuote ||
        Global.TransactionType === Enum.TransactionType.SalesRefund) {
        return;
      }

      this.transactionTypeView.Show(Global.TransactionType, (this.paymentCollection && this.paymentCollection.length > 0));
      this.UpdateTransactionPopoverPosition();
    },

    UpdateTransactionPopoverPosition: function() {
      Shared.SetStyle('#transaction-popover', 'right', ($('.toolbar-header-btn').outerWidth() + 93) + 'px !important');
    },

    /**
		 This will set the Transaction Type to be displayed.

		 @method SetTransactionType
		 **/
    SetTransactionType: function(type) {
      if (this.ValidateUpdateTransactionType(type)) {
        Global.TransactionType = type;
        //for display purposes only
        this.SetReturnMode(false);
        switch (type) {
          case Enum.TransactionType.UpdateOrder:
            type = Enum.TransactionType.Order;
            this.isQuoteRemoveCoupon = false;
            break;
          case Enum.TransactionType.ConvertOrder:
            type = Enum.TransactionType.Sale;
            this.isQuoteRemoveCoupon = false;
            break;
          case Enum.TransactionType.ConvertQuote:
            type = Enum.TransactionType.Order;
            this.isQuoteRemoveCoupon = false;
            break;
          case Enum.TransactionType.UpdateQuote:
            type = Enum.TransactionType.Quote;
            this.isQuoteRemoveCoupon = false;
            break;
          case Enum.TransactionType.SalesRefund:
            type = Enum.TransactionType.Return;
            this.isQuoteRemoveCoupon = false;
            break;
          case Enum.TransactionType.UpdateInvoice:
            type = Enum.TransactionType.Sale;
            this.isQuoteRemoveCoupon = false;
            break;
          case Enum.TransactionType.Recharge:
            Global.TransactionType = Enum.TransactionType.Recharge;
            type = Enum.TransactionType.Recharge;
            this.isQuoteRemoveCoupon = false;
            break;
          case Enum.TransactionType.Return:
            this.SetReturnMode(true);
            break;
        }

        this.SetTransactionTypeDisplay(type);

        //Disable the payment buttons when transaction is Quote
        var _enablePaymentButtons = (Global.TransactionType != Enum.TransactionType.Quote && Global.TransactionType != Enum.TransactionType.UpdateQuote);
        var isHide = (Global.TransactionType != Enum.TransactionType.Order &&
          Global.TransactionType != Enum.TransactionType.ConvertInvoice &&
          Global.TransactionType != Enum.TransactionType.UpdateOrder &&
          Global.TransactionType != Enum.TransactionType.ConvertQuote &&
          Global.TransactionType != Enum.TransactionType.Sale &&
          Global.TransactionType != Enum.TransactionType.UpdateInvoice &&
          Global.TransactionType != Enum.TransactionType.ResumeSale &&
          Global.TransactionType != Enum.TransactionType.Quote &&
          Global.TransactionType != Enum.TransactionType.UpdateQuote);
        this.TogglePaymentButtons(_enablePaymentButtons);
        this.ToggleOrderNotes(isHide);
      }
    },

    SetReturnMode: function(isReturn) {
      if (isReturn) {
        $(".complete").attr("style", "Background: #8D0B0B !important;");
        $("#cartContainer .total").attr("style", "color: #B85C5C !important;");
        $("#view-payment").attr("style", "color: #900000 !important;");
        return;
      }

      $(".complete").removeAttr("style");
      $("#cartContainer .total").removeAttr("style");
      $("#view-payment").removeAttr("style");
    },

    ToggleOrderNotes: function(isHide) {
      Shared.ShowHideOrderNotes("view-notes", isHide);
    },

    /**
		 This will hide delete button on Cart when tapped anywhere.
		 Also will unfocus Lookup search textfield

		 @method outsideMenuHandler
		 **/
    outsideMenuHandler: function(e) {
      $(".deletebtn-overlay").hide();
      $(".popover").hide();
      $("#lookup-search").blur();

      //Pickup Dropdown
      if ($('#pickup-list').find(e.target).length > 0) return;
      else $("#pickup-list-container").hide();
    },

    /**
		 This will remove any DOM @method outsideMenuHandler hides

		 @method remove
		 **/
    remove: function() {
      // Clean up after ourselves.
      $('body, html,a').off('click', this.outsideMenuHandler);
      Backbone.View.prototype.remove.call(this);
      // ...
    },

    /**
		 Initialize Accessory Collection
		 @method InitializeAccessory
		**/
    InitializeAccessory: function() {
      this.accessory = new AccessoryCollection();
      this.accessory.bind('add', this.AddToCart, this);
    },

    /**
		 Initialize Items and ItemPrice
		 @method InitializeItems
		**/
    InitializeItems: function() {
      this.InitializeItemPriceCollection();
      this.InitializeItemCollection();
      this.itemsView = new ItemsView({
        el: $("#itemContainer"),
        collection: this.itemCollection
      });
    },

    /**
		 Initialize Cart View
		 @method IntializeCart
		**/
    InitializeCart: function() {
      this.InitializeCartCollection();
      this.InitializeSummaryModel();
      this.cartView = new CartView({
        el: $("#cartContainer"),
        collection: this.cartCollection,
        summary: this.summaryModel,
        accessory: this.accessory,
        type: Global.ApplicationType,
      });
      this.cartView.on("viewPayments", this.ShowPaymentsSummaryForm, this);
      this.cartView.on("ItemRemoved", this.VoidItem, this);
      this.cartView.on("viewSignature", this.ViewSignature, this);
      this.cartView.on("ShowSerialLot", this.ShowSerialLotForm, this);
      this.cartView.on("loadOrderNotes", this.ProcessPublicNoteForm, this);
      this.cartView.on("showNotes", this.ShowOrderNotesForm, this);
      this.cartView.on("updateSerialLot", this.UpdateSerialLot, this);
      this.cartView.on("viewTaxOverrideList", this.ShowTaxList, this);
      this.cartView.on("changeTaxCode", function() {
        this.ChangeItemGroupTax(this.cartCollection);
      }.bind(this));
      this.cartView.on("editKitItem", this.ShowKitConfigurator, this);
    },

    UpdateSerialLot: function(itemCode) {
      var lineNum = this.cartCollection.length;

      this.cartCollection.each(function(cart) {
        if (this.serializeLotCollection != undefined) {
          var serials = this.serializeLotCollection.filter(function(model) {
            return model.get("ItemCode") === cart.get("ItemCode") && model.get("UnitMeasureCode") === cart.get("UnitMeasureCode");
          });
        }

        if (!Shared.IsNullOrWhiteSpace(serials) && serials.length > 0) {
          _.each(serials, function(serial) {
            serial.set({
              LineNum: cart.get("LineNum")
            });
          });
        }
      }.bind(this));
    },

    /**
		 Initialize Cart Collection

		 @method InitializeCartCollection
		 **/
    InitializeCartCollection: function() { //1
      this.tempCart = [];
      if (this.cartCollection) {
        this.cartCollection.reset();
        Global.CartCollection = this.cartCollection;
      } else {
        this.cartCollection = new CartCollection();
        this.cartCollection.on('quantityAdded', this.QuantityAdded, this);
        this.cartCollection.on('quantitySubtracted', this.QuantitySubtracted, this);
        this.cartCollection.on('salesPriceRateUpdated', this.UpdateCartItem, this);
        this.cartCollection.on('unitMeasureUpdated', this.ChangeItemPriceOnUnitMeasure, this);
        this.cartCollection.on('warehouseCodeUpdated', this.ChangeItemPriceOnWarehouseCode, this);
        this.cartCollection.on('quantityOrderedUpdated', this.UpdateCartItem, this);
        this.cartCollection.on('quantityGoodUpdated', this.UpdateCartItem, this); //Originally quantityDefectiveUpdated
        this.cartCollection.on('discountUpdated', this.UpdateCartItem, this);
        this.cartCollection.on('discountAppliedToAll', this.ApplyDiscountToAll, this);
        //this.cartCollection.on('clearedTransaction', this.VoidTransaction, this)
        this.cartCollection.on('clearedTransaction', this.VoidTransactionWithValidation, this);
        //this.cartCollection.on('removeInQueue', this.RemoveItemInQueue, this);
        Global.CartCollection = this.cartCollection;

      }
    },

    /**
		 Initialize Item Collection

		 @method InitializeItemCollection
		 **/
    InitializeItemCollection: function() {
      var _self = this;
      var _stringValue = Global.Category; //Pass Global.Category value to _stringValue to check whether it contains value
      var _itemLookup = new LookupCriteriaModel();
      this.RoundRequestQueue();

      //Initialize collection
      this.itemCollection = new ItemCollection();
      //this.itemCollection.on('selected', this.AddToCart, this);
      this.itemCollection.on('selected', this.AddToItemsOnQueue, this);


      //If No DefaultCategory Selected set it to Nothing to load Nothing
      if (Global.Category === "" || Global.Category === null) {
        return;
      }


      _itemLookup.set({
        StringValue: _stringValue,
        WarehouseCode: Global.Preference.DefaultLocation,
        WebSiteCode: Shared.GetWebsiteCode(),
        ShowPhasedOutItems: _self.IsReturn(),
        CustomerCode: Global.CustomerCode,
        DefaultPrice: (Global.CurrentCustomer) ? Global.CurrentCustomer.DefaultPrice : Global.Preference.CustomerDefaultPrice,
        ShowWholesalePrice: Global.Preference.ShowWholesalePrice
      });

      _itemLookup.url = Global.ServiceUrl + Service.PRODUCT + Method.LOADITEMBYCATEGORY;
      _itemLookup.save(null, {
        success: function(model, response, options) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          if (response != null) {
            _self.itemCollection.reset(response.Items);
          } else if (response == null && Global.Category != "") {
            _self.itemCollection.reset();
            _self.CategoryItemNoRecordFound();
          }
          _self.HideActivityIndicator();
        },
        error: function(model, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          model.RequestError(error, "Error");
          _self.LockTransactionScreen(false);
        }
      });
    },

    CategoryItemNoRecordFound: function() {
      $("#itemListContainer").append("<h5 style='text-align:center; position:relative; top:190px;'>No Items Found...</h5>");
    },
    /**
		 Initialize Item Collection

		 @method InitializeItemCollection
		 **/
    InitializeItemPriceCollection: function() {
      this.itemPriceCollection = new ItemPriceCollection();
      this.itemPriceCollection.on('reset', this.AddNewItemToCart, this);
    },

    /**
		 Initialize Payment Collection

		 @method InitializePaymentCollection
		 **/
    InitializePaymentCollection: function() {
      this.paymentCollection = new PaymentCollection();
      this.paymentCollection.on('add', this.PaymentCollection_Add, this);
      this.paymentCollection.on('remove', this.PaymentCollection_Removed, this);
    },

    InitializeGiftPaymentCollection: function() {
      this.giftPaymentCollection = new BaseCollection();
    },

    /**
		 Initialize Category Collection and load Categories View

		 @method InitializeCategory
		 **/
    InitializeCategory: function() {
      this.InitializeCategoryCollection();
      this.categoryCollection.sort({
        silent: true
      });
      this.categoriesView = new CategoriesView({
        el: $("#categoryContainer"),
        collection: this.categoryCollection
      });
    },

    /**
		 Initialize Category Collection and load Categories View

		 @method InitializeCategory
		 **/
    InitializeShipTo: function() {
      if (!this.shipToCollection) {
        this.shipToCollection = new ShipToCollection();
      }
    },

    /**
		 Initialize Preference Collection and Fetch Preferences

		 @method InitializePreference
		 **/
    InitializePreference: function() {
      this.InitializeShipTo();
      var self = this;
      this.preferenceCollection = new PreferenceCollection();
      this.preferenceCollection.url = Global.ServiceUrl + Service.POS + Method.GETPREFERENCEBYWORKSTATION + Global.POSWorkstationID;
      this.preferenceCollection.fetch({
        success: function(collection, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          self.AssignCurrency(response.Currency);
          self.ResetStatus(response.Status);
          self.ResetSalesRepUserAccount(response.SalesRepUserAccount);
          self.ResetPreferenceCollection(response.Preference);
          self.ResetCategoryCollection(response.Categories);
          self.ResetUserRoleCollection(response.UserRoles);
          //self.ResetCustomerAdvancedPreference(response.CustomerAdvancedPreference);
          self.GetDefaultCustomerDetails(response.Preference);
          self.ResetCustomerPreference(response.CustomerPreference);
          self.ValidateDefaultLocation(response.Warehouses);
          self.ResetAccountingPreference(response.AccountingPreference);
          self.RetrievePrinterDetails(response.Preference);
        },
        error: function(collection, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          collection.RequestError(error, "Error");
        }
      });
    },

    GetCustomerPOSReport: function(type, preference) {
      var selectedPosPrinter = Global.POSSalesReceipt || 1;
      var reportCode = "";
      var copies = 1;

      switch(type.toLowerCase()) {
        case "createinvoice":
        case "updateinvoice":
        case "convertorder":
          reportCode = selectedPosPrinter == 1 ? preference.InvoiceReportCode : preference.InvoiceReportCode2;
          printer = selectedPosPrinter == 1 ? preference.InvoiceReportPrinter : preference.InvoiceReportPrinter2;
          copies = selectedPosPrinter == 1 ? preference.InvoiceReceiptCopies : preference.InvoiceReceiptCopies2;
        //  reportCode = this.GetSelectedReportCode(reportCode, preference);
          break;
        case "createorder":
        case "updateorder":
        case "convertquote":
          reportCode = preference.OrderReportCode;
          printer = preference.OrderReportPrinter;
          copies = preference.OrderReceiptCopies;
        //  reportCode = this.GetSelectedReportCode(reportCode, preference);
          break;
        case "createquote":
          reportCode = preference.QuoteReportCode;
          printer = preference.QuoteReportPrinter;
          copies = preference.QuoteReceiptCopies;
          break;
        case "createcreditmemo":
        case "createrefund":
          reportCode = preference.ReturnReportCode;
          printer = preference.ReturnReportPrinter;
          copies = preference.ReturnReceiptCopies;
          break;
        case "creditcard":
          reportCode = preference.CreditCardReportCode;
          printer = preference.CreditCardReportPrinter;
          copies = preference.CreditCardReceiptCopies;
          break;
        case "createinvoicepayment":
          reportCode = preference.SalePaymentReportCode;
          printer = preference.SalePaymentReportPrinter;
          copies = preference.SalePaymentReceiptCopies;
          break;
        case "createpicknote":
          reportCode = preference.PickNoteReportCode;
          printer = preference.PickNoteReportPrinter;
          copies = preference.PickNoteReportPrinter;
          break;
        default:
          //Reports other than receipts above
          printer = preference.DefaultPrinter;
          copies = 1;
          break;
      }

      return {
        printer: printer || preference.DefaultPrinter,
        reportCode: reportCode,
        copies: copies
      };
    },

    ResetSalesRepUserAccount: function(SalesRepUserAccount) {
      Global.SalesRepUserAccount = SalesRepUserAccount;
    },

    GetDefaultCustomerDetails: function(response) {
      this.defaultCustomerDetails = new BaseCollection();
      this.defaultCustomerDetails.reset(response);
      Global.CurrentCustomerSourceCode = this.defaultCustomerDetails.at(0).get("DefaultSourceCode");
    },
    ResetCustomerAdvancedPreference: function(customerAdvancePreference) {
      Global.CustomerAdvancedPreference = customerAdvancePreference;
    },

    ResetCustomerPreference: function(customerPreference) {
      Global.CustomerPreference = customerPreference;
    },

    ResetAccountingPreference: function(accountingPreference) {
      Global.AccountingPreference = accountingPreference;
      this.ValidateLocationBankAccount();
    },

    ValidateLocationBankAccount: function() {
      if (this.IsMultiLocation()) {
        if ((Global.BankAccountCode || '').toString().trim() == '') {
          Shared.ShowNotification("Default Location's Bank Account is not set. Please go to Connected Business and setup a Bank Account for your Location.", true, null, true);
          return false;
        }
      }
      return true;
    },

    RetrievePrinterDetails: function(preferences) {
      this.InitializePrinterCollection();
      //console.log("PM: " + Global.Printer.PrinterModel + " - IP: " + Global.Printer.IpAddress);
      //console.log("CD: " + preferences.UseCashDrawer + " - AP: " + preferences.AutoPrintReceipt);
      if (!Global.isBrowserMode && Shared.IsNullOrWhiteSpace(Global.Printer.PrinterModel) && Shared.IsNullOrWhiteSpace(Global.Printer.IpAddress) && (preferences.UseCashDrawer || preferences.AutoPrintReceipt)) {
        navigator.notification.alert("IP for Printer and Cash Drawer is not present. Please go to settings module.", null, "Printer details missing", "OK");
      }
    },

    /**
		 Pass Status Preference to Global Variable

		 @method ResetStatus
		 **/
    ResetStatus: function(status) {
      Global.Status = status;
    },

    /**
		 Pass Category Preference to Category Collection

		 @method ResetCategoryCollection
		 **/
    ResetCategoryCollection: function(categories) { //16x
      Global.CategoryDuplucates = 0;
      var _lastCategory = "";
      var _duplicates = new Array();
      var _length = categories.length;

      for (var i = 0; i < _length; i++) {
        if (_lastCategory === categories[i].CategoryCode) {
          _duplicates.push(i);
        }
        _lastCategory = categories[i].CategoryCode;

      }

      Global.CategoryDuplucates = _duplicates.length;
      //console.log("category duplicates:" + Global.CategoryDuplucates);
      this.categoryCollection.reset(categories);
      this.SetSelected();

    },

    /**
		 Pass Preferences to Preference Collection

		 @method ResetPreferenceCollection
		 **/
    ResetPreferenceCollection: function(preferences) {
      this.preferenceCollection.reset(preferences);

      Global.Preference = preferences;
      Global.TrackDrawerBalance = Global.Preference.TrackDrawerBalance;
      Global.IsTrackLoyaltyPoints = preferences.TrackLoyaltyPoints;
      var customer = {
        CustomerName: preferences.CustomerName,
        CustomerCode: preferences.CustomerCode,
        Email: preferences.CustomerEmail,
        DefaultPrice: preferences.CustomerDefaultPrice,
        LocationCode: preferences.DefaultLocation,
        PaymentTermCode: preferences.PaymentTermCode
      };

      if (preferences.DefaultShipTo == null) Global.InitialDiscountPercent = 0;
      else Global.InitialDiscountPercent = preferences.DefaultShipTo.DiscountPercent;

      Global.IsOverrideSalesRep = preferences.IsOverrideSalesRep;
      this.SetCurrentCustomer(customer);
      Shared.CheckSalesRep(preferences);
      this.UseDefaultCustomer();

      Global.CompanyName = preferences.CompanyName;
      Global.CustomerName = preferences.CustomerName;
      Global.CustomerCode = preferences.CustomerCode;
      Global.CustomerEmail = preferences.CustomerEmail;
      Global.POSSalesReceipt = preferences.POSSalesReceipt;
      Global.DefaultContactEmail = preferences.DefaultContactEmail;
      Global.DefaultPrice = preferences.CustomerDefaultPrice;
      Global.LocationCode = preferences.DefaultLocation;
      Global.ShipToName = preferences.DefaultShipTo.ShipToName;
      Global.ShipToAddress = preferences.DefaultShipTo.Address;
      Global.PrintOptions.CustomizePrint = (!Global.isBrowserMode && preferences.IsAirprint); //added by PR.Ebron 1.09.13 | Edited by Jhenson 09.09.2013
      Global.Preference.IsAirprint = (!Global.isBrowserMode && preferences.IsAirprint); //added by Jhenson 09.09.2013

      Global.BankAccountCode = preferences.BankAccountCode || '';

      //if( preferences.DefaultShipTo.Address === null ){
      //	preferences.DefaultShipTo.Address = "(No Address)";
      //}
      //Global.DefaultShipTo = (preferences.DefaultShipTo.ShipToName+",<br/>"+preferences.DefaultShipTo.Address);
      Global.DefaultShipTo = preferences.DefaultShipTo.ShipToName + ',';
      Global.DefaultShipToAddress = preferences.DefaultShipTo.Address;
      Global.DefaultShipToCity = preferences.DefaultShipTo.City;
      Global.DefaultShipToState = preferences.DefaultShipTo.State;
      Global.DefaultShipToCounty = preferences.DefaultShipTo.County;
      Global.DefaultShipToPostalCode = preferences.DefaultShipTo.PostalCode;
      //Global.ShipTo                 = preferences.DefaultShipTo;

      Global.ShipTo = {};
      for (var attr in preferences.DefaultShipTo) {
        Global.ShipTo[attr] = preferences.DefaultShipTo[attr];
      }

      Global.InitialShipToCode = Global.ShipTo.ShipToCode;
      //alert(Global.InitialShipToCode);

      Global.CompanyName = preferences.CompanyName;

      Global.ReasonCode.Discount = preferences.IsReasonDiscount;
      Global.ReasonCode.Transaction = preferences.IsReasonTransactionVoid;
      Global.ReasonCode.Item = preferences.IsReasonItemVoid;
      Global.ReasonCode.Return = preferences.IsReasonReturns;

      Global.Preference.ShowWholesalePrice = preferences.ShowWholesalePrice;
      Global.Preference.IsAutoAdjustmentStock = preferences.IsAutoAdjustmentStock;

      this.CheckTransactionType();
      this.InitializeMainTransactionHeader();
      this.ConfirmDrawerBalanceTracking();
      this.SetImageLocation(preferences);

     // $("#lbl-customerName").text(Shared.TrimCustomerName());
      Global.ClosingWorkStation = false;
      Global.PreviousReprintValue = false;
      Global.OnRechargeProcess = false;
      Global.TransactionCode = null;
      Global.AskPIN = null;
      Global.AskSignature = null;

      this.InitializeItems();

      if (preferences.TaxByLocation) this.LoadLocationTaxCode();
      else window.sessionStorage.removeItem('selected_taxcode');

      Global.invDetailSerialCollection = null;
      // if(Global.isBrowserMode && Global.Preference.UseCashDrawer) Shared.PrintBrowserMode.InitializeApplet();
      //jjxxx
      //this.CheckIfCustomerHasLoyalty();
    },

    CheckIfCustomerHasLoyalty: function() {
      this.tempModel = new BaseModel();
      var customerCode;
      var self = this;
      if (Shared.IsNullOrWhiteSpace(Global.CurrentCustomer.CustomerCode)) customerCode = Global.CustomerCode;
      else customerCode = Global.CurrentCustomer.CustomerCode;

      this.tempModel.set({
        StringValue: customerCode
      });
      this.tempModel.url = Global.ServiceUrl + Service.SOP + Method.GETCUSTOMERLOYALTYPOINTS;
      this.tempModel.save(null, {
        success: function(collection, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          self.AssignCustomerHasLoyalty(response);
        },
        error: function() {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
        }
      });
    },
    AssignCustomerHasLoyalty: function(response) {
      if (Shared.IsNullOrWhiteSpace(response.LoyaltyPoints)) {
        Global.CustomerHasLoyalty = false;
      } else {
        Global.CustomerHasLoyalty = true;
      }
      //console.log("Has Loyalty : " + Global.CustomerHasLoyalty);
    },

    /**
		 Check if Allow Sales, Allow Orders, Allow Quotes and Allow Returns is 'on'
		 and Set Transaction Type to Appropriate Type

		 @method CheckTransactionType
		 **/
    CheckTransactionType: function() {
      var _types = ["AllowSales", "AllowOrders", "AllowQuotes", "AllowReturns"];
      var _counter = 0;
      var _self = this;


      //if(Global.Preference.DefaultPOSTransaction  < 3)
      //{
      _.each(_types, function(type) {
        switch (type) {
          case "AllowSales":
            if (Global.Preference.AllowSales === true) {
              _counter += 1;
              _self.SetTransactionType(Enum.TransactionType.Sale);
              //$("#itemContainer").removeClass("ui-disabled");
              //$("#categoryContainer").removeClass("ui-disabled");
            }
            break;
          case "AllowOrders":
            if (Global.Preference.AllowOrders === true) {
              _counter += 1;
              if (_counter > 1) {
                return;
              } else {
                _self.SetTransactionType(Enum.TransactionType.Order);
                //$("#itemContainer").removeClass("ui-disabled");
                //$("#categoryContainer").removeClass("ui-disabled");
                //$("#searchContainer").removeClass("ui-disabled");
              }
            }
            break;
          case "AllowQuotes":
            if (Global.Preference.AllowQuotes === true) {
              _counter += 1;
              if (_counter > 1) {
                return;
              } else {
                _self.SetTransactionType(Enum.TransactionType.Quote);
                //$("#itemContainer").removeClass("ui-disabled");
                //$("#categoryContainer").removeClass("ui-disabled");
                //$("#searchContainer").removeClass("ui-disabled");
              }
            }
            break;
          case "AllowReturns":
            if (Global.Preference.AllowReturns === true) {
              _counter += 1;
              if (_counter > 1) {
                return;
              } else {
                _self.SetTransactionType(Enum.TransactionType.Return);
                //$("#itemContainer").addClass("ui-disabled");
                //$("#categoryContainer").addClass("ui-disabled");
                //$("#searchContainer").addClass("ui-disabled");
              }
            }
            break;
          default:
            _self.SetTransactionType(Enum.TransactionType.Sale);
            break;
        }
      });
      //}
      switch (Global.Preference.DefaultPOSTransaction) {
        case 0:
          _self.SetTransactionType(Enum.TransactionType.Sale);
          break;
        case 1:
          _self.SetTransactionType(Enum.TransactionType.Order);
          break;
        case 2:
          _self.SetTransactionType(Enum.TransactionType.Quote);
          break;
        case 3:
          _self.SetTransactionType(Enum.TransactionType.Return);
          break;

      }
      //	if( Global.Preference.AllowSales === true && _counter > 1){
      //	this.SetTransactionType(Enum.TransactionType.Sale);
      //	}

      if (_counter <= 1) {
        this.$el.undelegate('#transaction-text', 'tap');
        $(".arrow-down").css("opacity", "0.3");
      }
      this.SetTransactionTypeDisplay(Global.TransactionType);
    },

    /**
		 Pass User Role Preference to Global Variable object

		 @method ResetUserRoleCollection
		 **/
    ResetUserRoleCollection: function(userRoles) { //jj3
      Global.UserRoles = userRoles;
      Global.AdministratorRole = false;
      if (Global.UserRoles.length > 0) {
        for (var i = 0; i < Global.UserRoles.length; i++) {
          if (Global.UserRoles[i].RoleCode == Global.UserInfo.RoleCode) {
            Global.AdministratorRole = true;
          }
        }
      } else {
        //if Administrator is Blank, to view the z-tape/close workstation report
        Global.AdministratorRole = true;
      }

    },

    /**
		 Initialize Category Collection

		 @method InitializeCategoryCollection
		 **/
    InitializeCategoryCollection: function() {
      var self = this;
      this.categoryCollection = new CategoryCollection();
      this.categoryCollection.on('selected', this.IsSelected, this);
    },

    /**
		 Initialize Summary model

		 @method InitializeSummaryModel
		 **/
    InitializeSummaryModel: function() {
      this.summaryModel = null;
      this.summaryModel = new SummaryModel();
    },

    /**
		 Initialize Transaction

		 @method InitializeTransaction
		 **/
    InitializeTransaction: function() {
      if (this.transactionModel) {
        this.transactionModel.clear({
          silent: true
        });
      } else {
        this.transactionModel = new TransactionModel();
        this.transactionModel.on('sync', this.SaveTransactionCompleted, this);
        this.transactionModel.on('error', this.SaveTransactionError, this);
      }

      this.transactionModel.off('before-save');
      this.transactionModel.on('before-save', this.OnTransactionModelBeforeSave, this);
    },

    OnTransactionModelBeforeSave: function() {
      this.LogWithTime("Begin Saving Transaction...");
      this.IsSavingTransactionOngoing = true;
      this.ToggleInprogressOverlay();
      this.DoDrawerKick();
    },

    DoDrawerKick: function() {
      var self = this;
      if (Global.TransactionType === Enum.TransactionType.SalesRefund) {
        if (self.refundCollection === undefined) self.refundCollection = new PaymentCollection();
        self.AllowToOpenCashDrawer(self.refundCollection);
      } else {
        self.AllowToOpenCashDrawer(self.paymentCollection);
      }
      if (Global.Preference.UseCashDrawer == true && Global.isOkToOpenCashDrawer) {
        if (!Global.isBrowserMode) Shared.Printer.DrawerKick();
        else Shared.PrintBrowserMode.DrawerKick();
      }
    },


    /**
		 Initialize Main Transaction Header

		 @method InitializeMainTransactionHeader
		 **/
    InitializeMainTransactionHeader: function() {
      var _salesOrderDetailCollection = new SalesOrderDetailCollection();
      _salesOrderDetailCollection.on("recalculated", this.UpdateRecalculatedItems, this);
      _salesOrderDetailCollection.on("recalculateCompleted", this.UpdateRecalculatedItemsCompleted, this)
      if (!this.headerinfo) {
        this.headerinfo = new HeaderInfoView({
          el: $("#headerInfoContainer"),
          cart: this.cartCollection,
          preference: this.preferenceCollection,
          item: this.itemCollection,
          SO: _salesOrderDetailCollection
        });
        this.headerinfo.on("customerchanged", this.CustomerChanged, this);
        this.headerinfo.on("shiptochanged", this.ShipToChanged, this);
        this.headerinfo.on("customernotes", this.ShowOrderNotesForm, this);
        this.headerinfo.on("removeNote", this.ProcessNoteRemoval, this);
        this.headerinfo.on("proceedToLookupItems", this.ProcessItemLookup, this)
      } else {
        return;
      }

    },

    //JIRA: INTMOBA-755 - MAR-14-2013 - "Clear Payment when customer change."
    CustomerChanged: function() {
      //console.log("CUSTOMERTOCHANGE");
      Global.CurrentCustomerChanged = true;
      if (this.paymentCollection) {
        this.paymentCollection.reset();
        //console.log('Clear Payment Collection');
      }

      if (this.cartCollection.length > 0) {
        this.cartCollection.each(function(model) {
          model.set({
            CouponDiscountRate: 0,
            Discount: 0
          });
        });
      }

      if (this.serializeLotCollection && this.serializeLotCollection.length > 0) {
        this.serializeLotCollection.each(function(serial) {
          serial.set({
            OriginalSerialRecipient: serial.get("SerialRecipient"),
            SerialRecipient: Global.DefaultContactEmail
          });
        });
      }

      this.RemoveCoupon(); //CSL-24224 FEB.12.2014

      if (this.headerinfo && this.headerinfo.PricingHasChanged()) this.InitializeItems();
      this.CheckIfCustomerHasLoyalty();
      this.SearchOnFocus();

    },

    
     ShipToChanged: function() {
      //console.log("SHIPTOCHANGE");
      if (this.cartCollection.length > 0) {
        var taxCode = window.sessionStorage.getItem('selected_taxcode');
        this.cartCollection.each(function(model) {
          model.set({
           // TaxCode: (taxCode) ? taxCode : null,
            IsModified: true
          });
        });
      }

      this.ResetTermDiscount()
      this.ChangeItemGroupTax(this.cartCollection);
      this.SearchOnFocus();
      if (!Global.Preference.TaxByLocation) window.sessionStorage.removeItem('selected_taxcode');
    },

    ResetTermDiscount: function() {
      this.RemoveTermDiscountPayment();
      this.summaryModel.set({
        TermDiscount: 0
      });
      Global.TermDiscount = 0;
    },

    /**
		 Initialize Review Transaction View

		 @method InitializeReviewTransaction
		 **/
    InitializeReviewTransaction: function(isPrintPickNote) {
      this.InitializeReviewTransactionCollection();
      this.reviewTransactionsView = new TransactionsView({
        el: $("#transactionsContainer"),
        collection: this.reviewTransactionCollection,
        pickUpStage: isPrintPickNote ? 1 : 0,
        clearDateOnLoad: isPrintPickNote
      });

      this.reviewTransactionsView.on('userclosedform', this.SetToDefaultTransaction, this); // GEMINI: CSL-5435
      this.reviewTransactionsView.on('update-pickup-count', this.TriggerUpdatePickupCount, this);
    },

    /**
		 Initialize Review Transaction Collection

		 @method InitializeReviewTransactionCollection
		 **/
    //OPTION HANDLERS
    InitializeReviewTransactionCollection: function() {
      this.reviewTransactionCollection = new TransactionCollection();
      this.reviewTransactionCollection.on('applyPayment', this.LoadInvoiceForApplyPayment, this);
      this.reviewTransactionCollection.on('updateOrder', this.LoadOrderForUpdateOrder, this);
      this.reviewTransactionCollection.on('convertOrder', this.LoadOrderForConvertOrder, this);
      this.reviewTransactionCollection.on('convertQuote', this.LoadOrderForConvertQuote, this);
      this.reviewTransactionCollection.on('updateQuote', this.LoadOrderForUpdateQuote, this);
      this.reviewTransactionCollection.on('returnInvoice', this.LoadInvoiceForReturnRefund, this);
      this.reviewTransactionCollection.on('printTransaction', this.PrintAndEmailReviewTransaction, this);
      this.reviewTransactionCollection.on('resumeTransaction', this.LoadInvoiceForResume, this);
      this.reviewTransactionCollection.on('printPickNote', this.PrintPickNote, this);
      this.reviewTransactionCollection.on('readyForPickUp', this.SendReadyForInvoiceEmailNotification, this);
      this.reviewTransactionCollection.on('repickItem', this.SetOrderPrintPickNote, this);
    },

    PrintPickNote: function(model) {
      var self = this;
      var printPick = new BaseModel();
      var soCode = model.get("SalesOrderCode");
      printPick.url = Global.ServiceUrl + Service.SOP + 'printpicknote/' + soCode;
      printPick.save(null, {
        success: function() {
          self.PrintReceipt(soCode, "CreatePickNote", null);
          self.TriggerUpdatePickupCount();
          self.UpdatePickupNotificationList(soCode, true);
          self.RemoveTransactionFromList(soCode, true);
        },
        error: function(model, xhr, response) {
          navigator.notification.alert("Error.", null, "Error", "OK");
        }
      });
    },

    SetOrderReadyToInvoice: function(model) {
      this.SetOrderWorkflow(model, 'Ready To Invoice');
    },

    SetOrderPrintPickNote: function(model) {
      var self = this;
      this.SetOrderWorkflow(model, 'Print Pick Note', function() {
        self.PrintPickNote(model);
      });
    },

    SetOrderWorkflow: function(model, workflow, onSuccess) {
      var self = this;
      var wflow = new BaseModel();
      var soCode = model.get("SalesOrderCode");
      wflow.url = Global.ServiceUrl + Service.SOP + 'setworkflowstage/' + soCode + '/' + workflow;
      wflow.save(null, {
        success: function() {
          self.TriggerUpdatePickupCount();
          var isReadyForInvoice = (workflow == 'Ready To Invoice');
          if (isReadyForInvoice) self.UpdatePickupNotificationList(soCode);
          if (onSuccess) onSuccess.call(self);
          self.RemoveTransactionFromList(soCode);
        },
        error: function(model, xhr, response) {
          navigator.notification.alert("Error.", null, "Error", "OK");
        }
      });
    },

    SendReadyForInvoiceEmailNotification: function(model) {
      var self = this;
      Global.PrintOptions.EmailAddress = model.get('DefaultContactEmail');
      this.EmailReceipt(model.get('SalesOrderCode'), 'CreateOrder', '', true);
    },

    RemoveTransactionFromList: function(soCode, isPrint) {
      var self = this;
      //Remove View
      try {
        self.reviewTransactionsView.RemoveModelByOrderCode(soCode, isPrint);
      } catch (err) {
        console.log('Handle - Transaction form not visible.');
      }
    },

    /**
		 Show Loading Spinner for Items

		 @method ShowSpinnerItems
		 **/
    ShowSpinnerItems: function() {
      var target = document.getElementById("item-wrapper");
      this.ShowActivityIndicator(target);
      $("<h5>Loading...</h5>").appendTo($("#spin"));
    },

    //START LOOKUP
    /**
		 Initialize Lookup

		 @method InitializeLookup
		 **/
    InitializeLookup: function() {
      $("#item-wrapper").append(_.template(LookupTemplate));
      $("#lookup").hide();
      this.hideOtherButtons();
      this.InitializeProductLookup();
      $('#lookup-search').focus();
    },

    /**
		 Check SortVar and enable/disable buttons

		 @method CheckLookupSortVar
		 **/
    CheckLookUpSortVar: function() {
      if (sortVar === 'CategoryCode') {
        $("#lookup-product").removeClass("lookup-selected");
        $("#lookup-category").addClass("lookup-selected");
      } else {
        $("#lookup-category").removeClass("lookup-selected");
        $("#lookup-product").addClass("lookup-selected");
      }
    },

    /**
		 Initialize Product Lookup

		 @method InitializeProductLookup
		 **/
    InitializeProductLookup: function() {
      this.GetLookupItems(_rows, _criteria, null);
      this.ReloadProductsView();
    },

    /**
		 Initialize SerialNumber Collection

		 @method InitializeSerialNumberCollection
		 **/
    InitializeSerializeLotCollection: function() {
      if (!this.serializeLotCollection) {
        this.serializeLotCollection = new SerialNumberCollection();
      }
      this.BindOnResetOfSerializeLotCollection(this.serializeLotCollection);
    },

    BindOnResetOfSerializeLotCollection: function(srlCollection) {
      srlCollection.off("reset");
      srlCollection.on("reset", this.SetGCRecipients);
    },

    SetGCRecipients: function() {
      if (Global.TransactionType == Enum.TransactionType.ConvertOrder) {
        this.each(function(srl) {
          if (!srl.get('IsEmailModified') && !srl.get('SerialRecipient') && Global.DefaultContactEmail) {
            srl.set({
              OriginalSerialRecipient: srl.get('SerialRecipient')
            });
            srl.set({
              SerialRecipient: Global.DefaultContactEmail
            });
          }
        });
      }
    },

    /**
		 Initialize Serialize Lot View

		 @method IntializeSerializeLot
		 **/
    InitializeSerializeLot: function(type, itemCode, itemName, lineNum, itemType, uom, eventName, model) {
      var self = this;
      this.InitializeSerializeLotCollection();
      //console.log("Event :" + this.cartEventTriggered);
      if ((!Shared.IsNullOrWhiteSpace(this.cartEventTriggered) && (this.cartEventTriggered == "UpdatePrice" || this.cartEventTriggered == "UpdateDiscount" || !Shared.IsNullOrWhiteSpace(Global.IsChangeWarehouse)))) {
        this.cartEventTriggered = null;
        Global.IsChangeWarehouse = false;
        return;
      }
      var onSuccess = function(response) {

        self.cartView.trigger("serialLotReady", self.serializeLotCollection);

        if (self.serializeLot) {
          self.serializeLot.unbind();
          self.serializeLot.remove();
          self.serializeLot = null;
        }

        $("#serialLotContainer").append("<div id='mainSerialContainer'></div>");
        self.serializeLot = new SerialLotView({
          el: $("#mainSerialContainer"),
          type: type,
          itemCode: itemCode,
          itemName: itemName,
          lineNum: lineNum,
          itemType: itemType,
          unitMeasure: uom,
          collection: self.serializeLotCollection,
          itemModel: model,
          serialEvent: eventName,
          cartCollection: self.cartCollection,
          serialList: (response) ? response : null
        });

        self.BindOnResetOfSerializeLotCollection(self.serializeLotCollection);
        self.BindOnResetOfSerializeLotCollection(self.serializeLot.collection);

        self.serializeLot.on("Close", self.AddSerialByUPCItem, this);
        self.serializeLot.on("SerialGenerated", function() {
          if (self.gcItemList) self.gcItemList.afterGeneration();
        }, this);
        self.serializeLot.Show();
      }

      if (Global.TransactionType === Enum.TransactionType.SalesRefund) {
        var documentCode = "";
        if (model instanceof BaseModel) {
          if (!model.get("IsNewLine")) documentCode = Global.TransactionCode;
        } else {
          if (!model.IsNewLine) documentCode = Global.TransactionCode;
        }


        this.RetrieveSerialNumberList(Global.CustomerCode, itemCode, itemType, lineNum, documentCode, "Invoice", onSuccess);
        return;
      }

      onSuccess(null);
    },

    RetrieveSerialNumberList: function(customerCode, itemCode, itemType, lineNum, documentCode, documentType, onSuccess) {
      var self = this;
      var serialNumberList = new BaseModel();
      var gcSerialNumberCollection = new BaseCollection();

      var model = {
        CustomerCode: customerCode,
        ItemCode: itemCode,
        LineNum: lineNum,
        DocumentCode: documentCode
      };

      if (Shared.IsNullOrWhiteSpace(documentType)) documentType = null;

      serialNumberList.url = Global.ServiceUrl + Service.SOP + "getseriallotnumberlist/" + documentType;
      serialNumberList.set(model);

      serialNumberList.save(serialNumberList, {
        success: function(model, response, options) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          if (!Shared.IsNullOrWhiteSpace(response.SerialLotNumbers) && (itemType != Enum.ItemType.GiftCard && itemType != Enum.ItemType.GiftCertificate)) {
            if (!Shared.IsNullOrWhiteSpace(response.ErrorMessage)) {
              navigator.notification.alert(response.ErrorMessage, null, "Error", "OK");
              return;
            }

            onSuccess(gcSerialNumberCollection.reset(response.SerialLotNumbers));

          } else if (itemType === Enum.ItemType.GiftCard || itemType === Enum.ItemType.GiftCertificate) {
            onSuccess(null);
          }

        },

        error: function(model, xhr, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          navigator.notification.alert("Error retrieving SerialLotNumber List.", null, "Error", "OK");
          return;
        }
      });
    },

    ShowSerialLotForm: function(model) {
      //console.log("Show Serial Lot Form");
      this.ValidateSerializeLot(model.get("SerializeLot"), model.get("ItemCode"), this.GetItemDisplayName(model), model.get("LineNum"), model.get("ItemType"), model.get("UnitMeasureCode"), "ItemDetail", model);

      if (model.get("SerializeLot") === "None" && (model.get("ItemType") != Enum.ItemType.GiftCard && model.get("ItemType") != Enum.ItemType.GiftCertificate)) {
        navigator.notification.alert("Item selected has no SerializeLot type set.", null, "Invalid Action", "OK");
      }
    },
    /**
		 Add Items to Cart by tapping 'add' on item detail page

		 @method AddLookupItemToCart
		 **/
    AddLookUpItemToCart: function(e) {
      e.preventDefault();
      //this.ValidateSerializeLot(_model.get("SerializeLot"), _model.get("ItemCode"), _model.get("ItemName"), this.GetLineNum(), _model.get("ItemType"));
      this.AddToCart(_model);
      this.LookupDone(e);
    },

    /**
		 Add Item Directly to Cart by tapping the item

		 @method AddLookupItemDirectlyToCart
		 **/
    AddLookupItemDirectlyToCart: function(model) {
      //this.ValidateSerializeLot(model.get("SerializeLot"), model.get("ItemCode"), model.get("ItemName"), this.GetLineNum(), model.get("ItemType"));
      var isAdded = this.AddToCart(model);
      $("#lookup").remove();
      if (model.get("SerializeLot") == null || model.get("SerializeLot") == "None") {
        $("#main-transaction-blockoverlay").hide();
      } else {
        if (Global.TransactionType != Enum.TransactionType.Sale) {
          $("#main-transaction-blockoverlay").hide();
        }
      }

      if (isAdded) {
        if (model.get("ItemType") === Enum.ItemType.GiftCard || model.get("ItemType") === Enum.ItemType.GiftCertificate) {
          switch (Global.TransactionType) {
            case Enum.TransactionType.ConvertOrder:
            case Enum.TransactionType.Sale:
            case Enum.TransactionType.UpdateInvoice:
            case Enum.TransactionType.ResumeSale:
              $("#main-transaction-blockoverlay").show();
              break;

            default:
              $("#main-transaction-blockoverlay").hide();
          }
        }
      } else $("#main-transaction-blockoverlay").hide();
      sortVar = "ItemName";
      //reset value
    },

    /**
		 Get Lookup Items

		 @method GetLookupItems
		 **/
    GetLookupItems: function(rows, criteria, itemCode) {

      var _self = this;
      var _itemLookup = new LookupCriteriaModel();
      var _rowsToSelect = rows;

      //Initialize collection
      this.productCollection = new ProductCollection();
      this.productCollection.sortVar = sortVar;
      this.productCollection.on('selected', this.LoadItemDetail, this);
      this.productCollection.on('addItem', this.AddLookupItemDirectlyToCart, this);

      this.ShowSpinner();

      _itemLookup.set({
        ItemCode: itemCode,
        CriteriaString: criteria, //jj
        WebsiteCode: Shared.GetWebsiteCode(),
        WarehouseCode: Global.Preference.DefaultLocation,
        ShowPhasedOutItems: _self.IsReturn()
      });

      this.EnableProductLookUpButton(false);

      _itemLookup.url = Global.ServiceUrl + Service.PRODUCT + Method.ITEMLOOKUP + _rowsToSelect;

      _itemLookup.save(null, {
        success: function(model, response, options) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          _self.productCollection.reset(response.Items);
          _self.HideActivityIndicator();
          /*
           * CSL-6386 : uncommented by Alexis Banaag. Reason: Parent Content of iScroll is null
           */
          //_self.LoadScroll();
          if (Global.OnRechargeProcess) _self.ConitinueRechargeGiftCard(response.Items); //for gcard recharge process : CSL-8769
          _self.EnableProductLookUpButton(true);
        },

        error: function(model, error, options) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          _self.EnableProductLookUpButton(true);
          model.RequestError(error, "Error");
          _self.HideActivityIndicator();
        }
      });
    },

    EnableProductLookUpButton: function(isLoading) { //jj15
      //console.log(isLoading + " EnableProductLookUpButton");
      if (!isLoading) {
        $('#lookup-product').addClass('ui-disabled');
        $('#lookup-category').addClass('ui-disabled');
      } else {
        $('#lookup-product').removeClass('ui-disabled');
        $('#lookup-category').removeClass('ui-disabled');
      }
    },
    /**
		 Reload Products View

		 @method ReloadProductsView
		 **/
    ReloadProductsView: function() {
      this.productsview = new ProductsView({
        el: $("#lookup-content"),
        collection: this.productCollection
      });
    },

    /**
		 Hide Unnecessary Buttons for Lookup

		 @method HideOtherButtons
		 **/
    hideOtherButtons: function() {
      $("#back-products").hide();
      $("#add-lookup").hide();
      $("#back-details").hide();
    },

    /**
		 Show Lookup Loading Spinner

		 @method ShowSpinner
		 **/
    ShowSpinner: function() {
      var target = document.getElementById('main-transaction-page');
      this.ShowActivityIndicator(target);
      this.DisableButton();
      $("<h5>Loading...</h5>").appendTo($("#spin"));
    },

    /**
		 Initialize Summary model

		 @method InitializeSummaryModel
		 **/
    DisableButton: function() {
      //$("#lookup-footer").addClass('ui-disabled');
      //$("#done-lookup").addClass('ui-disabled');
    },

    /**
		 Enable Lookup Button

		 @method EnableLookupButton
		 **/
    EnableLookupButton: function() {
      $("#lookup-footer").removeClass('ui-disabled');
      //$("#done-lookup").removeClass('ui-disabled');
    },

    /**
		 Show Lookup Pop up

		 @method ShowLookup
		 **/
    ShowLookup: function(e) {
      e.preventDefault();
      $("#lookup").remove();
      $("#spin").remove();
      this.InitializeLookup();
      $("#lookup").show();
      if (Global.isBrowserMode) Shared.BlurItemScan();
      $("#main-transaction-blockoverlay").show();
    },

    /**
		 Close Lookup Pop up

		 @method LookupDone
		 **/
    LookupDone: function(e) {
      e.preventDefault();
      Shared.FocusToItemScan();
      $("#lookup-search").blur();
      $("#lookup").hide();
      this.HideActivityIndicator();
      $("#main-transaction-blockoverlay").hide();
      sortVar = "ItemName"; //reset value
    },

    /**
		 Load iScroll

		 @method LoadScroll
		 **/
    LoadScroll: function() {
      if (this.myScroll) {
        this.myScroll.refresh()
      } else {
        this.myScroll = new iScroll('lookup-content', {
          hScroll: false
        });
      }
    },

    /**
		 Show Item Detail Necessary Buttons

		 @method showItemDetailButtons
		 **/
    showItemDetailButtons: function() {
      $("#done-lookup").hide();
      $("#back-details").hide();
      $("#back-products").show();
      $("#add-lookup").show();
    },

    /**
		 Load Item Detail

		 @method LoadItemDetail
		 **/
    LoadItemDetail: function(model) {
      this.showItemDetailButtons();
      $("#lookup-title").text("Details");
      this.detailView = new ProductDetailView({
        model: model
      });
      _itemCode = model.get("ItemCode");
      _unitMeasureCode = model.get("UnitMeasureCode");
      _model = model;
    },

    /**
		 Show Free Stock necessary Button

		 @method showFreeStockButton
		 **/
    showFreeStockButton: function() {
      $("#back-products").hide();
      $("#add-lookup").hide();
      $("#back-details").show();
      $("#done-lookup").show();
    },

    /**
		 Retrieve and Load Free Stock information

		 @method LoadFreeStock
		 **/
    LoadFreeStock: function() { //jj19
      var self = this;
      this.showFreeStockButton();
      $("#lookup-title").text("Free Stock");
      this.stockCollection = new StockCollection();
      var mdl = new BaseModel();
      mdl.url = Global.ServiceUrl + Service.PRODUCT + Method.LOCATIONSTOCKLOOKUP
      mdl.set({
        ItemCode: _itemCode,
        UnitMeasureCode: _unitMeasureCode
      })
      mdl.save(null, {
        success: function(model, response, options) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          self.LoadFreeStockByUnitOfMeasure(response);
        },
        error: function(model, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          model.RequestError(error, "Error Retrieving Free Stock Preference");
        }
      });


      // this.stockCollection.url = Global.ServiceUrl + Service.PRODUCT + Method.LOADLOCATIONSTOCK + _itemCode +"/"+ encodeURI(_unitMeasureCode);
      // this.stockCollection.fetch({
      // 	success : function(collection, response, options){
      // 		if(!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      // 		//	self.stockCollection.reset(response.StockTotalDetails)
      // 		// self.stockView = new FreeStockView({
      // 		// 	collection: self.stockCollection.reset(response.StockTotalDetails)
      // 		// });
      // 		self.LoadFreeStockByUnitOfMeasure(response);
      // 	},
      // 	error : function(collection, error, response){
      // 		if(!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      // 		collection.RequestError(error, "Error Retrieving Local Preference");
      // 	}
      // });
    },

    LoadFreeStockByUnitOfMeasure: function(collection) { //jj

      this.stockContainer = new StockCollection();
      this.stockContainer.reset(collection.StockTotalDetails);
      this.stockCollection = new StockCollection();

      if (this.stockContainer.length > 0) {
        var _self = this;

        this.stockContainer.each(function(model) {
          if (model.get('UnitMeasureCode') == _unitMeasureCode) {
            _self.stockCollection.add(model);
          }
        })
      }
      this.stockView = new FreeStockView({
        collection: this.stockCollection
      });

    },
    /**
		 Load Free Stock view

		 @method LoadFreeStockView
		 **/
    LoadFreeStockView: function() {
      this.LoadFreeStock();
    },

    /**
		 Reload / Refesh Stock View

		 @method ReloadStockView
		 **/
    ReloadStockView: function() {
      /*var _stockCollection = this.stockCollection.find(function(model) {
	  				return ( model.get("ItemCode") === _itemCode && model.get("UnitMeasureCode") === _unitMeasureCode ) ;
			});*/
      this.stockView = new FreeStockView({
        collection: this.stockCollection
      });
    },

    /**
		 Go Back to Item List

		 @method BackToProductLookup
		 **/
    BackToProductLookup: function(e) {
      e.preventDefault();
      $("#spin").remove();
      $("#lookup").replaceWith(_.template(LookupTemplate));
      this.hideOtherButtons();
      this.CheckLookUpSortVar();
      this.InitializeProductLookup();
      this.productCollection.sortVar = sortVar;
      this.productCollection.sort();
    },

    /**
		 Go Back to Item Detail

		 @method BackToDetails
		 **/
    BackToDetails: function(e) {
      e.preventDefault();
      $("#spin").remove();
      $("#lookup").replaceWith(_.template(LookupTemplate));
      this.showItemDetailButtons();
      $("#lookup-title").text("Details");
      this.productCollection.each(function(model) {
        if (model.get("ItemCode") === _itemCode && model.get("UnitMeasureCode") === _unitMeasureCode) {
          this.detailView = new ProductDetailView({
            model: model
          });
        }
      });
    },

    /**
		 Search / Find for Item via Product Lookup

		 @method FindLookupItem
		 **/
    FindLookUpItem: function() {
      var _criteria = $("#lookup-search").val();
      this.GetLookupItems(_rows, _criteria, null);
      this.ReloadProductsView();
    },

    /**
		 Check if user tapped 'enter' / 'return' key

		 @method inputLookUpSearch_KeyPress
		 **/
    inputLookUpSearch_KeyPress: function(e) {
      // inputLookUpSearch_KeyUp : function(e){
      if (e.keyCode === 13) {
        this.FindLookUpItem();
      } else {
        this.ShowLookupClearBtn(e);
      }
    },

    /**
		 Sort Items on Lookup by Product name

		 @method SortProductLookup
		 **/
    SortProductLookUp: function(e) {

      e.preventDefault();
      $("#spin").remove();
      sortVar = "ItemName";
      $("#lookup").replaceWith(_.template(LookupTemplate));
      this.hideOtherButtons();
      $("#lookup-category").removeClass("lookup-selected");
      $("#lookup-product").addClass("lookup-selected");
      this.InitializeProductLookup();
      this.productCollection.sortVar = sortVar;
    },

    /**
		 Sort Items on Lookup by Category Name

		 @method SortCategoryLookup
		 **/
    SortCategoryLookUp: function(e) {

      e.preventDefault();
      $("#spin").remove();
      sortVar = "CategoryCode";
      $("#lookup").replaceWith(_.template(LookupTemplate));
      this.hideOtherButtons();
      $("#lookup-product").removeClass("lookup-selected");
      $("#lookup-category").addClass("lookup-selected");
      this.InitializeProductLookup();
      this.productCollection.sortVar = sortVar;
    },
    //END LOOKUP

    /**
		 Set as Selected Category

		 @method SetSelected
		 **/
    SetSelected: function() { //jjtest
      this.categoryCollection.each(function(category) {
        if (category.get("IsDefault") === true) {
          Global.Category = category.get("CategoryCode");
          $("#" + category.cid).addClass("selected");
        }
      });

      if (Global.Category === "") {
        $("#itemContainer").append("<h5 style='text-align:center; position:relative; top:190px;'>No Items Found...</h5>");
        $("#itemContainer").append("<h5 style='text-align:center; position:relative; top:200px;'>No Category Selected. Please select one above or go to settings..</h5>");
      }


      this.InitializeItems();
    },

    /**
		 Get Category Code and Set it as Selected

		 @method IsSelected
		 **/
    IsSelected: function(category) {
      Global.Category = category.get("CategoryCode");
      this.InitializeItems();
      this.itemsView.undelegateEvents();
    },


    /**
		 Add Item/s to Cart

		 @method AddItemToCart
		 **/
    AddItemToCart: function(item) {
      Global.ManagerValidated = false;
      if (Global.Preference.DefaultPOSTransaction <= 3) {
        var _item = new BaseModel(item);

        //if(Shared.CheckIfItemIsPhaseout(_item,1,0,true,this.cartCollection)){_item.set({DoNotCheckStock : true});return;}
        this.NotifyIfItemIsOutOfStock(item);
        if (!Shared.IsNullOrWhiteSpace(this.couponModel.get("CouponCode")) && this.IsRequireRecalculateCoupon()) {
          this.isNoCouponAtFirst = false;
          this.LockTransactionScreen(true, "Computing Coupon");

          if (this.cartCollection && this.cartCollection.length > 0) {
            this.cartCollection.each(function(cart) {
              this.tempCart.push(cart.toJSON());
            }.bind(this));
          }

          this.tempCart.push(this.UpdateNewLineForReturn(item));
        } else {
          this.isNoCouponAtFirst = true;

//          if (Global.Preference.IsAutoAdjustmentStock == false && item.IsOutOfStock == true) {
//            Global.msgTitle = "Stock Verification";
//            Global.msg1 = "Item '" + item.ItemName + "' does not have enough stock. Turn on Auto Adjustment stock on Settings to add item with no stock.";
//            navigator.notification.alert(Global.msg1, null, Global.msgTitle, "OK");
//          }
//          else {
//            //this.cartCollection.add(this.UpdateNewLineForReturn(item));
//            Global.CurrentItem = this.UpdateNewLineForReturn(item);
//          }

          if (!Global.Preference.AutoAllocateOverrideLevel ||
              Global.Preference.AutoAllocateOverrideLevel == "" ||
              Global.Preference.AutoAllocateOverrideLevel == Global.UserInfo.RoleCode) {

            if (Global.Preference.IsAutoAdjustmentStock == false && item.IsOutOfStock == true) {
              Global.msgTitle = "Stock Verification";
              Global.msg1 = "Item '" + item.ItemName + "' does not have enough stock. Turn on Auto Adjustment stock on Settings to add item with no stock.";
              navigator.notification.alert(Global.msg1, null, Global.msgTitle, "OK");
            } else {
              this.cartCollection.add(this.UpdateNewLineForReturn(item));
            }

          } else {
            if (Global.Preference.IsAutoAdjustmentStock == false && item.IsOutOfStock == true) {
              Global.msgTitle = "Stock Verification";
              Global.msg1 = "Item '" + item.ItemName + "' does not have enough stock. Turn on Auto Adjustment stock on Settings to add item with no stock.";
              navigator.notification.alert(Global.msg1, null, Global.msgTitle, "OK");
            }
            else if (Global.Preference.IsAutoAdjustmentStock == true && item.IsOutOfStock == true) {
              Global.CurrentItem = this.UpdateNewLineForReturn(item);
              this._lastItemChecked = null;

            } else {
              this.cartCollection.add(this.UpdateNewLineForReturn(item));
            }
          }
        }

    // var _saleItemTaxOverrideLookup = new LookupCriteriaModel();
    // var taxCode = window.sessionStorage.getItem('selected_taxcode');
    // if (taxCode ==null) taxCode  = Global.ShipTo.TaxCode;

    //   this.cartCollection.each(function(cartItem){
    //       var itemCode  = cartItem.get('ItemCode');
    //       var currentTaxCode = cartItem.get('TaxCode');
    //       if (currentTaxCode == null || currentTaxCode == '') {
    //           _saleItemTaxOverrideLookup.set({
    //           IsTaxByLocation: Global.Preference.TaxByLocation,
    //           TransactionType: Global.TransactionType,
    //           ItemCode: itemCode,
    //           ShipToCode: Global.ShipTo.ShipToCode,
    //           TaxCode: taxCode,
    //           WarehouseCode: Global.Preference.DefaultLocation,
    //           IsUsePOSShippingMethod: Global.Preference.IsUsePOSShippingMethod,
    //           POSShippingMethod: Global.Preference.POSShippingMethod
    //       });

    //         _saleItemTaxOverrideLookup.url = Global.ServiceUrl + Service.SOP + Method.SALEITEMTAXOVERRIDE; 

    //         _saleItemTaxOverrideLookup.save(null, {
    //           success: function(model, response, options) {
    //             if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
    //             if (!response.ErrorMessage) {
    //                  taxCode = response.Value;
    //                   cartItem.set({
    //                    TaxCode: taxCode,
    //                    Tax: taxCode,
    //                    SalesTaxCode: taxCode
    //                   });
    //                 }
    //          }
    //        });  //_saleItemTaxOverrideLookup

    //       } //if (currentTaxCode == null || currentTaxCode == '') 
      


      
    // });


	  	this.cartCollection.each(function(cartItem){

			if(cartItem.get('IsPromoItem') == true)
			{
      	$("#" + cartItem.cid + ' #quantityDisplay').addClass('ui-disabled').css("opacity", 1);
			  $("#" + cartItem.cid + ' #display-itemName').addClass('ui-disabled').css("opacity", 1);
			  $("#" + cartItem.cid + ' #itemPriceDisplay').addClass('ui-disabled').css("opacity", 1);
			  $("#" + cartItem.cid + ' #discountDisplay').addClass('ui-disabled').css("opacity", 1);
			  $("#" + cartItem.cid + ' #extPriceRate-td').addClass('ui-disabled').css("opacity", 1);
			}
		});

        this.UpdateCouponWithValidation();
      }
    },

    UpdateNewLineForReturn: function(item) {
      if (Global.TransactionType != Enum.TransactionType.SalesRefund) return item;
      var tmpModel = new BaseModel(item);
      //tmpModel.set(item);
      tmpModel.set({
        Good: item.QuantityOrdered, //Originally Defective
        QuantityDisplay: item.QuantityOrdered,
        IsNewLine: true
      });
      return tmpModel.attributes;
    },

    /**
		 Add Quantity to Cart Item

		 @method QuantityAdded
		 **/
    QuantityAdded: function(item) {
      this.UpdateCartItem(item, 1, "QuantityOrderedUpdated", true);
    },

    /**
		 Subtract Quantity to Cart Item

		 @method QuantitySubtracted
		 **/
    QuantitySubtracted: function(item) {
      this.UpdateCartItem(item, -1, "QuantityOrderedUpdated", true);
    },

    /**
		 Retrieve SaleItem Price Tax

		 @method GetSaleItemPriceTax
		 **/
    GetSaleItemPriceTax: function(itemCode, customerCode, location, unitMeasure, taxByLocation, couponID, newItem, type) { //3
      this.RemoveTermDiscountPayment();
     var _self = this;
     var _newItem = newItem;
     var _itemLookup = new LookupCriteriaModel();
     var _saleItemTaxOverrideLookup = new LookupCriteriaModel();
     var _shipToCode;
     var _itemLineNum = newItem.get("LineNum");
     var _salesOrderDetailCollection = new SalesOrderDetailCollection();
     var _salesOrderCollection = new SalesOrderCollection();

    _salesOrderDetailCollection.add(this.cartCollection.models);

     var salesOrderModel = new BaseModel();
     var shippingDate = new Date();
     shippingDate = this.JsonToAspDate(shippingDate),
       salesOrderModel.set({
         BillToCode: Global.CustomerCode,
         POSWorkstationID: Global.POSWorkstationID,
         POSClerkID: Global.Username,
         IsFreightOverwrite: true,
         IsOverrideSalesRep: Global.Preference.IsOverrideSalesRep,
         IsTaxByLocation: Global.Preference.TaxByLocation,
         WarehouseCode: Global.Preference.DefaultLocation,
         PublicNotes: Global.PublicNote.PublicNotes,
         ShippingDate: shippingDate,
         WebSiteCode: Global.Preference.WebSiteCode,
     SalesOrderCode: "[To be generated]",
     SourceSalesOrderCode: "[To be generated]",
     Type: "Sales Order",
     SalesOrderDate: shippingDate
       });
     if (!Shared.IsNullOrWhiteSpace(this.customerPOModel)) {
       salesOrderModel.set(self.customerPOModel.attributes);
     }
     _salesOrderCollection.add(salesOrderModel);
     if (!couponID) couponID = "";
     this.AssignTransactionShipTo(_salesOrderCollection.at(0));

     this.SetCouponToTransactionHeader(_salesOrderCollection.at(0), false);
     var _transactionType = Global.TransactionType;
     if (Global.TransactionType == Enum.TransactionType.UpdateInvoice) _transactionType = Enum.TransactionType.ResumeSale;

     var taxCode = window.sessionStorage.getItem('selected_taxcode');
     if (taxCode ==null) taxCode  = Global.ShipTo.TaxCode;

       _itemLookup.set({
                   ItemCode: itemCode,
                   CustomerCode: customerCode,
                   WarehouseCode: location,
                   UnitMeasureCode: unitMeasure,
                   IsTaxByLocation: taxByLocation,
                   CouponId: couponID,
                   ShipToCode: Global.ShipTo.ShipToCode,
                   WebsiteCode: Shared.GetWebsiteCode(),
                   DiscountPercent: Global.ShipTo.DiscountPercent,
                   DiscountType: Global.ShipTo.DiscountType,
                   LineNum: _itemLineNum,
                   TaxCode: taxCode,
                   SalesOrderCode: "[To be generated]",
                   ItemName: "None",
                   IsUsePOSShippingMethod: Global.Preference.IsUsePOSShippingMethod,
                   POSShippingMethod: Global.Preference.POSShippingMethod
                 });
                 _salesOrderDetailCollection.add(_itemLookup);
                 //New Fields for Stock Verification
                 _itemLookup.set({
                   SimilarItemsOnCart: _self.GetSimilarItemsOnCart(_itemLookup, true, (!type ? true : false)),
                   DocumentCode: _self.GetTransactionCodeForStockVerification(),
                   TransactionType: _transactionType,
                   ShowPhasedOutItems: _self.IsReturn()
                 });

                 _itemLookup.url = Global.ServiceUrl + Service.SOP + Method.SALEITEMPRICETAX;

           /*    _itemLookup.set("SalesOrder", _salesOrderCollection.toJSON());
               _itemLookup.set("SalesOrderDetail", _salesOrderDetailCollection.toJSON());*/

                 _itemLookup.save(null, {
                   success: function(model, response, options) {
                     if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
                     if (!response.ErrorMessage) {
                       switch (type) {
                         case "UpdateUnitMeasure":
                           _self.UpdateItemPriceOnUnitMeasure(model, itemCode, _itemLineNum);
                           break;
                         case "UpdateWarehouseCode":
                           _self.UpdateItemPriceOnWarehouseCode(model, itemCode, newItem);
                            break;
                            default:

                           _self.itemPriceCollection.reset(response);
                           _self.RemoveFromItemsOnQueue(_newItem);
                       }
                       _self.OnRequestCompleted(Method.SALEITEMPRICETAX);
                     } else {
                       if (type === "UpdateWarehouseCode") _self.revertWarehouseCode(_newItem);
                       _self.RemoveFromItemsOnQueue(_newItem);
                       navigator.notification.alert(model.get("ErrorMessage"), null, "Error", "OK");
                     }
                     _self.SearchOnFocus();
                   },
                   error: function(model, error, response) {
                     if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
                     model.RequestError(error, "Error");
                     _self.RemoveFromItemsOnQueue(_newItem);
                   }
                 });


     // _saleItemTaxOverrideLookup.set({
     //     IsTaxByLocation: taxByLocation,
     //     TransactionType: _transactionType,
     //     ItemCode: itemCode,
     //     ShipToCode: Global.ShipTo.ShipToCode,
     //     TaxCode: taxCode,
     //     WarehouseCode: Global.Preference.DefaultLocation,
     //     IsUsePOSShippingMethod: Global.Preference.IsUsePOSShippingMethod,
     //     POSShippingMethod: Global.Preference.POSShippingMethod
     //     });

     //   _saleItemTaxOverrideLookup.url = Global.ServiceUrl + Service.SOP + Method.SALEITEMTAXOVERRIDE;

     //     _saleItemTaxOverrideLookup.save(null, {
     //     success: function(model, response, options) {
     //       if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
     //       if (!response.ErrorMessage) {
     //            taxCode = response.Value;

     //             _itemLookup.set({
     //               ItemCode: itemCode,
     //               CustomerCode: customerCode,
     //               WarehouseCode: location,
     //               UnitMeasureCode: unitMeasure,
     //               IsTaxByLocation: taxByLocation,
     //               CouponId: couponID,
     //               ShipToCode: Global.ShipTo.ShipToCode,
     //               WebsiteCode: Shared.GetWebsiteCode(),
     //               DiscountPercent: Global.ShipTo.DiscountPercent,
     //               DiscountType: Global.ShipTo.DiscountType,
     //               LineNum: _itemLineNum,
     //               TaxCode: taxCode,
     //               SalesOrderCode: "[To be generated]",
     //               ItemName: "None",
     //               IsUsePOSShippingMethod: Global.Preference.IsUsePOSShippingMethod,
     //               POSShippingMethod: Global.Preference.POSShippingMethod
     //             });
     //             _salesOrderDetailCollection.add(_itemLookup);
     //             //New Fields for Stock Verification
     //             _itemLookup.set({
     //               SimilarItemsOnCart: _self.GetSimilarItemsOnCart(_itemLookup, true, (!type ? true : false)),
     //               DocumentCode: _self.GetTransactionCodeForStockVerification(),
     //               TransactionType: _transactionType,
     //               ShowPhasedOutItems: _self.IsReturn()
     //             });

     //             _itemLookup.url = Global.ServiceUrl + Service.SOP + Method.SALEITEMPRICETAX;

     //       /*    _itemLookup.set("SalesOrder", _salesOrderCollection.toJSON());
     //           _itemLookup.set("SalesOrderDetail", _salesOrderDetailCollection.toJSON());*/

     //             _itemLookup.save(null, {
     //               success: function(model, response, options) {
     //                 if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
     //                 if (!response.ErrorMessage) {
     //                   switch (type) {
     //                     case "UpdateUnitMeasure":
     //                       _self.UpdateItemPriceOnUnitMeasure(model, itemCode, _itemLineNum);
     //                       break;
     //                     case "UpdateWarehouseCode":
     //                       _self.UpdateItemPriceOnWarehouseCode(model, itemCode, newItem);
     //                        break;
     //                        default:

     //                       _self.itemPriceCollection.reset(response);
     //                       _self.RemoveFromItemsOnQueue(_newItem);
     //                   }
     //                   _self.OnRequestCompleted(Method.SALEITEMPRICETAX);
     //                 } else {
     //                   if (type === "UpdateWarehouseCode") _self.revertWarehouseCode(_newItem);
     //                   _self.RemoveFromItemsOnQueue(_newItem);
     //                   navigator.notification.alert(model.get("ErrorMessage"), null, "Error", "OK");
     //                 }
     //                 _self.SearchOnFocus();
     //               },
     //               error: function(model, error, response) {
     //                 if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
     //                 model.RequestError(error, "Error");
     //                 _self.RemoveFromItemsOnQueue(_newItem);
     //               }
     //             });

     //          }
     //        }

     //  });  //_saleItemTaxOverrideLookup
   },

    revertWarehouseCode: function(model) {
      model.revertWarehouseCode();
    },

    /**
		 Retrieve SaleItem Price Tax by UPC

		 @method GetSaleItemPriceTaxByUPC
		 **/
    GetSaleItemPriceTaxByUPC: function(upcCode, customerCode, location, taxByLocation, couponID) {
      var _self = this;
      var _itemLookup = new LookupCriteriaModel();
      var _saleItemTaxOverrideLookup = new LookupCriteriaModel();

      if (!couponID) couponID = "";

      var _transactionType = Global.TransactionType;
      if (Global.TransactionType == Enum.TransactionType.UpdateInvoice) _transactionType = Enum.TransactionType.ResumeSale;

       var taxCode = window.sessionStorage.getItem('selected_taxcode');
      if (taxCode ==null) taxCode  = Global.ShipTo.TaxCode;

      _saleItemTaxOverrideLookup.set({
          IsTaxByLocation: taxByLocation,
          TransactionType: _transactionType,
          ItemCode: upcCode,
          ShipToCode: Global.ShipTo.ShipToCode,
          TaxCode: taxCode,
          WarehouseCode: Global.Preference.DefaultLocation,
          IsUsePOSShippingMethod: Global.Preference.IsUsePOSShippingMethod,
          POSShippingMethod: Global.Preference.POSShippingMethod
          });

        _saleItemTaxOverrideLookup.url = Global.ServiceUrl + Service.SOP + Method.SALEITEMTAXOVERRIDE;

          _saleItemTaxOverrideLookup.save(null, {
          success: function(model, response, options) {
            if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
            if (!response.ErrorMessage) {
                 taxCode = response.Value;

                _itemLookup.set({
                  ItemCode: upcCode,
                  CustomerCode: customerCode,
                  WarehouseCode: location,
                  UnitMeasureCode: null,
                  IsTaxByLocation: taxByLocation,
                  CouponId: couponID,
                  WebsiteCode: Shared.GetWebsiteCode(),
                  ShipToCode: Global.ShipTo.ShipToCode,
                  DiscountType: Global.ShipTo.DiscountType,
                  DiscountPercent: Global.ShipTo.DiscountPercent,
                  DiscountableDays: Global.ShipTo.DiscountableDays,
                  TaxCode: taxCode,
                  IsUsePOSShippingMethod: Global.Preference.IsUsePOSShippingMethod,
                  POSShippingMethod: Global.Preference.POSShippingMethod
                })

                //New Fields for Stock Verification
                _itemLookup.set({
                  SimilarItemsOnCart: _self.GetSimilarItemsOnCart(_itemLookup, true),
                  DocumentCode: _self.GetTransactionCodeForStockVerification(),
                  TransactionType: _transactionType,
                  ShowPhasedOutItems: _self.IsReturn()
                });

                _itemLookup.url = Global.ServiceUrl + Service.SOP + Method.SALEITEMPRICETAXBYUPC;
                _itemLookup.save(null, {
                  success: function(model, response) {
                    if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
                    _self.LoadUPCItemList(response, upcCode);
                  },
                  error: function(model, error, response) {
                    if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
                    model.RequestError(error, "Error");
                  }
                });

               }
             }

       });  //_saleItemTaxOverrideLookup

    
    },

    LoadUPCItemList: function(response, upcCode) {
      if (!Shared.IsNullOrWhiteSpace(response.SaleItems)) {
        var _length = response.SaleItems.length;
        var _saleItemCollection = new BaseCollection();
        _saleItemCollection.reset(response.SaleItems);
        if (_length > 1) {
          if (!Shared.IsNullOrWhiteSpace(this.upcItemListView)) {
            this.upcItemListView.unbind();
            this.upcItemListView.remove();
            this.upcItemListView = null;
          }

          $("#upcItemListContainer").append("<div id='upcMainListContainer'></div>");
          this.upcItemListView = new UPCItemsView({
            el: $("#upcMainListContainer"),
            collection: _saleItemCollection,
            parentEl: $("#upcItemListContainer")
          });

          this.upcItemListView.InitializeChildViews(upcCode);
          this.upcItemListView.on("AddSelectedItem", this.AddSelectedUpcItem, this);
          $("#main-transaction-blockoverlay").show();
        } else {
          var _tempCollection = new BaseCollection();
          _tempCollection.reset(response.SaleItems);
          this.AddSelectedUpcItem(_tempCollection);
        }

      }
    },

    AddSelectedUpcItem: function(collection) {
      var self = this;
      var itemPriceArray = [];
      var filteredCart = [];

      collection.each(function(upcitem) {
        upcitem.set({
          IsLoadedByUpc: true
        });

        var isReturn = (Global.TransactionType === Enum.TransactionType.SalesRefund);
        var existingCartItem = self.cartCollection.find(function(cartItem) {
          var itemCode = upcitem.get("ItemCode");
          var umCode = upcitem.get("UnitMeasureCode");
          if (isReturn) return cartItem.get("ItemCode") === itemCode && cartItem.get("UnitMeasureCode") === umCode && cartItem.get("IsNewLine") && cartItem.get('PromoDocumentCode') == '';

          return cartItem.get("ItemCode") == itemCode && cartItem.get("UnitMeasureCode") == umCode && cartItem.get('PromoDocumentCode') == '';
        });

        if (existingCartItem) {
          self.UpdateCartItem(existingCartItem, 1, "QuantityOrderedUpdated", false);
        } else {
          itemPriceArray.push(upcitem); //self.itemPriceCollection.reset(upcitem);
        }
      });

      if (itemPriceArray.length > 0) this.itemPriceCollection.reset(itemPriceArray);

      this.OnRequestCompleted(Method.SALEITEMPRICETAXBYUPC);

      var isAllowLoadSerial = ((Global.TransactionType === Enum.TransactionType.Sale ||
        Global.TransactionType === Enum.TransactionType.Suspend ||
        Global.TransactionType === Enum.TransactionType.UpdateInvoice ||
        Global.TransactionType === Enum.TransactionType.ResumeSale ||
        Global.TransactionType === Enum.TransactionType.SalesRefund ||
        Global.TransactionType === Enum.TransactionType.ConvertOrder));

      collection.each(function(cart) {
        var filtered = self.cartCollection.find(function(item) {
          return item.get("ItemCode") === cart.get("ItemCode") && item.get("UnitMeasureCode") === cart.get("UnitMeasureCode");
        });

        if (filtered) filteredCart.push(filtered);
      });

      if (filteredCart.length > 0) {
        if (isAllowLoadSerial) this.GetUPCSerialLotItems(new BaseCollection(filteredCart));
        else $("#main-transaction-blockoverlay").hide();
      }
    },

    GetUPCSerialLotItems: function(collection) {
      var serialItems = [];

      collection.each(function(item) {
        var serialLot = item.get("SerializeLot");
        var serialLotType = (!Shared.IsNullOrWhiteSpace(serialLot) && serialLot != "None");
        var isGC = (item.get("ItemType") === Enum.ItemType.GiftCard || item.get("ItemType") === Enum.ItemType.GiftCertificate);

        if (serialLotType || isGC) serialItems.push(item);
      });

      if (serialItems.length > 0) {
        this.upcItems = new BaseCollection(serialItems);
        //check if only one item is added if not load all items in a generator form for ease of use.
        if (serialItems.length === 1) this.AddSerialByUPCItem();
        else this.RenderGCList(this.upcItems);
      } else $("#main-transaction-blockoverlay").hide();
    },

    //AddSerialByUPCItem : function(isHide){
    //	if(!Shared.IsNullOrWhiteSpace(this.upcSerialItemCollection)){
    //		this.ValidateUPCSerialLotItems(this.upcSerialItemCollection.at(this.upcSerialCtr),isHide);
    //	}else{
    //		this.upcItemCollection = null;
    //		if(!Shared.IsNullOrWhiteSpace(isHide)) $("#main-transaction-blockoverlay").hide();
    //	}
    //},

    AddSerialByUPCItem: function(isHide) {
      var self = this;

      if (!Shared.IsNullOrWhiteSpace(this.upcItems)) {
        this.upcItems.each(function(item) {
          self.ValidateUPCSerialLotItems(item, isHide);
        });
      } else if (!Shared.IsNullOrWhiteSpace(isHide)) $("#main-transaction-blockoverlay").hide();
    },

    ValidateUPCSerialLotItems: function(serialItem, isHide) {
      var itemCode = serialItem.get("ItemCode");
      var umCode = serialItem.get("UnitMeasureCode");
      var item = this.cartCollection.find(function(cartItem) {
        return cartItem.get("ItemCode") == itemCode && cartItem.get("UnitMeasureCode") == umCode;
      });

      if (!Shared.IsNullOrWhiteSpace(item)) {
        //console.log("ValidateUpc");
        this.ValidateSerializeLot(serialItem.get("SerializeLot"),
          serialItem.get("ItemCode"),
          this.GetItemDisplayName(serialItem),
          item.get("LineNum"),
          serialItem.get("ItemType"),
          serialItem.get("UnitMeasureCode"),
          "",
          item);
      } else if (!Shared.IsNullOrWhiteSpace(isHide)) $("#main-transaction-blockoverlay").hide();

    },

    IsItemHasLocation: function(itemType) {
      var hasLocation = true;
      switch (itemType) {
        case "Non-Stock":
        case "Service":
        case "Gift Certificate":
        case "Gift Card":
          hasLocation = false;
          break;

      }
      return hasLocation;
    },

    /**
        Process Serialize Lot.
        Check if Item has SerializeLot specified
        then load Serialize Lot View

        @method ValidateSerializeLot
        **/
    ValidateSerializeLot: function(type, itemCode, itemName, lineNum, itemType, uom, eventName, model) {
      if (type === undefined || type === null || type === "None") {
        if (Global.OnRechargeProcess) {
          this.AssignExistingSerial("Serial", itemCode, itemName, lineNum, itemType, uom);
        } else if ((Global.TransactionType === Enum.TransactionType.Sale ||
            Global.TransactionType === Enum.TransactionType.Suspend ||
            Global.TransactionType === Enum.TransactionType.UpdateInvoice ||
            Global.TransactionType === Enum.TransactionType.ResumeSale ||
            Global.TransactionType === Enum.TransactionType.SalesRefund ||
            Global.TransactionType === Enum.TransactionType.Recharge || //CSL - 12638 : 09.04.2013
            Global.TransactionType === Enum.TransactionType.ConvertOrder) &&
          (itemType == Enum.ItemType.GiftCard || itemType == Enum.ItemType.GiftCertificate)) {
          this.InitializeSerializeLot("Serial", itemCode, itemName, lineNum, itemType, uom, eventName, model);
        }
        return;
      } else {
        if (Global.TransactionType === Enum.TransactionType.Sale || Global.TransactionType === Enum.TransactionType.Suspend || Global.TransactionType === Enum.TransactionType.UpdateInvoice || Global.TransactionType === Enum.TransactionType.ResumeSale || Global.TransactionType === Enum.TransactionType.ConvertOrder || Global.TransactionType === Enum.TransactionType.SalesRefund) {
          this.InitializeSerializeLot(type, itemCode, itemName, lineNum, itemType, uom, eventName, model);

        } else if (Global.TransactionType === Enum.TransactionType.SalesRefund) { //CSL-17286 : 10.25.13
          if (!this.serializeLotCollection) return;
          var hasSerialLot = this.serializeLotCollection.filter(function(model) {
            return (itemCode == model.get("ItemCode") && model.get("LineNum") == lineNum);
          });
          if (hasSerialLot.length > 0) this.InitializeSerializeLot(type, itemCode, itemName, lineNum, itemType, uom, eventName, model);
        } else {
          return;
        }
      }


    },

    IsGC: function(itemType) {
      return (itemType == "Gift Card" || itemType == "Gift Certificate");
    },

    IsMultiLocation: function() {
      if (!Global.AccountingPreference) return false;
      if (!Global.AccountingPreference.IsLocation) return false;
      return true;
    },

    CheckIfCartHasDifferentLocation: function() {
      var self = this;
      if (!self.cartCollection) return false;
      if (self.cartCollection.length == 0) return false;
      var hasOtherLocation = false;
      self.cartCollection.each(function(item) {
        if (hasOtherLocation) return;
        hasOtherLocation = (item.get("WarehouseCode") != Global.Preference.DefaultLocation);
      });
      return hasOtherLocation;
    },

    /**
		 Add New Item to Cart

		 @method AddNewItemToCart
		 **/
	  AddFreeItemToCart: function(collection, promoitemcollection) {
      var self = this;
      var qtyOrdered;
      var _isItemOutofStock;
      var tempModel = new BaseModel();
      if (!this.ValidateLocationBankAccount()) return;

      /* Removed : CSL-25513 */
      //if (self.IsMultiLocation()) if (self.CheckIfCartHasDifferentLocation()) {
      //    navigator.notification.alert("Cannot add new item on existing transaction from other location.", null, "Action Not Allowed", "OK");
      //    return;
      //}

      collection.each(function(newItem) {
        _isItemOutofStock = newItem.get("IsOutOfStock");
        var _errorMessage = newItem.get("ErrorMessage");
        if (_errorMessage) {
          //console.log(_errorMessage);
          navigator.notification.alert(_errorMessage, null, "Error", "OK");

          //if (self.ntf) {
          //    self.ntf = false;
          //    $("#notification-overlay").css("top", "600px");
          //    $("#notification-overlay").css("padding", "7px 20px 7px");
          //} else {
          //    self.ntf = true;
          //    $("#notification-overlay").css("top", "-5px");
          //    $("#notification-overlay").css("padding", "10px 20px 3px");
          //}

          //Shared.Products.ShowNotification(_errorMessage, true);
          return;
        }

        if (self.IsReturn() && self.IsGC(newItem.get("ItemType"))) {
          navigator.notification.alert("Adding " + newItem.get("ItemType") + " is not allowed on return transactions.", null, "Action Not Allowed", "OK");
          return;
        }

        if (this.IsItemGiftCredit(newItem) == true && this.CartHasNegativaQty() == true) {
          navigator.notification.alert('Item exchange is not allowed for transactions with Gift Cards. Please create a separate transaction.', null, "Action Not Allowed", "OK");
          return;
        }

        var _ItemTaxCode = "",
          _lineNum = this.GetLineNum();

        //CSL-18387
        if (self.IsReturn()) {
          newItem.set({
            CouponDiscountAmount: 0,
            IsIncludedInCoupon: false,
            IsNewLine: true
          });
        }

        if (Global.OnRechargeProcess && newItem.get("ItemType") == Enum.ItemType.GiftCard) {
          newItem.set({
            Price: Global.GCardAttributes.SalesPriceRate
          });
        }

        var _extPriceRate = this.CalculateExtPrice((newItem.get("Quantity") === 0) ? 1 : newItem.get("Quantity"), newItem.get("Price"), newItem.get("Discount"), newItem.get("CouponDiscountType"), newItem.get("CouponDiscountAmount"), newItem.get("CouponComputation"));

        if (!newItem.get("WarehouseCode") && (newItem.get("ItemType") == Enum.ItemType.Service || newItem.get("ItemType") == Enum.ItemType.NonStock)) {
          newItem.set({
            "WarehouseCode": Global.LocationCode
          });
        }

        var _qtyAllocated = 0;

        if (newItem.get('OriginalQuantityAllocated')) _qtyAllocated = newItem.get('OriginalQuantityAllocated')

        var _item = {
          ItemCode: newItem.get("ItemCode"),
          ItemName: newItem.get("ItemName"),
          ItemDescription: newItem.get("ItemDescription"),
          QuantityOrdered: (newItem.get("Quantity") === 0) ? 1 : newItem.get("Quantity"),
          QuantityShipped: 1,
          SalesPriceRate: newItem.get("Price"),
          SalesPrice: newItem.get("Price"),
          SalesTaxAmountRate: newItem.get("Tax"),
          UPCCode: newItem.get("UPCCode"),
          ItemType: newItem.get("ItemType"),
          Discount: Shared.ApplyAllowedDecimalFormat(newItem.get("Discount")),
          LineNum: _lineNum,
          WarehouseCode: newItem.get("WarehouseCode"),
          CouponDiscountType: newItem.get("CouponDiscountType"),
          CouponCode: newItem.get("CouponCode"),
          CouponDiscountAmount: newItem.get("CouponDiscountAmount"),
          CouponComputation: newItem.get("CouponComputation"),
          IsIncludedInCoupon: newItem.get("IsIncludedInCoupon"),
          ExtPriceRate: _extPriceRate,
          UnitMeasureCode: newItem.get("UnitMeasureCode"),
          UnitMeasureQty: newItem.get("UnitMeasureQty"),
          SourceLineNum: 0,
          IsOutOfStock: newItem.get("IsOutOfStock"),
          Filename: newItem.get("Filename"),
          SerializeLot: newItem.get("SerializeLot"),
          IsModified: true, //CSL-13446 : 8.30.13
          InvoiceCode: "[To be generated]",
          OriginalQuantityAllocated: _qtyAllocated,
          Status: newItem.get("Status"),
          FreeStock: newItem.get("FreeStock"),
          IsNewLine: (newItem.get("IsNewLine")) ? newItem.get("IsNewLine") : true,
          AutoGenerate: newItem.get("AutoGenerate"),
		  GetFreeItemCode: newItem.get("GetItemCode"),
		  BuyItemCode: newItem.get('BuyItemCode'),
		  PromoDocumentCode: newItem.get('PromoDocumentCode'),
		  IsPromoItem: newItem.get('IsPromoItem'),
            //SalesTaxCode : newItem.get("SalesTaxCode"),
            //Tax : newItem.get("Tax")
        };
        //var _isLoadByUpcCode = (!Shared.IsNullOrWhiteSpace(newItem.get("IsLoadedByUpc")));
        var _isLoadByUpcCode = newItem.get("IsLoadedByUpc"),
          _isUPCNotifyStock = false;

        if (Global.TransactionType === Enum.TransactionType.Return) {
          _item.Good = _item.QuantityOrdered;
          _item.QuantityAllocated = _item.QuantityOrdered;
        }

 	  tempModel.url = Global.ServiceUrl + Service.SOP + "updatelinenum?SessionID=" + Global.GUID + "&PromoDocumentCode=" + newItem.get('PromoDocumentCode') + "&LineNum=" + _lineNum + "&ItemCode=" + newItem.get('ItemCode');
      tempModel.save(null, {
        success: function(collection, response) {

        },
        error: function() {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
        }
      });

        if (!this.IsRequireRecalculateCoupon()) {
          if (!_isLoadByUpcCode) {
            this.ValidateSerializeLot(newItem.get("SerializeLot"),
              newItem.get("ItemCode"),
              this.GetItemDisplayName(newItem),
              _item.LineNum,
              newItem.get("ItemType"),
              newItem.get("UnitMeasureCode"),
              "",
              _item);
          }

          if (newItem.get('ItemType') === Enum.ItemType.Bundle) {
            this.ShowBundleConfigurator(newItem);
            return;
          } else if (newItem.get('ItemType') === Enum.ItemType.Kit && this.isShowConfigurator) {
            this.ShowKitConfigurator(newItem);
            //this.isShowConfigurator = true;
            return;
          }
        } else {
          this.isFocusOnThisModel = _item;
        }

        this.AddItemToCart(_item);
        qtyOrdered = _item.QuantityOrdered;

        Global.HasChanges = true;

      }, this);

      if (Global.OnRechargeProcess) this.CompleteRechargeAction();

      if(_isItemOutofStock && !Global.Preference.IsAutoAdjustmentStock) return;

      this.cartView.trigger('updatePromoDisplay', promoitemcollection, qtyOrdered);


    },

    AddNewItemToCart: function(collection) {
      var self = this;

      if (!this.ValidateLocationBankAccount()) return;

      /* Removed : CSL-25513 */
      //if (self.IsMultiLocation()) if (self.CheckIfCartHasDifferentLocation()) {
      //    navigator.notification.alert("Cannot add new item on existing transaction from other location.", null, "Action Not Allowed", "OK");
      //    return;
      //}

      collection.each(function(newItem) {
        var _errorMessage = newItem.get("ErrorMessage");
        if (_errorMessage) {
          //console.log(_errorMessage);
          navigator.notification.alert(_errorMessage, null, "Error", "OK");

          //if (self.ntf) {
          //    self.ntf = false;
          //    $("#notification-overlay").css("top", "600px");
          //    $("#notification-overlay").css("padding", "7px 20px 7px");
          //} else {
          //    self.ntf = true;
          //    $("#notification-overlay").css("top", "-5px");
          //    $("#notification-overlay").css("padding", "10px 20px 3px");
          //}

          //Shared.Products.ShowNotification(_errorMessage, true);
          return;
        }

        if (self.IsReturn() && self.IsGC(newItem.get("ItemType"))) {
          navigator.notification.alert("Adding " + newItem.get("ItemType") + " is not allowed on return transactions.", null, "Action Not Allowed", "OK");
          return;
        }

        if (this.IsItemGiftCredit(newItem) == true && this.CartHasNegativaQty() == true) {
          navigator.notification.alert('Item exchange is not allowed for transactions with Gift Cards. Please create a separate transaction.', null, "Action Not Allowed", "OK");
          return;
        }

        var _ItemTaxCode = "",
          _lineNum = this.GetLineNum();

        //CSL-18387
        if (self.IsReturn()) {
          newItem.set({
            CouponDiscountAmount: 0,
            IsIncludedInCoupon: false,
            IsNewLine: true
          });
        }

        if (Global.OnRechargeProcess && newItem.get("ItemType") == Enum.ItemType.GiftCard) {
          newItem.set({
            Price: Global.GCardAttributes.SalesPriceRate
          });
        }

        var _extPriceRate = this.CalculateExtPrice((newItem.get("Quantity") === 0) ? 1 : newItem.get("Quantity"), newItem.get("Price"), newItem.get("Discount"), newItem.get("CouponDiscountType"), newItem.get("CouponDiscountAmount"), newItem.get("CouponComputation"));

        if (!newItem.get("WarehouseCode") && (newItem.get("ItemType") == Enum.ItemType.Service || newItem.get("ItemType") == Enum.ItemType.NonStock)) {
          newItem.set({
            "WarehouseCode": Global.LocationCode
          });
        }

        var _qtyAllocated = 0;

        if (newItem.get('OriginalQuantityAllocated')) _qtyAllocated = newItem.get('OriginalQuantityAllocated')

        var _item = {
          ItemCode: newItem.get("ItemCode"),
          ItemName: newItem.get("ItemName"),
          ItemDescription: newItem.get("ItemDescription"),
          QuantityOrdered: (newItem.get("Quantity") === 0) ? 1 : newItem.get("Quantity"),
          QuantityShipped: 1,
          SalesPriceRate: newItem.get("Price"),
          SalesPrice: newItem.get("Price"),
          SalesTaxAmountRate: newItem.get("Tax"),
          UPCCode: newItem.get("UPCCode"),
          ItemType: newItem.get("ItemType"),
          Discount: Shared.ApplyAllowedDecimalFormat(newItem.get("Discount")),
          LineNum: _lineNum,
          WarehouseCode: newItem.get("WarehouseCode"),
          CouponDiscountType: newItem.get("CouponDiscountType"),
          CouponCode: newItem.get("CouponCode"),
          CouponDiscountAmount: newItem.get("CouponDiscountAmount"),
          CouponComputation: newItem.get("CouponComputation"),
          IsIncludedInCoupon: newItem.get("IsIncludedInCoupon"),
          ExtPriceRate: _extPriceRate,
          UnitMeasureCode: newItem.get("UnitMeasureCode"),
          UnitMeasureQty: newItem.get("UnitMeasureQty"),
          SourceLineNum: 0,
          IsOutOfStock: newItem.get("IsOutOfStock"),
          Filename: newItem.get("Filename"),
          SerializeLot: newItem.get("SerializeLot"),
          IsModified: true, //CSL-13446 : 8.30.13
          InvoiceCode: "[To be generated]",
          OriginalQuantityAllocated: _qtyAllocated,
          Status: newItem.get("Status"),
          FreeStock: newItem.get("FreeStock"),
          IsNewLine: (newItem.get("IsNewLine")) ? newItem.get("IsNewLine") : true,
          AutoGenerate: newItem.get("AutoGenerate"),
          PromoDocumentCode: "",
          PromoID: "",
          RuleID: "",
          BuyLineNum: _lineNum,
          IsPromoItem: false,
          QuantityDisplayed:  (newItem.get("Quantity") === 0) ? 1 : newItem.get("Quantity"),
          //Start added By Mark: Fix tax issue.
          SalesTaxCode : newItem.get("SalesTaxCode"),
          Tax : newItem.get("TaxCode")
          //End added By Mark: Fix tax issue.
        };
        //var _isLoadByUpcCode = (!Shared.IsNullOrWhiteSpace(newItem.get("IsLoadedByUpc")));
        var _isLoadByUpcCode = newItem.get("IsLoadedByUpc"),
          _isUPCNotifyStock = false;

        if (Global.TransactionType === Enum.TransactionType.Return) {
          _item.Good = _item.QuantityOrdered;
          _item.QuantityAllocated = _item.QuantityOrdered;
        }

        if (!this.IsRequireRecalculateCoupon()) {
          if (!_isLoadByUpcCode) {
            this.ValidateSerializeLot(newItem.get("SerializeLot"),
              newItem.get("ItemCode"),
              this.GetItemDisplayName(newItem),
              _item.LineNum,
              newItem.get("ItemType"),
              newItem.get("UnitMeasureCode"),
              "",
              _item);
          }

          if (newItem.get('ItemType') === Enum.ItemType.Bundle) {
            this.ShowBundleConfigurator(newItem);
            return;
          } else if (newItem.get('ItemType') === Enum.ItemType.Kit && this.isShowConfigurator) {
            this.ShowKitConfigurator(newItem);
            //this.isShowConfigurator = true;
            return;
          }
        } else {
          this.isFocusOnThisModel = _item;
        }

        this.AddItemToCart(_item);

		// var freeitems = new BaseModel(_item);

		// if (Global.TransactionType == 'Sale' || Global.TransactionType == 'Order' || Global.TransactionType == 'Update Order' || Global.TransactionType == 'Quote' || Global.TransactionType == 'Update Quote' || Global.TransactionType == 'Convert Quote'){
		// 	self.AddFreeItems(freeitems,false);
		// }

        Global.HasChanges = true;
      }, this);
      if (Global.OnRechargeProcess) this.CompleteRechargeAction();
    },

    /**
		 Add Items on Queue, uses FIFO ( first in first out ) to prevent multiple items with same item code

		 @method AddTOItemsOnQueue
		 **/
	AddFreeItems: function(_freeitems,isCoupon){
		var self = this;
		var _salesOrderDetailCollection = new SalesOrderDetailCollection();
	    var _salesOrderCollection = new SalesOrderCollection();
		var salesOrderModel = new BaseModel();
        var shippingDate = new Date();
		var tempModel = new BaseModel();
		var taxCode = window.sessionStorage.getItem('selected_taxcode');
		var  transactionType = Global.TransactionType;
		var freeitemCollection;
		var promoItems;


	  if (Global.TransactionType == Enum.TransactionType.UpdateInvoice) transactionType = Enum.TransactionType.ResumeSale;

      shippingDate = this.JsonToAspDate(shippingDate),
        salesOrderModel.set({
          BillToCode: Global.CustomerCode,
          POSWorkstationID: Global.POSWorkstationID,
          POSClerkID: Global.Username,
          IsFreightOverwrite: true,
          IsOverrideSalesRep: Global.Preference.IsOverrideSalesRep,
          IsTaxByLocation: Global.Preference.TaxByLocation,
          WarehouseCode: Global.Preference.DefaultLocation,
          PublicNotes: Global.PublicNote.PublicNotes,
          ShippingDate: shippingDate,
          WebSiteCode: Global.Preference.WebSiteCode,
		  SalesOrderCode: "[To be generated]",
		  SourceSalesOrderCode: "[To be generated]",
		  Type: "Sales Order",
		  SalesOrderDate: shippingDate,
		  SourceCode: "KVSupply",
		  FreightRate: 0
        });

      if (!Shared.IsNullOrWhiteSpace(this.customerPOModel)) {
        salesOrderModel.set(self.customerPOModel.attributes);
      }

      _salesOrderCollection.add(salesOrderModel);

  	  this.AssignTransactionShipTo(_salesOrderCollection.at(0));
      this.SetCouponToTransactionHeader(_salesOrderCollection.at(0), false);

	  _freeitems.set({
	  	SalesOrderCode : "[To be generated]"
	  });

	  _salesOrderDetailCollection.add(_freeitems);


      tempModel.set({
        SalesOrders: _salesOrderCollection,
		SalesOrderDetails: _salesOrderDetailCollection,
		TaxCode: (taxCode) ? taxCode : Global.ShipTo.TaxCode,
		IsTaxByLocation: Global.Preference.TaxByLocation,
		TransactionType: transactionType,
      });
		var PromoDocumentCode;

		if (self.cartCollection && self.cartCollection.length > 0) {
		 self.cartCollection.each(function(cartItem) {
          	if ((cartItem.get('ItemCode') == _freeitems.get('ItemCode') && cartItem.get('LineNum') == _freeitems.get('LineNum'))){
          		PromoDocumentCode = cartItem.get('PromoDocumentCode');
          	}
          });
		}

      tempModel.url = Global.ServiceUrl + Service.SOP + "getfreeitems?SessionID=" + Global.GUID + "&PromoDocumentCode=" + PromoDocumentCode + "&IsCoupon=" + isCoupon;

      tempModel.save(null, {
        success: function(collection, response) {
		if(response.SaleItems.length > 0){
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();

//		if (self.cartCollection && self.cartCollection.length > 0) {
//
//		 self.cartCollection.each(function(cartItem) {
//          	if ((cartItem.get('ItemCode') == response.BuyItemCode && cartItem.get('LineNum') == response.LineNum)){
//          		cartItem.set('PromoDocumentCode',response.PromoCode);
//				cartItem.set('IsPromoItem', true);
//          	}
//          });
//		}
			freeitemCollection = new BaseCollection(response.SaleItems);
			promoItems = new BaseCollection(response.PromoItemDetail);

			var _itemCollection;
			var _itemCode;
			var _Qty;
			var _lineNum = self.GetLineNum();

			freeitemCollection.each(function(freeitems) {
				_itemCode = freeitems.get("ItemCode");
				_Qty = freeitems.get("Quantity");

				freeitems.set('IsPromoItem', true);
				//freeitems.set('LineNum',self.GetLineNum());
				self.cartCollection.each(function(items){
					 for(i=0 ;i<freeitems.get('BuyItemCode')[0].BuyItemCode.length; i++){
					 if(items.get('ItemCode') == freeitems.get('BuyItemCode')[0].BuyItemCode[i]){
						 if(items.get('LineNum') == freeitems.get('BuyItemCode')[0].BuyLineNum[i])
						 {
							 items.set('PromoID',freeitems.get('PromoID'));
							 items.set('RuleID',freeitems.get('RuleID'));
							 items.set('PromoDocumentCode',response.PromoCode);
							 //items.set('BuyItemCode',freeitems.get('BuyItemCode')[0].BuyItemCode[i]);
							 items.set('GetItemCode',freeitems.get('GetItemCode'));
						 }
					 	}
					 }
				});
				_itemCollection = self.cartCollection.find(function(cartItem){
					return (cartItem.get('ItemCode') == freeitems.get('ItemCode') && _itemCode && cartItem.get('SalesPriceRate') == freeitems.get('Price') && cartItem.get('BuyItemCode')[0].BuyItemCode[0] == freeitems.get('BuyItemCode')[0].BuyItemCode[0] && cartItem.get('BuyItemCode')[0].BuyLineNum[0] == freeitems.get('BuyItemCode')[0].BuyLineNum[0]);
				});
			});

			if(_itemCollection){
				freeitemCollection.each(function(freeItem) {
					self.cartCollection.each(function(cartItem) {
						if(cartItem.get("ItemCode") == freeItem.get('ItemCode') && cartItem.get('SalesPriceRate') == freeItem.get('Price') && cartItem.get('BuyItemCode')[0].BuyItemCode[0] == freeItem.get('BuyItemCode')[0].BuyItemCode[0] && cartItem.get('BuyItemCode')[0].BuyLineNum[0] == freeItem.get('BuyItemCode')[0].BuyLineNum[0])
							cartItem.set('QuantityOrdered',_Qty);
						    freeItem.set('LineNum', cartItem.get('LineNum'));
						});
						//self.UpdateCartItem(freeItem,0);
					    tempModel.url = Global.ServiceUrl + Service.SOP + "updatelinenum?SessionID=" + Global.GUID + "&PromoDocumentCode=" + freeItem.get('PromoDocumentCode') + "&LineNum=" + freeItem.get('LineNum');
						tempModel.save(null, {
						success: function(collection, response) {

						},
						error: function() {
						  if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
						}
					  });
				});
			}
			else if(freeitemCollection.length == 1){
				self.AddFreeItemToCart(freeitemCollection, promoItems);

			}
			else if(freeitemCollection.length > 1){
					self.ShowPromotionConfigurator(freeitemCollection,promoItems);
				}
		}

        },
        error: function() {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
        }
      });
	},


	ShowPromotionConfigurator: function(collection,promoItems){
		var promotionConfiguratorView = new PromotionConfiguratorView({
			collection: collection,
			promoitems: promoItems
		});
		promotionConfiguratorView.on('getPromoItems', this.ProcessPromoItems, this);
		this.$el.find("#promotion-configurator-container").html(promotionConfiguratorView.render().el);
		this.$el.find("#promotion-configurator-container").find("ul").listview().listview('refresh');
	},

	 ProcessPromoItems: function(response, response2) {
      // set to false first to prevent configurator
      this.AddFreeItemToCart(response,response2);

/*      var sale = _.first(response.SaleItems),
        itemCode = sale.ItemCode,
        unitMeasureCode = sale.UnitMeasureCode,
        isReturn = this.IsReturn(),
        item = this.cartCollection.find(function(cart) {
          return isReturn ? (cart.get('ItemCode') == itemCode && cart.get('UnitMeasureCode') == unitMeasureCode && cart.get('IsNewLine') && cart.get('ItemType') == Enum.ItemType.Kit) :
            (cart.get('ItemCode') == itemCode && cart.get('unitMeasureCode') == unitMeasureCode && cart.get('ItemType') == Enum.ItemType.Kit);
        });

      var lineNum = (item) ? item.get('LineNum') : this.GetLineNum();

      _.each(response.KitDetailSaleItems, function(kit) {
        kit.LineNum = lineNum;
      });

      window.sessionStorage.setItem('kitItems-' + lineNum, JSON.stringify(response.KitDetailSaleItems));
      window.sessionStorage.setItem('kitBundleItems-' + lineNum, JSON.stringify(response.KitBundleDetails));

      this.itemPriceCollection.reset(response.SaleItems);
      // revert to original value
      this.isShowConfigurator = true;
      this.OnRequestCompleted(Method.SALEKITITEMTAX);*/
    },

    AddToItemsOnQueue: function(newItem) {
      if (!this.AllowedToAddAnItem(newItem)) return;
      if (!this.ItemsOnQueue) {
        this.ItemsOnQueue = new ItemCollection();
        this.ItemsOnQueue.on("add", this.AddToCart, this);
      }
      //Add item to the queue
      this.ItemsOnQueue.add(newItem);

    },


    ShowMsg: function(_msgContent, _header) {
      if (!_header) _header = "Action Not Allowed";
      navigator.notification.alert(_msgContent, null, _header, "OK");
    },

    /*
     * Validates If allowed to add an item on cart.
     */
    AllowedToAddAnItem: function(item) {
      var _errorMsg;
      switch (Global.TransactionType) {
        case Enum.TransactionType.SalesPayment:
          _errorMsg = "Adding items is not allowed for Payment on Account transactions.";
          break;
        case Enum.TransactionType.SalesRefund:
          return true;
          //if(!this.PreventAddingOfItemsFromOriginalInvoice(item)) return true;
          //_errorMsg = "Adding the same item(s) from the original invoice is not allowed.";
          //_errorMsg = "Adding items is not allowed for Return transactions.";
          break;
        case Enum.TransactionType.Recharge:
          _errorMsg = "Adding items is not allowed for Recharge transactions.";
          break;
        default:
          if (this.IsItemGiftCredit(item) == true && this.CartHasNegativaQty() == true) _errorMsg = 'Item exchange is not allowed for transactions with Gift Cards. Please create a separate transaction.'
          else return true;
          break;
      }
      this.ShowMsg(_errorMsg, null, "Action not allowed");
      return false;
    },

    PreventAddingOfItemsFromOriginalInvoice: function(item) {
      var hasMatch = false;
      this.cartCollection.each(function(model) {
        if (!hasMatch)
          if (model.get("ItemCode") == item.get("ItemCode") && model.get("UnitMeasureCode") == item.get("UnitMeasureCode")) hasMatch = true;
      });
      if (hasMatch) return false; //It will be restricted.

      if (Global.LoadedItems && Global.LoadedItems.length > 0) {
        Global.LoadedItems.each(function(model) {
          if (!hasMatch)
            if (model.get("ItemCode") == item.get("ItemCode") && model.get("UnitMeasureCode") == item.get("UnitMeasureCode")) hasMatch = true;
        });
      }
      return hasMatch;
    },

    /**
		 Use FIFO, when one item is finish remove it from the queue

		 @method RemoveFromItemsOnQueue
		 **/
    RemoveFromItemsOnQueue: function(item) {
      this.isProcessing = false;

      if (this.ItemsOnQueue) {
        //From this.ItemsOnQueue remove 'item'
        this.ItemsOnQueue.remove(item);
        //If done, call AddToCart again
        if (this.ItemsOnQueue.length > 0) {
          this.AddToCart(this.ItemsOnQueue.at(0));
        }
      }
    },

    /**
		 Add Items to Cart

		 @method AddToCart
		 **/
    AddToCart: function(newItem) {
      if (this.isProcessing) return;
      if (!this.AllowedToAddAnItem(newItem)) return;
      if (!Global.ValidLocation) {
        this.NotifyMsg("The Current Status of the Default Location is Inactive.", "Unable to add Item");
        return;
      }
      this.cartEventTriggered = false;

      var _itemCode = newItem.get("ItemCode"),
        _unitMeasureCode = newItem.get("UnitMeasureCode"),
        _isReturn = this.IsReturn(),
        _existingCartItem = this.cartCollection.find(function(cartItem) {
          return _isReturn ? (cartItem.get('ItemCode') == _itemCode && cartItem.get('UnitMeasureCode') == _unitMeasureCode && cartItem.get('IsNewLine') && cartItem.get('ItemType') != Enum.ItemType.Kit && cartItem.get('PromoDocumentCode') == '') :
            (cartItem.get('ItemCode') == _itemCode && cartItem.get('UnitMeasureCode') == _unitMeasureCode && cartItem.get('ItemType') != Enum.ItemType.Kit && cartItem.get('PromoDocumentCode') == '');
        });

      this.isProcessing = true;
      if (_existingCartItem) {
        //UPDATE cart when item already exists
        this.UpdateCartItem(_existingCartItem, 1, "QuantityOrderedUpdated", false);

        this.RemoveFromItemsOnQueue(newItem);
      } else {
        if (this.couponModel) {
          if (!Shared.IsNullOrWhiteSpace(this.couponModel.get("CustomerCode")) && this.couponModel.get("CustomerCode") != Global.CustomerCode) this.RemoveCoupon();
        }

        var locationToUse = Global.LocationCode;
        if (this.IsMultiLocation() == true &&
          (Global.TransactionType == Enum.TransactionType.ConvertOrder || Global.TransactionType == Enum.TransactionType.UpdateOrder || Global.TransactionType == Enum.TransactionType.UpdateQuote || Global.TransactionType == Enum.TransactionType.ConvertQuote)) locationToUse = Global.TransactionObject.WarehouseCode

        this.GetSaleItemPriceTax(
          _itemCode,
          Global.CustomerCode,
          locationToUse, //Global.LocationCode,
          newItem.get("UnitMeasureCode"),
          Global.Preference.TaxByLocation,
          this.GetCouponID(),
          newItem
        );
      }
      return true;
    },

    /**
		 Add Items by UPC

		 @method AddItemByUPC
		 **/
    AddItemByUPC: function(upcCode) {
      switch (Global.TransactionType) {
        case Enum.TransactionType.SalesPayment:
          //console.log("Adding items is not allowed for Payment on Account transactions.");
          navigator.notification.alert("Adding items is not allowed for Payment on Account transactions.", null, "Action Not Allowed", "OK");
          return;
          break;
          /*case Enum.TransactionType.SalesRefund :
					console.log("Adding items is not allowed for Return transactions.");
					navigator.notification.alert("Adding items is not allowed for Return transactions.",null,"Action Not Allowed","OK");
					return;
					break;*/
        case Enum.TransactionType.Recharge:
          //console.log("Adding items is not allowed for Recharge transactions.");
          navigator.notification.alert("Adding items is not allowed for Recharge transactions.", null, "Action Not Allowed", "OK");
          return;
          break;
      }
      if (!Global.ValidLocation) {
        this.NotifyMsg("The Current Status of the Default Location is Inactive.", "Unable to add Item");
        return;
      }

      upcCode = upcCode.toLowerCase()
      var locationToUse = Global.LocationCode;
      //CSL-25513 : 03.07.14
      if (this.IsMultiLocation() == true &&
        (Global.TransactionType == Enum.TransactionType.ConvertOrder ||
          Global.TransactionType == Enum.TransactionType.UpdateOrder ||
          Global.TransactionType == Enum.TransactionType.ConvertQuote ||
          Global.TransactionType == Enum.TransactionType.UpdateQuote)
      ) locationToUse = Global.TransactionObject.WarehouseCode;

      this.GetSaleItemPriceTaxByUPC(
        upcCode,
        Global.CustomerCode,
        locationToUse,
        //Global.LocationCode,
        Global.Preference.TaxByLocation,
        this.GetCouponID()
      );
    },

    /**
		 Update Recalculated Items

		 @method UpdateRecalculatedItems
		 **/
    UpdateRecalculatedItems: function(model) {

      //this.VoidCoupon(false);
      if (!Global.CurrentCustomerChanged && Global.Coupon) { //added by PR.Ebron > Jira ID: INTMOBA-772
        this.RecalculateCoupon();
      } else {
        this.VoidCoupon(false);
        for (var _i = 0; _i < this.cartCollection.length; _i++) {
          var cart = this.cartCollection.at(_i);
          this.RecalculateItem(cart, model);
        }
      }
      Global.HasChanges = true;


    },

    UpdateRecalculatedItemsCompleted: function() {
      this.OnRequestCompleted("UpdateRecalculatedItemsCompleted");
      if (Global.OnRechargeProcess) this.ProcessItemLookup();
    },

    /**
		 Recalculate Items

		 @method RecalculateItem
		 **/
    RecalculateItem: function(cart, model) {
      if (cart.get("ItemCode") === model.get("ItemCode") && cart.get("UnitMeasureCode") === model.get("UnitMeasureCode")) {

        var _extPriceRate = this.CalculateExtPrice(model.get("QuantityOrdered"), model.get("SalesPriceRate"), model.get("Discount"),
          model.get("CouponDiscountType"), model.get("CouponDiscountAmount"), model.get("CouponComputation"), model.get("LineNum"));

        cart.set({
          SalesPriceRate: model.get("SalesPriceRate"),
          SalesPrice: model.get("SalesPrice"),
          ExtPriceRate: _extPriceRate
        });
      }
    },

    CanChangeQuantity: function(item) {
      if (!this.HasCoupon()) return true;
      if (item.get("QuantityOrdered") < 0) {
        navigator.notification.alert("Negative quantity is not allowed.\nPlease remove coupon first.", null, "Negative Quantity", "OK");
        return false;
      }
      return true;
    },

    HasCoupon: function() {
      if (!Global.Coupon) return false;
      if (!Global.Coupon.get("CouponCode") || Global.Coupon.get("CouponCode") == "") return false;
      return true;
    },

    CheckNegativeQuantities: function() {
      this.RemoveDiscountOnNegativeQuantityItem();
    },

    RemoveDiscountOnNegativeQuantityItem: function() {
      if (!this.cartCollection) return;
      if (this.cartCollection.length == 0) return;
      this.cartCollection.each(function(model) {
        if (model.get("QuantityOrdered") < 0) model.set("Discount", 0);
      });
    },

    AssignQuantityToBeAddded: function(qtyOrdered, qtyAdded) {
      if (Global.TransactionType == Enum.TransactionType.Sale) {
        if (qtyOrdered == 1 && qtyAdded == -1) {
          //if transaction type is sale, do not turn the quantity to 0; if its 1 turn it to positive -1. CSL-19027 - 11.20.13
          qtyAdded = -2;
        } else if (qtyOrdered == -1 && qtyAdded == 1) {
          //if transaction type is sale, do not turn the quantity to 0; if its -1 turn it to positive 1. CSL-19027 - 11.20.13
          qtyAdded = 2;
        }
      }

      return qtyAdded;
    },

    AssignCartEventTriggered: function(item, eventName, isEventTriggered) {
      this.cartEventTriggered = null;
      this.cartEventTriggered = eventName;
      if (!Shared.IsNullOrWhiteSpace(item.get("EventTriggered")) && Shared.IsNullOrWhiteSpace(eventName)) {
        this.cartEventTriggered = item.get("EventTriggered");
        //console.log("EventTriggered : " + this.cartEventTriggered);
      }
    },

  UpdateCartItem: function(item, qtyAdded, eventName, isEventTriggered, DoNotChangePrice) {
		var self = this;
		var tempModel = new BaseModel();
      //This is to prevent showing the out-of-stock notification if changes has nothing to with quantity.
      qtyAdded = this.AssignQuantityToBeAddded(item.get("QuantityOrdered"), qtyAdded);
      var doNotChangePrice = false,
        itemPricing = item.get('Pricing'),
        origQtyOrdered = item.get('QuantityOrdered') || 0,
        qty = this.GetUpdatedItemQuantity(item, qtyAdded);

      this.AssignCartEventTriggered(item, eventName, isEventTriggered);
      if (!Shared.IsNullOrWhiteSpace(item.get('DoNotChangePrice'))) doNotChangePrice = true;
      //console.log("Do Not Change Price : " + doNotChangePrice);
      item.set({
        DoNotChangePrice: doNotChangePrice,
        DoNotCheckStock: true,
        LastEvent: eventName
      });

      if (!Shared.IsNullOrWhiteSpace(eventName) && (eventName === "QuantityOrderedUpdated" || eventName === "UnitMeasureUpdated")) {
        item.set("DoNotCheckStock", false);
      }

       if (qty === "" || qty === null || qty === undefined) return;

     // if (Shared.IsNullOrWhiteSpace(qty)) return;

      if (this.IsItemQuantityAllowed(qty) == false) return; //CSL-25422 : 03.05.2014
      this.SetItemQuantity(item, qty);
      if (!this.CanChangeQuantity(item)) {
        this.SetItemQuantity(item, origQtyOrdered);
        return;
      }

      this.CheckNegativeQuantities();

      if ((isEventTriggered != undefined) && ((Global.TransactionType != Enum.TransactionType.SalesRefund || Global.TransactionType != Enum.TransactionType.Return) ||
          (item.get("ItemType") == Enum.ItemType.GiftCard || item.get("ItemType") == Enum.ItemType.GiftCertificate))) {
        var _isLoadByUpcCode = (item.get("IsLoadedByUpc")) ? true : false;
        if (!_isLoadByUpcCode && (eventName == "QuantityOrderedUpdated" || eventName == "UnitMeasureUpdated")) {
          //console.log("Update Cart Item");
          this.ValidateSerializeLot(
            item.get("SerializeLot"),
            item.get("ItemCode"),
            this.GetItemDisplayName(item),
            item.get("LineNum"),
            item.get("ItemType"),
            item.get("UnitMeasureCode"),
            item.get("LastEvent"),
            item);
        }
      }

      if (this.IsRequireRecalculateCoupon()) {
        if (!item.get("DoNotCheckStock")) {
          this.NotifyIfItemIsOutOfStock(item.attributes, true);
        }

        if (eventName === "QuantityOrderedUpdated") {
          this.isNoCouponAtFirst = true;
          this.isFocusOnThisModel = item.toJSON();
          this.ChangeItemExtendedPrice(item, qty, true);
        } else {
          if (!this.holdRecomputeCoupon) this.RecalculateCoupon();
        }
      } else {
        this.ChangeItemExtendedPrice(item, qty);
      }
      Global.PreviousAssignedItemQty = item.get("QuantityDisplayed");
      Global.HasChanges = true;

	var _freeItemsToDisable = this.cartCollection.find(function(cartItem) {
			return (cartItem.get('ItemCode') == item.get('ItemCode') && item.get('IsPromoItem') == true);
		});

		  if(_freeItemsToDisable != undefined){
      	$("#" + _freeItemsToDisable.cid + ' #quantityDisplay').addClass('ui-disabled').css("opacity", 1);
			  $("#" + _freeItemsToDisable.cid + ' #display-itemName').addClass('ui-disabled').css("opacity", 1);
			  $("#" + _freeItemsToDisable.cid + ' #itemPriceDisplay').addClass('ui-disabled').css("opacity", 1);
			  $("#" + _freeItemsToDisable.cid + ' #discountDisplay').addClass('ui-disabled').css("opacity", 1);
			  $("#" + _freeItemsToDisable.cid + ' #extPriceRate-td').addClass('ui-disabled').css("opacity", 1);
		  }
		var _itemsToRemove = new BaseCollection();
		_itemsToRemove = new BaseCollection(self.cartCollection.filter(function(cartItem){
			if(cartItem.get('BuyItemCode') != null){
				if(cartItem.get('BuyItemCode').length != 0 ){
				if (cartItem.get('BuyItemCode')[0].BuyItemCode == undefined){
					return cartItem.get('IsPromoItem') == true && cartItem.get('BuyItemCode') == item.get('ItemCode') && carItem.get('PromoDocumentCode') == item.get('PromoDocumentCode');
				}
					else {
						if(cartItem.get('BuyItemCode')[0].BuyItemCode.length == 1){
								return cartItem.get('IsPromoItem') == true && cartItem.get('BuyItemCode')[0].BuyItemCode[0] == item.get('ItemCode') && cartItem.get('PromoDocumentCode') == item.get('PromoDocumentCode');
						}
						else {
							 for(i=0 ;i<cartItem.get('BuyItemCode')[0].BuyItemCode.length; i++){
								return cartItem.get('IsPromoItem') == true && cartItem.get('BuyItemCode')[0].BuyItemCode[i] == item.get('ItemCode') && cartItem.get('PromoDocumentCode') == item.get('PromoDocumentCode');
							 }
							 }
						 }
				}
			}
		}));

		_itemsToRemove.each(function(detail){
			self.cartCollection.remove(detail);
		});
	  // if (Global.TransactionType == 'Sale' || Global.TransactionType == 'Order' || Global.TransactionType == 'Update Order' || Global.TransactionType == 'Convert Order' || Global.TransactionType == 'Quote' || Global.TransactionType == 'Update Quote' || Global.TransactionType == 'Convert Quote'){
	  // 	this.AddFreeItems(item,false);
	  // }

    },


    /**
		 Retrieve Line num

		 @method GetLineNum
		 **/
    GetLineNum: function() {
      if (this.IsReturn()) {
        var lineNum = 0;
        //Get Highest Line Number from Original Details
        if (Global.LoadedItems.length > 0) Global.LoadedItems.each(function(model) {
          if ((model.get("LineNum") || 0) > lineNum) lineNum = (model.get("LineNum") || 0);
        });

        //Get Highest Line Number on cart and compare with orig details
        if (this.cartCollection.length > 0) this.cartCollection.each(function(model) {
          if ((model.get("LineNum") || 0) > lineNum) lineNum = (model.get("LineNum") || 0);
        });
        return (lineNum + 1);
      }

      return (this.cartCollection.length + 1);
    },

    /**
		 Calculate Item Extended Price

		 @method CalculateExtPrice
		 **/
    CalculateExtPrice: function(quantity, price, discount, couponDiscountType, couponDiscountAmount, couponComputation, lineNumber) {
      if (couponDiscountType) {
        if (couponComputation === "Stackable") {
          if (couponDiscountType === "Percent") {
            price = this.CalculateNetPrice(price, couponDiscountAmount, couponDiscountType, true);
          } else {
            return this.CalculateExtPriceWithStackableAmountDiscount(quantity, price, discount, couponDiscountAmount, lineNumber);
          }
        } else { //Compound
          if (couponDiscountType === "Percent") {
            discount += couponDiscountAmount;
          }
        }
      }
      var _extPrice = quantity * this.CalculateNetPrice(price, discount, couponDiscountType);

      //this.Test();

      return _extPrice;
    },

    CalculateExtPriceWithStackableAmountDiscount: function(quantity, price, discount, couponDiscountAmount, lineNumber) {
      var extPrice = quantity * this.CalculateNetPrice(price, discount);

      //Modified for CSL-10179
      lineNumber = lineNumber || 0;
      if (lineNumber == 0 || !this.IsReturn()) {
        extPrice -= couponDiscountAmount;
      } else {
        var curItem;
        if (Global.LoadedItems && Global.LoadedItems.length > 0) {
          Global.LoadedItems.each(function(model) {
            if (!curItem)
              if (model.get("LineNum") == lineNumber) curItem = model;
          });
        }

        if (!curItem) {
          extPrice -= couponDiscountAmount;
        } else {
          var origQuantityOrdered = curItem.get("QuantityOrdered") || 0;
          var extPriceRate = curItem.get("ExtPriceRate") || 0;
          var outStanding = curItem.get("Outstanding") || 0;

          couponDiscountAmount = curItem.get("CouponDiscount") || 0;

          if (origQuantityOrdered == quantity) {
            if (this.IsReturn()) extPrice = extPriceRate; //03.17.2014 - CSL-26083
            else extPrice -= couponDiscountAmount;
          } else {
            if (origQuantityOrdered <= 0) origQuantityOrdered = 1;

            if (outStanding == quantity) {
              var _qty = (origQuantityOrdered - quantity);
              var _rnd = parseFloat((couponDiscountAmount / origQuantityOrdered).toFixed(4));
              var _trim = parseFloat(this.preciseRound(couponDiscountAmount / origQuantityOrdered, 2));

              if (parseFloat((_rnd - _trim).toFixed(3)) == 0.005) couponDiscountAmount = couponDiscountAmount - parseFloat(parseFloat(_trim * _qty).toFixed(2));
              else couponDiscountAmount = couponDiscountAmount - parseFloat((parseFloat(_rnd.toFixed(2)) * _qty).toFixed(2));

              //couponDiscountAmount = couponDiscountAmount - (parseFloat((couponDiscountAmount / origQuantityOrdered).toFixed(4)) * (origQuantityOrdered - quantity));
              //couponDiscountAmount = couponDiscountAmount - (parseFloat(this.preciseRound(couponDiscountAmount / origQuantityOrdered,2)) * (origQuantityOrdered - quantity));	//CSL-25790 : 03.12.14
            } else {
              var _rnd = parseFloat((couponDiscountAmount / origQuantityOrdered).toFixed(4));
              var _trim = parseFloat(this.preciseRound(couponDiscountAmount / origQuantityOrdered, 2));

              if (parseFloat((_rnd - _trim).toFixed(3)) == 0.005) couponDiscountAmount = parseFloat(parseFloat(_trim * quantity).toFixed(2));
              else couponDiscountAmount = parseFloat((parseFloat(_rnd.toFixed(2)) * quantity).toFixed(2));

              //couponDiscountAmount = (parseFloat((couponDiscountAmount / origQuantityOrdered).toFixed(2)) * (quantity));
              //couponDiscountAmount = (parseFloat(this.preciseRound(couponDiscountAmount / origQuantityOrdered, 2)) * (quantity)); //CSL-25790 : 03.12.14
            }

            extPrice -= couponDiscountAmount;
          }

          if (this.cartCollection && this.cartCollection.length > 0) {
            this.cartCollection.each(function(model) {
              if (model.get("LineNum") == lineNumber) {
                model.set({
                  CouponDiscount: couponDiscountAmount,
                  CouponDiscountRate: couponDiscountAmount,
                  CouponDiscountAmount: couponDiscountAmount //Display
                });
              }
            });
          } else {
            curItem.set({
              AlteredCoupon: true,
              AlteredCouponDiscount: couponDiscountAmount
            });
          }

        }
      }

      if (extPrice <= 0) {
        return 0;
      } else {
        return extPrice;
      }
    },

    //method that slice down the decimal places.
    preciseRound: function(value, numOfDecimals) {
      if (numOfDecimals == null) numOfDecimals = 2;
      var num = value.toString();
      if (num.indexOf('.') == -1) return num;
      return num.substr(0, num.indexOf('.') + numOfDecimals + 1);
    },


    //MAR-20-2013
    CalculateItemExtPrice: function(item, onSuccess, onError) {
        this.RemoveTermDiscountPayment();
      //var taxCode = window.sessionStorage.getItem('selected_taxcode');
      var taxCode = item.get('TaxCode');

      if (item.get('ItemType') === Enum.ItemType.Kit) {
        var kitItems = new BaseCollection();
        kitItems.add(JSON.parse(window.sessionStorage.getItem('kitItems-' + item.get('LineNum'))));
          kitItems.each(function(kit) {
              kit.set('Quantity', kit.get("OriginalQuantity") * item.get("QuantityOrdered"));
          });
      }

      var _item = item.clone();
      _item.set({
        TaxCode: (taxCode) ? taxCode : null,
        IsModified: true,
        DiscountType: Global.ShipTo.DiscountType,
        DiscountPercent: Global.ShipTo.DiscountPercent,
        DiscountableDays: Global.ShipTo.DiscountableDays,
        SalesOrderCode: Global.TransactionCode,
        ItemKitDetails : (kitItems) ? kitItems : null,
        IsUsePOSShippingMethod: Global.Preference.IsUsePOSShippingMethod,
        POSShippingMethod: Global.Preference.POSShippingMethod
        
      });
      //SUCCESS
      if (onSuccess) _item.on('sync', onSuccess, this);
      else _item.on('sync', this.CalculateItemExtPriceDefaultCallback, this);

      //ERROR
      if (onError) _item.on('sync', onError, this);
      else _item.on('sync', this.CalculateItemExtPriceDefaultCallback, this);

      _item.url = Global.ServiceUrl + Service.SOP + Method.CALCULATEITEMEXTPRICE;
      _item.save();

    },


    CalculateItemExtPriceDefaultCallback: function(model, response, options) {
      this.CalculateItemExtPriceErrorHandler(model, response, options);
    },

    CalculateItemExtPriceErrorHandler: function(model, response, options) {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      if (model.get("ErrorMessage"))
        if (model.get("ErrorMessage") != "") {
          //console.log(model.get("ErrorMessage"));
          //if(!Global.isBrowserMode)
          navigator.notification.alert(model.get("ErrorMessage") || "An error was encountered when trying to update an item.", null, "Error Updating Item", "OK");
          return true;
        }
      return false;
    },

    /**
		 Calculate Item Net Price

		 @method CalculateNetPrice
		 **/
    CalculateNetPrice: function(price, discount, couponDiscountType, doNotRoundResult) {

      var _discountRate = price * (discount / 100);
      var value = price - _discountRate;
      value = format("0.0000", value);
      if (doNotRoundResult) return value;
      return this.RoundNumber(value, 2);
      //this.roundQueue.add([{ExtPriceRate : value}]);

    },

    RoundRequestQueue: function(value) {
      this.roundQueue = new ItemCollection();

      this.roundQueue.on('add', this.RoundRequestOnQueue, this);
      this.roundQueue.on('remove', this.RoundRequestOnQueue, this);
    },

    RoundRequestOnQueue: function(model) {
      //console.log(model.get("ExtPriceRate"));
      this.RoundNumber(model);
    },

    /**
		 Round off numbers

		 @method RoundNumber
		 **/
    RoundNumber: function(value, dec) {
      var bigDecimal = new BigDecimal.BigDecimal(value);
      return bigDecimal.setScale(dec, BigDecimal.MathContext.ROUND_HALF_UP);
    },

    InitializePaymentType: function(isPaid) {
      if (!this.paymentTypeView) {
        this.paymentTypeView = new PaymentTypeView({
          el: $("#paymentContainer"),
          isPaid: isPaid
        });

        this.paymentTypeView.on('cash', this.AddCashPayment, this);
        this.paymentTypeView.on('check', this.AddCheckPayment, this);
        this.paymentTypeView.on('card', this.AddCreditCardPayment, this);
        this.paymentTypeView.on('offline', this.AddOfflinePayment, this);
        this.paymentTypeView.on('onAccount', this.AddOnAccount, this);
        this.paymentTypeView.on('suspend', this.AddSuspend, this);
        this.paymentTypeView.on('gift', this.AddGift, this);
        this.paymentTypeView.on('loyalty', this.AddLoyalty, this);
      } else {
        this.paymentTypeView.Show(isPaid);
      }
    },

    /**
		 Event Handler for Complete button

		 @method buttonComplete_Tap
		 **/
    ValidateCartItemsQty: function() {
      if (!Global.TransactionType == Enum.TransactionType.ConvertQuote || Global.TransactionType == Enum.TransactionType.SalesRefund) return false;
      var _isValidQty = this.cartCollection.find(function(item) {
        return item.get("QuantityOrdered") == 0
      });
      return _isValidQty;
    },

    buttonComplete_Tap: function(e) {
      e.preventDefault();

      if (this.cartCollection.length > 0) {
        if (this.ValidateCartItemsQty()) {
          navigator.notification.alert("One or more item(s) in the cart has a quantity of 0, Item(s) with 0 quantity is not allowed. ", null, "Action Not Allowed", "OK");
          return;
        }
      }
      if (this.cartCollection.total() < 0) {
        navigator.notification.alert("Negative exchange is not allowed. You may need to create a separate sale or return transaction.", null, "Action Not Allowed", "OK");
      } else {
        switch (Global.TransactionType) {
          case Enum.TransactionType.Quote:
          case Enum.TransactionType.UpdateQuote:
            this.CreateTransaction("partial");
            break;
          default:
            if (this.cartCollection.length > 0) {
              var isPaid = false;
              if (this.paymentCollection && this.paymentCollection.length > 0) {
                isPaid = true;
              }
              // this.InitializePaymentType(isPaid); //11.04.13
              if (!this.AllowToCompleteTransaction()) return;
              this.CheckPotentialDiscount(isPaid);

              var DiscountResult = this.cartCollection.pluck("Discount");
              _.each(DiscountResult, function (discount, i) {
                if (discount > 0) {
                  return Global.IsUseINVDiscountReport = true;
                }
              });
            } else {
              navigator.notification.alert("There are no items to process.", null, "Action Not Allowed", "OK");
            }
            break;
        }
      }
    },

    GetTransactionDates: function() {
      var _dateToday = Shared.GetJsonUTCDate();

      switch (Global.TransactionType) {
        case Enum.TransactionType.ResumeSale:
        case Enum.TransactionType.UpdateInvoice:
        case Enum.TransactionType.Recharge:
        case Enum.TransactionType.ConvertOrder:
        case Enum.TransactionType.UpdateOrder:
        case Enum.TransactionType.SalesPayment:
          return {
            DocumentDate: Global.TransactionDocumentDate,
            StartDate: Global.TransactionObject.StartDate,
          }
          break;
      }

      return {
        DocumentDate: _dateToday,
        DateCreated: _dateToday,
      };
    },

    CheckPotentialDiscount: function(isPaid, doNotInitializePayment, paymentDate) {

      Global.TermDiscount = 0;
      var _summary = Global.Summary;
      _mdl = new BaseModel();
      _mdl.url = Global.ServiceUrl + Service.SOP + Method.COMPUTETERMDISCOUNT;

      transactionDates = this.GetTransactionDates();
      _mdl.set(transactionDates);

      _mdl.set({
        SubTotal: _summary.SubTotal,
        SubTotalRate: _summary.SubTotal,
        DiscountType: Global.ShipTo.DiscountType,
        DiscountPercent: Global.ShipTo.DiscountPercent,
        DiscountableDays: Global.ShipTo.DiscountableDays,
        //PaymentDate			: paymentDate,//Shared.GetJsonUTCDate(),
        DueType: Global.ShipTo.DueType,
      });

      if (paymentDate) _mdl.set({
        PaymentDate: paymentDate
      });


      _mdl.save(null, {
        success: function(model, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          this.ProcessPotentialDiscountResult(response, doNotInitializePayment, isPaid);
        }.bind(this),

        error: function(model, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          this.ProcessPotentialDiscountResult(response, doNotInitializePayment, isPaid);
        }.bind(this)
      });
    },

    ProcessPotentialDiscountResult: function(response, doNotInitializePayment, isPaid) {
      if (response.ErrorMessage) {
        this.NotifyMsg("Error Fetching Potential Discount")
      } else {
        //sets Term Discount on summaryModel.
        //Global.TermDiscount = response.Value;
        var _termDisc = format("0.0000", response.Value);;
        Global.TermDiscount = this.RoundNumber(_termDisc, 2) * 1;
        this.summaryModel.set({
          TermDiscount: Global.TermDiscount
        });

        if (Global.AllowToFetchPotentialDiscount) {
          Global.AllowToFetchPotentialDiscount = false;
          if (this.summaryModel) {
            if (this.summaryModel.DeductPotentialDiscountFromBalance() > 0) this.RemoveTermDiscountPayment();
            else this.AddTermDiscountToPayment(Global.TermDiscount);

            this.summaryModel.set({
              TermDiscount: 0
            });
          }
          return;
        }
      }

      if (!doNotInitializePayment) this.InitializePaymentType(isPaid);
      // if (Global.TransactionType === Enum.TransactionType.Return) {
      //   this.AddOnAccount();
      // } else if (!doNotInitializePayment) this.InitializePaymentType(isPaid);
    },

    InitializePrinterCollection: function() {
      if (!this.printerCollection) {
        this.printerCollection = new PrinterCollection();
        this.printerCollection.on('reset', this.SetValues, this);
      }
      this.printerCollection.fetch({
        success: function(model, response, options) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
        },
        error: function(model, xhr, options) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
        }
      });
    },

    SetValues: function(collection) {
      var _model = collection.find(function(model) {
        return model.get("PrinterModel");
      });

      var _ip = collection.find(function(model) {
        return model.get("IpAddress");
      });

      if (_model) {
        Global.Printer.PrinterModel = _model.get("PrinterModel");
      }

      if (_ip) {
        Global.Printer.IpAddress = _ip.get("IpAddress");
      }
    },

    /**
		 Create Transaction

		 @method CreateTransaction
		 **/
    CreateTransaction: function(paymentType) { //16x
      _paymentType = paymentType;

      switch (Global.TransactionType) {
        case Enum.TransactionType.Sale:
          this.CreateInvoiceWithValidaton(paymentType);
          break;
        case Enum.TransactionType.Order:
          this.CreateOrderWithValidation(paymentType);
          break;
        case Enum.TransactionType.Quote:
          this.CreateQuoteWithValidation();
          break;
        case Enum.TransactionType.UpdateInvoice:
        case Enum.TransactionType.Recharge:
          this.UpdateInvoiceWithValidation(paymentType);
          break;
        case Enum.TransactionType.SalesPayment:
          this.CreateInvoicePaymentWithValidaton(Global.TransactionCode, paymentType);
          break;
        case Enum.TransactionType.UpdateOrder:
          this.UpdateOrderWithValidation(paymentType);
          break;
        case Enum.TransactionType.ConvertOrder:
          this.ConvertOrderWithValidaton(Global.TransactionCode, paymentType);
          break;
        case Enum.TransactionType.ConvertQuote:
          this.ConvertQuoteWithValidaton(Global.TransactionCode, paymentType);
          break;
        case Enum.TransactionType.UpdateQuote:
          this.UpdateQuoteWithValidaton(Global.TransactionCode);
          break;
        case Enum.TransactionType.SalesRefund:
          this.CreateRefundWithValidation(paymentType);
          //_paymentType = paymentType;
          break;
        case Enum.TransactionType.Return:
       //   this.CreateCreditMemoWithValidation(paymentType);
          this.CreateRefundWithValidation(paymentType);
          break;
        case Enum.TransactionType.Suspend:
        case Enum.TransactionType.Recharge:
          if (this.IsExistingTransaction()) {
            //console.log("Suspend - Update Invoice");
            this.UpdateInvoiceWithValidation(paymentType);
            break;
          } else {
            //console.log("Suspend - Create Invoice");
            this.CreateInvoiceWithValidaton(paymentType);
            break;
          }
        default:
          return true;
      }
    },

    IsExistingTransaction: function() {
      if (Global.TransactionObject)
        if (Global.TransactionObject.InvoiceCode)
          if (Global.TransactionObject.InvoiceCode != "")
            return true;
      return false;
    },

    /**
		 Validate Transaction, Payment and Prompt To Print and Signature before creating Invoice

		 @method CreateInvoiceWithValidation
		 **/
    CreateLoyaltyWithValidaton: function(paymentType) {
      if (this.ValidateTransaction()) {
        if (this.ValidatePayment(paymentType)) {
          if (this.PromptCustomerPO(paymentType)) {
            if (this.PromptSignature()) {
              if (this.PromptToPrint()) {
                if (this.ValidateOutOfStockItems()) this.CreateInvoice(Global.IsPosted);
              }
            }
          }

        }
      }
    },

    CreateInvoiceWithValidaton: function(paymentType) { // 12x v.14
      if (this.ValidateTransaction()) {
        if (this.ValidatePayment(paymentType)) {
          if (this.PromptCustomerPO(paymentType)) {
            if (this.PromptSignature()) {
              if (this.PromptToPrint()) {
                if (this.ValidateOutOfStockItems()) this.CreateInvoice(Global.IsPosted);
              }
            }
          }

        }
      }
    },

    ResetCustomerPODetails: function() {
      this.customerPOModel = null;
      this.isSetCustomerPO = false;
      this.previousTransactionDetals = null;
      //console.log("isReset = true");
      if (this.signatureTimeInterval) this.StopFetchingSignature();
    },

    SetCustomerPODetails: function(po_model, paymentType) { //jay2x v.14
      this.customerPOModel = po_model;
      $("#main-transaction-blockoverlay").show();
      this.isSetCustomerPO = true;
      this.CreateTransaction(paymentType);
    },

    PromptCustomerPO: function(paymentType) {
      if (Global.OnRechargeProcess) return true;
      if (Global.Preference.AskForCustomerPO || Global.Preference.AskForShipDate || Global.Preference.AskForSource) {
        if (Shared.IsNullOrWhiteSpace(this.isSetCustomerPO) || this.isSetCustomerPO == false) {
          $("#main-transaction-blockoverlay").show();
          this.InitializeCustomerPOView();
          this.customerPOModel = new BaseModel();
          //console.log("SourceCode : " + Global.CurrentCustomerSourceCode);
          this.customerPOView.Show(this.customerPOModel, paymentType, Global.CurrentCustomerSourceCode, this.previousTransactionDetals);
          this.customerPOView.on("AddCustomerPO", this.SetCustomerPODetails, this);
          this.customerPOView.on("ResetCustomerPO", this.ResetCustomerPODetails, this);
          return false;
        }
      }
      return true;
    },

    InitializeCustomerPOView: function() { //jay2x
      if (!this.customerPOView) {
        this.customerPOView = new CustomerPOView({
          el: $("#customerPOContainer")
        });
      } else {
        this.customerPOView.unbind();
        this.customerPOView = new CustomerPOView({
          el: $("#customerPOContainer")
        });
      }
    },

    CheckAndLogLastItem: function(itemAttr, preventLog) {
      if (!this._lastItemChecked) {
        this._lastItemChecked = {
          ItemCode: "",
          QuantityOrdered: 0,
          WarehouseCode: ""
        };
      }
      if (this._lastItemChecked.ItemCode == itemAttr.ItemCode)
        if (this._lastItemChecked.QuantityOrdered == itemAttr.QuantityOrdered)
          if (this._lastItemChecked.WarehouseCode == itemAttr.WarehouseCode)
            if (this._lastItemChecked.UnitMeasureCode == itemAttr.UnitMeasureCode)
              return false;

      if (preventLog) return true;
      this._lastItemChecked.ItemCode = itemAttr.ItemCode;
      this._lastItemChecked.QuantityOrdered = itemAttr.QuantityOrdered;
      this._lastItemChecked.WarehouseCode = itemAttr.WarehouseCode;
      this._lastItemChecked.UnitMeasureCode = itemAttr.UnitMeasureCode;
      return true;
    },

    NotifyIfItemIsOutOfStock: function(itemAttr, forceCheck) {
      var self = this;
      if (itemAttr.ItemType == Enum.ItemType.Service || itemAttr.ItemType == Enum.ItemType.NonStock ||
        itemAttr.ItemType == Enum.ItemType.GiftCard || itemAttr.ItemType == Enum.ItemType.GiftCertificate) {
        self.CheckAndLogLastItem(itemAttr);
        return;
      }

      /*if (itemAttr.ItemType == Enum.ItemType.Kit) {
          kitItems = JSON.parse(window.sessionStorage.getItem('kitItems-'+ itemAttr.LineNum));
          itemAttr = kitItems;
      }*/
      //  if(itemAttr.Status == "P") return;

      if (Global.CustomerPreference)
        if (Global.CustomerPreference.IsIgnoreStockLevels) {
          self.CheckAndLogLastItem(itemAttr);
          return;
        }
      if (Global.TransactionType != Enum.TransactionType.Sale && Global.TransactionType != Enum.TransactionType.ConvertOrder &&
        Global.TransactionType != Enum.TransactionType.Suspend && Global.TransactionType != Enum.TransactionType.UpdateInvoice) {
        self.CheckAndLogLastItem(itemAttr);
        return;
      }
      if (itemAttr.DoNotCheckStock) {
        self.CheckAndLogLastItem(itemAttr);
        return;
      }
      if (!itemAttr.IsOutOfStock && !forceCheck) {
        self.CheckAndLogLastItem(itemAttr);
        return;
      }
      if (!this.CheckAndLogLastItem(itemAttr, forceCheck)) return;

      if (forceCheck) {

        var tempModel = new BaseModel();
        tempModel.set(itemAttr);
        tempModel.set({
          "Quantity": itemAttr.QuantityOrdered
        });
        tempModel.url = Global.ServiceUrl + Service.SOP + Method.ISITEMOUTOFSTOCK;
        tempModel.save(tempModel, {
          success: function(model, response) {
            if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
            if (model.get("IsOutOfStock")) {
              itemAttr.IsOutOfStock = true;
              self.NotifyIfItemIsOutOfStock(itemAttr);
            }
          },
          error: function(model, error, response) {
            console.log(error);
          }
        });
        return;
      }
      var _isUPCNotifyStock = false;
      var _preventNotificationsFromUPC = false;
      if (!Shared.IsNullOrWhiteSpace(self.upcItemCollection)) {
        if (self.upcItemCollection.length > 0) {
          var _outOFStockCtr = 0;
          self.upcItemCollection.each(function(upcItem) {
            if (upcItem.get("IsOutOfStock") === true) _outOFStockCtr++;

            if (upcItem.get("ItemCode") == itemAttr.ItemCode && upcItem.get("UnitMeasureCode") == itemAttr.UnitMeasureCode && upcItem.get("WarehouseCode") == itemAttr.WarehouseCode) {
              upcItem.set({
                Scanned: true
              });
            }

          });

          if (_outOFStockCtr > 1) {
            _isUPCNotifyStock = true;
          }

          var upcCount = 0;
          self.upcItemCollection.each(function(upcItem) {
            if (upcItem.get("Scanned")) upcCount++;
          });

          if (upcCount > 1) {
            _preventNotificationsFromUPC = true;
            if (upcCount == _outOFStockCtr) {
              self.upcItemCollection.reset();
              //console.log("Reset: " + Math.random());
            }
          }
        }
      }

      if (_preventNotificationsFromUPC) return;
      //console.log("Notification: " + Math.random());

      Global.msg1 = "Item '" + itemAttr.ItemName + "' does not have enough stock. ConnectedSale will automatically adjust stock when the sale transaction is created.";
      var _msg2 = "However, this requires manager's approval.";
      Global.msgTitle = "Stock Verification";

      if (!Shared.IsNullOrWhiteSpace(_isUPCNotifyStock)) {
        _msg1 = "One or more Item does not have enough stock. ConnectedSale will automatically adjust stock when the sale transaction is created."
      };

      if (!Global.Preference.AutoAllocateOverrideLevel ||
          Global.Preference.AutoAllocateOverrideLevel == "" ||
          Global.Preference.AutoAllocateOverrideLevel == Global.UserInfo.RoleCode) {

        if (Global.Preference.IsAutoAdjustmentStock == false && itemAttr.IsOutOfStock == true) {
          return false;
        } else {
          navigator.notification.alert(Global.msg1, null, Global.msgTitle, "OK");
          return;
        }

      } else {
        if (Global.Preference.IsAutoAdjustmentStock == false && itemAttr.IsOutOfStock == true) {
          return false;
        }
        else if (Global.Preference.IsAutoAdjustmentStock == true && itemAttr.IsOutOfStock == true) {
          this.ValidateManagerOverride(Enum.ActionType.AutoAllocate)
          Global.CurrentAssignedItemQty = itemAttr.QuantityOrdered;
          return false;
        }
        else {
          navigator.notification.alert(Global.msg1, null, Global.msgTitle, "OK");
          return;
        }
      }

//      if (Global.Preference.IsAutoAdjustmentStock == false && itemAttr.IsOutOfStock == true) {
//        return;
//      } else {
//        if (!Global.Preference.AutoAllocateOverrideLevel ||
//            Global.Preference.AutoAllocateOverrideLevel == "" ||
//            Global.Preference.AutoAllocateOverrideLevel == Global.UserInfo.RoleCode) {
//          navigator.notification.alert(Global.msg1, null, Global.msgTitle, "OK");
//          return;
//        } else {
//          this.ValidateManagerOverride(Enum.ActionType.AutoAllocate)
//          return;
//        }
//      }

      //navigator.notification.alert(_msg1 + " " + _msg2, null, _msgTitle, "OK");
      //console.log(_msg1 + " : " + _msg2);
    },

    ValidateOutOfStockItems: function() {
      if (Global.CustomerPreference)
        if (Global.CustomerPreference.IsIgnoreStockLevels) return true;
      if (Global.TransactionType != Enum.TransactionType.Sale && Global.TransactionType != Enum.TransactionType.ConvertOrder && Global.TransactionType != Enum.TransactionType.Suspend && Global.TransactionType != Enum.TransactionType.UpdateInvoice) return true;
      var _hasOutOfStock = false;
      this.cartCollection.each(function(model) {
        if (model.get("IsOutOfStock")) {
          _hasOutOfStock = true;
        }
      });
      if (!_hasOutOfStock) return true;

      if (!Global.Preference.AutoAllocateOverrideLevel ||
        Global.Preference.AutoAllocateOverrideLevel == "" ||
        Global.Preference.AutoAllocateOverrideLevel == Global.UserInfo.RoleCode) {
        return true;
      }
      return this.ValidateManagerOverride(Enum.ActionType.AutoAllocate, true);
    },

    /**
		 Check if Order has Changes then Update Order

		 @method UpdateOrderWithValidation
		 **/
    UpdateInvoiceWithValidation: function(paymentType) {
      if (Global.HasChanges || this.AllowSaveWithOutChanges()) {
        if (this.ValidateTransaction()) {
          if (this.ValidatePayment(paymentType)) {
            if (this.PromptCustomerPO(paymentType)) {
              if (this.PromptSignature()) {
                if (this.PromptToPrint()) {
                  if (this.ValidateOutOfStockItems()) this.UpdateInvoice();
                }
              }
            }

          }
        }
      } else {
        //console.log("There are no changes to save.");
        navigator.notification.alert("There are no changes to save.", null, "Cannot Save Transaction", "OK");
        $("#main-transaction-blockoverlay").hide();
      }
    },

    AllowSaveWithOutChanges: function() {
      if (Global.TransactionType == Enum.TransactionType.Suspend) return true;
      if (Global.TransactionType == Enum.TransactionType.Recharge) return true;
      if (Global.TransactionType == Enum.TransactionType.UpdateInvoice /*&& Global.PaymentType == "Partial"*/ ) return true;
      return false;
    },

    /**
		 Validate Transaction, Payment and Prompt To Print and Signature before creating Order

		 @method CreateOrderWithValidation
		 **/
    CreateOrderWithValidation: function(paymentType) {
      if (this.ValidateTransaction()) {
        if (this.ValidatePayment(paymentType)) {
          if (this.PromptCustomerPO(paymentType)) {
            if (this.PromptSignature()) {
              if (this.PromptToPrint()) {
                this.CreateOrder();
              }
            }
          }

        }
      }
    },

    /**
		 Check if Order has Changes then Update Order

		 @method UpdateOrderWithValidation
		 **/
    UpdateOrderWithValidation: function(paymentType) {
      if (Global.HasChanges) {
        if (this.ValidateTransaction()) {
          if (this.ValidatePayment(paymentType)) {
            if (this.PromptCustomerPO(paymentType)) {
              if (this.PromptSignature()) {
                if (this.PromptToPrint()) {
                  this.UpdateOrder();
                }
              }
            }

          }
        }
      } else {
        //console.log("There are no changes to save.");
        navigator.notification.alert("There are no changes to save.", null, "Cannot Save Transaction", "OK");
        $("#main-transaction-blockoverlay").hide();
      }
    },

    /**
		 Validate Transaction, and Prompt To Print before creating Quote

		 @method CreateQuoteWithValidation
		 **/
    CreateQuoteWithValidation: function() {
      if (this.ValidateTransaction()) {
        if (this.PromptCustomerPO()) {
          if (this.PromptToPrint()) {
            this.CreateQuote();
          }
        }
      }
    },


    UpdateQuoteWithValidaton: function(salesOrderCode) {
      if (this.ValidateTransaction()) {
        if (this.PromptCustomerPO()) {
          if (this.PromptToPrint()) {
            this.UpdateQuote(salesOrderCode);
          }
        }
      }
    },


    /**
		 Validate Payments then Create Invoice Payment

		 @method CreateInvoicePaymentWithValidation
		 **/
    CreateInvoicePaymentWithValidaton: function(transactionCode, paymentType) {
      if (this.ValidatePayment(paymentType)) {
        payments = this.GetNewPayments();

        if (payments && payments.length > 0) {
          if (this.PromptToPrint()) {
            this.CreateInvoicePayment(transactionCode);
          }
        } else {
          //console.log("There are no new payments to process.");
          navigator.notification.alert("There are no new payments to process.", null, "No Payments Found", "OK");
          this.RemoveScreenOverLay();
        }
      }
    },

    /**
		 Validate Transaction, manager override, reasoncodes and Prompt To Print before creating Credit Memo

		 @method CreateCreditMemoWithValidation
		 **/
    CreateCreditMemoWithValidation: function(paymentType) {
      if (this.ValidateTransaction()) {
        if (this.PromptToPrint()) {
          if (this.PromptCustomerPO(paymentType)) {
            if (this.ValidateReason("Return")) {
              if (this.ValidateManagerOverride(Enum.ActionType.Returns)) {
                this.CreateCreditMemo();
              }
            }
          }

        }
      }
    },

    /**
		 Create CreditMemo

		 @method CreateCreditMemo
		 **/
    CreateCreditMemo: function() {
      this.InitializeTransaction();
      var _invoiceCollection = new InvoiceCollection(),
        _invoicedetail = new InvoiceDetailCollection(),
        shippingDate = new Date(),
        kitItems = new BaseCollection();

      shippingDate = this.JsonToAspDate(shippingDate);

      _invoicedetail.add(this.cartCollection.models);
      _invoicedetail.each(function(model) {
        var taxCode = window.sessionStorage.getItem("selected_taxcode");
        taxCode = (taxCode) ? taxCode : Global.ShipTo.TaxCode;
        model.set("TaxCode", taxCode);
      });

      this.cartCollection.each(function(cart) {
        var item = JSON.parse(window.sessionStorage.getItem('kitItems-' + cart.get('LineNum')));
        if (item) kitItems.add(item);
      });

   

      var self = this;
      var invoiceModel = new BaseModel();
      invoiceModel.set({
        BillToCode: Global.CustomerCode,
        POSWorkstationID: Global.POSWorkstationID,
        POSClerkID: Global.Username,
        IsFreightOverwrite: true,
        IsOverrideSalesRep: Global.Preference.IsOverrideSalesRep,
        SignatureSVG: Global.Signature,
        ShippingDate: (Global.TransactionObject) ? Global.TransactionObject.ShippingDate : shippingDate,
        WarehouseCode: Global.Preference.DefaultLocation,
        IsTaxByLocation: Global.Preference.TaxByLocation
      });
      if (!Shared.IsNullOrWhiteSpace(this.customerPOModel)) {
        invoiceModel.set(self.customerPOModel.attributes);
      }
      _invoiceCollection.add(invoiceModel);
      this.AssignTransactionShipTo(_invoiceCollection.at(0));

      this.transactionModel.set({
        "Invoices": _invoiceCollection.toJSON(),
        "InvoiceDetails": _invoicedetail.toJSON(),
        "KitDetails": kitItems.toJSON(),
        "SalesRep": (Global.SalesRepList == null) ? null : Global.SalesRepList
      });

      this.RemoveWarehouseCodeByItemType(this.transactionModel.get("InvoiceDetails"));

      this.transactionModel.url = Global.ServiceUrl + Service.SOP + Method.CREATECREDITMEMO;

      //use save method of model to save data to the server then alert the created invoice code
      this.LockTransactionScreen(true, "Saving...");
      this.transactionModel.save(null, {connectionID: this.signalRConnectionID});

      this.ResetCustomerPODetails();
    },

    ValidatePaymentWithoutCreditMemo: function() {
      var amountPaid = 0;
      for (var i = 0; i < this.paymentCollection.length; i++) {
        var _paymentType = this.paymentCollection.at(i).get("PaymentType");
        if (_paymentType != "Credit Memo" && _paymentType != "Term Discount") {
          amountPaid += this.paymentCollection.at(i).get("AmountPaid");
        }
      }

      var value = format("0.0000", amountPaid);
      amountPaid = this.RoundNumber(value, 2) * 1;

      if (amountPaid <= 0) return false;

      return true;
    },

    ValidateReturnSerialLot: function(serialLotCollection, cartCollection, msg) {
      var errMsg = msg;
      var errCounter = 0;
      var cart = cartCollection.filter(function(model) {
        return (model.get("ItemType") === Enum.ItemType.GiftCard || model.get("ItemType") === Enum.ItemType.GiftCertificate);
      });

      if (serialLotCollection) {
        for (var i = 0; i < cart.length; i++) {
          var gcCart = cart[i];
          var serialLot = false;

          var serial = serialLotCollection.filter(function(model) {
            return (model.get("ItemCode") === gcCart.get("ItemCode"));
          });

          serialLot = (serial.length === gcCart.get("Good")); //Originally Defective

          if (!serialLot) errCounter++;
        }

        if (errCounter > 0) return errMsg;
        else return;
      }

      if (cart.length > 0) return errMsg;
      else return;
    },

    /**
		 Check if PaymentType is Partial then Validate Transaction, Reason and then Create Refund

		 @method CreateRefundWithValidation
		 **/
    CreateRefundWithValidation: function(paymentType) { //jj17x	v14

     if (Global.TransactionType === Enum.TransactionType.SalesRefund ) {
         if (paymentType != "Partial" && !this.ValidatePaymentWithoutCreditMemo()) {
        //console.log("There\'s no payment to refund. Instead you can use \'Return\' button to convert this sale to a Return transaction.");
        navigator.notification.alert("There\'s no payment to refund. Instead you can use \'Return\' button to create a Return transaction.", null, "Action Not Allowed", "OK");
        this.RemoveScreenOverLay();
        return false;
      }
     }
   

      this.SetActionType(Enum.ActionType.Returns);

      if (paymentType != "Partial" && paymentType != "Completed") {
        this.AddRefund();
        return null;
      }
      //if (this.refundCollection && this.refundCollection.length > 0 && this.paymentCollection.at(0).get("PaymentType") != Enum.PaymentType.CreditMemo){
      //    if (this.ValidateTransaction()) {
      //		if (this.PromptToPrint()) {
      //			if(this.ValidateReason("Return")) {
      //    				if (this.ValidateManagerOverride(Enum.ActionType.Returns)) {
      //    					this.CreateRefund();
      //    				}
      //				}
      //		}
      //	}
      //}else{
      if (this.ValidateTransaction()) {
        if (this.PromptCustomerPO(paymentType)) {
          if (this.PromptToPrint()) {
            if (this.ValidateReason("Return")) {
              if (this.ValidateManagerOverride(Enum.ActionType.Returns)) {
                this.CreateRefund();
              }
            }
          }
        }
      }
      //}

      return false;
    },

    /**
		 Process Create Refund

		 @method CreateRefund
		 **/
    CreateRefund: function() { //17x
     
      var refundPaymentCollection = new BaseCollection();
      if (Global.TransactionType == Enum.TransactionType.Return) {
        refundPaymentCollection.add({
        'Account': this.GetPaymentAccountInfo(),
        'PaymentType' : Global.PaymentType,
        'AmountPaid': this.GetTransactionBalance(),
        'SignatureSVG':  Global.Signature
      });
        if (this.refundCollection == null) this.refundCollection =  refundPaymentCollection;

      if (this.refundCollection.length == 0) this.refundCollection = refundPaymentCollection;

      this.InitializeTransaction();
      var _invoiceCollection = new InvoiceCollection(),
        _invoicedetail = new InvoiceDetailCollection(),
        shippingDate = new Date(),
        kitItems = new BaseCollection();

      shippingDate = this.JsonToAspDate(shippingDate);

      _invoicedetail.add(this.cartCollection.models);
      _invoicedetail.each(function(model) {
        var taxCode = window.sessionStorage.getItem("selected_taxcode");
        taxCode = (taxCode) ? taxCode : Global.ShipTo.TaxCode;
        model.set("TaxCode", taxCode);
      });

      this.cartCollection.each(function(cart) {
        var item = JSON.parse(window.sessionStorage.getItem('kitItems-' + cart.get('LineNum')));
        if (item) kitItems.add(item);
      });

    
      var forceAuthorizationCode;
        var offlineCharge;
        if (Global.DejavooEnabled || Global.OfflineCharge) {
            forceAuthorizationCode = this.GenerateForceAuthorizationCode();
            offlineCharge = true;
        }
        else  {
          forceAuthorizationCode = "";
          offlineCharge = false;
        } 


      var self = this;
      var invoiceModel = new BaseModel();
      invoiceModel.set({
        BillToCode: Global.CustomerCode,
        Payment: this.refundCollection.at(0).toJSON(),
        POSWorkstationID: Global.POSWorkstationID,
        POSClerkID: Global.Username,
        IsFreightOverwrite: true,
        IsOverrideSalesRep: Global.Preference.IsOverrideSalesRep,
        SignatureSVG: Global.Signature,
        ShippingDate: (Global.TransactionObject) ? Global.TransactionObject.ShippingDate : shippingDate,
        WarehouseCode: Global.Preference.DefaultLocation,
        IsTaxByLocation: Global.Preference.TaxByLocation,
        IsUsePOSShippingMethod: Global.Preference.IsUsePOSShippingMethod,
        POSShippingMethod: Global.Preference.POSShippingMethod
      });
      if (!Shared.IsNullOrWhiteSpace(this.customerPOModel)) {
        invoiceModel.set(self.customerPOModel.attributes);
      }
      _invoiceCollection.add(invoiceModel);
      this.AssignTransactionShipTo(_invoiceCollection.at(0));

      this.transactionModel.set({
        "Invoices": _invoiceCollection.toJSON(),
        "InvoiceDetails": _invoicedetail.toJSON(),
        "Payment": this.refundCollection.at(0).toJSON(),
        "KitDetails": kitItems.toJSON(),
        "SalesRep": (Global.SalesRepList == null) ? null : Global.SalesRepList,
        "IsOfflineCharge": offlineCharge,
        "ForceAuthorizationCode": forceAuthorizationCode,
        "IsCreateRefund": Global.IsCreateRefund
      });

      this.RemoveWarehouseCodeByItemType(this.transactionModel.get("InvoiceDetails"));

      this.transactionModel.url = Global.ServiceUrl + Service.SOP + Method.CREATECREDITMEMO;

      //use save method of model to save data to the server then alert the created invoice code
      this.LockTransactionScreen(true, "Saving...");
      this.transactionModel.save(null, {connectionID: this.signalRConnectionID});

      this.ResetCustomerPODetails();

      }

      else {

      if (this.refundCollection && this.refundCollection.length > 0 && this.paymentCollection.at(0).get("PaymentType") != Enum.PaymentType.CreditMemo) {

        var forceAuthorizationCode;
        var offlineCharge;
        if (Global.DejavooEnabled || Global.OfflineCharge) {
            forceAuthorizationCode = this.GenerateForceAuthorizationCode();
            offlineCharge = true;
        }
        else  {
          forceAuthorizationCode = "";
          offlineCharge = false;
        } 

        this.InitializeTransaction();
        var _invoicedetail = new InvoiceDetailCollection();
        _invoicedetail.add(this.cartCollection.models);

        var _serializeLot = "";
        if (this.serializeLotCollection) {
          this.serializeLotCollection.comparator = function(model) {
            return model.get("ItemCode");
          };

          this.serializeLotCollection.sort({
            silent: true
          });

          var self = this,
            toBeDeletedSerialLot = [];
          this.cartCollection.each(function(cart) {
            self.serializeLotCollection.each(function(serial) {
              if (cart.get("Good") > 0) { //Originally Defective
                if (serial.get("ItemCode") === cart.get("ItemCode") && serial.get("LineNum") === cart.get("LineNum")) {
                  if (serial.get("IsIncluded")) {
                    toBeDeletedSerialLot.push(serial);
                  }
                }
              }
            });
          });

          var clonedSerializeCollection = new BaseCollection();

          clonedSerializeCollection.reset(toBeDeletedSerialLot);
          _serializeLot = clonedSerializeCollection.toJSON();
          //console.log(_serializeLot);
        }

        var self = this;

        //!SIGNATURE
        Global.SVG_Hold = new Array();
        Global.SVG_ReadyToSave = false;
        var ExecThis = function() {
          if (!self.IsHoldSVG() && Global.SVG_ReadyToSave) {
            self.transactionModel.save(null, {connectionID: self.signalRConnectionID});
          }
        }

        this.RemoveTermDiscountPayment();

        for (var i = 0; i < this.refundCollection.length; i++) {
          if (this.refundCollection.at(i).get('SignatureSVG')) {
            var _svgtmp = this.refundCollection.at(i).get('SignatureSVG');
            this.refundCollection.at(i).set({
              SignatureSVG: this.ValidateSVG(_svgtmp, ExecThis)
            });
          }
        }
        var _couponCode = this.cartCollection.at(0).get('CouponCode');

        //CSL-9780 09.24.20013
        _invoicedetail.each(function(model) {
          if (model.get("IsNewLine")) {
            model.set({
              OriginalQuantityAllocated: 0,
              Outstanding: 0,
              QuantityOrdered: 0,
              QuantityShipped: 0
            });
          }
        });


        this.transactionModel.set({
          InvoiceDetails: _invoicedetail.toJSON(),
          Payment: this.refundCollection.at(0).toJSON(),
          Customer: Global.CurrentCustomer,
          InvoiceCode: Global.TransactionCode,
          CouponCode: _couponCode,
          IsTaxByLocation: Global.Preference.TaxByLocation,
          WarehouseCode: Global.Preference.DefaultLocation, // _invoicedetail.at(0).get("WarehouseCode"),
          PublicNotes: Global.PublicNote.PublicNotes,
          SerialLotNumbers: _serializeLot,
          ShippingDate: Global.TransactionObject.ShippingDate,
          IsOfflineCharge: offlineCharge,
          ForceAuthorizationCode: forceAuthorizationCode,
        });
        if (!Shared.IsNullOrWhiteSpace(this.customerPOModel)) {
          this.transactionModel.set(self.customerPOModel.attributes);
        }
        this.RemoveWarehouseCodeByItemType(this.transactionModel.get("InvoiceDetails"));

        this.transactionModel.url = Global.ServiceUrl + Service.SOP + Method.CREATEREFUNDFROMINVOICE;

        try {
          //use save method of model to save data to the server
          this.LockTransactionScreen(true, "Saving...");
          this.ResetCustomerPODetails();
          //this.transactionModel.save(this.transactionModel);
          Global.SVG_ReadyToSave = true;

          var msg = "Error saving the CreditMemo. The following items do not have the same number of serial numbers with the shipped quantity.";

          var errMsg = this.ValidateSerialLot(clonedSerializeCollection, this.cartCollection, msg);
          if (errMsg === undefined || errMsg === "") ExecThis();
          else throw errMsg;

          //var gcCartCollection = this.cartCollection.filter(function (model) {
          //    return model.get("ItemType") === Enum.ItemType.GiftCard || model.get("ItemType") === Enum.ItemType.GiftCertificate;
          //});

          //var serialNumberLength = (clonedSerializeCollection) ? clonedSerializeCollection.length : 0

          //if (serialNumberLength != gcCartCollection.length) {
          //    var collection = this.ValidateSerialNumbers(clonedSerializeCollection, this.cartCollection, "");
          //    if (collection.length > 0) {
          //        this.RenderGCList(new BaseCollection(collection));
          //        return;
          //    }
          //    else if (collection.length === 0) {
          //        this.RenderGCList(this.cartCollection);
          //        return;
          //    }
          //}

          //ExecThis();
          return true;
        } catch (err) {
          this.LockTransactionScreen(false);
          navigator.notification.alert(err, null, "Action not Allowed", "OK");
          //console.log(err);
        }
      } else {

        this.ConvertInvoice();
      }
    }// not Return
     

    

    },

    /**
		 Add Refund to Refund Collection

		 @method AddRefund
		 **/
    AddRefund: function() {

      //There's no need to show the payment form if payment type is cash
      var _showForm = (Global.PaymentType != Enum.PaymentType.Cash)

      if (!this.refundCollection) {
        this.refundCollection = new PaymentCollection();
      } else {
        this.refundCollection.reset();
      }

      this.refundCollection.unbind();
      this.refundCollection.on("add", this.AddRefundCompleted, this);

      if (!this.refundView) {
        this.refundView = new RefundView({
          el: $("#refundContainer"),
          collection: this.refundCollection,
          payment: this.paymentCollection
        });
        this.refundView.on("allowUserToAttachSign", this.GetAttachedSignature, this);
        this.refundView.on("cancelSignRetrieval", this.StopRetrieval, this);
        this.refundView.on("deleteSavedSignature", this.DeleteSavedSignature, this);

      }

      switch (Global.PaymentType) {
        case Enum.PaymentType.Cash:
           if (Global.DejavooEnabled)  this.RefundDejavooCreditCardPayment(this.GetRefundAmount());  
           else  this.refundView.AddCashPayment(this.GetRefundAmount());    
           break;
         case Enum.PaymentType.CreditCard:
           if (Global.DejavooEnabled)  this.RefundDejavooCreditCardPayment(this.GetRefundAmount());  
           else if (Global.OfflineCharge) this.RefundDejavooCreditCardPayment(this.GetRefundAmount());  
           else  {
            this.refundView.AddCreditCardPayment(this.GetRefundAmount());    
           }
           break;


        default:
          this.refundView.Show(this.GetRefundAmount());
          break;
      }
    },

    RefundDejavooCreditCardPayment: function(amount) {
      var self = this;

      if (Global.DejavooEnabled) {
        self.ShowDejavooProgress(true);
        var request = Global.Preference.DejavooConnectionProtocol + "://";
        request += Global.Preference.DejavooConnectionTerminal + ":";
        request += Global.Preference.DejavooConnectionCGIPort + "/cgi.html?TerminalTransaction=";
        request += "<request>";
        request += "<PaymentType>Credit</PaymentType>";
        request += "<TransType>Return</TransType>";
        request += "<Amount>" + parseFloat(amount).toFixed(2) + "</Amount>";
        request += "<Tip>0</Tip>";
        request += "<Frequency>" + Global.Preference.DejavooTransactionFrequency + "</Frequency>";
        request += "<InvNum></InvNum>";
        request += "<RefId>" + this.GenerateForceAuthorizationCode() + "</RefId>";
        request += "<RegisterId>" + Global.Preference.DejavooTransactionRegisterID + "</RegisterId>";
        request += "<AuthKey>" + Global.Preference.DejavooConnectionAuthKey + "</AuthKey>";
        request += "<PrintReceipt>" + (Global.Preference.DejavooTransactionPrintReceipt == 0 ? "No" : "Both") + "</PrintReceipt>";
        request += "<SigCapture>" + (Global.Preference.DejavooTransactionSignature == 0 ? "No" : "Yes") + "</SigCapture>";
        request += "</request>";
  
        var dejavooCollection = new BaseCollection();
        dejavooCollection.url = request;
        dejavooCollection.fetch({
          error: function(collection, error, response) {
            // var xmlDoc = $.parseXML(error.responseText);
            var xmlDoc = $.parseXML(error.responseText.replace(/[\n\r�]/g, ''));
            var response = $(xmlDoc);

            if (response.find("ResultCode").text()=="0") { 
              //Success
              self.refundView.AddCashPayment(amount);
              self.ShowDejavooProgress(false);
            } else {
              //Failed
              $("#main-transaction-blockoverlay").hide();
              self.ShowDejavooProgress(false);
              navigator.notification.alert(response.find("Message").text(), null, 'Error', 'OK');
            }
          }
        });
      }
    },

    GenerateForceAuthorizationCode: function() {
     var force = (Global.DejavooEnabled ? "DJV" : "FP");
      var todayDate = new Date();
      var yr = todayDate.getFullYear().toString();
      var month = ("0" + (todayDate.getMonth()  + 1)).slice(-2);
      var day = ("0" + todayDate.getDate()).slice(-2); //todayDate.getDate().toString();
      var hr =("0" + todayDate.getHours()).slice(-2); // todayDate.getHours().toString();
      var min = ("0" + todayDate.getMinutes()).slice(-2); //todayDate.getMinutes().toString();
      var sec = ("0" + todayDate.getSeconds()).slice(-2) //todayDate.getSeconds().toString();
    //  var ms = todayDate.getMilliseconds().toString();
      var value = force.concat(yr,month.toString(),day.toString(),hr.toString(),min.toString(),sec.toString());
      return value;
    },

    /**
		 Validate Transaction, Payment and Prompt To Print and Signature before creating Invoice

		 @method CreateInvoiceWithValidation
		 **/
    AddRefundCompleted: function(model) {
      this.CreateRefundWithValidation("Completed");
    },

    ConvertInvoice: function() {
      var _invoicedetail = new InvoiceDetailCollection();

      var _couponCode = this.cartCollection.at(0).get('CouponCode');
      _invoicedetail.add(this.cartCollection.models);

      var _serializeLot = "";
      if (this.serializeLotCollection) {
        this.serializeLotCollection.comparator = function(model) {
          return model.get("ItemCode");
        };

        this.serializeLotCollection.sort({
          silent: true
        });

        var self = this,
          toBeDeletedSerialLot = [];
        this.cartCollection.each(function(cart) {
          self.serializeLotCollection.each(function(serial) {
            if (cart.get("Good") > 0) { //Originally Defective
              if (serial.get("ItemCode") === cart.get("ItemCode") && serial.get("LineNum") === cart.get("LineNum")) {
                if (serial.get("IsIncluded")) {
                  toBeDeletedSerialLot.push(serial);
                }
              }
            }
          });
        });

        var clonedSerializeCollection = new BaseCollection();

        clonedSerializeCollection.reset(toBeDeletedSerialLot);
        _serializeLot = clonedSerializeCollection.toJSON();
        //console.log(_serializeLot);
      }


      //CSL-9780 09.24.20013
      _invoicedetail.each(function(model) {
        if (model.get("IsNewLine")) {
          model.set({
            OriginalQuantityAllocated: 0,
            Outstanding: 0,
            QuantityOrdered: 0,
            QuantityShipped: 0
          });
        }
      });

      this.InitializeTransaction();

      //var _creditMemoModel = new CreditMemoModel();
      var shippingDate = new Date();
      shippingDate = this.JsonToAspDate(shippingDate);
      this.transactionModel.set({
        InvoiceDetails: _invoicedetail,
        Customer: Global.CurrentCustomer,
        InvoiceCode: Global.TransactionCode,
        CouponCode: _couponCode,
        WorkstationID: Global.POSWorkstationID,
        IsOverrideSalesRep: false,
        WarehouseCode: Global.LocationCode, //Required in ConvertInvoiceToCreditMemo to prevent Object Reference Error : JIRA INTMOBA-622
        PublicNotes: Global.PublicNote.PublicNotes,
        SerialLotNumbers: _serializeLot,
        ShippingDate: Global.TransactionObject.ShippingDate,
        IsTaxByLocation: Global.Preference.TaxByLocation
      });
      var self = this;

      if (!Shared.IsNullOrWhiteSpace(this.customerPOModel)) {
        var poCode = this.customerPOModel.get("POCode");
        var sourceCode = this.customerPOModel.get("SourceCode");
        var shippingDate = this.customerPOModel.get("ShippingDate");
        this.transactionModel.set({
          POCode: poCode,
          SourceCode: sourceCode,
          ShippingDate: shippingDate
        });
      }

      this.transactionModel.url = Global.ServiceUrl + Service.SOP + Method.CONVERTINVOICETOCREDITMEMO;


      try {
        //use save method of model to save data to the server
        this.LockTransactionScreen(true, "Saving...");
        this.ResetCustomerPODetails();

        var _self = this;
        var msg = "Error saving the CreditMemo. The following items do not have the same number of serial numbers with the shipped quantity.";

        var errMsg = this.ValidateSerialLot(clonedSerializeCollection, this.cartCollection, msg);
        if (errMsg === undefined || errMsg === "") {
          this.transactionModel.save(null, {connectionID: this.signalRConnectionID});
          // _creditMemoModel.save(null, {
          // 	success: function(model, response) {
          // 		_self.SaveTransactionCompleted(model, response);

          // 	},
          // 	error: function(model, error, response) {
          // 		_self.SaveTransactionError(model, error, response);

          // 	}
          // });
        } else throw errMsg;

        //var ExecThis = function () {
        //    _creditMemoModel.save(null, {
        //        success: function (model, response) {
        //            _self.SaveTransactionCompleted(model, response);

        //        },
        //        error: function (model, error, response) {
        //            _self.SaveTransactionError(model, error, response);

        //        }
        //    });
        //};

        //var gcCartCollection = this.cartCollection.filter(function (model) {
        //    return model.get("ItemType") === Enum.ItemType.GiftCard || model.get("ItemType") === Enum.ItemType.GiftCertificate;
        //});

        //var serialNumberLength = (clonedSerializeCollection) ? clonedSerializeCollection.length : 0

        //if (serialNumberLength != gcCartCollection.length) {
        //    var collection = this.ValidateSerialNumbers(clonedSerializeCollection, this.cartCollection, "");
        //    if (collection.length > 0) {
        //        this.RenderGCList(new BaseCollection(collection));
        //        return;
        //    }
        //    else if (collection.length === 0) {
        //        this.RenderGCList(this.cartCollection);
        //        return;
        //    }
        //}

        //ExecThis();
        return true;
      } catch (err) {
        this.LockTransactionScreen(false);
        navigator.notification.alert(err, null, "Action not Allowed", "OK");
        //console.log(err);
      }
    },

    GetPaymentAccountInfo: function() {
      if (Global.Preference.IsDepositPayment) {
        return "Deposit"
      }
      return "Undeposited";
    },

    GetRefundAmount: function() {
      if(Global.TransactionType === Enum.TransactionType.Return)
      {
          var balance = this.summaryModel.Balance();
          return balance;
      }
      else {
        var refundAmount = (this.cartCollection.total() + this.cartCollection.totalTax());
      var amountPaid = 0;
      var tmpRefundAmt = format("0.0000", refundAmount);
      var newRefundAmount =  1 * this.RoundNumber(tmpRefundAmt, 2);

      var _termDiscAmt = 0,
        _termDiscountModel = this.paymentCollection.find(function(model) {
          return model.get("PaymentType") == "Term Discount";
        });
      if (_termDiscountModel) _termDiscAmt = _termDiscountModel.get("AmountPaid") || 0;

      if (!_termDiscAmt) amountPaid = this.paymentCollection.total();
      else if (_termDiscAmt > 0) amountPaid = this.paymentCollection.total() - _termDiscAmt;
      else amountPaid = this.paymentCollection.total();

      var tmpAmountPaid = format("0.0000", amountPaid);
      var newAmountPaid =  1 * this.RoundNumber(tmpAmountPaid, 2);
      var newRefAmount = amountPaid;
      if (newRefundAmount == newAmountPaid ) {
        newRefAmount =  newAmountPaid;
      }
      else if (newRefundAmount < newAmountPaid) {
          newRefAmount = newRefundAmount;
      }

      //var tmpRefundAmount = this.ComputeTempRefundAmount(refundAmount); //CSL-13457 : 11.21.2013 : Rounding issue. // Removed : CSL-25922 : 03.14.2014
      //console.log('GetRefundAmount >> TotalAmount: ' + refundAmount + ', Payment: ' + amountPaid);

      /*Removed : CSL-25922 : 03.14.2014
            if (tmpRefundAmount == amountPaid) refundAmount = amountPaid;
            else if (refundAmount > amountPaid) refundAmount = amountPaid;
            else refundAmount = tmpRefundAmount;
      return refundAmount;

            */

      // if (refundAmount > amountPaid) refundAmount = amountPaid;
     // refundAmount = this.cartCollection.totalTax() + amountPaid;
      refundAmount =  newRefAmount;
      var tmpRefundAmt = format("0.0000", refundAmount);
      return 1 * this.RoundNumber(tmpRefundAmt, 2); //Rounds the amount to be returned.
      }
    },

    ComputeTempRefundAmount: function(refundAmt) {
      var tmpRefundAmt = format("0.0000", refundAmt);
      tmpRefundAmt = 1 * this.RoundNumber(tmpRefundAmt, 3);

      var newRefundAmt = format("0.0000", tmpRefundAmt);
      newRefundAmt = 1 * this.RoundNumber(newRefundAmt, 2);

      return newRefundAmt;
    },

    GetNewPayments: function() {
      if (this.paymentCollection && this.paymentCollection.length > 0) {
        return this.paymentCollection.GetNewPayments();
        //return this.paymentCollection.where({IsNew: true})
      }
      return null;
    },

    ValidateTransaction: function() {
      if (this.cartCollection.length === 0) {
        navigator.notification.alert("No item(s) to checkout!", null, "Missing Items", "OK");
        this.RemoveScreenOverLay();
        return false;
      } else if (Global.CustomerCode === "") {
        navigator.notification.alert("Please select a Customer.", null, "Customer is Required", "OK");
        this.RemoveScreenOverLay();
        return false;
      }

      switch (Global.TransactionType) {
        case Enum.TransactionType.SalesRefund:
          var _hasGood = this.cartCollection.detect(function(item) { //Originally _hasDefective
            return item.get("Good") > 0; //Originally Defective
          });

          if (!_hasGood) { //Originally _hasDefective
            //console.log("At least one item is required to return.");
            navigator.notification.alert("At least one item is required to return.", null, "Action Not Allowed", "OK");
            this.RemoveScreenOverLay();
            return false;
          }

          break;
        case Enum.TransactionType.Sale:
          total = this.cartCollection.total();
          if (total < 0) {
            //console.log("Negative exchange is not allowed. You may need to create a separate sale or return transaction.");
            navigator.notification.alert("Negative exchange is not allowed. You may need to create a separate sale or return transaction.", null, "Negative Balance", "OK");
            this.RemoveScreenOverLay();
            return false;
          }
          break;
      }
      return true;
    },

    ValidatePayment: function(paymentType) { //17xjj
      if (this.IsValidPaymentType(paymentType)) {
        if (!this.IsFullPayment()) {
          return false;
        }
      } else {
        if (!this.IsFullPayment()) {
          var term = Global.CurrentCustomer.PaymentTermCode;
          if (term == null || term.trim() === "") {
            var _errorMessage = "Customer has no terms, transaction is not allowed without full payment.";
            //console.log(_errorMessage);
            navigator.notification.alert(_errorMessage, null, "Payment Required", "OK");
            return false;
          } else if (Global.TransactionType == Enum.TransactionType.Order ||
            Global.TransactionType == Enum.TransactionType.UpdateOrder ||
            Global.TransactionType == Enum.TransactionType.ConvertQuote ||
            Global.TransactionType == Enum.TransactionType.Suspend) {
            return true;
          } else if (term === "COD") {
            var _errorMessage = "Customer's terms is 'COD', transaction is not allowed without full payment.";
            //console.log(_errorMessage);
            navigator.notification.alert(_errorMessage, null, "Payment Required", "OK");
            this.LockTransactionScreen(false);
            return false;
          }
        }
      }
      return true;
    },

    IsValidPaymentType: function(paymentType) {
      return ((paymentType === Enum.PaymentType.Cash) ||
        paymentType === Enum.PaymentType.Check ||
        paymentType === Enum.PaymentType.CreditCard ||
        paymentType === Enum.PaymentType.Gift ||
        paymentType === Enum.PaymentType.Loyalty);
    },

    //Removes WarehouseCode on Items whose type is Non-Stock or Service to prevent tax calculation.
    RemoveWarehouseCodeByItemType: function(itemList) {
      // if(!itemList || itemList.length == 0) return;

      // var _removeWH = function(attr){
      //     var _type = attr.ItemType;
      //     if(_type == "Non-Stock" || _type == "Service") attr.WarehouseCode = null;
      // }

      // //ARRAY
      // if(itemList instanceof Array){
      //     for(var i = 0; i < itemList.length; i++){
      //         if(itemList[i] instanceof Backbone.Model) _removeWH(itemList[i].attributes);
      //         else _removeWH(itemList[i]);
      //     }
      // }

      // //COLLECTION
      // if(itemList instanceof Backbone.Collection){
      //     itemList.each(function(model){
      //         _removeWH(model.attributes);
      //     });
      // }
    },

    JsonToAspDate: function(value) {
      var oldDate = Date.parse(value);
      var newDate = new Date(oldDate);
      var m = newDate.getMonth();
      var d = newDate.getDate();
      var y = newDate.getFullYear();
      newDate = Date.UTC(y, m, d);
      newDate = "/Date(" + newDate + ")/";
      return newDate;
    },

    ModifyCardPayments: function() {
      var _conditionValue = "",
        _cardTransactionType = "";
      switch (Global.TransactionType) {
        case Enum.TransactionType.Sale:
          _conditionValue = "Authorize";
          //_cardTransactionType = 'Auth/Capture'; break; //replaced by code below : 10.11.13 : CSL-16898
          _cardTransactionType = Shared.GetSaleCreditCardTransactionType();
          break;
        case Enum.TransactionType.Order:
          //_conditionValue = "Auth/Capture"; // replaced by code below : 10.11.13 : CSL-16898
          if (Global.AllowSaleCreditPreference == true) _conditionValue = 'Sale';
          else _conditionValue = 'Auth/Capture';

          _cardTransactionType = 'Authorize';
          break;
        default:
          console.log('no payment modified!');
          return;
          break;
      }

      if (this.paymentCollection) {
        if (this.paymentCollection.length > 0) {
          this.paymentCollection.each(
            function(model) {
              if (model.get("PaymentType") == Enum.PaymentType.CreditCard) {
                if (model.get("CardTransactionType") == _conditionValue || model.get("CardTransactionType") == "Force") {
                  if (model.get("CreditCardIsAuthorizedVerbally")) {
                    switch (Global.TransactionType) {
                      case Enum.TransactionType.Sale:
                        _cardTransactionType = "Force";
                        break;
                      case Enum.TransactionType.Order:
                        _cardTransactionType = "Authorize";
                        break;
                    }
                  }
                  //console.log('FROM: ' + model.get("CardTransactionType") + 'TO: ' + _cardTransactionType);
                  model.set({
                    CardTransactionType: _cardTransactionType
                  });
                }
              }
            });
        }
      }
    },

    CreateInvoice: function(IsPosted) {
      this.InitializeTransaction();
      var _invoiceCollection = new InvoiceCollection(),
          _invoicedetail = new InvoiceDetailCollection(),
          _payments = new PaymentCollection(),
          _coupons = new CouponCollection(),
          _salesreps = new CustomerSalesRepCollection(),
          _serializeLot = "",
          _isRecharged = false,
          self = this;

      if (this.serializeLotCollection) {
        var serialToBeAdded = [];
        //_serializeLot = this.serializeLotCollection.toJSON();
        this.cartCollection.each(function(cart) {
          var serial = self.serializeLotCollection.filter(function(model) {
            return model.get("ItemCode") === cart.get("ItemCode") && model.get("LineNum") === cart.get("LineNum") && model.get("UnitMeasureCode") === cart.get("UnitMeasureCode");
          });

          if (!Shared.IsNullOrWhiteSpace(serial)) {
            serialToBeAdded.push(serial);
          }
        });

        if (serialToBeAdded.length > 0) {
          //var temp = new BaseCollection(_.flatten(serialToBeAdded));

          _serializeLot = _.flatten(serialToBeAdded)
        } else {
          _serializeLot = this.serializeLotCollection.toJSON();
        }
      }

      if (this.couponModel) _coupons.add(this.couponModel);

      var self = this;


      //!SIGNATURE
      Global.SVG_Hold = new Array();
      Global.SVG_ReadyToSave = false;
      var ExecThis = function() {
        if (!this.IsHoldSVG() && Global.SVG_ReadyToSave) {
          this.transactionModel.save(null, { connectionID: this.signalRConnectionID });
        }
      }.bind(this);

      _invoicedetail.add(this.cartCollection.models);

      if (Global.OnRechargeProcess) _invoicedetail.models[0].set({
        SalesPriceRate: Global.GCardAttributes.SalesPriceRate
      });

      var invoiceModel = new BaseModel();
      var shippingDate = new Date();
      shippingDate = this.JsonToAspDate(shippingDate),
        kitItems = new BaseCollection();

      this.cartCollection.each(function(cart) {
        var items = JSON.parse(window.sessionStorage.getItem('kitItems-' + cart.get('LineNum')));
        if (items) {
          kitItems.add(items);
          //window.sessionStorage.removeItem('kitItems-'+cart.get('LineNum'));
        }
      }.bind(this));

      //window.sessionStorage.removeItem('kitItems');
      if (Global.OnRechargeProcess) _isRecharged = true;

      invoiceModel.set({
        BillToCode: Global.CustomerCode,
        POSWorkstationID: Global.POSWorkstationID,
        POSClerkID: Global.Username,
        IsFreightOverwrite: true,
        IsOverrideSalesRep: Global.Preference.IsOverrideSalesRep,
        SignatureSVG: this.ValidateSVG(Global.Signature, ExecThis),
        IsPosted: IsPosted,
        IsTaxByLocation: Global.Preference.TaxByLocation,
        WarehouseCode: Global.Preference.DefaultLocation,
        ShippingDate: shippingDate,
        IsRecharged: _isRecharged,
        PublicNotes: Global.PublicNote.PublicNotes,
        WebSiteCode: Global.Preference.WebSiteCode,
        IsUsePOSShippingMethod: Global.Preference.IsUsePOSShippingMethod,
        POSShippingMethod: Global.Preference.POSShippingMethod
      });
      if (!Shared.IsNullOrWhiteSpace(this.customerPOModel)) {
        invoiceModel.set(self.customerPOModel.attributes);
      }
      _invoiceCollection.add(invoiceModel);


      this.AssignTransactionShipTo(_invoiceCollection.at(0)); //xyxy v.14
      //console.log(_invoiceCollection.at(0));
      this.SetCouponToTransactionHeader(_invoiceCollection.at(0), true);

      if (this.paymentCollection) {
        this.ModifyCardPayments();
        if (this.paymentCollection.length > 0) {
          _payments.add(this.paymentCollection.models);

          _payments.at(0).set({
            POSWorkstationID: Global.POSWorkstationID,
            IsOverrideSalesRep: Global.Preference.IsOverrideSalesRep,
            POSClerkID: Global.Username,
            Mode: 'Payment'
          });

          //!SIGNATURE
          for (var i = 0; i < _payments.length; i++) {
            if (_payments.at(i).get('SignatureSVG')) {
              var _svgtmp = _payments.at(i).get('SignatureSVG');
              _payments.at(i).set({
                SignatureSVG: this.ValidateSVG(_svgtmp, ExecThis)
              });
            }
          }

        }
      }

      // _invoicedetail.each(function(model) {
      //   var taxCode = window.sessionStorage.getItem("selected_taxcode");
      //   taxCode = (taxCode) ? taxCode : Global.ShipTo.TaxCode;
      //   model.set("TaxCode", taxCode);
      // });

      this.transactionModel.set({
        "Invoices": _invoiceCollection.toJSON(),
        "InvoiceDetails": _invoicedetail.toJSON(),
        "Payments": _payments.toJSON(),
        "Coupons": _coupons.toJSON(),
        "SerialLotNumbers": _serializeLot,
        "KitDetails": kitItems.toJSON(),
        "SalesRep": (Global.SalesRepList == null) ? null : Global.SalesRepList
      });

      this.RemoveWarehouseCodeByItemType(this.transactionModel.get("InvoiceDetails"));

      var isCreateCustomer = "false";
      this.transactionModel.url = Global.ServiceUrl + Service.SOP + Method.CREATEINVOICE + isCreateCustomer + '/' + Global.GUID;


      try {
        //use save method of model to save data to the server then alert the created invoice code
        this.LockTransactionScreen(true, "Saving...");
        Global.SVG_ReadyToSave = true;
        this.ResetCustomerPODetails();

        var msg = "Error saving the Invoice. The following items do not have the same number of serial numbers with the shipped quantity.";
        var errMsg = this.ValidateSerialLot(this.serializeLotCollection, this.cartCollection, msg);

        if (errMsg === undefined || errMsg === "") ExecThis();
        else throw errMsg;
        var gcCartCollection = this.cartCollection.filter(function(model) {
          return model.get("ItemType") === Enum.ItemType.GiftCard || model.get("ItemType") === Enum.ItemType.GiftCertificate;
        });

        //var serialNumberLength = (this.serializeLotCollection) ? this.serializeLotCollection.length : 0

        //if (serialNumberLength != gcCartCollection.length) {
        //    var collection = this.ValidateSerialNumbers(this.serializeLotCollection, this.cartCollection, "");
        //    if (collection.length > 0) {
        //        this.RenderGCList(new BaseCollection(collection));
        //        return;
        //    }else if (collection.length === 0) {
        //        this.RenderGCList(this.cartCollection);
        //        return;
        //    }
        //}

        //ExecThis();
      } catch (err) {
        this.LockTransactionScreen(false);
        navigator.notification.alert(err, null, "Action not allowed", "OK");
        //console.log(err);
      }


    },

    CreateOrder: function() {
      this.InitializeTransaction();
      var _salesOrderCollection = new SalesOrderCollection();
      var _salesOrderDetailCollection = new SalesOrderDetailCollection();
      var _payments = new PaymentCollection();
      var _coupons = new CouponCollection();
      var _salesreps = new CustomerSalesRepCollection();
      if (this.couponModel) _coupons.add(this.couponModel);

      var self = this;

      //!SIGNATURE
      Global.SVG_Hold = new Array();
      Global.SVG_ReadyToSave = false;
      var ExecThis = function() {
        if (!this.IsHoldSVG() && Global.SVG_ReadyToSave) {
          this.transactionModel.save(null, { connectionID: this.signalRConnectionID });
        }
      }.bind(this);

      //this.AssignNoteItem();
      var kitItems = new BaseCollection();
      this.cartCollection.each(function(cart) {
        var items = JSON.parse(window.sessionStorage.getItem('kitItems-' + cart.get('LineNum')))
        if (items) {
          kitItems.add(items);
          //window.sessionStorage.removeItem('kitItems-'+cart.get('LineNum'));
        }
      }.bind(this));

      _salesOrderDetailCollection.add(this.cartCollection.models);
      var salesOrderModel = new BaseModel();
      var shippingDate = new Date();
      shippingDate = this.JsonToAspDate(shippingDate),
        salesOrderModel.set({
          BillToCode: Global.CustomerCode,
          POSWorkstationID: Global.POSWorkstationID,
          POSClerkID: Global.Username,
          IsFreightOverwrite: true,
          IsOverrideSalesRep: Global.Preference.IsOverrideSalesRep,
          //SignatureSVG: Global.Signature,
          SignatureSVG: this.ValidateSVG(Global.Signature, ExecThis),
          IsTaxByLocation: Global.Preference.TaxByLocation,
          WarehouseCode: Global.Preference.DefaultLocation,
          PublicNotes: Global.PublicNote.PublicNotes,
          ShippingDate: shippingDate,
          WebSiteCode: Global.Preference.WebSiteCode,
          IsUsePOSShippingMethod: Global.Preference.IsUsePOSShippingMethod,
          POSShippingMethod: Global.Preference.POSShippingMethod
        });
      if (!Shared.IsNullOrWhiteSpace(this.customerPOModel)) {
        salesOrderModel.set(self.customerPOModel.attributes);
      }
      _salesOrderCollection.add(salesOrderModel);

      this.AssignTransactionShipTo(_salesOrderCollection.at(0));

      this.SetCouponToTransactionHeader(_salesOrderCollection.at(0), false);

      if (this.paymentCollection) {
        this.ModifyCardPayments();
        if (this.paymentCollection.length > 0) {
          _payments.add(this.paymentCollection.models);
        }
        //!Signature for Payments..
        for (var i = 0; i < _payments.length; i++) {
          if (_payments.at(i).get('SignatureSVG')) {
            var _svgtmp = _payments.at(i).get('SignatureSVG');
            _payments.at(i).set({
              SignatureSVG: this.ValidateSVG(_svgtmp, ExecThis)
            });
          }
        }
      }

      // _salesOrderDetailCollection.each(function(model) {
      //   var taxCode = window.sessionStorage.getItem("selected_taxcode");
      //   taxCode = (taxCode) ? taxCode : Global.ShipTo.TaxCode;

      //   model.set("TaxCode", taxCode);
      // });

      this.transactionModel.set({
        "SalesOrders": _salesOrderCollection.toJSON(),
        "SalesOrderDetails": _salesOrderDetailCollection.toJSON(),
        "Payments": _payments.toJSON(),
        "Coupons": _coupons.toJSON(),
        "KitDetails": kitItems.toJSON(),
        "SalesRep": (Global.SalesRepList == null) ? null : Global.SalesRepList
      });

      this.RemoveWarehouseCodeByItemType(this.transactionModel.get("SalesOrderDetails"));

      var isCreateCustomer = "false";
      this.transactionModel.url = Global.ServiceUrl + Service.SOP + Method.CREATESALESORDER + isCreateCustomer + "/" + Global.GUID;
      //use save method of model to save data to the server then alert the created invoice code

      this.LockTransactionScreen(true, "Saving...");
      Global.SVG_ReadyToSave = true;
      this.ResetCustomerPODetails();
      ExecThis(); //this.transactionModel.save(this.transactionModel);
    },

    CreateQuote: function() {
      this.InitializeTransaction();
      var _salesOrderCollection = new SalesOrderCollection();
      var _salesOrderDetailCollection = new SalesOrderDetailCollection(),
        kitItems = new BaseCollection();
      var _salesreps = new CustomerSalesRepCollection();

      this.cartCollection.each(function(cart) {
        var items = JSON.parse(window.sessionStorage.getItem('kitItems-' + cart.get('LineNum')));
        if (items) {
          kitItems.add(items);
          //window.sessionStorage.removeItem('kitItems-'+cart.get('LineNum'));
        }
      }.bind(this));

      this.RemoveCouponInfoFromSOPDetail();
      _salesOrderDetailCollection.add(this.cartCollection.models);

      var self = this;
      var salesOrderModel = new BaseModel();
      var shippingDate = new Date();
      shippingDate = this.JsonToAspDate(shippingDate);
      salesOrderModel.set({
        BillToCode: Global.CustomerCode,
        POSWorkstationID: Global.POSWorkstationID,
        POSClerkID: Global.Username,
        IsFreightOverwrite: true,
        IsOverrideSalesRep: Global.Preference.IsOverrideSalesRep,
        IsTaxByLocation: Global.Preference.TaxByLocation,
        WarehouseCode: Global.Preference.DefaultLocation,
        PublicNotes: Global.PublicNote.PublicNotes,
        ShippingDate: shippingDate,
        WebSiteCode: Global.Preference.WebSiteCode,
        IsUsePOSShippingMethod: Global.Preference.IsUsePOSShippingMethod,
        POSShippingMethod: Global.Preference.POSShippingMethod
      });
      if (!Shared.IsNullOrWhiteSpace(this.customerPOModel)) {
        salesOrderModel.set(self.customerPOModel.attributes);
      }
      _salesOrderCollection.add(salesOrderModel);

      this.AssignTransactionShipTo(_salesOrderCollection.at(0));

      // _salesOrderDetailCollection.each(function(model) {
      //   var taxCode = window.sessionStorage.getItem("selected_taxcode");
      //   taxCode = (taxCode) ? taxCode : Global.ShipTo.TaxCode;
      //   model.set("TaxCode", taxCode);
      // });

      this.transactionModel.set({
        "SalesOrders": _salesOrderCollection.toJSON(),
        "SalesOrderDetails": _salesOrderDetailCollection.toJSON(),
        "KitDetails": kitItems.toJSON(),
        "SalesRep": (Global.SalesRepList == null) ? null : Global.SalesRepList
      });

      this.RemoveWarehouseCodeByItemType(this.transactionModel.get("SalesOrderDetails"));

      this.transactionModel.url = Global.ServiceUrl + Service.SOP + Method.CREATEQUOTE + "/" + Global.GUID;

      //use save method of model to save data to the server then alert the created invoice code
      this.LockTransactionScreen(true, "Saving...");
      this.transactionModel.save(null, {connectionID: this.signalRConnectionID});

      this.ResetCustomerPODetails();
    },


    UpdateQuote: function(salesOrderCode) {

      this.InitializeTransaction();
      var _salesOrderCollection = new SalesOrderCollection();
      var _salesOrderDetailCollection = new SalesOrderDetailCollection();
      //kitItemDetails = JSON.parse(window.sessionStorage.getItem('kitItems'));

      //window.sessionStorage.removeItem('kitItems');

      var kitItems = new BaseCollection();

      this.cartCollection.each(function(cart) {
        var items = JSON.parse(window.sessionStorage.getItem('kitItems-' + cart.get('LineNum')))
        if (items) {
          kitItems.add(items);
          //window.sessionStorage.removeItem('kitItems-'+cart.get('LineNum'));
        }
      }.bind(this));

      var _self = this;
      _salesOrderCollection.add(Global.TransactionObject);
      _salesOrderCollection.at(0).set({
        POSWorkstationID: Global.POSWorkstationID,
        POSClerkID: Global.Username,
        IsFreightOverwrite: true,
        IsOverrideSalesRep: false,
        IsTaxByLocation: Global.Preference.TaxByLocation,
        PublicNotes: Global.PublicNote.PublicNotes,
        WebSiteCode: Global.Preference.WebSiteCode,
        IsUsePOSShippingMethod: Global.Preference.IsUsePOSShippingMethod,
        POSShippingMethod: Global.Preference.POSShippingMethod
      });
      if (!Shared.IsNullOrWhiteSpace(this.customerPOModel)) {
        _salesOrderCollection.at(0).set(_self.customerPOModel.attributes);
      }

      this.AssignTransactionShipTo(_salesOrderCollection.at(0));
      _salesOrderDetailCollection.add(this.cartCollection.models);

      // _salesOrderDetailCollection.each(function(model) {
      //   var taxCode = window.sessionStorage.getItem("selected_taxcode");
      //   taxCode = (taxCode) ? taxCode : Global.ShipTo.TaxCode;
      //   model.set("TaxCode", taxCode);
      // });

      this.transactionModel.set({
        "SalesOrders": _salesOrderCollection.toJSON(),
        "SalesOrderDetails": _salesOrderDetailCollection.toJSON(),
        "KitDetails": kitItems.toJSON()
      });

      this.RemoveWarehouseCodeByItemType(this.transactionModel.get("SalesOrderDetails"));
      this.transactionModel.url = Global.ServiceUrl + Service.SOP + Method.UPDATEQUOTE + Global.GUID;

      this.LockTransactionScreen(true, "Saving...");
      this.transactionModel.save(null, {connectionID: this.signalRConnectionID});
      this.ResetCustomerPODetails();

    },

    CreateInvoicePayment: function(invoiceCode) {
      var payments = this.GetNewPayments();

      if (payments && payments.length > 0) {
        var _payments = new PaymentCollection();
        var _self = this;

        _payments.add(payments);

        var _salesPaymentModel = new SalesPaymentModel();
        _salesPaymentModel.on('before-save', this.OnTransactionModelBeforeSave, this);
        _salesPaymentModel.model = _payments;

        //!SIGNATURE
        Global.SVG_Hold = new Array();
        Global.SVG_ReadyToSave = false;

        var ExecThis = function() {
          if (!_self.IsHoldSVG() && Global.SVG_ReadyToSave) {

            _salesPaymentModel.save(null, {
              timeout: 0,
              success: function(model, response) {
                _self.SaveTransactionCompleted(model, response);
              },
              error: function(model, error, response) {
                _self.SaveTransactionError(model, error, response);
              }
            });

          }
        }

        for (var i = 0; i < _payments.length; i++) {
          if (_payments.at(i).get('SignatureSVG')) {
            var _svgtmp = _payments.at(i).get('SignatureSVG');
            _payments.at(i).set({
              SignatureSVG: this.ValidateSVG(_svgtmp, ExecThis)
            });
          }
        }
        //!

        this.LockTransactionScreen(true, "Saving...");
        _salesPaymentModel.url = Global.ServiceUrl + Service.SOP + Method.CREATEINVOICEPAYMENT + invoiceCode;
        Global.SVG_ReadyToSave = true;
        ExecThis();
      }
    },

    SetCouponToTransactionHeader: function(header, isSale) {
      if (this.couponModel) {
        header.set({
          CouponCode: this.couponModel.get("CouponCode"),
          CouponComputation: this.couponModel.get("CouponComputation"),
          CouponDiscountAmount: this.couponModel.get("DiscountAmount"),
          CouponDiscountIncludesFreeShipping: this.couponModel.get("DiscountIncludesFreeShipping"),
          CouponDiscountPercent: this.couponModel.get("DiscountPercent"),
          CouponDiscountType: this.couponModel.get("DiscountType"),
          CouponID: this.couponModel.get("CouponID"),
          CouponRequiresMinimumOrderAmount: this.couponModel.get("RequiresMinimumOrderAmount"),
          CouponType: this.couponModel.get("CouponType"),
          CouponUsage: this.couponModel.get("CouponUsage"),
        });

        if (!isSale) {
          if (this.couponModel.get("DiscountIncludesFreeShipping")) {
            header.set({
              CouponDiscountIncludesFreeShipping: 1
            })
          } else {
            header.set({
              CouponDiscountIncludesFreeShipping: 0
            })
          }
        }
      } else {
        header.set({
          CouponCode: null,
          CouponComputation: null,
          CouponDiscountAmount: null,
          CouponDiscountIncludesFreeShipping: null,
          CouponDiscountPercent: null,
          CouponDiscountType: null,
          CouponID: null,
          CouponRequiresMinimumOrderAmount: null,
          CouponType: null,
          CouponUsage: null,
        });
      }
    },

    RemoveFailedPayment: function() { //jj
      if (Global.TransactionType != Enum.TransactionType.SalesRefund) {
        var lastPayment = this.paymentCollection.length - 1;
        this.paymentCollection.remove(this.paymentCollection.at(lastPayment));
      }
    },

    GetSerialErrorMessage: function(itemTransaction) {
      var serial = "";
      if (itemTransaction === "Credit Memo") {
        if (this.serializeLotCollection) {
          this.serializeLotCollection.comparator = function(model) {
            return model.get("ItemCode");
          };

          this.serializeLotCollection.sort({
            silent: true
          });

          var self = this,
            toBeDeletedSerialLot = [];
          this.cartCollection.each(function(cart) {
            self.serializeLotCollection.each(function(serial) {
              if (cart.get("Good") > 0) { //Originally Defective
                if (serial.get("ItemCode") === cart.get("ItemCode") && serial.get("LineNum") === cart.get("LineNum")) {
                  if (serial.get("IsIncluded")) {
                    toBeDeletedSerialLot.push(serial);
                  }
                }
              }
            });
          });

          var clonedSerializeCollection = new BaseCollection();

          clonedSerializeCollection.reset(toBeDeletedSerialLot);
          serial = clonedSerializeCollection;
        }
      } else {
        serial = this.serializeLotCollection;
      }


      var msg = "Error saving the " + itemTransaction + ". The following items do not have the same number of serial numbers with the shipped quantity.";
      return errMsg = this.ValidateSerialLot(serial, this.cartCollection, msg);
    },

    AllowToCompleteTransaction: function() {
      var errMsg = null;
      switch (Global.TransactionType) {
        case Enum.TransactionType.Sale:
        case Enum.TransactionType.UpdateInvoice:
        case Enum.TransactionType.ConvertOrder:
        case Enum.TransactionType.ResumeSale:
          errMsg = this.GetSerialErrorMessage("Invoice");
          break;
          //case Enum.TransactionTypeConvertOrder:
        case Enum.TransactionType.Return:
        case Enum.TransactionType.SalesRefund:
          errMsg = this.GetSerialErrorMessage("Credit Memo");
          break;
        default:
          return true;
      }
      if (!errMsg) return true;
      Shared.ShowNotification(errMsg, true, 5000);
      return false;
    },

    AllowToOpenCashDrawer: function(collection) { //jjx15
      if (collection != undefined) {
        Global.HasInvalidPayment = (Global.InvalidPaymentModel) ? true : false;

        var hasOtherPayments = collection.filter(function(model) {
          return (model.get("PaymentType") !== Enum.PaymentType.CreditCard && model.get("PaymentType") !== Enum.PaymentType.Gift && model.get("PaymentType") !== Enum.PaymentType.Loyalty);
        });

        var hasCardPayments = collection.filter(function(model) {
          return (model.get("PaymentType") == Enum.PaymentType.CreditCard || model.get("PaymentType") == Enum.PaymentType.Gift || model.get("PaymentType") == Enum.PaymentType.Loyalty);
        });

        if (!Global.HasInvalidPayment) {
          switch (Global.TransactionType) {
            case Enum.TransactionType.SalesPayment:
            case Enum.TransactionType.UpdateInvoice:
            case Enum.TransactionType.UpdateOrder:
            case Enum.TransactionType.ConvertOrder:
            case Enum.TransactionType.Resume:
              var newCardPayments = collection.filter(function(model) {
                return (model.get("PaymentType") == Enum.PaymentType.CreditCard || model.get("PaymentType") == Enum.PaymentType.Gift || model.get("PaymentType") == Enum.PaymentType.Loyalty) && model.get("IsNew") == true;
              });

              var newOtherPayments = collection.filter(function(model) {
                return (model.get("PaymentType") !== Enum.PaymentType.CreditCard && model.get("PaymentType") !== Enum.PaymentType.Gift && model.get("PaymentType") !== Enum.PaymentType.Loyalty) && model.get("IsNew") == true;
              });

              this.ValidateAllowOpenCashDrawer(newCardPayments, newOtherPayments, collection);
              break;
            default:
              this.ValidateAllowOpenCashDrawer(hasCardPayments, hasOtherPayments, collection);
              break;
          }
        } else {
          this.ValidateAllowOpenCashDrawer(hasCardPayments, hasOtherPayments, collection);
        }
      }

      //console.log('Global.isOkToOpenCashDrawer : ' + Global.isOkToOpenCashDrawer)
    },

    ValidateAllowOpenCashDrawer: function(cardPayments, otherPayments, collection) {
      if (cardPayments.length >= 0 && otherPayments.length === 0) Global.isOkToOpenCashDrawer = false;
      else if (collection.length === 0) Global.isOkToOpenCashDrawer = false;
      else if (cardPayments.length >= 0 && otherPayments.length > 0) Global.isOkToOpenCashDrawer = true;

      //if (cardPayments.length > 0) {
      //    Global.isOkToOpenCashDrawer = false;
      //} else if(cardPayments.length === 0 && otherPayments.length > 0) {
      //    Global.isOkToOpenCashDrawer = true;
      //} else if (collection.length === 0) {
      //    Global.isOkToOpenCashDrawer = false;
      //}
    },

    SaveTransactionCompleted: function(model, response) {
      var self = this;
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator(); //remove activity indicator
      var promptToPrint = Global.Preference.PromptToPrintReceipt;

      this.UpdateLoggedReasons(response);
      this.IsSavingTransactionOngoing = false;

      /*var DrawerKickWithValidation = function() {
        self.UpdateDrawerBalance();
      };
      var DrawerKickAndPrint = function() {
        self.PrintAndEmailTransaction(response.Invoices.InvoiceCode);
      };*/

      this.IsReloadedTransaction = false;

      this.LogWithTime("Transaction Saved!");
      this.ToggleInprogressOverlay();

      if (response.ErrorMessage) {
        //Reset Signature to ask for it whenever the error occurs again.
        if (response.ErrorMessage === "This customer is over the credit limit.") Global.Signature = null;
        var cardErrorMsg = "Unable to process the following credit card payments"
        var n = response.ErrorMessage.indexOf(cardErrorMsg);
        navigator.notification.alert(response.ErrorMessage, null, "Error Saving", "OK", true);
        this.LockTransactionScreen(false);
        if (n >= 0) this.ReloadTransaction();
      } else if (this.CheckIfCardHasError(response)) {
        Global.Signature = null;
        Global.RecentPaymentArray = response.Payments;
        Global.InvalidPaymentModel = this.GetInvalidPayment(response.Payments);

        var tmpCollection = new BaseCollection(this.GetResponseCollection(response));

        var cardErrorMsg = tmpCollection.models[0].get('Message');
        navigator.notification.alert(cardErrorMsg, null, "Error Saving", "OK", true);
        this.ReloadTransaction(tmpCollection.models[0]);
      } else {
        if (Global.OnRechargeProcess) {
          Global.OnRechargeProcess = false;
          this.ClearTransaction();
          this.LoadInvoiceForResume(new BaseModel(response.Invoices[0]));
          return;
        }

        if (Global.TransactionType == Enum.TransactionType.Sale || Global.TransactionType == Enum.TransactionType.ConvertOrder) {
          var invoice = response.Invoices[0];
//          if (invoice.SurplusMessage) navigator.notification.alert(invoice.SurplusMessage, null, "Surplus Amount", "OK", true);
        }

        this.UpdateDrawerBalance();
        Global.PaymentType = "";
        Global.SelectedPaymentType = "";

       if (this.paymentCollection) {
              var self = this;
              if (this.paymentCollection.length > 0) {
                this.paymentCollection.each(function(model) {
                  var _sign = model.get("SignatureSVG");
                  if (_sign) self.DeleteSavedSignature(_sign);
                }, this)
              }
              this.paymentCollection.reset();
            }

        if (this.refundCollection) {
              this.refundCollection.reset();
            }

        if (Global.TransactionType == Enum.TransactionType.Return) this.PrintAndEmailTransaction(response.Invoices[0].InvoiceCode);

        if (promptToPrint) {
          //DrawerKickAndPrint();
          if (!Global.PrintOptions.PrintReceipt && !Global.PrintOptions.EmailReceipt) {
            if (Global.Preference.AutoSignOutUser) this.SignOut();
          }
        } else {
          if (!Global.PrintOptions.PrintReceipt && Global.PrintOptions.EmailReceipt) {
            if (Global.Preference.AutoSignOutUser) this.SignOut();
          }
        }
		// if(!Global.Preference.AutoSignOutUser){
		// 	this.ClearTransaction();
		// } else {
		// 	this.ClearTransactionWithoutInitalization();
		// 	this.StopSignalR();
		// }
      }

    },

    // begin : CSL-1961 : Cancel Transaction when card payment is rejected
    CheckIfCardHasError: function(response) {
      var _collection = new InvoiceCollection();
      _collection.reset(this.GetResponseCollection(response));
      if (_collection.length === 0) return false;
      if (!_collection.models[0].get('Message')) return false;
      return true;
    },

    GetResponseCollection: function(response) {
      switch (Global.TransactionType) {
        case Enum.TransactionType.Sale:
        case Enum.TransactionType.SalesPayment:
        case Enum.TransactionType.UpdateInvoice:
        case Enum.TransactionType.ResumeSale:
        case Enum.TransactionType.ConvertOrder:
          return response.Invoices;
          break;

        case Enum.TransactionType.Order:
        case Enum.TransactionType.UpdateOrder:
        case Enum.TransactionType.ConvertQuote:
          return response.SalesOrders;
          break;
      }
    },

    ReloadTransaction: function(model) {
      var mdl = new BaseModel();
      Global.PreviousTransactionType = Global.TransactionType;

      this.IsReloadedTransaction = true;

      if (this.refundCollection && this.IsReturn()) this.refundCollection.reset(); // CSL-24589

      switch (Global.TransactionType) {
        case Enum.TransactionType.Sale:
          this.LoadInvoiceForResume(model);
          break;
        case Enum.TransactionType.UpdateInvoice:
          this.LoadInvoiceForResume(model);
          break;
        case Enum.TransactionType.ResumeSale:
          this.LoadInvoiceForResume(model);
          break;
        case Enum.TransactionType.SalesPayment:
          mdl = Global.PaymentInfoMdl;
          this.LoadInvoiceForApplyPayment(mdl);
          break;
          //case Enum.TransactionType.SalesRefund 	: mdl = Global.RefundModel; this.LoadInvoiceForReturnRefund( mdl ); break;
        case Enum.TransactionType.ConvertOrder:
          Global.TransactionType = Enum.TransactionType.UpdateInvoice;
          this.LoadInvoiceForResume(model);
          break;
          //case Enum.TransactionType.SalesRefund   : this.LoadInvoiceForApplyPayment(model); break;

        case Enum.TransactionType.Order:
          this.LoadOrderForUpdateOrder(model);
          break;
        case Enum.TransactionType.UpdateOrder:
          this.LoadOrderForUpdateOrder(model);
          break;
          //case Enum.TransactionType.ConvertOrder 	: this.LoadOrderForConvertOrder(model); break;
        case Enum.TransactionType.ConvertQuote:
          this.LoadOrderForUpdateOrder(model);
          break;
        default:
          console.log(Global.TransactionType + ' no handler for creditcard payment error.');
          break;
          //return response.SalesOrders; break;
      }
    },

    GetInvalidPayment: function(paymentsArray) {
      var indxTobeRmved = 0,
        highestVal = 0;
      //finds invalid the Payment.
      if (Shared.IsNullOrWhiteSpace(paymentsArray)) return null;
      for (var i = 0; i < paymentsArray.length; i++) {
        if (paymentsArray[i].ReceiptCode && paymentsArray[i].ReceiptCode.length > 0) {
          if (paymentsArray[i].ReceiptCode !== null && paymentsArray[i].ReceiptCode !== undefined && paymentsArray[i].ReceiptCode.length > 0) {
            if (paymentsArray[i].ReceiptCode.substr(0, 5) === "AUTH-") {
              var tmpNum = parseFloat(paymentsArray[i].ReceiptCode.substr(5, paymentsArray[i].ReceiptCode.length))
              if (tmpNum > highestVal) {
                highestVal = tmpNum;
                indxTobeRmved = i;
              }
            }
          }
        }
      }
      return paymentsArray[indxTobeRmved];
    },

    RemoveCreditMemo: function(payments) {
      if (!this.paymentCollection) return;
      for (var indx = 0; indx < payments.length; indx++) {
        if (payments[indx].PaymentType != Enum.PaymentType.CreditMemo) {
          if (payments[indx].AmountPaid > 0) payments[indx].AmountPaid = payments[indx].AppliedAmountRate;
          this.paymentCollection.add(payments[indx]);
        }
      }
    },

    RemoveInvalidPayment: function(paymentsArray, isInvoice) {
      var _tmpCollection = new BaseCollection();
      var i = 0,
        _invalidModels = [];
      _tmpCollection.reset(paymentsArray);
      _tmpCollection.each(function(model) {
        if (Global.TransactionType === Enum.TransactionType.SalesRefund) {
          if (model.get('AppliedAmountRate') == 0) {
            _invalidModels[i] = model;
            i++;
            return;
          }
        }

        if (model.get("PaymentType") == "Credit Card") {
          if (isInvoice) { //for invoice
            if (model.get("CreditCardIsSold") == true || (model.get("CreditCardIsAuthorized") == true && (model.get("CreditCardIsCaptured") === true || model.get("CreditCardIsForced") == true))) {} else if (model.get("Mode") == "Refund") {} else {
              _invalidModels[i] = model;
              i++;
            }
          } else { //for orders
            if (model.get("CreditCardIsAuthorized") == false) {
              _invalidModels[i] = model;
              i++;
            }
          }
        }
      });

      if (_invalidModels.length == 0) return _tmpCollection.toJSON();

      for (var j = 0; j < _invalidModels.length; j++) {
        _tmpCollection.remove(_invalidModels[j]);
      }

      return _tmpCollection.toJSON();
    },
    // end : CSL-1961

    ResetPayment: function() {
      this.paymentCollection.reset();
    },

    SaveTransactionError: function(model, error, response) {
      //this.StopSignalR(); //Stop SignalR Connection in case of error.
      this.IsSavingTransactionOngoing = false;
      this.ToggleInprogressOverlay();

      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator(); //remove activity indicator
      model.RequestError(error, "Error", "An error was encountered while creating the transaction. Please try again later.");
      this.LockTransactionScreen(false);
    },

    LockTransactionScreen: function(lock, message) {
      switch (lock) {
        case true:
          if ($("#main-transaction-blockoverlay").is(":hidden")) $("#main-transaction-blockoverlay").show();
          else $("#main-transaction-blockoverlay").show();
          target = document.getElementById('main-transaction-page');
          this.ShowActivityIndicator(target);
          $("<h5>" + message + "</h5>").appendTo($("#spin"));
          break;
        default:
          $("#main-transaction-blockoverlay").hide();
          this.HideActivityIndicator();
          break;
      }
    },

    AutoSignOutUser: function() {
      var AutoLogout = Global.Preference.AutoSignOutUser;

      if (AutoLogout) {
        this.SignOut();
      }
      return;
    },

    OpenCashDrawer: function() {
      if (printerTool) {
        printerTool.openCashDrawer(Global.Preference.DefaultPrinter).then(function() {
          console.log("DrawerKick!");
        })
      }
    },

    SignOut: function() {
      this.StopSignalR();
      this.ShowActivityIndicator();
      $("<h5>Logging Out...</h5>").appendTo($("#spin"));

      var _self = this;
      var _model = new BaseModel();
      _model.url = Global.ServiceUrl + Service.POS + Method.SIGNOUT;
      _model.save(null, {
        wait: true,
        success: function() {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          var _url = window.location.href.split('#')[0];
          _url = _url + "#login";
          window.location.href = _url;
          _self.HideActivityIndicator();
        },
        error: function(model, error, response) {
          _self.HideActivityIndicator();
          model.RequestError(error, "Error Logging out.");
        }
      });
    },

    buttonCancel_Tap: function(e) {
      e.preventDefault();
      Shared.FocusToItemScan();
      //this.VoidTransactionWithValidation();
      this.PromptVoidTransaction();
    },

    buttonReviewTransaction_Tap: function(e) {
      e.preventDefault();
      this.ShowReviewTransactionsView();
    },

    ShowReviewTransactionsView: function(isPrintPickNote) {
      if (this.HasOpenTransaction()) {
        //console.log("Please complete or void the current transaction first.");
        Shared.FocusToItemScan();
        navigator.notification.alert("Please complete or void the current transaction first.", null, "Action Not Allowed", "OK");
        return;
      }

      Global.LookupMode = isPrintPickNote ? Enum.LookupMode.Order : Enum.LookupMode.Invoice;

      if (this.reviewTransactionsView) {
        this.reviewTransactionsView.pickUpStage = isPrintPickNote ? 1 : 0;
        this.reviewTransactionsView.clearDateOnLoad = isPrintPickNote;
        this.reviewTransactionsView.Show();
      } else {
        this.InitializeReviewTransaction(isPrintPickNote);
      }
    },

    AddCashPayment: function() { //111
      Global.IsCreateRefund = true;
      Global.PaymentType = Enum.PaymentType.Cash;
      this.ShowPaymentForm();
    },

    AddCheckPayment: function() {
      Global.IsCreateRefund = true;
      Global.PaymentType = Enum.PaymentType.Check;
      this.ShowPaymentForm();
    },

    AddCreditCardPayment: function() {
      Global.IsCreateRefund = true;
      Global.OfflineCharge = false;
      Global.PaymentType = Enum.PaymentType.CreditCard;
      this.ShowPaymentForm();
    },


    AddOfflinePayment: function() {
      debugger;
      Global.IsCreateRefund = true;
      Global.OfflineCharge = true;
      Global.PaymentType = Enum.PaymentType.CreditCard;
      this.ShowPaymentForm();
    },


    AddOnAccount: function() {
      if (Global.TransactionType === Enum.TransactionType.ConvertQuote) {
        Global.HasChanges = true;
      }

      Global.IsCreateRefund = false;
      Global.PaymentType = "Partial";
      this.CreateTransaction("Partial");
    },

    AddSuspend: function() {
      Global.IsPosted = false;
      Global.TransactionType = Enum.TransactionType.Suspend;
      Global.PaymentType = "Partial";
      this.CreateTransaction("Partial");
    },

    AddGift: function() {
      Global.PaymentType = Enum.PaymentType.Gift;
      this.ShowPaymentForm();
    },

    AddLoyalty: function() {
      Global.PaymentType = Enum.PaymentType.Loyalty;
      this.ShowPaymentForm();
    },

    ShowPaymentForm: function() { //xxx

      if (Global.TransactionType === Enum.TransactionType.SalesRefund || Global.TransactionType === Enum.TransactionType.Return) {
        //Global.ReasonCode.Return = false;
        if(Global.DejavooEnabled || Global.OfflineCharge || Global.PaymentType == Enum.PaymentType.Cash) this.CreateTransaction();
        else if (Global.PaymentType == Enum.PaymentType.CreditCard) this.InitializePayment();//  this.CreateTransaction();
        else this.CreateTransaction();
         return;        
       
      }

      if (this.cartCollection.length > 0) {
        if (this.GetTransactionBalance() > 0) {
          switch (Global.TransactionType) {
            case Enum.TransactionType.Return:
              console.log("Payments are not allowed on Return transactions.");
              //     navigator.notification.alert("Payments are not allowed on Return transactions.",null,"Cannot Create Payment","OK");
              break;
            case Enum.TransactionType.SalesCredit:
              console.log("Payments are not allowed on Credit transactions.");
              // navigator.not ification.alert("Payments are not allowed on Credit transactions.",null,"Cannot Create Payment","OK");
              break;
            default:
              this.InitializePayment();
              break;
          }
        } else {
          if (!Global.HasChanges && Global.TransactionType != Enum.TransactionType.ConvertOrder && Global.TransactionType != Enum.TransactionType.UpdateInvoice) {
            navigator.notification.alert("The transaction is fully paid and there are no changes made.", null, "No Changes", "OK");
            this.RemoveScreenOverLay();
            return;
          }

          _naviThis = this;
          //console.log("The transaction is fully paid. Do you want to save it?");
          navigator.notification.confirm("The transaction is fully paid. Do you want to save it?", _saveTransaction, "Save Transaction", ['Yes', 'No']);

          //console.log("Payments can only be made for transactions that has an outstanding balance.")
          //navigator.notification.alert("Payments can only be made for transactions that has an outstanding balance.",null,"Cannot Create Payment","OK");
        }
      } else {
        console.log("There are no items in your cart.")
        navigator.notification.alert("There are no items in the transaction.", null, "No Items", "OK");
      }
      //    this.LockTransactionScreen(false, "");

    },

    InitializePayment: function() {
      if (!this.paymentCollection) {
        this.InitializePaymentCollection();
      }

      if (this.paymentView) {
        this.paymentView.Show(this.GetTransactionBalance());
      } else {
        var self = this;
        this.paymentView = new PaymentView({
          el: $("#paymentContainer"),
          collection: this.paymentCollection,
          balance: this.GetTransactionBalance(),
          showForm: true,
          GetTransactionBalance: function() {
            return self.GetTransactionBalance();
          }
        });
        //signature triggers
        this.paymentView.on("allowUserToAttachSign", this.GetAttachedSignature, this);
        this.paymentView.on("cancelSignRetrieval", this.StopRetrieval, this);
        this.paymentView.on("deleteSavedSignature", this.DeleteSavedSignature, this);
        //Pin payment triggers
        this.paymentView.on('askToEnterPIN', this.FetchGiftDetails, this);
        this.paymentView.on('stopAskingPIN', this.StopPINRetrieval, this);
        this.paymentView.on("showDejavooProgress", this.ShowDejavooProgress, this);
        this.paymentView.on("clearTransaction", this.ClearTransaction, this);
        this.paymentView.on("creditRefund", this.CreditRefund, this);
        //this.paymentView.on("formClosed", this.PaymentCancelled, this)
      }
    },

     CreditRefund: function() {
     this.CreateTransaction();      
    },  

     ShowDejavooProgress: function(show) {
      if (show) this.LockTransactionScreen(show, "Please swipe your card...");
      else this.LockTransactionScreen(show);
      
    },  

    GetTransactionBalance: function() {
      if (this.summaryModel) {
        if (this.summaryModel.get("TermDiscount") > 0) return this.summaryModel.DeductPotentialDiscountFromBalance();
         if(Global.TransactionType == Enum.TransactionType.SalesRefund || Global.TransactionType == Enum.TransactionType.Return) {
          if(Global.PaymentType == Enum.PaymentType.CreditCard) {
              if(!Global.DejavooEnabled) return this.summaryModel.BalanceWithoutPayment();
              else  return this.summaryModel.Balance();      
          }
          else  return this.summaryModel.Balance();      

        }
        else {
           return this.summaryModel.Balance();       
        }

      } else {
        return 0;
      }
    },

    GetTransactionSubTotal: function() {
      if (this.summaryModel) {
        return this.summaryModel.Subtotal();
      } else {
        return 0;
      }
    },

    PaymentCollection_Add: function(model) {

      var _payment = this.summaryModel.get("Payment");
      var _amountPaid = model.get("AmountPaid");
      var _paymentType = model.get("PaymentType");
      var _paymentIsNew = model.get("IsNew");

      //no need to show payment on refund transactions
      if (Global.TransactionType === Enum.TransactionType.SalesRefund || Global.TransactionType === Enum.TransactionType.Return) {
        _amountPaid = 0;
        //this.CreateRefund();
      }

      _payment = _payment + _amountPaid;

      this.summaryModel.set({
        Payment: _payment
      });

      if (_paymentIsNew) {
        this.OnRequestCompleted("PaymentAdded");
      }

      //Save automatically only when New payment is made
      if (_paymentIsNew && !model.get("IsReload")) {
        Global.HasChanges = true;
        this.CreateTransaction(_paymentType);
      }
    },

    PaymentCollection_Removed: function(model) {
      var _payment = this.summaryModel.get("Payment");
      var _amountPaid = model.previous("AmountPaid");
      var _paymentType = model.previous("PaymentType");
      _payment = _payment - _amountPaid;

      this.summaryModel.set({
        Payment: _payment
      });

      Global.HasChanges = true;

      if (model.get("SignatureSVG")) this.DeleteSavedSignature(model.get("SignatureSVG"));

      this.OnRequestCompleted("PaymentRemoved");
    },

    IsFullPayment: function() {
      var _balance = this.GetTransactionBalance();
      return (_balance <= 0);
    },

    /* added method  by PR.Ebron ( 12.06.2012 )
     *Task : Default Transaction setting >> JIRA ID : INTMOBA-358.*/
    SetToDefaultTransaction: function() {
      //console.log(Global.Preference.DefaultPOSTransaction);
      var _settingsModel = this.preferenceCollection.at(0);
      Global.Preference.DefaultPOSTransaction = _settingsModel.get("DefaultPOSTransaction");
      //console.log(Global.Preference.DefaultPOSTransaction);
      switch (Global.Preference.DefaultPOSTransaction) {
        case 0:
          this.SetTransactionType(Enum.TransactionType.Sale);
          Shared.ShowHideOrderNotes("view-notes", false);
          break;
        case 1:
          this.SetTransactionType(Enum.TransactionType.Order);
          Shared.ShowHideOrderNotes("view-notes", false);
          break;
        case 2:
          this.SetTransactionType(Enum.TransactionType.Quote);
          Shared.ShowHideOrderNotes("view-notes", true);
          break;
        case 3:
          this.SetTransactionType(Enum.TransactionType.Return);
          Shared.ShowHideOrderNotes("view-notes", false);
          break;
      }
    },
    /*end of added/modified portion of PR.Ebron.*/
	ClearTransactionWithoutInitalization: function() {
      this.IsReloadedTransaction = false;
      Global.CurrentOrders = null;
      Global.HasChanges = false;
      Global.IsPosted = true;
      Global.TransactionCode = null;
      Global.AdjustedQtyItemCollection = null;
      this.orginalResumeInvoiceCollection = null;
      Global.TermDiscount = 0;

      Global.InvalidPaymentModel = null;
      Global.Summary = {};
      if (Global.Preference.TaxByLocation) this.LoadLocationTaxCode();
      else {
        window.sessionStorage.removeItem('selected_taxcode');
      }
      if (Global.invDetailSerialCollection) Global.invDetailSerialCollection = null;

      window.sessionStorage.clear();

      this.UseDefaultShipTo();
      if (Global.InitialShipToCode) {
        if (Global.ShipTo.ShipToCode !== Global.InitialShipToCode) {
          Global.ShipTo.ShipToCode = Global.InitialShipToCode;
        }
      }

      Shared.CheckSalesRep(Global.Preference);

      this.UseDefaultCustomer();

      if (this.cartCollection) {
        this.cartCollection.reset();
      }

      if (this.requestQueue) {
        //this.requestQueue.remove(this.onQueueModel);
        this.requestQueue.reset();
        this.onQueueModel = null;
      }

      // if (this.paymentCollection) {
      //   var self = this;
      //   if (this.paymentCollection.length > 0) {
      //     this.paymentCollection.each(function(model) {
      //       var _sign = model.get("SignatureSVG");
      //       if (_sign) self.DeleteSavedSignature(_sign);
      //     }, this)
      //   }
      //   this.paymentCollection.reset();
      // }

      if (this.couponView) {
        this.couponView.ClearCoupon();
      }

      if (this.couponModel) {
        this.couponModel.clear();
        Global.Coupon = null;
      }

      // if (this.refundCollection) {
      //   this.refundCollection.reset();
      // }

      if (this.serializeLotCollection) {
        this.serializeLotCollection.reset();
      }

      if (this.transactionCollection) {
        this.transactionCollection.reset();
      };

      this.CheckTransactionType();
      this.SetTransactionCodeDisplay();


      this.SetToDefaultTransaction();
      //Global.PreviousReprintValue = false;
      Global.Signature = null;
      Global.TransactionObject = null;
      Global.SVGArray = new Array();

      Global.PublicNote.PublicNotesCode = "";
      Global.PublicNote.PublicNotes = "";
      Global.PublicNote.PublicNotesDescription = "";
      Global.PublicNote.LineItemNote = "";

      this._lastItemChecked = null; //A variable used in checking out of stock item.

      this.InitializeLoggedReasonsCollection();

      this.OnRequestCompleted("ClearTransaction");

      this.tempResponseStorage = null;
      this.orderType = null;
      Global.CurrentShipToUpdated = false;
      Global.IsLoadByTransaction = false;
      //CSL-9911
      if (Global.TransactionType != Enum.TransactionType.SalesRefund) {
        $(".summary-right").children("div:last-child").show();
        if (Global.Preference.AllowChangeTaxCode) $(".summary-right").find("#view-tax").attr("style", "color: #0B4A8D; cursor: pointer;");
      }
	},

    ClearTransaction: function() {
	  Global.GUID = this.createGuid();
      this.IsReloadedTransaction = false;
      Global.CurrentOrders = null;
      Global.HasChanges = false;
      Global.IsPosted = true;
      Global.TransactionCode = null;
      Global.AdjustedQtyItemCollection = null;
      this.orginalResumeInvoiceCollection = null;
      Global.TermDiscount = 0;

      Global.CurrentItem = null;
      Global.ManagerValidated = false;
      Global.msg1 =  "",
      Global.msgTitle =  "",

      Global.InvalidPaymentModel = null;
      Global.Summary = {};
      Global.Summary = {};
      if (Global.Preference.TaxByLocation) this.LoadLocationTaxCode();
      else {
        window.sessionStorage.removeItem('selected_taxcode');
      }
      if (Global.invDetailSerialCollection) Global.invDetailSerialCollection = null;

      window.sessionStorage.clear();

      this.UseDefaultShipTo();
      if (Global.InitialShipToCode) {
        if (Global.ShipTo.ShipToCode !== Global.InitialShipToCode) {
          Global.ShipTo.ShipToCode = Global.InitialShipToCode;
        }
      }

      Shared.CheckSalesRep(Global.Preference);

      this.UseDefaultCustomer();

      if (this.cartCollection) {
        this.cartCollection.reset();
      }

      if (this.requestQueue) {
        //this.requestQueue.remove(this.onQueueModel);
        this.requestQueue.reset();
        this.onQueueModel = null;
      }

      // if (this.paymentCollection) {
      //   var self = this;
      //   if (this.paymentCollection.length > 0) {
      //     this.paymentCollection.each(function(model) {
      //       var _sign = model.get("SignatureSVG");
      //       if (_sign) self.DeleteSavedSignature(_sign);
      //     }, this)
      //   }
      //   this.paymentCollection.reset();
      // }

      if (this.couponView) {
        this.couponView.ClearCoupon();
      }

      if (this.couponModel) {
        this.couponModel.clear();
        Global.Coupon = null;
      }

      // if (this.refundCollection) {
      //   this.refundCollection.reset();
      // }

      if (this.serializeLotCollection) {
        this.serializeLotCollection.reset();
      }

      if (this.transactionCollection) {
        this.transactionCollection.reset();
      };

      this.CheckTransactionType();
      this.SetTransactionCodeDisplay();


      this.SetToDefaultTransaction();
      //Global.PreviousReprintValue = false;
      Global.Signature = null;
      Global.TransactionObject = null;
      Global.SVGArray = new Array();

      Global.PublicNote.PublicNotesCode = "";
      Global.PublicNote.PublicNotes = "";
      Global.PublicNote.PublicNotesDescription = "";
      Global.PublicNote.LineItemNote = "";

      this._lastItemChecked = null; //A variable used in checking out of stock item.

      this.InitializeLoggedReasonsCollection();

     this.OnRequestCompleted("ClearTransaction");

      this.tempResponseStorage = null;
      this.orderType = null;
      Global.CurrentShipToUpdated = false;
      Global.IsLoadByTransaction = false;
      //CSL-9911
      if (Global.TransactionType != Enum.TransactionType.SalesRefund) {
        $(".summary-right").children("div:last-child").show();
        if (Global.Preference.AllowChangeTaxCode) $(".summary-right").find("#view-tax").attr("style", "color: #0B4A8D; cursor: pointer;");
      }
      this.InitializeItems();
    },

    RetrieveShipTo: function(_rows, _criteria) {
      var self = this;
      var _shipToLookup = new LookupCriteriaModel();

      this.InitializeShipTo();

      _shipToLookup.set({
        CriteriaString: _criteria,
        CustomerCode: _criteria
      });

      _shipToLookup.url = Global.ServiceUrl + Service.CUSTOMER + Method.SHIPTOLOOKUP + _rows;
      _shipToLookup.save(null, {
        success: function(model, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          self.shipToCollection.reset(response.ShipToCollection);
        },
        error: function(model, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          self.HideActivityIndicator();
          model.RequestError(error, "Error Retrieving Ship To");
        }
      });

      this.shipToCollection.each(function(model) {
        Global.ShipTo = model.toJSON();
      });

      //console.log(Global.ShipTo);
    },

    UseDefaultCustomer: function() {
      //this.RetrieveShipTo(100, Global.Preference.CustomerCode);

      //var pricingHasChanged = (Global.DefaultPrice != Global.Preference.CustomerDefaultPrice);
      Global.DefaultPrice = Global.Preference.CustomerDefaultPrice; // GEMINI: CSL-5235
      //if (pricingHasChanged) this.InitializeItems();

      var customer = {
        CustomerName: Global.Preference.CustomerName,
        CustomerCode: Global.Preference.CustomerCode,
        Email: Global.Preference.CustomerEmail,
        DefaultPrice: Global.DefaultPrice,
        LocationCode: Global.LocationCode,
        PaymentTermCode: Global.Preference.PaymentTermCode,
        ShipToName: Global.ShipTo.ShipToName,
        ShipToAddress: Global.ShipTo.Address,
        SalesRepCode: Global.SalesRepGroupCode,
        SalesRepName: Global.SalesRepGroupName,
        CommissionPercent: Global.CommissionPercent
      }

      this.SetCurrentCustomer(customer);

      var _shipToAddress = "(No Address)";

      Global.CustomerName = Global.Preference.CustomerName;
      Global.CustomerCode = Global.Preference.CustomerCode;
      Global.CustomerEmail = Global.Preference.CustomerEmail;
      Global.DefaultContactEmail = Global.Preference.DefaultContactEmail;
      Global.POSSalesReceipt = Global.Preference.POSSalesReceipt;
      $("#lbl-customerName").html(Shared.TrimCustomerName());

      //if(Global.ShipToAddress != null){
      //    _shipToAddress = Global.ShipToAddress + " " + Global.ShipTo.City + ", " + Global.ShipTo.State + " " + Global.ShipTo.PostalCode;
      //}
      var _displayAddress = _shipToAddress;
      var _shipToCity = Global.ShipTo.City;
      var _shiptoState = Global.ShipTo.State;
      var _shiptoPostalCode = Global.ShipTo.PostalCode;
      if (!(Global.DefaultShipToAddress == null && _shipToCity == null && _shiptoState == null && _shiptoPostalCode == null)) {
        if (Shared.IsNullOrWhiteSpace(_shipToCity)) _shipToCity = "";
        if (Shared.IsNullOrWhiteSpace(_shiptoState)) _shiptoState = "";
        if (Shared.IsNullOrWhiteSpace(_shiptoPostalCode)) _shiptoPostalCode = "";
        _shipToAddress = Global.DefaultShipToAddress;
        if (Shared.IsNullOrWhiteSpace(_shipToAddress)) _shipToAddress = "";
        _displayAddress = _shipToAddress + " " + _shipToCity + ", " + _shiptoState + " " + _shiptoPostalCode;
        _shipToAddress = _displayAddress;
      }
      Global.DefaultShipTo = Global.ShipToName + ",";
      //Global.DefaultShipToAddress = _shipToAddress;
      $("#label-shipto").html(Shared.TrimDefaultShipTo());
      $("#label-shipto").append('<br/>' + Shared.Escapedhtml(_shipToAddress));

      Global .SalesRepList = "";
      $("#lbl-salesrepName").html(Shared.TrimSalesRepName());
      $("#splitrateName").html(Shared.TrimCommissionPercent());
    },

    UseDefaultShipTo: function() {
      Global.ShipTo = {};
      for (var attr in Global.Preference.DefaultShipTo) {
        Global.ShipTo[attr] = Global.Preference.DefaultShipTo[attr];
      }
    },

    VoidTransaction: function() {
      Global.OnRechargeProcess = false;
      this.ClearTransaction();
      this.PerformAction();
    },

    VoidTransactionWithValidation: function() {
      if (this.HasOpenTransaction()) {
        this.SetActionType(Enum.ActionType.VoidTransaction);
        if (this.ValidateReason()) {
          if (this.ValidateManagerOverride(Enum.ActionType.VoidTransaction)) {
            this.VoidTransaction();
          }
        }
      }
    },

    PromptVoidTransaction: function() {
      if (this.HasOpenTransaction()) {
        _view = this;
        //_model = this.cartCollection.at(0);
        navigator.notification.confirm("Are you sure you want to cancel this transaction?", _clearTransaction, "Cancel Transaction", ['Yes', 'No']);
      }
    },

    ValidateReason: function(type) {
      var isReason = false;
      switch (type) {
        case "Return":
          isReason = Global.ReasonCode.Return;
          break;
        default:
          isReason = Global.ReasonCode.Transaction;
          type = "VoidTransaction";
          break;
      }

      if (isReason === true) {
        //console.log("reason" + type);
        this.CheckReason(type);
        return false;
      }
      return true;
    },

    ValidateManagerOverride: function(mode, removeOverlayOnClose) {
      var overrideLevel = null;

      if (mode === Enum.ActionType.VoidTransaction) {
        overrideLevel = Global.Preference.TransactionVoidOverrideLevel;
      } else if (mode === Enum.ActionType.Returns || mode === Enum.ActionType.SalesCredit || mode === Enum.ActionType.SalesRefund) {
        overrideLevel = Global.Preference.ReturnsOverrideLevel;
      } else if (mode === Enum.ActionType.AutoAllocate) {
        overrideLevel = Global.Preference.AutoAllocateOverrideLevel;
      }

      if (overrideLevel != "" && overrideLevel != null) {
        if (Global.UserInfo.RoleCode != overrideLevel && !Global.ManagerValidated) {
          Global.OverrideMode = mode;
          //console.log("Override Mode:" + mode);
          this.ShowManagerOverride(removeOverlayOnClose);
          return false;
        }
      }
      return true;
    },

    buttonSearchGo_Tap: function(e) {
      e.preventDefault();
      this.FindItemByUPC();
    },

    ShowActivityIndicator: function(target) {
      if (!target) target = document.getElementById('main-transaction-page');
      $("#spin").remove();
      $("<div id='spin'></div>").appendTo(target);
      var _target = document.getElementById('spin');
      _spinner = Spinner;
      _spinner.opts.color = '#fff'; //The color of the spinner
      _spinner.opts.lines = 13; // The number of lines to draw
      _spinner.opts.length = 7; // The length of each line
      _spinner.opts.width = 4; // The line thickness
      _spinner.opts.radius = 10; // The radius of the inner circle
      _spinner.opts.top = 'auto'; // Top position relative to parent in px
      _spinner.opts.left = 'auto';
      _spinner.spin(_target);
    },

    HideActivityIndicator: function() {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      _spinner = Spinner;
      _spinner.stop();
      $("#spin").remove();
    },

    FindItemByUPC: function() {
      var _upcCode = $("#search-input").val();
      this.AddItemByUPC(_upcCode);
      $("#search-input").val("");
    },
    SearchOnFocus: function(e) {
      if ($("#main-transaction-blockoverlay").is(':visible')) {
        $("#search-input").attr('readonly', 'readonly');
        $("#search-input").val("");
      } else {
        $("#search-input").removeAttr('readonly');
      }
    },
    // inputSearch_KeyUp : function(e) {
    inputSearch_KeyPress: function(e) {
      if (e.keyCode === 13) {
        this.FindItemByUPC();
      } else {
        this.ShowClearBtn(e);
      }
    },

    ShowClearBtn: function(e) {
      e.stopPropagation();
      var _id = e.target.id;
      var _val = $("#" + _id).val();
      var _strLength = _val.length;
      var _pos = $("#" + _id).position(); // retrieves the position of the given element
      var _width = $("#" + _id).width();

      if (_strLength <= 0) {
        this.HideClearBtn();
      } else {
        if (_pos !== null || _pos !== "") {
          $("#" + _id + "ClearBtn").css({
            top: (_pos.top + 7),
            left: (_pos.left + (_width - 9))
          });
          $("#" + _id + "ClearBtn").show();
        }
      }
    },

    ShowLookupClearBtn: function(e) {
      e.stopPropagation();
      var _id = e.target.id;
      var _val = $("#" + _id).val();
      var _strLength = _val.length;
      var _pos = $("#" + _id).position(); // retrieves the position of the given element
      var _width = $("#" + _id).width();

      if (_strLength <= 0) {
        this.HideClearBtn();
      } else {
        if (_pos !== null || _pos !== "") {
          $("#" + _id + "ClearBtn").css({
            top: (_pos.top + 9),
            left: (_pos.left + (_width - 23))
          });
          $("#" + _id + "ClearBtn").show();
        }
      }
    },

    HideClearBtn: function() {
      $(".clearTextBtn").fadeOut();
    },

    ClearText: function(e) {
      var _id = e.target.id;
      var id = _id.substring(0, _id.indexOf('ClearBtn'));
      $("#" + id).val("");
      this.HideClearBtn();
      Shared.FocusToItemScan();
    },

    ApplyDiscountToAll: function(discountAmount, model) {
      if (this.CheckMaxDiscount(discountAmount)) {
        for (var i = 0; i < this.cartCollection.length; i++) {
          if (i == this.cartCollection.length - 1) {
            this.cartCollection.at(i).set({
              LogCurrentTransaction: true
            }, {
              silent: true
            });
            this.holdRecomputeCoupon = false; //GEMINI: CSL-8540
          } else this.cartCollection.at(i).set({
            LogCurrentTransaction: false
          }, {
            silent: true
          });

          this.UpdateDiscount(this.cartCollection.at(i), discountAmount);
        }
      } else {
        navigator.notification.alert("Discount must not exceed max discount of " + Global.Preference.MaxSaleDiscount + "%", null, "Action Not Allowed", "OK");
      }
    },

    UpdateDiscount: function(item, discountAmount) {
      item.updateDiscount(discountAmount);
    },

    CheckMaxDiscount: function(value) {
      var computedValue = value * this.cartCollection.length,
        maxDiscount = Global.Preference.MaxSaleDiscount;

      return (maxDiscount > computedValue) ? true : false;
    },

    LoadInvoiceForResume: function(model) {
      Global.IsPosted = true;
      Global.LookupMode = Enum.LookupMode.UpdateInvoice;
      if (this.ValidateInvoiceLookup(model)) {
        if (this.reviewTransactionsView) this.reviewTransactionsView.Close();
        this.LoadInvoice(model.get("InvoiceCode"), true);
      }
    },

    LoadInvoiceForApplyPayment: function(model) {
      Global.PaymentInfoMdl = model;
      Global.LookupMode = Enum.LookupMode.SalesPayment;
      if (this.ValidateInvoiceLookup(model)) {
        if (this.reviewTransactionsView) this.reviewTransactionsView.Close();
        this.LoadInvoice(model.get("InvoiceCode"));
      }
    },

    LoadInvoiceForReturnRefund: function(model) {
      Global.RefundModel = model;
      Global.LookupMode = Enum.LookupMode.SalesRefund;
      if (this.ValidateInvoiceLookup(model)) {
        if (this.reviewTransactionsView) this.reviewTransactionsView.Close();
        this.LoadInvoice(model.get("InvoiceCode"));
      }
    },

    ValidateInvoiceLookup: function(invoice) {
      if (!this.ValidateLocationBankAccount()) return;
      if (invoice.get("FreightRate") != 0) {
        if (this.reviewTransactionsView) this.reviewTransactionsView.optionsView.Hide();
        navigator.notification.alert(invoice.get("InvoiceCode") + " includes freight tax that ConnectedSale will not be able to handle. Try to open it in Connected Business.", null, "Not Supported", "OK");
        if (Global.LookupMode === Enum.LookupMode.UpdateInvoice) Global.LookupMode = Enum.LookupMode.Suspend;
        else Global.LookupMode = Enum.LookupMode.Invoice;
        //console.log(invoice.get("InvoiceCode") + " includes freight tax that ConnectedSale will not be able to handle. Try to open it in Connected Business.");

        return false;
      } else {
        switch (Global.LookupMode) {
          case Enum.LookupMode.SalesPayment: //Sales Payment
            if (invoice.get("BalanceRate") <= 0) {
              //console.log("Invoice " + invoice.get("InvoiceCode") + " is already fully paid.");
              Global.LookupMode = Enum.LookupMode.Invoice;
              navigator.notification.alert("Invoice " + invoice.get("InvoiceCode") + " is already fully paid.", null, "Cannot Apply Payment", "OK");
              return false;
            }
            break;
          case Enum.LookupMode.SalesRefund: //Sales Refund
            if (!invoice.get("IsPosted")) {
              //console.log("Invoice " + invoice.get("InvoiceCode") + " is not yet posted.");
              navigator.notification.alert("Invoice " + invoice.get("InvoiceCode") + " is not yet posted.", null, "Cannot Refund Sale", "OK");
              return false;
            }
            break;
          case Enum.LookupMode.SalesCredit: //Sales Credit
            if (!invoice.get("IsPosted")) {
              navigator.notification.alert("Invoice " + invoice.get("InvoiceCode") + " is not yet posted.", null, "Cannot Credit Sale", "OK");
              return false;
            }
            break;
        }
        return true;
      }

    },

    LoadInvoice: function(invoiceCode, type) {
      var self = this;
      if (Global.TransactionType != Enum.TransactionType.Suspend || self.IsReloadedTransaction) {
        self.IsReloadedTransaction = false;
        self.DoLoadInvoice(invoiceCode, type);
        return;
      }
      self.ValidateTransactionLocation(invoiceCode, false, function(isChangeWarehouse) {
        self.IsReloadedTransaction = false;
        self.DoLoadInvoice(invoiceCode, type, isChangeWarehouse);
      });
    },

    DoLoadInvoice: function(invoiceCode, isResumeInvoice, isChangeWarehouse) {
      if (!Global.ValidLocation && !(Global.LookupMode == Enum.LookupMode.SalesPayment)) {
        this.NotifyMsg("The Current Status of the Default Location is Inactive.", "Unable to load items");
        return;
      }
      if (!this.invoiceTransactionModel) {
        this.invoiceTransactionModel = new BaseModel();
      }
      var _self = this;
      this.LockTransactionScreen(true, "Loading...");
      // jj-luz
      this.invoiceTransactionModel.set({
        TransactionCode: invoiceCode,
        IsRecalculate: (Global.LookupMode != Enum.LookupMode.SalesPayment && Global.LookupMode != Enum.LookupMode.SalesRefund),
        IsTaxByLocation: Global.Preference.TaxByLocation,
        TransactionType: Global.LookupMode,
        WebsiteCode: Shared.GetWebsiteCode(),
        WarehouseToUse: (isChangeWarehouse ? Global.Preference.DefaultLocation : '')
      });
      this.invoiceTransactionModel.url = Global.ServiceUrl + Service.SOP + Method.LOADINVOICE;
      this.invoiceTransactionModel.save(null, {
        success: function(collection, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          _self.LoadCouponDetailsFromSalesInvoice(collection, response, isResumeInvoice)
        },
        error: function(collection, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          collection.RequestError(error, "Error Loading Invoice");
          _self.LockTransactionScreen(false);
        }
      });
    },

    LoadCouponDetailsFromSalesInvoice: function(_collection, _response, isResumeInvoice) { //JHZ!
      if (_response.ErrorMessage) {
        this.NotifyMsg(_response.ErrorMessage, 'Problem Loading Invoice');
        this.ClearTransaction();
        this.LockTransactionScreen(false);
        return;
      }
      var couponID = _response.Invoices[0].CouponID;
      var self = this;
      var criteria = couponID;
      var couponLookup = new LookupCriteriaModel();
      var rowsToSelect = 100;

      if (!criteria) {
        this.LoadInvoiceCompleted(_collection, _response, null, isResumeInvoice);
        return;
      }

      couponLookup.set({
        CustomerCode: Global.CustomerCode,
        CriteriaString: criteria
      });

      couponLookup.url = Global.ServiceUrl + Service.SOP + Method.LOADCOUPONBYCOUPONID;
      couponLookup.save(null, {
        success: function(model, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          var _coupon;
          if (response.Coupons)
            if (response.Coupons.length == 1) _coupon = response.Coupons[0];
          self.LoadInvoiceCompleted(_collection, _response, _coupon, isResumeInvoice);
        },
        error: function(model, error, response) {
          model.RequestError(error, "Error Retrieving Coupon Details");
          self.LoadInvoiceCompleted(_collection, _response, null, isResumeInvoice);
        }
      });

    },

    InitializeLoadedItemCollection: function() { ///Added for CSL-10179
      if (!Global.LoadedItems) Global.LoadedItems = new BaseCollection();
      Global.LoadedItems.reset();
    },

    InitializeOriginalInvoiceDetailsForResume: function(response) {
      this.orginalResumeInvoiceCollection = new BaseCollection();
      this.orginalResumeInvoiceCollection.reset(response.InvoiceDetails);
    },

    LoadInvoiceCompleted: function(collection, response, _coupon, isResumeInvoice) {
      this.InitializeLoadedItemCollection();
      if (!Shared.IsNullOrWhiteSpace(isResumeInvoice)) this.InitializeOriginalInvoiceDetailsForResume(response);
      if (response && response.Invoices && response.Invoices.length > 0) {
        var isUpdateInvoice = false;
        switch (Global.LookupMode) {
          case Enum.LookupMode.SalesPayment:
            this.SetTransactionType(Enum.TransactionType.SalesPayment);
            break;
          case Enum.LookupMode.SalesRefund:
            this.SetTransactionType(Enum.TransactionType.SalesRefund);
            break;
          case Enum.LookupMode.SalesCredit:
            this.SetTransactionType(Enum.TransactionType.SalesCredit);
            break;
          case Enum.LookupMode.UpdateInvoice:
            isUpdateInvoice = true;
            if (this.HasGCToRecharge(response.SerialLotNumbers)) this.SetTransactionType(Enum.TransactionType.Recharge);
            else this.SetTransactionType(Enum.TransactionType.UpdateInvoice);
            break;
          case Enum.LookupMode.VoidTransaction:
            this.SetTransactionType(Enum.TransactionType.VoidTransaction);
            break;
        }
        //if(response.KitDetails.length > 0) window.sessionStorage.setItem('kitItems', JSON.stringify(response.KitDetails));

        if (this.IsReturn()) this.InitializeItems(); //Reload Items in Category

        //Invoice Header
        var invoice = response.Invoices[0];
        var invoiceDetails = response.InvoiceDetails; //Added : CSL - 17445
        var copyInvoiceDetails = response.InvoiceDetails;
        var toBeDeleted = [],
          tempToBeDeleted = [];
        var errCount = 0;
        var isGC = false;
        var self = this;

        Global.TransactionCode = invoice.InvoiceCode;
        Global.TransactionObject = invoice;
        Global.OnRechargeProcess = false;
        Global.TransactionDocumentDate = invoice.InvoiceDate;

        this.SetTransactionCodeDisplay(Global.TransactionCode);

        //Invoice Customer
        if (response.Customers && response.Customers.length > 0) {
          var customer = response.Customers[0];
          var pricingHasChanged = (Global.DefaultPrice != customer.DefaultPrice);

          Global.CustomerCode = customer.CustomerCode;
          Global.DefaultPrice = customer.DefaultPrice;
          Global.DefaultContactEmail = customer.DefaultContactEmail;
          if (pricingHasChanged) this.InitializeItems();

          Global.CustomerName = customer.CustomerName;
          Global.POSSalesReceipt = customer.POSSalesReceipt;

          $("#lbl-customerName").html(Shared.TrimCustomerName());

          //CSL - 8889 : 06.06.2013
          //Global.DefaultShipTo = 	invoice.ShipToName + ",<br/>" + invoice.ShipToAddress; << original code
          //start modification 06.06.13
          Global.IsLoadByTransaction = true;
          Global.Transaction = invoice;
          this.SetCurrentCustomer(customer);
          this.AssignCustomerShipToFromLoadedTransaction(invoice);
        }

        // CSL-1068 - Order Notes
        if (invoice.PublicNotes) Global.PublicNote.PublicNotes = invoice.PublicNotes;

        //Serial Lot Numbers : moved here for CSL - 12638 : 09.04.2013
        this.AddUnitMeasureCodeToSerial(response.InvoiceDetails, response.SerialLotNumbers, true);

        //Invoice Detail
        if (response.InvoiceDetails && response.InvoiceDetails.length > 0) {

          if (response.KitDetails) {
            _.each(invoiceDetails, function(item) {
              /*_.each(response.KitDetails, function (detail) {
								if (item.ItemCode === detail.ItemKitCode) detail.LineNum = item.LineNum;
							});*/
              var kit = _.where(response.KitDetails, {
                'LineNum': item.LineNum
              });


              window.sessionStorage.setItem('kitItems-' + item.LineNum, JSON.stringify(kit));
            });
          }

          if (Global.LookupMode === Enum.TransactionType.SalesCredit || Global.LookupMode === Enum.TransactionType.SalesRefund) {
            //Recalculate totals based on outstanding value
            invoice.SubTotalRate = 0.00;
            invoice.TaxRate = 0.00;

            invoiceDetails = _.filter(invoiceDetails, function(filteredDtls) {
              return (filteredDtls.QuantityOrdered > 0);
            });

            copyInvoiceDetails = _.filter(copyInvoiceDetails, function(filteredDtls) {
              return (filteredDtls.Outstanding > 0);
            });

            //for (var index = 0; index < copyInvoiceDetails.length; index++) {
            //}

            _.each(copyInvoiceDetails, function(item, index) {
              var activatedCount = 0;
              var activatedOnlyCount = 0;
              var serialAllowedToReturn = 0;
              //var item = copyInvoiceDetails[index];
              if (response.SerialLotNumbers) {
                var serial = response.SerialLotNumbers[index];
                if (item.ItemType === Enum.ItemType.GiftCard || item.ItemType === Enum.ItemType.GiftCertificate) {
                  isGC = true;

                  var serials = _.filter(response.SerialLotNumbers, function(mdl) {
                    return mdl.ItemCode === item.ItemCode && mdl.LineNum === item.LineNum;
                  });

                  var numOfActivatedGC = _.filter(response.SerialLotNumbers, function(mdl) {
                    return mdl.ItemCode === item.ItemCode && mdl.LineNum === item.LineNum && (mdl.IsActivated === true || mdl.IsReturned === true || mdl.IsRecharged);
                  });

                  var numOfActivatedGCOnly = _.filter(response.SerialLotNumbers, function(mdl) {
                    return mdl.ItemCode === item.ItemCode && mdl.LineNum === item.LineNum && (mdl.IsActivated === true || mdl.IsRecharged);
                  });

                  activatedCount = numOfActivatedGC.length;
                  activatedOnlyCount = numOfActivatedGCOnly.length;

                  if (numOfActivatedGC.length != 0) {
                    if (numOfActivatedGC.length === serials.length) {
                      toBeDeleted.push(item);
                    } else {
                      var tempSerial = response.SerialLotNumbers;
                      //delete activated gc
                      _.each(numOfActivatedGC, function(gc, i) {
                        _.each(tempSerial, function(serial, j) {
                          if (gc.SerialLotNumber === serial.SerialLotNumber) {
                            response.SerialLotNumbers.splice(j, 1); //tempToBeDeleted.push(j);
                          }
                        });
                      });

                    }


                    if ((copyInvoiceDetails.length - toBeDeleted.length) === 0) {
                      errCount++;
                    }
                  }
                }
              }

              Global.LoadedItems.add(item); //Added for CSL-10179


              // Follow CB behavior, return quantity should default to zero.
              item.Good = 0; // Default to 0
              item.ExtPriceRate = 0;
              item.SalesTaxAmount = 0;
              item.SalesTaxAmountRate = 0;

              item.ExtPriceRate = self.CalculateExtPrice(item.Good,
                item.SalesPriceRate,
                item.Discount,
                item.CouponDiscountType,
                item.CouponDiscount,
                item.CouponComputation,
                item.LineNum);

              // item.Good = item.Outstanding; //Originally Defective
              // if (item.Outstanding <= 0) item.ExtPriceRate = 0;
              // else item.ExtPriceRate = self.CalculateExtPrice(item.Outstanding - activatedOnlyCount,
              // 	item.SalesPriceRate,
              // 	item.Discount,
              // 	item.CouponDiscountType,
              // 	item.CouponDiscount,
              // 	item.CouponComputation,
              // 	item.LineNum);

              Global.LoadedItems.each(function(loadedItem) { //Added for CSL-10179
                if (loadedItem.get("AlteredCoupon") && loadedItem.get("LineNum") == item.LineNum) {
                  item.CouponDiscount = loadedItem.get("AlteredCouponDiscount");
                  item.CouponDiscountRate = loadedItem.get("AlteredCouponDiscount");
                  item.CouponDiscountAmount = loadedItem.get("AlteredCouponDiscount");
                }
              });

              if (serial && (item.ItemCode === serial.ItemCode && item.LineNum === serial.LineNum)) serial.SerialLotType = item.SerializeLot;
            });
          }

          if (isGC && errCount > 0) {
            this.LockTransactionScreen(false);
            this.VoidTransaction();
            navigator.notification.alert("You can no longer return gift card / gift certificate item\n because it has either been activated or returned.", null, "Action not allowed", "OK");
            return;
          } else {
            if (toBeDeleted.length > 0) copyInvoiceDetails = _.difference(copyInvoiceDetails, toBeDeleted);
            invoiceDetails = copyInvoiceDetails;
          }

          //Sort InvoiceDetails by LineNum
          var _invoiceDetails = _.sortBy(invoiceDetails, function(item) {
            return item.LineNum;
          });

          Global.InvoiceDetailsResponse = _invoiceDetails;
          var _isCalculateByTaxCode = true;
          var _isOverrideTaxCode = false;
          if (Global.LookupMode == Enum.LookupMode.SalesRefund) _isCalculateByTaxCode = true;

          if (Global.TransactionType == Enum.TransactionType.SalesPayment || Global.TransactionType == Enum.TransactionType.SalesRefund) this.cartCollection.reset();

          this.LoadItemsToCart(_invoiceDetails, _isCalculateByTaxCode);

          if (isUpdateInvoice) {
            Global.IsLoadingTransaction = true;
            this.ChangeItemGroupTax(this.cartCollection);
          }
        }

        //check if there is coupon
        if (_coupon) {
          this.LoadCouponFromTransationHeader(invoice);
          if (this.couponModel && _coupon) this.couponModel.set({
            IncludeAllCustomer: _coupon.IncludeAllCustomer,
            IncludeAllProduct: _coupon.IncludeAllProduct
          });
        }

        //Invoice Payments
        if (!this.paymentCollection) this.InitializePaymentCollection();

        //Serial Lot Numbers
        // if(response.SerialLotNumbers){
        // 	if(!this.serializeLotCollection) this.InitializeSerializeLotCollection();
        // 	this.serializeLotCollection.reset(response.SerialLotNumbers);
        // }

        this.paymentCollection.reset();

        if (response.Payments && response.Payments.length > 0) {
          var _validPayments = this.RemoveInvalidPayment(response.Payments, true);
          if (_validPayments.length > 0) {
            if (Global.TransactionType === Enum.TransactionType.SalesRefund) this.RemoveCreditMemo(_validPayments); //CSL-13137 : 8.22.13
            else this.paymentCollection.add(_validPayments);
          }
        }
        if (Global.TransactionType == Enum.TransactionType.SalesPayment) {
          if (Shared.IsNullOrWhiteSpace(this.previousCreditCardReceiptCodes)) {
            this.previousCreditCardReceiptCodes = new BaseCollection();
            this.previousCreditCardReceiptCodes.reset(response.Payments);
            this.paymentCollection.each(function(payment) {
              payment.set({
                IsPrevCCPayment: true
              });
            });
          }
          this.LoadCreditCardReceiptCodes(response)
        }

        if (Global.TransactionObject.DiscountRate > 0) this.AddTermDiscountToPayment(Global.TransactionObject.DiscountRate)

        if (this.paymentCollection.length > 0) {
          this.paymentCollection.each(function(model) {
            var cardNumber = model.get("CreditCardNumber");
            if (cardNumber != null) model.set({
              EncryptedCreditCardNumber: cardNumber
            });
          });
        }

        //CSL-9780 09.24.20013
        if (Global.TransactionType == Enum.TransactionType.SalesRefund)
          if (this.cartView)
            if (this.cartView.summaryModel) {
              var paymentTotal = this.GetNonNegativePaymentTotal();
              this.cartView.summaryModel.set({
                Payment: paymentTotal
              });
            }

        this.InitializePreviousTransactionDetails(response, "Invoice");

        //if (Global.TransactionType === Enum.TransactionType.SalesRefund) {
        //    var hasGCAuto = this.cartCollection.filter(function (gc) {
        //        return (gc.get("ItemType") === Enum.ItemType.GiftCard || gc.get("ItemType") === Enum.ItemType.GiftCertificate) && gc.get("AutoGenerate") === true;
        //    });

        //    var hasGCManual = this.cartCollection.filter(function (gc) {
        //        return (gc.get("ItemType") === Enum.ItemType.GiftCard || gc.get("ItemType") === Enum.ItemType.GiftCertificate) && gc.get("AutoGenerate") === false;
        //    });

        //    if ((hasGCManual && hasGCManual.length > 0)) {
        //        this.RenderGCList(new BaseCollection(hasGCManual));
        //        if (Global.TransactionType == Enum.TransactionType.Recharge) $('#complete-btn').trigger('tap');
        //        this.OnRequestCompleted("LoadInvoiceCompleted");
        //        return;
        //    }
        //}

        if (response.SalesRep != null)
        {
          var SalesRepSplit = "";
          var SalesRepName = "";

          var CommissionPercentResult = _.pluck(response.SalesRep,"CommissionPercent");
          var SalesRepResult = _.pluck(response.SalesRep,"SalesRepGroupName");

          if (CommissionPercentResult.length > 1) {
            _.each(CommissionPercentResult, function (data, i) {
              if (i >= CommissionPercentResult.length - 1)
              { SalesRepSplit += data + "%" } else
              { SalesRepSplit += (data + "%" + ", ") }
              i++;
            })
          }
          else
          {
            SalesRepSplit = CommissionPercentResult;
          }

          _.each(SalesRepResult, function (data, i) {
            if (i >= SalesRepResult.length - 1)
            { SalesRepName += data } else
            { SalesRepName += (data + ", ") }
            i++;
          })

          Global.SalesRepGroupName = SalesRepName;
          Global.CommissionPercent = SalesRepSplit;
          Global.SalesRepList = response.SalesRep;

          $("#lbl-salesrepName").html(Shared.TrimSalesRepName());
          $("#splitrateName").html(Shared.TrimCommissionPercent());
        }

        if (Global.TransactionType == Enum.TransactionType.Recharge) {
          if (Global.Summary) Global.Summary = {
            SubTotal: this.cartCollection.total()
          }
          $('#complete-btn').trigger('tap');
          this.HideActivityIndicator();
        } else {
          this.LockTransactionScreen(false);
        }

        this.OnRequestCompleted("LoadInvoiceCompleted");
      }
    },

    AddUnitMeasureCodeToSerial: function(cart, serial, fromInvoice) {
      if (serial) {
        if (!this.serializeLotCollection) this.InitializeSerializeLotCollection();

        _.each(serial, function(srl, i) {
          var invDtls = _.find(cart, function(dtls) {
            if (dtls instanceof BaseModel) {
              return dtls.get("ItemCode") === srl.ItemCode && dtls.get("LineNum") === srl.LineNum;
            } else {
              return dtls.ItemCode === srl.ItemCode && dtls.LineNum === srl.LineNum;
            }

          });

          if (invDtls) serial[i].UnitMeasureCode = (invDtls instanceof BaseModel) ? invDtls.get("UnitMeasureCode") : invDtls.UnitMeasureCode;
        });

        if (fromInvoice) {
          if (!Global.invDetailSerialCollection) Global.invDetailSerialCollection = new SerialNumberCollection();
          Global.invDetailSerialCollection.reset(serial);
        }
        this.serializeLotCollection.reset(serial);
      }
    },

    SetRefundTotalAmountColor: function() {
      if (Global.TransactionType == Enum.TransactionType.SalesRefund) $('#cartContainer .total').css('color', '#CB3333'); //#CB3333
      else $('#cartContainer .total').css('color', '#67cb33');
    },

    LoadCreditCardReceiptCodes: function(response) {
      if (!Shared.IsNullOrWhiteSpace(this.previousCreditCardReceiptCodes)) {
        if (this.previousCreditCardReceiptCodes.length > 0) {
          var self = this;
          var newPaymentCollection = new BaseCollection();
          newPaymentCollection.reset(response.Payments);
          this.previousCreditCardReceiptCodes.each(function(prevPayment) {
            if (prevPayment.get("PaymentType") == Enum.PaymentType.CreditCard) {
              var _prevReceiptCode = prevPayment.get("ReceiptCode");
              newPaymentCollection.each(function(newPayment) {
                if (newPayment.get("PaymentType") == Enum.PaymentType.CreditCard) {
                  if (newPayment.get("ReceiptCode") == _prevReceiptCode) {
                    newPayment.set({
                      IsPrevCCPayment: true
                    });
                  }
                }
              });
            }

          });
          if (newPaymentCollection.length > 0) { //jjx1234
            var ctr = 0;
            this.creditCardReceiptCodes = "";
            newPaymentCollection.each(function(payment) {
              if (payment.get("PaymentType") == Enum.PaymentType.CreditCard && Shared.IsNullOrWhiteSpace(payment.get("IsPrevCCPayment"))) {
                var _receiptCode = payment.get("ReceiptCode");
                if (Shared.IsNullOrWhiteSpace(self.receiptCodes)) {
                  self.creditCardReceiptCodes = _receiptCode;
                } else {
                  self.creditCardReceiptCodes += "," + _receiptCode;
                }
                ctr += 1;
              }
            });
          }
        }
        //console.log("Receipt Codes : " + this.creditCardReceiptCodes + ", Total : " + ctr);
      }
    },

    AddTermDiscountToPayment: function(value) {
      if (value == 0) return;
      var _mdl = new BaseModel();
      var documentDate = Global.TransactionObject.InvoiceDate;
      if (Global.TransactionType == Enum.TransactionType.UpdateOrder || Global.TransactionType == Global.TransactionType.ConvertOrder)
        documentDate = Global.TransactionObject.SalesOrderDate;

      _mdl.set({
        AmountPaid: value,
        PaymentType: "Term Discount",
        IsNew: false,
        IsReload: true,
        PaymentDate: documentDate,
      })


      this.paymentCollection.add(_mdl);
      Global.AllowToFetchPotentialDiscount = false;
    },

    //CSL-9780 09.24.20013
    GetNonNegativePaymentTotal: function() {
      var paymentTotal = 0;
      if (this.paymentCollection) this.paymentCollection.each(function(model) {
        var amount = model.get("AmountPaid") || 0;
        if (amount < 0) amount = 0;
        paymentTotal = paymentTotal + amount;
      });
      return paymentTotal;
    },

    HasGCToRecharge: function(serialLotArray) {
      var hasGCTorecharge = false;
      if (!serialLotArray) return hasGCTorecharge;
      for (var i = 0; i < serialLotArray.length; i++) {
        if (serialLotArray[i].IsRecharged === true) return true;
      }
      return hasGCTorecharge;
    },


    InitializePreviousTransactionDetails: function(response, type) {
      var transactionCode;
      var transactionType = type;
      if (Shared.IsNullOrWhiteSpace(this.previousTransactionDetals)) {
        this.previousTransactionDetals = new InvoiceCollection();
      }
      if (type == "Invoice") {
        this.previousTransactionDetals.reset(response.InvoiceDetails);
        transactionCode = this.previousTransactionDetals.at(0).get("InvoiceCode");
        this.previousTransactionDetals.reset();
        this.previousTransactionDetals.add({
          TransactionType: transactionType,
          InvoiceCode: transactionCode,
          SourceCode: response.Invoices[0].SourceCode,
          ShippingDate: response.Invoices[0].ShippingDate,
          POCode: response.Invoices[0].POCode
        });
      } else {
        this.previousTransactionDetals.reset(response.SalesOrderDetails);
        transactionCode = this.previousTransactionDetals.at(0).get("SalesOrderCode");
        this.previousTransactionDetals.reset();
        this.previousTransactionDetals.add({
          TransactionType: transactionType,
          SalesOrderCode: transactionCode,
          SourceCode: response.SalesOrders[0].SourceCode,
          ShippingDate: response.SalesOrders[0].ShippingDate,
          POCode: response.SalesOrders[0].POCode
        });
      }
    },

    UpdateInvoice: function() {
      if (Global.HasChanges || this.AllowSaveWithOutChanges()) {
        this.InitializeTransaction();

        if (this.paymentCollection && this.paymentCollection.length > 0) {
          this.recentPaymentCollection = new BaseCollection();
          this.recentPaymentCollection.reset(this.paymentCollection.models);
        }

        var _salesOrderCollection = new SalesOrderCollection();
        var _salesOrderDetailCollection = new SalesOrderDetailCollection();
        var _payments = new PaymentCollection();
        var _newPayments = this.GetNewPayments();
        var _coupons = new CouponCollection();
        if (this.couponModel) _coupons.add(this.couponModel);

        var _serializeLot = "";

        if (this.serializeLotCollection) {
          _serializeLot = this.serializeLotCollection.toJSON();
        }

        var self = this;

        // _salesOrderCollection.add(Global.TransactionObject); <-- remove to resolve resume sale Bill To Code Issue. 9.45.2013
        var shippingDate = new Date();

        shippingDate = this.JsonToAspDate(shippingDate);
        var invoiceModel = new BaseModel();

        invoiceModel.set(Global.TransactionObject);
        invoiceModel.set({
          POSWorkstationID: Global.POSWorkstationID,
          POSClerkID: Global.Username,
          IsFreightOverwrite: true,
          IsOverrideSalesRep: false,
          SignatureSVG: Global.Signature,
          IsPosted: Global.IsPosted,
          IsTaxByLocation: Global.Preference.TaxByLocation,
          ShippingDate: shippingDate,
          PublicNotes: Global.PublicNote.PublicNotes,
          WebSiteCode: Global.Preference.WebSiteCode,
          IsUsePOSShippingMethod: Global.Preference.IsUsePOSShippingMethod,
          POSShippingMethod: Global.Preference.POSShippingMethod
        });
        if (!Shared.IsNullOrWhiteSpace(this.customerPOModel)) {
          invoiceModel.set(self.customerPOModel.attributes);
        }
        _salesOrderCollection.add(invoiceModel);
        //MAR-21-2013 - INTMOBA-800
        this.AssignTransactionShipTo(_salesOrderCollection.at(0));

        this.SetCouponToTransactionHeader(_salesOrderCollection.at(0), false);

        _salesOrderDetailCollection.add(this.cartCollection.models);

        // _salesOrderDetailCollection.each(function(model) {
        //   var taxCode = window.sessionStorage.getItem("selected_taxcode");
        //   taxCode = (taxCode) ? taxCode : Global.ShipTo.TaxCode;
        //   model.set("TaxCode", taxCode);
        // });

        if (_newPayments && _newPayments.length > 0) {
          _payments.add(_newPayments);
        }


        this.transactionModel.set({
          "Invoices": _salesOrderCollection.toJSON(),
          "InvoiceDetails": _salesOrderDetailCollection.toJSON(),
          "Payments": _payments.toJSON(),
          "Coupons": _coupons.toJSON(),
          "SerialLotNumbers": _serializeLot
        });

        this.RemoveWarehouseCodeByItemType(this.transactionModel.get("InvoiceDetails"));

        this.transactionModel.url = Global.ServiceUrl + Service.SOP + Method.UPDATEINVOICE;

        try {
          var msg = "Error saving the Invoice. The following items do not have the same number of serial numbers with the shipped quantity.";
          var errMsg = this.ValidateSerialLot(this.serializeLotCollection, this.cartCollection, msg);

          if (errMsg === undefined || errMsg === "") {

            //use save method of model to save data to the server
            this.LockTransactionScreen(true, "Saving...");
            this.transactionModel.save(null, {connectionID: this.signalRConnectionID});
            this.ResetCustomerPODetails();
          } else throw errMsg;

          //var gcCartCollection = this.cartCollection.filter(function (model) {
          //    return model.get("ItemType") === Enum.ItemType.GiftCard || model.get("ItemType") === Enum.ItemType.GiftCertificate;
          //});

          //var serialNumberLength = (this.serializeLotCollection) ? this.serializeLotCollection.length : 0

          //if (serialNumberLength != gcCartCollection.length) {
          //    var collection = this.ValidateSerialNumbers(this.serializeLotCollection, this.cartCollection, "");

          //    if (collection.length > 0) {
          //        this.RenderGCList(new BaseCollection(collection));
          //        return;
          //    } else if (collection.length === 0) {
          //        this.RenderGCList(this.cartCollection);
          //        return;
          //    }
          //}

          //this.transactionModel.save();
          //this.ResetCustomerPODetails();
        } catch (err) {
          this.LockTransactionScreen(false);
          //console.log(err);
          navigator.notification.alert(err, null, "Action not Allowed", "OK");
        }
      } else {
        //console.log("There are no changes to save.");
        navigator.notification.alert("There are no changes to save.", null, "Cannot Save Transaction", "OK");
        $("#main-transaction-blockoverlay").hide();
      }
    },

    LoadItemsToCart: function(items, isCalculateByTaxCode) {
      var toBeAdded = [];
      var self = this;
      if (items && items.length > 0) {
        for (index = 0; index < items.length; index++) {
          var item = items[index];
          var detail;
          var _couponDiscountAmount;
          var _couponCode = "";
          var _taxCode = null;
          // if (!Shared.IsNullOrWhiteSpace(isCalculateByTaxCode)) {
          //   _taxCode = item.TaxCode;
          //   window.sessionStorage.setItem('selected_taxcode', _taxCode);
          // }
          _taxCode = item.TaxCode;
          if (Global.TransactionType === Enum.TransactionType.Sale || Global.TransactionType === Enum.TransactionType.Order) {
            _couponDiscountAmount = item.CouponDiscountAmount;
          } else {
            _couponDiscountAmount = item.CouponDiscountRate;
            if (Global.TransactionType === Enum.TransactionType.ConvertOrder || Global.TransactionType === Enum.TransactionType.UpdateOrder || Global.TransactionType === Enum.TransactionType.UpdateInvoice || Global.TransactionType === Enum.TransactionType.ConvertQuote)
              if (!item.CouponDiscountRate) _couponDiscountAmount = item.CouponDiscountAmount;
          }

          if (_couponDiscountAmount != 0) _couponCode = item.CouponCode;

          //CSL - 12638 : 09.04.2013
          var _numOfActivatedGCard = 0;


          var _qtyOrdered = 0;
          if (item.Good) { //Originally Defective
            _qtyOrdered = item.Good; //Originally Defective
            if (item.ItemType == Enum.ItemType.GiftCard || item.ItemType == Enum.ItemType.GiftCertificate) {
              _numOfActivatedGCard = self.GetNumOfActivatedGCard(item.ItemCode);
              _qtyOrdered = _qtyOrdered - _numOfActivatedGCard;
            } else {
              _qtyOrdered = item.Good;
            } //Originally Defective
          }
          var _isQtyOrderedAdjusted = Shared.IsNullOrWhiteSpace(item.IsQtyOrderedAdjusted);

          detail = {
            ItemCode: item.ItemCode,
            ItemName: item.ItemName,
            ItemDescription: item.ItemDescription,
            LineNum: item.LineNum,
            QuantityOrdered: item.QuantityOrdered,
            QuantityShipped: item.QuantityOrdered,
            SalesPriceRate: item.SalesPriceRate,
            SalesPrice: item.SalesPrice,
            ExtPriceRate: item.ExtPriceRate,
            Discount: Shared.ApplyAllowedDecimalFormat(item.Discount),
            SalesTaxAmountRate: item.SalesTaxAmountRate,
            UPCCode: item.UPCCode,
            ItemType: item.ItemType,
            WarehouseCode: self.IsReturn() ? Global.Preference.DefaultLocation : item.WarehouseCode,
            CouponDiscountAmount: _couponDiscountAmount,
            CouponDiscount: _couponDiscountAmount, //CSL-10179
            CouponDiscountRate: _couponDiscountAmount, //CSL-10179
            CouponCode: _couponCode,
            CouponComputation: item.CouponComputation,
            CouponDiscountType: item.CouponDiscountType,
            IsIncludedInCoupon: item.IsIncludedInCoupon,
            UnitMeasureCode: item.UnitMeasureCode,
            UnitMeasureQty: item.UnitMeasureQty,
            Outstanding: item.Outstanding,
            SourceLineNum: item.SourceLineNum,
            Good: _qtyOrdered, //Originally Defective
            Outstanding: item.Outstanding,
            WebSiteCode: item.WebsiteCode,
            Filename: item.Filename,
            SerializeLot: item.SerializeLot,
            IsModified: item.IsModified,
            IsOutOfStock: item.IsOutOfStock || false,
            OriginalQuantityAllocated: item.OriginalQuantityAllocated, //CSL-11149 AUG-06-2013
            NumOfActivatedGCard: _numOfActivatedGCard,
            TaxCode: _taxCode,
            Status: item.Status,
            FreeStock: item.FreeStock,
            IsQtyOrderedAdjusted: _isQtyOrderedAdjusted,
            AutoGenerate: item.AutoGenerate,
            Pricing: item.Pricing,
			PromoDocumentCode: item.PromoDocumentCode,
			RuleID: item.RuleID,
			PromoID: item.PromoID,
			IsPromoItem: item.IsPromoItem,
          }

          //console.log("Pricing : " + item.Pricing);
          if (this.cartCollection.length === 0) {
            //toBeAdded.push(detail);
            this.cartCollection.add(detail);
          } else {
            //Fix Index out of range
            if (this.cartCollection.length < (index + 1)) this.cartCollection.add(detail); //toBeAdded.push(detail); //this.cartCollection.add(detail);
            else this.cartCollection.at(index).set(detail);
          }
        }


        //if (toBeAdded.length > 0) {
        //    this.cartCollection.reset(toBeAdded);
        //    if (Global.TransactionType === Enum.TransactionType.SalesRefund || Global.TransactionType === Enum.TransactionType.SalesPayment) this.cartCollection.trigger('showItems', this.cartCollection);
        //}
      }
      this.cartView.RefreshScroll();
	  this.cartCollection.each(function(cartItem){
			if(cartItem.get('IsPromoItem') == true)
			{
   		  $("#" + cartItem.cid + ' #quantityDisplay').addClass('ui-disabled').css("opacity", 1);
			  $("#" + cartItem.cid + ' #display-itemName').addClass('ui-disabled').css("opacity", 1);
			  $("#" + cartItem.cid + ' #itemPriceDisplay').addClass('ui-disabled').css("opacity", 1);
			  $("#" + cartItem.cid + ' #discountDisplay').addClass('ui-disabled').css("opacity", 1);
			  $("#" + cartItem.cid + ' #extPriceRate-td').addClass('ui-disabled').css("opacity", 1);
			}
		});
      return;
    },

    //CSL - 12638 : 09.04.2013
    GetNumOfActivatedGCard: function(itemCode) {
      if (Global.TransactionType != Enum.TransactionType.SalesRefund || !this.serializeLotCollection) return 0;
      if (this.serializeLotCollection.length < 0) return 0;
      //var _activatedSerials = this.serializeLotCollection.where({ItemCode : itemCode, IsActivated : true});
      var _activatedSerials = this.serializeLotCollection.filter(function(mdl) {
        return mdl.get("ItemCode") == itemCode && (mdl.get("IsActivated") == true || mdl.get("IsRecharged") == true)
      });
      return _activatedSerials.length;
    },

    SetTransactionCodeDisplay: function(transactionCode) {
      if (transactionCode) {
        transactionCode = transactionCode; //" &#8226; &nbsp; " +
        $("#transaction-text").hide();
        $(".label-transactioncode").html(transactionCode);
        $(".label-transactioncode").show();
        $(".label-transactioncode").css("font-size", "17px");
        $(".arrow-down").css("opacity", "0.3");
      } else {
        $("#transaction-text").show();
        $(".label-transactioncode").hide();
        $(".arrow-down").css("opacity", "1");
      }
    },

    SetTransactionTypeDisplay: function(transactionType) {
      var _type = "";
      switch (transactionType) {
        case Enum.TransactionType.SalesPayment:
          _type = "Payment";
          break;
        case Enum.TransactionType.ConvertOrder:
          _type = Enum.TransactionType.Sale;
          break;
        case Enum.TransactionType.VoidTransaction:
          _type = "Void";
          break;
        default:
          _type = transactionType;
          break;
      }
      this.$("#transaction-text").html(_type);
      this.SetRefundTotalAmountColor();
    },

    ShowPaymentsSummaryForm: function(type) {
      if (this.paymentCollection && this.paymentCollection.length > 0) {
        switch (Global.TransactionType) {
          case Enum.TransactionType.Quote:
            return;
            break;
          case Enum.TransactionType.Return:
            return;
            break;
          case Enum.TransactionType.SalesCredit:
            return;
            break;
          default:
            this.InitializePaymentSummary();
            break;
        }
      } else {
        //console.log("There are no payments made for the current transaction.");
        navigator.notification.alert("There are no payments made for the current transaction.", null, "No Payment Found", "OK");
      }
    },

    InitializePaymentSummary: function() {
      if (this.paymentsSummaryView) {
        this.paymentsSummaryView.Show();
      } else {
        this.paymentsSummaryView = new PaymentsSummaryView({
          el: $("#paymentsContainer"),
          collection: this.paymentCollection
        });
      }
    },

    ValidateOrderLookup: function(model) {
      if (!this.ValidateLocationBankAccount()) return;
      if (model.get("FreightRate") != 0) {
        if (this.reviewTransactionsView) this.reviewTransactionsView.optionsView.Hide();
        navigator.notification.alert(model.get("SalesOrderCode") + " includes freight tax that ConnectedSale will not be able to handle. Try to open it in Connected Business.", null, "Not Supported", "OK");
        //console.log(model.get("SalesOrderCode") + " includes freight tax that ConnectedSale will not be able to handle. Try to open it in Connected Business.");
        if (Global.LookupMode === Enum.LookupMode.ConvertQuote) Global.LookupMode = Enum.LookupMode.Quote;
        if (Global.LookupMode === Enum.LookupMode.ConvertOrder) Global.LookupMode = Enum.LookupMode.Order;
        if (Global.LookupMode === Enum.LookupMode.UpdateOrder) Global.LookupMode = Enum.LookupMode.Order;
        return false;
      } else {
        return true;
      }
    },

    LoadOrderForUpdateOrder: function(model) {
      Global.LookupMode = Enum.LookupMode.UpdateOrder;
      if (this.ValidateOrderLookup(model)) {
        if (this.reviewTransactionsView) this.reviewTransactionsView.Close();
        this.orderType = "Update";
        this.LoadOrder(model.get("SalesOrderCode"));

      }
    },

    LoadOrderForConvertOrder: function(model) {
      Global.LookupMode = Enum.LookupMode.ConvertOrder;
      if (this.ValidateOrderLookup(model)) {
        if (this.reviewTransactionsView) this.reviewTransactionsView.Close();
        this.orderType = "Convert";
        this.LoadOrder(model.get("SalesOrderCode"));
      }
    },

    LoadOrderForConvertQuote: function(model) {
      Global.LookupMode = Enum.LookupMode.ConvertQuote;
      if (this.ValidateOrderLookup(model)) {
        this.reviewTransactionsView.Close();
        this.orderType = 'Quote';
        this.LoadOrder(model.get("SalesOrderCode"), "Quote");
      }
    },

    LoadOrderForUpdateQuote: function(model) {
      Global.LookupMode = Enum.LookupMode.UpdateQuote;
      if (this.ValidateOrderLookup(model)) {
        this.reviewTransactionsView.Close();
        this.orderType = 'Quote';
        this.LoadOrder(model.get("SalesOrderCode"), "Quote");
      }
    },

    ValidateTransactionLocation: function(transactionCode, isOrder, onSuccess) {
      var tmp = new BaseModel();
      var self = this;
      var msg = this;
      tmp.url = Global.ServiceUrl + Service.SOP + 'validatetransactionlocation/';
      tmp.set({
        InvoiceCode: transactionCode,
        TransactionType: isOrder ? "Order" : "Sale",
        IsTaxByLocation: Global.Preference.TaxByLocation,
        WarehouseCode: Global.Preference.DefaultLocation
      });
      tmp.save(tmp, {
        success: function(model, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          if (response.ErrorMessage && response.ErrorMessage != "") {
            navigator.notification.alert(response.ErrorMessage, null, "Load Transaction", "OK");
            return;
          }
          if (!response.Value) {
            if (self.IsMultiLocation() == true && Global.LookupMode == Enum.LookupMode.ConvertOrder) {
              navigator.notification.alert("The sales order is created from a different location. You may cancel this transaction and change the location on the sales order.", null, "Load Transaction", "OK", true);
            } else {
              if (Global.LookupMode == Enum.LookupMode.ConvertOrder) msg = "Location on selected transaction does not match the workstation's default location. Do you want to update the location of the header?";
              else msg = "Location on selected transaction does not match the workstation's default location. Do you want to update it?";
              navigator.notification.confirm(msg,
                function(button) {
                  onSuccess(button === 1);
                }, "Load Transaction", ['Yes', 'No']);
              return;
            }
          }
          onSuccess();
        },
        error: function(model, error, response) {
          navigator.notification.alert("An error was encountered when trying to load transaction.", null, "Load Transaction", "OK");
          //console.log(error);
        }
      });
    },

    LoadOrder: function(salesOrderCode, type) {
      var self = this;
      if (self.IsReloadedTransaction) {
        self.IsReloadedTransaction = false;
        self.DoLoadOrder(salesOrderCode, type);
        return;
      }

      self.ValidateTransactionLocation(salesOrderCode, true, function(isChangeWarehouse) {
        self.IsReloadedTransaction = false;
        self.DoLoadOrder(salesOrderCode, type, isChangeWarehouse);
      });

    },

    DoLoadOrder: function(salesOrderCode, type, isChangeWarehouse) {
      if (!Global.ValidLocation) {
        this.NotifyMsg("The Current Status of the Default Location is Inactive.", "Unable to load Items");
        return;
      }
      if (!this.orderTransactionModel) {
        this.orderTransactionModel = new BaseModel();
      }
      var _type = "Order";
      var _self = this;

      if (type === "Quote") _type = type;

      var warehouseToUse = (isChangeWarehouse ? Global.Preference.DefaultLocation : '');

      if (this.IsMultiLocation() != true) {
        if (isChangeWarehouse == true && Global.LookupMode == Enum.LookupMode.ConvertOrder) {
          warehouseToUse = '';
        }
      }


      this.orderTransactionModel.set({
        TransactionCode: salesOrderCode,
        IsRecalculate: true,
        IsTaxByLocation: Global.Preference.TaxByLocation,
        WebsiteCode: Shared.GetWebsiteCode(),
        WarehouseToUse: warehouseToUse,
        WarehouseForHeader: (isChangeWarehouse ? Global.Preference.DefaultLocation : ''),
		TransactionType: Global.TransactionType
      });

      if (isChangeWarehouse) Global.HasChanges = true;

      this.orderTransactionModel.url = Global.ServiceUrl + Service.SOP + "loadorder" + "?type=" + _type + "&sessionID=" + Global.GUID;
      this.LockTransactionScreen(true, "Loading...");
      this.orderTransactionModel.save(null, {
        success: function(collection, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          _self.LoadCouponDetailsFromSalesOrder(collection, response);
        },
        error: function(collection, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          collection.RequestError(error, "Error Loading Order");
          _self.LockTransactionScreen(false);
        }
      });

    },

    LoadCouponDetailsFromSalesOrder: function(_collection, _response) {
      var couponID = _response.SalesOrders[0].CouponID;

      var self = this;
      var criteria = couponID;
      var couponLookup = new LookupCriteriaModel();
      var rowsToSelect = 100;

      if (!criteria) {
        this.LoadOrderCompleted(_collection, _response);
        return;
      }

      couponLookup.set({
        CustomerCode: Global.CustomerCode,
        CriteriaString: criteria
      });

      couponLookup.url = Global.ServiceUrl + Service.SOP + Method.LOADCOUPONBYCOUPONID;
      couponLookup.save(null, {
        success: function(model, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          var _coupon;
          if (response.Coupons)
            if (response.Coupons.length == 1)
              _coupon = response.Coupons[0];

          self.LoadOrderCompleted(_collection, _response, _coupon);
        },
        error: function(model, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          model.RequestError(error, "Error Retrieving Coupon Details");
          self.LoadOrderCompleted(_collection, _response, type);
        }
      });

    },


    SetCurrentCustomer: function(customer) {
      Global.CurrentCustomer = customer;
    },

    ValidateSerialLot: function(serialLotCollection, cartCollection, msg) {
      var errMsg = msg; //"Error saving the Invoice. The following items do not have the same number of serial numbers with the shipped quantity.";
      var errCounter = 0;
      var cart = cartCollection.filter(function(model) {
        return (model.get("ItemType") === Enum.ItemType.GiftCard || model.get("ItemType") === Enum.ItemType.GiftCertificate);
      });

      if (serialLotCollection) {
        if (cart) {
          for (var i = 0; i < cart.length; i++) {
            var gcCart = cart[i];
            var serialLot = false;

            var serial = serialLotCollection.filter(function(model) {
              return (model.get("ItemCode") === gcCart.get("ItemCode") && model.get("UnitMeasureCode") === gcCart.get("UnitMeasureCode") && model.get("LineNum") === gcCart.get("LineNum"));
            });

            var totalItemRefund = gcCart.get("Good") * gcCart.get("UnitMeasureQty");
            var totalItemOrdered = gcCart.get("QuantityOrdered") * gcCart.get("UnitMeasureQty");

            if (Global.TransactionType == Enum.TransactionType.SalesRefund) serialLot = (serial.length === totalItemRefund); //Originally Defective
            else serialLot = (serial.length === totalItemOrdered);

            if (!serialLot) errCounter++;
          }

          if (errCounter > 0) return errMsg;
          else return;
        }
      }

      if (cart.length > 0) return errMsg;
      else return;
    },

    ValidateSerialNumbers: function(serialLotCollection, cartCollection, msg) {
      var errMsg = msg; //"Error saving the Invoice. The following items do not have the same number of serial numbers with the shipped quantity.";
      var errCounter = 0;
      var collection = [];
      var cart = cartCollection.filter(function(model) {
        return (model.get("ItemType") === Enum.ItemType.GiftCard || model.get("ItemType") === Enum.ItemType.GiftCertificate);
      });

      if (serialLotCollection) {
        if (cart) {
          //for (var i = 0; i < cart.length; i++) {
          //    var gcCart = cart[i];
          //    var serialLot = false;

          //    var serial = serialLotCollection.filter(function (model) {
          //        return (model.get("ItemCode") === gcCart.get("ItemCode"));
          //    });

          //    if (Global.TransactionType == Enum.TransactionType.SalesRefund) serialLot = (serial.length === gcCart.get("Good")); //Originally Defective
          //    else serialLot = (serial.length === gcCart.get("QuantityOrdered"));

          //    if (!serialLot) errCounter++;
          //}

          //if (errCounter > 0) return false;//return errMsg;
          //else return true;
          for (var i = 0; i < cart.length; i++) {
            var gcCart = cart[i];

            var serial = serialLotCollection.find(function(model) {
              return model.get("ItemCode") === gcCart.get("ItemCode");
            });

            if (!serial) {
              collection.push(gcCart);
            }
          }
        }
      }

      //if (cart.length > 0) return false;//return errMsg;
      //else return true;

      return collection;
    },

    AssignTransactionShipTo: function(model) {
      if (Global.CurrentCustomer.ShipToCode != null && Global.CurrentCustomer.ShipToCode != "") {
        if (Global.CurrentCustomer.DefaultShipToCode != Global.CurrentCustomer.ShipToCode || model.get("ShipToCode") != Global.CurrentCustomer.ShipToCode || Global.CurrentShipToUpdated == true) {

          model.set({
            ShipToCode: Global.CurrentCustomer.ShipToCode,
            ShipToName: Global.CurrentCustomer.ShipToName,
            ShipToCountry: Global.CurrentCustomer.ShipToCountry,
            ShipToCounty: Global.CurrentCustomer.ShipToCounty,
            ShipToCity: Global.CurrentCustomer.ShipToCity,
            ShipToAddress: Global.CurrentCustomer.ShipToAddress,
            ShipToPhone: Global.CurrentCustomer.ShipToPhone,
            ShipToPhoneExtension: Global.CurrentCustomer.ShipToPhoneExtension,
            ShipToPostalCode: Global.CurrentCustomer.ShipToPostalCode,
            ShipToState: Global.CurrentCustomer.ShipToState,
            PaymentTermGroup: Global.ShipTo.PaymentTermGroup,
            PaymentTermCode: Global.ShipTo.PaymentTermCode,
            DiscountType: Global.ShipTo.DiscountType,
            DiscountPercent: Global.ShipTo.DiscountPercent,
            DiscountableDays: Global.ShipTo.DiscountableDays,
            DueType: Global.ShipTo.DueType,
          });
        }
      }
    },

    AssignCustomerShipToFromLoadedTransaction: function(model) {
      Global.ShipTo.ShipToCode = model.ShipToCode;
      Global.CurrentCustomer.ShipToCode = model.ShipToCode;
      Global.CurrentCustomer.ShipToName = model.ShipToName;
      Global.CurrentCustomer.ShipToAddress = model.Address || model.ShipToAddress;
      Global.CurrentCustomer.ShipToCountry = model.Country || model.ShipToCountry;
      Global.CurrentCustomer.ShipToCity = model.City || model.ShipToCity;
      Global.CurrentCustomer.ShipToPostalCode = model.PostalCode || model.ShipToPostalCode;
      Global.CurrentCustomer.ShipToState = model.State || model.ShipToState;
      Global.CurrentCustomer.ShipToCounty = model.County || model.ShipToCounty;
      Global.CurrentCustomer.ShipToPhone = model.Telephone || model.ShipToTelephone;
      Global.CurrentCustomer.ShipToPhoneExtension = model.TelephoneExtension || model.ShipToTelephoneExtension;

      //Payment Term Requirement Attributes.
      Global.CurrentCustomer.PaymentTermCode = model.PaymentTermCode;
      Global.ShipTo.PaymentTermCode = model.PaymentTermCode;
      Global.ShipTo.DiscountType = model.DiscountType;
      Global.ShipTo.DiscountPercent = model.DiscountPercent;
      Global.ShipTo.DueType = model.DueType;
      Global.ShipTo.DiscountableDays = model.DiscountableDays;
    },

    ProcessGenerateSerial: function(model) {
      var isGC = (model.get("ItemType") === Enum.ItemType.GiftCard || model.get("ItemType") === Enum.ItemType.GiftCertificate);

      var serialType = "";

      if (isGC) serialType = Enum.SerialLotType.Serial;
      else serialType = model.get("SerializeLot")

      this.InitializeSerializeLot(serialType, model.get("ItemCode"), model.get("ItemName"), model.get("LineNum"), model.get("ItemType"), model.get("UnitMeasureCode"), "", model);
    },

    RenderGCList: function(collection) {
      this.LockTransactionScreen(false);
      if (this.gcItemList) {
        this.gcItemList.remove();
        this.gcItemList.unbind();
        this.gcItemList = null;
      }

      $("#item-wrapper").append("<div id='gcListLookup'></div>");
      this.gcItemList = new GCItemListView({
        el: $("#gcListLookup"),
        collection: collection,
        serialCollection: this.serializeLotCollection
      });
      this.gcItemList.on('generateSerial', this.ProcessGenerateSerial, this);

      this.gcItemList.Show();
      this.hideOtherButtons();

    },

    LoadOrderCompleted: function(collection, response, _coupon, type) {
      if (response && response.SalesOrders && response.SalesOrders.length > 0) {
        switch (Global.LookupMode) {
          case Enum.LookupMode.UpdateOrder:
            this.SetTransactionType(Enum.TransactionType.UpdateOrder);
            break;
          case Enum.LookupMode.ConvertOrder:
            this.SetTransactionType(Enum.TransactionType.ConvertOrder);
            break;
          case Enum.LookupMode.ConvertQuote:
            this.SetTransactionType(Enum.TransactionType.ConvertQuote);
            break;
          case Enum.LookupMode.UpdateQuote:
            this.SetTransactionType(Enum.TransactionType.UpdateQuote);
            break;
          case Enum.LookupMode.VoidTransaction:
            this.SetTransactionType(Enum.TransactionType.VoidTransaction);
            break;
        }

        //if(response.KitDetails.length > 0) window.sessionStorage.setItem('kitItems-', JSON.stringify(response.KitDetails));


        //Order Header
        var order = response.SalesOrders[0];
        Global.TransactionCode = order.SalesOrderCode;
        Global.TransactionObject = order;

        var self = this;

        Global.TransactionDocumentDate = order.SalesOrderDate;

        this.SetTransactionCodeDisplay(Global.TransactionCode);

        // CSL-1068 - Order Notes
        if (order.PublicNotes) {
          Global.PublicNote.PublicNotes = order.PublicNotes;
        }

        //Order Customer
        if (response.Customers && response.Customers.length > 0) {
          var _shipToAddress = "(No Address)";
          var customer = response.Customers[0];
          var pricingHasChanged = (Global.DefaultPrice != customer.DefaultPrice);

          Global.CustomerCode = customer.CustomerCode;
          Global.CustomerName = customer.CustomerName;
          Global.CustomerEmail = customer.Email;
          Global.DefaultContactEmail = customer.DefaultContactEmail;
          Global.DefaultPrice = customer.DefaultPrice;
          Global.POSSalesReceipt = customer.POSSalesReceipt;

          if (pricingHasChanged) this.InitializeItems();

          //	if(order.ShipToAddress != null){ _shipToAddress = order.ShipToAddress; }
          // setting of shipto address is lready handled in headerinfo.js
          //if (!Shared.IsNullOrWhiteSpace(order.ShipToAddress)) { Global.DefaultShipToAddress = order.ShipToAddress; _shipToAddress = Global.DefaultShipToAddress;}

          $("#lbl-customerName").html(Shared.TrimCustomerName());

          //CSL - 8889 : 06.06.2013
          //Global.DefaultShipTo = order.ShipToName + ",<br/>" + _shipToAddress;  << original code
          //start modification 06.06.13
          //Global.DefaultShipTo = order.ShipToName + ",";
          ////Global.DefaultShipToAddress = _shipToAddress;
          //$("#label-shipto i").html(Shared.TrimDefaultShipTo());
          //$("#label-shipto i").append('<br/>' + Shared.Escapedhtml(_shipToAddress));
          Global.IsLoadByTransaction = true;
          Global.Transaction = order;
          //end modification.
          this.SetCurrentCustomer(customer);
          this.AssignCustomerShipToFromLoadedTransaction(order);
        }

        //Order Detail
        if (response.SalesOrderDetails) {
          //Sort InvoiceDetails by LineNum
          var _orderDetails = _.sortBy(response.SalesOrderDetails, function(item) {
            return item.LineNum;
          });

          if (response.KitDetails) {
            _.each(response.SalesOrderDetails, function(item) {
              if (item.ItemType === Enum.ItemType.Kit) {
                /*_.each(response.KitDetails, function (detail) {
									if (item.ItemCode === detail.ItemKitCode) detail.LineNum = item.LineNum;
								});*/
                var kit = _.where(response.KitDetails, {
                  'LineNum': item.LineNum
                });

                window.sessionStorage.setItem('kitItems-' + item.LineNum, JSON.stringify(kit));
              }
            }.bind(this));
          }
			var _freeItemDetails = new BaseCollection(response.CustomerPromotionDetails);
		  if (response.CustomerPromotionDetails){
		  	_freeItemDetails.each(function(freeItem){
				_.each(response.SalesOrderDetails, function(item) {
					if((freeItem.get('GetItemCode') == item.ItemCode && freeItem.get('GetLineNum') == item.LineNum)){
						item.PromoDocumentCode = freeItem.get('PromoDocumentCode');
						item.PromoID = freeItem.get('PromoID');
						item.RuleID = freeItem.get('RuleID');
						item.IsPromoItem = true;
					}
				});
			});
		  }
          if (this.orderType === 'Convert') {
            this.SetCurrentOrderItems(_orderDetails);

            //CSL-6268 by Alexis A. Banaag Jr.
            this.CheckNonStockItems(response);
          }

          Global.SalesOrderDetailsResponse = _orderDetails;
          this.isCalculateByTaxCode = true;

          if (!Shared.IsNullOrWhiteSpace(response.Payments))
            if (response.Payments.length > 0) this.isCalculateByTaxCode = true

          this.LoadItemsToCart(_orderDetails, this.isCalculateByTaxCode);

          Global.IsLoadingTransaction = true;

          this.ChangeItemGroupTax(this.cartCollection);

        }

        //check if there is coupon
        if (_coupon) {
          this.LoadCouponFromTransationHeader(order);
          if (this.couponModel && _coupon) this.couponModel.set({
            IncludeAllCustomer: _coupon.IncludeAllCustomer,
            IncludeAllProduct: _coupon.IncludeAllProduct
          });
        }

        //Order Payments
        if (!this.paymentCollection) this.InitializePaymentCollection();

        this.paymentCollection.reset();

        if (response.Payments && response.Payments.length > 0) {
          var _validPayments = this.RemoveInvalidPayment(response.Payments);
          if (_validPayments.length > 0) this.paymentCollection.add(_validPayments);
        }

        Global.AllowToFetchPaymentTerm = false;
        if (this.paymentCollection.length > 0) {
          this.paymentCollection.each(function(model) {
            var _cardNumber = model.get("CreditCardNumber");
            if (model.get("CreditCardNumber") != null) {
              model.set({
                EncryptedCreditCardNumber: _cardNumber
              });
            }
          });
        }

        if (response.SalesRep != null)
        {
          var SalesRepSplit = "";
          var SalesRepName = "";

          var CommissionPercentResult = _.pluck(response.SalesRep,"CommissionPercent");
          var SalesRepResult = _.pluck(response.SalesRep,"SalesRepGroupName");

          if (CommissionPercentResult.length > 1) {
            _.each(CommissionPercentResult, function (data, i) {
              if (i >= CommissionPercentResult.length - 1)
              { SalesRepSplit += data + "%" } else
              { SalesRepSplit += (data + "%" + ", ") }
              i++;
            })
          }
          else
          {
            SalesRepSplit = CommissionPercentResult;
          }

          _.each(SalesRepResult, function (data, i) {
            if (i >= SalesRepResult.length - 1)
            { SalesRepName += data } else
            { SalesRepName += (data + ", ") }
            i++;
          })

          Global.SalesRepGroupName = SalesRepName;
          Global.CommissionPercent = SalesRepSplit;
          Global.SalesRepList = response.SalesRep;

          $("#lbl-salesrepName").html(Shared.TrimSalesRepName());
          $("#splitrateName").html(Shared.TrimCommissionPercent());
        }

        var _latestPaymentDate = null;
        if (Global.TransactionType == Enum.TransactionType.UpdateOrder || Global.TransactionType == Enum.TransactionType.ConvertOrder) {
          if (Global.TransactionObject.DiscountPercent > 0 && Global.TransactionObject.DiscountRate == 0) {
            _latestPaymentDate = this.GetLatestPaymentDate(order);
          }
        }

        if (_latestPaymentDate) {
          Global.LatestPaymentDate = _latestPaymentDate;
          Global.AllowToFetchPotentialDiscount = true;
        }

        if (Global.TransactionObject.DiscountRate > 0) this.AddTermDiscountToPayment(Global.TransactionObject.DiscountRate);

        this.InitializePreviousTransactionDetails(response, "Order");
        this.OnRequestCompleted("LoadOrderCompleted");

        if (Global.TransactionType === Enum.TransactionType.ConvertOrder) this.ProcessAutoandManualGC(response);
        if (!($("#gclookup").is(":visible"))) this.LockTransactionScreen(false);

      } else {
        //console.log("Unable to load order.");
        navigator.notification.alert("Unable to load order.", null, "Error", "OK");
        this.LockTransactionScreen(false);
      }

    },

    ProcessAutoandManualGC: function(response, isShow) {
      var self = this;
      var index = 0;

      isShow = (Shared.IsNullOrWhiteSpace(isShow)) ? true : false;

      var hasGCAuto = this.cartCollection.filter(function(gc) {
        return (gc.get("ItemType") === Enum.ItemType.GiftCard || gc.get("ItemType") === Enum.ItemType.GiftCertificate) && gc.get("AutoGenerate") === true;
      });

      var hasGCManual = this.cartCollection.filter(function(gc) {
        return (gc.get("ItemType") === Enum.ItemType.GiftCard || gc.get("ItemType") === Enum.ItemType.GiftCertificate) && gc.get("AutoGenerate") === false;
      });

      if (hasGCAuto && hasGCAuto.length > 0) {
        if (!this.serializeLotCollection) this.InitializeSerializeLotCollection();

        var onSuccess = function(model, response, options) {
          if (index === 0) index++;
          if (self.serializeLotCollection.length >= 1) {
            _.each(response.SerialLotNumbers, function(srl) {

              //Check how many serials were already added for this Line Item
              var srlCntPerItem = self.serializeLotCollection.where({
                ItemCode: srl.ItemCode,
                LineNum: srl.LineNum
              }).length || 0;
              //Get Item Detail from Cart Collection
              var cartItem = self.cartCollection.find(function(cart) {
                return (cart.get("ItemCode") === srl.ItemCode && cart.get("LineNum") === srl.LineNum);
              });

              //Exit if item is not found
              if (!cartItem) return;

              //Exit if Serial Count Per Item is equal or greater than the Quantity Ordered for the line item.
              if (srlCntPerItem >= parseInt(cartItem.get('QuantityOrdered'))) return;

              var isDupe = self.serializeLotCollection.find(function(serial) {
                return serial.get("SerialLotNumber") === srl.SerialLotNumber;
              });

              if (Shared.IsNullOrWhiteSpace(isDupe)) {
                if (Shared.IsNullOrWhiteSpace(srl.UnitMeasureCode)) {
                  srl.UnitMeasureCode = cartItem.get("UnitMeasureCode");
                }

                self.serializeLotCollection.add(srl);
              }
            });
          } else {
            self.AddUnitMeasureCodeToSerial(hasGCAuto, response.SerialLotNumbers); //self.serializeLotCollection.reset(response.SerialLotNumbers);
          }

          if (hasGCManual && hasGCManual.length > 0) {
            if (isShow) self.RenderGCList(new BaseCollection(hasGCManual));
          } else {
            self.LockTransactionScreen(false);
            return;
          }
        };

        var onError = function(model, xhr, options) {
          navigator.notification.alert(xhr, null, "Error", "OK");
        };

        Shared.SerialNumbers.GenerateGiftSerialNumber(new BaseCollection(hasGCAuto), this.serializeLotCollection, onSuccess, onError, true);

      } else if (hasGCManual && hasGCManual.length > 0) {
        if (isShow) this.RenderGCList(new BaseCollection(hasGCManual));
        return;
      }
    },

    GetLatestPaymentDate: function() {
      if (this.paymentCollection == 0) return null;
      if (this.paymentCollection.length == 1) return this.paymentCollection.at(0).get("PaymentDate");

      var _dateArray = this.paymentCollection.pluck("PaymentDate");
      var _aspArray = this.paymentCollection.pluck("PaymentDate");

      //converts AspDates to Date
      for (var i = 0; i < _dateArray.length; i++) {
        var _date = this.JSONtoDate(_dateArray[i])

        _aspArray[i] = _dateArray[i];
        _dateArray[i] = new Date(_date);
      }

      //gets the latest date
      var latestDateIndex = 0;
      for (var j = 0; j < _dateArray.length; j++) {
        if (_dateArray[j] > _dateArray[latestDateIndex]) latestDateIndex = j;
      }

      return _aspArray[latestDateIndex];
    },

    JSONtoDate: function(transactionDate) {
      //var DateFormat = 'dd MMMM YYYY';
      var DateFormat = 'YYYY-MM-DD';
      var _tDate = moment(transactionDate).format(DateFormat);
      return _tDate;
    },

    /*
     * CSL-6268 by Alexis A. Banaag Jr.
     * This will retrieve the FreeStock information of all items in the Sales Order
     * once there is a single item with zero(0) stock it will notify user.
     */
    CheckNonStockItems: function(order) {
      var baseModel = new BaseModel();
      var self = this;

      var itemsToCheck = new Array();

      //*** Added by JHENSON, CSL-15177, 11/27/2013
      //*** Validate QuantityAllocated and QuantityOrdered
      //*** Check only for items that does not have enought allocation
      if (order.SalesOrderDetails) {
        for (var i in order.SalesOrderDetails) {
          if (order.SalesOrderDetails[i].QuantityAllocated < order.SalesOrderDetails[i].QuantityOrdered) {
            var item = {};
            for (var attr in order.SalesOrderDetails[i]) {
              item[attr] = order.SalesOrderDetails[i][attr];
            }
            itemsToCheck[itemsToCheck.length] = item;
          }
        }
      }
      //*** END - CSL-15177

      if (itemsToCheck.length == 0) return;

      baseModel.set({
        "StockTotalDetails": itemsToCheck //order.SalesOrderDetails,
      });

      baseModel.url = Global.ServiceUrl + Service.PRODUCT + Method.LOADGROUPLOCATIONSTOCK;
      baseModel.save(null, {
        success: function(model, response, options) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          var managerMsg = " However, this requires manager's approval.";
          if (!Global.Preference.AutoAllocateOverrideLevel ||
            Global.Preference.AutoAllocateOverrideLevel == "" ||
            Global.Preference.AutoAllocateOverrideLevel == Global.UserInfo.RoleCode) {
            managerMsg = "";
          }

          if (_.isBoolean(response)) {
            if (response) {
              //console.log("Item(s) added have no freestock.");
              navigator.notification.alert("Item(s) you've added does not have enough stock. ConnectedSale will automatically adjust stock when the sale transaction is created." + managerMsg, null, "Stock Verification", "OK");
            }

          } else {
            var _stocks = _.find(response.StockTotalDetails, function(item) {
              if (item.FreeStock === "0" || item.FreeStock === 0) return item;
            });

            if (_stocks) {
              //console.log("Item(s) added have no freestock.");
              navigator.notification.alert("Item(s) you've added does not have enough stock. ConnectedSale will automatically adjust stock when the sale transaction is created." + managerMsg, null, "Stock Verification", "OK");
            }
          }
        },

        error: function(model, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          model.RequestError(error, "Error Retrieving Stock Details");
        }
      });
    },

    SetCurrentOrderItems: function(items) {
      var _currentOrderCollection = new CurrentOrderCollection();
      _currentOrderCollection.add(items);
      Global.CurrentOrders = _currentOrderCollection;
    },

    UpdateOrder: function() {
      if (Global.HasChanges) {

        this.InitializeTransaction();
        var _salesOrderCollection = new SalesOrderCollection();
        var _salesOrderDetailCollection = new SalesOrderDetailCollection();
        var _payments = new PaymentCollection();
        var _newPayments = this.GetNewPayments();
        var _coupons = new CouponCollection();
        if (this.couponModel) _coupons.add(this.couponModel);

        var _self = this;
        var kitItems = new BaseCollection();

        this.cartCollection.each(function(so) {
          var item = JSON.parse(window.sessionStorage.getItem('kitItems-' + so.get('LineNum')));
          if (item) kitItems.add(item);
        });

        //!SIGNATURE
        Global.SVG_Hold = new Array();
        Global.SVG_ReadyToSave = false;
        var ExecThis = function() {
            if (!this.IsHoldSVG() && Global.SVG_ReadyToSave) {
              this.transactionModel.save(null, {connectionID: this.signalRConnectionID});
            }
          }.bind(this);
          //!

        _salesOrderCollection.add(Global.TransactionObject);
        _salesOrderCollection.at(0).set({
          POSWorkstationID: Global.POSWorkstationID,
          POSClerkID: Global.Username,
          IsFreightOverwrite: true,
          IsOverrideSalesRep: false,
          SignatureSVG: this.ValidateSVG(Global.Signature, ExecThis),
          IsTaxByLocation: Global.Preference.TaxByLocation,
          PublicNotes: Global.PublicNote.PublicNotes,
          WebSiteCode: Global.Preference.WebSiteCode,
          IsUsePOSShippingMethod: Global.Preference.IsUsePOSShippingMethod,
          POSShippingMethod: Global.Preference.POSShippingMethod
        });
        if (!Shared.IsNullOrWhiteSpace(this.customerPOModel)) {
          _salesOrderCollection.at(0).set(_self.customerPOModel.attributes);
        }
        //MAR-21-2013 - INTMOBA-800
        this.AssignTransactionShipTo(_salesOrderCollection.at(0));

        this.SetCouponToTransactionHeader(_salesOrderCollection.at(0), false);

        //this.AssignNoteItem();

        _salesOrderDetailCollection.add(this.cartCollection.models);

        // _salesOrderDetailCollection.each(function(model) {
        //   var taxCode = window.sessionStorage.getItem("selected_taxcode");
        //   taxCode = (taxCode) ? taxCode : Global.ShipTo.TaxCode;
        //   model.set("TaxCode", taxCode);
        // });
        this.RemoveTermDiscountPayment();
        if (_newPayments && _newPayments.length > 0) {
          _payments.add(_newPayments);

          //!SIGNATURE
          for (var i = 0; i < _payments.length; i++) {
            if (_payments.at(i).get('SignatureSVG')) {
              var _svgtmp = _payments.at(i).get('SignatureSVG');
              _payments.at(i).set({
                SignatureSVG: this.ValidateSVG(_svgtmp, ExecThis)
              });
            }
          }

        }

        this.transactionModel.set({
          "SalesOrders": _salesOrderCollection.toJSON(),
          "SalesOrderDetails": _salesOrderDetailCollection.toJSON(),
          "Payments": _payments.toJSON(),
          "Coupons": _coupons.toJSON(),
          "KitDetails": kitItems.toJSON(),
		  "SessionID": Global.GUID,
        });

        this.RemoveWarehouseCodeByItemType(this.transactionModel.get("SalesOrderDetails"));

        this.transactionModel.url = Global.ServiceUrl + Service.SOP + Method.UPDATESALESORDER;

        //use save method of model to save data to the server
        this.LockTransactionScreen(true, "Saving...");
        Global.SVG_ReadyToSave = true;
        this.ResetCustomerPODetails();
        ExecThis();

      } else {
        //console.log("There are no changes to save.");
        navigator.notification.alert("There are no changes to save.", null, "Cannot Save Transaction", "OK");
        $("#main-transaction-blockoverlay").hide();

      }
    },

    ConvertOrderWithValidaton: function(salesOrderCode, paymentType) {
      if (this.ValidateTransaction()) {
        if (this.ValidatePayment(paymentType)) {
          if (this.PromptCustomerPO(paymentType)) {
            if (this.PromptSignature()) {
              if (this.PromptToPrint()) {
                if (this.ValidateOutOfStockItems()) this.ConvertOrder(salesOrderCode);
              }
            }
          }
        }
      }
    },

    ConvertOrder: function(salesOrderCode) {
      this.InitializeTransaction();

      var _salesOrderCollection = new SalesOrderCollection();
      var _salesOrderDetailCollection = new SalesOrderDetailCollection();
      var _payments = new PaymentCollection();
      var _newPayments = this.GetNewPayments();
      var _customers = new CustomerCollection();
      var _coupons = new CouponCollection();

      var _serializeLot = "";
      var kitItems = new BaseCollection();

      if (this.serializeLotCollection) {
        _serializeLot = this.serializeLotCollection.toJSON();
      }

      if (this.couponModel) _coupons.add(this.couponModel);

      this.cartCollection.each(function(cart) {
        var item = JSON.parse(window.sessionStorage.getItem('kitItems-' + cart.get('LineNum')));
        if (item) kitItems.add(item);
      });

      _customers.add(Global.CurrentCustomer);

      var _self = this;

      //!SIGNATURE
      Global.SVG_Hold = new Array();
      Global.SVG_ReadyToSave = false;
      var ExecThis = function() {
          if (!this.IsHoldSVG() && Global.SVG_ReadyToSave) {
            this.transactionModel.save(null, {connectionID: this.signalRConnectionID});
          }
        }.bind(this);
        //!

      _salesOrderCollection.add(Global.TransactionObject);
      _salesOrderCollection.at(0).set({
        POSWorkstationID: Global.POSWorkstationID,
        POSClerkID: Global.Username,
        IsFreightOverwrite: true,
        IsOverrideSalesRep: false,
        IsTaxByLocation: Global.Preference.TaxByLocation,
        SignatureSVG: this.ValidateSVG(Global.Signature, ExecThis),
        PublicNotes: Global.PublicNote.PublicNotes,
        WebSiteCode: Global.Preference.WebSiteCode
      });

      if (!Shared.IsNullOrWhiteSpace(this.customerPOModel)) {
        _salesOrderCollection.at(0).set(_self.customerPOModel.attributes);
      }
      _salesOrderDetailCollection.add(this.cartCollection.models);

      // _salesOrderDetailCollection.each(function(model) {
      //   var taxCode = window.sessionStorage.getItem("selected_taxcode");
      //   taxCode = (taxCode) ? taxCode : Global.ShipTo.TaxCode;
      //   model.set("TaxCode", taxCode);
      // });

      this.SetCouponToTransactionHeader(_salesOrderCollection.at(0), false);

      this.RemoveTermDiscountPayment();

      this.paymentCollection.each(function(model) {
        if (model.get("CreditCardIsAuthorizedVerbally") == true) {
          model.set({
            CardTransactionType: "Force"
          });
        } else if (model.get("IsNew") == true && Global.AllowSaleCreditPreference == true) {
          model.set({
            CardTransactionType: "Sale"
          })
        } else {
          model.set({
            CardTransactionType: "Auth/Capture"
          });
        }

        _payments.add(model);
      })

      this.AssignTransactionShipTo(_salesOrderCollection.at(0));

      this.transactionModel.set({
        Customers: _customers,
        SalesOrders: _salesOrderCollection.toJSON(),
        SalesOrderDetails: _salesOrderDetailCollection.toJSON(),
        Payments: _payments.toJSON(),
        Coupons: _coupons.toJSON(),
        SerialLotNumbers: _serializeLot,
        KitDetails: kitItems.toJSON(),
		SessionID: Global.GUID
      });



      if (Global.HasChanges) {

        //!SIGNATURE
        for (var i = 0; i < _payments.length; i++) {
          if (_payments.at(i).get('SignatureSVG')) {
            var _svgtmp = _payments.at(i).get('SignatureSVG');
            _payments.at(i).set({
              SignatureSVG: this.ValidateSVG(_svgtmp, ExecThis)
            });
          }
        }

        this.transactionModel.set({
          Customers: _customers,
          SalesOrders: _salesOrderCollection.toJSON(),
          SalesOrderDetails: _salesOrderDetailCollection.toJSON(),
          Payments: _payments.toJSON(),
          SerialLotNumbers: _serializeLot,
		  SessionID: Global.GUID
        });

        this.RemoveWarehouseCodeByItemType(this.transactionModel.get("SalesOrderDetails"));
      }

      this.transactionModel.url = Global.ServiceUrl + Service.SOP + Method.CONVERTSALESORDERTOINVOICE + salesOrderCode;

      try {
        //use save method of model to save data to the server then alert the created invoice code
        this.LockTransactionScreen(true, "Saving...");
        Global.SVG_ReadyToSave = true;
        this.ResetCustomerPODetails();

        var msg = "Error saving the Invoice. The following items do not have the same number of serial numbers with the shipped quantity.";
        var errMsg = this.ValidateSerialLot(this.serializeLotCollection, this.cartCollection, msg);

        if (errMsg === undefined || errMsg === "") ExecThis();
        else throw errMsg;

        //var gcCartCollection = this.cartCollection.filter(function (model) {
        //    return model.get("ItemType") === Enum.ItemType.GiftCard || model.get("ItemType") === Enum.ItemType.GiftCertificate;
        //});

        //var serialNumberLength = (this.serializeLotCollection) ? this.serializeLotCollection.length : 0

        //if (serialNumberLength != gcCartCollection.length) {
        //    var collection = this.ValidateSerialNumbers(this.serializeLotCollection, this.cartCollection, "");
        //    if (collection.length > 0) {
        //        this.RenderGCList(new BaseCollection(collection));
        //        return;
        //    } else if (collection.length === 0) {
        //        this.RenderGCList(this.cartCollection);
        //        return;
        //    }
        //}

        //ExecThis();
      } catch (err) {
        this.LockTransactionScreen(false);
        navigator.notification.alert(err, null, "Action not allowed", "OK");
        //console.log(err);
      }

    },

    ConvertQuoteWithValidaton: function(salesOrderCode, paymentType) {
      if (this.ValidateTransaction()) {
        if (this.ValidatePayment(paymentType)) {
          if (this.PromptCustomerPO(paymentType)) {
            if (this.PromptSignature()) {
              if (this.PromptToPrint()) {
                this.ConvertQuote(salesOrderCode);
              }
            }
          }
        }
      }
    },

    ConvertQuote: function(salesOrderCode) { //jjx

        this.InitializeTransaction();
      var _salesOrderCollection = new SalesOrderCollection();
      var _salesOrderDetailCollection = new SalesOrderDetailCollection();
      var _payments = new PaymentCollection();
      var _newPayments = this.GetNewPayments();
      var _customers = new CustomerCollection();
      var _coupons = new CouponCollection();
      if (this.couponModel) _coupons.add(this.couponModel);

      var _self = this;
      var kitItems = new BaseCollection();


      this.cartCollection.each(function(cart) {
        var item = JSON.parse(window.sessionStorage.getItem('kitItems-' + cart.get('LineNum')));
        if (item) kitItems.add(item);
      });

      _customers.add(Global.CurrentCustomer);

      _salesOrderCollection.add(Global.TransactionObject);
      _salesOrderCollection.at(0).set({
        POSWorkstationID: Global.POSWorkstationID,
        POSClerkID: Global.Username,
        IsFreightOverwrite: true,
        IsOverrideSalesRep: false,
        IsTaxByLocation: Global.Preference.TaxByLocation,
        PublicNotes: Global.PublicNote.PublicNotes,
        WebSiteCode: Global.Preference.WebSiteCode
      });
      if (!Shared.IsNullOrWhiteSpace(this.customerPOModel)) {
        _salesOrderCollection.at(0).set(_self.customerPOModel.attributes);
      }
      this.SetCouponToTransactionHeader(_salesOrderCollection.at(0), false);
      this.AssignTransactionShipTo(_salesOrderCollection.at(0));

      this.transactionModel.set({
        Customers: _customers,
        SalesOrders: _salesOrderCollection.toJSON(),
        SalesOrderDetails: _salesOrderDetailCollection.toJSON(),
        Coupons: _coupons.toJSON()
      });

      //!SIGNATURE
      Global.SVG_Hold = new Array();
      Global.SVG_ReadyToSave = false;
      var ExecThis = function() {
          if (!this.IsHoldSVG() && Global.SVG_ReadyToSave) {
            this.transactionModel.save(null, {
              connectionID: this.signalRConnectionID,
              success: function(model, response) {
                if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
                this.SaveTransactionCompleted(model, response);

              }.bind(this),
              error: function(model, error, response) {
                if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
                this.SaveTransactionError(model, error, response);
              }.bind(this)
            });
          }
        }.bind(this);
        //!

      if (Global.HasChanges) {
        //this.AssignNoteItem();

        _salesOrderDetailCollection.add(this.cartCollection.models);

        // _salesOrderDetailCollection.each(function(model) {
        //   var taxCode = window.sessionStorage.getItem('selected_taxcode');
        //   model.set('TaxCode', (taxCode) ? taxCode : Global.ShipTo.TaxCode);
        // });

        if (_newPayments && _newPayments.length > 0) {
          _payments.add(_newPayments);

          for (var i = 0; i < _payments.length; i++) {
            if (_payments.at(i).get('SignatureSVG')) {
              var _svgtmp = _payments.at(i).get('SignatureSVG');
              _payments.at(i).set({
                SignatureSVG: this.ValidateSVG(_svgtmp, ExecThis)
              });
            }
          }

        }

        this.transactionModel.set({
          Customers: _customers,
          SalesOrders: _salesOrderCollection.toJSON(),
          SalesOrderDetails: _salesOrderDetailCollection.toJSON(),
          Payments: _payments.toJSON(),
          KitDetails: kitItems.toJSON()
        });

        this.RemoveWarehouseCodeByItemType(this.transactionModel.get("SalesOrderDetails"));

      }

      this.transactionModel.url = Global.ServiceUrl + Service.SOP + Method.CONVERTQUOTETOSALESORDER + salesOrderCode + "/" + Global.GUID;
      this.LockTransactionScreen(true, "Saving...");
      Global.SVG_ReadyToSave = true;
      this.ResetCustomerPODetails();
      ExecThis();

    },


    TogglePaymentButtons: function(enabled) {
      if (enabled) {
        this.$(".payment").removeClass("ui-disabled");
      } else {
        this.$(".payment").addClass("ui-disabled");
        //if(hasCoupon)
        if (this.cartCollection.length === 0) {
          this.RemoveCoupon();
          return;
        }
        //console.log(this.couponModel.get("CouponCode"));
        if (this.couponModel.get("CouponCode") != undefined || !this.isQuoteRemoveCoupon) { //added condition !this.couponModel
          this.RemoveCoupon();
          this.ChangeItemGroupTax(this.cartCollection); // added snippet.. CSL - 6540 : 4.29.13
          this.isQuoteRemoveCoupon = true;
        }

      }
    },

    buttonCoupon_Tap: function(e) {
      e.stopPropagation();
      var hasNegativeQty;
      if (this.cartCollection && this.cartCollection.length > 0) {
        this.cartCollection.each(function(model) {
          if (model.get('QuantityOrdered') < 0) {
            hasNegativeQty = true;
            return;
          }
        });
      }
      if (hasNegativeQty) {
        navigator.notification.alert("Coupon is not applicable for transactions with items having negative quantity.", null, "Negative Quantity", "OK");
        return;
      }
      this.ShowCouponView();
    },

    ShowCouponView: function() {
      if (this.couponView) {
        this.couponView.Show();
      } else {
        this.couponView = new CouponView({
          el: $("#couponContainer"),
          model: this.couponModel
        });
        this.couponView.on("AcceptCoupon", this.AcceptCoupon, this);
        this.couponView.on("RemoveCoupon", this.RemoveCoupon, this);
      }
    },

    CheckReason: function(type) {
      this.LoadReason(100, "", type);
    },

    ProceedToAction: function(model) {
      var action = model.get("Action");
      switch (action) {
        case "Transaction":
          Global.ReasonCode.Transaction = this.preferenceCollection.at(0).get("IsReasonTransactionVoid"); //set it back to its original value after processing.
          break;
        case "Return":
          Global.ReasonCode.Return = this.preferenceCollection.at(0).get("IsReasonReturns"); //set it back to its original value after processing.
          break;
      }
    },

    ShowReasonView: function(collection, type) {
      $("#reasonPageContainer").append("<div id='reasonMainContainer'></div>");
      if (this.TransactionReasonView) {
        this.TransactionReasonView.remove();
        this.TransactionReasonView.unbind();
        this.TransactionReasonView = null;
      }

      this.TransactionReasonView = new TransactionReasonView({
        el: $("#reasonMainContainer"),
        collection: collection,
        type: type
      });
    },

    LoadReason: function(rows, criteria, type) {
      var _self = this;
      var _reasonLookup = new LookupCriteriaModel();
      var _rowsToSelect = rows;

      //Initialize collection
      this.transactionReasonCollection = new ReasonCollection();
      this.transactionReasonCollection.unbind();
      this.transactionReasonCollection.on('acceptReason', this.AcceptReason, this);
      this.transactionReasonCollection.on('savedTransaction', this.ProceedToAction, this);

      _reasonLookup.set({
        StringValue: criteria
      })

      _reasonLookup.url = Global.ServiceUrl + Service.POS + Method.REASONLOOKUP + _rowsToSelect;
      _reasonLookup.save(null, {
        success: function(model, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          _self.transactionReasonCollection.reset(response.Reasons);
          _self.ShowReasonView(_self.transactionReasonCollection, type);
        },
        error: function(model, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          model.RequestError(error, "Error Loading Reason Codes");
        }
      });
    },

    AcceptReason: function(model) {
      switch (Global.ActionType) {
        case Enum.ActionType.Returns:
          if (this.ValidateManagerOverride(Global.ActionType)) {
            this.SaveReason();
            this.CreateRefund();
          }
          break;
        case Enum.ActionType.VoidTransaction:
          if (this.ValidateManagerOverride(Global.ActionType)) {
            this.SaveReason();
            this.VoidTransaction();
          }
          break;
        default:
          if (this.ValidateManagerOverride(Global.ActionType)) {
            this.SaveReason();
            this.CreateCreditMemo();
          }
          break;
      }
    },

    SaveReason: function() {
      if (this.TransactionReasonView) {
        this.TransactionReasonView.SaveReason();
      }
    },

    AcceptCoupon: function(coupon) { //jjcoupon
      if (this.ValidateAcceptCouponInfo(coupon)) {
        this.couponModel = coupon.clone();
        Global.Coupon = this.couponModel;
        this.couponView.Close();
        if (this.cartCollection && this.cartCollection.length > 0) {
          this.RecalculateCoupon(true);

          //if (!this.requestQueue) this.InitializeRequestQueue();

          //this.requestQueue.trigger('startQueue', this.requestQueue);

        }
      }
    },

    RecalculateCoupon: function(isAcceptCoupon) {
      if (!this.requestQueue) this.InitializeRequestQueue();
      var self = this;

      var processRecalculateCoupon = function(cart) {
        var _couponModel = new CouponModel();

        var _coupons = new CouponCollection();

        if (self.couponModel) {
          _coupons.add(self.couponModel.clone());
        } else {
          _coupons.add(new CouponModel());
        }


        // CSL-6021 : 4.23.13 : BEGIN
        if (self.couponModel.get('CouponType') === "Orders") {
          Global.CouponIncludeAll = true;
        } else {
          Global.CouponIncludeAll = self.couponModel.get('IncludeAllProduct');
        }
        // CSL-6021 : 4.23.13 : END


        //APR-09-2013 - JHENSON
        //BEGIN - GEMIN : CSL-5048

        var transactionType = Global.TransactionType;
        if (Global.TransactionObject)
          if (Global.TransactionObject.Type) transactionType = Global.TransactionObject.Type;
        if (transactionType == Enum.TransactionType.Quote) transactionType = Enum.TransactionType.Order;

        var _invoiceCollection = new InvoiceCollection();
        _invoiceCollection.add({
          BillToCode: Global.CustomerCode,
          POSWorkstationID: Global.POSWorkstationID,
          IsFreightOverwrite: true,
          IsOverrideSalesRep: Global.Preference.IsOverrideSalesRep,
          IsTaxByLocation: Global.Preference.TaxByLocation,
          Type: transactionType,
          WarehouseCode: Global.Preference.DefaultLocation
        });
        self.AssignTransactionShipTo(_invoiceCollection.at(0));
        self.SetCouponToTransactionHeader(_invoiceCollection.at(0));

        var kitItems = new BaseCollection();
        cart.each(function(model) {
          model.set({
            CustomerCode: Global.CustomerCode,
            ShipToCode: Global.ShipTo.ShipToCode,
            IsTaxByLocation: Global.Preference.TaxByLocation
          });

          var item = JSON.parse(window.sessionStorage.getItem('kitItems-' + model.get('LineNum')));

          if (item) kitItems.add(item);
        });

        //END - GEMIN : CSL-5048

        _couponModel.set({
          Coupons: _coupons.toJSON(),
          SOPDetails: cart.toJSON(),
          CustomerCode: Global.CustomerCode,
          Headers: _invoiceCollection.toJSON(),
          KitDetails: kitItems.toJSON() //GEMIN : CSL-5048
        });

        self.RemoveWarehouseCodeByItemType(_couponModel.get("SOPDetails"));
        self.RemoveTermDiscountPayment();
        _couponModel.url = Global.ServiceUrl + Service.SOP + Method.RECALCULATEAMOUNTDISCOUNTCOUPON; //(OLD ) GETCOUPONDISCOUNTS; //GEMIN : CSL-5048
        _couponModel.save(null, {
          timeout: 0,
          success: function(model, response) {
            if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
            if (Shared.IsNullOrWhiteSpace(response.ErrorMessage)) {
              if (response)
                if (response.SOPDetails)
                  if (response.SOPDetails.length > 0) {
                    for (i in response.SOPDetails) {
                      response.SOPDetails[i].CouponDiscountRate = response.SOPDetails[i].CouponDiscountAmount;
                    }
                  }



              self.RecalculateCouponCompleted(response, isAcceptCoupon);
            } else {
              navigator.notification.alert(response.ErrorMessage, null, "Error", "OK");
            }
            if (!$("#serialLot").is(":visible")) {
              self.LockTransactionScreen(false);
            } else {
              self.HideActivityIndicator();
            }
          },
          error: function(model, error, response) {
            if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
            model.requesterror(error, "error recalculating coupon");
          }
        });
        //self.requestQueue.add({ Entity: _couponModel });
      };


      if (this.tempCart && this.tempCart.length > 0) {
        processRecalculateCoupon(new BaseCollection(this.tempCart));
        this.tempCart.length = 0;

        return;
      }

      if (this.cartCollection && this.cartCollection.length > 0) {
        processRecalculateCoupon(this.cartCollection);
      }

    },

    InitializeRequestQueue: function() {
      this.requestQueue = new BaseCollection();

      this.requestQueue.on('startQueue', this.StartRequestQueue, this);
    },

    StartRequestQueue: function(queueCollection) {
      try {
        var self = this;
        if (queueCollection.length <= 0) return;
        this.isCouponQueueProcess = false;

        queueCollection.each(function(queue) {
          if (queue.get("Entity") instanceof BaseModel) {
            if (!self.isCouponQueueProcess) {
              self.isCouponQueueProcess = true;
              var reqModel = new BaseModel();
              reqModel = queue.get("Entity");

              reqModel.on('sync', self.ProcessRequestQueue, self);
              reqModel.on('error', self.RemoveRequestQueue, self);
              //reqModel.save(null, {
              //    success: function (model, response, options) {
              //        if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
              //        if (response) if (response.SOPDetails) if (response.SOPDetails.length > 0) {
              //            for (i in response.SOPDetails) { response.SOPDetails[i].CouponDiscountRate = response.SOPDetails[i].CouponDiscountAmount; }
              //        }
              //        self.RecalculateCouponCompleted(response);
              //    },
              //    error: function (model, xhr, options) {
              //        if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
              //        model.RequestError(xhr, "Error Recalculating Coupon");

              //        self.requestQueue.remove(reqModel);
              //        //self.onQueueModel = null;
              //    }
              //});
              self.onQueueModel = reqModel.set({
                parentCID: queue.cid
              });
              reqModel.save();
            }

          }
        });
      } catch (e) {
        navigator.notification.alert(e.message, null, e.name, "OK");
      }
    },

    ProcessRequestQueue: function(model, response, options) {
      var self = this;

      if (this.isCouponQueueProcess) {
        this.isCouponQueueProcess = false;
        //this.requestQueue.remove(this.onQueueModel);
        var findCID = this.requestQueue.find(function(queue) {
          return queue.cid === self.onQueueModel.get("parentCID")
        });

        if (findCID) this.requestQueue.remove(findCID);
        this.onQueueModel = null;
      }

      if (this.requestQueue.length != 0) {
        this.requestQueue.trigger('startQueue', this.requestQueue);
      } else {
        if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
        if (Shared.IsNullOrWhiteSpace(response.ErrorMessage)) {
          if (response)
            if (response.SOPDetails)
              if (response.SOPDetails.length > 0) {
                for (i in response.SOPDetails) {
                  response.SOPDetails[i].CouponDiscountRate = response.SOPDetails[i].CouponDiscountAmount;
                }
              }
          this.RecalculateCouponCompleted(response);
        } else {
          navigator.notification.alert(response.ErrorMessage, null, "Error", "OK");
        }

        this.LockTransactionScreen(false);
      }
    },

    RemoveRequestQueue: function(model, xhr, options) {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      model.RequestError(xhr, "Error Recalculating Coupon");

      this.requestQueue.remove(this.onQueueModel);
      this.onQueueModel = null;

      this.LockTransactionScreen(false);
    },

    RemoveItemInQueue: function(model) {
      try {
        this.requestQueue.remove(model);
      } catch (e) {
        navigator.notification.alert(e.message, null, e.name, "OK");
      }
    },

    RecalculateCouponCompleted: function(couponGroup, isAcceptCoupon) {
      this.LoadItemsToCart(couponGroup.SOPDetails)
      var coupon = couponGroup.Coupons[0];

      if (coupon) {
        /*
                //The following lines were commented due to rounding issues. See Gemini : CSL-5048
                //APR-09-2013 - JHENSON
                //BEGIN - GEMIN : CSL-5048

                if (coupon.CouponComputation === "Stackable") {
					this.RecalculateStackableCoupon(coupon.DiscountAmount);
				}

				for (var i = 0; i< this.cartCollection.length; i++) {
			    	var item = this.cartCollection.at(i);
			    	var _extPrice = this.CalculateExtPrice(this.GetItemQuantity(item), item.get("SalesPriceRate"),
			    											item.get("Discount"), item.get("CouponDiscountType"),
			    											item.get("CouponDiscountAmount"), item.get("CouponComputation"));
					item.set({"ExtPriceRate" : _extPrice});
				}

                //END - GEMIN : CSL-5048
				*/

        if (!this.IsReturn())
          if (this.couponModel.get("RequiresMinimumOrderAmount") > 0) {
            var totalCouponDiscount = 0;
            this.cartCollection.each(function(model) {
              totalCouponDiscount = totalCouponDiscount + (isNaN(model.get("CouponDiscountRate")) ? 0 : model.get("CouponDiscountRate"));
            });
            if (totalCouponDiscount <= 0) {
              var _errorMessage = "A minimum transaction amount of " + Global.CurrencySymbol + this.couponModel.get("RequiresMinimumOrderAmount").toFixed(2) + " is required to avail coupon " + this.couponModel.get("Description") + ".";
              navigator.notification.alert(_errorMessage, null, "Minimum Amount Required", "OK");
              this.RemoveCoupon();
            }
          }

          // Validates if the item is included in coupon.
        if (this.couponModel) {
          this.validateCouponRequirement();
        }

      
      if(!Global.CurrentCustomerChanged) this.ChangeItemGroupTax(this.cartCollection, isAcceptCoupon);
     
        
      }

      if (this.paymentCollection) {
        this.ReloadPayments(this.paymentCollection.models);
      }

      Global.HasChanges = true;
    },

    ReloadPayments: function(payments) {
      if (!this.paymentCollection) {
        this.InitializePaymentCollection();
      }
      this.summaryModel.set({
        Payment: 0
      });
      this.paymentCollection.reset();

      //Added to Prevent Saving Transaction after change ShipTo
      for (var i = 0; i < payments.length; i++) {
        payments[i].set({
          IsReload: true
        });
      }
      this.paymentCollection.add(payments);
      this.paymentCollection.each(function(model) {
        model.set({
          IsReload: false
        });
      });
    },

    ValidateAcceptCouponInfo: function(coupon) {
      if (!this.ValidateTransactionAmount(coupon, false, 0)) {
        var _errorMessage = "A minimum transaction amount of " + Global.CurrencySymbol + coupon.get("RequiresMinimumOrderAmount").toFixed(2) + " is required to avail coupon " + coupon.get("Description") + ".";
        //console.log(_errorMessage);
        navigator.notification.alert(_errorMessage, null, "Minimum Amount Required", "OK");
        return false;
      }

      if (!this.couponModel) {
        return true;
      } else if (coupon != null && this.couponModel.get("CouponID") != coupon.get("CouponID")) {
        return true;
      } else if (this.couponModel.get("CouponID") === coupon.get("CouponID")) {
        this.couponView.Close();
      }

      return false;
    },

    ValidateTransactionAmount: function(coupon, isSalesDiscount, discount) {
      if (coupon != null) {
        if (coupon.get("RequiresMinimumOrderAmount") > 0) {
          var _total = this.CalculateExtPriceWithoutCoupon(isSalesDiscount, discount);
          if (_total < coupon.get("RequiresMinimumOrderAmount")) {
            if (Global.TransactionType == Enum.TransactionType.SalesRefund) return true;
            return false;
          }
        }
      }
      return true;
    },

    CalculateExtPriceWithoutCoupon: function(isFromSalesDiscount, discount) {
      var total = 0;
      var extPrice = 0;

      for (var index = 0; index < this.cartCollection.length; index++) {
        var item = this.cartCollection.at(index);
        if (isFromSalesDiscount) {
          extPrice = this.CalculateExtPrice(item.get("QuantityOrdered"), item.get("SalesPriceRate"), discount, null, 0, null, item.get("LineNum"));
        } else {
          extPrice = this.CalculateExtPrice(item.get("QuantityOrdered"), item.get("SalesPriceRate"), item.get("Discount"), null, 0, null, item.get("LineNum"));
        }
        total = total + extPrice;
      }
      return total;
    },

    GetCouponID: function() {
      var coupon = this.couponModel;
      if (Global.TransactionType == Enum.TransactionType.SalesRefund) return null;
      if (coupon) {
        if (coupon.get("CouponComputation") === "Stackable" && coupon.get("DiscountType") === "Amount") {
          return null;
        }
        return coupon.get("CouponID");
      }
      return null;
    },

    GetItemQuantity: function(item) {
      if (Global.TransactionType === Enum.TransactionType.SalesRefund || Global.TransactionType === Enum.TransactionType.Return) {
        return item.get("Good"); //Originally Defective
      } else {
        return item.get("QuantityOrdered");
      }
    },

    SetItemQuantity: function(item, qty) {
      if (Global.TransactionType === Enum.TransactionType.SalesRefund || Global.TransactionType === Enum.TransactionType.Return) {
        if (item.get("IsNewLine")) item.set({
          QuantityDisplay: qty
        });

        return item.set({
          Good: qty,
          QuantityOrdered: qty,
          QuantityShipped: qty,
          QuantityAllocated: qty
        }); //Originally Defective
      } else {
        return item.set({
          QuantityOrdered: qty,
          QuantityShipped: qty
        });
      }
    },

    RecalculateStackableCoupon: function(discountAmount) {
      var subTotalExtended = 0;
      for (var x = 0; x < this.cartCollection.length; x++) {
        var item = this.cartCollection.at(x);
        if (item.get("CouponComputation") === "Stackable" && item.get("CouponDiscountAmount") > 0) {
          var lineItemExtPrice = this.GetItemQuantity(item) * this.CalculateNetPrice(item.get("SalesPriceRate"), item.get("Discount"));
          subTotalExtended = subTotalExtended + lineItemExtPrice;
        }
      }
      var totalDiscountAmount = 0;

      for (var i = this.cartCollection.length - 1; i >= 0; i--) {
        var item = this.cartCollection.at(i);
        if (item.get("CouponComputation") === "Stackable" && item.get("CouponDiscountAmount") > 0) {

          var lineItemExtPrice = this.GetItemQuantity(item) * this.CalculateNetPrice(item.get("SalesPriceRate"), item.get("Discount"));
          var discountRatePerLineItem = lineItemExtPrice / subTotalExtended;
          var discountAmountPerLineItem = item.get("CouponDiscountAmount") * discountRatePerLineItem;

          if (i == 0) {
            discountAmountPerLineItem = discountAmount - totalDiscountAmount
          }

          if (item.get("CouponDiscountType") === "Amount") {
            discountAmountPerLineItem = format("0.0000", discountAmountPerLineItem);
            discountAmountPerLineItem = 1 * this.RoundNumber(discountAmountPerLineItem, 2);
            item.set({
              CouponDiscountAmount: discountAmountPerLineItem
            });
            totalDiscountAmount += discountAmountPerLineItem;
          }


        }
      }
    },

    VoidCoupon: function(isRecalculateCoupon) {
      this.couponModel.clear();
      Global.Coupon = null;
      this.RemoveCouponInfoFromSOPDetail();
      if (this.couponView) this.couponView.ClearCoupon();
      if (isRecalculateCoupon) {
        this.RecalculateCoupon();
      }
      Global.HasChanges = true;
      if (this.cartView) this.cartView.LoadiScroll(); //CSL-5304
    },

    RemoveCouponInfoFromSOPDetail: function() {
      if (this.cartCollection && this.cartCollection.length > 0) {
        for (index = 0; index < this.cartCollection.length; index++) {
          var item = this.cartCollection.at(index);
          item.set({
            CouponCode: null,
            CouponId: null,
            CouponDiscountType: "",
            CouponDiscountAmount: 0,
            CouponDiscountRate: 0,
            CouponComputation: "",
            IsIncludedInCoupon: false,
          })
        }
      }
    },

    RemoveCoupon: function() {
      this.VoidCoupon(this.cartCollection.length > 0);
    },

    VoidItem: function(test) {
		var self = this;
		var model = new BaseModel();
      this.isNoCouponAtFirst = true;
      this.validateCouponRequirement();
      this.OnRequestCompleted("VoidItem");

      this.UpdateCouponWithValidation();
      this.CheckNegativeQuantities();
      this.RemoveTermDiscountPayment();
      //A variable used in checking out of stock item.
      if (this._lastItemChecked) {
        if (this.cartView && this.cartView.LastItemRemoved) {

	    var _itemsToRemove = new BaseCollection();
		this.cartCollection.each(function(freeItems){
		model = freeItems;
		if(freeItems.get('BuyItemCode') != null){
			if (freeItems.get('BuyItemCode')[0].BuyItemCode == undefined){
				if (freeItems.get('BuyItemCode') == self.cartView.LastItemRemoved.ItemCode && freeItems.get('BuyItemCode') == self.cartView.LastItemRemoved.LineNum){
					_itemsToRemove.add(freeItems);
				}
			}
			else {
			if(freeItems.get('BuyItemCode')[0].BuyItemCode.length == 1){
				if (freeItems.get('BuyItemCode')[0].BuyItemCode[0] == self.cartView.LastItemRemoved.ItemCode && freeItems.get('PromoDocumentCode')== self.cartView.LastItemRemoved.PromoDocumentCode){
					_itemsToRemove.add(freeItems);

				}
			}
			else {
				 for(i=0 ;i<freeItems.get('BuyItemCode')[0].BuyItemCode.length; i++){
				 	if(freeItems.get('BuyItemCode')[0].BuyItemCode[i] == self.cartView.LastItemRemoved.ItemCode && freeItems.get('PromoDocumentCode') == self.cartView.LastItemRemoved.PromoDocumentCode){
						_itemsToRemove.add(freeItems);
					}
				 }
				 }
			 }
		}
	  });
          if (this._lastItemChecked.ItemCode == this.cartView.LastItemRemoved.ItemCode) this._lastItemChecked = null;
        }
      }
	  if(_itemsToRemove != undefined){
	  		this.RemoveFreeItems(_itemsToRemove);
		}
      Global.CartCollection = this.cartCollection;
      Shared.FocusToItemScan();

	  this.cartCollection.each(function(cartItem){
			if(cartItem.get('IsPromoItem') == true)
			{
      	$("#" + cartItem.cid + ' #quantityDisplay').addClass('ui-disabled').css("opacity", 1);
			  $("#" + cartItem.cid + ' #display-itemName').addClass('ui-disabled').css("opacity", 1);
			  $("#" + cartItem.cid + ' #itemPriceDisplay').addClass('ui-disabled').css("opacity", 1);
			  $("#" + cartItem.cid + ' #discountDisplay').addClass('ui-disabled').css("opacity", 1);
			  $("#" + cartItem.cid + ' #extPriceRate-td').addClass('ui-disabled').css("opacity", 1);
			}
		});
/*	var itemsToRefresh = new BaseCollection();
		itemsToRefresh = new BaseCollection(self.cartCollection.filter(function(cartItem){
			return cartItem.get('IsPromoItem') == true;
		}));

	  itemsToRefresh.each(function(freeItems){
		self.cartCollection.each(function (items){
			if(items.get('PromoDocumentCode') == freeItems.get('PromoDocumentCode')){
			   var lineNum = items.get('LineNum');
			 }

			if (items.get('ItemCode') == freeItems.get('ItemCode')){
				items.get('BuyItemCode')[0].BuyLineNum[0] = lineNum;
			}

				items.get('BuyItemCode')[0].BuyItemCode[i] = 'test';
				for(i=0 ;i<freeItems.get('BuyItemCode')[0].BuyItemCode.length; i++){
					console.log(items);

				}
			}
		});
	  });*/


      //Comment this code.
      //if (this.cartCollection.length === 0 ) window.sessionStorage.removeItem('selected_taxcode');

      //if (!this.requestQueue) this.InitializeRequestQueue();
      //this.requestQueue.trigger('startQueue', this.requestQueue);
    },


	RemoveFreeItems: function(model){
		if(model.length>0){
			var self = this;
			var itemModel = new BaseModel();

			model.each(function(detail){
				model = detail;
				self.cartCollection.remove(detail);
				for(i=0 ;i<model.get('BuyItemCode')[0].BuyItemCode.length; i++){
					if (model.get('BuyItemCode')[0].BuyItemCode[i] == self.cartView.LastItemRemoved.ItemCode){
					 itemModel.url = Global.ServiceUrl + "Transactions/" + "deletelinenum?PromoDocumentCode=" + self.cartView.LastItemRemoved.PromoDocumentCode + '&PromoID=' + self.cartView.LastItemRemoved.PromoID + '&BuyItemCode=' + model.get('BuyItemCode')[0].BuyItemCode[i];
					 itemModel.save(null, {
				});
					}
				}

			});
		}
	},

    UpdateCouponWithValidation: function() {
      if (this.couponModel) {
        if (!this.ValidateTransactionAmount(this.couponModel, false, 0)) {
          var _errorMessage = "A minimum transaction amount of " + Global.CurrencySymbol + this.couponModel.get("RequiresMinimumOrderAmount").toFixed(2) + " is required to avail coupon " + this.couponModel.get("Description") + ".";
          navigator.notification.alert(_errorMessage, null, "Minimum Amount Required", "OK");
          this.RemoveCoupon();
        } else {
          if (this.IsRequireRecalculateCoupon()) {
            this.RecalculateCoupon();

            //if (!this.requestQueue) this.InitializeRequestQueue();
            //this.requestQueue.trigger('startQueue', this.requestQueue);
          }
        }
      }
    },

    // GEMINI : CSL-5099
    IsReturn: function() {
      if (Global.TransactionType === Enum.TransactionType.SalesRefund) return true;
      if (Global.TransactionType === Enum.TransactionType.SalesCredit) return true;
      return false;
    },

    IsRequireRecalculateCoupon: function() {
      if (this.IsReturn()) return false;
      if (this.couponModel) {
        if (this.couponModel.get("CouponComputation") === "Stackable" &&
          this.couponModel.get("DiscountType") === "Amount") {
          return true;
        }
      }
      return false;
    },

    LoadCouponFromTransationHeader: function(header) {
      var coupon = new CouponModel;
      coupon.set({
        CouponCode: header.CouponCode,
        CouponComputation: header.CouponComputation,
        DiscountAmount: header.CouponDiscountAmount,
        DiscountIncludesFreeShipping: header.CouponDiscountIncludesFreeShipping,
        DiscountPercent: header.CouponDiscountPercent,
        DiscountType: header.CouponDiscountType,
        CouponID: header.CouponID,
        RequiresMinimumOrderAmount: header.CouponRequiresMinimumOrderAmount,
        CouponType: header.CouponType,
        CouponUsage: header.CouponUsage,
        CustomerCode: header.BillToCode
      })

      this.LoadCoupon(coupon);
    },

    LoadCoupon: function(coupon) {
      this.couponModel = coupon;
      Global.Coupon = this.couponModel;
      if (this.couponView) {
        this.couponView.LoadCoupon(coupon);
      }
    },

    PromptSignature: function() {
      var _promptSignature = false;
      if (Global.OnRechargeProcess) return true;
      switch (Global.TransactionType) {
        case Enum.TransactionType.Sale:
        case Enum.TransactionType.ConvertOrder:
        case Enum.TransactionType.UpdateInvoice:
          _promptSignature = (Global.Preference.RequireSignatureOnOpenAccount && Global.Signature === null && this.GetTransactionBalance() > 0);
          break;
        case Enum.TransactionType.Order:
        case Enum.TransactionType.ConvertQuote:
          _promptSignature = (Global.Preference.RequireSignatureOnOrder && Global.Signature === null);
          break;
        case Enum.TransactionType.UpdateOrder:
          _promptSignature = (Global.Preference.RequireSignatureOnOrder && Global.Signature === null);
          break;
        case Enum.TransactionType.Suspend:
          _promptSignature = false;
          break;
      }

      if (_promptSignature) {
        this.ShowSignature();
        return false;
      }
      return true;
    },

    ViewSignature: function() {
      if (Global.TransactionObject != null) {
        if (Global.TransactionObject.SignatureSVG != "" && Global.TransactionObject.SignatureSVG != null) {
          this.ShowSignature(Global.TransactionObject.SignatureSVG, true);
          return null;
        }
      }
      navigator.notification.alert("There is no signature attached to the current transaction.", null, "No Signature Found", "OK");
    },

    ShowSignature: function(signatureSVG, readOnly) {
      this.InitializeSignatureView();
      this.signatureView.viewType = "POS";
      this.signatureView.ReadOnly = readOnly;
      this.signatureView.Show(signatureSVG);
    },

    InitializeSignatureView: function() {

      if (!this.signatureView) {
        this.signatureView = new SignatureView({
          el: $("#signatureContainer")
        });
        this.signatureView.on("SignatureAdded", this.AttachSignature, this);
        this.signatureView.on("CancelSignature", this.ResetCustomerPODetails, this);
        this.signatureView.on("allowUserToAttachSign", this.GetAttachedSignature, this);
        this.signatureView.on("cancelSignRetrieval", this.StopRetrieval, this);
        this.signatureView.on("deleteSavedSignature", this.DeleteSavedSignature, this);

      }
    },

    //CSL - 15314 : 09.16.13
    GetAttachedSignature: function(view) {
      this.viewSender = view;
      this.OnRequestCompleted("AskForSignature");
    },

    BeginFetchingSignature: function() {
      var self = this;
      if (this.signatureTimeInterval) this.StopFetchingSignature();
      this.signatureTimeInterval = window.setInterval(function() {
        self.FetchSignatureDetail()
      }, 250);
    },

    StopFetchingSignature: function() {
      window.clearInterval(this.signatureTimeInterval);
    },

    StopRetrieval: function() {
      window.clearInterval(this.signatureTimeInterval);
      this.OnRequestCompleted("SignatureRetrieved");
      this.StopFetchingSignature();
    },

    FetchSignatureDetail: function() {
      var mdl = new BaseModel();
      mdl.url = Global.ServiceUrl + Service.POS + Method.CURRENTSIGNATURE;
      mdl.set({
        WorkstationID: Global.POSWorkstationID,
        LastRetrievalDate: this.lastRetrievalDate
      });
      var self = this;
      mdl.save(null, {
        success: function(model, response, options) {
          //if(!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          if (!response) return;
          if (response.ErrorMessage) {
            self.NotifyMsg(response.ErrorMessage, null, "Error Fetching Signature");
            self.StopFetchingSignature();
          } else if (response.SignatureDetail) {
            Global.AskSignature = false;
            self.StopFetchingSignature();
            self.CheckSignatureFetched(response.SignatureDetail);
            self.OnRequestCompleted("SignatureRetrieved");
          }
        },
        error: function(model, error, response) {
          //if(!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          self.StopFetchingSignature();
          self.OnRequestCompleted("SignatureRetrieved");
        }
      });
    },

    CheckSignatureFetched: function(signature) {
      //this.LockTransactionScreen(true, "Sketching Signature...");
      Global.Signature = signature;
      if (signature.indexOf("[SVGID]:") == -1) this.SketchSignature(signature);
      else this.GetSignatureContent(signature);


      //this.SketchSignature(Global.Signature)
    },

    GetSignatureContent: function(signature) {
      var mdl = new BaseModel();
      mdl.url = Global.ServiceUrl + Service.POS + Method.GETSIGNATURECONTENT;
      mdl.set({
        SignatureID: signature
      });
      var self = this;
      mdl.save(null, {
        success: function(model, response, options) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          if (!response) return;
          if (response.ErrorMessage) {
            self.NotifyMsg(response.ErrorMessage, null, "Error Fetching Signature content");
          } else if (response.SignatureSVG) {
            self.SketchSignature(response.SignatureSVG);
            Global.SignatureContent = response.SignatureSVG;
          }
        },
        error: function(model, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          model.RequestError(error, "Error");
        }
      });
    },

    PaymentCancelled: function() {
      if (!this.paymentView) return;
      //console.log('PaymentCancelled');
      if (this.paymentView.sketchView) this.DeleteSavedSignature(Global.Signature);
    },

    DeleteSavedSignature: function(svgID) {
      if (!svgID) svgID = Global.Signature;
      if (!svgID) return;
      if (svgID.indexOf("[SVGID]:") == -1) return;
      var _mdl = new BaseModel();
      _mdl.url = Global.ServiceUrl + Service.POS + Method.DELETESIGNATURE;
      _mdl.set({
        SignatureID: svgID
      });
      var self = this;
      _mdl.save(null, {
        success: function(model, response, options) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          if (!response) return;
          else if (response.ErrorMessage) self.NotifyMsg(response.ErrorMessage, null, "Error Fetching Signature content");
          else console.log('Signature Deleted :' + response.Value);
        },
        error: function(model, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          model.RequestError(error, "Error");
        }
      });
    },

    SketchSignature: function(base64String) {
      var myView = null;
      switch (this.viewSender) {
        case "Refund":
          myView = this.refundView;
          break;
        case "Payment":
          myView = this.paymentView;
          break;
        default:
          myView = this.signatureView;
          break;
      }
      myView.SketchSignature(base64String);
      myView.ViewOnly = false;
      this.HideActivityIndicator();
    },

    //End : CSL - 15314
    AttachSignature: function() {
      if (Global.Signature) {
        if (this.signatureTimeInterval) this.StopFetchingSignature();
        this.CreateTransaction(_paymentType);
      }
    },

    PromptToPrint: function(transactionModel) {
      var promptPrint = Global.Preference.PromptToPrintReceipt;
      var promptEmailAddress = Global.Preference.PromptEmailAddress;

      if (Global.PrintOptions.Reprint) {
        promptPrint = true;
        promptEmailAddress = false;
      }

      if (Global.OnRechargeProcess) {
        promptPrint = false;
        promptEmailAddress = false;
      }

      if (promptPrint || promptEmailAddress) {
        $("#main-transaction-blockoverlay").show();
        this.InitializePrintOptionsView();
        this.printOptionsView.SetTransactionToPrint(transactionModel);
        this.printOptionsView.Show();
        return false;
      } else {
        // SetIsPrintReceipt(true);
        Global.PrintOptions.EmailReceipt = Global.Preference.AutoEmailReceipt;
        Global.PrintOptions.PrintReceipt = Global.Preference.AutoPrintReceipt;
        Global.PrintOptions.SilentPrint = Global.Preference.AutoPrintReceipt; //JHZ!
      }

      return true;
    },

    InitializePrintOptionsView: function() {
      $("#main-transaction-blockoverlay").show();
      if (!this.printOptionsView) {
        this.printOptionsView = new PrintOptionsView({
          el: $("#printOptionsContainer")
        });
        this.printOptionsView.on("PrintReceipt", this.AcceptPrintOption, this);
      }
    },

    ValidatePrintOption: function() {
      if ((Global.PrintOptions.EmailReceipt && !Global.PrintOptions.Reprint) ||
        (Global.PrintOptions.EmailReceipt && Global.PrintOptions.Reprint)) {

        var email = Global.PrintOptions.EmailAddress;
        if (email != "") {
          var filter = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})+$/;
          if (!filter.test(email)) {
            //console.log("Please provide a valid email address.");
            navigator.notification.alert("Please provide a valid email address.", null, "Invalid Email Address", "OK");
            return false;
          }
        } else {
          //console.log("Please provide a valid email address.");
          navigator.notification.alert("Please provide a valid email address.", null, "Invalid Email Address", "OK");
          return false;
        }
      }
      return true;
    },

    ValidatePrintReview: function(model) {
      if (model.get("FreightRate") != 0) {
        if (model.get("InvoiceCode") != undefined) {
          this.receiptType = "InvoiceCode";
        } else if (model.get("SalesOrderCode") != undefined) {
          this.receiptType = "SalesOrderCode";
        } else if (model.get("ReturnCode") != undefined) {
          this.receiptType = "ReturnCode";
        }
        navigator.notification.alert(model.get(this.receiptType) + " includes freight tax that ConnectedSale will not be able to handle. Try to open it in Connected Business.", null, "Not Supported", "OK");
        return false;
      } else {
        return true;
      }
    },
    GetCustomerPaymentByTransactionCode: function(transactionCode, transactionModel) {
      var self = this;
      var tempModel = new BaseModel();
      var _transactionCode = transactionCode;
      switch (transactionModel.get("TransactionType")) {
        case Enum.TransactionType.Sale:
        case Enum.TransactionType.Suspend:
        case Enum.TransactionType.Return:
        case "Invoice":
          tempModel.set({
            TransactionCode: _transactionCode,
            IsRecalculate: true,
            IsTaxByLocation: Global.Preference.TaxByLocation,
            TransactionType: Global.LookupMode,
          });
          tempModel.url = Global.ServiceUrl + Service.SOP + Method.LOADINVOICE;
          break;
        case Enum.TransactionType.Order:
          tempModel.set({
            TransactionCode: _transactionCode,
            IsRecalculate: true,
            IsTaxByLocation: Global.Preference.TaxByLocation
          });
          tempModel.url = Global.ServiceUrl + Service.SOP + "loadorder" + "?type=" + Enum.TransactionType.Order + "&sessionID=" + Global.GUID;
          break;

      }

      tempModel.save(null, {
        success: function(collection, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          self.GetCustomerPaymentOnSuccess(response, transactionModel);
        },
        error: function(collection, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          collection.RequestError(error, "Error Loading Order");
        }
      });
    },
    GetCustomerPaymentOnSuccess: function(response, transactionModel) {
      this.customerPaymentCollection = new BaseCollection();
      this.customerPaymentCollection.reset(response.Payments);
      this.PromptToPrint(transactionModel);
    },
    InitializeCustomerPayments: function(transactionModel) {
      var _transactionCode = "";
      var _type = "Sale/Return";
      //console.log("Receipt Transaction Type :" + transactionModel.get("TransactionType"));
      switch (transactionModel.get("TransactionType")) {
        case Enum.TransactionType.Sale:
        case Enum.TransactionType.Suspend:
        case "Invoice":
          _transactionCode = transactionModel.get("InvoiceCode");
          break;
        case Enum.TransactionType.Return:
          _transactionCode = transactionModel.get("SourceDocument");
          if (Shared.IsNullOrWhiteSpace(_transactionCode)) _transactionCode = transactionModel.get("ReturnCode");
          break;
        case Enum.TransactionType.Order:
          _transactionCode = transactionModel.get("SalesOrderCode");
          break;
      }

      if (transactionModel.get("TransactionType") == Enum.TransactionType.Quote) {
        this.PromptToPrint(transactionModel);
        return;
      }

      this.GetCustomerPaymentByTransactionCode(_transactionCode, transactionModel);
    },
    PrintAndEmailReviewTransaction: function(transactionModel) {
      if (this.ValidatePrintReview(transactionModel)) {
        Global.PreviousReprintValue = true;
        Global.PrintOptions.Reprint = true;
        this.reviewTransactionsView.Close();
        this.InitializeCustomerPayments(transactionModel);
        //this.PromptCustomerPO(transactionModel);//jj15x14
        //this.PromptToPrint(transactionModel);
      }
    },

    AcceptPrintOption: function(transactionToPrint, accept) {
      if (!accept) {
        Global.PrintOptions.PrintReceipt = false;
        Global.PrintOptions.EmailReceipt = false;
        //Global.PrintOptions.Reprint = false;
      }

      if (this.ValidatePrintOption()) {
        this.printOptionsView.Close();

        // For reprinting transactions
        if (Global.PrintOptions.Reprint) {
          if (accept) { // added By PR.Ebron.
            if (transactionToPrint.get("POSSalesReceipt") != null) Global.POSSalesReceipt  = transactionToPrint.get("POSSalesReceipt");
            this.ReprintAndEmailTransaction(transactionToPrint);
          } else Global.PrintOptions.Reprint = false;

          return false;
        }

        switch (Global.TransactionType) {
          case Enum.TransactionType.Sale:
            if (this.ValidateOutOfStockItems()) this.CreateInvoice(Global.IsPosted);
            break;
          case Enum.TransactionType.Order:
            this.CreateOrder();
            break;
          case Enum.TransactionType.Quote:
            this.CreateQuote();
            break;
          case Enum.TransactionType.SalesPayment:
            this.CreateInvoicePayment(Global.TransactionCode);
            break;
          case Enum.TransactionType.UpdateInvoice:
          case Enum.TransactionType.Recharge:
            if (this.ValidateOutOfStockItems()) this.UpdateInvoice();
            break;
          case Enum.TransactionType.UpdateOrder:
            this.UpdateOrder();
            break;
          case Enum.TransactionType.ConvertOrder:
            if (this.ValidateOutOfStockItems()) this.ConvertOrder(Global.TransactionCode);
            break;
          case Enum.TransactionType.ConvertQuote:
            this.ConvertQuote(Global.TransactionCode);
            break;
          case Enum.TransactionType.UpdateQuote:
            this.UpdateQuote(Global.TransactionCode);
            break;
          case Enum.TransactionType.SalesRefund:
            if (this.ValidateReason("Return")) {
              if (this.ValidateManagerOverride(Enum.ActionType.Returns)) {
                this.CreateRefund();
              }
            }
            break;
          case Enum.TransactionType.Return:
            if (this.ValidateReason("Return")) {
              if (this.ValidateManagerOverride(Enum.ActionType.Returns)) {
               // this.CreateCreditMemo();
                this.CreateRefund();
              }
            }
            break;
          case Enum.TransactionType.Suspend:
            if (this.IsExistingTransaction()) {
              console.log("Do Suspend - Update Invoice");
              if (this.ValidateOutOfStockItems()) this.UpdateInvoice();
              break;
            } else {
              console.log("Do Suspend - Create Invoice");
              if (this.ValidateOutOfStockItems()) this.CreateInvoice(Global.IsPosted);
              break;
            }
        }
        return true;
      }
    },

    PrintAndEmailTransaction: function(transactionCode) {
      var type = null,
      receiptCodes = null;
      switch(Global.TransactionType) {
        case Enum.TransactionType.Sale:
        case Enum.TransactionType.Suspend:
          type = "CreateInvoice";
        break;
        case Enum.TransactionType.Order:
        case Enum.TransactionType.UpdateOrder:
          type = "CreateOrder";
        break;
        case Enum.TransactionType.Quote:
          type = "CreateQuote";
        break;
        case Enum.TransactionType.UpdateQuote:
          type = "UpdateQuote";
        break;
        case Enum.TransactionType.SalesPayment:
          type = "CreateInvoicePayment";
          receiptCodes = this.GetReceiptCodes(transactionCode);
        break;
        case Enum.TransactionType.UpdateInvoice:
        case Enum.TransactionType.Recharge:
          type = "UpdateInvoice";
        break;
        case Enum.TransactionType.ConvertOrder:
          type = "ConvertOrder";
        break;
        case Enum.TransactionType.ConvertQuote:
          type = "ConvertQuote";
        break;
        case Enum.TransactionType.SalesRefund:
        /*if (Shared.IsNullOrWhiteSpace(transaction.Invoices)) {
          var invoiceCode = transaction.TransactionCode || documentCode;
          if (invoiceCode != null && invoiceCode != "") {
            this.ProcessPrintAndEmail(invoiceCode, "CreateRefund", transaction.DocumentCode);
          }
        } else {
          var invoiceCode = transaction.Invoices[0].InvoiceCode || documentCode;
          if (invoiceCode != null && invoiceCode != "") {
            this.ProcessPrintAndEmail(invoiceCode, "CreateCreditMemo", null);
          }
        }*/
        case Enum.TransactionType.Return:
          type = "CreateCreditMemo";
        break;
      };

      this.ProcessPrintAndEmail(transactionCode, type, receiptCodes);
    },

    ReprintAndEmailTransaction: function(transaction) {
      if (Global.PrintOptions.Reprint) {
        switch (Global.LookupMode) {
          case Enum.LookupMode.Invoice:
            this.ProcessPrintAndEmail(transaction.get("InvoiceCode"), "CreateInvoice", null);
            break;
          case Enum.LookupMode.Order:
            //this.PrintReceipt(transaction.get("SalesOrderCode"), "CreateOrder", null);
            //this.EmailReceipt("CreateOrder", transaction.get("SalesOrderCode"));
            this.ProcessPrintAndEmail(transaction.get("SalesOrderCode"), "CreateOrder", null);
            break;
          case Enum.LookupMode.Quote:
            //this.PrintReceipt(transaction.get("SalesOrderCode"), "CreateQuote", null);
            //this.EmailReceipt("CreateQuote", transaction.get("SalesOrderCode"));
            this.ProcessPrintAndEmail(transaction.get("SalesOrderCode"), "CreateQuote", null);
            break;
          case Enum.LookupMode.Return:
            if (transaction.get("SourceDocument") == null || transaction.get("SalesOrderCode") == "") {
              //this.PrintReceipt(transaction.get("ReturnCode"), "CreateCreditMemo", null);
              //this.EmailReceipt("CreateCreditMemo", transaction.get("ReturnCode"));
              this.ProcessPrintAndEmail(transaction.get("ReturnCode"), "CreateCreditMemo", null);
            } else {
              //this.PrintReceipt(transaction.get("SourceDocument"), "CreateRefund", transaction.get("ReturnCode"));
              //this.EmailReceipt("CreateRefund", transaction.get("SourceDocument"), transaction.get("ReturnCode"));
              this.ProcessPrintAndEmail(transaction.get("SourceDocument"), "CreateRefund", transaction.get("ReturnCode"));
            }
            break;
            //case Enum.LookupMode.Invoice :
          case Enum.LookupMode.Suspend:
            //this.PrintReceipt(transaction.get("InvoiceCode"), "CreateInvoice", null);
            //this.EmailReceipt("CreateInvoice", transaction.get("InvoiceCode"));
            this.ProcessPrintAndEmail(transaction.get("InvoiceCode"), "CreateInvoice", null);
            break;
          default:
            alert("Invalid transaction type.");
            break;
        }

        this.ClearTransaction(); //GEMINI: CSL-5372
      }
    },

    ProcessPrintAndEmail: function(transactionCode, type, receiptCode) {
      var _askToPrint = (Global.Preference.PromptEmailAddress || Global.Preference.PromptToPrintReceipt);
      var _autoPrint = (Global.Preference.AutoPrintReceipt || !Global.Preference.PromptToPrintReceipt);
      var _autoEmail = (Global.Preference.AutoEmailReceipt || !Global.Preference.PromptEmailAddress);
      var _rePrint = (Global.PrintOptions.Reprint);

      if (_askToPrint || _rePrint) {
        if (Global.PrintOptions.PrintReceipt) {
          this.PrintReceipt(transactionCode, type, receiptCode);
        } else if (Global.PrintOptions.EmailReceipt) {
          this.EmailReceipt(transactionCode, type, receiptCode);
        } else {
         // Shared.Printer.DeletePaymentReport(transactionCode);
          this.LockTransactionScreen(false); //<--mjf
        }
      } else if (_autoPrint || _autoEmail) {
        this.PrintReceipt(transactionCode, type, receiptCode);
      }
    },

    PrintReceipt: function(transactionCode, type, receiptCodes) {
      this.reportType = type.split(' ').join('');
      this.receiptCodes = "";
      this.receiptType = type;

      if (receiptCodes != null) this.receiptCodes = receiptCodes;

      if (transactionCode != null || transactionCode != undefined) {
        //this.ProcessPrintReceipt(transactionCode, type, receiptCodes);
        var totalCashPayment = 0;
        if (this.paymentCollection) totalCashPayment = this.paymentCollection.totalCashPayment();
        if (type === "CreateCreditMemo" || type === "ConvertInvoice") {
          this.ProcessReceipt(transactionCode);
        } else if (type === "CreateInvoice" || type === "ConvertOrder" || type === "UpdateInvoice") {
          this.ProcessReceipt(transactionCode, totalCashPayment);
        } else if (type === "CreateOrder" || type === "UpdateOrder" || type === "ConvertQuote") {
          this.ProcessReceipt(transactionCode, totalCashPayment);
        } else if (type === "CreateQuote" || type === "UpdateQuote") {
          this.ProcessReceipt(transactionCode, totalCashPayment);
        } else if (type === "CreateRefund") {
          this.ProcessReceipt(transactionCode, receiptCodes);
        } else if (type === "CreateInvoicePayment") {
          this.ProcessReceipt(transactionCode);
        } else if (type === "CreatePickNote") {
          this.ProcessReceipt(transactionCode);
        }
      }
    },

    EmailReceipt: function(transactionCode, type, receiptCodes, isReadyForInvoice) {
      if (Global.PrintOptions.EmailReceipt || isReadyForInvoice === true) {
        this.reportType = type.split(' ').join('');
        this.receiptCodes = "";
        this.receiptType = type;

        if (receiptCodes != null) this.receiptCodes = receiptCodes;

        if (transactionCode != null || transactionCode != undefined) {
          this.ProcessEmailReceipt(transactionCode, type, receiptCodes, isReadyForInvoice);
        }
      }
    },

    ProcessPrintReceipt: function(transactionCode, type, receiptCodes) { //jjx
      var totalCashPayment = 0;
      if (this.paymentCollection) totalCashPayment = this.paymentCollection.totalCashPayment();
      if (type === "CreateCreditMemo" || type === "ConvertInvoice") {
        this.PrintCreditMemoReceipt(transactionCode);
      } else if (type === "CreateInvoice" || type === "ConvertOrder" || type === "UpdateInvoice") {
        this.PrintInvoiceReceipt(transactionCode, totalCashPayment);
      } else if (type === "CreateOrder" || type === "UpdateOrder" || type === "ConvertQuote") {
        this.PrintOrderReceipt(transactionCode, totalCashPayment);
      } else if (type === "CreateQuote" || type === "UpdateQuote") {
        this.PrintQuoteReceipt(transactionCode, totalCashPayment);
      } else if (type === "CreateRefund") {
        this.PrintRefundReceipt(transactionCode, receiptCodes);
      } else if (type === "CreateInvoicePayment") {
        this.PrintPaymentReceipt(transactionCode);
      }
    },

    ProcessEmailReceipt: function(transactionCode, type, receiptCodes, isReadyForInvoice) { //jjx
      var totalCashPayment = 0;
      if (this.paymentCollection) totalCashPayment = this.paymentCollection.totalCashPayment();
      if (type === "CreateCreditMemo" || type === "ConvertInvoice") {
        this.EmailCreditMemoReceipt(transactionCode);
      } else if (type === "CreateInvoice" || type === "ConvertOrder" || type === "UpdateInvoice") {
        this.EmailInvoiceReceipt(transactionCode, totalCashPayment);
      } else if (type === "CreateOrder" || type === "UpdateOrder" || type === "ConvertQuote") {
        this.EmailOrderReceipt(transactionCode, totalCashPayment, null, isReadyForInvoice);
      } else if (type === "CreateQuote") {
        this.EmailQuoteReceipt(transactionCode, totalCashPayment);
      } else if (type === "CreateRefund") {
        this.EmailRefundReceipt(transactionCode, receiptCodes);
      } else if (type === "CreateInvoicePayment") {
        this.EmailPaymentReceipt(transactionCode);
      }
    },

    InitializePrintReportSettingModel: function() {
      if (this.printreportSettingModel) {
        this.printreportSettingModel.clear({
          silent: true
        });
      } else {
        this.printreportSettingModel = new ReportSettingModel();
        this.printreportSettingModel.on('sync', this.PrintReportComplete, this);
        this.printreportSettingModel.on('error', this.PrintReportFailed, this);
      }

      return this.printreportSettingModel;
    },

    InitializeEmailReportSettingModel: function() {
      if (this.emailreportSettingModel) {
        this.emailreportSettingModel.clear({
          silent: true
        });
      } else {
        this.emailreportSettingModel = new ReportSettingModel();
        this.emailreportSettingModel.on('sync', this.EmailReportComplete, this);
        this.emailreportSettingModel.on('error', this.EmailReportFailed, this);
      }

      return this.emailreportSettingModel;
    },

    //GEMINI : CSL-5609  (BUG #2) APR-18-2013
    ResetEmail: function() {
      Global.PrintOptions.EmailAddress = "";
    },

    PrintReportFailed: function(model, xhr, options) {
      this.LockTransactionScreen(false);
      model.RequestError(xhr, "Error Processing Receipt", "An error was encountered when trying to Generate Report.");
      this.HideActivityIndicator();
      this.RemoveScreenOverLay();
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
    },

    //Receiver of the Received data from the Server
    PrintReportComplete: function(model, response, options) {
      this.LogWithTime("PrintReportComplete...");
      this.LockTransactionScreen(false);
      if (response.ErrorMessage) {
        this.NotifyMsg(response.ErrorMessage, "Error Generating Report")  ;
        return;
      }

      response.IsPrintPickNote = model.get('IsPrintPickNote') || false;

      if (Global.Preference.IsAirprint) this.PrintDynamicReceipt(response, this._transactionCode, this._reportCode, false, this._isWorkstation);
      else this.PrintDynamicReceipt(response, this._transactionCode, this._reportCode, true, this._isWorkstation);

      if (Global.PrintOptions.EmailReceipt && !this._isWorkstation && !response.IsPrintPickNote) {
        this.StoreLastPrintingParameters(model);
        this.EmailReceipt(this._transactionCode, this.receiptType, this.receiptCodes);
      }

      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();

      if (response.IsPrintPickNote) Shared.ShowOverlayIfTransactionsViewIsVisible();

      if(!Global.Preference.AutoSignOutUser){
        this.ClearTransaction();
      } else {
        this.ClearTransactionWithoutInitalization();
        this.StopSignalR();
      }
      
    },

    StoreLastPrintingParameters: function(model) {
      var self = this,
        params = model.get("Parameters");
      self.lastPrintingParams = {
        CreditCardReportCode: "",
        TransactionCode: ""
      };
      if (!params) return;
      if (params.where({
          Name: "CreditCardReportCode"
        }).length > 0)
        self.lastPrintingParams.CreditCardReportCode = params.where({
          Name: "CreditCardReportCode"
        })[0].get("Value");
      if (params.where({
          Name: "TransactionCode"
        }).length > 0)
        self.lastPrintingParams.TransactionCode = params.where({
          Name: "TransactionCode"
        })[0].get("Value");
    },

    GetCreditCardReportCodeFromLastParameters: function(transactionCode) {
      var self = this;
      if (!self.lastPrintingParams) return "";
      if (self.lastPrintingParams.TransactionCode == transactionCode) {
        self.lastPrintingParams.TransactionCode = "";
        return self.lastPrintingParams.CreditCardReportCode;
      }
      return "";
    },

    EmailReportFailed: function(model, xhr, options) {
      model.RequestError(xhr, "Error Processing Receipt", "An error was encountered when trying to Generate Report.");
      this.HideActivityIndicator();
      this.RemoveScreenOverLay();

      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      //if(!$("#printPreviewContainer").is(":visible")) this.LockTransactionScreen(false);
      if (!$("#customizePrintPreview").is(":visible")) this.LockTransactionScreen(false);
      if ($("#spin").is(":visible")) this.HideActivityIndicator();
      if (Global.PrintOptions.Reprint) Global.PrintOptions.Reprint = false;
    },

    EmailReportComplete: function(model, response, options) {
      var isReadyForInvoice = model.get('IsReadyForInvoice') || false;

      if (response.ErrorMessage) {
        this.NotifyMsg(response.ErrorMessage, (isReadyForInvoice ? "Error Sending Email" : "Error Sending Report"), true);
      } else {
        if (isReadyForInvoice) {
          this.SetOrderReadyToInvoice(new BaseModel({
            SalesOrderCode: model.get('PickupOrderCode')
          }));
        }
      }


      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      //if(!$("#printPreviewContainer").is(":visible")) this.LockTransactionScreen(false);
      if (!$("#customizePrintPreview").is(":visible")) this.LockTransactionScreen(false);
      if ($("#spin").is(":visible")) this.HideActivityIndicator();
      if (Global.PrintOptions.Reprint) Global.PrintOptions.Reprint = false;

      if (isReadyForInvoice) Shared.ShowOverlayIfTransactionsViewIsVisible();
    },

    ProcessPrintPreview: function(pageSettings, code, isWorkstation) {
      if (!this.receiptPrint) {
        this.receiptPrint = new PrinterView({
          el: this.$el
        });
        this.receiptPrint.on("SignOut", this.SignOut, this);
      }

      this.receiptPrint.ProcessPrinting(pageSettings, code, isWorkstation);
    },

    PrintWorkstationReport: function(StatusModel, isXtape, isEmailReceipt) {
      isClosedWorkstation = true;
      this.reportType = "LastZtape";
      this.openDate = "";
      this.closeDate = "";

      var myDate = new Date();
      var displayDate = (myDate.getMonth() + 1) + (myDate.getDate()) + myDate.getFullYear() + myDate.getHours() + myDate.getMinutes() + myDate.getSeconds();
      this.GenerateReport(this.reportType, "z-tape-" + Global.Preference.WorkstationID + "-" + displayDate);
    },

    GetSelectedReportCode: function(reportcode, preference) {
      if (Shared.IsNullOrWhiteSpace(preference.SalesReportNoDiscount)) return reportcode;

      if (Global.PaymentType == "Credit Card") {
        var selectedPosPrinter = Global.POSSalesReceipt || 1;
        var creditCardReportCode = selectedPosPrinter == 1 ? preference.CreditCardReportCode : preference.CreditCardReportCode2;
        if (creditCardReportCode == null && selectedPosPrinter != 1) creditCardReportCode= preference.CreditCardReportCode;
        if (creditCardReportCode == null) creditCardReportCode = reportCode;

        if (Global.IsUseINVDiscountReport) {
          if (!Shared.IsNullOrWhiteSpace(preference.SalesReportDiscount) && creditCardReportCode == preference.SalesReportNoDiscount) {
            return preference.SalesReportDiscount;
          } else {
            return creditCardReportCode;
          }
        } else {
          return creditCardReportCode;
        }
      } else {
        return reportcode;
      };
    },

    GetReportCode: function(type, preference) {
      var reportCode = this.GetCustomerPOSReport(type, preference).reportCode;

      var isAirPrint = Global.Preference.IsAirprint;
      Global.Preference.IsAirprint = true;

      if (!reportCode || reportCode == "") {
        if (type == "CreateCreditMemo" || type == "ConvertInvoice" || type == "CreateRefund") {
          reportCode = preference.ReturnReportCode;
        } else if (type == "CreateInvoice" || type == "ConvertOrder" || type == "UpdateInvoice" || type == "Suspended") {
          if (!Global.Preference.IsAirprint) {
            reportCode = Global.ReportCode.Invoice;
          } else {
            reportCode = this.GetSelectedReportCode(preference.InvoiceReportCode, preference);
          }
        } else if (type == "CreateOrder" || type == "UpdateOrder" || type == "ConvertQuote") {
          if (!Global.Preference.IsAirprint) {
            reportCode = Global.ReportCode.Order;
          } else {
            reportCode = this.GetSelectedReportCode(preference.OrderReportCode, preference);
          }
        } else if (type == "CreateQuote" || type == "UpdateQuote") {
          if (!Global.Preference.IsAirprint) {
            reportCode = Global.ReportCode.Quote;
          } else {
            reportCode = preference.QuoteReportCode;
          }
        } else if (type == "CreateInvoicePayment") {
          if (!Global.Preference.IsAirprint) {
            reportCode = Global.ReportCode.Payment;
          } else {
            reportCode = preference.SalePaymentReportCode;
          }
        } else if (type === "Xtape") {
          reportCode = preference.XTapeReportCode;
        } else if (type === "LastZtape" || type === "SpecificZtape" || type === "DateZtape") {
          reportCode = preference.ZTapeReportCode;
        } else if (type === "GiftCard") {
          reportCode = Global.CustomerPreference.DefaultGiftCardReport;
        } else if (type === "GiftCertificate") {
          reportCode = Global.CustomerPreference.DefaultGiftCertificateReport;
        } else if (type === "CreatePickNote") {
          if (!Global.Preference.IsAirprint) {
            reportCode = Global.ReportCode.PickNote;
          } else {
            reportCode = preference.PickNoteReportCode;
          }
        }
      }

      Global.Preference.IsAirprint = isAirPrint;

      return reportCode;
    },

    GetTransactionType: function(type) {

      var transactionType = "";
      if (type == "CreateInvoice" || type == "ConvertOrder" || type == "UpdateInvoice" || type == "Suspended" || type === "LastZtape" || type === "SpecificZtape" || type === "DateZtape" || type === "Xtape" || type === "CreateInvoicePayment") {
        transactionType = "Sale";
      } else if (type == "CreateCreditMemo" || type == "ConvertInvoice" || type == "CreateRefund") {
        transactionType = "Return";
      } else if (type == "CreateOrder" || type == "UpdateOrder" || type == "ConvertQuote" || type === "CreatePickNote") {
        transactionType = "Order";
      } else if (type == "CreateQuote" || type == "UpdateQuote") {
        transactionType = "Quote";
      } else if (type == "GiftCard") {
        transactionType = "Gift Card";
      }

      return transactionType;
    },

    GenerateReport: function(type, transactionCode, isEmailReceipt, isGiftCard, isReadyForInvoice) {

      var preference = Global.Preference;
      var reportService = Global.ServiceUrl + "ReportService.svc";
      var reportCode = this.GetReportCode(type, preference);
      var posReport = this.GetCustomerPOSReport(type, preference);
      var isXtape = false,
        isZtape = false;
      var transactionType = this.GetTransactionType(type, isGiftCard);
      var serviceContentUri;
      var model;

      if (isEmailReceipt) {
        this.LockTransactionScreen(true, "Emailing Report...");
        model = this.InitializeEmailReportSettingModel();
        serviceContentUri = Global.ServiceUrl + Service.SOP + Method.EMAILREPORT;
      } else {
        this.LockTransactionScreen(true, "Processing Report...");
        model = this.InitializePrintReportSettingModel();
        serviceContentUri = Global.ServiceUrl + Service.POS + Method.EXPORTREPORT;
        var isSilentPrint = ((Global.Preference.AutoPrintReceipt && Global.PrintOptions.SilentPrint) || Global.PrintOptions.SilentPrint);
        if (type == "CreatePickNote") isSilentPrint = true;
        if (!isSilentPrint) {
          if (Global.isBrowserMode) serviceContentUri = Global.ServiceUrl + Service.POS + Method.SAVEREPORT
        }

      }

      if (type === "Xtape") {
        isXtape = true;
      } else if (type === "LastZtape" || type === "SpecificZtape" || type === "DateZtape") {
        isZtape = true;
      }

      var documentCodeName = "";

      if (type === "CreateInvoice" ||
        type === "CreateInvoicePayment" ||
        type === "ConvertOrder" ||
        type === "CreateCreditMemo" ||
        type === "ConvertInvoice" ||
        type === "CreateRefund" ||
        type === "CreditCard" ||
        type === "UpdateInvoice" ||
        type === "GiftCard") {
        documentCodeName = "InvoiceCode";
      } else if (type === "CreateOrder" || type === "UpdateOrder" || type === "ConvertQuote" || type === "CreateQuote" || type === "UpdateQuote" || type === "CreatePickNote") {
        documentCodeName = "SalesOrderCode";
      }

      var self = this;
      var _parameters = this.CreateReportSettingParameters(transactionCode, documentCodeName, type, isXtape, isZtape, transactionType, reportCode, isEmailReceipt);

      var onSuccess = function(collection) {
        Shared.Reporting.AssignWorkstationID(_parameters, collection);
        if (isGiftCard) var emailAddress = "test@test.com"
        else var emailAddress = Global.PrintOptions.EmailAddress
        model.set({
          ServiceUri: reportService,
          ServiceContentUri: serviceContentUri,
          ReportName: reportCode,
          UserName: Global.Username,
          Password: Global.Password,
          Parameters: _parameters,
          IsEmail: isEmailReceipt,
          IsAirPrint: preference.IsAirprint,
          RecipientEmailAddress: emailAddress,
          IsBrowserMode: Global.isBrowserMode,
          ReportFileName: transactionCode,

          //AddedForPickup
          PickupOrderCode: isReadyForInvoice ? transactionCode : null,
          IsReadyForInvoice: isReadyForInvoice,
          IsPrintPickNote: (type == "CreatePickNote"),
          WorkStationID: Global.POSWorkstationID
        });

        if (isEmailReceipt) self.ResetEmail();
        self._transactionCode = transactionCode;
        self._isWorkstation = (isXtape || isZtape);
        self._reportCode = reportCode;
        self._reportPrinter = posReport.printer;
        self._reportCopies = posReport.copies;

        model.url = serviceContentUri;
        model.save(null, {
          timeout: 0
        });
      }
      Shared.Reporting.GetReportCriterias(onSuccess, "", reportCode);
      //Global.PaymentType = "";
      Global.IsUseINVDiscountReport = false;

    },

    HasCreditCardPayments: function(collection) {
      var hasCardPayment = false;
      if (!collection) return hasCardPayment;
      if (collection.length == 0) return hasCardPayment;

      collection.each(function(payment) {
        if (Global.TransactionType == Enum.TransactionType.SalesPayment && !payment.get("IsNew")) return;

        if (payment.get("PaymentType") == Enum.PaymentType.CreditCard && Shared.IsNullOrWhiteSpace(payment.get("IsPrevCCPayment"))) {
          hasCardPayment = true
        }
      });

      return hasCardPayment;
    },

    HasNewCreditCardPayments: function() {
      var self = this,
        hasNewCardPayment = false;
      self.paymentCollection && (self.paymentCollection.length > 0) && self.paymentCollection.each(function(payment) {
        if (payment.get("PaymentType") == Enum.PaymentType.CreditCard && payment.get("IsNew")) hasNewCardPayment = true;
      });
      self.refundCollection && (self.refundCollection.length > 0) && self.refundCollection.each(function(payment) {
        if (payment.get("PaymentType") == Enum.PaymentType.CreditCard && payment.get("IsNew")) hasNewCardPayment = true;
      });
      return hasNewCardPayment;
    },

    CreateReportSettingParameters: function(transactionCode, documentCodeName, type, isXtape, isZtape, transactionType, reportCode, isEmailReceipt) {
      var _parameters = new ReportSettingCollection();
      var _receiptCodes = "";
      var _isSinglePage = Global.Preference.IsSinglePageTransactionReceipt;
      var _openDate = "",
        _closeDate = "";
      if (isXtape === true || isZtape === true) {
        if (isZtape === true) {
          _openDate = this.openDate;
          _closeDate = this.closeDate;
        }
      } else {
        _receiptCodes = this.receiptCodes;

        if (Global.TransactionType == Enum.TransactionType.SalesPayment) this.creditCardReceiptCodes = "";

        if (Shared.IsNullOrWhiteSpace(_receiptCodes) && !Shared.IsNullOrWhiteSpace(this.creditCardReceiptCodes)) {
          _receiptCodes = this.creditCardReceiptCodes;
        }
        if (!Shared.IsNullOrWhiteSpace(_receiptCodes) && !Shared.IsNullOrWhiteSpace(this.creditCardReceiptCodes)) {
          _receiptCodes += "," + this.creditCardReceiptCodes;
        }
        this.creditCardReceiptCodes = null;
      }
      var _creditCardReportCode = "";
      var _hasCreditCardPayment = false;
      var _lastCCRptCode = isEmailReceipt ? this.GetCreditCardReportCodeFromLastParameters(transactionCode) : "";
      if (!Shared.IsNullOrWhiteSpace(this.paymentCollection) || !Shared.IsNullOrWhiteSpace(this.customerPaymentCollection)) {
        if (!Shared.IsNullOrWhiteSpace(this.paymentCollection) && this.paymentCollection.length > 0) {

          if (Global.TransactionType == Enum.TransactionType.SalesRefund) _hasCreditCardPayment = this.HasCreditCardPayments(this.refundCollection);
          else _hasCreditCardPayment = this.HasCreditCardPayments(this.paymentCollection);

          if (_hasCreditCardPayment) {
            _creditCardReportCode = reportCode;
          }
        }
        if (Global.PrintOptions.Reprint && !Shared.IsNullOrWhiteSpace(this.customerPaymentCollection) && this.customerPaymentCollection.length > 0) {
          _hasCreditCardPayment = this.HasCreditCardPayments(this.customerPaymentCollection);
          if (_hasCreditCardPayment) {
            _creditCardReportCode = reportCode;
          }
        }
      }
      _parameters.add([{
        Name: "TransactionType",
        Value: transactionType
      }, {
        Name: "CreditCardReportCode",
        Value: _creditCardReportCode || _lastCCRptCode
      }, {
        Name: "IsSinglePageTransactionReceipt",
        Value: _isSinglePage
      }, {
        Name: "DocumentCode",
        Value: documentCodeName
      }, {
        Name: "TransactionCode",
        Value: transactionCode
      }, {
        Name: "IsXTapeReport",
        Value: isXtape
      }, {
        Name: "IsZTapeReport",
        Value: isZtape
      }, {
        Name: "ReceiptCodes",
        Value: _receiptCodes
      }]);

      _parameters = this.CreateZtapeParameters(type, _parameters, _openDate, _closeDate);

      return _parameters;
    },


    CreateZtapeParameters: function(type, parameters, openDate, closeDate) {
      var _parameters = parameters;
      var _openDate = openDate;
      var _closeDate = closeDate;
      switch (type) {
        case "SpecificZtape":
          _parameters.add([{
            Name: "OpenDateStart",
            Value: _openDate
          }]);
          break;
        case "DateZtape":
          _parameters.add([{
            Name: "OpenDateStart",
            Value: _openDate
          }, {
            Name: "OpenDateEnd",
            Value: _closeDate
          }, ]);
          break;
      }
      return _parameters;
    },

    PrintDynamicReceipt: function(pageSettings, transactionCode, reportType, isReceiptPrinter, isWorkstation) {
      $("#printPreviewContainer").html('<div></div>');
      this.dynamicPrintView = new DynamicPrintPreview({
        el: $("#printPreviewContainer div"),
        model: transactionCode,
        reportType: reportType,
        IsReceiptPrinter: isReceiptPrinter || false,
        IsWorkstation: isWorkstation || false,
        printer: this._reportPrinter,
        copies: this._reportCopies || 1
      });

      if (isClosedWorkstation) this.dynamicPrintView.on('formclosed', this.SignOut, this);
      this.dynamicPrintView.on('AutoSignOut', this.SignOut, this);
      this.HideActivityIndicator();
      this.dynamicPrintView.Show(pageSettings);

    },

    PrintInvoiceReceipt: function(invoiceCode, totalCashPayment) {
      this.GenerateReport(this.reportType, invoiceCode, false);
    },

    PrintOrderReceipt: function(orderCode, totalCashPayment) {
      this.GenerateReport(this.reportType, orderCode, false);
    },

    PrintQuoteReceipt: function(orderCode, totalCashPayment) {
      this.GenerateReport(this.reportType, orderCode, false);
    },

    PrintCreditMemoReceipt: function(invoiceCode) {
      this.GenerateReport(this.reportType, invoiceCode, false);
    },

    PrintRefundReceipt: function(invoiceCode, receivableCode) {
      this.GenerateReport(this.reportType, invoiceCode, false);
    },

    PrintPaymentReceipt: function(invoiceCode) {
      this.GenerateReport(this.reportType, invoiceCode, false);
    }, //jjx

    ProcessReceipt: function(transactionCode, totalCashPayment) {
      this.GenerateReport(this.reportType, transactionCode, false);
    },

    EmailInvoiceReceipt: function(invoiceCode, toAddress, totalCashPayment) {
      this.GenerateReport(this.reportType, invoiceCode, true);
    },

    EmailOrderReceipt: function(orderCode, toAddress, totalCashPayment, isReadyForInvoice) {
      this.GenerateReport(this.reportType, orderCode, true, null, isReadyForInvoice);
    },

    EmailQuoteReceipt: function(orderCode, toAddress) {
      this.GenerateReport(this.reportType, orderCode, true);
    },

    EmailCreditMemoReceipt: function(invoiceCode, toAddress) {
      this.GenerateReport(this.reportType, invoiceCode, true);
    },

    EmailRefundReceipt: function(receivableCode, receiptCode, toAddress) {
      this.GenerateReport(this.reportType, receivableCode, true);
    },

    EmailPaymentReceipt: function(invoiceCode) {
      this.GenerateReport(this.reportType, invoiceCode, true);
    }, //jjx

    GetReceiptCodes: function(transaction) {
      receiptCodes = "";
      for (var i = 0, j = transaction.PaymentResponses.length; i < j; i++) {
        var paymentCode = transaction.PaymentResponses[i].PaymentCode;
        if (paymentCode != "" && paymentCode != null) {
          receiptCodes = receiptCodes + paymentCode + ",";
        }
      };
      if (receiptCodes != "" && receiptCodes != null) {
        receiptCodes = receiptCodes.substring(0, receiptCodes.length - 1);
      }
      return receiptCodes;
    },

    ShowManagerOverride: function(removeOverlayOnClose) {
      this.InitializeManagerOverrideView();

      //this.managerOverrideView.off('CloseClicked', this.LockTransactionScreen(false), this);
      this.managerOverrideView.off('CloseClicked');
      if (removeOverlayOnClose) this.managerOverrideView.on('CloseClicked', this.LockTransactionScreen(false), this);

      this.managerOverrideView.Show();
      return false;
    },

    InitializeManagerOverrideView: function() {
      if (!this.managerOverrideView) {
        this.managerOverrideView = new ManagerOverrideView({
          el: $("#managerOverrideContainer")
        });
        this.managerOverrideView.on("ManagerOverrideAccepted", this.AcceptManagerOverride, this);
      }
    },

    AcceptManagerOverride: function(username, password) {
      var self = this;
      var _origUsername = Global.Username;
      var _origPassword = Global.Password;
      var overrideModel = new OverrideModel();
      //console.log("Accepted");
      //Need to set the username and password for authentication
      Global.Username = username;
      Global.Password = password;
      overrideModel.url = Global.ServiceUrl + Service.POS + Method.MANAGEROVERRIDE + Global.POSWorkstationID + "/" + Global.OverrideMode;
      overrideModel.save(null, {
        success: function(model, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          self.AcceptManagerOverrideCompleted(model, response);
        },
        error: function(model, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          model.RequestError(error, "Error");
        }
      });

      //Reset the original username and password after manager override process
      Global.Username = _origUsername;
      Global.Password = _origPassword;
    },

    AcceptManagerOverrideCompleted: function(model, response) {
      if (response.ErrorMessage == null || response.ErrorMessage == "") {
        mode = Global.OverrideMode;
        //console.log("Override Mode:" + mode);
        if (mode === Enum.ActionType.VoidTransaction) {
          //console.log("executed - here")
          this.VoidTransaction();
          if (Global.Preference.IsReasonTransactionVoid) {
            this.SaveReason();
          }
        } else if (mode === Enum.ActionType.Returns || mode === Enum.ActionType.SalesCredit || mode === Enum.ActionType.SalesRefund) {
          this.CreateRefund();
          if (Global.Preference.IsReasonReturns) {
            this.SaveReason();
          }additem
        } else if (mode === Enum.ActionType.AutoAllocate && Global.TransactionType === Enum.TransactionType.Sale) {
          //console.log('AutoAllocate ManagerOverride >> Create Invoice');
          //this.CreateInvoice(Global.IsPosted);
          Global.ManagerValidated = true;
          if (Global.CurrentItem != null) {
            this.cartCollection.add(Global.CurrentItem);
            Global.CurrentItem = null;
          } else {
            this.item.set({
              QuantityOrdered: Global.CurrentAssignedItemQty,
            });
            this.UpdateCartItem(this.item, 0, "QuantityOrderedUpdated", true);
          }
          navigator.notification.alert(Global.msg1, null, Global.msgTitle, "OK");
        } else if (mode === Enum.ActionType.AutoAllocate && Global.TransactionType === Enum.TransactionType.Suspend) {
          /*if (this.IsExistingTransaction()) {
            //console.log('AutoAllocate ManagerOverride >> Update Invoice');
            this.UpdateInvoice();
          } else {
            //console.log('AutoAllocate ManagerOverride >> Suspend Invoice');
            this.CreateInvoice(Global.IsPosted);
          }*/
          Global.ManagerValidated = true;
          if (Global.CurrentItem != null) {
            this.cartCollection.add(Global.CurrentItem);
            Global.CurrentItem = null;
          }
          navigator.notification.alert(Global.msg1, null, Global.msgTitle, "OK");
        } else if (mode === Enum.ActionType.AutoAllocate && Global.TransactionType === Enum.TransactionType.UpdateInvoice) {
          //console.log('AutoAllocate ManagerOverride >> Update Invoice');
          //this.UpdateInvoice();
          Global.ManagerValidated = true;
        } else if (mode === Enum.ActionType.AutoAllocate && Global.TransactionType === Enum.TransactionType.ConvertOrder) {
          //console.log('AutoAllocate ManagerOverride >> Convert Order');
          //this.ConvertOrder(Global.TransactionCode);
          Global.ManagerValidated = true;
          if (Global.CurrentItem != null) {
            this.cartCollection.add(Global.CurrentItem);
            Global.CurrentItem = null;
          }
          navigator.notification.alert(Global.msg1, null, Global.msgTitle, "OK");
        }

        this.managerOverrideView.Close();
      } else {
        console.log(response.ErrorMessage);
        navigator.notification.alert(response.ErrorMessage, null, "Override Failed", "OK");
      }
      this.FocusToItemScan();
    },

    SetActionType: function(type) {
      Global.ActionType = type;
    },

    HasOpenTransaction: function() {
      if (this.cartCollection && this.cartCollection.length > 0) {
        return true;
      } else if (Global.TransactionCode != null && Global.TransactionCode != "") {
        return true;
      } else if (this.couponModel != null && this.couponModel.get("CouponCode") != null) {
        return true;
      } else if (this.paymentCollection && this.paymentCollection.length > 0) {
        //console.log(this.paymentCollection.length + ' Payment(s) exists.');
        return true;
      }
      return false;
    },

    UpdateDrawerBalance: function() {
      var status = Global.Status;

      if (status != null && status.IsOpen) {
        switch (Global.SelectedPaymentType) {
          case Enum.PaymentType.Cash:
          cashPayment = this.GetCashPayment();
          if (cashPayment != null) {
            switch (Global.TransactionType) {
              case Enum.TransactionType.SalesRefund:
                status.TotalCashReturns = status.TotalCashReturns + cashPayment;
                break;
              case Enum.TransactionType.Return:
                 var returnAmount = 0;
                 if (cashPayment == 0) returnAmount = this.GetTransactionBalance();
                 else returnAmount = cashPayment;
                  status.TotalCashReturns = status.TotalCashReturns + returnAmount;
                  break;
              default:
                status.TotalCashSales = status.TotalCashSales + cashPayment;
                break;
            }
            } else {
              if (Global.TransactionType === Enum.TransactionType.Sale) {
                var balance = this.GetTransactionBalance();
                if (balance < 0) {
                  status.TotalCashReturns = status.TotalCashReturns + balance;
                }
              }
            }
             break;
              case Enum.PaymentType.CreditCard:
                  switch (Global.TransactionType) {
                    case Enum.TransactionType.SalesRefund:
                      if(Global.DejavooEnabled || Global.OfflineCharge) {
                        var refundcashPayment = this.GetCashPayment();
                        status.TotalCardReturns = status.TotalCardReturns + refundcashPayment;
                      }
                      else {
                        var cardPayment = this.GetCardPayment();
                        status.TotalCardReturns = status.TotalCardReturns + cardPayment;
                      }
                    break;
                    case Enum.TransactionType.Return:
                        if(Global.DejavooEnabled || Global.OfflineCharge) {
                          var refundcashPayment = this.GetTransactionBalance();
                          status.TotalCardReturns = status.TotalCardReturns + refundcashPayment;
                        }
                        else {
                          var cardPayment = this.GetCardPayment();
                          status.TotalCardReturns = status.TotalCardReturns + cardPayment;
                        }
                    break;
                    
                    default:
                    {
                      var cardPayment = this.GetCardPayment();
                      status.TotalCardSales = status.TotalCardSales + cardPayment;
                    }
                    
                    break;
                    
                  }
                 break;
               
                  case Enum.PaymentType.Check:
                    checkPayment = this.GetCheckPayment();
                    if (checkPayment > 0) {
                      switch (Global.TransactionType) {
                        case Enum.TransactionType.SalesRefund:
                          status.TotalCheckReturns = status.TotalCheckReturns + checkPayment;
                          break;
                        case Enum.TransactionType.Return:
                          status.TotalCheckReturns = status.TotalCheckReturns + checkPayment;
                          break;
                        default:
                          status.TotalCheckSales = status.TotalCheckSales + checkPayment;
                          break;
                      }
                    }
                    else {
                      if (checkPayment == 0)  {
                           switch (Global.TransactionType) {
                        
                          case Enum.TransactionType.Return:
                           var returnAmount = 0;
                           if (checkPayment == 0) returnAmount = this.GetTransactionBalance();
                            else returnAmount = checkPayment;
                            status.TotalCheckReturns = status.TotalCheckReturns + returnAmount;
                            break;
                          default:
                            break;
                        }
                      }
            
                    }
                    break ;
        }

       
        //GetGiftCardPayments
        var giftCardPayment = this.GetGiftCardPayment();
        if (giftCardPayment > 0) {
          switch (Global.TransactionType) {
            case Enum.TransactionType.SalesRefund:
              //status.TotalCardReturns = status.TotalGiftCardReturns + giftCardPayment;
              break;
            default:
              status.TotalGiftCardSales = status.TotalGiftCardSales + giftCardPayment;
              break;
          }
        }

        var giftCertificatePayment = this.GetGiftCertificatePayment();
        if (giftCertificatePayment > 0) {
          switch (Global.TransactionType) {
            case Enum.TransactionType.SalesRefund:
              //status.TotalCardReturns = status.TotalGiftCardReturns + giftCardPayment;
              break;
            default:
              status.TotalGiftCertificateSales = status.TotalGiftCertificateSales + giftCertificatePayment;
              break;
          }
        }

        Global.Status = status;
        this.UpdateWorkstation(status);
      }
    },

    GetCashPayment: function() {
      var payment = new PaymentCollection();
      var _newPayments;

      switch (Global.TransactionType) {
        case Enum.TransactionType.SalesRefund:
          if (this.refundCollection) {
            _newPayments = this.refundCollection.GetNewPayments();
          }
          break;
        default:
          if (this.paymentCollection) {
            _newPayments = this.paymentCollection.GetNewPayments();
          }
          break;
      }

      payment.add(_newPayments)
      if (payment.length > 0) {
        return payment.totalCashPayment();
      }

      return null;
    },

    GetCheckPayment: function() {
      var payment = new PaymentCollection();
      var _newPayments;

      switch (Global.TransactionType) {
        case Enum.TransactionType.SalesRefund:
          if (this.refundCollection) {
            _newPayments = this.refundCollection.GetNewPayments();
          }
          break;
        default:
          if (this.paymentCollection) {
            _newPayments = this.paymentCollection.GetNewPayments();
          }
          break;
      }

      payment.add(_newPayments)
      if (payment.length > 0) {
        return payment.totalCheckPayment();
      }

      return null;
    },

    GetCardPayment: function() {
      var payment = new PaymentCollection();
      var _newPayments;

      switch (Global.TransactionType) {
        case Enum.TransactionType.SalesRefund:
          if (this.refundCollection) {
            _newPayments = this.refundCollection.GetNewPayments();
          }
          break;
        default:
          if (this.paymentCollection) {
            _newPayments = this.paymentCollection.GetNewPayments();
          }
          break;
      }

      payment.add(_newPayments)
      if (payment.length > 0) {
        return payment.totalCardPayment();
      }

      return null;
    },

    GetGiftCardPayment: function() {
      var payment = new PaymentCollection();
      var _newPayments;

      switch (Global.TransactionType) {
        case Enum.TransactionType.SalesRefund:
          if (this.refundCollection) {
            _newPayments = this.refundCollection.GetNewPayments();
          }
          break;
        default:
          if (this.paymentCollection) {
            _newPayments = this.paymentCollection.GetNewPayments();
          }
          break;
      }

      payment.add(_newPayments)
      if (payment.length > 0) {
        return payment.totalGiftCardPayment();
      }

      return null;
    },


    GetGiftCertificatePayment: function() {
      var payment = new PaymentCollection();
      var _newPayments;

      switch (Global.TransactionType) {
        case Enum.TransactionType.SalesRefund:
          if (this.refundCollection) {
            _newPayments = this.refundCollection.GetNewPayments();
          }
          break;
        default:
          if (this.paymentCollection) {
            _newPayments = this.paymentCollection.GetNewPayments();
          }
          break;
      }

      payment.add(_newPayments)
      if (payment.length > 0) {
        return payment.totalGiftCertificatePayment();
      }

      return null;
    },

    UpdateWorkstation: function(status) {
      //update POS Status
      if (status != null) {
        workstationID = Global.POSWorkstationID;

        if (workstationID === "" || workstationID === null) {
          //console.log("Workstation ID is required to update workstation status.");
          navigator.notification.alert("Workstation ID is required to update workstation status.", null, "Workstation ID is Required", "OK");
        }

        var workstationModel = new WorkstationModel(status);
        workstationModel.url = Global.ServiceUrl + Service.POS + Method.UPDATEWORKSTATION + Global.POSWorkstationID;
        workstationModel.save(null, {
          success: function(model, response) {
            if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          },
          error: function(model, error, response) {
            if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
            model.RequestError(error, "Error Updating Workstation");
          }
        });
      }
    },

    OpenWorkstation: function(openAmount) {
      var _self = this;
      var workstationID = Global.POSWorkstationID;
      if (workstationID === "" || workstationID === null) {
        //console.log("Workstation ID is required to start tracking of sales.");
        navigator.notification.alert("Workstation ID is required to start tracking of sales.", null, "Workstation ID is Required", "OK");
      }

      var workstationModel = new WorkstationModel();
      workstationModel.url = Global.ServiceUrl + Service.POS + Method.OPENWORKSTATION + Global.POSWorkstationID + "/" + openAmount;
      workstationModel.save(null, {
        success: function(model, response) {
          if (printerTool) {
            printerTool.openCashDrawer(Global.Preference.DefaultPrinter).then(function() {
              console.log("DrawerKick!");
            })
          }

          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          _self.OpenWorkstationCompleted(model, response);
          //console.log("OpenWorkstation");
        },
        error: function(model, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          model.RequestError(error, "Error Opening Workstation");
        }
      });
    },

    OpenWorkstationCompleted: function(model, response) {
      if (response != null) {
        Global.Status = response;
      }
    },

    PromptCloseWorkstation: function() {
      this.StopSignalR();
      switch (Global.Preference.TrackDrawerBalance) {
        case true:
          if (Global.Status === null || !Global.Status.IsOpen) {
            //console.log("This workstation is currently closed.");
            navigator.notification.alert("This workstation is currently closed.", null, "Workstation Closed", "OK");
          } else {
            Global.ClosingWorkStation = true;
            this.ShowClosingAmount(true);
          }
          break
        case false:
          //console.log("Tracking of drawer balance is disabled. Go to Settings to enable 'Track Drawer Balance'.");
          navigator.notification.alert("Tracking of drawer balance is disabled. Go to Settings to enable 'Track Drawer Balance'.", null, "Track Drawer Balance Disabled", "OK");
          break;
      }
    },

    ShowClosingAmount: function(allowCancel) {
      if (Global.ClosingWorkStation) Global.isOkToOpenCashDrawer = true;
      else Global.isOkToOpenCashDrawer = false;

      if (Global.isOkToOpenCashDrawer && printerTool) {
        printerTool.openCashDrawer(Global.Preference.DefaultPrinter).then(function() {
          console.log("DrawerKick!");
        })
      }

      if (!this.closingAmountView) {
        this.closingAmountView = new ClosingAmountView({
          el: $("#closingAmountContainer"),
          AllowCancel: allowCancel
        });
        this.closingAmountView.on("SaveAmount", this.CloseWorkstation, this);
      } else {
        this.closingAmountView.Show(allowCancel);
      }
    },

    CloseWorkstation: function(closeAmount) {
      var _self = this;
      var workstationID = Global.POSWorkstationID;
      var status = Global.Status;
      status.CloseAmount = closeAmount;

      if (workstationID === "" || workstationID === null) {
        console.log("Workstation ID is required to close workstation.");
        navigator.notification.alert("Workstation ID is required to close workstation.", null, "Workstation ID is Required", "OK");
      }

      var workstationModel = new WorkstationModel(status);
      workstationModel.url = Global.ServiceUrl + Service.POS + Method.CLOSEWORKSTATION + Global.POSWorkstationID;
      workstationModel.save(null, {
        success: function(model, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          _self.CloseWorkstationCompleted(model, response);
          console.log("CloseWorkstation");
        },
        error: function(model, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          model.RequestError(error, "Error Closing Workstation");
        }
      });
    },

    CloseWorkstationCompleted: function(model, response) {
      if (response != null) {
        Global.Status = null;
        Global.PreventDrawerKick = false;
        var adminRole = Global.AdministratorRole;
        if (!Global.AdministratorRole) {
          if (Global.Preference.TrackDrawerBalance === true && Global.Preference.BlindClose === false) {
            this.PrintWorkstationReport(model, false, false);
          } else {
            // if (!Global.isBrowserMode) {
            //   Shared.Printer.DrawerKick();
            // } else {
            //   Shared.PrintBrowserMode.DrawerKick();
            // }
            this.SignOut();
          }

        } else {
          this.PrintWorkstationReport(model, false, false);
        }
      }
    },

    ConfirmDrawerBalanceTracking: function() {
      if (Global.PromptCloseWorkstation) {
        //this.ShowClosingAmount(false); // removed by PR. Ebron 3.19.13
        Global.PromptCloseWorkstation = false;
      } else {
        this.PromptOpenWorkstation();
      }
    },

    ValidateUpdateTransactionType: function(type) {
      //Do not allow changing the transaction type to Order or Quote when cart/tape has negative quantity
      if (this.cartCollection && this.cartCollection.length > 0) {
        if (type === Enum.TransactionType.Return) {
          navigator.notification.alert('Please complete or cancel the current transaction first.', null, 'Action not Allowed', 'OK');
          return false;
        }

        if (type === Enum.TransactionType.Order || type === Enum.TransactionType.Quote) {
          var _negativeQuantityItem = this.cartCollection.find(function(cartItem) {
            return cartItem.get("QuantityOrdered") < 0;
          });
          if (_negativeQuantityItem) {
            var _errorMessage = "The current transaction has a negative quantity. Changing the transaction to Order or Quote is not allowed.";
            console.log(_errorMessage);
            navigator.notification.alert(_errorMessage, null, "Negative Quantity", "OK");
            return false;
          }
        }
      }
      return true;
    },

    ShowStatusReport: function() {
      if (!this.statusReportView) {
        this.statusReportView = new StatusReportView({
          el: $("#printTapeContainer")
        });
        this.statusReportView.on("Xtape", this.PrintXtape, this);
        this.statusReportView.on("LastZtape", this.PrintLastZtape, this);
        this.statusReportView.on("SpecificZtape", this.PrintSpecificZtape, this);
        this.statusReportView.on("DateZtape", this.PrintDateZtape, this);
      } else {
        this.statusReportView.Show();
      }
    },

    PromptWorkstationReport: function() {
      this.StopSignalR();
      this.ShowStatusReport();
    },

    PrintXtape: function() {
      $("#main-transaction-blockoverlay").show();
      if (Global.Preference.TrackDrawerBalance) {
        Global.PreventDrawerKick = true;
        this.reportType = "Xtape";
        var myDate = new Date();
        var displayDate = (myDate.getMonth() + 1) + (myDate.getDate()) + myDate.getFullYear() + myDate.getHours() + myDate.getMinutes() + myDate.getSeconds();
        this.GenerateReport(this.reportType, "x-tape-" + Global.Preference.WorkstationID + "-" + displayDate); ///jjjx
      } else {
        navigator.notification.alert("This report is unavailable when track drawer balance tracking is off. ", null, "Action Not Allowed", "OK");
      }
    },

    PrintLastZtape: function() {
      $("#main-transaction-blockoverlay").show();
      Global.PreventDrawerKick = true;
      this.openDate = "";
      this.closeDate = "";
      this.reportType = "LastZtape";
      var _self = this;

      var myDate = new Date();
      var displayDate = (myDate.getMonth() + 1) + (myDate.getDate()) + myDate.getFullYear() + myDate.getHours() + myDate.getMinutes() + myDate.getSeconds();
      this.GenerateReport(this.reportType, "z-tape-" + Global.Preference.WorkstationID + "-" + displayDate);
    },

    PrintSpecificZtape: function(openDate) {
      $("#main-transaction-blockoverlay").show();
      Global.PreventDrawerKick = true;
      this.openDate = openDate;
      this.closeDate = "";
      this.reportType = "SpecificZtape";
      var myDate = new Date();
      var displayDate = (myDate.getMonth() + 1) + (myDate.getDate()) + myDate.getFullYear() + myDate.getHours() + myDate.getMinutes() + myDate.getSeconds();
      this.GenerateReport(this.reportType, "specific-z-tape-" + Global.Preference.WorkstationID + "-" + displayDate);
    },

    PrintDateZtape: function(openDate, closeDate) {
      $("#main-transaction-blockoverlay").show();
      Global.PreventDrawerKick = true;
      this.openDate = openDate;
      this.closeDate = closeDate;
      this.reportType = "DateZtape";
      var _self = this;
      var myDate = new Date();
      var displayDate = (myDate.getMonth() + 1) + (myDate.getDate()) + myDate.getFullYear() + myDate.getHours() + myDate.getMinutes() + myDate.getSeconds();
      this.GenerateReport(this.reportType, "date-z-tape-" + Global.Preference.WorkstationID + "-" + displayDate);
    },

    ChangeItemPriceOnUnitMeasure: function(model) {
      this.GetSaleItemPriceTax(
        model.get("ItemCode"),
        Global.CustomerCode,
        model.get("WarehouseCode"),
        model.get("UnitMeasureCode"),
        Global.Preference.TaxByLocation,
        this.GetCouponID(),
        model,
        "UpdateUnitMeasure"
      );
    },

    ChangeItemPriceOnWarehouseCode: function(model) {
      Global.IsChangeWarehouse = true;
      this.GetSaleItemPriceTax(
        model.get("ItemCode"),
        Global.CustomerCode,
        model.get("WarehouseCode"),
        model.get("UnitMeasureCode"),
        Global.Preference.TaxByLocation,
        this.GetCouponID(),
        model,
        "UpdateWarehouseCode"
      );
    },

    UpdateItemPriceOnUnitMeasure: function(_model, itemCode, itemLineNum) {
      var _unitMeasureCode = _model.get("UnitMeasureCode");
      var _newUMQty = _model.get("UnitMeasureQty")

      var item = this.cartCollection.find(function(model) {
        return (model.get("ItemCode") == itemCode && model.get("UnitMeasureCode") == _unitMeasureCode && model.get("LineNum") == itemLineNum);
      });

      if (item) {
        this.cartCollection.each(function(model) {
          if (item.cid == model.cid) model.set({
            UnitMeasureQty: _newUMQty
          })
        }, this)

        item.set({
          IsOutOfStock: _model.get("IsOutOfStock")
        });
        item.updateSalesPriceRate(parseFloat(_model.get("Price")), "UnitMeasureUpdated");
      }
    },

    UpdateItemPriceOnWarehouseCode: function(_model, itemCode, newItem) { //v1420
      var _price = newItem.get("SalesPrice");
      var item = this.cartCollection.find(function(model) {
        return model.get("ItemCode") === itemCode && model.get("LineNum") === _model.get("LineNum");
      });

      if (item) {
        item.set({
          IsOutOfStock: _model.get("IsOutOfStock")
        });
        // item.updateSalesPriceRate(parseFloat(_model.get("Price")), "QuantityOrderedUpdated");
        item.updateSalesPriceRate(parseFloat(_price), "QuantityOrderedUpdated");
      }
    },

    GetSimilarItemsOnCart: function(itemModel, ignoreLineNum, isNewLine) {
      if (!itemModel || !itemModel.attributes) return null;

      var similarItems = new Array();
      if (this.cartCollection)
        if (this.cartCollection.length > 0) {
          this.cartCollection.each(function(model) {
            if (!ignoreLineNum)
              if (model.attributes.LineNum == itemModel.attributes.LineNum) return;
            if (model.attributes.ItemCode != itemModel.attributes.ItemCode) return;
            if (model.attributes.WarehouseCode != itemModel.attributes.WarehouseCode) return;
            similarItems[similarItems.length] = {
              ItemCode: model.attributes.ItemCode,
              ItemType: model.attributes.ItemType,
              Quantity: model.attributes.QuantityOrdered,
              UnitMeasureCode: model.attributes.UnitMeasureCode,
              WarehouseCode: model.attributes.WarehouseCode
            };
          });
          if (!ignoreLineNum) return similarItems;
        }

        //New and First item to be added on cart
      if (ignoreLineNum && isNewLine) {
        similarItems[similarItems.length] = {
          ItemCode: itemModel.attributes.ItemCode,
          ItemType: itemModel.attributes.ItemType,
          Quantity: 1, //itemModel.attributes.QuantityOrdered,
          UnitMeasureCode: itemModel.attributes.UnitMeasureCode,
          WarehouseCode: itemModel.attributes.WarehouseCode
        };
      }

      return similarItems;
    },

    GetTransactionCodeForStockVerification: function() {
      if (Global.TransactionCode && (Global.TransactionType == Enum.TransactionType.UpdateInvoice || Global.TransactionType == Enum.TransactionType.ConvertOrder)) {
        return Global.TransactionCode;
      }
      return null;
    },

    ChangeItemExtendedPrice: function(item, quantity, isRecalCouponAfterChangePrice) {
      if (!this.ValidateTransactionAmount(this.couponModel, false, 0)) {
        var _errorMessage = "A minimum transaction amount of " + Global.CurrencySymbol + this.couponModel.get("RequiresMinimumOrderAmount").toFixed(2) + " is required to avail coupon " + this.couponModel.get("Description") + ".";
        navigator.notification.alert(_errorMessage, null, "Minimum Amount Required", "OK");
        this.VoidCoupon(false);
      }

      if (this.IsRequireRecalculateCoupon() && !isRecalCouponAfterChangePrice) {
        this.RecalculateCoupon();
      } else {
        //JHENSON : FOR INTMOBA-782 * this line is only triggered when QuantityOrderedUpdated is called to reset the price whenever qty is changed.
        if (!this.IsReturn())
          if (item)
            if (item.get("LastEvent"))
              if (item.get("LastEvent") == "QuantityOrderedUpdated") {
                //This line is added because the webservice uses "Resume Sale" instead of "Update Invoice" INTMOBA-849
                var _transactionType = Global.TransactionType;
                if (Global.TransactionType == Enum.TransactionType.UpdateInvoice) _transactionType = Enum.TransactionType.ResumeSale;

                var _itemClone = item.clone();

                if (_itemClone.get("ItemType") === Enum.ItemType.NonStock) _itemClone.set({
                  WarehouseCode: Global.LocationCode,
                  IsOutOfStock: false
                });

                _itemClone.set({
                  TransactionType: _transactionType,
                  CustomerCode: Global.CustomerCode,
                  ShipToCode: Global.ShipTo.ShipToCode,
                  IsTaxByLocation: Global.Preference.TaxByLocation,
                  WebSiteCode: Shared.GetWebsiteCode(),
                });

                var self = this;
                var onSuccess = function(model, response, options) {
//                  Global.PreviousAssignedItemQty = model.get("QuantityDisplayed");
                  if (self.CalculateItemExtPriceErrorHandler(model, response, options)) return;
                  //self.item = self.GetSelectedItem(model.get("ItemCode"), model.get("UnitMeasure"));
                  self.item = self.GetSelectedItem(model.get("ItemCode"), model.get("UnitMeasureCode"), model.get("LineNum")); // PR.Ebron : 4.10.13 : CSL-5132
                  switch (Global.TransactionType) {
                    case Enum.TransactionType.SalesRefund:
                      self.item.set({
                        Good: quantity, //Originally Defective
                        ExtPriceRate: model.get("ExtPriceRate")
                      });
                      if (Shared.IsNullOrWhiteSpace(item.get("DoNotChangePrice"))) {
                        self.item.set({
                          SalesPriceRate: model.get("SalesPriceRate"),
                          SalesPrice: model.get("SalesPriceRate"),
                        });
                      }
                      break;
                    default:
                      self.item.set({
                        QuantityOrdered: quantity,
                        QuantityDisplayed: quantity,
                        ExtPriceRate: model.get("ExtPriceRate"),
                        //SalesPriceRate : model.get("SalesPriceRate"),
                        //SalesPrice : model.get("SalesPriceRate"),
                        IsModified: true, //CSL - 13175 : 08.28.13
                      });
                      if (Shared.IsNullOrWhiteSpace(item.get("DoNotChangePrice"))) {
                        self.item.set({
                          SalesPriceRate: model.get("SalesPriceRate"),
                          SalesPrice: model.get("SalesPriceRate"),
                        });
                      }

                      if (model.get('ItemType') == Enum.ItemType.Kit) {
                        var kitItems = new BaseCollection();
                        var SalesPrice = 0,
                            SalesPriceRate = 0;
                        kitItems.add(JSON.parse(window.sessionStorage.getItem('kitItems-' + model.get('LineNum'))));

                        kitItems.each(function(kit) {
                          kit.set('Quantity', quantity);
                          kit.set('Total', (kit.get("OriginalQuantity") * kit.get("SalesPrice")));
                          kit.set('TotalRate', (kit.get("OriginalQuantity") * kit.get("SalesPriceRate")));
                          SalesPrice += kit.get("Total");
                          SalesPriceRate += kit.get("TotalRate");
                        });
                        model.set("SalesPrice",SalesPrice);
                        model.set("SalesPriceRate",SalesPriceRate);
                        model.set("ExtPriceRate",SalesPriceRate * quantity );
                        window.sessionStorage.removeItem('kitItems-' + model.get('LineNum'));
                        window.sessionStorage.setItem('kitItems-' + model.get('LineNum'), JSON.stringify(kitItems));
                        if (this.cartView) this.cartView.trigger('updateKitDisplay', model);
                      }
                      break;
                  }

                  if (!Shared.IsNullOrWhiteSpace(this.orginalResumeInvoiceCollection)) { //jj1234 - this function is for resume invoice
                    if (this.orginalResumeInvoiceCollection.length > 0) {
                      var _qtyAllocated = 0;
                      var _isUseSameWarehouseCode = true;
                      _isUseSameWarehouseCode = this.orginalResumeInvoiceCollection.find(function(oldItem) {
                        var condition = (oldItem.get("ItemCode") == model.get("ItemCode") && oldItem.get("WarehouseCode") == model.get("WarehouseCode"));
                        if (condition) _qtyAllocated = oldItem.get("OriginalQuantityAllocated")
                        return condition;
                      });
                      self.item.set({
                        OriginalQuantityAllocated: _qtyAllocated
                      });
                    }
                  }


                  if (!Shared.IsNullOrWhiteSpace(item.get("DoNotChangePrice"))) {
                    var _extPriceRate = self.CalculateExtPrice(
                      quantity,
                      self.item.get("SalesPriceRate"),
                      self.item.get("Discount"),
                      self.item.get("CouponDiscountType"),
                      self.item.get("CouponDiscountAmount"),
                      self.item.get("CouponComputation"),
                      self.item.get("LineNum"));

                    self.item.set({
                      ExtPriceRate: _extPriceRate
                    });
                  }

                  self.cartView.UpdateExtPriceField(self.item.get("ExtPriceRate"), self.item);
                  self.TaxChangeSaveSuccess(model, response, options);
                  if (isRecalCouponAfterChangePrice) {
                    if (!Shared.IsNullOrWhiteSpace(self.couponModel.get("CouponCode"))) {
                      this.LockTransactionScreen(true, "Computing Coupon");
                    }

                    self.RecalculateCoupon();
                  }

                  //if (!self.requestQueue) self.InitializeRequestQueue();
                  //self.requestQueue.trigger('startQueue', self.requestQueue);
                  //console.log("jhz! - ChangeItemExtendedPrice");
                }

                _itemClone.set({
                  SimilarItemsOnCart: self.GetSimilarItemsOnCart(_itemClone),
                  DocumentCode: self.GetTransactionCodeForStockVerification(),
                });

                this.CalculateItemExtPrice(_itemClone, onSuccess);
                return;
              }

        console.log("Sales Price Rate : " + item.get("SalesPriceRate") + " Change Price : " + item.get("DoNotChangePrice"));
        var _extPriceRate = this.CalculateExtPrice(
          quantity,
          item.get("SalesPriceRate"),
          item.get("Discount"),
          item.get("CouponDiscountType"),
          item.get("CouponDiscountAmount"),
          item.get("CouponComputation"),
          item.get("LineNum"));
         // var _taxCode = window.sessionStorage.getItem('selected_taxcode');
          var _taxCode = item.get("SalesTaxCode");
          if (_taxCode == null || _taxCode == "") _taxCode = item.get("TaxCode");
        switch (Global.TransactionType) {
          case Enum.TransactionType.SalesRefund:
            item.set({
              Good: quantity, //Originally Defective
              ExtPriceRate: _extPriceRate
            });
            break;
          default:
            item.set({
              QuantityOrdered: quantity,
              ExtPriceRate: _extPriceRate,
              TaxCode: _taxCode
            });
            break;
        }

        this.cartView.UpdateExtPriceField(_extPriceRate, item)
        this.ChangeItemTax(item);
      }
    },

    GetSelectedItem: function(itemCode, unitMeasure, lineNum) {
      var item = this.cartCollection.find(function(model) {
        return (model.get("ItemCode") === itemCode && model.get("UnitMeasureCode") === unitMeasure && model.get("LineNum") == lineNum);
      });
      return item;
    },

    TaxChangeSaveSuccess: function(model, response, options) {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      this.item = this.GetSelectedItem(model.get("ItemCode"), model.get("UnitMeasureCode"), model.get("LineNum"));
      this.item.set({
        SalesTaxAmountRate: model.get("SalesTaxAmountRate"),
        SalesTaxAmountRateCache: model.get("SalesTaxAmountRateCache"),
        IsOutOfStock: model.get("IsOutOfStock")
      });
      this.cartView.UpdateSalesTaxAmountField(this.item.get("SalesTaxAmountRate"), this.item);

      var IsStockValid = this.NotifyIfItemIsOutOfStock(this.item.attributes);

      //avoid multiple logs when Apply Discount to All items, this attribute is set in ApplyDiscountToAll method
      if (model.get("LogCurrentTransaction") == null || model.get("LogCurrentTransaction") == true) {
        if (IsStockValid == false) {
          if (!Global.ManagerValidated) {
            this.item.set({
              QuantityOrdered: Global.PreviousAssignedItemQty,
            });
            this.UpdateCartItem(this.item, 0, "QuantityOrderedUpdated", true);

            if (Global.Preference.IsAutoAdjustmentStock == false && this.item.get("IsOutOfStock") == true) {
              Global.msgTitle = "Stock Verification";
              Global.msg1 = "Item '" + this.item.get("ItemName") + "' does not have enough stock. Turn on Auto Adjustment stock on Settings to add item with no stock.";
              navigator.notification.alert(Global.msg1, null, Global.msgTitle, "OK");
            }
          }
        }
        else {
          this.OnRequestCompleted("TaxChangeSaveSuccess");
        }
      } else {
        //reset to null/false so that on the next call, it will log the changes made on the transaction
        this.item.set({
          LogCurrentTransaction: null
        }, {
          silent: true
        });
      }
    },

    TaxChangeSaveError: function(model, xhr, options) {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      model.RequestError(xhr, "Error Updating Item");
      Global.IsLoadingTransaction = false;
    },

    TaxGroupChangeSaveSuccess: function(model, response, options) {
      var self = this;
      var toBeAdded = [];
      var filtered, serialFiltered;

      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();

      var isInvoiceLoaded = (Global.TransactionType == Enum.TransactionType.UpdateInvoice && !Global.IsLoadingTransaction); //CSL-25017

      if (!Global.IsLoadingTransaction) Global.HasChanges = true;
      Global.IsLoadingTransaction = false;

      if (response.SOPDetails != null && response.SOPDetails.length > 0) {
       // //this.cartView.ResetTotal();
        this.cartCollection.reset();
        if (!Shared.IsNullOrWhiteSpace(this.isFocusOnThisModel)) {
          filtered = _.find(response.SOPDetails, function(dtls) {
            return dtls.ItemCode === self.isFocusOnThisModel.ItemCode && dtls.UnitMeasureCode === self.isFocusOnThisModel.UnitMeasureCode;
          });

          if (!Shared.IsNullOrWhiteSpace(filtered) &&
            filtered.SerializeLot != "None" &&
            (filtered.ItemType === Enum.ItemType.GiftCard && filtered.ItemType === Enum.ItemType.GiftCertificate) &&
            (!Shared.IsNullOrWhiteSpace(this.serializeLotCollection) && this.serializeLotCollection.length > 0)) {

            serialFiltered = this.serializeLotCollection.find(function(serial) {
              return serial.get("ItemCode") === filtered.ItemCode && serial.get("LineNum") === filtered.LineNum && serial.get("UnitMeasureCode") === filtered.UnitMeasureCode;
            });
          }
        }

        for (var i = 0; i < response.SOPDetails.length; i++) {
         // //toBeAdded.push(response.SOPDetails[i]);
         this.cartCollection.add(response.SOPDetails[i]);
          if (Shared.IsNullOrWhiteSpace(filtered)) filtered = response.SOPDetails[i];

          if (response.SOPDetails[i].IsPromoItem == true){
              var promoitemcollection = new BaseCollection(response.CustomerPromotionDetails[0]);
              this.cartView.trigger('updatePromoDisplay', promoitemcollection, response.SOPDetails[i].QuantityOrdered);
          }

        }

        if (!this.isNoCouponAtFirst && !model.isAcceptCoupon) {
          if (this.IsRequireRecalculateCoupon()) {
            if (Global.TransactionType === Enum.TransactionType.ConvertOrder) {
              if (filtered.ItemType === Enum.ItemType.GiftCard || filtered.ItemType === Enum.ItemType.GiftCertificate) {
                if (Shared.IsNullOrWhiteSpace(serialFiltered)) {
                  if (filtered.AutoGenerate) var isHidden = true;
                  else var isHidden = false;
                } else {
                  var isHidden = false;
                }

                this.ProcessAutoandManualGC(response.SOPDetails, isHidden);
              } else {
                this.ProcessGC(response, filtered);
              }

            } else if (Global.TransactionType != Enum.TransactionType.UpdateInvoice || isInvoiceLoaded) {
              this.ProcessGC(response, filtered);
            }
          }
        }

        if (this.cartView) this.cartView.ReloadModel();
        this.isFocusOnThisMOdel = null;
        //this.LoadItemsToCart(response.SOPDetails);
      }

      //Refresh Payment
      if (this.paymentCollection) { //jjxyxy
        this.ReloadPayments(this.paymentCollection.models);
      }

      this.OnRequestCompleted("TaxGroupChangeSaveSuccess");
      if (Global.AllowToFetchPotentialDiscount) this.CheckPotentialDiscount(false, true, Global.LatestPaymentDate)
    },

    TaxGroupChangeSaveError: function(model, xhr, options) {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      model.RequestError(xhr, "Error Updating Items");
    },

    ProcessGC: function(response, filtered) {
      var itemProcessed = response.SOPDetails[i];
      if (!Shared.IsNullOrWhiteSpace(filtered)) itemProcessed = filtered;

      itemProcessed.QuantityShipped = itemProcessed.QuantityOrdered;

      this.ValidateSerializeLot(response.SOPDetails[i].SerializeLot,
        itemProcessed.ItemCode,
        this.GetItemDisplayName(new BaseModel(itemProcessed)), (itemProcessed.LineNum) ? itemProcessed.LineNum : this.GetLineNum(),
        itemProcessed.ItemType,
        itemProcessed.UnitMeasureCode,
        "",
        itemProcessed);

    },

    ChangeItemTax: function(item) {
      this.RemoveTermDiscountPayment();
      var _cartItem = this.ConvertToSaleItem(item);
      _cartItem.on('sync', this.TaxChangeSaveSuccess, this);
      _cartItem.on('error', this.TaxChangeSaveError, this);

      _cartItem.url = Global.ServiceUrl + Service.SOP + Method.SALEITEMTAX;
      _cartItem.save();
    },

    ChangeItemGroupTax: function(items, isAcceptCoupon) {
      var cartItems = new BaseModel,
        item = [];
       
      for (var i = 0; i < items.length; i++) {
        item[i] = this.ConvertToSaleItem(items.at(i));
      }

      items.reset(item);

      cartItems.set({
        SOPDetails: items,
        DiscountType: Global.ShipTo.DiscountType,
        DiscountPercent: Global.ShipTo.DiscountPercent,
	    	SalesOrderCode: Global.TransactionCode,
        SessionID: Global.GUID,
        TransactionType: Global.TransactionType,
        IsUsePOSShippingMethod:Global.Preference.IsUsePOSShippingMethod,
        POSShippingMethod:Global.Preference.POSShippingMethod
      
      });

      this.RemoveWarehouseCodeByItemType(cartItems.get("SOPDetails"));
      cartItems.isAcceptCoupon = isAcceptCoupon;
      cartItems.on('sync', this.TaxGroupChangeSaveSuccess, this);
      cartItems.on('error', this.TaxGroupChangeSaveError, this);

      cartItems.url = Global.ServiceUrl + Service.SOP + Method.SALEITEMGROUPTAX;
      cartItems.save();

/*	  this.cartCollection.each(function(details){
			 if(details.get('PromoDocumentCode') == '' || details.get('PromoDocumentCode') == undefined){
			 	this.AddFreeItems(details,true);
			 }
		 }.bind(this));*/
    },

    ConvertToSaleItem: function(item) {
      var saleItem = item.clone(); //jj14x
      saleItem.set({
        CustomerCode: Global.CurrentCustomer.CustomerCode,
        IsTaxByLocation: Global.Preference.TaxByLocation,
        ShipToCode: Global.ShipTo.ShipToCode,
        ExtPriceRate: item.get("ExtPriceRate"),
        DiscountType: Global.ShipTo.DiscountType,
        DiscountPercent: Global.ShipTo.DiscountPercent,
        DiscountableDays: Global.ShipTo.DiscountableDays,
        IsUsePOSShippingMethod: Global.Preference.IsUsePOSShippingMethod,
        POSShippingMethod: Global.Preference.POSShippingMethod
      })
      var tempCollection = new BaseCollection();
      tempCollection.reset(Global.InvoiceDetailsResponse);
      if (Global.TransactionType == Enum.TransactionType.SalesRefund) {
        if (tempCollection.length > 0) {
          tempCollection.each(function(model) {
            if (model.get("ItemCode") == saleItem.get("ItemCode")) {
              saleItem.TaxCode = model.get("TaxCode")
            }
          });
        }
      }
      return saleItem;
    },

    GetUpdatedItemQuantity: function(item, qtyAdded) {
      var _qty = 0,
        _outstanding = 0;

      switch (Global.TransactionType) {
        case Enum.TransactionType.Return:
        case Enum.TransactionType.SalesRefund:
          _qty = parseInt(item.get("Good")); //Originally Defective
          //Do not allow negative quantities for Refund
          if (_qty === 0 && qtyAdded === -1) {
            return;
          }
          _outstanding = item.get("Outstanding");
          break;
        default:
          _qty = parseInt(item.get("QuantityOrdered"));
          //Do not allow zero (0) quantity but allow negative quantities

          // if(!Shared.IsNullOrWhiteSpace(Global.AdjustedQtyItemCollection)){
          // var _isPhasedOutItem = Global.AdjustedQtyItemCollection.find(function(model){
          // return item.get("ItemCode") == item.get("ItemCode") && item.get("UnitMeasureCode") == model.get("UnitMeasureCode");
          // });
          // }

          if (((_qty === 1 && qtyAdded === -1) || (_qty === -1 && qtyAdded === 1)) && !item.get("Status") == "P") {
            _qty = 0;
          }

          break;
      }

      if (qtyAdded) {
        _qty = _qty + qtyAdded;
      }

      //CSL - 12638 : 09.04.2013
      if (Global.TransactionType == Enum.TransactionType.SalesRefund && Global.TransactionType == Enum.TransactionType.Return && !item.get("IsNewLine")) {
        if (_qty > _outstanding) {
          console.log("Quantity must be less than Outstanding.");
          navigator.notification.alert("Quantity must be less than or equal to the Outstanding quantity.", null, "Action Not Allowed", "OK");
          return null;
        } else if (item.get("ItemType") == Enum.ItemType.GiftCard || item.get("ItemType") == Enum.ItemType.GiftCertificate) {
          var _numOfActivatedGCard = item.get("NumOfActivatedGCard");
          var _remaining = 0;
          if (_numOfActivatedGCard > 0) {
            _remaining = (_outstanding - _numOfActivatedGCard) - _qty;
            if (_remaining < 0) {
              navigator.notification.alert("Returning an activated gift card/certificate is not allowed.", null, "Action Not Allowed", "OK");
              return null;
            }
          }
        }
      }

      return _qty;
    },

    IsHoldSVG: function() {
      if (!Global.SVG_Hold) return false;
      if (Global.SVG_Hold.length == 0) return false;
      if (this.SVGHasError()) return true;

      var _hold = false;
      for (var i = 0; i < Global.SVG_Hold.length; i++) {
        if (Global.SVG_Hold[i].length > 0) return true;
      }

      Global.SVG_Hold = new Array();
      return _hold;
    },

    SVGHasError: function() {
      if (!Global.SVG_Hold) return false;
      if (Global.SVG_Hold.length == 0) return false;

      var _err = false;
      for (var i = 0; i < Global.SVG_Hold.length; i++) {
        if (Global.SVG_Hold[i] == "ERROR") {
          this.LockTransactionScreen(false, "Saving...");
          return true;
        }
      }
      return _err;
    },

    ValidateSVG: function(_svg, ExecThis) {
      if (!_svg) return _svg;
      //Generate ID
      var tmpId = "[SVGID]:" + Math.random() + '-' + Math.random(),
        tmpLimit = 8000,
        doesExist = false;

      if (!Global.SVGArray) Global.SVGArray = new Array();

      if (_svg.indexOf("[SVGID]:") !== -1) {
        for (var i = 0; i < Global.SVGArray.length; i++) {
          if (Global.SVGArray[i].ID == _svg) {
            _svg = Global.SVGArray[i].SVG;
            doesExist = true;
          }
        }

        if (!doesExist) Global.SVGArray[Global.SVGArray.length] = {
          ID: _svg,
          SVG: _svg
        }
      } else {
        Global.SVGArray[Global.SVGArray.length] = {
          ID: tmpId,
          SVG: _svg
        };
      }

      if (_svg.length <= tmpLimit) return _svg;
      var tmpCount = 0,
        tmpPart = 0,
        tmpArray = new Array();

      for (var resume = true; resume;) {
        tmpCount += 1;
        tmpPart += 1;

        var tmpContent = _svg.substr((tmpPart - 1) * tmpLimit, tmpLimit);
        if (_svg.substr(tmpPart * tmpLimit).length == 0) resume = false;

        var tmpModel = {
          Part: tmpPart,
          SVG: tmpContent
        };

        tmpArray[tmpArray.length] = tmpModel;
      }

      var svgArray = new Array();
      for (var i = 0; i < tmpArray.length; i++) {
        var svgModel = new SignatureModel();
        svgModel.set({
          "SignatureID": tmpId,
          "PartNumber": tmpArray[i].Part,
          "PartCount": tmpCount,
          "SignatureSVG": tmpArray[i].SVG
        });

        svgModel.url = Global.ServiceUrl + Service.POS + Method.UPDATESIGNATURE;
        var _holdNum = Global.SVG_Hold.length;
        Global.SVG_Hold[_holdNum] = tmpId + "OF" + tmpArray[i].Part;
        svgArray[svgArray.length] = svgModel;
      }

      this.SaveSVG(svgArray, 1, ExecThis);
      console.log("SVG Validated");
      return tmpId;
    },


    SaveSVG: function(svgArray, partNum, ExecThis) {
      if (svgArray.length == 0) return;
      if (partNum > svgArray[0].get('PartCount')) return;

      var _self = this;
      var _svgArray = svgArray;
      var _partNum = partNum;
      var _partCount = svgArray[0].get('PartCount');

      for (var i = 0; i < svgArray.length; i++) {

        var svgModel = svgArray[i];

        if (svgModel.get('PartNumber') == partNum && !this.SVGHasError()) {

          svgModel.save(svgModel, {
            success: function(model, response) {
              if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
              if (response.Value) {
                console.log("SVG Part Number: " + _partNum + " of " + model.get('SignatureID') + " Saved!");

                for (var i = 0; i < Global.SVG_Hold.length; i++) {
                  if (Global.SVG_Hold[i] == model.get('SignatureID') + "OF" + model.get('PartNumber')) Global.SVG_Hold[i] = "";
                }
                ExecThis();

                _self.SaveSVG(_svgArray, (_partNum + 1), ExecThis);
              }
            },
            error: function(model, error, response) {
              if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
              for (var i = 0; i < Global.SVG_Hold.length; i++) {
                if (Global.SVG_Hold[i] == model.get('SignatureID') + "OF" + model.get('PartNumber')) Global.SVG_Hold[i] = "ERROR";
              }
              ExecThis();
              console.log("SVG Part Number: " + _partNum + " of " + model.get('SignatureID') + " Error!")
              navigator.notification.alert("An error was encoutered while trying to save signatures.", null, "Error Saving Signature", "OK");
            }
          });
        }
      }
    },

    AssignCurrency: function(response) {
      Global.CurrencySymbol = response.Symbol;
      Global.CurrencyDecimalSeparator = response.CurrencyDecimalSeparator;
      Global.CurrencyGroupSeparator = response.CurrencyGroupSeparator;
      Global.CurrencyDecimalDigits = response.CurrencyDecimalDigits;
      Global.CurrencyGroupSizes = response.CurrencyGroupSizes;
    },

    SetImageLocation: function(preference) {
      //var _webUrl 		 = preference.WebSiteURL;
      //var _imgSize 		 = this.AssignImageSize(preference.ISEImageSize);
      Global.ISEImageSize = this.AssignImageSize(preference.ISEImageSize);
      Global.IsUseISEImage = preference.IsUseISEImage;
      Global.WebSiteURL = this.ValidateURL(preference.WebSiteURL);
      Global.WebSiteCode = preference.WebSiteCode;
      console.log(Global.WebSiteURL + '/' + Method.ISEIMAGES + Global.ISEImageSize);
      //console.log(Global.ImageLocation + '' + Global.IsUseISEImage + ' ' + Global.WebSiteURL);
    },

    ValidateURL: function(url) {
      var _value = url;
      if (url.charAt(url.length - 1) !== '/') {
        return _value = url;
      } else {
        _value = url.slice(0, -1);
        return _value;
      }
    },

    AssignImageSize: function(_imgSize) {
      var value;
      switch (_imgSize) {
        case 0:
          value = "medium/";
          break;
        case 1:
          value = "large/";
          break;
        case 2:
          value = "icon/";
          break;
        case 3:
          value = "minicart/";
          break;
        case 4:
          value = "mobile/";
          break;
      }
      return value;
    },

    //Checks cart items location. | CSL-5801 : 4.19.13
    ValidateDefaultLocation: function(collection) {
      Global.Preferences.Warehouses = collection;
      var _location = Global.Preference.DefaultLocation;
      var _locationArray = _.pluck(collection, "WarehouseCode"); //returns array list of warehouse gathered.
      var _validLocation = _.contains(_locationArray, _location); //checks the array contains the default location.
      if (!_validLocation) {
        //this.NotifyMsg("The Current Status of the Default Location is Inactive.", "Unable to add Item" );
        Global.ValidLocation = false;
      } else {
        Global.ValidLocation = true;
      }
    },

    NotifyMsg: function(content, header, usePopUp, duration) {
      console.log(content);
      if (duration) Shared.ShowNotification("The coupon is not applied because items does not meet the coupon's requirements. Please check the coupon setup in Connected Business for more details.", true, duration, true);
      else navigator.notification.alert(content, null, header, "OK", usePopUp);
    },

    OnRequestCompleted: function(requestType) {
      switch (requestType) {
        case Method.SALEITEMPRICETAX:
        case Method.SALEITEMPRICETAXBYUPC:
        case Method.SALEKITITEMTAX:
        case Method.SALEBUNDLEGROUPTAX:
        case "VoidItem":
          if (this.couponModel)
            if (!this.IsReturn() && this.couponModel.get("DiscountType") != "Amount") this.validateCouponRequirement();
        case "TaxChangeSaveSuccess":
        case "TaxGroupChangeSaveSuccess":
        case "UpdateRecalculatedItemsCompleted":
        case "LoadInvoiceCompleted":
        case "LoadOrderCompleted":
        case "PaymentAdded":
        case "PaymentRemoved":
        case "ClearTransaction":
        case "SignatureRetrieved":
        case "PINRetrieved":
        case "SaveNotes":
        case "EditKitDetails":
          Global.AskPIN = false;
          Global.AskSignature = false;
          this.LogCurrentTransaction(requestType);
          break;
        case "AskForPIN":
          Global.AskPIN = true;
          Global.AskSignature = false;
          this.LogCurrentTransaction(requestType);
          break;
        case "AskForSignature":
          Global.AskSignature = true;
          Global.AskPIN = false;
          this.LogCurrentTransaction(requestType);
          break;

      }
    },

    validateCouponRequirement: function() {
      if (this.cartCollection.length == 0) return;
      if (Global.TransactionType != Enum.TransactionType.SalesRefund) {
        if (this.couponModel) {
          if (this.GetCouponID() || (this.couponModel.get("CouponComputation") == "Stackable" && this.couponModel.get("DiscountType") == "Amount")) {
            var item;
            if (this.couponModel.get("CouponType") == "Orders") item = this.cartCollection.find(function(model) {
              return model.get("CouponCode");
            });
            else if (this.couponModel.get("IncludeAllProduct") == false) item = this.cartCollection.find(function(model) {
              return model.get("IsIncludedInCoupon") == true;
            });
            else item = this.cartCollection.find(function(model) {
              return model.get("CouponCode");
            });

            if (!item) {
              this.NotifyMsg("The coupon is not applied because items does not meet the coupon's requirements. Please check the coupon setup in Connected Business for more details. ", "", false, 5000);
              this.VoidCoupon(false);
            }
          }
        }
      }
    },

    LogCurrentTransaction: function(requestType) {
      var sopGroup = new BaseModel({
          WorkstationID: Global.POSWorkstationID
        }),
        transactionCode = Global.TransactionCode,
        type = Global.TransactionType,
        total = this.GetTransactionSubTotal(),
        taxRate = this.summaryModel.get("TaxDisplay"),
        payment = this.summaryModel.get("Payment"),
        balanceRate = this.summaryModel.get("Balance"),
        totalQuantity = this.summaryModel.get("Qty"),
        askSign = (!Shared.IsNullOrWhiteSpace(Global.AskSignature)) ? Global.AskSignature : false,
        askPIN = (!Shared.IsNullOrWhiteSpace(Global.AskPIN)) ? Global.AskPIN : false,
        toTaltax = format("0.0000", this.summaryModel.get("TotalTax")),
        sop = new BaseModel({
          TransactionCode: transactionCode,
          Type: type,
          Total: total,
          TaxRate: taxRate,
          Payment: payment,
          BalanceRate: balanceRate,
          TotalQuantity: totalQuantity,
          AskSignature: askSign,
          AskPIN: askPIN,
          PINType: Global.PINType
        });

      if (this.cartCollection && this.cartCollection.length > 0) {


        if (Global.TransactionType == Enum.TransactionType.SalesRefund) balanceRate = total + (this.RoundNumber(toTaltax, 2) * 1);

        var sopDetails = new BaseCollection(),
          sopKitDetails = new BaseCollection(),
          sopPreference = new BaseCollection(Global.Preference);
        this.cartCollection.each(function(model) {
          var itemName = (Global.Preference.IsUseItemDescription) ? model.get('ItemDescription') : model.get('ItemName'),
            couponAmount = Shared.IsNullOrWhiteSpace(model.get('CouponDiscountAmount')) ? 0 : model.get("CouponDiscountAmount"),
            couponCode = (couponAmount != 0) ? model.get('CouponCode') : "",
            couponRate = (model.get("QuantityDisplay") == 0) ? 0 : couponAmount,
            itemCode = model.get('ItemCode'),
            lineNum = model.get('LineNum'),
            unitMeasureCode = model.get('UnitMeasureCode'),
            couponDiscountType = model.get('CouponDiscountType'),
            discountAmountRate = Shared.IsNullOrWhiteSpace(model.get('Discount')) ? 0 : model.get('Discount'),
            salesPriceRate = Shared.IsNullOrWhiteSpace(model.get('SalesPriceRate')) ? 0 : model.get('SalesPriceRate'),
            quantityOrdered = Shared.IsNullOrWhiteSpace(model.get('QuantityDisplay')) ? 0 : model.get('QuantityDisplay'),
            salesTaxAmountRate = Shared.IsNullOrWhiteSpace(model.get('SalesTaxAmountRate')) ? 0 : model.get('SalesTaxAmountRate'),
            extPriceRate = Shared.IsNullOrWhiteSpace(model.get('ExtPriceRate')) ? 0 : model.get('ExtPriceRate'),
            item = JSON.parse(window.sessionStorage.getItem('kitItems-' + lineNum)),
            itemType = model.get('ItemType');

          sopDetails.add({
            ItemCode: itemCode,
            LineNum: lineNum,
            ItemName: itemName,
            UnitMeasureCode: unitMeasureCode,
            CouponCode: couponCode,
            CouponDiscountRate: couponRate,
            CouponDiscountType: couponDiscountType,
            DiscountAmountRate: discountAmountRate,
            SalesPriceRate: salesPriceRate,
            QuantityOrdered: quantityOrdered,
            SalesTaxAmountRate: salesTaxAmountRate,
            ExtPriceRate: extPriceRate,
            ItemType: itemType
          });

          var sumSalesPrice = sopDetails.reduce(function(memo, num) {
            return memo + (num.get("SalesPriceRate") * num.get("QuantityOrdered"));
          }, 0),
          sumExtSalesPrice = sopDetails.reduce(function(memo, num) {
            return memo + num.get("ExtPriceRate");
          }, 0),
          _hasDiscount = sopDetails.find(function(model) {
            return model.get("DiscountAmountRate") > 0;
          });
          if(!_hasDiscount){
            _hasDiscount = sopDetails.find(function(model) {
              return model.get("CouponDiscountRate") > 0;
            });
          };

          _totalDiscount = (sumSalesPrice != sop.get("Total") && _hasDiscount) ? sumSalesPrice - sop.get("Total") : 0;

          sop.set("TotalDiscount", _totalDiscount);

          if (item) sopKitDetails.add(item);
        });
      }

      sopGroup.set({
        SOP: sop,
        SOPDetails: sopDetails,
        SOPKitDetails: sopKitDetails,
        Preferences: sopPreference
      });

      this.LogCurrentTransactionSignalR(sopGroup, requestType);
    },

    LogCurrentTransactionSignalR: function(sopGroup, type) {
     if ( this.signalRConnection == null) this.StartSignalR();
      this.secondaryHubProxy.invoke('logCurrentTransaction', sopGroup.toJSON(), this.signalRConnectionID, Global.POSWorkstationID).done(function(response) {}.bind(this)).fail(function(response) {
        //navigator.notification.alert(response, null, 'Error', 'OK');
      });
    },

    LeavePOSView: function() {
      this.performAction = true;
      this.VoidTransactionWithValidation();
    },

    PerformAction: function() {
      if (this.performAction) {
        this.performAction = false;
        this.actionsView.SetHasOpenTransaction(this.HasOpenTransaction());
        this.actionsView.CheckTransaction();
      }
    },

    ProcessPublicNoteForm: function(type) {
      var model = "",
        collection = "",
        maintenance = "";
      if ((this.transactionCollection != undefined || this.transactionCollection != null) && this.transactionCollection.length > 0) {
        collection = new BaseCollection(this.transactionCollection.at(0).get("SalesOrders"));
        model = collection.at(0);
        maintenance = Global.MaintenanceType.UPDATE;
      } else {
        maintenance = Global.MaintenanceType.CREATE;
      }

      this.ShowOrderNotesForm(type, model, maintenance);
    },

    ShowOrderNotesForm: function(type, model, maintenanceType) {
      $("#main-transaction-blockoverlay").show();
      $("#orderNotesContainer").append("<div id='orderNotes'></div>");
      var notesControlView = new NotesControlView({
        el: $("#orderNotes"),
        type: type,
        note: Global.PublicNote,
        model: model,
        maintenanceType: maintenanceType
      });

      notesControlView.on('orderNotesSaved', this.ProcessSavedNotes, this);
      notesControlView.on('customerNotesSaved', this.ProcessCustomerSavedNotes, this);
    },

    ProcessSavedNotes: function(data, type, model, view) {
      switch (type) {
        case Global.NoteType.LineItem:
          Global.HasChanges = true;
          if (model) model.set({
            ItemDescription: data
          });
          if (this.cartView) this.cartView.ReloadModel();
          break;
        case Global.NoteType.OrderNotes:
          Global.HasChanges = true;
          Global.PublicNote.PublicNotes = data;
          console.log("Retrieved: " + Global.PublicNote.PublicNotes);
          break;
      }
      this.OnRequestCompleted("SaveNotes");
      view.CloseOrderNotes();
    },

    ProcessCustomerSavedNotes: function(data, type, model, view) {
      var serverUrl = "";

      switch (type) {
        case Global.MaintenanceType.CREATE:
          serverUrl = Global.ServiceUrl + Service.CUSTOMER + Method.ADDCUSTOMERNOTE;
          break;
        case Global.MaintenanceType.UPDATE:
          serverUrl = Global.ServiceUrl + Service.CUSTOMER + Method.UPDATECUSTOMERNOTE;
          break;
        case Global.MaintenanceType.DELETE:
          serverUrl = Global.ServiceUrl + Service.CUSTOMER + Method.DELETECUSTOMERNOTE;
          break;
      }

      this.ProcessAddCustomerNote(data.EntityCode, data.ContactCode, data.Title, data.NoteText, data.NoteCode, serverUrl, type);
      view.CloseOrderNotes();
    },

    ProcessAddCustomerNote: function(entityCode, contactCode, title, noteText, noteCode, serverUrl, type) {
      var model = new BaseModel(),
        self = this;

      model.set({
        EntityCode: entityCode,
        NoteText: noteText,
        Title: title,
        NoteCode: noteCode,
        ContactCode: contactCode,
        UserCreated: Global.Username,
        UserModified: Global.Username
      });

      model.url = serverUrl;
      model.save(model, {
        success: function(model, response, options) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          if (self.headerinfo) self.headerinfo.ReloadNote();
        },
        error: function(model, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
        }
      });
    },

    ProcessNoteRemoval: function(type, note, maintenance) {
      if (maintenance != Global.MaintenanceType.DELETE) return;
      var model = new BaseModel(),
        self = this;

      model.set({
        EntityCode: note.get("EntityCode"),
        NoteText: note.get("NoteText"),
        Title: note.get("Title"),
        NoteCode: note.get("NoteCode"),
        ContactCode: note.get("ContactCode")
      });

      model.url = Global.ServiceUrl + Service.CUSTOMER + Method.DELETECUSTOMERNOTE;
      model.save(model, {
        success: function(model, response, options) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          if (self.headerinfo) self.headerinfo.ReloadNote();
        },
        error: function(model, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
        }
      });
    },

    GetItemDisplayName: function(model) {
      var _itemName = "";
      if (Global.Preference.IsUseItemDescription) _itemName = model.get("ItemDescription");
      else _itemName = model.get("ItemName");
      return _itemName;
    },
    /** RECHARGE GIFTCARD PROCESS */
    ShowGiftCardRecharge: function(e) {
      e.stopPropagation();
      $("#main-transaction-blockoverlay").show();
      Shared.BlurItemScan();
      if (!this.giftCardView) this.InitializeGiftCardView();

      if (this.cartCollection.length > 0) this.giftCardView.hasItemOnCart = true;
      else this.giftCardView.hasItemOnCart = false;
      this.giftCardView.viewType = "POS";
      this.giftCardView.IsActivated = false;
      this.giftCardView.InitializeGiftCardModel();
      this.giftCardView.ShowGCardRechargeForm();
    },

    InitializeGiftCardView: function() {
      this.giftCardView = new GiftCardView({
        el: $("#giftCardContainer")
      });
      this.giftCardView.validateLocationBankAccount = function() {
        return this.ValidateLocationBankAccount();
      }.bind(this);
      this.giftCardView.on('proceedToRecharge', this.FindGiftCardDetail, this);
      this.giftCardView.on('askToEnterPIN', this.FetchGiftDetails, this);
      this.giftCardView.on('stopAskingPIN', this.StopPINRetrieval, this);
    },

    FindGiftCardDetail: function(model) {
      Global.OnRechargeProcess = true;
      Global.GCardAttributes = model.attributes;
      this.ProcessChangeCustomer();
    },

    ProcessChangeCustomer: function() {
      if (!this.headerinfo) this.InitializeMainTransactionHeader();
      var custCode = Global.GCardAttributes.CustomerCode
      this.headerinfo.InitializeCustomer(1, custCode, "", true);
    },

    ProcessItemLookup: function() {
      var _itemCode = Global.GCardAttributes.ItemCode;
      var _umCode = Global.GCardAttributes.UnitMeasureCode;
      this.GetLookupItems(1, _umCode, _itemCode);
    },

    ConitinueRechargeGiftCard: function(item) {
      this.tmpModel = new BaseModel();
      this.tmpModel.set(item[0]);
      this.tmpModel.set({
        Price: Global.GCardAttributes.SalesPriceRate
      })
      this.AddToCart(this.tmpModel);
    },

    AssignExistingSerial: function(type, itemCode, itemName, lineNum, itemType, uom) {
      this.InitializeSerializeLotCollection();
      var giftcard = Global.GCardAttributes;
      var toBeAdded = {
        SerialLotNumber: giftcard.SerialLotNumber,
        ItemCode: giftcard.ItemCode,
        LineNum: lineNum,
        ItemType: giftcard.ItemType,
        SerialLotCode: 1,
        SerialLotType: type,
        UnitMeasureCode: uom,
        IsIncluded: true,
        IsRecharged: true,
      };

      this.serializeLotCollection.reset();
      this.serializeLotCollection.add(toBeAdded);
      this.giftCardView.Hide();
    },

    CompleteRechargeAction: function() {
      if (Global.OnRechargeProcess) this.AddSuspend();
    },
    /** RECHARGE GIFTCARD PROCESS **/

    /** CSL-15316 : 09.20.13 **/
    FetchGiftDetails: function(pinType, view) {
      view.viewType = "POS"
      Global.PINType = pinType;
      this.OnRequestCompleted("AskForPIN");
    },

    StopPINRetrieval: function() {
      this.OnRequestCompleted("PINRetrieved");
      this.StopFetchingPIN();
    },

    BeginFetchingPIN: function() {
      var self = this;
      if (this.giftPINTimeInterval) this.StopFetchingPIN();
      this.giftPINTimeInterval = window.setInterval(function() {
        self.FetchPINDetail()
      }, 250);
    },

    StopFetchingPIN: function() {
      window.clearInterval(this.giftPINTimeInterval);
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
    },

    FetchPINDetail: function() {
      var mdl = new BaseModel();
      mdl.url = Global.ServiceUrl + Service.POS + Method.CURRENTPIN;
      mdl.set({
        WorkstationID: Global.POSWorkstationID
      });
      var self = this;
      mdl.save(null, {
        success: function(model, response, options) {
          //if(!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          if (!response) return;
          if (response.ErrorMessage) {
            self.NotifyMsg(response.ErrorMessage, null, "Error Fetching PIN");
            self.StopFetchingPIN();
          } else if (response.PINDetail) {
            Global.AskPIN = false;
            self.StopFetchingPIN();
            self.ValidatePINFetched(response.PINDetail);
            self.OnRequestCompleted("PINRetrieved");
          }
        },
        error: function(model, error, response) {
          //if(!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          self.StopFetchingPIN();
          self.OnRequestCompleted("PINRetrieved");
        }
      });
    },

    DecryptPIN: function(str) {
      if (!str) return str
      return Base64.decode(str);
    },

    ValidatePINFetched: function(pin) {
      var _decyptedPIN = this.DecryptPIN(pin)
      Global.PIN = _decyptedPIN;
      var _viewRecipient = null
      switch (Global.ViewRecipient) {
        case "Recharge":
          _viewRecipient = this.giftCardView;
          break;
        case "Payment":
          _viewRecipient = this.paymentView;
          break;
        default:
          console.log("no view recepient");
      }
      if (_viewRecipient) _viewRecipient.PopulatePINFields(_decyptedPIN);
      //this.giftCardView.trigger("processPINCaptured")
    },

    /** End : CSL-15316 **/

    FocusToItemScan: function(e) {
      if (!Global.isBrowserMode) return;

      if (!e) {
        if (!Global.IsOnItemDetail) Shared.FocusToItemScan();
        return;
      }

      e.preventDefault();
      if (this.DoFocusItemScan(e)) Shared.FocusToItemScan();
    },

    DoFocusItemScan: function(e) {
      var _elemID = e.target.id;
      //checks if the tapped element type is a textbox, combobox, or textarea
      var _ctlType = ['select', 'input', 'textarea'];
      var _isInputCTRL = false;

      for (var i = 0; i < _ctlType.length; i++) {
        var _tmpVal = $('#' + _elemID).is(_ctlType[i]);
        if (_tmpVal) _isInputCTRL = _tmpVal;
      }
      //end of element type checking..

      if (Global.IsOnItemDetail) {
        //if ItemDetail is still loaded..
      } else if (_isInputCTRL) {
        //if element tapped is an input control..
      } else if (_elemID == 'quantityDisplay' || _elemID == 'itemPriceDisplay' || _elemID == 'discountDisplay') {
        //for quick input in cart.
      } else {
        return true;
      }

      return false;
    },

    UpdateLoggedReasons: function(response) {
      if (!response || !Global.LoggedReasons) return;
      if (Global.LoggedReasons.length == 0) return;

      var transactionCode;
      var isReturn = false;
      var hasError = false;
      switch (Global.TransactionType) {
        case Enum.TransactionType.Sale:
        case Enum.TransactionType.Suspend:
          if (!response.Invoices) return;
          if (response.Invoices.length == 0) return;
          transactionCode = response.Invoices[0].InvoiceCode;
          break;
        case Enum.TransactionType.Order:
        case Enum.TransactionType.Quote:
          if (!response.SalesOrders) return;
          if (response.SalesOrders.length == 0) return;
          transactionCode = response.SalesOrders[0].SalesOrderCode;
          break;
        case Enum.TransactionType.SalesRefund:
          var hasTransCode = true;
          if (!response.TransactionCode) hasTransCode = false;

          isReturn = true;

          if (!hasTransCode) {
            if (response.ErrorMessage)
              if (response.ErrorMessage != '') {
                hasTransCode = true;
                hasError = true;
                transactionCode = Global.TransactionCode;
                break;
              }

            if (response.Invoices)
              if (response.Invoices.length > 0)
                if (response.Invoices[0].InvoiceCode) {
                  hasTransCode = true;
                  transactionCode = response.Invoices[0].InvoiceCode;
                }
            if (!hasTransCode) return;
          } else {
            transactionCode = response.TransactionCode;
          }

          break;
      }
      if (!transactionCode) return;

      var hasNoTransactionCode = false;
      Global.LoggedReasons.each(function(model) {
        if (isReturn) model.set({
          TransactionCode: transactionCode,
          TransactionType: Global.TransactionType + (hasError ? ' (Failed)' : '')
        });
        if (hasNoTransactionCode || isReturn) return;
        if (!model.get('TransactionCode') || model.get('TransactionCode') == '') hasNoTransactionCode = true;
      });
      if (!hasNoTransactionCode && !isReturn) return;

      var transactionType = Global.TransactionType;
      var tmpModel = new BaseModel();
      tmpModel.url = Global.ServiceUrl + Service.POS + 'updatereason/' + transactionCode + '/' + transactionType;
      tmpModel.set({
        POSReasonLogs: Global.LoggedReasons.toJSON()
      });
      tmpModel.save(tmpModel, {
        success: function() {
          console.log('Logged Reasons Updated: Success!');
        },
        error: function() {
          console.log('Logged Reasons: Failed!');
        }
      });
    },

    RemoveTermDiscountPayment: function() {
      if (!this.paymentCollection) return;
      if (this.paymentCollection.length == 0) return;
      if (Global.TransactionType == Enum.TransactionType.SalesRefund) return;
      var _termDiscountModel = this.paymentCollection.find(function(model) {
        return model.get("PaymentType") == "Term Discount";
      });

      if (_termDiscountModel) this.paymentCollection.remove(_termDiscountModel);
    },

    RemoveScreenOverLay: function() {
      Shared.POS.Overlay.Hide();
    },

    IsItemGiftCredit: function(model) {
      var itemType = model.attributes.ItemType;
      return itemType == Enum.ItemType.GiftCard || itemType == Enum.ItemType.GiftCertificate;
    },

    IsItemQuantityAllowed: function(qty) {
      if (qty >= 0) return true;
      if (this.CartHasGiftCredit() == true) {
        this.NotifyMsg('Item exchange is not allowed for transactions with Gift Cards. Please create a separate transaction.');
        return false;
      }
    },

    AllowToAddGiftCredit: function(item) {
      if (this.CartHasNegativaQty() == true) return false;
      return true;
    },

    CartHasGiftCredit: function() {
      var gifts = this.cartCollection.find(function(model) {
        return model.get("ItemType") == Enum.ItemType.GiftCard || model.get("ItemType") == Enum.ItemType.GiftCertificate;
      });
      if (!gifts) return false;
      return true;
    },

    CartHasNegativaQty: function() {
      var items = this.cartCollection.find(function(model) {
        return model.get('QuantityOrdered') < 0;
      });
      if (!items) return false;
      return true;
    },

    //SignalR, Hub
    GetFullTime: function() {
      var d = new Date();
      return d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds() + "." + d.getMilliseconds();
    },

    LogWithTime: function(msg) {
      console.log("@" + this.GetFullTime() + ' : ' + msg);
    },

    GetInProgressOverlayHtml: function() {
      return '<div id="inprogress-blockoverlay" class="blockOverlay" style="display: block;"></div>';
    },

    GetInProgressSpinHtml: function() {
      return '<div class="spin-container" id="inprogress-spinner"' +
        'style="padding:30px 15px;border-radius: 8px; background-color: #000; opacity: 0.6; margin:0 auto; position:absolute; top:45%; left:45%;"' +
        '><h5 style="color:#fff; text-align: center; position:relative; top:25px; text-shadow:none !important;">Finishing...</h5></div>';
    },

    ToggleInprogressOverlay: function() {
      var inprogressHtml = this.GetInProgressOverlayHtml(),
        //inprogressSpin = this.GetInProgressSpinHtml(),
        isMainOverlayOpen = ($("#main-transaction-blockoverlay").css('display') == "block"),
        isSpinOpen = ($("#spin").length > 0);
      ($("#inprogress-blockoverlay").length == 0) && $("#main-transaction-blockoverlay").after(inprogressHtml);
      //($("#inprogress-spinner").length == 0) && $("#main-transaction-blockoverlay").after(inprogressSpin);

      if (this.IsSavingTransactionOngoing) {
        $("#inprogress-blockoverlay").show();
        if (!isMainOverlayOpen) {
          $("#inprogress-spinner").show();
          var _target = document.getElementById('inprogress-spinner');
          if (!this.transactionSpinner) this.transactionSpinner = Spinner.newInstance();
          this.transactionSpinner.opts.color = '#fff'; //The color of the spinner
          this.transactionSpinner.opts.lines = 13; // The number of lines to draw
          this.transactionSpinner.opts.length = 7; // The length of each line
          this.transactionSpinner.opts.width = 4; // The line thickness
          this.transactionSpinner.opts.radius = 10; // The radius of the inner circle
          this.transactionSpinner.opts.top = 'auto'; // Top position relative to parent in px
          this.transactionSpinner.opts.left = 'auto';
          this.transactionSpinner.spin(_target);
          if ($("#inprogress-spinner > div").length > 0) {
            $("#inprogress-spinner > div").css('position', 'relative').css('left', '50%').css('top', '40%');
          }
        }
      } else {
        $("#inprogress-blockoverlay").hide();
        $("#inprogress-spinner").hide();
        this.transactionSpinner && this.transactionSpinner.stop();
      }

      $("#inprogress-blockoverlay").css('opacity', (isMainOverlayOpen ? 0 : 0.6));
    },

    ShowTaxList: function() {
      var taxListView = new TaxListView();
      taxListView.on('changeTaxCode', function(code) {
        this.cartCollection.each(function(model) {
          model.set('TaxCode', code);
          model.set('IsModified', true);
        });

        this.ResetTermDiscount();
        this.ChangeItemGroupTax(this.cartCollection);
      }.bind(this));
      this.$el.find("#tax-override-list").html(taxListView.render().el);
      this.$("#tax-override-list").find("#taxListContainer").listview().listview('refresh');
    },

    LoadLocationTaxCode: function() {
      var model = new BaseModel();

      model.url = Global.ServiceUrl + Service.SOP + Method.GETLOCATIONTAXCODE + Global.LocationCode + '/' + Global.CustomerCode;
      model.fetch({
        success: function(model, response, options) {
          //console.log(response);
          window.sessionStorage.setItem('selected_taxcode', response.Value);
        }.bind(this),
        error: function(model, xhr, options) {
          console.log(xhr);
        }.bind(this)
      });
    },

    ShowBundleConfigurator: function(model) {
      var bundleConfiguratorView = new BundleConfiguratorView({
        model: model
      });

      bundleConfiguratorView.on('getitems', function(response) {
        this.itemPriceCollection.reset(response);
        this.OnRequestCompleted(Method.SALEBUNDLEGROUPTAX);
        //this.ChangeItemGroupTax(response);
      }.bind(this));

      this.$el.find("#bundle-configurator-container").html(bundleConfiguratorView.render().el);
      this.$("#bundle-configurator-container").find("ul").listview().listview('refresh');
    },

    ShowKitConfigurator: function(model, isEditMode) {
      var kitConfiguratorView = new KitConfiguratorView({
        model: model,
        isEditMode: isEditMode,
        lineNum: (isEditMode) ? model.get('LineNum') : this.GetLineNum(),
        coupon: this.couponModel
      });

      kitConfiguratorView.on('getItems', this.processKitConfigurator, this);
      kitConfiguratorView.on('editItems', this.editKitConfigurator, this);

      this.$el.find("#kit-configurator-container").html(kitConfiguratorView.render().el);
      this.$("#kit-configurator-container").find("ul").listview().listview('refresh');
    },

    isShowConfigurator: true,

    processKitConfigurator: function(response, isEdit) {
      // set to false first to prevent configurator
      this.isShowConfigurator = false;

      var sale = _.first(response.SaleItems),
        itemCode = sale.ItemCode,
        unitMeasureCode = sale.UnitMeasureCode,
        isReturn = this.IsReturn(),
        item = this.cartCollection.find(function(cart) {
          return isReturn ? (cart.get('ItemCode') == itemCode && cart.get('UnitMeasureCode') == unitMeasureCode && cart.get('IsNewLine') && cart.get('ItemType') == Enum.ItemType.Kit) :
            (cart.get('ItemCode') == itemCode && cart.get('unitMeasureCode') == unitMeasureCode && cart.get('ItemType') == Enum.ItemType.Kit);
        });

      var lineNum = (item) ? item.get('LineNum') : this.GetLineNum();

      _.each(response.KitDetailSaleItems, function(kit) {
        kit.LineNum = lineNum;
      });

      window.sessionStorage.setItem('kitItems-' + lineNum, JSON.stringify(response.KitDetailSaleItems));
      window.sessionStorage.setItem('kitBundleItems-' + lineNum, JSON.stringify(response.KitBundleDetails));

      this.itemPriceCollection.reset(response.SaleItems);
      // revert to original value
      this.isShowConfigurator = true;
      this.OnRequestCompleted(Method.SALEKITITEMTAX);
    },

    editKitConfigurator: function(response) {
      this.isShowConfigurator = false;

      var sale = _.first(response.SaleItems),
        itemCode = sale.ItemCode,
        unitMeasureCode = sale.UnitMeasureCode,
        item = this.cartCollection.find(function(cart) {
          return (cart.get('ItemCode') == itemCode && cart.get('UnitMeasureCode') == unitMeasureCode && cart.get('ItemType') == Enum.ItemType.Kit);
        });

      if (item) {
        var lineNum = item.get('LineNum'),
          insertAt = (lineNum > 0) ? lineNum - 1 : lineNum;
        //this.cartCollection.remove(item);
        this.cartCollection.trigger('itemRemoved', item);

        _.each(response.KitDetailSaleItems, function(kit) {
          kit.LineNum = lineNum;
        });

        window.sessionStorage.removeItem('kitItems-' + lineNum);

        window.sessionStorage.setItem('kitItems-' + lineNum, JSON.stringify(response.KitDetailSaleItems));

        this.cartCollection.add(this.processItem(sale, lineNum), {
          at: insertAt
        });

        this.OnRequestCompleted("EditKitDetails");
      }

      Global.HasChanges = true;
      this.isShowConfigurator = true;
    },
    processItem: function(newItem, lineNum) {
      var qtyAllocated = 0;
      var extPriceRate = this.CalculateExtPrice((newItem.Quantity === 0) ? 1 : newItem.Quantity, newItem.Price, newItem.Discount, newItem.CouponDiscountType, newItem.CouponDiscountAmount, newItem.CouponComputation);

      if (newItem.OriginalQuantityAllocated) qtyAllocated = newItem.OriginalQuantityAllocated

      var _item = {
        ItemCode: newItem.ItemCode,
        ItemName: newItem.ItemName,
        ItemDescription: newItem.ItemDescription,
        QuantityOrdered: (newItem.Quantity === 0) ? 1 : newItem.Quantity,
        QuantityShipped: 1,
        SalesPriceRate: newItem.Price,
        SalesPrice: newItem.Price,
        SalesTaxAmountRate: newItem.Tax,
        UPCCode: newItem.UPCCode,
        ItemType: newItem.ItemType,
        Discount: Shared.ApplyAllowedDecimalFormat(newItem.Discount),
        LineNum: lineNum,
        WarehouseCode: newItem.WarehouseCode,
        CouponDiscountType: newItem.CouponDiscountType,
        CouponCode: newItem.CouponCode,
        CouponDiscountAmount: newItem.CouponDiscountAmount,
        CouponComputation: newItem.CouponComputation,
        IsIncludedInCoupon: newItem.IsIncludedInCoupon,
        ExtPriceRate: extPriceRate,
        UnitMeasureCode: newItem.UnitMeasureCode,
        UnitMeasureQty: newItem.UnitMeasureQty,
        SourceLineNum: 0,
        IsOutOfStock: newItem.IsOutOfStock,
        Filename: newItem.Filename,
        SerializeLot: newItem.SerializeLot,
        IsModified: true, //CSL-13446 : 8.30.13
        InvoiceCode: "[To be generated]",
        OriginalQuantityAllocated: qtyAllocated,
        Status: newItem.Status,
        FreeStock: newItem.FreeStock,
        IsNewLine: (newItem.IsNewLine) ? newItem.IsNewLine : true,
        AutoGenerate: newItem.AutoGenerate
          //SalesTaxCode : newItem.get("SalesTaxCode"),
          //Tax : newItem.get("Tax")
      };
      //var _isLoadByUpcCode = (!Shared.IsNullOrWhiteSpace(newItem.get("IsLoadedByUpc")));
      var _isLoadByUpcCode = newItem.IsLoadedByUpc,
        _isUPCNotifyStock = false;

      if (Global.TransactionType === Enum.TransactionType.Return) {
        _item.Good = _item.QuantityOrdered;
        _item.QuantityAllocated = _item.QuantityOrdered;
      }

      return _item;
    },

    StartSignalR: function () {
      var url = Global.ServiceUrl + 'signalr';

      this.signalRConnection = $.hubConnection(url, {
        useDefaultPath: false
      });

      // this.signalRConnection.logging = true;
      // this.signalRConnection.start().done(function(response) {
      //   console.log(response.message);
      //   this.signalRConnectionStarted = true;
      //   this.signalRConnectionID = response.id;
      //   this.secondaryHubProxy.invoke('joinGroup', Global.POSWorkstationID);
      //   //this.transactionHubProxy.invoke('joinGroup', Global.POSWorkstationID);
      // }.bind(this)).fail(function(response) {
      //   console.log(response.message);
      //   this.logCurrentHubStarted = false;
      // });

      this.secondaryHubProxy = this.signalRConnection.createHubProxy('secondaryDisplayHub');
      this.transactionHubProxy = this.signalRConnection.createHubProxy('transactionHub');

		//Comment this code since it just show a message that SignalR is running slow.
/*      this.signalRConnection.connectionSlow(function() {
        navigator.notification.alert('SignalR connection is running slow.', null, 'Information', 'OK');
      });*/

//      this.signalRConnection.disconnected(function() {
//        navigator.notification.alert('SignalR connection is currently disconnected', null, 'Information', 'OK');
//      });

      this.secondaryHubProxy.on('logCurrentSignature', function(response) {
        if (!response) return;
        if (!response.SOP) return;
        if (response.ErrorMessage) {
          this.NotifyMsg(response.ErrorMessage, null, "Error Fetching Signature");
        } else if (response.SOP.SignatureDetail) {
          Global.AskSignature = false;
          this.CheckSignatureFetched(response.SOP.SignatureDetail);
          this.OnRequestCompleted("SignatureRetrieved");

        }
      }.bind(this));

      this.secondaryHubProxy.on('logCurrentPIN', function(response) {
        if (!response) return;
        if (!response.SOP) return;
        if (response.ErrorMessage) {
          this.NotifyMsg(response.ErrorMessage, null, "Error Fetching PIN");
        } else if (response.SOP.PINDetail) {
          Global.AskPIN = false;
          this.ValidatePINFetched(response.SOP.PINDetail);
          this.OnRequestCompleted("PINRetrieved");
        }
      }.bind(this));

      this.transactionHubProxy.on('transactionSaved', function (response) {
        console.log(response);
        if (this.signalRConnectionStarted) {
          if (Global.OnRechargeProcess) return;
          this.LockTransactionScreen(false);

          this.PrintAndEmailTransaction(response);
        }
      }.bind(this));

      this.signalRConnection.logging = true;
      this.signalRConnection.start().done(function(response) {
        console.log(response.message);
        this.signalRConnectionStarted = true;
        this.signalRConnectionID = response.id;
        this.secondaryHubProxy.invoke('joinGroup', Global.POSWorkstationID);
        //this.transactionHubProxy.invoke('joinGroup', Global.POSWorkstationID);
      }.bind(this)).fail(function(response) {
        console.log(response.message);
        this.logCurrentHubStarted = false;
      });
    },

    StopSignalR: function () {
      if(this.signalRConnection!=null){
        this.signalRConnection.stop();
        this.signalRConnection = null;
        this.transactionHubProxy = null;
        this.secondaryHubProxy = null;
        this.signalRConnectionStarted = null;
        this.signalRConnectionID = null;
        Global.HubConnectionID = null;
    }
    }
  });

  var _clearTransaction = function(button) {
    console.log(button);
    if (button === 1) {
      _view.VoidTransactionWithValidation();
    } else {
      return;
    }
  }


  //FULLY PAID
  var _saveTransaction = function(button) {
    if (button === 1) {
      _naviThis.CreateTransaction();
    } else {
      _naviThis.RemoveScreenOverLay();
    }
  }

  return PosView;
});
