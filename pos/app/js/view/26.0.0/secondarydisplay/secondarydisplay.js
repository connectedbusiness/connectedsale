/**
 * Connected Business - 5/09/2013
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
  'collection/base',
  'collection/cart',
  'collection/workstations',
  'view/26.0.0/secondarydisplay/cart',
  'view/26.0.0/secondarydisplay/options',
  'view/26.0.0/secondarydisplay/workstations/workstations',
  'view/26.0.0/pos/signature/signature',
  'view/26.0.0/pos/giftcard/giftcard',
  'text!template/26.0.0/secondarydisplay/secondarydisplay.tpl.html',
  'js/libs/signalr/jquery.signalR-2.0.3.js'
], function(
  $, $$, _, Backbone,
  Global, Service, Method, Shared,
  BaseModel, BaseCollection, CartCollection, WorkstationCollection,
  CartView, OptionsView, WorkstationListView, SignatureView, GiftCardView,
  template
) {
  var SecondaryDisplayView = Backbone.View.extend({
    _SecondaryDisplayTemplate: _.template(template),

    events: {
      "tap .secondarydisplay-page .header-btn": "btnClick_Options",
    },

    InitializeChildViews: function() {
      this.InitializeCart();
      this.InitializeOptionsView();
      $('body, html, a').on('tap', this.outsideMenuHandler);
    },

    render: function() {
      this.LoadAdvertisements();
      this.$el.html(this._SecondaryDisplayTemplate(this.GetCompanyInformation().toJSON()));
      this.ShowWorkstationListView();
      return this;
    },

    outsideMenuHandler: function() {
      $(".deletebtn-overlay").hide();
      $(".popover").hide();
      $("#lookup-search").blur();
    },

    remove: function() {
      // Clean up after ourselves.
      $('body, html,a').off('tap', this.outsideMenuHandler);
      Backbone.View.prototype.remove.call(this);
    },

    InitializeCart: function() {
      this.InitializeCartCollection();
      this.cartView = new CartView({
        el: $("#secondarydisplay-cart"),
        collection: this.cartCollection,
      });
    },

    InitializeCartCollection: function() {
      if (this.cartCollection) {
        this.cartCollection.reset();
      } else this.cartCollection = new CartCollection();
    },

    InitializeOptionsView: function() {
      this.optionsView = new OptionsView();
      this.optionsView.on("ShowConnectToOptions", this.ShowConnectToOptions, this);
      this.optionsView.on("BackToDashboard", this.BackToDashboard, this);
      this.$(".main-toolbar-header").append(this.optionsView.render().el);
    },

    GetCompanyInformation: function() {
      var compName = Global.CompanyName.replace(/[^a-z0-9\s]/gi, '').replace(/[_\s]/g, ' ')
      var imageLocation = Global.ServiceUrl + Method.COMPANYIMAGE + Global.CompanyName + '.png';
      var ads = Global.ServiceUrl + "Ads/";
      return new BaseModel({
        CompanyName: Global.CompanyName,
        CompanyLogo: imageLocation,
        AdsSource: ads
      });
    },

    ShowConnectToOptions: function() {
      this.ShowWorkstationListView();
    },

    ShowWorkstationListView: function() {
      if (this.workstationListView) {
        this.$(".blockOverlay").show();
        this.workstationListView.Show();
      } else {
        this.InitializeWorkstationListView();
        this.ShowWorkstationListView();
      }
    },

    HideWorkstationListView: function() {
      if (this.workstationListView) {
        this.workstationListView.Close();
      }
    },

    InitializeWorkstationListView: function() {
      this.InitializeWorkstationCollection();
      this.workstationListView = new WorkstationListView({
        el: this.$(".workstationContainer"),
        collection: this.workstationCollection
      });
      this.workstationListView.on("ViewClosed", this.WorkstationListView_Closed, this);
    },

    InitializeWorkstationCollection: function() {
      if (!this.workstationCollection) {
        this.workstationCollection = new WorkstationCollection();
        this.workstationCollection.on("selected", this.WorkstationSelected, this);
      }
    },

    WorkstationListView_Closed: function(view) {
      this.$(".blockOverlay").hide();
    },

    WorkstationSelected: function(model) {
      this.HideWorkstationListView();
      Global.WorkStationPreference = new BaseModel();
      Global.WorkStationPreference = model;
      //console.log("Allow sale item : " + Global.WorkStationPreference.get("AllowTaxOnLineItems"));
      if (this.WorkstationID != model.get("WorkstationID")) {
        this.ResetCart();
        this.WorkstationID = model.get("WorkstationID");
        //this.MonitorTransaction(this.WorkstationID);
        this.StartMonitoring(this.WorkstationID);
      }
    },

    MonitorTransaction: function(workstationID) {
      if (!Shared.IsNullOrWhiteSpace(workstationID)) {
        this.BeginLoadCurrentTransaction(workstationID);
      }
    },

    BeginLoadCurrentTransaction: function(workstationID) {
      if (this.cartTimeInterval) this.StopCartTimeInterval();

      this.cartTimeInterval = window.setInterval( function () {
        this.LoadCurrentTransaction(workstationID);
      }.bind(this), 250);
    },

    StartMonitoring: function(workstationID) {
      var url = Global.ServiceUrl + 'signalr';

      this.logCurrentHub = $.hubConnection(url, {
        useDefaultPath: false
      });

      this.logCurrentProxy = this.logCurrentHub.createHubProxy('secondaryDisplayHub');

      this.logCurrentProxy.on('logCurrentTransaction', function(response) {
        this.LoadCurrentTransaction(response);
      }.bind(this));

      this.logCurrentHub.start().done(function(response) {
        console.log(response.message);
        this.logCurrentHubStarted = true;
        this.logCurrentHubID = response.id;
        this.logCurrentProxy.invoke('joinGroup', workstationID);
      }.bind(this)).fail(function(response) {
        console.log(response.message);
        this.logCurrentHubStarted = false;
      });
    },

    StopMonitoring: function() {
      this.logCurrentHub.stop();

      this.logCurrentHubStarted = false;
      this.logCurrentHub = null;
      this.logCurrentProxy = null;
      this.logCurrentHubID = null;
    },

    LogCurrentTransaction: function(sopGroup, type) {
      this.logCurrentProxy.invoke('logCurrentTransaction', sopGroup.toJSON(), this.logCurrentHubID, this.WorkstationID).done(function(response) {
        if (type == 'SIGNATURE') this.LogCurrentSignature(sopGroup);
        else if (type == 'PIN') this.LogCurrentPIN(sopGroup);

        this.ClearGlobalDeclarations();
      }.bind(this)).fail(function(response) {
        navigator.notification.alert(response, null, 'Error', 'OK');
      });
    },

    LogCurrentSignature: function(sopGroup) {
      this.logCurrentProxy.invoke('logCurrentSignature', sopGroup.toJSON(), this.logCurrentHubID, this.WorkstationID).done(function(response) {
        console.log(response);
      }).fail(function(response) {
        navigator.notification.alert(response, null, 'Error', 'OK');
      });
    },

    LogCurrentPIN: function(sopGroup) {
      this.logCurrentProxy.invoke('logCurrentPIN', sopGroup.toJSON(), this.logCurrentHubID, this.WorkstationID).done(function(response) {
        console.log(response);
        this.HideOverlay();
      }.bind(this)).fail(function(response) {
        navigator.notification.alert(response, null, 'Error', 'OK');
      });
    },

    LoadCurrentTransaction: function(sopGroup) {
      if (Shared.IsNullOrWhiteSpace(sopGroup)) {
        navigator.notification.alert('The secondary display seems to have encountered a(n) error.', null, 'Error', 'OK');
        return;
      }

      if (sopGroup.WorkstationID != this.WorkstationID) {
        navigator.notification.alert('Workstation ID mismatch. Try again by selecting the correct Workstation ID.', null, 'Error', 'OK');
        return;
      }

      var askSign = (sopGroup.SOP.AskSignature) ? sopGroup.SOP.AskSignature : false,
        askPIN = (sopGroup.SOP.AskPIN) ? sopGroup.SOP.AskPIN : false;

      this.ManageSignatureView(askSign);
      this.ManageGiftPINView(askPIN, sopGroup.SOP.PINType);

      if (!Shared.IsNullOrWhiteSpace(sopGroup.SOP)) {
        Global.LastResponse = sopGroup;
        this.SetLastRetrievalDate(sopGroup.SOP.DateModified);
        this.GetWorkStationPreference(sopGroup);

        this.cartCollection.reset();
        _.each(sopGroup.SOPDetails, function(details) {
          if (sopGroup.SOPKitDetails) {
            var kitDetails = _.filter(sopGroup.SOPKitDetails, function(kit) {
              return kit.ItemKitCode == details.ItemCode && kit.LineNum == details.LineNum;
            });

            if (kitDetails && kitDetails.length != 0) details.KitDetails = new BaseCollection(kitDetails);
          }

          this.cartCollection.add(details);
        }.bind(this));

        this.cartView.UpdateSummary(sopGroup.SOP);
      } else {
        this.cartCollection.reset();
        this.cartView.UpdateSummary(null);
      }
    },

    /*LoadCurrentTransaction: function(workstationID) {
      var model = new BaseModel({
        WorkstationID: workstationID,
        LastRetrievalDate: this.lastRetrievalDate
      });

      model.SetShowIndicator(false);
      model.url = Global.ServiceUrl + Service.POS + Method.CURRENTTRANSACTION;
      model.save(null, {
        success: function(model, response, options) {
          if (response.SOP != null) {
            Global.LastResponse = response;
            this.SetLastRetrievalDate(response.SOP.DateModified);
            this.ManageSignatureView(response.SOP.AskSignature);
            this.ManageGiftPINView(response.SOP.AskPIN, response.SOP.PINType);
            this.GetWorkStationPreference(response);
            this.cartCollection.reset();
            _.each(response.SOPDetails, function(details) {
              if (response.SOPKitDetails) {
                var kitDetails = _.filter(response.SOPKitDetails, function(kit) {
                  return kit.ItemKitCode == details.ItemCode && kit.LineNum == details.LineNum;
                });

                if (kitDetails && kitDetails.length != 0) details.KitDetails = new BaseCollection(kitDetails);
              }

              this.cartCollection.add(details);
            }.bind(this));
            this.cartView.UpdateSummary(response.SOP);
          }
        }.bind(this),
        error: function(model, error, response) {
          navigator.notification.alert('Error Reading data!', null, 'Error', 'OK');
        }
      });
    },*/

    GetWorkStationPreference: function(response) {
      if (!this.workStationPreferenceCollection) this.workStationPreferenceCollection = new BaseCollection();
      this.workStationPreferenceCollection.reset(response.Preferences);
      Global.WorkStationPreference = this.workStationPreferenceCollection.find(function(preference) {
        return preference.get("WorkstationID") == this.WorkstationID
      }.bind(this));
    },

    EncryptPIN: function(str) {
      if (!str) return str;
      return Base64.encode(str);
    },

    ManageGiftPINView: function(askPIN, pinType) {
      if (pinType) pinType = $.trim(pinType)
      if (!askPIN) {
        if (this.giftPINView) this.giftPINView.Hide();
        this.ClearGlobalDeclarations();
      } else {
        this.ShowOverlay();
        this.InitializeGiftPINView();
        this.giftPINView.viewType = "SecondaryDisplay";
        this.giftPINView.ShowGCardActivationForm(pinType);
      }
    },

    InitializeGiftPINView: function() {
      if (!this.giftPINView) {
        this.giftPINView = new GiftCardView({
          el: $("#giftCardContainer")
        });
        this.giftPINView.on("pinCaptured", this.AttachPINCaptured, this);
      }
    },

    AttachPINCaptured: function(pin) {
      var model = new BaseModel(),
        sop = Global.LastResponse.SOP,
        sopDetails = Global.LastResponse.SOPDetails;

      this.HideOverlay();
      this.ShowOverlay();
      Global.LastResponse.SOP.WorkstationID = this.WorkstationID
      Global.LastResponse.SOP.SignatureDetail = null
      Global.LastResponse.SOP.AskSignature = false;
      Global.LastResponse.SOP.AskPIN = false;
      Global.LastResponse.SOP.PINDetail = this.EncryptPIN(pin);

      model.set(Global.LastResponse);
      model.set({
        WorkstationID: this.WorkstationID,
        SOP: sop,
        SOPDetails: sopDetails
      });

      model.url = Global.ServiceUrl + Service.POS + Method.LOGCURRENTTRANSACTION;
      Global.SVG_ReadyToSave = true;

      /*model.save(null, {
        success: function(model, response) {
          if(!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          if(response.ErrorMessage) navigator.notification.alert(response.ErrorMessage, null, "Error saving current transaction");
          else this.ClearGlobalDeclarations();
          this.HideOverlay();
        }.bind(this),
        error: function(model, error, response){
          if(!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          this.ClearGlobalDeclarations();
          this.HideOverlay();
        }.bind(this)
      });*/
      this.LogCurrentTransaction(model, 'PIN');
    },

    ManageSignatureView: function(askSign) {
      if (!askSign) {
        if (this.signatureView) this.signatureView.Close();
        this.ClearGlobalDeclarations();
        return;
      }

      this.InitializeSignatureView();
      this.signatureView.viewType = "SecondaryDisplay";
      this.signatureView.Show();
    },

    InitializeSignatureView: function() {
      if (!this.signatureView) {
        this.signatureView = new SignatureView({
          el: $("#signatureContainer")
        });

        this.signatureView.on("SignatureAdded", this.AttachSignature, this);
        this.signatureView.on("formClosed", this.SignatureClosed, this);
      }
    },

    SignatureClosed: function() {
      $("#main-transaction-blockoverlay").hide();
    },

    SetLastRetrievalDate: function(date) {
      this.lastRetrievalDate = date;
    },

    LoadAdvertisements: function() {
      this.counter = 0;
      this.adsCollection = new BaseCollection();
      var model = new BaseModel();
      model.url = Global.ServiceUrl + Service.POS + Method.GETADVERTISEMENTS;
      model.fetch({
        success: function(model, response, options) {
          this.adsCollection.reset(response.FileInfoList);
          this.LoadNewAdvertisement();
          if (this.adsCollection.length > 1) {
            this.adsTimeInterval = window.setInterval(function() {
              this.LoadNewAdvertisement()
            }, 5000);
          }
        }.bind(this)
      });
    },

    LoadNewAdvertisement: function() {
      if (this.adsCollection.length == 0) return;
      if (this.counter == this.adsCollection.length) this.counter = 0;

      var adsURL = this.formatADSUrl(this.adsCollection.at(this.counter).get("Name"));

      if (adsURL != "") {
        $('.ads-container').css('background-image', adsURL);
        this.counter++;
      }
    },

    formatADSUrl: function(name) {
      var formatted = Global.ServiceUrl + 'Images/Ads/' + name;
      return 'url(' + formatted + ')';
    },

    btnClick_Options: function(e) {
      e.stopPropagation();
      this.optionsView.Show();
    },

    StopInterval: function() {
      this.StopCartTimeInterval();
      this.StopAdsTimeInterval();
    },

    StopCartTimeInterval: function() {
      window.clearInterval(this.cartTimeInterval);
    },
    StopAdsTimeInterval: function() {
      window.clearInterval(this.adsTimeInterval);
    },

    BackToDashboard: function() {
      this.StopInterval();
      window.location.hash = "dashboard";
    },

    ResetCart: function() {
      this.SetLastRetrievalDate();
      this.cartCollection.reset();
      this.cartView.UpdateSummary();
    },

    //CSL - 15315 : 09.17.13
    AttachSignature: function() {
      if (Global.Signature) this.AssignSignatureDetail();
    },

    AssignSignatureDetail: function() {
      var model = new BaseModel();
      Global.SVG_Hold = new Array();
      Global.SVG_ReadyToSave = false;
      var ExecThis = function() {
        if (!this.IsHoldSVG() && Global.SVG_ReadyToSave) {
          model.save(null, {
            success: function(model, response) {
              if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
              if (response.ErrorMessage) navigator.notification.alert(response.ErrorMessage, null, "Error saving current transaction");
              else this.ClearGlobalDeclarations();
            }.bind(this),
            error: function(model, error, response) {
              if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
            }
          });
        }
      }.bind(this);

      Global.LastResponse.SOP.WorkstationID = this.WorkstationID
      Global.LastResponse.SOP.SignatureDetail = this.ValidateSVG(Global.Signature, ExecThis);
      Global.LastResponse.SOP.AskSignature = false;

      var sop = Global.LastResponse.SOP
      var sopDetails = Global.LastResponse.SOPDetails

      model.set(Global.LastResponse)
      model.set({
        WorkstationID: this.WorkstationID,
        SOP: sop,
        SOPDetails: sopDetails,
      });

      model.url = Global.ServiceUrl + Service.POS + Method.LOGCURRENTTRANSACTION;
      Global.SVG_ReadyToSave = true;
      //ExecThis();
      if (!this.IsHoldSVG() && Global.SVG_ReadyToSave) {
        this.LogCurrentTransaction(model, 'SIGNATURE');
      }
    },

    ShowOverlay: function() {
      $("#main-transaction-blockoverlay").show();
    },
    HideOverlay: function() {
      $("#main-transaction-blockoverlay").hide();
    },

    ClearGlobalDeclarations: function() {
      Global.Signature = null;
      Global.SVGArray = null;
      this.HideOverlay();
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
        if (Global.SVG_Hold[i] == "ERROR") return true;
      }

      return _err;
    },

    ValidateSVG: function(_svg, ExecThis) {
      if (!_svg) return _svg;

      //Generate ID\
      var tmpId = "[SVGID]:" + Math.random() + '-' + Math.random(),
        tmpLimit = 8000; // assigns limit of characters to be send.

      if (!Global.SVGArray) Global.SVGArray = new Array();

      if (_svg.indexOf("[SVGID]:") !== -1) {
        if (Global.SVGArray[i].ID = _svg) _svg = Global.SVGArray[i].SVG;
      } else Global.SVGArray[Global.SVGArray.length] = {
        ID: tmpId,
        SVG: _svg
      };

      if (_svg.length <= tmpLimit) return _svg;

      var tmpCount = 0,
        tmpPart = 0,
        tmpArray = new Array();

      for (var resume = true; resume;) {
        tmpCount++;
        tmpPart++;

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

        var svgModel = new BaseModel({
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
      return tmpId;
    },

    SaveSVG: function(svgArray, partNum, ExecThis) {
      if (svgArray.length == 0) return;
      if (partNum > svgArray[0].get('PartCount')) return;

      var partCount = svgArray[0].get('PartCount');

      for (var i = 0; i < svgArray.length; i++) {

        var svgModel = svgArray[i];
        if (svgModel.get('PartNumber') == partNum && !this.SVGHasError()) {

          svgModel.save(svgModel, {
            success: function(model, response) {
              if (response.Value) {
                for (var i = 0; i < Global.SVG_Hold.length; i++) {
                  if (Global.SVG_Hold[i] == model.get('SignatureID') + "OF" + model.get('PartNumber')) Global.SVG_Hold[i] = "";
                }

                ExecThis();
                this.SaveSVG(_svgArray, (_partNum + 1), ExecThis);
              }
            }.bind(this),
            error: function(model, error, response) {
              for (var i = 0; i < Global.SVG_Hold.length; i++) {
                if (Global.SVG_Hold[i] == model.get('SignatureID') + "OF" + model.get('PartNumber')) Global.SVG_Hold[i] = "ERROR";
              }

              ExecThis();
              navigator.notification.alert("An error was encoutered while trying to save signatures.", null, "Error Saving Signature", "OK");
            }
          });
        }
      }
    }
  });

  return SecondaryDisplayView;
})
