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
  'collection/base',
  'text!template/15.0.0/reports/print/printdialog/reportcriteria/criteria.tpl.html',
  'js/libs/moment.min.js',
  'js/libs/format.min.js'
], function($, $$, _, Backbone, Global, Service, Method, Shared,
  BaseModel, LookUpCriteriaModel,
  BaseCollection,
  template, reportListTemplate) {

  var _optionVal = false;
  var CriteriaItemsView = Backbone.View.extend({

    _template: _.template(template),

    BindEvents: function() {
      var self = this;
      $(this.classID.CID + " .addCriteria").on("tap", function() {
        self.SelectedItem();
      });
      $(this.classID.CID).on("tap", function() {
        self.SelectedItem();
      });
      $(this.classID.CID + " .removeCriteria").on("tap", function(e) {
        self.RemoveCriteria(e);
      });
      $(this.classID.InputID).on("blur", function() {
        self.SaveChanges();
      });
    },

    initialize: function() {
      this.classID = {
        CID: " #" + this.cid + " ",
        ModelID: this.cid,
        InputID: " #" + this.cid + " " + "#txtInput-" + this.cid
      }
      this.render();
    },
    SelectedItem: function() {

    },
    SaveChanges: function() {
      var criteria = $(this.classID.InputID).val();
      if (this.type == "datetime") {
        if (!Shared.IsNullOrWhiteSpace(criteria)) {
          criteria = this.FormatDateToJSON(criteria);
        }
      }
      var _colName = this.model.get("ColumnName");
      this.model.set({
        CriteriaValue: criteria
      });
      this.trigger('updateLineItem', this.model);
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
    FormatDateToJSON: function(date) {
      return moment(date).format("M/D/YYYY hh:mm:ss A");
    },
    RemoveCriteria: function(e) {
      e.preventDefault();
      this.trigger('RemoveCriteria', this.model);
      $(this.classID.CID).remove();
    },
    ValidateKeyInput: function(e, elemId, allowPoint) {
      var unicode = e.keyCode;
      var num = $(elemId).val();
      var hasPoint = false;
      switch (unicode) {
        case 48:
        case 49:
        case 50:
        case 51:
        case 52: //0-9
        case 53:
        case 54:
        case 55:
        case 56:
        case 57: //0-9
        case 46:
        case 37:
        case 39:
        case 8: // back,delete,left,right
        case 13: //enter
          return true;
        case 190: //decimal point
          if (allowPoint) {
            if (num.length > 0) {
              for (var i = 0; i <= num.length; i++) {
                if (num[i] == ".") {
                  hasPoint = true;
                }
              }
              if (hasPoint == true) {
                e.preventDefault();
                return false;
              } else {
                return true;
              }
            }
          } else {
            e.preventDefault();
            return false;
          }
        default:
          e.preventDefault();
          return false;
      }
    },
    ConvertInputType: function(type) {
      switch (type) {
        case "numeric":
        case "double":
        case "float":
        case "bigint":
        case "tinyint":
        case "INT":
          type = "number";
          break;
        case "time":
          type = "time";
          break;
        case "date":
        case "datetime":
        case "smalldatetime":
          type = "date";
          break;
        case "bit":
          type = "checkbox";
          break; // true/false

        default:
          type = "text";
          break;
      }

      return type;
    },
    OptionChange: function() {
      var _id = this.classID.CID + " td  #chkOption";
      _optionVal = Shared.CustomCheckBoxChange(_id, _optionVal);
      this.model.set({
        CriteriaValue: _optionVal
      });
      this.trigger('updateLineItem', this.model);
    },
    TriggerOptionChangeOnload: function() {
      _optionVal = true;
      this.model.set({
        CriteriaValue: _optionVal
      });
      this.trigger('updateLineItem', this.model);
    },
    AssignPlaceHolder: function(type, model) {
      var _placeHolder = model.get("ColumnName");
      if (type == "datetime" || type == "date") {
        _placeHolder = "mm/dd/yyyy";
      }
      return _placeHolder;
    },
    InitializeInputProperties: function(_type, dataType) {
      var self = this;
      switch (_type) {
        case "checkbox":
          $(this.classID.CID + " #chkOption").addClass("icon-check");
          $(this.classID.CID + " #chkOption").show();
          $(this.classID.CID + " #chkOption").on("tap", function() {
            self.OptionChange();
          });
          //self.OptionChange();
          this.TriggerOptionChangeOnload();
          $(this.classID.InputID).hide();
          break;
        case "date":
        case "datetime":
          $(self.classID.InputID).addClass('custom-date-time');
          break;
        case "number":
          if (dataType == "double" || dataType == "float" || dataType == "numeric") {
            $(self.classID.InputID).on("keydown", function(e) {
              self.ValidateKeyInput(e, inputID, true);
            });
          } else {
            $(self.classID.InputID).on("keydown", function(e) {
              self.ValidateKeyInput(e, inputID, false);
            });
          }
          break;
      }
    },
    LoadBrowserDatePicker: function(type) {
      var self = this;
      if (Global.isBrowserMode) {
        $(function() {
          if (type == "date" || type == "datetime") {
            //Shared.BrowserModeDatePicker(self.classID.InputID, 'datepicker');
            if (type == "date") {
              Shared.BrowserModeDatePicker(self.classID.InputID, 'datepicker');
            } else {
              Shared.BrowserModeDatePicker(self.classID.InputID, 'datetimepicker');
            }
            $(self.classID.InputID).on("change", function() {
              self.SaveChanges();
            });
          }
        });
      }
      this.BindEvents();
    },

    render: function() {
      var self = this;
      console.log("daTATYPE : " + this.model.get("DataType"));
      var _type = this.ConvertInputType(this.model.get("DataType"));
      var _maxLength = this.model.get("MaxLength");
      var _colName = this.model.get("ColumnName");
      var _placeHolder = this.AssignPlaceHolder(_type, this.model);
      this.type = _type;
      var criteriaVal = "";
      if (!Shared.IsNullOrWhiteSpace(this.model.get("DefaultValue"))) criteriaVal = this.model.get("DefaultValue");
      this.model.set({
        ModelID: self.cid,
        Type: _type,
        MaxLength: _maxLength,
        CriteriaValue: criteriaVal,
        PlaceHolder: _placeHolder
      });
      this.$el.append(this._template(this.model.toJSON()));
      this.InitializeInputProperties(_type, this.model.get("DataType"));
      this.LoadBrowserDatePicker(_type);
      if (!Shared.IsNullOrWhiteSpace(criteriaVal)) $(this.classID.InputID).val(criteriaVal);
      return this;
    },
    InitializeChildViews: function() {
      this.BindEvents();
    },

  });

  return CriteriaItemsView;
});
