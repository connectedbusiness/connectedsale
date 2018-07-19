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
  'shared/shared',
  'model/serialnumber',
  'model/lotnumber',
  'collection/base',
  'view/15.0.0/pos/seriallot/serial/serial',
  'text!template/15.0.0/pos/seriallot/serial/serials.tpl.html',
  'js/libs/iscroll.js'
], function(
  $, $$, _, Backbone, Global, Enum, Shared,
  SerialNumberModel, LotNumberModel,
  BaseCollection,
  SerialItemView,
  template) {
  var SerialListView = Backbone.View.extend({
    _template: _.template(template),

    initialize: function() {
      this.type = this.options.type;
      this.lineNum = this.options.lineNum;
      this.itemCode = this.options.itemCode;
      this.uom = this.options.uom;
      this.itemType = this.options.itemType;
      this.autoGenerate = this.options.autoGenerate;

      this.collection.on('startRendering', this.Show, this);
    },

    render: function() {
      this.$el.html(this._template);
      try {
        this.$("#serialListNumber").listview();
      } catch (e) {
        console.log("listview for serialListNumber already initalialized. Skip this message");
      }

    },

    DesignateSerial: function(attrib, collection) {
      switch (attrib) {
        case "ItemType":
          this.ShowCollection(collection);
          break;
        case "SerializeLot":
          this.ShowSerialLot(collection);
          break;
      }
    },

    HideElements: function() {
      if (Global.TransactionType === Enum.TransactionType.SalesRefund) {
        $(".checkbox-serialLot").show();
        $("#input-serialLot").addClass("ui-disabled");
        $("#add-serialLot").addClass("ui-disabled");
      } else if (this.autoGenerate && (this.itemType === Enum.ItemType.GiftCard || this.itemType === Enum.ItemType.GiftCertificate)) {
        $(".checkbox-serialLot").hide();
        $("#input-serialLot").addClass("ui-disabled");
        $("#add-serialLot").addClass("ui-disabled");
      } else {
        $(".checkbox-serialLot").hide();
        $("#input-serialLot").removeClass("ui-disabled");
        $("#add-serialLot").removeClass("ui-disabled");
      }
    },

    InitializeSerialItem: function(model) {
      var self = this;
      var serialItemView = new SerialItemView({
        model: model
      });


      this.$("#serialListNumber").append(serialItemView.render().el);
      serialItemView.Bind();


      this.RefreshListView();
      this.LoadScroll();
    },

    IsItemCodeExist: function(criteria1, criteria2, criteria3) {
      var existing = this.collection.find(function(model) {
        return model.get("ItemCode") === criteria1 && model.get("UnitMeasureCode") === criteria2 && model.get("LineNum") === criteria3;
      });

      if (existing) return false;
      return true;
    },

    LoadScroll: function() {
      var self = this;
      this.scrollAttrib = {
        vScrollbar: false,
        vScroll: true,
        snap: false,
        momentum: true,
        hScrollbar: true,
        onBeforeScrollStart: function(e) {
          var target = e.target;
          while (target.nodeType != 1) target = target.parentNode;

          if (target.tagName != 'INPUT') e.preventDefault();
        }
      }

      if (Global.isBrowserMode) Shared.UseBrowserScroll('#serialLot-content');
      else {
        if (!this.myScroll) {
          this.myScroll = new iScroll('serialLot-content', this.scrollAttrib);
        } else {
          setTimeout(function() {
            self.scroll = new iScroll('serialLot-content', self.scrollAttrib);
            self.myScroll.refresh();
          }, 500);
        }
      }
    },

    ProcessAddedData: function(model) {
      if ((model.get("ItemType") != Enum.ItemType.GiftCard && model.get("ItemType") != Enum.ItemType.GiftCertificate)) {
        this.ShowFilteredResult("SerializeLot", model.get("SerializeLot"), this.itemCode, this.uom, this.lineNum);
      } else {
        this.ShowFilteredResult("ItemType", model.get("ItemType"), this.itemCode, this.uom, this.lineNum);
      }
    },

    ProcessDeletedData: function(model) {
      this.serialItemView.deleteSerialLot();
    },

    /**
		 Refresh Listview after adding new data

		 @method RefreshListView
		 **/
    RefreshListView: function(element) {
      $("#serialListNumber").listview("refresh");
      $("#input-serialLot").val(""); //clear input field after successful add
      this.HideElements();
    },

    //Show : function(collection, el, type, lineNum, itemCode, uom, itemType, autoGenerate) {
    //	this.type         = type;
    //	this.itemCode     = itemCode;
    //	this.lineNum      = lineNum;
    //	this.uom          = uom;
    //	this.itemType     = itemType;
    //	this.autoGenerate = autoGenerate;
    //	this.$el          = el;
    //	this.render();

    //	if(this.type != null && this.type != undefined){
    //		this.ShowSerialLot(collection);
    //	} else {
    //		//if(!this.IsItemCodeExist(this.itemCode)){
    //			this.ShowGift(collection);
    //		//}
    //	}
    //},

    Show: function() {
      this.render();
      switch (Shared.IsNullOrWhiteSpace(this.type)) {
        case true:
          if (!this.IsItemCodeExist(this.itemCode, this.uom, this.lineNum)) {
            this.ShowGift(this.collection);
          }
          break;
        case false:
          this.ShowSerialLot(this.collection);
          break;
      }

      this.RefreshListView();

    },

    ShowCollection: function(collection) {
      var self = this;
      if (collection && collection.length > 0) {
        collection.each(function(model) {
          self.InitializeSerialItem(model);
        });
      }
    },

    ShowFilteredResult: function(attrib, value, itemCode, uom, lineNum) {
      $("#serialListNumber").html("");
      var filtered = new BaseCollection();

      var filteredCollection = this.collection.filter(function(model) {
        return model.get(attrib) === value && model.get("ItemCode") === itemCode && model.get("UnitMeasureCode") === uom && model.get("LineNum") === lineNum;
      });

      if (filteredCollection) {
        if (attrib != "SerializeLot") {
          this.DesignateSerial(attrib, filtered.reset(filteredCollection));
        } else {
          this.DesignateSerial(attrib, this.collection);
        }

      }
    },

    ShowGift: function(collection) {
      var self = this;
      if (collection && collection.length > 0) {
        collection.each(function(model) {
          if (model.get("ItemType") === self.itemType && model.get("ItemCode") === self.itemCode && model.get("UnitMeasureCode") === self.uom && model.get("LineNum") === self.lineNum) {
            self.InitializeSerialItem(model);
          }
        });
      }
    },

    ShowSerialLot: function(collection) {
      var self = this;
      if (collection && collection.length > 0) {
        collection.each(function(model) {
          if (!Shared.IsNullOrWhiteSpace(model.get("UnitMeasureCode"))) {
            if (model.get("ItemCode") === self.itemCode &&
              model.get("UnitMeasureCode") === self.uom &&
              model.get("LineNum") === self.lineNum)
              self.InitializeSerialItem(model);
          } else {
            if (model.get("ItemCode") === self.itemCode &&
              model.get("LineNum") === self.lineNum)
              self.InitializeSerialItem(model);
          }
        });
      }
    },

  });

  return SerialListView;
});
