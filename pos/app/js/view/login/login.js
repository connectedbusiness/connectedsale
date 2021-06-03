/**
 * @author Connected Business
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'shared/method',
  'shared/service',
  'shared/shared',
  'model/lookupcriteria',
  'collection/url',
  'collection/workstations',
  'collection/localpreferences',
  'view/login/connection',
  'view/spinner'
], function($, $$, _, Backbone, Global, Method, Service, Shared,
  LookupCriteriaModel, UrlCollection, WorkstationCollection, LocalPreferenceCollection, ConnectionView, Spinner) {

  var isAutoSignin = false;
  var LoginView = Backbone.View.extend({
    events: {
      "tap #login-btn": "Login",
      "tap #connection-btn": "Connect",
      "tap .websiteLink": "OpenWebsite",
      "keyup #password": "Password_keyup",
      "tap .clearTextBtn": "ClearUserText",
      "focus #password": "ClearPassword",
      "focus #username": "ShowClearBtn",
      "keyup input": "ShowClearBtn",
      "blur #username": "HideClearBtn",
      "blur #password": "HideClearBtn"
    },

    initialize: function() {
      Global.IsPatchCompatible = false;
      this.InitializeLocalPreference();
      this.InitializeUrlCollection();
      this.InitializeConnection();
      this.initializeDefaultUrl();

      //auto login
      if (this.hasURLparam() && !Global.IsSignOut){
        _showActivityIndicator();
        Global.IsSignOut = false;
        isAutoSignin = true;
        Global.Username = Shared.GetUrlFromParent("u");
        Global.Password = Shared.GetUrlFromParent("p");
        Global.ServiceUrl = Shared.GetUrlFromParent("s");
        // if (!this.ValidateFields()) return;
        this.DoLogin();
        this.cleanParentURL();
      }

      this.$("#loginForm").trigger("create");
      try {
        if (!Global.isBrowserMode) navigator.splashscreen.hide(); //hide splashscreen
      } catch (e) {
        navigator.notification.alert(e.message, null, e.name, "OK");
      }

      navigator.notification.overrideAlert(); //Notification
      Shared.StorePickup.StopChecker();
    },

    cleanParentURL: function() {
       var clean_uri = parent.location.protocol + "//" + parent.location.host + parent.location.pathname;
        parent.history.replaceState({}, document.title, clean_uri);
    },

    hasURLparam: function(){
      return parent.location.search != "";
    },

    initializeDefaultUrl: function() {
      $("#username").val("");
      $("#password").val("");

      if (Global.BetaServerUrl.CB == Global.ServiceUrl) {
        console.log(" Global.BetaServerUrl.CB " + Global.BetaServerUrl.CB + "SeviceUrl " + Global.ServiceUrl);
        $("#username").val("posdemo");
        $("#password").val("posdemo");
      }
      if (Global.isBrowserMode) this.Focus();
    },

    Focus: function() {
      this.$("#username").focus();
    },

    InitializeWorkstation: function(_rows, _criteria) {
      var _preference = new LookupCriteriaModel();
      var _rowsToSelect = _rows;

      _preference.set("StringValue", _criteria);

      _preference.url = Global.ServiceUrl + Service.POS + Method.PREFERENCELOOKUP + _rowsToSelect;
      _preference.save(_preference, {
        success: function(model, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          this.CheckApplicationType(_criteria, response);
        }.bind(this),
        error: function(model, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          model.RequestError(error, "Error Retrieving Preference");
        }.bind(this)
      });
    },

    CheckApplicationType: function(workstationID, response) {
      switch (Global.ApplicationType) {
        case "POS":
          if (!response.Preferences) {
            window.location.hash = 'settings';
          } else {
            window.location.hash = 'dashboard';
          }
          break;
        case "Kiosk":
          Global.POSWorkstationID = workstationID;
          window.location.hash = "kiosk";
          break;
      }
    },

    InitializeLocalPreference: function() {
      this.localpreference = new LocalPreferenceCollection();
      this.localpreference.fetch({
        isLocalStorage: true,
        success: function(collection, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          this.CheckDefaultWorkstationID(collection);
        }.bind(this),
        error: function(collection, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          collection.RequestError(error, "Error Retrieving Local Preference");
        }.bind(this)
      });
    },

    InitializeUrlCollection: function() {
      this.urlcollection = new UrlCollection();
      this.urlcollection.fetch({
        isLocalStorage: true,
        success: function() {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          this.SetDefaultUrl();
          this.LoadDefaultUrl();
        }.bind(this),
        error: function(collection, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          collection.RequestError(error, "Error Retrieving URLs");
        }.bind(this)
      });
    },

    CheckDefaultWorkstationID: function(collection) {
      if (collection.length === 0) {
        collection.create({
          WorkstationID: Global.DefaultPOSWorkstationID
        });
        console.log(collection.toJSON());
      } else {
        console.log("Exist");
        collection.each(function(model) {
          if (model.get("WorkstationID") === Global.DefaultPOSWorkstationID) {
            Global.POSWorkstationID = model.get("WorkstationID");
          }
        });
      }
    },

    InitializeConnection: function() {
      this.connectionview = new ConnectionView({
        el: $("#connectionContainer"),
        collection: this.urlcollection
      });
      this.connectionview.on("Close", this.ConnectionViewClosed, this);
    },

    ConnectionViewClosed: function() {
      if (Global.isBrowserMode) this.Focus();
    },

    LoadDefaultUrl: function() {
      this.urlcollection.each(this.FindSelectedUrl, this);
    },

    FindSelectedUrl: function(model) {
      if (this.urlcollection.length === 1) {
        var _a = this.urlcollection.last();
        Global.ServiceUrl = _a.get("url");
      } else if (model.get("isSelected") === 1) {
        Global.ServiceUrl = model.get("url");
        console.log(Global.ServiceUrl);
      }
    },

    SetDefaultUrl: function() {
      if (!this.urlcollection || this.urlcollection.length === 0) {
        //for (var url in Global.BetaServerUrl) {
        var selected = 0;
        //if(Global.BetaServerUrl[url] === Global.BetaServerUrl.CB) selected = 1;
        //var _attrib = {
        //url : Global.BetaServerUrl[url],
        //isSelected : selected //unselected default
        //};
        //this.urlcollection.create( _attrib );
        //}
        var _attrib = {
          url: Global.BetaServerUrl.CB,
          isSelected: selected //unselected default
        };

        this.urlcollection.create(_attrib);
      }
    },

    ShowClearBtn: function(e) {
      e.stopPropagation();
      if (e.keyCode === 13) {
        this.HideClearBtn();
        return;
      }
      var _id = e.target.id;
      var _val = $("#" + _id).val();
      var _strLength = _val.length;
      var _pos = $("#" + _id).position(); // retrieves the position of the given element
      var _width = $("#" + _id).width();

      if (_strLength <= 0) {
        this.HideClearBtn();
      } else {
        if (_pos !== null || _pos !== "") {
          $("#" + _id + "ClearTxt").css({
            top: (_pos.top + 8),
            left: (_pos.left + (_width - 10))
          });
          $("#" + _id + "ClearTxt").fadeIn();
        }
      }
    },

    HideClearBtn: function() {
      $(".clearTextBtn").fadeOut();
    },

    ClearPassword: function() {
      $("#password").val("");
    },

    ClearUserText: function(e) {
      var _id = e.target.id;
      var id = _id.substring(0, _id.indexOf('ClearTxt'));
      $("#" + id).val("");
      $("#" + id).focus();
      this.HideClearBtn();
    },

    Login: function(e) {
      e.preventDefault();
      $("#password").blur();
      if (!this.ValidateFields()) return;
      _showActivityIndicator();
      this.DoLogin();
    },

    DoLogin: function(removeProductType) {
      var self = this;
      this.model.url = Global.ServiceUrl + Service.POS + "signin" + "?isFromAutoSignIn=" + isAutoSignin;
      this.model.save(null, {
        success: function(model, result) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          this.ProcessLogin(result);
        }.bind(this),
        error: function(model, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          if (!removeProductType) {
            this.DoLogin(true);
            return;
          }
          _showLoginTxt();
          model.RequestError(error, "Login Failed");
        }.bind(this)
      }, removeProductType);
      isAutoSignin = false;
    }
,
    RequestError: function(error, errorHeader, errorMsg) {
      switch (error.statusText) {
        case "timeout":
          navigator.notification.alert("Request timed out. Check internet settings and try again.", null, errorHeader, "OK");
          break;
        case "abort":
          navigator.notification.alert("Unable to process request. Please check your internet settings.", null, errorHeader, "OK");
          break;
        default:
          if (!errorMsg) {
            errorMsg = "The remote server returned an error.";
          }
          navigator.notification.alert(errorMsg, null, errorHeader, "OK");
          break;
      }
    },

    ProcessLogin: function(result) {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      if (!result.ErrorMessage) {
        var _serverVersion = Shared.GetVersionAttributes(result.AppVersion);
        var serverVersion2 =  _serverVersion.Major + "." + _serverVersion.Minor;
        //_serverVersion = _serverVersion.Major + "." + _serverVersion.Minor + "." + _serverVersion.Build;
        _serverVersion = _serverVersion.Major + "." + _serverVersion.Minor;

        var _patchVersion = Shared.GetVersionAttributes(result.PatchVersion);

        if (this.IsVersionCompatible(_serverVersion)) {
          if (this.IsPatchCompatible(_patchVersion, _serverVersion)) {
            Global.ServerVersion = _serverVersion;
          } else {
            this.Logout(); //Log-Out User
            //For POS Performance, a specific patch is required.
            var _message = "Although Connected Sale supports your backend version, a patch is required before you can continue. <br><br>";
            _message = _message + 'Please contact support for more details.';

            navigator.notification.alert(_message, null, "Version Incompatibility", "OK");
            _showLoginTxt();
            return;
          }
        } else {
          this.Logout(); //Log-Out User
          var _message = "ConnectedSale and server are not compatible.\n";
          _message = _message + "ConnectedSale Version: " + Global.AppVersion + "\n";
          _message = _message + "Server Version: " + _serverVersion;
          if (Global.isBrowserMode) {
            _message = "ConnectedSale and server are not compatible.<br>";
            _message = _message + "ConnectedSale Version: " + Global.AppVersion + "<br>";
            _message = _message + "Server Version: " + _serverVersion;
          }
          navigator.notification.alert(_message, null, "Version Incompatibility", "OK");
          _showLoginTxt();
          return;
        }

        if (result.ProductEdition == "Connected Sale") {
          if (!Global.IsAllowedUser(result.UserCode)) {
            this.Logout(); //Log-Out User
            var _message = "User is not authorized to log in.";
            navigator.notification.alert(_message, null, "Access Denied", "OK");
            _showLoginTxt();
            return;
          }
        }

        if (result.Message) {
          $("#username").blur();
          $("#password").blur();

          if (result.Message.indexOf("other location") > 0) {
            console.log(result.Message);
            _thisLogin = this;
            var msg = "You have signed in to other location(s).\n Do you want to sign out from them?";
            if (Global.isBrowserMode) msg = "You have signed in to other location(s).<br>Do you want to sign out from them?";
            navigator.notification.confirm(msg, _forceLogOut, "Welcome", ['Yes', 'No']);
          } else {
            var msg = result.Message;

            if (Global.isBrowserMode) msg = result.Message.replace(/\n/g, '<br />');
            navigator.notification.alert(msg, null, "Welcome", "OK");
          }
        }

        //Initialize Appplet
        // Shared.LoadServiceApplet();

        Global.UserInfo = result;
        if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();

        //If version is higher than or equal to 14.0.0

        if(serverVersion2 < "18.1") {
          if (Shared.CompareVersions(_serverVersion, "14.0.0") < 2) Global.IsPatchCompatible = true;
        }
        else Global.IsPatchCompatible = true;


        window.location.hash = 'dashboard';
        _showLoginTxt();
        _hideActivityIndicator();
        $(".loginFormInput").val("");
      } else {
        var msg = result.Message || result.ErrorMessage;
        if (Global.isBrowserMode) msg = msg.replace(/\n/g, '<br />');

        navigator.notification.alert(msg, null, "Error Logging In", "OK");
        _showLoginTxt();
      }
    },

    IsVersionCompatible: function(serverVersion) {
      /*
       * If server version is below the minimum supported version for backwards compatibility, server and client version must be the same.
       */
         var serverVersion2 = Shared.GetVersionAttributes(serverVersion);
         serverVersion2 = serverVersion2.Major +  "." + serverVersion2.Minor;
         var compareVersions = 0;
       if (serverVersion2 >= "18.1") {
            if (Global.isBrowserMode) compareVersions = Shared.CompareMajorMinorVersions(serverVersion2, Global.MinimumSupportedVersionForDesktop);
            else compareVersions = Shared.CompareMajorMinorVersions(serverVersion2, Global.MinimumSupportedVersion);

            if (compareVersions > 1) {
              var _clientVersion = Global.AppVersion;
              if (_clientVersion != serverVersion2) return false;
            }
            /*
             * If App/Client version is lower than the server version, do not allow to continue.
             */
            compareVersions = Shared.CompareMajorMinorVersions(serverVersion2, Global.AppVersion)
            if (compareVersions == 1) return false;
       }
       else {

            if (Global.isBrowserMode) compareVersions = Shared.CompareVersions(serverVersion, Global.MinimumSupportedVersionForDesktop);
            else compareVersions = Shared.CompareVersions(serverVersion, Global.MinimumSupportedVersion);

            if (compareVersions > 1) {
              var _clientVersion = Global.AppVersion;
              if (_clientVersion != serverVersion) return false;
            }
            /*
             * If App/Client version is lower than the server version, do not allow to continue.
             */
            compareVersions = Shared.CompareVersions(serverVersion, Global.AppVersion)
            if (compareVersions == 1) return false;
       }





      return true;
    },

    IsPatchCompatible: function(patchVersion, serverVersion) {
      /*
		http://122.2.10.36:8080/browse/CB-257 - POS Performance big issue [WDE-993-76041]
		We require a minimum patch version to resolve issue. Don't continue unless minimum requirement is met.
		*/
      // TODO: set correct patch version
      var minPatchVersion14 = 485,
        minPatchVersion14_0_1 = 55,
        patch = patchVersion.Interim;

       var serverVersion2 = Shared.GetVersionAttributes(serverVersion);
       serverVersion2 = serverVersion2.Major +  "." + serverVersion2.Minor;

       if (serverVersion2 >= "18.1") {
            if (Shared.CompareMajorMinorVersions(serverVersion2, "14.0") == 2) return true;

            //Server is above 14.0.0
            serverVersion = Shared.GetVersionAttributes(serverVersion);
            if (serverVersion.Major == 14 && serverVersion.Minor == 0) {
              if (patch < minPatchVersion14) return false;
            } else if (serverVersion.Major == 14 && serverVersion.Minor == 0 && serverVersion.Build == 1) {
              if (patch < minPatchVersion14_0_1) return false;
            }
       }

      else {
            //Server is below 14.0.0
            if (Shared.CompareVersions(serverVersion, "14.0.0") == 2) return true;

            //Server is above 14.0.0
            serverVersion = Shared.GetVersionAttributes(serverVersion);
            if (serverVersion.Major == 14 && serverVersion.Minor == 0 && serverVersion.Build == 0) {
              if (patch < minPatchVersion14) return false;
            } else if (serverVersion.Major == 14 && serverVersion.Minor == 0 && serverVersion.Build == 1) {
              if (patch < minPatchVersion14_0_1) return false;
            }
      }


      return true;
    },

    ValidateFields: function() {
      Global.Username = $("#username").val().trim();
      Global.Password = $("#password").val();

      if (!Global.ServiceUrl || Global.ServiceUrl === "") {
        this.Connect();
        return false;
      } else if (!Global.Username) {
        navigator.notification.alert("Username is required.", null, "Login Failed", "OK");
        return false;
      } else if (!Global.Password) {
        navigator.notification.alert("Password is required.", null, "Login Failed", "OK");
        return false;
      }

      return true;
    },

    Connect: function(e) {
      if (e) e.preventDefault();
      $("#username").blur();
      $("#password").blur();
      this.connectionview.Show();
      $(".loginFormInput").attr('disabled', 'disabled');
      $(".loginFormButton").addClass('ui-disabled');
      $("#loginForm").fadeTo('fast', .3);
    },

    OpenWebsite: function(e) {
      e.preventDefault();
      navigator.notification.confirm("You will be redirected to Connected Business website.", _redirectToLink, "Are you sure you want to Continue?", "Yes,No");
    },

    Password_keyup: function(e) {
      if (e.keyCode === 13) {
        $("#password").blur();
        this.HideClearBtn();
        this.Login(e);
      }
    },

    //GEMINI : CSL-4763
    ForceSignOutOtherLocations: function() {
      var tmpModel = new LookupCriteriaModel();
      tmpModel.url = Global.ServiceUrl + Service.POS + Method.FORCESIGNOUT;
      tmpModel.save(null, {
        success: function(model, result) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          console.log('Force SignOut - Success');
        },
        error: function(model, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          console.log('Force SignOut - Error');
        }
      });
    },

    //GEMINI : CSL-4862
    Logout: function() {
      var tmpModel = new LookupCriteriaModel();
      tmpModel.url = Global.ServiceUrl + Service.POS + Method.SIGNOUT;
      tmpModel.save(null, {
        success: function() {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          console.log('Log-out Success');
        },
        error: function(model, error) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          console.log('Log-out Error');
        }
      }, true);
    }
  });


  var _bounce = function() {
    $(".loginFormInput").effect("bounce", {
      direction: 'left',
      times: 3
    }, 200);
  }

  var _ajaxError = function(button) {
    if (button === 1) {
      $("#login-btn .ui-btn-text").text("Log In");
      $("#login-btn").css("text-align", "center");
    } else {
      return;
    }
  }

  var _showActivityIndicator = function() {
    var target = document.getElementById('login-btn');
    _spinner = Spinner;
    _spinner.opts.left = 10; // Left position relative to parent in px
    _spinner.opts.radius = 3;
    _spinner.opts.lines = 9;
    _spinner.opts.length = 4; // The length of each line
    _spinner.opts.width = 3; // The line thickness

    _spinner.opts.color = '#000';

    _spinner.spin(target, "Logging in...");
    $("#login-btn .ui-btn-text").text("Logging in...");
    $("#login-btn").css("text-align", "right");
    $("#login-btn").addClass("ui-disabled");
    $("#connection-btn").addClass("ui-disabled");
    $("#username").addClass("ui-disabled");
    $("#password").addClass("ui-disabled");
  }

  var _hideActivityIndicator = function() {
    _spinner = Spinner;
    _spinner.stop();
  }

  var _showLoginTxt = function() {
    $("#login-btn .ui-btn-text").text("Log in");
    $("#login-btn").css("text-align", "center");
    _hideActivityIndicator();
    $("#login-btn").removeClass("ui-disabled");
    $("#connection-btn").removeClass("ui-disabled");
    $("#username").removeClass("ui-disabled");
    $("#password").removeClass("ui-disabled");
  }

  var _redirectToLink = function(button) {
    if (button === 1) {
      window.location.replace("http://connectedbusiness.com/pos.html");
    } else {
      return;
    }
  }


  //GEMINI : CSL-4763
  var _thisLogin;
  var _forceLogOut = function(button) {
    if (button === 1) {
      _thisLogin.ForceSignOutOtherLocations();
    }
  }


  return LoginView;
});
