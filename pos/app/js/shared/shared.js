define([
  'jquery',
  'shared/global',
  'shared/enum',
  'shared/service',
  'shared/method',
  'model/base',
  'model/reportsetting',
  'collection/base',
  'view/spinner',
  'js/libs/jquery.numeric.js',
  'js/libs/datepicker.js',
  //'js/libs/timepicker.js',
  'js/libs/moment.min.js'
], function($, Global, Enum, Service, Method,
  BaseModel, ReportSettingModel,
  BaseCollection,
  Spinner) {
  var printingInProgress = false;
  var Shared = {
    CompareVersions: function(versionA, versionB) {
      versionA = this.GetVersionAttributes(versionA);
      versionB = this.GetVersionAttributes(versionB);

      if (versionA.Major == versionB.Major) {
        if (versionA.Minor == versionB.Minor) {
          if (versionA.Build == versionB.Build) {
            return 0;
          } else if (versionA.Build > versionB.Build) {
            return 1;
          } else {
            return 2;
          }
        } else if (versionA.Minor > versionB.Minor) {
          return 1;
        } else {
          return 2;
        }
      } else if (versionA.Major > versionB.Major) {
        return 1;
      } else {
        return 2;
      }
    },

     CompareMajorMinorVersions: function(versionA, versionB) {
      versionA = this.GetVersionAttributes(versionA);
      versionB = this.GetVersionAttributes(versionB);

      if (versionA.Major == versionB.Major) {
        if (versionA.Minor == versionB.Minor) {
           return 0;
        } else if (versionA.Minor > versionB.Minor) {
          return 1;
        } else {
          return 2;
        }
      } else if (versionA.Major > versionB.Major) {
        return 1;
      } else {
        return 2;
      }
    },



    GetSaleCreditCardTransactionType: function() {
      if (Global.TransactionType == Enum.TransactionType.Sale ||
        Global.TransactionType == Enum.TransactionType.UpdateInvoice ||
        Global.TransactionType == Enum.TransactionType.ResumeSale ||
        Global.TransactionType == Enum.TransactionType.SalesPayment) {
        //return 'Auth/Capture'
        if (Global.AllowSaleCreditPreference == true) return 'Sale';
        else return 'Auth/Capture'
      }
    },

    //GEMINI : CSL-4862
    /*
     * Transferred by Alexis Banaag
     */
    GetVersionAttributes: function(_version) {
      var _versionAttr = {
        Major: 0,
        Minor: 0,
        Build: 0,
        Interim: 0
      };
      if (!_version) return _versionAttr;
      _version = _version + "."
      var _dot = 0;
      var _val = "0";
      var _numbers = "0123456789";
      var _curr = "";
      for (var i = 0; i < _version.length; i++) {
        _curr = _version.substr(i, 1);
        if (_curr == ".") {
          _dot = _dot + 1;
          if (_dot == 1) _versionAttr.Major = parseFloat(_val); //MAJOR
          if (_dot == 2) _versionAttr.Minor = parseFloat(_val); //MINOR
          if (_dot == 3) _versionAttr.Build = parseFloat(_val); //BUILD
          if (_dot == 4) _versionAttr.Interim = parseFloat(_val); //INTERIM
          _val = "0";
        } else {
          if (_numbers.indexOf(_curr) > -1) {
            _val = _val + _curr;
          }
        }
      }
      return _versionAttr;
    },

    HideActivityIndicator: function() {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      _spinner = Spinner;
      _spinner.stop();
      $("#spin").remove();
    },

    IsNullOrWhiteSpace: function(str) {
      if (!str) return true;
      if (str === "" || str === null || str === undefined) return true;
      return false;
    },

    ShowHideClassTemplates: function(element) {
      $("#" + element).hide();
    },

    ShowHideOrderNotes: function(element, isHide) {
      if (isHide) {
        $("#" + element).hide();
      } else $("#" + element).show();
    },

    ShowHideBlockOverlay: function(isShow) {
      if (isShow) {
        $("#main-transaction-blockoverlay").show();
      } else {
        $("#main-transaction-blockoverlay").hide();
      }
    },

    LockTransactionScreen: function(lock, message) {
      switch (lock) {
        case true:
          $("#main-transaction-blockoverlay").show();
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

    ShowOverlayIfTransactionsViewIsVisible: function() {
      var transCont = $('#transactionsContainer');
      if (transCont.length == 0) return;
      if (!transCont.is(':visible') || transCont.css('display') == 'none' || transCont.html().trim() == '') return;
      console.log('Force Show Overlay');
      $("#main-transaction-blockoverlay").show();
    },

    ShowActivityIndicator: function(target) {
      if (!target) {
        target = document.getElementById('main-transaction-page');
      }
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

    ValidateEmailFormat: function(email) {
      var emailcheck = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i;
      return (email.search(emailcheck) == -1);
    },

    ValidateUrlFormat: function(url, allowNull) {
      //var urlCheck1 = /^(www)\.(((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:)*@)?(((\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5])\.(\d|[1-9]\d|1\d\d|2[0-4]\d|25[0-5]))|((([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|\d|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.)+(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])*([a-z]|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])))\.?)(:\d*)?)(\/((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)+(\/(([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)*)*)?)?(\?((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|[\uE000-\uF8FF]|\/|\?)*)?(\#((([a-z]|\d|-|\.|_|~|[\u00A0-\uD7FF\uF900-\uFDCF\uFDF0-\uFFEF])|(%[\da-f]{2})|[!\$&'\(\)\*\+,;=]|:|@)|\/|\?)*)?$/i;
      //var urlCheck2 = /^(http|https|ftp):\/\/[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i; //http://stackoverflow.com/questions/2568842/jquery-url-validator
      var urlCheck3 = /^(www)\.[a-z0-9]+([\-\.]{1}[a-z0-9]+)*\.[a-z]{2,5}(:[0-9]{1,5})?(\/.*)?$/i;

      if (allowNull) {
        if (!url) return false;
        if ($.trim(url).length == 0) return false;
      }

      url = this.TrimUrl(url);

      if (!urlCheck3.test(url)) {
        return true;
      } else {
        return false;
      }
    },

    //removes https, and http from url given
    TrimUrl: function(url) {
      url = $.trim(url);
      if (this.HasCharacters(url, "http://") < 0 && this.HasCharacters(url, "https://") < 0) {
        return url;
      } else if (this.HasCharacters(url, "http://") == 0) { //url has http://
        return url.replace('http://', '');
      } else if (this.HasCharacters(url, "https://") == 0) { //url has https://
        return url.replace('https://', '');
      }
      return url;
    },

    HasCharacters: function(str, characterToFind) {
      return str.indexOf(characterToFind);
    },

    CreditCard: {
      CleanArray: function(actual) {
        var newArray = new Array();
        for (var i = 0; i < actual.length; i++) {
          if (actual[i]) {
            newArray.push(actual[i]);
          }
        }
        return newArray;
      },

      ClearCreditCardInfo: function() {
        $("#expDate").val("");
        $("#cardName").val("");
        $("#track1").text("");
        $("#track2").text("");
        $("#ksn").text("");
        $("#magnePrint").text("");
        $("#magnePrintStatus").text("");
        $("#cc-msg").text("Please swipe card.");
      },

      ParseCreditCardMagWithValidation: function(cardNumber, isSwiped) {
        this.ClearCreditCardInfo();
        if (cardNumber === null && isSwiped === true) navigator.notification.alert("Unable to get credit card information, please swipe the card again.");
        else if (cardNumber === null && isSwiped === false) navigator.notification.alert("Please enter a valid CC number.");

        var tracks = cardNumber.split("?");
        tracks = this.CleanArray(tracks);

        if (tracks != null && tracks.length > 0) {
          var cardData = tracks[0].split("^");
          if (cardData != null && cardData.length > 0) {
            $('#cardNumber').val(this.ParseCreditCardNumber(cardData[0]));
            if (cardData.length > 1) $('#cardName').val(this.ParseCreditCardName(cardData[1]));
            if (cardData.length > 2) $('#expDate').val(this.ParseExpDate(cardData[2])).addClass("ui-disabled");
            $("#isSwiped").text(true);
            isSwiped = true;
          }

          if (tracks.length > 2) this.ParseEncryptedTrack(tracks);

          if ($('#track1').text() === "" || $('#track2').text() === "") {
            $('#track1').text(tracks[0]);
            $('#track2').text(tracks[1]);
          }

          if ($('#track1').text() === "" ||
            $('#track2').text() === "" ||
            $('#cardNumber').val() === "" ||
            $('#cardName').val() === "" ||
            $("#expDate").val() === "") {
            if (isSwiped) navigator.notification.alert("Unable to get credit card information, please swipe the card again.");
            else navigator.notification.alert("Please enter a valid CC number.");

            this.ClearCreditCardInfo();
            return;
          }

          $("#cc-msg").text("Successfully retrieved card information.");
        }
        return null;
      },

      ParseCreditCardMag: function(cardNumber) {
        this.ClearCreditCardInfo();
        if (cardNumber === null) navigator.notification.alert("Unable to get credit card information, please swipe the card again.");

        var tracks = cardNumber.split("?");
        tracks = this.CleanArray(tracks);
        if (tracks != null && tracks.length > 0) {
          //$('#track1').text(tracks[0] + "?");
          //if (tracks.length > 1) $('#track2').text(tracks[1] + "?");

          var cardData = tracks[0].split("^");
          if (cardData != null && cardData.length > 0) {
            $('#cardNumber').val(this.ParseCreditCardNumber(cardData[0]));
            if (cardData.length > 1) $('#cardName').val(this.ParseCreditCardName(cardData[1]));
            if (cardData.length > 2) $('#expDate').val(this.ParseExpDate(cardData[2])).addClass("ui-disabled");
            $("#isSwiped").text(true);
            if ($('#cardNumber').val() != "") $("#cc-msg").text("Successfully retrieved card information.");
          }

          if (tracks.length > 2) this.ParseEncryptedTrack(tracks);

          if ($('#track1').text() === "" ||
            $('#track2').text() === "" ||
            $('#cardNumber').val() === "" ||
            $('#cardName').val() === "" ||
            $("#expDate").val() === "") {

            navigator.notification.alert("Unable to get credit card information, please swipe the card again.");
            this.ClearCreditCardInfo();
          }
        }
        return null;
      },

      ParseEncryptedTrack: function(track) {
        if (track[track.length - 1] != null && track.length > 0 && track[track.length - 1].indexOf("|") === 0) {
          var encryptedData = track[track.length - 1].split("|");
          // with track 3
          if (encryptedData.length === 13) {
            $('#track1').text(encryptedData[2]);
            $('#track2').text(encryptedData[3]);
            $('#ksn').text(encryptedData[9]);
            $('#magnePrint').text(encryptedData[6]);
            $('#magnePrintStatus').text(encryptedData[5]);
          }
          // without track 3
          else if (encryptedData.length === 12) {
            $('#track1').text(encryptedData[2]);
            $('#track2').text(encryptedData[3]);
            $('#ksn').text(encryptedData[8]);
            $('#magnePrint').text(encryptedData[5]);
            $('#magnePrintStatus').text(encryptedData[4]);
          }
        }
      },

      ParseCreditCardNumber: function(cardNumber) {
        return cardNumber.replace(/[^0-9]+/, "");
      },

      ParseCreditCardName: function(name) {
        if (name != null && name.indexOf("/") >= 0) {
          var nameSplit = name.split("/");
          if (nameSplit != null && nameSplit.length > 0) {
            return nameSplit[1] + " " + nameSplit[0];
          }
        }
        return name;
      },

      ParseExpDate: function(dateToFormat) {
        var year = dateToFormat.substring(0, 2);
        var month = dateToFormat.substring(2, 4);

        dateToFormat = "20" + year + "-" + month;
        return dateToFormat;
      },
    },


    //POS Notification
    ShowNotification: function(message, isWarning, duration, noIcon) {

      var moduleID;
      if (Global.ApplicationType == "POS") moduleID = "#main-transaction-page";
      if (Global.ApplicationType == "Settings") moduleID = "#settings-page";
      if (Global.ApplicationType == "Products") moduleID = "#products-page";
      if (Global.ApplicationType == "Customers") moduleID = "#customers-page";
      if (Global.ApplicationType == "Secondary") moduleID = "#secondary-page";
      if (Global.ApplicationType == "Reports") moduleID = "reportsForm";

      if (!moduleID) return;

      var self = this;
      if (!this.notifications) this.notifications = new BaseCollection();

      var notifModel = new BaseModel();
      notifModel.set({
        notifID: "notif" + notifModel.cid
      });
      var template = '<div id="notification-overlay" class="z3000 notification-overlay-cs14 ' + notifModel.get("notifID") + '"> <center> <div><i class="icon-ok">&nbsp; <span class="message">' + self.Escapedhtml(message || "") + '</span></i></div> </center></div>';
      this.notifications.add(notifModel);

      switch ($(moduleID).is(":visible")) {
        case true:
          $(moduleID).append(template);
          break;
        case false:
          if ($("#main-transaction-page").is(":visible")) {
            $("#main-transaction-page").append(template);
          } else if ($("#settings-page").is(":visible")) {
            $("#settings-page").append(template);
          } else if ($("#products-page").is(":visible")) {
            $("#products-page").append(template);
          } else if ($("#customers-page").is(":visible")) {
            $("#customers-page").append(template);
          } else if ($("#secondary-page").is(":visible")) {
            $("#secondary-page").append(template);
          } else if ($("#reportsForm").is(":visible")) {
            $("#reportsForm").append(template);
          }
          break;
      }

      //$(moduleID).append(template);

      var iNotif = $('.' + notifModel.get("notifID") + ' i');
      var notif = $('.' + notifModel.get("notifID"));

      notif.hide();

      iNotif.removeClass('icon-ok');
      iNotif.removeClass('icon-remove-sign');
      iNotif.removeClass('ok');
      iNotif.removeClass('warn');

      if (isWarning) {
        if (!noIcon) iNotif.addClass('icon-remove-sign');
        iNotif.addClass('warn');
      } else {
        if (!noIcon) iNotif.addClass('icon-ok');
        iNotif.addClass('ok');
      }

      var _height = notif.height();
      var _top = (748 - 35 - _height);

      if (navigator.keyboardIsVisible) {
        notif.css("top", self.GetNotificationTopPosition() + "px");
        notif.css("padding", "10px 20px 3px");
      } else {
        notif.css("padding", "7px 20px 7px");
        notif.css("top", (_top) + 'px');
      }

      var _left = (1024 - notif.width()) / 2;
      notif.css('left', _left + 'px');
      notif.fadeIn();

      notifModel.set({
        Top: _top
      });

      if (!duration) duration = 3000;
      notifModel.removeMe = function() {
        clearTimeout(notifModel.notificationTimeOut);
        clearInterval(notifModel.topPositionChecking);
        notif.fadeOut(1000);
        notif.remove();
        notifModel.set({
          Done: true
        });
      }

      notifModel.topPositionChecking = setInterval(function() {
        if (!navigator.keyboardIsVisible) return;
        self.ToggleNotificationPosition(true);
      }, 100);

      notifModel.notificationTimeOut = setTimeout(function() {
        notifModel.removeMe();
      }, duration);

      notifModel.age = 0;

      var doneNotifs = new Array();
      this.notifications.each(function(model) {
        model.age++;
        if (model.age > (navigator.keyboardIsVisible ? 1 : 3) && !model.get("Done")) { //Maximum of 3 Notifications
          model.removeMe();
        }

        if (notifModel.get("notifID") == model.get("notifID")) return;
        if (model.get("Done")) doneNotifs[doneNotifs.length] = model;
        else {
          var _exTop = model.get("Top") - _height - 20;
          model.set({
            Top: _exTop
          });

          var prevNotif = $('.' + model.get("notifID"));
          prevNotif.css('top', _exTop + 'px');
          prevNotif.css('opacity', '0.8');
        }
      });

      //Remove finished notifications
      if (doneNotifs.length > 0) {
        for (var i in doneNotifs) {
          this.notifications.remove(doneNotifs[i]);
        }
      }
      doneNotifs = null;
    },

    ToggleNotificationPosition: function(isKeyboardVisible) {
      if (!this.notifications) return;

      var lastNotif = this.notifications.last();
      if (!lastNotif) return;
      if (lastNotif.get("Done")) return;

      var notif = $("." + lastNotif.get("notifID"));
      if (isKeyboardVisible) {
        notif.css("top", this.GetNotificationTopPosition() + "px");
        notif.css("padding", "10px 20px 3px");
      } else {
        notif.css("padding", "7px 20px 7px");
        var _top = (748 - 35 - notif.height());
        notif.css("top", (_top) + 'px');
      }
    },

    GetNotificationTopPosition: function() {
      var elem = document.activeElement;
      if (elem)
        if (elem.localName == "input" || elem.localName == "textarea" || elem.localName == "select") {
          var screenHeight = 748;
          var keyboardHeight = 352;
          var elemHeight = elem.clientHeight;
          var elemTop = $(elem).offset().top;

          if (elem.localName == "select") {
            elemHeight = this.notifLastHeight || 0;
            elemTop = this.notifLastTop || 0;
          }

          this.notifLastHeight = elemHeight;
          this.notifLastTop = elemTop;

          if (((screenHeight - keyboardHeight) / 2) < (elemTop + (elemHeight / 2))) {
            return 15 + (elemTop + (elemHeight / 2)) - ((screenHeight - keyboardHeight) / 2);
          }
        }
      return -5;
    },

    ToggleDisplayAlignment: function() {
      if (Global.isBrowserMode) return;
      var cnt = 0;
      var displayInterval = setInterval(function() {
        if (cnt > 3) {
          clearInterval(displayInterval);
          return;
        }
        cnt++;
        window.plugins.display.ToggleDisplay();
      }, 1000);
    },

    SetFullScreen: function(isFullScreen) {
      if (Global.isBrowserMode) return;
      if (isFullScreen) {
        window.plugins.display.SetFullScreen();
      } else {
        window.plugins.display.UnsetFullScreen();
      }
    },

    /*
     * Printer Functions for Browser
     */
    PrintBrowserMode: {
      Print: function(transactionCode, pages, printer, copies) {
        if (Global.isOkToOpenCashDrawer && Global.Preference.UseCashDrawer) {
          this.DrawerKick();
        }
        var applet = document.connectedsaleprinting;
        var serviceUrl = Global.ServiceUrl + Method.REPORTS;

        // var data = {
        //   task: "print",
        //   serviceUrl: serviceUrl,
        //   transactionCode: transactionCode,
        //   pages: pages
        // };
        // document.getElementById('printAppletFrame').contentWindow.postMessage(data, "*");

        //For silent printing
        var reprotUrl = serviceUrl + transactionCode + '.pdf';
        if (printerTool) {
          printerTool.printReport(reprotUrl, printer, copies);
        }
      },

      DrawerKick: function() {
        if (Global.PreventDrawerKick) {
          Global.PreventDrawerKick = false;
        } else if (Global.isOkToOpenCashDrawer && Global.Preference.UseCashDrawer) {

          // var data = {
          //   task: "kick"
          // };
          // document.getElementById('printAppletFrame').contentWindow.postMessage(data, "*");

          if (printerTool) {
            printerTool.openCashDrawer(Global.Preference.DefaultPrinter).then(function() {
              console.log("DrawerKick!");
            })
          }
  
          Global.isOkToOpenCashDrawer = false
          console.log("DrawerKick!");
        }
      },

      ValidateApplet: function(applet, isDrawer) {
        var isAppletLoaded = true;
        if (!applet) isAppletLoaded = false;
        if (isAppletLoaded)
          if (!applet.PrintReport || !applet.DrawerKick) isAppletLoaded = false;
        if (!isAppletLoaded) {
          navigator.notification.alert("ConnectedSale " + (isDrawer ? "Cash Drawer" : "Printer") + " Applet was not loaded properly, please refresh your browser or contact your administrator.", null, "Applet Error", "OK", true);
        }
        return isAppletLoaded;
      }

    },

    LoadServiceApplet: function() {
      if (!Global.isBrowserMode) return;
      if (Global.LastServiceURLUsed == Global.ServiceUrl) return;

      (function() {
        var appletHTML = '<iframe id="printAppletFrame" style="position: relative; height:0; width:0;" src="' + Global.ServiceUrl + 'Reports/print.html?' + Math.random() + '"></iframe>';
        document.getElementById("csPrintingApplet-container").innerHTML = appletHTML;
      })();

      //loadFrameApplet();
      var self = this;
      $('#printAppletFrame').off('deleteReport');
      $('#printAppletFrame').on('deleteReport', function(event, data) {
        self.Printer.DeleteReport(data.pages, data.code);
      });

      var responseList = new Array(); //List of All Print Responses
      var uniqueCodes = new Array(); //List of Unique Response Codes
      var printResponse = function(code, page, pages) {
          this.code = code;
          this.page = page;
          this.pages = pages;
          return this;
        } //Response Constructor
      var addResponse = function(data) {
        var hasMatch = false;
        for (var i in responseList) {
          if (responseList[i].code == data.code && responseList[i].page == data.page && responseList[i].pages == data.pages) hasMatch = true;
        }
        if (!hasMatch) responseList[responseList.length] = new printResponse(data.code, data.page, data.pages);
        hasMatch = false;
        for (var i in uniqueCodes) {
          if (uniqueCodes[i] == data.code) hasMatch = true;
        }
        if (!hasMatch) uniqueCodes[uniqueCodes.length] = data.code;
        checkResponseCompletion();
      }

      var checkResponseCompletion = function() {
        for (var i in uniqueCodes) {
          var codeMatch = uniqueCodes[i];
          var codeFilterMatch = function(el) {
            return el.code == codeMatch;
          }
          var codeFilterNotMatch = function(el) {
            return el.code != codeMatch;
          }
          var filtered = responseList.filter(codeFilterMatch);
          if (filtered.length > 0) {
            if (filtered[0].pages == filtered.length) {
              $('#printAppletFrame').trigger('deleteReport', filtered[0]);
              responseList = responseList.filter(codeFilterNotMatch);
              uniqueCodes[i] = "";
            }
          }
        }
        uniqueCodes = uniqueCodes.filter(function(el) {
          return el != "";
        });
      }

      var forceDelete = function(data) {
        uniqueCodes = uniqueCodes.filter(function(el) {
          return el != data.code;
        });
        responseList = responseList.filter(function(el) {
          return el.code != data.code;
        });
        $('#printAppletFrame').trigger('deleteReport', data);
      }

      var receiveMessage = function(event) {
        //console.log('client message received...');
        if (!event.data) return;
        var data = event.data;
        //error
        if (data.task == "error") {
          navigator.notification.alert(data.message, null, "Applet Error", "OK", true);
          return;
        }
        //loaded
        if (data.task == "loaded") {
          $("#applet-bar").css("display", "none");
          return;
        }
        //loading
        if (data.task == "loading") {
          //if ($("#applet-bar").is(":hidden")) {
          //$("#applet-bar").show().delay(5000).fadeOut(1);
          //}
          $("#loading-applet").html("Loading Applet . . .");
          //$("#applet-bar").hide().delay(10000).fadeOut();
          //$("#applet-bar i").off("click");
          $("#applet-bar i").on("click", function() {
            //$("#applet-bar").stop(true, true);
            $("#applet-bar").hide();
            document.getElementById('printAppletFrame').contentWindow.postMessage({
              task: "cancel"
            }, "*");
          });
          return;
        }
        //response
        if (data.task == "response") {
          if (!data.response) return;
          if (data.response.type == "print") {
            if (data.response.status == "success") addResponse(data.response.data);
            if (data.response.status == "error") forceDelete(data.response.data);
          }
          return;
        }
      };

      if (!Global.LastServiceURLUsed) window.addEventListener("message", receiveMessage);
      Global.LastServiceURLUsed = Global.ServiceUrl;
      setTimeout(function() {
        document.getElementById('printAppletFrame').contentWindow.postMessage({
          task: "init"
        }, "*");
      }, 1000);
    },

    LoadApplet: function() {

      var loadApplet = function() {
        var appletHTML = '<applet id="connectedsaleprinting" code="connectedsaleprinting.ConnectedSalePrinting" archive="js/libs/ConnectedSalePrinting.jar?' + Math.random() + '" height="0px" width="0px" style="position: absolute"></applet>';
        document.getElementById("csPrintingApplet-container").innerHTML = appletHTML;
      }
      loadApplet();
      var loading = " ";
      var isVisible = false;
      var validateApplet = function(applet) {
        var isAppletLoaded = true;
        if (!applet) isAppletLoaded = false;
        if (isAppletLoaded)
          if (!applet.PrintReport || !applet.DrawerKick) isAppletLoaded = false;
        if (!isAppletLoaded) {
          switch (loading) {
            case ". ":
              loading = ". . ";
              break;
            case ". . ":
              loading = ". . . ";
              break;
            case ". . . ":
              loading = " ";
              break;
            case " ":
              loading = ". ";
              break;
          }
          $("#applet-bar").css("display", "block");
          $("#loading-applet").html("Loading Applet " + loading);
          console.log("ConnectedSale ( Loading Applet... )");

          if (!isVisible) {
            isVisible = true;
            $("#applet-bar i").on("click", function() {
              clearInterval(appletLoadInterval);
              $("#applet-bar").css("display", "none");
            });
          }
        } else {
          clearInterval(appletLoadInterval);
          $("#applet-bar").css("display", "none");
          console.log("ConnectedSale (Applet Loaded!)");
        }
        return isAppletLoaded;
      }
      var appletLoadInterval = setInterval(function() {
        if (!validateApplet(document.connectedsaleprinting)) loadApplet();
      }, 3000);
    },

    /*
     * Printer Shared Functions
     */
    Printer: {
      LoadScroll: function(scroll, element, attrib) {
        scroll = new iScroll(element, attrib);
        this.RefreshMyScroll(scroll, element, attrib);
      },

      RefreshMyScroll: function(scroll, element, attrib) {
        setTimeout(function() {
          scroll = new iScroll(element, attrib);
          scroll.refresh();
        }, 500);
      },

      //Passes formatted data from javascript to SetInvoiceReceiptHeader function on cbReceiptPrint.m class
      InitializePrintPlugin: function() {
        if (!window.plugins) {
          window.plugins = {};

        } else {
          window.plugins.cbReceiptPrint = cordova.require(Global.Plugins.ReceiptPrinter);
        }
      },

      InitializePrintPluginArray: function() {
        window.plugins.cbReceiptPrint.InitializeArray();
      },

      Validate: function(IP, PrinterModel) {
        if ((IP != "") && (PrinterModel != "") && (PrinterModel != "Printer model not supported" && PrinterModel != "No Printer Model specified")) {
          if (!Global.isBrowserMode) {
            if (!Global.isPrinterInitialized || Global.isPrinterInitialized === false) {
              window.plugins.cbReceiptPrint.InitializeBuilder(PrinterModel,
                function(result) {
                  Global.isPrinterInitialized = result;
                }
              );
            }
          }
          return true;
        } else {
          Global.isPrinterInitialized = false;
        }

        return false;
      },

      OpenPrinter: function(IP) {
        window.plugins.cbReceiptPrint.OpenPrinter(
          IP,
          function(result) {
            Global.Printer.isPrinterOpen = result;
            console.log("ISOPEN: " + Global.Printer.isPrinterOpen);
          },
          function(result) {
            Global.Printer.isPrinterOpen = false;
            switch (result) {
              case "Connection failed":
                navigator.notification.alert("It appears that you're currently not connected to any printer. Please turn on the printer and try again...", null, result, "OK", true);
                break;
              case "Connection is still open":
                navigator.notification.alert("You are connected to the printer as of the moment.", null, result, "OK", true);
                break;
            }
          }
        );
      },

      DrawerKick: function(IP, PM) {
        if (!Global.Preference.UseCashDrawer) return;

        // console.log('DrawerKick - Start');
        // if (!IP || IP === "") IP = Global.Printer.IpAddress;
        // if (!PM || PM === "") PM = Global.Printer.PrinterModel;

        // this.InitializePrintPlugin();

        // if (!this.Validate(IP, PM)) {
        //   navigator.notification.alert("Unable to detect a cash drawer.\nPlease specify the IP address of the printer.", null, "Printer Error", "OK", true);
        //   return;
        // }

        // window.plugins.cbReceiptPrint.OpenCashDrawer(IP,
        //   function(result) {
        //     Global.Printer.isPrinterOpen = result;
        //     console.log("ISOPEN: " + Global.Printer.isPrinterOpen);
        //   },
        //   function(result) {
        //     Global.Printer.isPrinterOpen = false;
        //     navigator.notification.alert(result, null, 'Error Opening Drawer', 'OK', true);
        //     return;
        //   }
        // );

        // console.log('DrawerKick - End');
        // Global.isOkToOpenCashDrawer = false;
      },

      ClosePrinter: function() {
        window.plugins.cbReceiptPrint.ClosePrinter("closePrinter",
          function(result) {
            Global.Printer.isPrinterOpen = result;
            console.log("ISOPEN: " + Global.Printer.IsPrinterOpen);
          }
        );
      },

      PrintReceipt: function() {
        var isUseCashDrawer = false;
        var isSilentPrint = false;
        var self = this;

        //Notes:
        //V13 - Drawer kick occurs upon printing, meaning, if in print preview, if receipt is not printed, cash drawer won't kick
        //v14 - Drawer kick occurs before printing, even if the user does not print the receipt at all

        //Determine if version is lower than 14 (CSL-21425, Jan-06-2014)
        var isVersionBelow14 = (Shared.GetVersionAttributes(Global.ServerVersion).Major < 14);

        console.log('IsVersionBelow14 : ' + isVersionBelow14); //Jhenson

        if (!Global.PrintOptions.Reprint) {

          //This condition is added on version 14 onward (CSL-21425, Jan-06-2014)
          if ((Global.Preference.AutoPrintReceipt && Global.PrintOptions.SilentPrint) || Global.PrintOptions.SilentPrint) {
            isUseCashDrawer = Global.Preference.UseCashDrawer;
            isSilentPrint = true;
          }

          //If version is lower than 14, use old behavior, see Old Shared.js on 13.x.x (CSL-21425, Jan-06-2014)
          if (isVersionBelow14) isUseCashDrawer = Global.Preference.UseCashDrawer;

          if (!Global.isOkToOpenCashDrawer || Global.isReturnTransaction) isUseCashDrawer = false; // CSL-5630 : 04.18.13 : PR.Ebron
        } else {
          Global.PrintOptions.Reprint = false;
        }


        window.plugins.cbReceiptPrint.PrintReceipt(
          isUseCashDrawer.toString(),
          isSilentPrint.toString(),
          function(result) {
            //self.ClosePrinter();
          },
          function(result) {
            console.log("Unable to Print: " + result);
            navigator.notification.alert("Unable to print receipt. Please try again.", null, "Unable to Print", "OK", true);
            //self.ClosePrinter();
          }
        );
      },

      ReleasePrinterObjects: function() {
        window.plugins.cbReceiptPrint.ReleaseObjects("release");
      },

      DeleteReport: function(pages, code) {
        if (printingInProgress) return;

        Shared.LockTransactionScreen(false);
        Shared.ShowOverlayIfTransactionsViewIsVisible();

        if (pages === 0) pages = 1;

        Global.Printer.SelectedPrinter = "";

        if (Global.isBrowserMode && Global.ApplicationType == 'Reports' && Global.Printer.isPrintedinPrinter) return;

        var reportSettingModel = new ReportSettingModel();
        var isDeleteXmlFile = false;
        var isSilentPrint = ((Global.Preference.AutoPrintReceipt && Global.PrintOptions.SilentPrint) || Global.PrintOptions.SilentPrint);
        if (isSilentPrint) {
          isDeleteXmlFile = false;
        } else {
          isDeleteXmlFile = Global.isBrowserMode;
        }
//        setTimeout(function() {
                 reportSettingModel.url = Global.ServiceUrl + Service.POS + Method.DELETEREPORT + code + "/" + pages + "/" + isDeleteXmlFile;
                reportSettingModel.save(null, {
              success: function(model, response) {
                if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
              },
              error: function(model, error, response) {
                if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
              }
                });
//        }),500;


        this.DeletePaymentReport(code);

      },

      DeletePaymentReport: function(transactionCode) {
        var model = new BaseModel();
        model.url = Global.ServiceUrl + Service.SOP + 'deletepaymentreport/' + transactionCode;
        model.save();
      },

      LoadAirPrintPlugin: function() {
        if (!Global.PrintPluginLoaded) {
          if (!window.plugins) {
            window.plugins = {};
          } else {
            window.plugins.printPlugin = cordova.require(Global.Plugins.AirPrinter);
          }
        }
      },

      PrintAirPrintReceipt: function(IP, self) {
        var _top = 87;
        if (!self.top == false) {
          _top = self.top;
        }

        window.plugins.printPlugin.print(
          IP,
          function(result) {
            //alert("Printing successful");
            //self.trigger("closed");
            Global.PrintOptions.Reprint = false;
            Global.PrintPluginLoaded = false;
          },
          function(result) {
            if (!result) navigator.notification.alert("Printing is not available.", null, "Printing Failed", "OK", true);
            else navigator.notification.alert(result.error, null, "Printing Failed", "OK");
            //self.trigger("closed");
            Global.PrintPluginLoaded = false;
          },

          {
            dialogOffset: {
              left: 860,
              top: _top
            }
          }
        );
      },

      SetReceiptPrintImage: function(url) {
        window.plugins.cbReceiptPrint.SetImageURL(url);
      },

      SearchPrinter: function(elementToAppendStatus) {
        if (!Global.isBrowserMode) {
          window.plugins.cbReceiptPrint.SearchPrinter();
          $(elementToAppendStatus + " span").text("Searching for Printers within the network...");
        } else {
          $("#printer-address").trigger("change");
        }
      },

      ConnectionTest: function(ip, model) {
        var msg = "";
        window.plugins.cbReceiptPrint.ConnectionTest(
          ip,
          model,
          function(result) {
            msg = "Connection test is successful.";
            navigator.notification.alert(msg, null, result, "OK", true);
            $("#printer-status span").text(msg);
            Global.isPrinterInitialized = false;
          },
          function(result) {
            switch (result) {
              case "Connection failed":
                msg = "It appears that you're currently not connected to any printer. Please turn on the printer and try again...";
                break;
              case "Connection is still open":
                msg = "You are connected to the printer as of the moment.";
                break;
              case "IP Address empty":
                msg = "Please Specify the IP Address of the Printer and Try again..."
                break;
            }

            $("#printer-status span").text(msg);
            navigator.notification.alert(msg, null, result, "OK", true);
            return;

          }
        );
      }
    },
    /* End of Printer Functions */

    LoadPostalByCode: function(postal, onSuccess, onError) {
      var newModel = new BaseModel();
      newModel.set({
        StringValue: postal
      });
      newModel.url = Global.ServiceUrl + Service.CUSTOMER + Method.LOADPOSTALBYCRITERIA;
      newModel.save(newModel, {
        success: function(model, response, options) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          if (onSuccess) onSuccess(model.get("Postals"));
          console.log('Success - Postals');
        },
        error: function(model, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          if (onError) onError(error);
          console.log('Error - Postals');
        }
      });
    },

    //MJF - 05-15-2013
    Escapedhtml: function(string) {
      var entityMap = {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': '&quot;',
        "'": '&#39;',
        "/": '&#x2F;'
      };
      return String(string).replace(/[&<>"'\/]/g, function(s) {
        return entityMap[s];
      });
    },

    EscapedModel: function(model) {
      var newModel = new BaseModel();
      if (model) {
        newModel.set(model.attributes);
        for (attr in newModel.attributes) {
          var attrVal = newModel.attributes[attr];
          if ((typeof attrVal) == 'string' || attrVal instanceof String) {
            attrVal = this.Escapedhtml(attrVal);
          }
          newModel.attributes[attr] = attrVal;
        }
      }
      return newModel;
    },

    POS: {
      Overlay: {
        Show: function() {
          $("#main-transaction-blockoverlay").show();
        },

        Hide: function() {
          $("#main-transaction-blockoverlay").hide();
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
        }
      },
    },


    //MJF - 05-15-2013
    Products: {
      Overlay: {
        Show: function(msg) {
          if (msg) {
            $("#overlay-message").text(msg);
            $(".overlay-message-container").show();
          }
          $("#products-page-blockoverlay").css("display", "block");
        },

        Hide: function() {
          $("#products-page-blockoverlay").css("display", "none");
          $(".overlay-message-container").hide();
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
        }
      },

      DisplayWait: function(toElementID) {
        $(toElementID).html('<center><div class="loading"><i class="icon-spinner icon-spin"></i></div></center>');
      },

      DisplayError: function(toElementID) {
        $(toElementID).html('<center><div class="loading"><i class="icon-warning-sign"></i></div></center>');
        if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      },

      DisplayNoRecordFound: function(toElementID, toListElementID, toBeSearched) {
        var msg = '';
        if (toBeSearched.length > 0) {
          msg = 'Sorry, your search for <span>' + toBeSearched + '</span> &nbsp; did not match any records.';
        } else {
          msg = 'Sorry, there are no records yet';
        }

        $(toElementID).html('<center><div class="norecord"><i class="icon-ban-circle"></i><br><p>No Record Found</p></div></center>');

        $(toListElementID).html('<div class="norecordlist"><p>' + msg + '</p></div>');
      },

      ShowNotification: function(message, isWarning, duration) {

        //Only for v14 onward
        if (navigator.notification.isOverrideAlert) {
          Shared.ShowNotification(message, isWarning, duration);
          return;
        }

        //Old Versions
        if (this._nofificationTimeOut) clearTimeout(this._nofificationTimeOut);
        $('#notification-overlay').hide();
        $('#notification-overlay .message').html(message);
        $('#notification-overlay i').removeClass('icon-ok');
        $('#notification-overlay i').removeClass('icon-remove-sign');
        $('#notification-overlay i').removeClass('ok');
        $('#notification-overlay i').removeClass('warn');
        if (isWarning) {
          $('#notification-overlay i').addClass('icon-remove-sign');
          $('#notification-overlay i').addClass('warn');
        } else {
          $('#notification-overlay i').addClass('icon-ok');
          $('#notification-overlay i').addClass('ok');
        }
        var _left = (1024 - $('#notification-overlay').width()) / 2;
        $('#notification-overlay').css('left', _left + 'px');

        $('#notification-overlay').fadeIn();
        if (!duration) duration = 3000;
        this._nofificationTimeOut = setTimeout(function() {
          $('#notification-overlay').fadeOut(1000);
        }, duration);
      },

      RequestTimeOut: function(msg) {
        if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
        if (!msg) {
          msg = "Request Time out."
        };
        this.ShowNotification(msg, true);
        this.Overlay.Hide();
      },

      ByteToBase64: function(data) {
        var output = "";
        var str = "";
        for (var i = 0; i < data.length; i++) {
          str += String.fromCharCode(data[i]);
          if (str.length == 57 && i != data.length - 1) {
            output += btoa(str) + "\n";
            str = "";
          }
        }
        return output + btoa(str);
      },

      Base64Only: function(b64) {
        if (!b64) return;
        b64 = b64.replace('data:image/png;base64,', '');
        b64 = b64.replace('data:image/jpeg;base64,', '');
        return b64;
      },

      NumberWithCommas: function(x) {
        //x = x.toFixed(2);
        return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      }

    },

    Customers: {
      Overlay: {
        Show: function() {
          $("#customers-page-blockoverlay").css("display", "block");
        },
        Hide: function() {
          $("#customers-page-blockoverlay").css("display", "none");
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
        }
      },

      ShowNotification: function(message, isWarning, duration) {

        //Only for v14 onward
        if (navigator.notification.isOverrideAlert) {
          Shared.ShowNotification(message, isWarning, duration);
          return;
        }

        //Old Versions
        if (this._nofificationTimeOut) clearTimeout(this._nofificationTimeOut);
        $('#notification-overlay').hide();
        $('#notification-overlay .message').html(message);
        $('#notification-overlay i').removeClass('icon-ok');
        $('#notification-overlay i').removeClass('icon-remove-sign');
        $('#notification-overlay i').removeClass('ok');
        $('#notification-overlay i').removeClass('warn');
        if (isWarning) {
          $('#notification-overlay i').addClass('icon-remove-sign');
          $('#notification-overlay i').addClass('warn');
        } else {
          $('#notification-overlay i').addClass('icon-ok');
          $('#notification-overlay i').addClass('ok');
        }
        var _left = (1024 - $('#notification-overlay').width()) / 2;
        $('#notification-overlay').css('left', _left + 'px');

        $('#notification-overlay').fadeIn();
        if (!duration) duration = 3000;
        this._nofificationTimeOut = setTimeout(function() {
          $('#notification-overlay').fadeOut(1000);
        }, duration);
      }

    },

    GetJsonUTCDate: function() {
      var date = new Date();
      var m = date.getMonth();
      var d = date.getDate();
      var y = date.getFullYear();
      date = Date.UTC(y, m, d);
      date = "/Date(" + date + ")/";
      return date;
    },

    Focus: function(elemID) {
      if (Global.isBrowserMode) $(elemID).focus();
      $(elemID).addClass("ui-focus");
    },

    //numeric validation for input element..
    Input: {
      Numeric: function(element) {
        try {
          $(element).numeric();
        } catch (e) {
          console.log('numeric didn\'t load properly.');
        }
      }, // Accepts all valid numbers

      NonNegative: function(element) {
        try {
          $(element).numeric({
            negative: false,
            allow: "."
          });
        } catch (e) {
          console.log('numeric didn\'t load properly.');
        }
      }, // Positive

      Integer: function(element) {
        try {
          $(element).numeric({
            decimal: false
          });
        } catch (e) {
          console.log('numeric didn\'t load properly.');
        }
      }, // for whole numbers..
      NonNegativeInteger: function(element) {
        try {
          $(element).numeric({
            decimal: false,
            negative: false
          });
        } catch (e) {
          console.log('numeric didn\'t load properly.');
        }
      }, // for non-negative whole numbers..
    },


    ApplyAllowedDecimalFormat: function(value) {
      var parsedValue = parseFloat(value);
      if (parsedValue === NaN) return value;
      //determines if value has decimal places..
      if ((parsedValue % 1) == 0) return parsedValue;
      return parseFloat(parsedValue.toFixed(2));
    },

    //this method is exclusively for keypress event.
    MaxDecimalPlaceValidation: function(elementObject, myEvent, viewID) {
      myInputElement = elementObject;

      var _caretPos = 0;
      if (!viewID) _caretPos = this.GetCaretPosition('#' + myEvent.target.id); //retrieves the care position.
      else _caretPos = this.GetCaretPosition(viewID + ' #' + myEvent.target.id);
      //console.log('pos:' + _caretPos + ' length:' + val.length);
      if (myEvent.keyCode == 37 || myEvent.keyCode == 39 || myEvent.keyCode == 13) return true;
      var myElemValue = myInputElement.val();
      if (!myElemValue) myElemValue = '';

      var maxPlaces = 2,
        integer = myElemValue.split('.')[0],
        mantissa = myElemValue.split('.')[1];

      if (!mantissa) mantissa = '';
      console.log('pos:' + _caretPos + ' length:' + myElemValue.length);
      if (mantissa.length == maxPlaces && (_caretPos > myElemValue.length - 3 || _caretPos > myElemValue.length)) {
        myEvent.preventDefault();
        return false;
      }

      return true;
    },

    GetCaretPosition: function(elem) {
      if (!elem) {
        console.log('no element selected.');
        return 0;
      }
      if ($(elem)[0].tagName != "INPUT") return 0;
      return $(elem).__proto__.getSelectionStart($(elem)[0]);
    },

    TrimDefaultShipTo: function() {
      var _shipToName = this.Escapedhtml(Global.DefaultShipTo);
      if (Global.DefaultShipTo.length >= 65) {
        _shipToName = this.Escapedhtml(Global.DefaultShipTo.substring(0, 71) + "...");
        //return Global.DefaultShipTo.substring(0, 71)+"...";
        return _shipToName;
      } else {
        //return Global.DefaultShipTo;
        return _shipToName;
      }
    },

    TrimCustomerName: function() {
      var _customerName = this.Escapedhtml(Global.CustomerName);
      if (Global.CustomerName != null) {
        if (Global.CustomerName.length >= 20) {
          _customerName = this.Escapedhtml(Global.CustomerName.substring(0, 16) + "...");
          //return Global.CustomerName.substring(0,30)+"...";
          return _customerName;
        } else {
          return _customerName;
          //return Global.CustomerName;
        }
      }
    },

    TrimSalesRepName: function() {
      var _salesrepName = this.Escapedhtml(Global.SalesRepGroupName);
      if (Global.SalesRepGroupName != null && Global.SalesRepGroupName != "") {
        if (Global.SalesRepGroupName.length >= 14) {
          _salesrepName = this.Escapedhtml(Global.SalesRepGroupName.substring(0, 17) + "...");
          return _salesrepName;
        } else {
          return _salesrepName;
        }
      } else {
        $("#lbl-salesrepName").width("27%");
        return _salesrepName = "";
      }
    },

    TrimCommissionPercent: function() {
      var _commissionpercent = this.Escapedhtml(Global.RepSplit);
      if (Global.RepSplit != null && Global.SalesRepGroupName != "") {
        if (Global.RepSplit.length >= 6) {
          _commissionpercent = this.Escapedhtml(Global.RepSplit.substring(0, 3) + "...");
          return _commissionpercent;
        } else {
          return _commissionpercent + "%";
        }
      } else {
        $("#splitrateName").width("30%");
        return _commissionpercent = "0%";
      }
    },

    BrowserModeDatePicker: function(elementId, type, dateFormat, isClearOnClose, isShowClearButton) { //JJLUZ

      if (Global.isBrowserMode) {
        $(elementId).attr('readonly', 'readonly');
        $(elementId).prop('type', 'text');
        var _dateFormat = dateFormat;
        if (this.IsNullOrWhiteSpace(dateFormat)) {
          if (!this.IsNullOrWhiteSpace(isClearOnClose)) {
            $(elementId).datepicker({
              changeMonth: true,
              changeYear: true,
              showButtonPanel: true,
              dateFortmat: "mm/dd/yyyy",
            });
          } else {

            $(elementId).datepicker({
              changeMonth: true,
              changeYear: true,
              showButtonPanel: true,
              dateFortmat: "mm/dd/yyyy",
              closeText: 'Clear',
            });
            $('button.ui-datepicker-current').live('click', function() {
              $.datepicker._curInst.input.datepicker('setDate', new Date()).datepicker('hide');
            });
            $(".ui-datepicker-close").live("click", function(e) {
              e.stopImmediatePropagation();
              $(elementId).val('');
              $(elementId).trigger('change');
              $(elementId).blur();
            });
          }
        } else {
          $(elementId).datepicker({
            changeMonth: true,
            changeYear: true,
            showButtonPanel: true,
            dateFormat: _dateFormat,

            onClose: function(dateText, inst) {
              var month = $("#ui-datepicker-div .ui-datepicker-month :selected").val();
              var year = $("#ui-datepicker-div .ui-datepicker-year :selected").val();
              var day = 1;

              switch (_dateFormat) {
                case 'yy-mm':
                  day = 1;
                  break;
                case 'yy-mm-dd':
                  day = inst.selectedDay;
                  break;
              }

              console.log("Format 2: " + _dateFormat + " Date: " + year + "-" + month + "-" + day);
              $(this).datepicker('setDate', new Date(year, month, day));
              $(elementId).blur();

            }

          });
        }
        if (!this.IsNullOrWhiteSpace(_dateFormat) && _dateFormat == 'yy-mm') {
          $(elementId).focus(function() {
            $(".ui-datepicker-calendar").hide();
            $("#ui-datepicker-div").position({
              my: "center top",
              at: "center bottom",
              of: $(this)
            });
          });
          $(elementId).blur(function() {
            $(".ui-datepicker-calendar").hide();
            $("#ui-datepicker-div").position({
              my: "center top",
              at: "center bottom",
              of: $(this)
            });
          });
        }
      } else {
        this.SetDefaultToday(elementId, dateFormat);
      }

    },

    SetDefaultToday: function(elementId, dateFormat) {
      if (this.IsNullOrWhiteSpace(dateFormat)) {
        dateFormat = 'YYYY-MM-DD'
      } else {
        dateFormat = 'YYYY-MM'
      }

      $(elementId).val(moment().format(dateFormat));
    },

    IsNullOrWhiteSpace: function(str) { //JJLUZ
      if (!str) return true;
      if (str === null || str === undefined || $.trim(str) === "") return true;
      return false;
    },

    CustomCheckBoxChange: function(elementID, _optionVal) { //jjluz
      if (_optionVal === true) {
        _optionVal = false;
      } else {
        _optionVal = true;
      }

      if (_optionVal == true) {
        $(elementID).removeClass("icon-check-empty");
        $(elementID).addClass("icon-check");
      } else {
        $(elementID).removeClass("icon-check");
        $(elementID).addClass("icon-check-empty");
      }

      return _optionVal;
    },

    GetWebsiteCode: function() {
      if (Global.Preference.IsUseISEImage) return Global.Preference.WebSiteCode;
      return "";
    },

    UseBrowserScroll: function(targetElement, showHorizontalScroll) {
      if (!targetElement) navigator.notification.alert('No element specified.', null, 'UseBrowserScroll')
      else $(targetElement).css('overflow-y', 'auto');

      if (showHorizontalScroll) $(targetElement).css('overflow-x', 'auto');
      else $(targetElement).css('overflow-x', 'hidden');
    },

    // For Settings Module Only.
    ApplyListScroll: function(element) {
      if (!Global.isBrowserMode) return;
      if (!element) $('#scroll-wrapper').addClass('scroll-wrapper');
      else $(element).addClass('scroll-wrapper');
      $('#right-pane-content').css({
        'padding': '0 0 10px',
        'overflow-x': 'hidden'
      });
      //$('#ul-container').css('padding','0 30px');
    },

    FixRightPanelPadding: function() {
      if (!Global.isBrowserMode) return;
      $('#right-pane-content').css('padding', '0 30px 10px');
    },
    // For Settings Module Only.

    FocusToItemScan: function() {
      if (!Global.isBrowserMode) return;
      $('#item-wrapper #searchContainer #search-input').focus();
      $('#kiosk-search-input').focus();
    },

    BlurItemScan: function() {
      if (!Global.isBrowserMode) return;
      $('#item-wrapper #searchContainer #search-input').blur();
      $('#kiosk-search-input').blur();
    },

    NMIPaymentGateway: {
      ActivateUnimag: function(success, fail) {
        if (!window.plugins) {
          window.plugins = {};
        } else {
          window.plugins.cbUnimag = cordova.require(Global.Plugins.NMIPaymentGateway);
        }

        window.plugins.cbUnimag.ActivateUnimag(success, fail, "window.plugins.cbUnimag", "string");
      },

      DeactivateUnimag: function() {
        window.plugins.cbUnimag.DeactivateUnimag();
      },

      isConnected: function() {
        var isSuccess = function(result) {
          console.log("ISCONNECTED : " + result);
          $("#isUnimag").text(result);
        };

        window.plugins.cbUnimag.isConnected(isSuccess);
      },

      RequestSwipe: function(success, fail) {
        var fail = function(data) {
          $("#cc-msg").text(data);
          $("#cc-msg").change();
        }

        window.plugins.cbUnimag.RequestSwipe(null, fail);
      }
    },

    AdjustPhasedOutItem: function(model, value, cartCollection) {
      if (Global.TransactionType == Enum.TransactionType.Quote) return false;
      if (!model.get("Status") == "P") return false;
      var self = this;
      var _itemCode = model.get("ItemCode");
      var _trueStock = parseInt(model.get("FreeStock"));
      var _consumedStock = 0;
      var _itemCollection = new BaseCollection();

      cartCollection.each(function(item) {
        if (item.get("ItemCode") == _itemCode) {
          _itemCollection.add(item);
        }
      });
      var stockToAdjustCollection = new BaseCollection();
      if (_itemCollection.length > 0) {
        var _allowedStockToConsume = 0;
        var _stockToConsume = 0;
        for (var i = 0; i <= _itemCollection.length - 1; i++) {
          _stockToConsume = (_itemCollection.at(i).get("QuantityOrdered") * _itemCollection.at(i).get("UnitMeasureQty"));
          _consumedStock += _stockToConsume;
          if (!((_allowedStockToConsume + _stockToConsume) > _trueStock)) {
            _allowedStockToConsume = _consumedStock;
          } else {
            stockToAdjustCollection.add(_itemCollection.at(i));
          }
        }
        stockToAdjustCollection.each(function(item) {
          var qtyToAdjust = (item.get("QuantityOrdered") * item.get("UnitMeasureQty")); //14
          var remainingQty = (_trueStock - _allowedStockToConsume); //11
          var adjustedQty = 0;
          if (qtyToAdjust >= remainingQty) {
            adjustedQty = remainingQty / item.get("UnitMeasureQty");
            item.set({
              QuantityOrdered: parseInt(adjustedQty),
              IsQtyOrderedAdjusted: true
            });
            _allowedStockToConsume = remainingQty;
          }
        });

        if (stockToAdjustCollection.length > 0) return true;
      }

      return false;
    },

    CheckIfItemIsPhaseout: function(model, value, qtyToAdd, isNewItem, cartCollection, dontAllowPromt) { //jj-10/10/2013
      if (Global.TransactionType == Enum.TransactionType.Quote) return false;

      if (model.get("Status") == "P") {

        if (Global.TransactionType == Enum.TransactionType.Return || Global.TransactionType == Enum.TransactionType.SalesRefund) {
          navigator.notification.alert("This item is already phased out.", null, "Phased Out Item", "OK");
          return false;
        }

        var self = this;
        var _itemCode = model.get("ItemCode");
        var _trueStock = parseInt(model.get("FreeStock"));
        var _consumedStock = 0;
        var _itemCollection = new BaseCollection();

        cartCollection.each(function(item) {
          if (item.get("ItemCode") === _itemCode) {
            _itemCollection.add(item);
          }
        });

        if (_itemCollection.length > 0) {
          if (_itemCollection.length > 1 || !this.IsNullOrWhiteSpace(isNewItem)) {
            var _itemQtyToAdd = value * model.get("UnitMeasureQty");
            if (this.IsNullOrWhiteSpace(isNewItem) || qtyToAdd > 0) _itemQtyToAdd = qtyToAdd * model.get("UnitMeasureQty");
            for (var i = 0; i <= _itemCollection.length - 1; i++) {
              _consumedStock += (_itemCollection.at(i).get("QuantityOrdered") * _itemCollection.at(i).get("UnitMeasureQty"));
            }
            var newStockToConsume = _consumedStock + _itemQtyToAdd;
            console.log("StockToConsume: " + newStockToConsume + " ,ConsumedStock : " + _consumedStock);

            if (newStockToConsume > _trueStock) {
              if (!this.IsNullOrWhiteSpace(dontAllowPromt)) return true;
              navigator.notification.alert("This item is already phased out. The quantity must be lower than or equal the freestock", null, "Action Not Allowed", "OK");
              return true;
            }
          }
        }

        var freeStock = model.get("FreeStock");
        var umQty = model.get("UnitMeasureQty");
        var origQtyAllocated = model.get("OriginalQuantityAllocated");

        var computedFreeStock = parseInt(freeStock);
        var computedQty = parseInt(value) * umQty;
        var maxQty = origQtyAllocated + computedFreeStock;
        if ((maxQty - computedQty < 0)) {
          if (!this.IsNullOrWhiteSpace(dontAllowPromt)) return true;
          console.log('This item is already phased out. The quantity must be lower than or equal the freestock');
          navigator.notification.alert("This item is already phased out. The quantity must be lower than or equal the freestock", null, "Action Not Allowed", "OK");
          return true;
        }
      }
      return false;
    },

    SerialNumbers: {
      GenerateGiftSerialNumber: function(item, collection, onSuccess, onError, isBatch) {
        var self = this;

        var invoice = new BaseModel();
        if (Global.TransactionObject) {
          if (Global.TransactionType === Enum.TransactionType.ConvertOrder) {
            Global.TransactionObject.InvoiceCode = "[To be generated]";
            if (!isBatch) item.set({
              QuantityShipped: item.get("QuantityOrdered")
            });
          }

          invoice.set(Global.TransactionObject);
        } else {
          invoice.set({
            BillToCode: Global.CustomerCode,
            POSWorkstationID: Global.POSWorkstationID,
            POSClerkID: Global.Username,
            IsFreightOverwrite: true,
            IsOverrideSalesRep: Global.Preference.IsOverrideSalesRep,
            IsTaxByLocation: Global.Preference.TaxByLocation,
            WarehouseCode: Global.Preference.DefaultLocation,
            InvoiceCode: "[To be generated]"
          });
        }

        var invoiceCollection = new BaseCollection();
        invoiceCollection.add(invoice);

        var invoiceDetailCollection = new BaseCollection();

        if (isBatch) {
          item.each(function(gc) {
            gc.set({
              QuantityShipped: gc.get("QuantityOrdered"),
              InvoiceCode: invoice.get("InvoiceCode")
            })
          });

          invoiceDetailCollection.reset(item.models);
        } else invoiceDetailCollection.add(item.set({
          InvoiceCode: invoice.get("InvoiceCode")
        }));

        var gcSerialNumberCollection = new BaseCollection();

        var serialNumberModel = new BaseModel();
        serialNumberModel.url = Global.ServiceUrl + Service.SOP + Method.GENERATEGIFTCARDSERIALNUMBER;
        serialNumberModel.set({
          "Invoices": invoiceCollection.toJSON(),
          "InvoiceDetails": invoiceDetailCollection.toJSON(),
          "SerialLotNumbers": collection.toJSON()
        });

        serialNumberModel.save(serialNumberModel, {
          timeout: 0,
          success: function(model, response, options) {
            //self.ProcessGiftSerialNumber(gcSerialNumberCollection.reset(response.SerialLotNumbers));
            onSuccess(model, response, options)
          },
          error: function(model, xhr, options) {
            onError(model, xhr, options)
          }
        });
      },

      GetSerialLotNumberDuplicate: function(itemCode, serialLotNumber, transactionCode, onSuccess, onError) {
        var mdl = new BaseModel();

        mdl.url = Global.ServiceUrl + Service.SOP + Method.GETSERIALLOTNUMBERDUPLICATES + itemCode + "/" + serialLotNumber + "/" + transactionCode;
        mdl.fetch({
          success: function(model, response, options) {

            options = {
              serialLotNumber: serialLotNumber
            };
            onSuccess(model, response, options);
          },
          error: function(model, xhr, options) {
            //navigator.notification.alert("Error while trying to determine duplicate serial(s) ( " + serialLotNumber + " ) on other transactions", null, "Error", "OK");
            //self.ErrorHandler(model,response,options);
            onError(model, xhr, options);
          }
        });
      },

      FindItem: function(sourceCollection, attrib1, attrib2) {
        try {
          if (sourceCollection instanceof BaseCollection) {
            var itemExist = sourceCollection.find(function(source) {
              return source.get(attrib1) === attrib2;
            });

            if (!Shared.IsNullOrWhiteSpace(itemExist)) {
              return itemExist;
            }

            return null;
          }
        } catch (e) {
          navigator.notification.alert(e.message, null, e.name, "OK");
        }
      }
    },
    Reporting: {
      GetReportCriterias: function(callBack, datasourceName, reportCode) {
        var filterModel = new BaseModel();
        var tempCollection = new BaseCollection();
        filterModel.set({
          StringValue: datasourceName,
          ReportCode: reportCode
        });
        filterModel.url = Global.ServiceUrl + Service.POS + Method.REPORTFILTERCRITERIA;
        filterModel.save(null, {
          success: function(model, response) {
            if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
            tempCollection.reset(response.ReportViews);
            callBack(tempCollection);
          }
        });
      },
      GetReportSubCategory: function(callBack, reportCode) {
        var tempCollection = new BaseCollection();
        tempCollection.reset();
        var self = this;
        var tempModel = new BaseModel();
        tempModel.set({
          ReportCode: reportCode
        });
        tempModel.url = Global.ServiceUrl + Service.POS + Method.REPORTSUBCATEGORYLOOKUP;
        tempModel.save(null, {
          success: function(model, response) {
            if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
            tempCollection.reset(response.ReportViews);
            callBack(tempCollection);
          }
        });
      },

      AssignPOSWorkstationID: function(_parameters, collection) {
        if (collection.length > 0) {
          var isRequire = collection.find(function(model) {
            return (model.get("ColumnName").toUpperCase() == "POSWORKSTATIONID" || model.get("ColumnName").toUpperCase() == "@POSWORKSTATIONID");
          });
          if (isRequire) {
            var workStationId = Global.POSWorkstationID;
            if (_parameters.length > 0)
              for (var i = 0; i < _parameters.length; i++) {
                if (_parameters.models[i].attributes['Name'] == '[WorkstationID]') {
                  workStationId = _parameters.models[i].attributes['Value'];
                }
              }
            _parameters.add([{
              Name: "POSWorkstationID",
              Value: workStationId
            }]);
          }
        }
      },

      AssignWorkstationID: function(_parameters, collection) {
        if (collection.length > 0) {
          var isRequire = collection.find(function(model) {
            return (model.get("ColumnName").toUpperCase() == "WORKSTATIONID" || model.get("ColumnName").toUpperCase() == "@WORKSTATIONID");
          });
          if (isRequire) {
            _parameters.add([{
              Name: "WorkstationID",
              Value: Global.POSWorkstationID
            }]);
          }
        }
      }
    },

    SetStyle: function(el, styleProperty, styleValue) {
      //Set Inline Style Attributes of an Element
      var element = (typeof el) == 'string' ? $(el) : el;
      var style = element.attr('style') || '';
      var oldStyle = style.split(';'),
        newStyle = [];
      for (x in oldStyle) {
        oldStyle[x] = (oldStyle[x] || '').trim();
        if (oldStyle[x] != '') {
          if (oldStyle[x].split(':')[0].trim() != styleProperty) {
            newStyle.push(' ' + oldStyle[x]);
          }
        }
      }
      newStyle.push(styleProperty + ':' + styleValue);
      element.attr('style', newStyle.join(';'));
    },

    StorePickup: {

      StartChecker: function(model) {
        if (navigator.storePickupChecker) clearInterval(navigator.storePickupChecker);

        var onSuccess = function(model, response) {
            if (response.ErrorMessage) console.log(response.ErrorMessage);
            model.trigger('notify', {
              Value: response.Value ? response.Value : 0,
              Forced: model.get('IsForceNotify')
            });
          },
          onError = function(model, error, response) {
            console.log('Error Fetching Web Order Count.');
          },
          fetch = function(isForceNotify) {
            model.set({
              IsForceNotify: isForceNotify
            });
            model.url = Global.ServiceUrl + Service.SOP + 'getstorepickupordercountperlocation?warehouseCode=' + Global.Preference.DefaultLocation;
            model.fetch({
              success: onSuccess,
              error: onError
            });
            console.log('Fetching Data...');
          };
        model.off('force-notify').on('force-notify', function() {
          fetch(true);
        });
        fetch();

        var interval = parseInt(Global.Preference.NotificationInterval || 0);
        interval = (interval < Global.MinimumNotificationInterval ? Global.MinimumNotificationInterval : interval);
        interval = 1000 * 60 * interval;

        navigator.__proto__.storePickupChecker = setInterval(fetch, interval);
      },

      StopChecker: function() {
        console.log('STOP STOREPICKUP');
        if (navigator.storePickupChecker) clearInterval(navigator.storePickupChecker);
      }
    },

    CheckSalesRep: function(preferences){
      if (Global.IsOverrideSalesRep) {
        var SalesRepResult = _.find(Global.SalesRepUserAccount, function (data) {
          return data.UserName == Global.UserInfo.UserCode;
        });

        if (SalesRepResult != null) {
          Global.SalesRepGroupCode = SalesRepResult.SalesRepGroupCode;
          Global.SalesRepGroupName = SalesRepResult.SalesRepGroupName;
          Global.RepSplit = SalesRepResult.SalesRepGroupName != null ? 100 : 0;
        } else {
          Global.SalesRepGroupCode = '';
          Global.SalesRepGroupName = ''
          Global.RepSplit = 0
        }
      } else {
        if (preferences != null) {
        Global.SalesRepGroupCode = preferences.SalesRepGroupCode;
        Global.SalesRepGroupName = preferences.SalesRepGroupName;
        Global.RepSplit = preferences.SalesRepGroupName != null ? 100 : 0;
        } else {
          Global.SalesRepGroupCode = '';
          Global.SalesRepGroupName = ''
          Global.RepSplit = 0
        }
      }
    },

   GetUrlFromParent: function (param){
    param = param.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regexS = "[\\?&]"+param+"=([^&#]*)";
    var regex = new RegExp( regexS );
    var results = regex.exec( parent.location.href );
    if( results == null )
       return "";
    else
       return results[1];
   }

  }
  return Shared;
});
