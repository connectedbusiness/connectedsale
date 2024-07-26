define(['shared/enum'],
  function(Enum) {
    var Global = {

      ProductType: 'Connected Sale',

      BetaServerUrl: {
       // CB: "http://data.connectedbusiness.com/demo/POS17/"
        CB: "http://data.connectedbusiness.com/Demo_CB18/POS/WebService/"
      },

      AppVersion: "23.2", //version.major + '.' + version.minor
      ServerVersion: "",
      MinimumSupportedVersion: "16.0", //for backwards compatibility
      MinimumSupportedVersionForDesktop: "16.0", //for backwards compatibility

      UserInfo: {
        UserCode: '',
        RoleCode: ''
      },

      ApplicationType: "POS",
      PreviousPage: '',
      CurrentCustomerChanged: false,
      CurrentCustomerEmailChanged: false,
      CurrentCustomer: {},
      ServiceUrl: '',
      PreviousServiceUrl: "",
      Username: '',
      Password: '',
      HubConnectionID: '',
	  GUID: '',
      Category: '',
      CompanyName: "",
      CompanyCountry: "",
      CustomerCode: "",
      CustomerName: "",
      CustomerEmail: "",
      LocationCode: "MAIN",
      POSWorkstationID: "",
      DefaultPOSWorkstationID: "POS1",
      DefaultPrice: "",
      DefaultShipTo: "",
      ImageLocation: "",
      MerchantLogin: "",
      ShipToName: "",
      ShipToAddress: "",

      SalesRepGroupCode: "",
      SalesRepGroupName: "",
      RepSplit: "",
      SalesRepList: "",

      IsCreditCardValid: true,
      authCodeResult: "",
      TempCreditCardNumber: "",
      TempExpDateMonth: "",
      TempExpDateYear: "",

      LookupMode: '',
      TransactionType: Enum.TransactionType.Sale,
      TransactionCode: '',
      TransactionStatus: '',
      HasChanges: false,
      TransactionObject: null,
      PaymentType: '',
      PaymentMethod: '',
      SelectedPaymentType: '',
      Signature: null,
      OverrideMode: '',
      ActionType: '',
      PromptCloseWorkstation: false,
      OfflineCharge: false,
      DejavooEnabled: false,
      ShippingMethod: '',
      IsCreateRefund: false,

      IsPosted: true,

      PreviousAssignedItemQty: 0,
      CurrentAssignedItemQty: 0,

      ManagerValidated: false,
      msg1: "",
      msgTitle: "",

      IsUseINVDiscountReport: false,

      ReasonCode: {
        Discount: '',
        Transaction: '',
        Return: '',
        Item: ''
      },

      Preference: {
        AllowItemDiscount: true,
        AllowSaleDiscount: true,
        AskForEmailAddress: true,
        AskToPrintReceipt: true,
        MaxItemDiscount: '',
        MaxSaleDiscount: '',
        AllowSales: '',
        AllowOrder: '',
        AllowReturns: '',
        AllowQuote: '',
        DefaultPOSTransaction: 0,
        KioskDefaultTransaction: 0,
        AllowViewPrintZXTape: false,
        IsOverrideSalesRep: '',
        ShowWholesalePrice: false,
        IsAutoAdjustmentStock: true,
        DefaultPrinter: null
      },

      Preferences: {
        Preference: '',
        UserRoles: '',
        Warehouses: '',
        Categories: '',
        CreditCardGateways: '',
        PaymentType: ''
      },

      PrintOptions: {
        EmailAddress: '',
        PrintReceipt: true,
        EmailReceipt: true,
        SilentPrint: false,
        Reprint: false,
        CustomizePrint: true
      },

      Printer: {
        IpAddress: '',
        PrinterModel: '',
        Language: "0",
        SelectedPrinter: '',
        isPrintedinPrinter: false,
        isPrinterOpen: false
      },

      Status: {},

      ShipTo: {},

      Coupon: null,

      Kiosk: {
        Cart: null,
        Customer: null,
        Total: null
      },

      Contact: {
        Type: "CustomerContact"
      },

      isBrowserMode: false,

      ReportCode: {
        Invoice: "SRP-POS-DSR",
        Order: "SRP-POS-DOR",
        Quote: "SRP-POS-DQR",
        Payment: "SRP-POS-DPR",
        GiftCard: "SRP-CUST-GIFTCARD",
        GiftCertificate: "SRP-CUST-GIFTCERT",
        PickNote: "SRP-000376"
      },

      IsAllowedRole: function(roleCode) {
        var _roleCode = ("[" + roleCode + "]").toUpperCase();
        var include = "[Administrator][User]".toUpperCase();
        if (include.indexOf(_roleCode) > -1) return true;
        return false;
      },


      IsAllowedUser: function(userName) {
        var _userName = ("[" + userName + "]").toUpperCase();
        var exclude = "[CBNAdmin][emailadmin][guest][jobAdmin][webadmin][woohaa]".toUpperCase();
        if (exclude.indexOf(_userName) > -1) return false;
        return true;
      },

      PublicNote: {
        PublicNotesCode: '',
        PublicNotesDescription: '',
        PublicNotes: '',
        LineItemNote: '',
        SalesOrderCode: ''
      },

      NoteType: {
        Customer: "Customer",
        LineItem: "LineItem",
        OrderNotes: "OrderNotes"
      },

      MaintenanceType: {
        CREATE: "Create",
        UPDATE: "Update",
        DELETE: "Delete"
      },

      Plugins: {
        ReceiptPrinter: "com.connectedbusiness.plugins.epsonprinter.EpsonPrinter",
        Unimag: "com.connectedbusiness.plugins.shuttleunimag.ShuttleUniMag",
        ActivityIndicator: "com.connectedbusiness.plugins.activityindicator.ActivityIndicator",
        AirPrinter: "com.connectedbusiness.plugins.airprinter.AirPrinter",
        NMIPaymentGateway: "com.connectedbusiness.plugins.nmipaymentgateway.NMIPaymentGateway"
      },

      SupportedCardDevice: {
        Unimag: "Unimag",
        IPS: "IPS",
        NoDevice: "No Device"
      },

      TrackStorePickupOrders: true,

      MinimumNotificationInterval: 5,

      TestFairy: {
        AppToken: 'fcb0ed343537b8caf8bd5d14d8dfdced08681729',
        UploadToken: ''
      },

      IsSignOut: false
    }

    return Global;
  }
);
