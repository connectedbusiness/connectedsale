/**
 * @author Connected Business
 */
define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'shared/shared',
  'shared/service',
  'shared/method',
  'model/base',
  'view/login/url',
  'view/spinner',
  'text!template/login/connection.tpl.html'
], function($, $$, _, Backbone, Global, Shared, Service, Method, BaseModel, UrlView, Spinner, template) {

  var Overlay = {
    Show: function() {
      $("#connection-overlay").show();
    },
    Hide: function() {
      $("#connection-overlay").hide();
    }
  };

  var ConnectionView = Backbone.View.extend({
    _template: _.template(template),
    events: {
      "tap #serviceUrl": "showClear_tap",
      "tap #done-url": "closeForm_tap",
      "blur #serviceUrl": "hideClear_blur",
      "keyup #serviceUrl": "input_keyup",
      "tap #serviceUrlClearBtn": "clearInput_tap",
      "tap #addconnection-btn": "addInput_tap"
    },

    LockConnectionScreen: function(lock, message) {
      if (lock) {
        Overlay.Show();
        $("#serviceUrl").blur();
        target = document.getElementById('connectionForm');
        this.ShowActivityIndicator(target);
        $("<h5>" + message + "</h5>").appendTo($("#spin"));
      } else {
        Overlay.Hide();
        this.HideActivityIndicator();
      }
    },

    ShowActivityIndicator: function(target) {
      if (!target) {
        target = document.getElementById('connectionForm');
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

    HideActivityIndicator: function() {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      _spinner = Spinner;
      _spinner.stop();
      $("#spin").remove();
    },

    initialize: function() {
      this.$el.html(this._template);
      this.$el.trigger('create');
      this.Hide();
      $('body, html').on('tap', this.outsideMenuHandler);
      this.collection.on('selected', this.SetDefault, this);
      this.collection.on('removeUrl', this.RemoveUrl, this);
      this.collection.on('editUrl', this.EditUrl, this);
    },

    addInput_tap: function(e) {
      this.ProcessAdd();
    },

    clearInput_tap: function(e) {
      var _id = e.target.id;
      var id = _id.substring(0, _id.indexOf('ClearBtn'));
      $("#" + id).val("");
      this.HideClearBtn();
    },

    closeForm_tap: function(e) {
      e.preventDefault();
      this.CheckCollectionStatus();
    },

    hideClear_blur: function() {
      this.ChangeButton();
      $(".clearTextBtn").fadeOut();
    },

    input_keyup: function(e) {
      e.preventDefault();

      if (e.keyCode === 13) {
        this.ProcessAdd();
      } else {
        this.showClear_tap(e);
      }
    },

    outsideMenuHandler: function() {
      $(".deletebtn-overlay").hide();
    },

    showClear_tap: function(e) {
      e.stopPropagation();

      var _id = e.target.id;
      var _val = $("#" + _id).val();
      var _strLength = _val.length;
      var _pos = $("#" + _id).position(); // retrieves the position of the given element
      var _width = $("#" + _id).width();

      if (_strLength <= 0) {
        this.hideClear_blur();
      } else {
        if (_pos !== null || _pos !== "") {
          $("#" + _id + "ClearBtn").css({
            top: (_pos.top + 15),
            left: (_pos.left + (_width - 18))
          });
          $("#" + _id + "ClearBtn").show();
        }
      }
    },

    AddServiceUrl: function() {
      if (!Global.isBrowserMode) this.CheckIfOnline();
      this.ResetSelected();
      this.SaveUrl();
    },

    ChangeButton: function(type) {
      switch (type) {
        case "Save":
          $("#done-url").text("Save");
          $("#done-url").attr("id", "save-url");
          break;
        case "Edit":
          $("#addconnection-btn > i").removeClass("icon-plus");
          $("#addconnection-btn > i").addClass("icon-save");
          break;
        case "Add":
          $("#addconnection-btn > i").removeClass("icon-save");
          $("#addconnection-btn > i").addClass("icon-plus");
          break;
        default:
          $("#save-url").text("Done");
          $("#save-url").attr("id", "done-url");
          break;
      }
    },


    CheckDefaultUrl: function() {
      var _isSelected = this.collection.find(function(model) {
        return model.get("isSelected") === 1;
      });

      if (_isSelected) {
        return;
      } else {
        this.SetSelected();
      }
    },

    CheckCollectionStatus: function() {
      if (this.collection.length === 0) {

        if (!Shared.IsNullOrWhiteSpace($("#serviceUrl").val())) {
          this.AddServiceUrl();

          this.Close();
        } else navigator.notification.alert("Specify a Service URL in order to proceed.", null, "URL is Required", "OK");
        return;
      } else {
        if (!Shared.IsNullOrWhiteSpace($("#serviceUrl").val())) {
          if (this.mode === Global.MaintenanceType.CREATE) this.AddServiceUrl();
          else this.UpdateServiceUrl();
        }

        this.Close();
      }
    },

    CheckDupe: function() {
      var isExist = this.FindUrl(Global.ServiceUrl);

      if (isExist) {
        navigator.notification.alert("Service URL already exists.", null, "URL Exists", "OK");
        $("#serviceUrl").val("");
      } else {
        var _attrib = {
          url: Global.ServiceUrl,
          isSelected: 0 //unselected default
        };

        var self = this;

        this.collection.create(_attrib, {
          error: function(model, error, response) {
            if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
            model.RequestError(error, "Error adding service URL")
          },
          success: function() {
            if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          }
        });
        this.SetSelected();
        this.ChangeButton();
      }
    },

    CheckIfOnline: function() {
      var online = navigator.onLine;
      if (!online) {
        navigator.notification.alert("Unable to process request. Please check your internet settings.", null, "Connection Error", "OK");
      }

    },

    CheckLimit: function() {
      if (this.collection.length > 5) {
        var _m = this.collection.first();
        _m.destroy();
      }
    },

    ClearServiceUrl: function() {
      $("#serviceUrl").val("");
      this.isClear = null;
    },

    Close: function() {
      $("#serviceUrl").blur();
      this.mode = Global.MaintenanceType.CREATE;
      this.ChangeButton("Add");

      this.$el.hide();
      $(".loginFormInput").removeAttr('disabled');
      $(".loginFormButton").removeClass('ui-disabled');
      $("#loginForm").fadeTo('fast', 1);
      $("#loginBg").fadeTo('fast', 1);
      this.trigger("Close");
    },

    EditUrl: function(model) {
      this.mode = Global.MaintenanceType.UPDATE;
      this.toBeEdited = model;
      this.ChangeButton("Edit");
      $("#serviceUrl").val(model.get("url"));
    },

    FindUrl: function(url) {
      if (!Shared.IsNullOrWhiteSpace(url)) {
        var self = this;
        var _existingItem = this.collection.find(function(model) {
          var val = model.get("url").toUpperCase() === url.toUpperCase();
          if (val) {
            model.set("isSelected", 1);
            self.SetDefault(model);
          }
          return val;
          //return model.get("url").toUpperCase() === url.toUpperCase();
        });

        if (_existingItem) return true;
      }

      return false;
    },

    Hide: function() {
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
      this.$el.hide();
    },

    LoadUrl: function() {
      var self = this;
      this.collection.fetch({
        isLocalStorage: true,
        error: function(model, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          model.RequestError(error, "Error Loading default URL")
        },
        success: function() {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          self.SetDefaultUrl();
        }
      });
    },

    ProcessAdd: function() {
      if (this.mode === Global.MaintenanceType.UPDATE && this.collection.length >= 1) {
        this.UpdateServiceUrl();
        return;
      }
      this.AddServiceUrl();
    },

    RemoveCheckImage: function(model) {
      this.RenderUrlView();
    },

    RemoveUrl: function(model) {
      this.isClear = false;
      //this.toBeEdited = null;
      if (!Global.isBrowserMode) this.CheckIfOnline();
      if (this.collection.length === 1) {
        Global.ServiceUrl = "";
        //$("#serviceUrl").val("");
      }

      var isSelected = model.get("isSelected");
      model.destroy();
      if (isSelected) {
        this.SetFirstUrlAsDefault();
        //this.SetDefaultCredentials();
      }
    },

    RenderUrlView: function(isClear) {
      $("#urlContainer").append("<div id='urlMainContainer'></div>");
      if (this.urlview) {
        this.urlview.remove();
        this.urlview.unbind();
        this.urlview = null;
      }

      this.urlview = new UrlView({
        el: $("#urlMainContainer"),
        collection: this.collection
      });

      $("#serviceUrl-div > #serviceUrl").focus();
      if (isClear === undefined) this.ClearServiceUrl();
    },

    ResetSelected: function() {
      this.collection.each(this.ResetSelectedUrl, this);
    },

    ResetSelectedUrl: function(model) {
      model.save({
        isSelected: 0
      }, {
        success: function(model, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          $("#urlList").attr("ui-disabled");
        },
        error: function(model, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          model.RequestError(error, "Error setting default URL");
        }
      });
    },

    ResetTextColor: function(model) {
      $("#urlList li").css({
        'font-weight': 'normal',
        'color': '#000'
      });

      $("#" + model.get("id")).css({
        'font-weight': 'bold',
        'color': '#324f85'
      });
    },

    SaveUrl: function() {
      var url = this.TrimServiceUrl();

      if (url === false) {
        navigator.notification.alert("URL specified is invalid. Please try again.", null, "Invalid URL", "OK");
        return;
      } else if (Shared.IsNullOrWhiteSpace(url)) {
        navigator.notification.alert("Specify a Service URL in order to proceed.", null, "URL is Required", "OK");
        return;
      } else {
        this.CheckIfActiveURL(url);
      }
    },

    DoSaveUrl: function(url) {
      Global.ServiceUrl = url;
      if (this.mode == Global.MaintenanceType.CREATE) {
        this.CheckLimit();
        this.CheckDupe();
        this.RenderUrlView();
        this.mode = Global.MaintenanceType.CREATE;
        this.LoadUrl();
        this.SetDefaultCredentials();
        console.log(this.collection.length);
      } else { //if edit mode
        try {
          this.ResetSelected();
          this.toBeEdited.save({
            url: url,
            isSelected: 1
          }, {
            success: function() {
              if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
            }
          });
          this.RenderUrlView();
        } catch (e) {
          this.mode = Global.MaintenanceType.CREATE;
          this.AddServiceUrl();
        }
        this.toBeEdited = null;
      }

      this.mode = Global.MaintenanceType.CREATE;
      this.ChangeButton("Add");
      if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
    },

    CheckIfActiveURL: function(url) {      
      this.LockConnectionScreen(true, "Validating URL Service");
      var self = this;
      Global.Username = "";
      Global.password = "";
      var mdl = new BaseModel();
      mdl.url = url + Service.POS + "signin" + "?isFromAutoSignIn=false";
      mdl.save(null, {
        success: function(model, result) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          self.LockConnectionScreen(false);
          self.DoSaveUrl(url);
        },

        error: function(model, error, response) {
          if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
          self.LockConnectionScreen(false);
          navigator.notification.alert("The Service URL entered is not active.", null, "Inactive Service URL", "OK");
        }
      }, true);
    },

    SetDefault: function(model) {
      if (this.collection.length >= 1) {
        if (!Global.isBrowserMode) this.CheckIfOnline();
        this.ResetSelected(model);
        model.save({
          isSelected: 1
        });

        this.RenderUrlView(this.isClear);
        Global.ServiceUrl = model.get("url");
        if (this.mode === Global.MaintenanceType.UPDATE) {
          $("#serviceUrl").val("");
          this.ChangeButton("Add");
          this.mode = Global.MaintenanceType.CREATE;
        }

        this.ChangeButton();
        this.SetDefaultCredentials();
      }
    },

    SetDefaultCredentials: function() {
      $("#username").val("");
      $("#password").val("");

      if (Global.BetaServerUrl.CB == Global.ServiceUrl) {
        $("#username").val("admin");
        $("#password").val("admin");
      }
    },

    SetDefaultUrl: function() {
      //use the Beta Server URL as the default URL if collection is empty.
      if (!this.collection || this.collection.length === 0) {
        var _attrib = {
          url: Global.BetaServerUrl.CB,
          isSelected: 0 //unselected default
        };

        this.collection.create(_attrib);

        Global.ServiceUrl = Global.BetaServerUrl.CB;

        this.SetSelected();
      }

      this.CheckDefaultUrl(); //if no url is currently set as selected then pick the first one in this case this.urlcollection.last().
      this.CheckLimit(); //check limit; if the number of url reached more than 5 delete the last one in this case this.urlcollection.first().
      this.RenderUrlView();
    },

    SetFirstUrlAsDefault: function() {
      var _a = this.collection.last();
      this.SetDefault(_a);
      this.mode = Global.MaintenanceType.CREATE;
    },

    SetSelected: function() {
      this.collection.each(function(model) {
        var _a = this.collection.last();
        if (model === _a) {
          model.save({
            isSelected: 1
          }, {
            success: function(model) {
              if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
            },
            error: function(model, error, response) {
              if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
              model.RequestError(error, "Error setting default URL");
            }
          }); //set to selected
        } else {
          model.save({
            isSelected: 0
          }, {
            success: function(model) {
              if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
            },
            error: function(model, error, response) {
              if (!Global.isBrowserMode) window.plugins.cbNetworkActivity.HideIndicator();
              model.RequestError(error, "Error setting default URL");
            }
          }); //set to unselected
        }
      }, this);

    },

    Show: function() {
      this.$el.show();
      this.LoadUrl();
      if (Global.isBrowserMode) $("#serviceUrl").focus();
    },

    TrimServiceUrl: function() {
      var _value = $("#serviceUrl").val().trim();
      if (_value != "") {
        var correctHttp = _value.indexOf("http://") !== 0;
        var correctHttps = _value.indexOf("https://") !== 0;
        var invalidHttp = _value.indexOf("http:/") !== 0;
        var invalidHttps = _value.indexOf("https:/") !== 0;

        if (!invalidHttp && correctHttp) _value = _value.replace("http:/", '');
        else if (!invalidHttps && correctHttps) _value = _value.replace("https:/", '');

        if (correctHttp && correctHttps) _value = "http://" + _value;

        if (_value.charAt(_value.length - 1) != '/') {
          _value = _value + '/';
        } else {
          var _lastCtr = _value.length - 1;
          for (var i = _lastCtr; i > 0; i--) //CLEAR all '//'
          {
            _value = _value.slice(0, -1);
            _value = _value.trim();
            if (_value.charAt(_value.length - 1) != '/') i = 0;
          }
          _value = _value + '/';
        }

        if (!this.CheckURL(_value)) {
          return false;
        }
      }

      return _value;
    },

    CheckURL: function(url) {
      var urlregex = new RegExp("^(http|https|ftp)\://([a-zA-Z0-9\.\-]+(\:[a-zA-Z0-9\.&amp;%\$\-]+)*@)*((25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9])\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[1-9]|0)\.(25[0-5]|2[0-4][0-9]|[0-1]{1}[0-9]{2}|[1-9]{1}[0-9]{1}|[0-9])|([a-zA-Z0-9\-]+\.)*[a-zA-Z0-9\-]+\.(com|edu|gov|int|mil|net|org|biz|arpa|info|name|pro|aero|coop|museum|[a-zA-Z]{2}))(\:[0-9]+)*(/($|[a-zA-Z0-9\.\,\?\'\\\+&amp;%\$#\=~_\-]+))*$");
      if (urlregex.test(url)) {
        return (true);
      }
      return (false);
    },

    UpdateServiceUrl: function() {      
      var url = this.TrimServiceUrl();
      var isExist = this.FindUrl(url);

      if (url === false) {
        navigator.notification.alert("The specified URL is invalid. Please try again.", null, "Invalid URL", "OK");
        $("#serviceUrl").val("");
        return;
      } else if (Shared.IsNullOrWhiteSpace(url)) {
        navigator.notification.alert("Specify a Service URL in order to proceed.", null, "URL is Required", "OK");
        return;
      } else if (isExist) {
        navigator.notification.alert("Service URL already exists.", null, "URL Exists", "OK");
        $("#serviceUrl").val(this.toBeEdited.attributes.url);
        return;
      } else {
        this.CheckIfActiveURL(url) //CSL-20120 : 12.2.13
      }
    },
  });
  return ConnectionView;
});
