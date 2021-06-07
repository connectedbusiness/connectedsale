/**
 * Connected Business | 05-21-2012
 * Required: el, collection
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'shared/service',
  'shared/method',
  'shared/enum',
  'shared/shared',
  'model/lookupcriteria',
  'collection/transactions',
  'view/22.12.0/pos/transactions/transaction',
  'view/22.12.0/pos/transactions/options',
  'view/spinner',
  'text!template/22.12.0/pos/transactions/transactions.tpl.html',
  'text!template/22.12.0/pos/transactions/transactionlist.tpl.html',
  'js/libs/format.min.js',
  'js/libs/iscroll.js'
], function($, $$, _, Backbone, Global, Service, Method, Enum, Shared,
  LookupCriteriaModel, TransactionCollection, TransactionView, OptionsView, Spinner,
  template, transactionsTemplate) {

  var _optionVal = false;
  var TransactionsView = Backbone.View.extend({
    _template: _.template(template),
    _transactionsTemplate: _.template(transactionsTemplate),
    events: {
      "tap .right-popover-btn": "btnClose_tap",
      // "keyup #transactions-search" 		: "inputTransactionsSearch_keyUp",
      "keypress #transactions-search": "inputTransactionsSearch_keyPress",
      "tap #btnSales": "btnSales_tap",
      "tap #btnOrders": "btnOrders_tap",

      "tap #btnPicknote": "btnPickNote_tap",

      "tap #btnQuotes": "btnQuotes_tap",
      "tap #btnReturns": "btnReturns_tap",
      "tap #btnSuspend": "btnSuspended_tap",
      "blur #transactions-search": "HideClearBtn",
      "tap #transactions-searchClearBtn": "ClearText",
      //"change input:checkbox"				: "checkbox_change",
      "tap #transactions-search": "ShowClearBtn",
      "change #transaction-date": "TransactionDateOnChange",
      "blur #transaction-date": "TransactionDateOnBlur",
      "tap #btnSearch": "InitializeFetchData",
      "tap #chkOption": "OptionChange",

      "tap #picking-pending": "onPickupPending_Tap",
      "tap #picking-inprogress": "onPickupInProgress_Tap",
      "tap #picking-confirmed": "onPickupConfirmed_Tap"
    },

    initialize: function() {
      this.firstTymLoaded = true;
      //Global.LookupMode = Enum.LookupMode.Invoice;
      this.pickUpStage = this.options.pickUpStage || 0;
      this.clearDateOnLoad = this.options.clearDateOnLoad ? true : false;
      this.collection.bind("selected", this.TransactionSelected, this);
      this.render();
      this.InitializeFetchData();
      //this.RefreshScroll();
    },
    TransactionDateOnBlur: function() {
      if (!Global.isBrowserMode) {
        if ($("#transaction-date").val() == "") {
          this.FilterByDate();
        }
      }
    },
    TransactionDateOnChange: function() {
      if (!Global.isBrowserMode) {
        if ($("#transaction-date").val() != "") {
          this.FilterByDate();
        }
      } else {
        this.FilterByDate();
      }

    },

    ToggleSelectedTransaction: function() {
      $("#reviewTransactions-footer .transaction-Type").removeClass('active-transaction-type');

      switch (Global.LookupMode) {
        case Enum.LookupMode.Invoice:
          $('#btnSales').addClass('active-transaction-type');
          break;
        case Enum.LookupMode.Order:
          this.pickUpStage = this.pickUpStage || 0;
          if (this.pickUpStage == 0)
            $('#btnOrders').addClass('active-transaction-type');
          else
            $('#btnPicknote').addClass('active-transaction-type');
          break;
        case Enum.LookupMode.Quote:
          $('#btnQuotes').addClass('active-transaction-type');
          break;
        case Enum.LookupMode.Return:
          $('#btnReturns').addClass('active-transaction-type');
          break;
        case Enum.LookupMode.Suspend:
          $('#btnSuspend').addClass('active-transaction-type');
          break;
      }

    },

    render: function() {
      this.$el.html(this._template());
      if (!Global.Preference.IsTrackStorePickUp) {
        this.$el.find("#btnBuffer").show();
        this.$el.find("#btnPicknote").hide();
      }
      _optionVal = false;
      this.SetSelectedTransaction();
      this.ToggleSelectedTransaction();
      Shared.BrowserModeDatePicker("#transaction-date", "datepicker");
      this.InitializeTransactionDate();
      $("#main-transaction-blockoverlay").show();
      if (Global.isBrowserMode) $('#transactions-search').focus();
    },

    SetSelectedTransaction: function() {
      this.optionsView = null;
      switch (Global.LookupMode) {
        case Enum.LookupMode.Invoice:
          $(".btn-sales-alpha").show();
          $(".btn-orders-alpha").hide();

          $(".btn-picknote-alpha").hide();
          $(".btn-forpickup-alpha").hide();

          $(".btn-quotes-alpha").hide();
          $(".btn-returns-alpha").hide();
          $(".btn-suspend-alpha").hide();
          $("#btn-sales img").attr({
            src: 'img/sales_r@2x.png'
          });
          $(".invoices-tableheader").show();
          $(".orders-tableheader").hide();
          $(".returns-tableheader").hide();
          $(".suspend-tableheader").hide();
          break;
        case Enum.LookupMode.Order:
          $(".btn-sales-alpha").hide();
          $(".btn-picknote-alpha").hide();
          $(".btn-forpickup-alpha").hide();
          $(".btn-orders-alpha").hide();
          $(".btn-orders-alpha").show();
          $("#btn-orders img").attr({
            src: 'img/orders_r@2x.png'
          });
          $(".btn-quotes-alpha").hide();
          $(".btn-returns-alpha").hide();
          $(".btn-suspend-alpha").hide();

          $(".invoices-tableheader").hide();
          $(".orders-tableheader").show();
          $(".returns-tableheader").hide();
          $(".suspend-tableheader").hide();
          break;
        case Enum.LookupMode.Quote:
          $(".btn-sales-alpha").hide();
          $(".btn-orders-alpha").hide();

          $(".btn-picknote-alpha").hide();
          $(".btn-forpickup-alpha").hide();

          $(".btn-quotes-alpha").show();
          $(".btn-returns-alpha").hide();
          $(".btn-suspend-alpha").hide();
          $("#btn-quotes img").attr({
            src: 'img/quotes_r@2x.png'
          });
          $(".invoices-tableheader").hide();
          $(".orders-tableheader").show();
          $(".returns-tableheader").hide();
          $(".suspend-tableheader").hide();
          break;
        case Enum.LookupMode.Return:
          $(".btn-sales-alpha").hide();
          $(".btn-orders-alpha").hide();

          $(".btn-picknote-alpha").hide();
          $(".btn-forpickup-alpha").hide();

          $(".btn-quotes-alpha").hide();
          $(".btn-returns-alpha").show();
          $(".btn-suspend-alpha").hide();
          $("#btn-returns img").attr({
            src: 'img/returns_r@2x.png'
          });
          $(".invoices-tableheader").hide();
          $(".orders-tableheader").hide();
          $(".returns-tableheader").show();
          $(".suspend-tableheader").hide();
          break;
        case Enum.LookupMode.Suspend:
          $(".btn-sales-alpha").hide();
          $(".btn-orders-alpha").hide();

          $(".btn-picknote-alpha").hide();
          $(".btn-forpickup-alpha").hide();

          $(".btn-quotes-alpha").hide();
          $(".btn-returns-alpha").hide();
          $(".btn-suspend-alpha").show();
          $("#btn-suspend img").attr({
            src: 'img/suspended_r@2x.png'
          });
          $(".invoices-tableheader").hide();
          $(".orders-tableheader").hide();
          $(".returns-tableheader").hide();
          $(".suspend-tableheader").show();
          break;
      }
    },
    OptionChange: function() {
      _optionVal = Shared.CustomCheckBoxChange("#chkOption", _optionVal);
      console.log(_optionVal);
      this.InitializeFetchData();
    },
    Close: function() {
      this.Hide();
      $("#main-transaction-blockoverlay").hide();
      Shared.FocusToItemScan();
    },

    Show: function() {
      _optionVal = false;
      this.firstTymLoaded = true;
      this.render();
      this.InitializeTransactionDate();
      //	this.$("#reviewTransactions-content tbody").html("");
      this.InitializeFetchData();
      this.$el.show();
      Shared.BrowserModeDatePicker("#transaction-date", "datepicker", "", true);
      //this.RefreshScroll();
    },
    InitializeTransactionDate: function() {
      if (this.clearDateOnLoad) {
        this.$("#transaction-date").val('');
        return;
      }
      if (Global.isBrowserMode) {
        var date = new Date();
        this.$("#transaction-date").val(this.JSONtoDate(date));
      }
    },

    Hide: function() {
      this.$el.hide();
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
    JSONtoDate: function(transactionDate) {
      //var DateFormat = 'YYYY-MM-DD';
      var DateFormat = 'MM/DD/YYYY';
      var _tDate = moment(transactionDate).format(DateFormat);
      return _tDate;
    },

    InitializeFetchData: function() {
      var criteria = $("#transactions-search").val();
      var transactionDate = $("#transaction-date").val();
      if (!Shared.IsNullOrWhiteSpace(transactionDate)) {
        transactionDate = this.JsonToAspDate(transactionDate);
      }
      this.FetchData(criteria, transactionDate);
    },

    FilterByDate: function() {
      this.InitializeFetchData();
    },

    TogglePickupFilter: function(stage) {
      if (stage == 0) {
        $("#picking-filter").hide();
        return;
      }
      $("#picking-filter").show();
      $("#picking-filter span").removeClass('active-filter');
      if (stage == 1) $("#picking-filter #picking-pending").addClass('active-filter');
      if (stage == 2) $("#picking-filter #picking-inprogress").addClass('active-filter');
      if (stage == 3) $("#picking-filter #picking-confirmed").addClass('active-filter');
    },

    FetchData: function(criteria, transactionDate) {
      var _self = this;
      var _transactionLookup = new LookupCriteriaModel();
      var _rowsToSelect = "100";
      var _customerCode = "";
      var _url;
      var _filterByCustomer = _optionVal; //document.getElementById("filter-checkbox").checked;
      var datetimeTicks;
      this.isFetching = true;
      this.clearDateOnLoad = false;
      if (!criteria) criteria = "";

      if (_filterByCustomer) {
        _customerCode = Global.CustomerCode;
      }

      if (!transactionDate) {
        datetimeTicks = 0;
      } else {
        datetimeTicks = 1;
      }
      _transactionLookup.set({
        CustomerCode: _customerCode,
        CriteriaString: criteria,
        DateTimeTicks: datetimeTicks,
        IsTrackStorePickUp: Global.Preference.IsTrackStorePickUp
      });

      if (!Shared.IsNullOrWhiteSpace(transactionDate)) {
        _transactionLookup.set({
          DateFilter: transactionDate
        });
      }

      var pickUpStage = this.pickUpStage || 0;

      this.TogglePickupFilter(pickUpStage);

      if (Global.LookupMode == Enum.LookupMode.Order) {
        if (pickUpStage > 0) //if(this.isPrintPickNote || this.isReadyForPickup)
        {
          _transactionLookup.set({
            PickupStage: pickUpStage,
            WarehouseCode: Global.Preference.DefaultLocation
          });
        }
      }

      switch (Global.LookupMode) {
        case Enum.LookupMode.Invoice:
          _url = Global.ServiceUrl + Service.SOP + Method.INVOICELOOKUP + _rowsToSelect;
          Global.LookupMode = Enum.LookupMode.Invoice;
          _transactionLookup.set({
            IsPosted: true
          });
          break;
        case Enum.LookupMode.Order:
          _url = Global.ServiceUrl + Service.SOP + Method.ORDERLOOKUP + _rowsToSelect;
          Global.LookupMode = Enum.LookupMode.Order;
          break;
        case Enum.LookupMode.Quote:
          _url = Global.ServiceUrl + Service.SOP + Method.QUOTELOOKUP + _rowsToSelect;
          Global.LookupMode = Enum.LookupMode.Quote;
          break;
        case Enum.LookupMode.Return:
          _url = Global.ServiceUrl + Service.SOP + Method.RETURNLOOKUP + _rowsToSelect;
          Global.LookupMode = Enum.LookupMode.Return;
          break;
        case Enum.LookupMode.Suspend:
          _url = Global.ServiceUrl + Service.SOP + Method.INVOICELOOKUP + _rowsToSelect;
          Global.LookupMode = Enum.LookupMode.Suspend;
          _transactionLookup.set({
            IsPosted: false
          });
          break;
      }
      this.ShowActivityIndicator();
      $("<h5>Loading...</h5>").appendTo($("#spin"));
      this.$("#reviewTransactions-content").html("");
      this.$("#reviewTransactions-content").append(this._transactionsTemplate());
      //this.$("#reviewTransactions-content tbody").html("");

      _transactionLookup.url = _url;
      _transactionLookup.save(null, {
        success: function(model, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          _self.AddAllTransactionToList(model, response, _self);
          _self.RefreshScroll();
          _self.isFetching = false;
        },
        error: function(model, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          _self.HideActivityIndicator();
          _self.isFetching = false;
          model.RequestError(error, "Error Loading Transactions");
        }
      });
    },

    AddAllTransactionToList: function(model, response, _self) {
      if (response) {
        var _transactions;
        var printPickNoteCount = response.PrintPickNoteCount;

        switch (Global.LookupMode) {
          case Enum.LookupMode.Invoice:
            _transactions = response.Invoices;
            break;
          case Enum.LookupMode.Order:
            _transactions = response.SalesOrders;
            break;
          case Enum.LookupMode.Quote:
            _transactions = response.SalesOrders;
            break;
          case Enum.LookupMode.Return:
            _transactions = response.Returns;
            break;
          case Enum.LookupMode.Suspend:
            _transactions = response.Invoices;
            break;
        }

        this.collection.reset(_transactions);
        this.CalculateResultsAndTotal();

        this.collection.each(this.AddOneTransactionToList, this);
        //{vScrollbar:true, vScroll:true, snap:false, momentum: true, onScrollMove: function() { _self.$(".div-options").hide(); }
        if (Global.isBrowserMode) $('#transactions-search').focus();


      }
      this.HideActivityIndicator();

      if (this.collection.length === 0) {
        this.$(".table-caption").html("No Data Found.");
        this.$(".table-caption").show();
      } else {
        this.$(".table-caption").html("");
        this.$(".table-caption").hide();
      }

      //CSL-5688 : 04.22.13 : Require picking note configuration of Sales Order
      if (this.firstTymLoaded && this.notifyPickingNoteIsOn && Global.CustomerPreference.IsRequirePickingNote && response.PrintPickNoteCount > 0) {
        this.notifyPickingNoteIsOn = false;
        this.firstTymLoaded = false;
        this.NotifyMsg("Require picking note configuration for Sales Order in Customer Preference of Connected Business is enabled. There are order transactions that will not appear in Transaction List.", "Require picking note");
      }

    },

    RemoveModelByOrderCode: function(soCode, isPrint) {
      if (!this.collection) return;
      var toRemove;
      this.collection.each(function(model) {
        var isMatch = (model.get('SalesOrderCode') == soCode);
        var stage = model.get('Stage');

        if ((isMatch && !isPrint) || (isMatch && isPrint && stage == 1)) {
          model.trigger('destroy-view');
          toRemove = model;
        }
      });
      if (toRemove) this.collection.remove(toRemove);
    },

    CalculateResultsAndTotal: function() {
      var total = 0;
      if (Global.LookupMode != Enum.LookupMode.Return) {
        this.collection.each(function(model) {
          var bal = 0;
          bal = parseFloat(model.get("BalanceRate"));
          total += bal;
        });
        this.$("#transaction-total").show();
        this.$("#transaction-total").text("Total Balance : " + Global.CurrencySymbol + " " + format("#,##0.00", total));
      } else {

        this.$("#transaction-total").hide();
      }

      this.$("#transaction-result").text("Results : " + this.collection.length);

    },

    RefreshScroll: function() {
      var _self = this;

      if (Global.isBrowserMode) {
        Shared.UseBrowserScroll('#reviewTransactions-list');
        return;
      }
      if (!Shared.IsNullOrWhiteSpace(this.myScroll)) {
        //dont remove  - jj
        this.myScroll.destroy();
      }
      //if(!this.myScroll) {

      this.myScroll = new iScroll('reviewTransactions-list', {
        vScrollbar: true,
        vScroll: true,
        snap: false,
        momentum: true,
        onScrollMove: function() {
          _self.$(".div-options").hide();
        },
        onScrollEnd: function() {
          _self.$(".div-options").hide();
        }
      });
      this.myScroll.refresh();
      // this.myScroll = new IScroll('#reviewTransactions-content', { scrollbars: true, mouseWheel: true, interactiveScrollbars: true });

      // this.myScroll.on('scrollStart', function () { console.log('scroll started'); _self.$(".div-options").hide(); });

      // this.myScroll.on('scrollEnd', function () { console.log('scroll ended'); _self.$(".div-options").hide(); });
      //}else{

      //}

    },

    AddOneTransactionToList: function(item) {
      var _transactionView = new TransactionView({
        model: item
      });
      this.$("#reviewTransactions-content tbody").append(_transactionView.render().el);
      //	if(this.myScroll) this.myScroll.refresh();
    },

    TransactionSelected: function(x_coord, y_coord, model) {
      this.ShowOptions(x_coord, y_coord, model);
    },

    ShowOptions: function(x_coord, y_coord, model) {
      if (!this.optionsView) {
        this.optionsView = new OptionsView();
        this.$(".div-options").append(this.optionsView.render().el);
      }
      this.$(".div-options").show();
      //console.log(this.$("#transaction-options-popover").height());
      this.optionsView.Show(x_coord, y_coord, model, {
        // IsPrintPickNote : this.isPrintPickNote,
        // IsReadyForPickup : this.isReadyForPickup,
        PickupStage: this.pickUpStage
      });
    },

    btnClose_tap: function(e) {
      e.preventDefault();
      $("#transactions-search").blur();
      Global.IsPosted = true;
      this.trigger('userclosedform', this); // GEMINI: CSL-5435
      this.Close();
    },

    //inputTransactionsSearch_keyUp : function(e) {
    inputTransactionsSearch_keyPress: function(e) {
      if (e.keyCode === 13) {
        this.InitializeFetchData();
      } else {
        this.ShowClearBtn(e);
      }
    },

    btnSales_tap: function(e) {
      e.preventDefault();
      if (!this.isFetching) {
        Global.LookupMode = Enum.LookupMode.Invoice;
        // this.isPrintPickNote = false;
        // this.isReadyForPickup = false;
        this.pickUpStage = 0;

        Global.IsPosted = true;
        this.render();
        this.InitializeFetchData();
      }
    },

    btnOrders_tap: function(e) {
      e.preventDefault();
      if (!this.isFetching) {
        Global.LookupMode = Enum.LookupMode.Order;
        // this.isPrintPickNote = false;
        // this.isReadyForPickup = false;
        this.pickUpStage = 0;

        this.render();
        this.notifyPickingNoteIsOn = true;
        this.InitializeFetchData();
      }
    },

    onPickupPending_Tap: function(e) {
      this.btnPickNote_tap(e, 1);
    },

    onPickupInProgress_Tap: function(e) {
      this.btnPickNote_tap(e, 2);
    },

    onPickupConfirmed_Tap: function(e) {
      this.btnPickNote_tap(e, 3);
    },

    btnPickNote_tap: function(e, stage) {
      e.preventDefault();
      stage = stage || 1;

      if (!this.isFetching) {
        this.clearDateOnLoad = true;
        Global.LookupMode = Enum.LookupMode.Order;

        this.pickUpStage = stage;

        this.render();
        this.firstTymLoaded = false;
        this.InitializeFetchData();
      }
      this.trigger('update-pickup-count');
    },

    btnForPickup_tap: function(e) {
      e.preventDefault();
      if (!this.isFetching) {
        Global.LookupMode = Enum.LookupMode.Order;
        // this.isPrintPickNote = false;
        // this.isReadyForPickup = true;
        this.pickUpStage = 0;

        this.render();
        this.firstTymLoaded = false;
        this.InitializeFetchData();
      }
      this.trigger('update-pickup-count');
    },

    btnQuotes_tap: function(e) {
      e.preventDefault();
      if (!this.isFetching) {
        Global.LookupMode = Enum.LookupMode.Quote;
        // this.isPrintPickNote = false;
        // this.isReadyForPickup = false;
        this.pickUpStage = 0;

        this.render();
        this.InitializeFetchData();
      }
    },

    btnSuspended_tap: function(e) {
      e.preventDefault();
      if (!this.isFetching) {
        Global.LookupMode = Enum.LookupMode.Suspend;
        Global.TransactionType = Enum.LookupMode.Suspend;
        Global.IsPosted = false;
        // this.isPrintPickNote = false;
        // this.isReadyForPickup = false;
        this.pickUpStage = 0;

        this.render();
        this.InitializeFetchData();
      }
    },

    btnReturns_tap: function(e) {
      e.preventDefault();
      if (!this.isFetching) {
        Global.LookupMode = Enum.LookupMode.Return;
        // this.isPrintPickNote = false;
        // this.isReadyForPickup = false;
        this.pickUpStage = 0;

        this.render();
        this.InitializeFetchData();
      }
    },

    checkbox_change: function() {
      this.InitializeFetchData();
    },

    ShowActivityIndicator: function() {
      $("#spin").remove();
      $("<div id='spin'></div>").appendTo(this.$("#reviewTransactions-inner"));
      var _target = document.getElementById('spin');
      this._spinner = Spinner;
      this._spinner.opts.color = '#fff'; //The color of the spinner
      this._spinner.opts.lines = 13; // The number of lines to draw
      this._spinner.opts.length = 7; // The length of each line
      this._spinner.opts.width = 4; // The line thickness
      this._spinner.opts.radius = 10; // The radius of the inner circle
      this._spinner.opts.top = 'auto'; // Top position relative to parent in px
      this._spinner.opts.left = 'auto';
      this._spinner.spin(_target);
    },

    HideActivityIndicator: function() {
      $("#spin").remove();
      this._spinner = Spinner;
      this._spinner.stop();
    },

    ShowClearBtn: function(e) {
      e.stopPropagation();
      var _id = e.target.id;
      var _val = $("#" + _id).val();
      var _strLength = _val.length;
      console.log(_id);
      if (_strLength <= 0) {
        this.HideClearBtn();
      } else {
        $("#" + _id + "ClearBtn").css({
          top: '68px',
          right: '80px'
        });
        $("#" + _id + "ClearBtn").show();
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
    },

    NotifyMsg: function(content, header) {
      navigator.notification.alert(content, null, header, "OK");
    },

  });
  return TransactionsView;
});
