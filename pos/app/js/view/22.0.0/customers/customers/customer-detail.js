/**
 * CUSTOMER - MAINTENANCE
 * @author PREBRON | 05-07-2013
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
  'shared/shared',
  'model/base',
  'model/lookupcriteria',
  'model/contact',
  'collection/base',
  'view/22.0.0/customers/customers/detail/general',
  'view/22.0.0/customers/customers/detail/contacts',
  'view/22.0.0/customers/customers/detail/note',
  'text!template/22.0.0/customers/customers/customer-detail.tpl.html'
], function($, $$, _, Backbone, Global, Service, Method, Shared,
  BaseModel, LookUpCriteriaModel, ContactModel,
  BaseCollection,
  GeneralView, ContactView, NoteView,
  CustomerDetailTemplate) {

  var ClassID = {
    Body: ".detail-body"
  };

  var Tabs = {
    General: "General",
    Contact: "Contact",
    Info: "Info",
    Note: "Note"
    // , Report: "Report"
  };
  var oldModel = {},
    _this;

  var CustomerDetailView = Backbone.View.extend({

    _customerDetailTemplate: _.template(CustomerDetailTemplate),

    events: {
      "tap #general": "tabGeneral_click",
      "tap #contact": "tabContact_click",
      "tap #info": "tabInfo_click",
      "tap #note": "tabNote_click",
      "tap #btn-finish": "btnFinish_Tapped",
      "tap #btn-cancel": "btnCancel_click",
      "tap #btn-save": "btnSave_click",
      "tap #btn-delete": "btnDelete_click",
    },

    CurrentTab: "General",

    tabGeneral_click: function(e) {
      e.preventDefault();
      this.ChangeTab("#general", Tabs.General);
    },
    tabContact_click: function(e) {
      e.preventDefault();
      this.ChangeTab("#contact", Tabs.Contact);
    },
    tabNote_click: function(e) {
      e.preventDefault();
      this.ChangeTab("#note", Tabs.Note);
    },
    tabInfo_click: function(e) {
      e.preventDefault();
      this.ChangeTab("#info", Tabs.Info);
    },
    // tabReport_click: function(e) {
    //   e.preventDefault();
    //   this.ChangeTab("#report", Tabs.Report);
    // },
    btnCancel_click: function(e) {
      e.preventDefault();
      this.trigger('cancel', this);
    },
    btnDelete_click: function(e) {
      e.preventDefault();
      _this = this;
      var _tabName = this.GetTabName();
      navigator.notification.confirm("Are you sure you want to delete this " + _tabName + "?", (_this.ConfirmDelete), "Delete Customer", ['Yes', 'No']);
    },

    btnFinish_Tapped: function(e) {
      e.preventDefault();
      if (!this.model && this.CurrentTab != Tabs.Note) return;
      switch (this.CurrentTab) {
        case Tabs.General:
          if (this.generalView.ValidData()) this.SaveNewCustomer();
          break;
        case Tabs.Contact:
          if (this.contactView.ValidData()) this.SaveNewContact();
          break;
        case Tabs.Note:
          if (this.noteView.ValidData()) this.SaveNewNote();
          break;
        // case Tabs.Report:
        //   if (this.reportView.ValidData()) this.SaveReportChanges();
        //   break;
      }
    },

    btnSave_click: function(e) {
      e.preventDefault();
      switch (this.CurrentTab) {
        case Tabs.General:
          if (this.generalView.ValidData()) this.SaveCustomerChanges();
          break;
        case Tabs.Contact:
          if (this.contactView.ValidData()) this.SaveContactChanges();
          break;
        case Tabs.Note:
          if (this.noteView.ValidData()) this.SaveNoteChanges();
          break;
        // case Tabs.Report:
        //   if (this.reportView.ValidData()) this.SaveReportChanges();
        //   break;
      }
    },

    initialize: function() {
      this.CurrentTab = Tabs.General;
      this.$el.show();
    },

    render: function() {
      if (this.model) {
        this.$el.html(this._customerDetailTemplate);
      } else if (this.CurrentTab == Tabs.Note) {
        //this.$el.html(this._customerDetailTemplate());
      } else {
        this.$el.html("");
        this.DisplayNoRecordFound();
      }
      return this;
    },

    DisplayNoRecordFound: function() {
      Shared.Products.DisplayNoRecordFound("#right-panel", ".list-wrapper", this.toBeSearched);
    },

    GetTabName: function() {
      var tabName = "";
      switch (this.CurrentTab) {
        case "General":
          tabName = "Customer";
          break;
        case "Contact":
          tabName = "Contact";
          break;
        case "Note":
          tabName = "Note";
          break;
        default:
          console.log('No tabName got.');
      }
      return tabName;
    },

    ChangeTab: function(tabID, tabCode) {
      if (this.CurrentTab == tabCode) return;
      this.CurrentTab = tabCode;
      if (tabCode == Tabs.General) this.TriggerCustomerLookup();
      if (tabCode == Tabs.Contact) this.TriggerContactLookup();
      if (tabCode == Tabs.Info) this.LoadInfoView();
      if (tabCode == Tabs.Note) this.TriggerNoteLookup();
      // if (tabCode == Tabs.Report) this.TriggerReportLookup();
    },

    ChangeDisplayTab: function(tabID) {
      $(".detail-header .tab-active").addClass("tab");
      $(".detail-header .tab").removeClass("tab-active");
      $(tabID).addClass("tab-active");
      $(tabID).removeClass("tab");
    },

    /** GENERAL VIEW **/
    TriggerCustomerLookup: function(isNew) {
      Global.fromContactsToGeneralTab = true;
      this.trigger('loadCustomers');
    },

    LoadGeneralView: function(isNew) {
      if (!this.model) return;
      this.SetCustomerDetails();
      this.ChangeDisplayTab("#general");
      isNew = this.IsNew;
      if (isNew) {
        $("#customers-details").addClass("addmode");
      }
      this.CurrentTab = Tabs.General;
      this.generalView = new GeneralView({
        el: ClassID.Body
      });
      this.generalView.el = ClassID.Body;
      this.generalView.model = this.model;
      this.generalView.IsNew = isNew;
      this.generalView.CustomerCode = this.model.get("CustomerCode");
      this.generalView.Show();
    },

    LoadContactView: function(isNew) {
      if (!this.model) return;
      this.SetContactDetails();
      this.ChangeDisplayTab("#contact");
      isNew = this.IsNew;
      if (isNew) {
        $("#customers-details").addClass("addmode");
      }
      this.CurrentTab = Tabs.Contact;

      this.contactView = new ContactView({
        el: ClassID.Body
      });
      this.contactView.el = ClassID.Body;
      this.contactView.model = this.model;
      this.contactView.IsNew = isNew;
      this.contactView.ContactCode = this.model.get("ContactCode");
      this.contactView.Show();
    },

    LoadNoteView: function(isNew) {
      var isNoRecord = false,
        entityCode = "",
        contactCode = "";

      // if(this.generalView && !this.model){
      //     if(this.model){
      //         if(this.generalView.CustomerCode != (this.model.get("CustomerCode") || this.model.get("EntityCode")))
      //         this.model = null;
      //     }
      // }

      // if(this.contactView && !this.model){
      //     if(this.model){
      //         if(this.contactView.ContactCode != (this.model.get("DefaultContactCode") || this.model.get("ContactCode")))
      //         this.model = null;
      //     }
      // }

      if (this.model) {
        this.SetNoteDetails();
        entityCode = this.model.get("CustomerCode") || this.model.get("EntityCode");
        contactCode = this.model.get("DefaultContactCode") || this.model.get("ContactCode");
      } else {
        isNoRecord = true;
        if (this.generalView) entityCode = this.generalView.CustomerCode;
        if (this.contactView) contactCode = this.contactView.ContactCode;
      }

      this.ChangeDisplayTab("#note");
      isNew = this.IsNew;
      if (isNew) {
        $("#customers-details").addClass("addmode");
      }
      this.CurrentTab = Tabs.Note;

      this.noteView = new NoteView({
        el: ClassID.Body
      });
      this.noteView.el = ClassID.Body;
      this.noteView.model = this.model;
      this.noteView.IsNew = isNew;
      this.noteView.entityCode = entityCode;
      this.noteView.contactCode = contactCode;
      this.noteView.IsNoRecord = isNoRecord;
      this.noteView.toBeSearched = this.toBeSearched;
      if (!isNew) this.noteView.Show();
      else this.noteView.AddMode();
    },

    // LoadReportView: function(isNew) {
    //   if (!this.model) return;

    //   this.ChangeDisplayTab("#report");
    //   isNew = this.IsNew;

    //   if (isNew) {
    //     $("#customers-details").addClass("addmode");
    //   }

    //   this.CurrentTab = Tabs.Report;
    //   this.reportView = new ReportView({
    //     el: ClassID.Body
    //   });
    //   this.reportView.el = ClassID.Body;
    //   this.reportView.model = new BaseModel();
    //   this.reportView.IsNew = isNew;
    //   this.reportView.CustomerCode = this.model.get("CustomerCode");
    //   this.reportView.CustomerCode = this.model.get("CustomerCode");
    //   this.reportView.Show();
    // },

    //sets the current contact details for this view
    SetCustomerDetails: function() {
      if (!this.customerModel) this.customerModel = new BaseModel();
      this.customerModel.set(this.model.attributes);
      this.CustomerCode = this.customerModel.get("CustomerCode");
      this.CustomerName = this.customerModel.get("CustomerName");
      $("#newcustomer-title").text("New Customer");
    },

    /** CONTACT VIEW **/
    TriggerContactLookup: function() {
      var customerCode = "";
      if (!this.model) {
        console.log("No customer selected.");
        if (this.contactView) {
          this.model = this.contactView.model;
        } else if (this.noteView) {
          customerCode = this.noteView.entityCode;
        } else return;
      } else {
        customerCode = this.model.get("CustomerCode");
      }


      this.trigger('loadCustomerContacts', customerCode);
    },

    /** NOTE VIEW **/
    TriggerNoteLookup: function() {
      if (!this.model) {
        console.log("No customer selected.");
        if (this.noteView) {
          this.model = this.noteView.model;
        } else return;
      }

      this.trigger('loadCustomerNotes', this.model.get("CustomerCode") || this.model.get("EntityCode"));
    },

    //  /** Report VIEW **/
    //  TriggerReportLookup: function() {
    //   if (!this.model) {
    //     if (this.reportView) {
    //       this.model = this.reportView.model;
    //     }
    //     else return;
    //   }

    //   this.trigger('loadCustomerReport', this.model.get("CustomerCode") || this.model.get("EntityCode"));
    // },

    //sets the current contact details for this viewa
    SetContactDetails: function() {
      if (!this.contactModel) this.contactModel = new BaseModel();
      this.contactModel.set(this.model.attributes);
      this.ContactCode = this.contactModel.get("ContactCode");
      this.ContactEntityCode = this.contactModel.get("EntityCode");
      $("#newcustomer-title").text("New Contact");
    },

    SetNoteDetails: function() {
      if (!this.noteModel) this.noteModel = new BaseModel();
      this.noteModel.set(this.model.attributes);
      this.EntityCode = this.noteModel.get("EntityCode");
      this.ContactCode = this.noteModel.get("ContactCode");
      this.NoteCode = this.noteModel.get("NoteCode");
      this.ContactEntityCode = this.noteModel.get("EntityCode") || this.noteCode.get("ContactCode");
      $("#newcustomer-title").text("New Note");
    },

    ResetMain: function() {
      $(ClassID.Main).html("<div></div>");
    },

    Show: function(model) {
      this.render();
      this.DisplayWait();
      this.DisplayDetails();
      this.CheckProductEdition();
    },

    CheckProductEdition: function() {
      if (Global._UserIsCS) {
        //Shared.ShowHideClassTemplates("table-data tr.tr-ClassTemplate");
      }
    },

    InitializeChildViews: function() {

    },

    DisplayWait: function() {
      $(ClassID.Body).html('<center><div class="loading"><i class="icon-spinner icon-spin"></i></div></center>');
    },

    DisplayError: function() {
      $(ClassID.Body).html('<center><div class="loading"><i class="icon-warning-sign"></i></div></center>');
    },

    DisplayDetails: function() {
      // if (!this.model) {
      //     switch (this.CurrentTab) {
      //         case Tabs.General : if(this.generalView) this.model = this.generalView.model; break;
      //         case Tabs.Contact : if(this.contactView) this.model = this.contactView.model; break;
      //         case Tabs.Note    : if(this.noteView) this.model = this.noteView.model; break;
      //         //case Tabs.Contact : this.InitializeContactSchema();  break;
      //     }
      // }
      switch (this.CurrentTab) {
        case Tabs.General:
          this.LoadGeneralView(this.IsNew);
          break;
        case Tabs.Contact:
          this.LoadContactView(this.IsNew);
          break;
        case Tabs.Note:
          this.LoadNoteView(this.IsNew);
          break;
        // case Tabs.Report:
        //   this.LoadReportView(this.IsNew);
        //   break;
          //case Tabs.Contact : this.InitializeContactSchema();  break;
      }
    },

    AddMode: function() {
      Shared.Customers.Overlay.Show();
      switch (this.CurrentTab) {
        case Tabs.General:
          this.InitializeCustomerSchema();
          break;
        case Tabs.Contact:
          this.InitializeContactSchema();
          break;
        case Tabs.Note:
          this.InitializeCustomerNote();
          break;
      }
    },

    InitializeCustomerSchema: function() {
      var self = this;
      this.customerschema = new BaseModel();
      this.customerschema.url = Global.ServiceUrl + Service.CUSTOMER + Method.GETNEWCUSTOMERSCHEMA;
      //this.customerschema.on('sync', this.SuccessCustomerSchema, this);
      //this.customerschema.on('error', this.ErrorCustomerSchema, this);
      this.customerschema.fetch({
        success: function(model, response, options) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          self.SuccessCustomerSchema(response);
        },
        error: function(collection, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          Shared.Customers.Overlay.Hide();
          collection.RequestError(error, "Error Fetching customer schema");
        }
      });
    },

    SuccessCustomerSchema: function(response) {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      this.customerschema = new BaseModel();
      this.customerschema.set(response);
      this.customerschema.set({
        CustomerName: "New Customer",
      });
      this.trigger('schemaFetched', this);
    },

    ErrorCustomerSchema: function(model, xhr, options) {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      model.RequestError(error, "Error generating new customer schema", "An error was encountered when trying to generate customer schema contacts.");
    },

    GetCustomerJsonValues: function() {
      this.generalView.UpdateModelValues();
      return this.generalView.model.attributes;
    },

    /*** CONTACTS VIEW METHODS ***/
    InitializeContactSchema: function() {
      var _entityCode = this.CustomerCode;
      this.contactschema = new ContactModel;
      this.contactschema.url = Global.ServiceUrl + Service.CUSTOMER + Method.GETNEWCONTACTSCHEMA;
      this.contactschema.on('sync', this.SuccessContactSchema, this);
      this.contactschema.on('error', this.ErrorContactSchema, this);
      this.contactschema.set({
        EntityCode: _entityCode,
        Type: "CustomerContact",
      });
      this.contactschema.save();
    },

    SuccessContactSchema: function(model, response) {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      this.SetContactSchema(response);
    },

    ErrorContactSchema: function(model, xhr, options) {
      Shared.Customers.Overlay.Hide();
      model.RequestError(error, "Error retrieving contact schema");
    },

    SetContactSchema: function(response) {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      this.contactschema.set(response);
      this.contactschema.set({
        ContactFullName: "New Customer Contact",
      });
      this.trigger('schemaFetched', this);
    },

    /** END **/
    SaveResponse: function(response) {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      this.model.set(response);
    },

    GetContactJsonValues: function() {
      return this.contactView.GetUpdatedModelAttributes();
    },

    GetNoteJsonValues: function() {
      return this.noteView.GetUpdatedModelAttributes();
    },

    // GetReportJsonValues: function() {
    //   return this.reportView.GetUpdatedModelAttributes();
    // },

    /** UPDATING CUSTOMER/CONTACT/NOTES **/
    SaveCustomerChanges: function() {
      Shared.Customers.Overlay.Show();
      var model = new BaseModel();
      model.url = Global.ServiceUrl + Service.CUSTOMER + Method.UPDATECUSTOMER;
      model.on('sync', this.SuccessfullySaved, this);
      model.on('error', this.ErrorEncountered, this);
      model.set(this.GetCustomerJsonValues());
      model.save();
    },

    SaveContactChanges: function() {
      Shared.Customers.Overlay.Show();
      var model = new BaseModel();
      model.url = Global.ServiceUrl + Service.CUSTOMER + Method.UPDATECONTACT;
      model.on('sync', this.SuccessfullySaved, this);
      model.on('error', this.ErrorEncountered, this);

      model.set(this.GetContactJsonValues());
      model.save();
    },

    SaveNoteChanges: function() {
      Shared.Customers.Overlay.Show();
      var model = new BaseModel();
      model.url = Global.ServiceUrl + Service.CUSTOMER + Method.UPDATECUSTOMERNOTE;
      model.on('sync', this.SuccessfullySaved, this);
      model.on('error', this.ErrorEncountered, this);

      model.set(this.GetNoteJsonValues());
      model.save();
    },

    // SaveReportChanges: function() {
    //   Shared.Customers.Overlay.Show();
    //   var model = new BaseModel();
    //   model.url = Global.ServiceUrl + Service.POS + Method.UPDATECUSTOMERPOSREPORT;
    //   model.on('sync', this.SuccessfullySaved, this);
    //   model.on('error', this.ErrorEncountered, this);

    //   model.set(this.GetReportJsonValues());
    //   model.save();
    // },

    /** END UPDATING CUSTOMER/CONTACT/NOTES **/

    /** DELETING CUSTOMER/CONTACT **/
    DeleteCustomer: function() {
      var _customerCode = this.model.get("CustomerCode");
      this.CustomerCode = _customerCode;

      var model = new BaseModel();
      model.url = Global.ServiceUrl + Service.CUSTOMER + Method.DELETECUSTOMERBYCUSTOMERCODE;
      model.on('sync', this.SuccessfullyDeleted, this);
      model.on('error', this.ErrorDeleting, this);

      model.set({
        StringValue: _customerCode
      })
      model.save();
    },

    DeleteContact: function() {
      var _contactCode = this.model.get("ContactCode");
      this.ContactCode = _contactCode;

      var model = new BaseModel();
      model.url = Global.ServiceUrl + Service.CUSTOMER + Method.DELETECONTACT;
      model.on('sync', this.SuccessfullyDeleted, this);
      model.on('error', this.ErrorDeleting, this);

      model.set({
        ContactCode: _contactCode
      })
      model.save();
    },

    DeleteNote: function() {
      var _noteCode = this.model.get("NoteCode");
      this.NoteCode = _noteCode;

      var model = new BaseModel();
      model.url = Global.ServiceUrl + Service.CUSTOMER + Method.DELETECUSTOMERNOTE;
      model.on('sync', this.SuccessfullyDeleted, this);
      model.on('error', this.ErrorDeleting, this);

      model.set({
        NoteCode: _noteCode
      })
      model.save();
    },
    /** END DELETING CUSTOMER/CONTACT/NOTES **/

    /** DELETE CALLBACK METHODS **/
    SuccessfullyDeleted: function(model, response, options) {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      if (this.CurrentTab == Tabs.Note) {
        this.trigger("deleted");
        return;
      }

      if (response.ErrorMessage === null) this.trigger("deleted");
      else {
        this.errorDeleteMsg = response.ErrorMessage;
        this.trigger('cannotDelete')
      }
    },

    ErrorDeleting: function(model, error, options) {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      Shared.Customers.Overlay.Hide();
      model.RequestError(error, "Error Deleting " + this.GetTabName() + ".");
    },
    /** END OF DELETE CALLBACK METHODS **/


    /** SAVING NEW CUSTOMER/CONTACT **/
    SaveNewCustomer: function() {
      Shared.Customers.Overlay.Show();
      var model = new BaseModel();
      model.url = Global.ServiceUrl + Service.CUSTOMER + Method.CREATECUSTOMER;
      model.on('sync', this.SuccessfullySaved, this);
      model.on('error', this.ErrorEncountered, this);

      model.set(this.GetCustomerJsonValues());
      model.save();
    },

    SaveNewContact: function() {
      Shared.Customers.Overlay.Show();
      var model = new ContactModel();
      model.url = Global.ServiceUrl + Service.CUSTOMER + Method.CREATENEWCONTACT;
      model.on('sync', this.SuccessfullySaved, this);
      model.on('error', this.ErrorEncountered, this);

      model.set(this.GetContactJsonValues());
      model.save();
    },

    SaveNewNote: function() {
      Shared.Customers.Overlay.Show();
      var model = new BaseModel();
      model.url = Global.ServiceUrl + Service.CUSTOMER + Method.ADDCUSTOMERNOTE;
      model.on('sync', this.SuccessfullySaved, this);
      model.on('error', this.ErrorEncountered, this);

      model.set(this.GetNoteJsonValues());
      model.save();
    },
    /** END SAVING NEW **/

    /** SAVE CALLBACK METHODS **/
    SuccessfullySaved: function(model, response, options) {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      if (response.ErrorMessage === "" || response.ErrorMessage === null) {
        if (this.model) this.model.set(response);
        else {
          this.model = new BaseModel();
          this.model.set(response);
        }

        switch (this.CurrentTab) {
          case Tabs.General:
            this.SetCustomerDetails();
            break;
          case Tabs.Contact:
            this.SetContactDetails();
            break;
          case Tabs.Note:
            this.SetNoteDetails();
            break;
        }
        if (this.IsNew) this.SaveCompleted();
        else this.trigger("updated");
      } else {
        Shared.Customers.ShowNotification(response.ErrorMessage, true);
        this.trigger("failed", this.model);

      }
    },

    ErrorEncountered: function(model, error, options) {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      Shared.Customers.Overlay.Hide();
      model.RequestError(error, "Error Saving New " + this.GetTabName() + ".");
    },

    SaveCompleted: function() {
      switch (this.CurrentTab) {
        case Tabs.General:
          this.trigger('newCustomerSaved', this);
          break;
        case Tabs.Contact:
          this.trigger('newContactSaved', this);
          break;
        case Tabs.Note:
          this.trigger('newNoteSaved', this);
          break;
      }
    },

    /** END SAVE CALLBACKS **/
    ConfirmDelete: function(button) {

      if (button === 1) {
        Shared.Customers.Overlay.Show();
        switch (_this.CurrentTab) {
          case Tabs.General:
            _this.DeleteCustomer();
            break;
          case Tabs.Contact:
            _this.DeleteContact();
            break;
          case Tabs.Note:
            _this.DeleteNote();
            break;
        }
      } else {
        return;
      }
    },

    NotifyMsg: function(content, header) {
      console.log(content);
      navigator.notification.alert(content, null, header, "OK");
    },

    InitializeCustomerNote: function() {
      this.IsNew = true;
      this.LoadNoteView(this.IsNew);
    }

  });
  return CustomerDetailView;
});
