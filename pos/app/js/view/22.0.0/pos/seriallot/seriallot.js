/**
 * @author alexis.banaag
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'shared/enum',
  'shared/service',
  'shared/method',
  'shared/shared',
  'model/base',
  'model/serialnumber',
  'collection/base',
  'view/19.0.0/pos/seriallot/serial/serials',
  'view/19.0.0/pos/seriallot/list/lists',
  'text!template/19.0.0/pos/seriallot/seriallot.tpl.html',
], function($, $$, _, Backbone,
  Global, Enum, Service, Method, Shared,
  BaseModel, SerialNumberModel, BaseCollection,
  SerialListView, ListsView,
  Template) {
  var SerialLotView = Backbone.View.extend({
    _template: _.template(Template),

    events: {
      "tap #done-serialLot": "buttonDone_tap",
      "keypress #input-serialLot": "addSerial_keypress",
      "change #input-serialLot": "addSerial_change",
      "tap #add-serialLot": "buttonAdd_tap",
      "tap #cancel-serialLot": "buttonCancel_tap",
      "tap #view-serialList": "buttonView_tap"
    },

    addSerial_keypress: function(e) {
      e = e || event;
      var charVal = String.fromCharCode(e.keyCode || e.which);
      var rtn = this.validateString(charVal);
      if (!rtn.valid && e.keyCode != 13) {
        e.preventDefault();
        return;
      }
      if (e.keyCode === 13) {
        this.ProcessAddSerialLotNumber();
      }
    },

    addSerial_change: function(e, checkThis) {
      var strSerial = $("#input-serialLot").val();
      var rtn = this.validateString(strSerial);
      if (!rtn.valid) $("#input-serialLot").val(rtn.val);
    },

    validateString: function(strSerial) {
      var isValid = true;
      strSerial = strSerial || '';
      //white spaces
      if (/\s/g.test(strSerial)) {
        strSerial = strSerial.replace(/\s/g, '');
        isValid = false;
      }
      //special characters
      var specialChars = new RegExp(/[^-\w\s]/gi)
      if (specialChars.test(strSerial)) {
        strSerial = strSerial.replace(/[^-\w\s]/gi, '');
        isValid = false;
      }
      return {
        val: strSerial,
        valid: isValid
      }
    },

    buttonDone_tap: function(e) {
      e.preventDefault();
      this.validateClosingForm();
    },

    buttonAdd_tap: function(e) {
      e.preventDefault();
      this.ProcessAddSerialLotNumber();
    },

    buttonCancel_tap: function(e) {
      e.preventDefault();
      this.Hide();
      if (this.autoGenerate) {
        if ($("#gclookup").is(":visible")) this.trigger('SerialGenerated');
      } else if (Global.TransactionType === Enum.TransactionType.SalesRefund) {
        this.validateIsIncluded();
      } else {
        if ($("#gclookup").is(":visible")) this.validateClosingForm(true);
      }
    },

    buttonView_tap: function(e) {
      e.preventDefault();
      $("#serialLot-content").hide();

    },

    validateClosingForm: function(isCancel) {
      try {
        var msg = "SerialLotNumber is Required. The following items do not have the same number of serial numbers with the shipped quantity.";
        var errMsg = this.ValidateClosingSerial(this.collection, this.cartCollection, msg);

        if (this.model.get("ItemType") === Enum.ItemType.GiftCard || this.model.get("ItemType") === Enum.ItemType.GiftCertificate) {
          if (errMsg === undefined || errMsg === "") this.Hide();
          else {
            //if (!$("#gclookup").is(":visible")) throw errMsg
            if (!isCancel) throw errMsg;
          }
        } else {
          this.Hide();
        }

        if ($("#gclookup").is(":visible") && !errMsg) {
          if (Global.TransactionType === Enum.TransactionType.SalesRefund) {
            this.validateIsIncluded();
          } else {
            this.trigger('SerialGenerated');
          }
        }
      } catch (err) {
        navigator.notification.alert(err, null, "Action not allowed", "OK");
        console.log(err);
      }

    },

    validateIsIncluded: function() {
      var IncludedCount = 0;
      var self = this;

      this.collection.each(function(mdl) {
        if ((mdl.get("ItemCode") === self.model.get("ItemCode") && mdl.get("LineNum") === self.model.get("LineNum")) && mdl.get("IsIncluded") && (self.model.get("Good") != IncludedCount)) {
          IncludedCount++;
        }
      });

      var serialCount = this.collection.filter(function(mdl) {
        return mdl.get("ItemCode") === self.model.get("ItemCode") && mdl.get("LineNum") === self.model.get("LineNum");
      });

      if (IncludedCount === serialCount.length) this.trigger('SerialGenerated');
    },

    /***************** END OF EVENTS *****************/

    IsSerialListEmpty: false,

    initialize: function() {
      this.type = this.options.type;
      this.itemCode = this.options.itemCode;
      this.itemName = this.options.itemName;
      this.lineNum = this.options.lineNum;
      this.itemType = this.options.itemType;
      this.uom = this.options.unitMeasure;

      this.eventname = this.options.serialEvent;
      this.model = new BaseModel(this.options.itemModel);
      this.cartCollection = this.options.cartCollection;
      this.serialList = this.options.serialList;

      this.collection.comparator = function(collection) {
        return collection.get("SerialLotCode");
      };

      this.InitializeEvents();

      this.isProcessing = false;
    },

    render: function() {
      this.$el.html(this._template({
        SerialLotType: this.type,
        ItemName: this.itemName,
        UnitMeasureCode: this.uom
      }));
      this.$el.trigger("create");

      this.HideElements();
    },

    /**
		 Add SerialLotNumber by

		 @method RefreshListView
		 **/
    AddSerialLotNumber: function(data, itemCode, lineNum, itemType, serialLotCode, serialType, uom, isReturned, isActivated, isGenerated, recipient, isIncluded, model) {
      var self = this;

      var toBeAdded = {
        SerialLotNumber: data,
        ItemCode: itemCode,
        LineNum: lineNum,
        ItemType: itemType,
        SerialLotCode: serialLotCode,
        SerialLotType: serialType,
        SerializeLot: serialType,
        UnitMeasureCode: uom,
        IsIncluded: isIncluded,
        SerialRecipient: recipient,
        IsReturned: isReturned,
        IsActivated: isActivated,
        IsSerialGenerated: isGenerated,
        OriginalSerialRecipient: recipient
      };
      if (this.ValidateAddSerialLot(toBeAdded, itemType)) {
        switch (Global.Preference.PreventDuplicateSerialNumber) {
          case true:
            this.ProcessValidateSerial(toBeAdded, itemType);
            break;
          case false:
            this.collection.add(toBeAdded);
            this.collection.trigger('startRendering', new SerialNumberModel(toBeAdded));
            this.isProcessing = false;
            break;
        }
      }
    },

    AddSerialLotNumberByBatch: function(collection) {
      var tempArray = [];
      var self = this;
      var modelsToBeRemoved = [];

      collection.each(function(model) {
        var tempMdl = new SerialNumberModel();
        var itemType = self.CompareCurrentData("ItemType", "ItemCode", model.get("ItemCode"));
        var recipient = self.PopulateSerialRecipient(model.get("OriginalSerialRecipient"), model.get("SerialRecipient"));

        var toBeAdded = {
          SerialLotNumber: model.get("SerialLotNumber"),
          ItemCode: model.get("ItemCode"),
          LineNum: model.get("LineNum"),
          ItemType: itemType,
          SerialLotCode: model.get("SerialLotCode"),
          SerialLotType: "None",
          SerializeLot: "None",
          UnitMeasureCode: self.RetrieveUnitMeasureCode(model.get("LineNum"), model.get("ItemCode")),
          IsIncluded: false,
          SerialRecipient: recipient,
          IsReturned: model.get("IsReturned"),
          IsActivated: model.get("IsActivated"),
          IsSerialGenerated: model.get("IsSerialGenerated"),
          OriginalSerialRecipient: recipient
        };

        //tempArray.push(tempMdl.set(toBeAdded)); // <-- this snippet is replaced by the code below. 03.04.2014 : CSL-25090 (Additional Bug).
        if (self.isItemAlreadyRemoved(model.get("ItemCode"), model.get("LineNum"))) {
          modelsToBeRemoved[modelsToBeRemoved.length] = model;
        } else {
          tempArray.push(tempMdl.set(toBeAdded));
        }

      });

      if (modelsToBeRemoved.length > 0) { // removes the seriallot of the removed item.
        for (var indx in modelsToBeRemoved) {
          collection.remove(modelsToBeRemoved[indx]);
        }
      }

      if (tempArray.length > 0 && collection.length === tempArray.length) {
        this.collection.add(tempArray);
        this.collection.trigger('startRendering');
      }
    },

    isItemOnCart: function() {
      if (!this.cartCollection) return true;
    },


    AllowedToAddSerial: function(data) {
      if (Global.TransactionType != Enum.TransactionType.Recharge) return true;
      navigator.notification.alert("Action not allowed in " + Global.TransactionType + " transaction. ", null, "Action not allowed");
      return false;
    },

    ChangeEmailAddress: function() {
      if ((this.eventname === "ItemDetail" || this.eventname === "QuantityOrderedUpdated") &&
        (this.itemType === Enum.ItemType.GiftCard || this.itemType === Enum.ItemType.GiftCertificate)) {

        this.collection.each(function(mdl) {
          var email = mdl.get("SerialRecipient");
          var origEmail = mdl.get("OriginalSerialRecipient");
          var isModified = (mdl.get("IsEmailModified")) ? true : false;
          if (email != Global.DefaultContactEmail) {
            if (!isModified) {
              mdl.set({
                SerialRecipient: Global.DefaultContactEmail,
                OriginalSerialRecipient: email
              });
            }
          }
        });

      }
    },

    CheckUnitMeasureCode: function() {
      var self = this;
      var toBeDeleted = [],
        toBeProcessed = [];
      if (this.collection && this.collection.length > 0) {
        var serialUOM = this.collection.toJSON().filter(function(mdl) {
          return mdl.UnitMeasureCode === self.uom && mdl.LineNum === self.model.LineNum;
        });

        if (Shared.IsNullOrWhiteSpace(serialUOM) && serialUOM.length === 0) {
          this.collection.comparator = function(collection) {
            return collection.get("LineNum");
          };

          this.collection.sort({
            silent: true
          });

          var totalQty = self.model.get("QuantityOrdered") * self.model.get("UnitMeasureQty");
          var filtered = this.collection.filter(function(mdl) {
            return mdl.get("ItemCode") === self.model.get("ItemCode") && mdl.get("LineNum") === self.model.get("LineNum");
          });

          if (filtered && filtered.length > 0) {
            _.each(filtered, function(mdl, i) {
              if (mdl.get("ItemType") === Enum.ItemType.GiftCard || mdl.get("ItemType") === Enum.ItemType.GiftCertificate) {
                if (i < totalQty) mdl.set({
                  UnitMeasureCode: self.uom
                });
                else toBeDeleted.push(mdl);
              } else {
                mdl.set({
                  UnitMeasureCode: self.uom
                });
              }
            });
          }
          if (toBeDeleted.length > 0) {
            this.collection.remove(toBeDeleted);
          }
        }
      }

    },

    CompareCurrentData: function(attrib1, attrib2, value1, value2) {
      var item = this.cartCollection.find(function(cart) {
        return cart.get(attrib2) === value1 && cart.get(attrib2) === value2;
      });

      if (item) {
        if (item.get(attrib1) != null || item.get(attrib1) != "" || item.get(attrib1) != undefined) {
          return item.get(attrib1);
        }
      }
      return this.model.get(attrib1);
    },

    isItemAlreadyRemoved: function(itemCode, lineNum) {
      var item = this.cartCollection.find(function(cart) {
        return cart.get("ItemCode") === itemCode && cart.get("LineNum") === lineNum;
      });

      if (!item) return true;
      else return false;
    },

    EmptySerialList: function(collection) {
      this.$("#serialListNumber").html("");
    },

    ErrorHandler: function(model, response, options) {
      if (response.ErrorMessage != "" || response.ErrorMessage != null || response.ErrorMessage != undefined) {
        if (response.Value) {
          //navigator.notification.alert(response.Message, null, "Action not Allowed", "OK");
          navigator.notification.alert(this.type + " number (" + options.serialLotNumber + ") you entered has duplicate(s) on other transaction(s).", null, "Duplicate " + this.type + " number(s)", "OK");
          this.isProcessing = false;
          return false;
        }

        return true;
      } else navigator.notification.alert(response.ErrorMessage, null, "Error Occured", "OK");
      return false;
    },

    FindSerialLotNumberDuplicate: function(toBeAddedCollection, isGC) {
      switch (isGC) {
        case true:
          var existingSerial = this.collection.find(function(serial) {
            return serial.get("SerialLotNumber").toUpperCase() === toBeAddedCollection.SerialLotNumber.toUpperCase()
          });
          break;
        default:
          var existingSerial = this.collection.find(function(serial) {
            return serial.get("SerialLotNumber").toUpperCase() === toBeAddedCollection.SerialLotNumber.toUpperCase() &&
              serial.get("ItemCode") === toBeAddedCollection.ItemCode;
          });
          break;
      }


      if (!existingSerial) {
        //this.collection.add(toBeAddedCollection);
        //this.processedSerialCollection.push(toBeAddedCollection);
        return true;
      } else {
        return false;
      }

      this.collection.sort({
        silent: true
      });
      //this.collection.trigger('doneAdding', new BaseModel(toBeAddedCollection));
      //this.collection.trigger('startRendering', new SerialNumberModel(toBeAddedCollection));
    },

    GenerateGiftSerialNumber: function() {
      var self = this;
      var onSuccess = function(model, response, options) {
        Shared.HideActivityIndicator();
        $("#spin").removeClass('z3000');
        if (!$("#itemDetail").is(":visible")) $("#main-transaction-blockoverlay").removeClass('z2990');

        if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
        self.ProcessGiftSerialNumber(new BaseCollection(response.SerialLotNumbers));
      };

      var onError = function(model, xhr, options) {
        Shared.HideActivityIndicator();
        $("#spin").removeClass('z3000');
        $("#main-transaction-blockoverlay").removeClass('z2990');

        if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
        navigator.notification.alert(xhr, null, "Error", "OK");
      };

      if (!$("#spin").is(":visible")) {
        var message = "Generating serial number(s)...";
        var target = document.getElementById('main-transaction-page');
        Shared.ShowActivityIndicator(target);
        $("<h5>" + message + "</h5>").appendTo($("#spin"));
        $("#spin").addClass('z3000');
        $("#main-transaction-blockoverlay").addClass('z2990').show();
      }


      Shared.SerialNumbers.GenerateGiftSerialNumber(self.model, self.collection, onSuccess, onError, false);
    },

    Hide: function() {
      this.$("#serialLot").remove();
      var isHide = false;
      if ($("#gclookup").is(":visible")) {
        this.ToggleOverlay($("#gclookup").is(":visible"));
      } else {
        this.ToggleOverlay($("#itemDetail").is(":visible"));
        if (!($("#itemDetail").is(":visible"))) isHide = true;
        this.trigger("Close", isHide);
      }
      Shared.FocusToItemScan();
    },

    HideElements: function() {
      if (Global.TransactionType === Enum.TransactionType.SalesRefund || this.model.get("AutoGenerate")) {
        $("#input-serialLot").addClass("ui-disabled");
        $("#add-serialLot").addClass("ui-disabled");
      } else {
        $("#input-serialLot").removeClass("ui-disabled");
        $("#add-serialLot").removeClass("ui-disabled");
      }
    },

    HideSerialList: function() {
      $("#serialLot").removeAttr("style", "top: 10%");
      //$("#serialLot-inner").attr("style", "height:475px !important;")
      $("#serialLot-content").removeAttr("style", "height:200px; overflow:auto;");
      $("#serialLot-list").hide();
    },

    InitializeEvents: function() {
      if (this.collection._callbacks) this.collection.unbind();

      /*Events listener*/
      this.collection.on("doneAdding", this.ProcessAddedData, this);
      this.collection.on("removeSerial", this.ProcessDeletedData, this);
      this.collection.on("removeLot", this.ProcessDeletedData, this);
      this.collection.on('reset', this.EmptySerialList, this);
      this.collection.on('change:SerialRecipient', this.ProcessAddedData, this);
    },

    InitializeGC: function() {
      if (this.itemType == Enum.ItemType.GiftCard || this.itemType == Enum.ItemType.GiftCertificate) {
        switch (this.eventname) {
          case "QuantityOrderedUpdated":
            if (this.model.get("AutoGenerate")) this.GenerateGiftSerialNumber();
            else {
              this.serialListView.Show();
            }
            break;
          case "UnitMeasureUpdated":
            if (this.model.get("AutoGenerate")) this.GenerateGiftSerialNumber();
            else {
              this.CheckUnitMeasureCode();
              this.serialListView.Show();
            }
            break;
          default:
            if (this.IsItemCodeExist(this.model.get("ItemCode"), this.model.get("UnitMeasureCode"))) {
              if (this.model.get("AutoGenerate")) this.GenerateGiftSerialNumber();
              else {
                this.serialListView.Show();
              }
            } else {
              this.serialListView.Show();
            }
            break;
        }
      } else {
        switch (this.eventname) {
          case "UnitMeasureUpdated":
            if (this.model.get("AutoGenerate")) this.GenerateGiftSerialNumber();
            else {
              this.CheckUnitMeasureCode();
              this.serialListView.Show();
            }
            break;
          default:
            this.serialListView.Show();
            break;
        }

      }
    },
    /**
		 Initialize SerialListView

		 @method InitializeSerialList
		 **/
    InitializeSerialList: function(collection, itemCode) {
      var generatedType = null;

      if (this.itemType != Enum.ItemType.GiftCard && this.itemType != Enum.ItemType.GiftCertificate) {
        collection.sort({
          silent: true
        });
        generatedType = this.type;
      }

      if (this.serialListView) {
        this.serialListView.unbind();
        this.serialListView.remove();

        this.serialListView = null
      }

      $("#serialLot-scroll").append("<div id='mainserialLot-scroll'></div>");
      this.serialListView = new SerialListView({
        el: $("#mainserialLot-scroll"),
        collection: collection,
        type: generatedType,
        lineNum: this.lineNum,
        itemCode: itemCode,
        uom: this.uom,
        itemType: this.itemType,
        autoGenerate: (this.autoGenerate) ? this.autoGenerate : this.model.get("AutoGenerate")
      });
    },

    IsItemCodeExist: function(criteria1, criteria2) {

      //if(eventname === "QuantityOrderedUpdated" && eventname != this.eventName) return true;
      //else if(Shared.IsNullOrWhiteSpace(eventname) && Shared.IsNullOrWhiteSpace(this.eventName)){
      //	return true;
      //} else if (Shared.IsNullOrWhiteSpace(eventname) && (!Shared.IsNullOrWhiteSpace(this.eventName) && this.eventName === "ItemDetail")) {
      //    return true;
      //} else return false;
      if (this.collection.length === 0) return true;

      var existing = this.collection.filter(function(model) {
        return model.get("ItemCode") === criteria1 && model.get("UnitMeasureCode") === criteria2;
      });

      if (existing.length > 0) return false;
      return true;
    },

    LoadData: function() {
      this.InitializeSerialList(this.ProcessItemType(this.collection), this.itemCode);
    },

    LoadItem: function() {
      var self = this;
      var model = new BaseModel();

      model.url = Global.ServiceUrl + Service.PRODUCT + Method.LOADITEMDETAILBYCODE + this.model.get("ItemCode");
      model.fetch({
        success: function(model, response, options) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          self.autoGenerate = response.ItemDetails[0].AutoGenerate;
          if (self.autoGenerate) {
            self.GenerateGiftSerialNumber();
          }


          /*Initialize Stuff*/
          self.InitializeSerialList(self.collection, self.itemCode);
        }
      })
    },

    PopulateSerialRecipient: function(OriginalSerialRecipient, SerialRecipient) {
      var email = "";

      if (Shared.IsNullOrWhiteSpace(OriginalSerialRecipient) && Shared.IsNullOrWhiteSpace(SerialRecipient)) {
        email = Global.DefaultContactEmail || "";
      } else if (!Shared.IsNullOrWhiteSpace(OriginalSerialRecipient) && Shared.IsNullOrWhiteSpace(SerialRecipient)) {
        email = SerialRecipient;
      } else {
        email = SerialRecipient || Global.DefaultContactEmail;
      }

      return email;
    },

    ProcessAddedData: function(model) {
      this.serialListView.ProcessAddedData(model);
    },

    ProcessDeletedData: function(model) {
      this.collection.remove(model);

      this.collection.each(function(serial, i) {
        if (serial.get("SerialLotCode") != i + 1) serial.set({
          SerialLotCode: i + 1
        });
      });
    },

    /**
		 Check if data input length is greater than 6.

		 @method RefreshListView
		 **/
    ProcessAddSerialLotNumber: function(data) {
      if (!this.AllowedToAddSerial()) return;
      if (Shared.IsNullOrWhiteSpace(data)) data = $("#input-serialLot").val();
      if (data.length < 6) {
        navigator.notification.alert("Please enter at least 6 characters.", null, "Incorrect Input", "OK");
        return;
      }

      if (this.model.get("QuantityOrdered") > 0) {
        if (!this.isProcessing) {
          this.isProcessing = true;
          this.AddSerialLotNumber(data,
            this.itemCode,
            this.lineNum,
            this.itemType,
            this.collection.length + 1,
            this.type,
            this.uom,
            false,
            false,
            false,
            this.PopulateSerialRecipient("", ""),
            false,
            this.model);
        }

        //Global.CurrentCustomerEmailChanged = false;
      } else {
        if (this.model.get("ItemType") === "Gift Card" || this.model.get("ItemType") === "Gift Certificate") {
          navigator.notification.alert("Adding Serial for GiftCard / Certificate\nwhen Quantity Ordered is negative is not allowed", null, "Negative Quantity not Allowed", "OK");
          return;
        }
      }
    },

    ProcessGiftSerialNumber: function(collection) {
      var self = this,
        colLength = 0;
      if (collection.length > 0) {
        this.collection.reset();
        this.AddSerialLotNumberByBatch(collection);
        //Global.CurrentCustomerEmailChanged = false;
      }
    },

    ProcessItemType: function(collection) {
      var self = this;

      collection.each(function(model) {
        var itemType = self.CompareCurrentData("ItemType", "ItemCode", model.get("ItemCode"))

        model.set({
          ItemType: itemType
        });
      });

      return collection;
    },

    ProcessSelectedSerial: function(model) {
      this.AddSerialLotNumber(model.get("SerialLotNumber"),
        model.get("ItemCode"),
        this.model.get("LineNum"),
        this.itemType,
        this.collection.length + 1,
        this.type,
        this.uom,
        model.get("IsReturned"),
        model.get("IsActivated"),
        model.get("IsGenerated"),
        model.get("SerialRecipient"),
        model.get("IsIncluded"),
        model);
    },

    ProcessValidateSerial: function(toBeAdded, type) {
      var self = this;

      var onSuccess = function(model, response, options) {
        if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
        if (!self.ErrorHandler(model, response, options)) return;
        self.collection.add(toBeAdded);
        self.collection.trigger('startRendering');
        self.isProcessing = false;
      };

      var onError = function(model, response, options) {
        if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
        self.ErrorHandler(model, response, options);
      };

      if (this.FindSerialLotNumberDuplicate(toBeAdded, (type === Enum.ItemType.GiftCard || type === Enum.ItemType.GiftCertificate))) {
        switch (type) {
          case Enum.ItemType.GiftCertificate:
          case Enum.ItemType.GiftCard:
            if (Global.TransactionType == Enum.TransactionType.UpdateInvoice)
              if (this.AllowSerialToBeAdded(toBeAdded, onSuccess)) return;
            this.ValidateGiftCardCertificateSerial(toBeAdded, onSuccess);
            break;
          default:
            if (toBeAdded.SerialLotType != Enum.SerialLotType.Lot && Global.TransactionType != Enum.TransactionType.SalesRefund) {
              Shared.SerialNumbers.GetSerialLotNumberDuplicate(toBeAdded.ItemCode, toBeAdded.SerialLotNumber, (Global.TransactionCode) ? Global.TransactionCode : 'To be generated', onSuccess, onError);
            } else {
              this.collection.add(toBeAdded);
              this.collection.trigger('startRendering');
              this.isProcessing = false;
            }
            break;
        }
      } else {
        navigator.notification.alert(this.type + " number you entered already exist. Try adding different " + this.type + " number.", null, "Duplicate " + this.type + " Number", "OK");
        this.isProcessing = false;
      }
    },

    AllowSerialToBeAdded: function(toBeAdded, onSuccess) {
      if (!Global.invDetailSerialCollection) return false;
      var serialFromInvoice = Global.invDetailSerialCollection.find(function(model) {
        return model.get("ItemCode") == toBeAdded.ItemCode && model.get("SerialLotNumber").toLowerCase() == toBeAdded.SerialLotNumber.toLowerCase();
      });

      if (!serialFromInvoice) return false;

      var serialFromCurrentCollection = this.collection.find(function(model) {
        return model.get("ItemCode") == toBeAdded.ItemCode && model.get("SerialLotNumber").toLowerCase() == toBeAdded.SerialLotNumber.toLowerCase();
      });

      if (serialFromCurrentCollection) return false;
      serialFromInvoice.set({
        ItemType: toBeAdded.ItemType
      })
      this.collection.add(serialFromInvoice.attributes);
      this.collection.trigger('startRendering');
      this.isProcessing = false;
      return true;
    },

    RemoveGCSerial: function() {
      var filteredCollection = this.collection.filter(function(model) {
        return model.get("ItemType") != Enum.ItemType.GiftCard && model.get("ItemType") != Enum.ItemType.GiftCertificate;
      });

      if (filteredCollection) {
        this.collection.reset(filteredCollection);
      } else return;
    },

    RenderSerialForReturn: function() {
      var self = this;

      this.collection.each(function(model) {
        model.set({
          ItemType: self.CompareCurrentData("ItemType", "ItemCode", model.get("ItemCode"), model.get("UnitMeasureCode"))
        });
      });

      /*Initialize Stuff*/
      this.InitializeSerialList(this.collection, this.itemCode);
      this.serialListView.Show();
    },

    RetrieveSerialNumberList: function(customerCode, itemCode, lineNum, documentCode, documentType) {
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
          if (!Shared.IsNullOrWhiteSpace(response.SerialLotNumbers)) {
            if (!Shared.IsNullOrWhiteSpace(response.ErrorMessage)) {
              navigator.notification.alert(response.ErrorMessage, null, "Error", "OK");
              return;
            }

            gcSerialNumberCollection.reset(response.SerialLotNumbers);
            self.ShowSerialNumberList(gcSerialNumberCollection);
          } else self.Hide();
        },

        error: function(model, xhr, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          navigator.notification.alert("Error retrieving SerialLotNumber List.", null, "Error", "OK");
          return;
        }
      });
    },

    RetrieveUnitMeasureCode: function(lineNum, itemCode) {
      var unitMeasureCode = this.cartCollection.find(function(cart) {
        return cart.get("LineNum") === lineNum && cart.get("ItemCode") === itemCode;
      });

      if (unitMeasureCode) {
        return unitMeasureCode.get("UnitMeasureCode");
      } else {
        return "";
      }
    },

    Show: function() {
      if (this.ValidateQuantity()) {
        this.render();
        $("#main-transaction-blockoverlay").show();
        this.InitializeSerialList(this.ProcessItemType(this.collection), this.itemCode);
        this.InitializeGC();
        //this.InitializeSerialList(this.ProcessItemType(this.collection), this.itemCode); //this.InitializeGC();
        //if (this.model.get("AutoGenerate")) this.GenerateGiftSerialNumber();
        //else { this.serialListView.Show(); }

        //if (Global.CurrentCustomerEmailChanged) this.UpdateEmail();

        if (Global.TransactionType === Enum.TransactionType.SalesRefund ||
          Global.TransactionType === Enum.TransactionType.Recharge) {
          this.RenderSerialForReturn();
          if (this.itemType != Enum.ItemType.GiftCard && this.itemType != Enum.ItemType.GiftCertificate && Global.TransactionType != Enum.TransactionType.UpdateInvoice) this.ShowSerialNumberList(this.serialList);
        }

        Shared.BlurItemScan();
        if (!this.IsSerialListEmpty) this.ToggleOverlay();
        this.IsSerialListEmpty = false;
      } else {
        navigator.notification.alert("Adding Serial for GiftCard / Certificate\nwhen Quantity Ordered is negative is not allowed", null, "Negative Quantity not Allowed", "OK");
      }
    },

    ShowSerialNumberList: function(serialCollection) {
      $("#serialLot").attr("style", "top: 10%");
      //$("#serialLot-inner").attr("style", "height:475px !important;")
      $("#serialLot-content").attr("style", "height:200px; overflow:auto;");

      var listsView = new ListsView({
        el: $("#serialLot-inner"),
        collection: serialCollection,
        serial: this.collection,
        view: this
      });

      listsView.on('selected', this.ProcessSelectedSerial, this);
      listsView.on('hideSerialList', this.HideSerialList, this);
    },

    ToggleOverlay: function(isHide) {
      var divLayers = {
        SerialLot: "#serialLot",
        ItemDetail: "#itemDetail",
        GCList: "#gclookup",
        ProductLookup: "#lookup",
        MainOverlay: "#main-transaction-blockoverlay"
      };

      var isItemDetailVisible = $(divLayers.ItemDetail).is(":visible");
      var isGCListVisible = $(divLayers.GCList).is(":visible");
      var isOverlayVisible = $(divLayers.MainOverlay).is(":visible");
      var isProductLookupVisible = $(divLayers.ProductLookup).is(":visible");

      if (isItemDetailVisible || isGCListVisible) {
        if (isHide) {
          $(divLayers.SerialLot).removeClass('z3000');
          $(divLayers.MainOverlay).removeClass('z2990');
          $(divLayers.MainOverlay).show();
        } else {
          $(divLayers.SerialLot).addClass('z3000');
          $(divLayers.MainOverlay).addClass('z2990');
          $(divLayers.MainOverlay).show();
        }
      } else {
        if (!Shared.IsNullOrWhiteSpace(isHide)) {
          $(divLayers.MainOverlay).hide();
        } else {
          if (!isOverlayVisible) $(divLayers.MainOverlay).show();
        }
      }
    },

    UpdateEmail: function() {
      this.collection.each(function(mdl) {
        var email = mdl.get("SerialRecipient");
        var origEmail = mdl.get("OriginalSerialRecipient");
        var isModified = (mdl.get("IsEmailModified")) ? true : false;
        mdl.set({
          SerialRecipient: Global.DefaultContactEmail,
          OriginalSerialRecipient: email
        });
      })
    },

    ValidateClosingSerial: function(serialLotCollection, cartCollection, msg) {
      var errMsg = msg;
      var errCounter = 0;
      var self = this;
      //var cart = cartCollection.filter( function(model) {
      //	return (model.get("ItemType") === Enum.ItemType.GiftCard || model.get("ItemType") === Enum.ItemType.GiftCertificate);
      //});

      var isGC = (this.model.get("ItemType") === Enum.ItemType.GiftCard || this.model.get("ItemType") === Enum.ItemType.GiftCertificate);

      if (serialLotCollection) {
        if (isGC) {
          var isSerialEqual = false;
          var serial = serialLotCollection.filter(function(model) {
            return (model.get("ItemCode") === self.model.get("ItemCode") && model.get("UnitMeasureCode") === self.model.get("UnitMeasureCode") && model.get("LineNum") === self.model.get("LineNum"));
          });

          if (Global.TransactionType === Enum.TransactionType.SalesRefund) {
            var isIncluded = _.filter(serial, function(srl) {
              return (srl.get("IsIncluded")) ? true : false;
            });

            isSerialEqual = (isIncluded.length === (this.model.get("Good") * this.model.get("UnitMeasureQty")));
          } else isSerialEqual = (serial.length === (this.model.get("QuantityOrdered") * this.model.get("UnitMeasureQty")));

          if (!isSerialEqual) errCounter++;

          if (errCounter > 0) return errMsg;
          else return;
        }
      }

      return;
    },

    ValidateSerialLot: function(serialLotCollection, cartCollection, msg) {
      var errMsg = msg;
      var errCounter = 0;
      var self = this;
      //var cart = cartCollection.filter( function(model) {
      //	return ((model.get("ItemType") === Enum.ItemType.GiftCard || model.get("ItemType") === Enum.ItemType.GiftCertificate) && model.get("ItemCode") === self.itemCode)
      //});
      var isGC = (this.model.get("ItemType") === Enum.ItemType.GiftCard || this.model.get("ItemType") === Enum.ItemType.GiftCertificate);

      if (serialLotCollection) {
        if (isGC) {
          //for(var i = 0; i < cart.length; i++) {
          //	var gcCart = cart[i];
          //	var serialCounter = 0;
          //	var serialLot     = false;
          //	var serial = serialLotCollection.filter( function(model) {
          //	    return (model.get("ItemCode") === gcCart.get("ItemCode")
          //            && model.get("UnitMeasureCode") === gcCart.get("UnitMeasureCode")
          //            && model.get("IsSerialGenerated") === false
          //            && gcCart.get("ItemType") === model.get("ItemType")
          //            && model.get("LineNum") === gcCart.get("LineNum"));
          //	});

          //	serialLot = (serial.length != (gcCart.get("QuantityOrdered")));
          //	if(!serialLot) errCounter++;
          //}

          var gcCart = this.model;
          var serialCounter = 0;
          var serialLot = false;
          var serial = serialLotCollection.filter(function(model) {
            return (model.get("ItemCode") === gcCart.get("ItemCode") && model.get("UnitMeasureCode") === gcCart.get("UnitMeasureCode") && model.get("IsSerialGenerated") === false && gcCart.get("ItemType") === model.get("ItemType") && model.get("LineNum") === gcCart.get("LineNum"));
          });

          serialLot = (serial.length != (gcCart.get("QuantityOrdered") * gcCart.get("UnitMeasureQty")));
          if (!serialLot) errCounter++;

          if (errCounter > 0) return errMsg;
          else return;
        }
      }
    },

    ValidateAddSerialLot: function(toBeAdded, itemType) {
      if (!toBeAdded.IsSerialGenerated && (itemType == Enum.ItemType.GiftCard || itemType == Enum.ItemType.GiftCertificate)) { // non-generated serial
        try {
          var msg = "The following items do not have the same number of serial numbers with the shipped quantity.";
          var errMsg = this.ValidateSerialLot(this.collection, this.cartCollection, msg);

          if (errMsg == undefined || errMsg == "") return true;
          else {
            this.isProcessing = false;
            throw errMsg;
          }
        } catch (err) {
          navigator.notification.alert(err, null, "Action not Allowed", "OK");
          this.isProcessing = false;
          return false;
        }
      }
      return true;
    },

    ValidateGiftCardCertificateSerial: function(toBeAdded, onSuccess, onError) {
      var self = this;
      var mdl = new BaseModel();

      mdl.url = Global.ServiceUrl + Service.SOP + 'validategiftcardcertificateserial/' + toBeAdded.SerialLotNumber;
      mdl.fetch({
        success: function(model, response, options) {
          options = {
            serialLotNumber: toBeAdded.SerialLotNumber
          };
          onSuccess(model, response, options);
        },
        error: function(model, response, options) {
          self.ErrorHandler(model, response, options);
        }
      });
    },

    ValidateQuantity: function() {
      if (this.model.get("QuantityOrdered") < 0) {
        if (this.model.get("ItemType") === Enum.ItemType.GiftCertificate || this.model.get("ItemType") === Enum.ItemType.GiftCard) {
          return false;
        }
      }
      return true;
    }
  });

  return SerialLotView;
})
