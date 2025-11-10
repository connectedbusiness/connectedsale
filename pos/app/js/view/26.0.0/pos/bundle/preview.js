define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'model/base',
  'collection/base',
  'shared/enum',
  'shared/global',
  'shared/method',
  'shared/shared',
  'text!template/26.0.0/pos/bundle/stock.tpl.html',
  'text!template/26.0.0/pos/bundle/matrix.tpl.html',
  'text!template/26.0.0/pos/bundle/preview.tpl.html',
  'js/libs/iscroll.js'
], function($, $$, _, Backbone, BaseModel, BaseCollection, Enum, Global, Method, Shared, StockTemplate, MatrixTemplate, PreviewTemplate) {
  return Backbone.View.extend({
    stockTemplate: _.template(StockTemplate),
    matrixTemplate: _.template(MatrixTemplate),
    previewTemplate: _.template(PreviewTemplate),
    events: {
      'change select': 'change'
    },
    initialize: function() {
      this.$el.attr('style', 'padding: 10px;');
      this.type = this.options.type;
      this.code = this.options.code;
      this.items = this.options.matrixItems;
      this.attributes = new BaseCollection();

      switch (this.type) {
        case Enum.ItemType.MatrixGroup:
          this.processMatrix();
          this.fetchAttributes();
          this.$el.find('select').selectmenu().selectmenu('refresh');
          break;
        case Enum.ItemType.Stock:
          this.processStock();
          break;
      }
    },
    render: function() {
      return this;
    },
    getImage: function(code) {
      return Global.ServiceUrl + Method.IMAGES + code + '.png?' + Math.random();
    },
    loadScroll: function() {
      var id = 'bundle-configurator-preview';
      this.scrollAttrib = {
        vScrollbar: false,
        vScroll: true,
        snap: false,
        momentum: true,
        hScrollbar: true,
        onBeforeScrollStart: function(e) {
          var target = e.target;
          while (target.nodeType != 1) target = target.parentNode;

          if (target.tagName != 'SELECT') e.preventDefault();
        }
      };

      if (Global.isBrowserMode) Shared.UseBrowserScroll('#' + id);
      else {
        if (!this.myScroll) this.myScroll = new iScroll(id, this.scrollAttrib);
        else this.myScroll.refresh();
      }
    },
    processMatrix: function() {
      this.collection.comparator = function (model) {
        return model.get('PositionID');
      };

      this.collection.sort();
      var attribCodes = _.uniq(this.collection.pluck('AttributeCode')),
        attribValues = _.uniq(this.collection.pluck('AttributeValueCode'));

      this.$el.append(this.previewTemplate({
        'ImageLocation': this.getImage(this.code)
      }));

      _.each(attribCodes, function(key, i) {
        this.$el.append(this.matrixTemplate({
          AttributeCode: key,
          ID: (i + 1),
          ItemCode: this.model.get('ItemCode')
        }));
      }.bind(this));

      this.collection.each(function(model) {
        var id = model.get('PositionID'),
          valueDescription = model.get('AttributeValueDescription'),
          valueCode = model.get('AttributeValueCode'),
          itemCode = model.get('ItemCode'),
          code = model.get('AttributeCode'),
          element = this.$('[data-itemcode="' + itemCode + '"][data-attributecode="' + code + '"]');

        if (element.data('attributecode') == code) {
          element.append(new Option(valueDescription, valueDescription)).selectmenu().selectmenu('refresh');
        }

        if (id != 1) this.$el.find('#' + id).attr('disabled', true);
      }.bind(this));
    },
    processStock: function() {
      this.model.set('ImageLocation', this.getImage(this.code));
      this.$el.html(this.stockTemplate(this.model.attributes));
    },
    setAttributes: function(id, item, code, value) {
      if (item) {
        switch (parseInt(id)) {
          case 1:
            item.set({ 'AttributeCode1': code, 'Attribute1': value });
            break;
          case 2:
            item.set({ 'AttributeCode2': code, 'Attribute2': value });
            break;
          case 3:
            item.set({ 'AttributeCode3': code, 'Attribute3': value });
            break;
          case 4:
            item.set({ 'AttributeCode4': code, 'Attribute4': value });
            break;
          case 5:
            item.set({ 'AttributeCode5': code, 'Attribute5': value });
            break;
          case 6:
            item.set({ 'AttributeCode6': code, 'Attribute6': value });
            break;
        };
      }
    },
    createAttributes: function(id, itemCode, code, value) {
      var object = new BaseModel({
        'AttributeCode1': (id === '1') ? code : null,
        'AttributeCode2': (id === '2') ? code : null,
        'AttributeCode3': (id === '3') ? code : null,
        'AttributeCode4': (id === '4') ? code : null,
        'AttributeCode5': (id === '5') ? code : null,
        'AttributeCode6': (id === '6') ? code : null,
        'Attribute1': (id === '1') ? value : null,
        'Attribute2': (id === '2') ? value : null,
        'Attribute3': (id === '3') ? value : null,
        'Attribute4': (id === '4') ? value : null,
        'Attribute5': (id === '5') ? value : null,
        'Attribute6': (id === '6') ? value : null,
        'PositionID': id,
        'ItemID': this.model.cid,
        'ItemCode': itemCode,
        'ItemMatrixGroupCode': itemCode
      });

      this.attributes.add(object);
      return object;
    },
    findAttributes: function(itemCode, id) {
      return (this.attributes) ? this.attributes.find(function(attrib) {
        return attrib.get('ItemMatrixGroupCode') == itemCode && attrib.get('ItemID') == id;
      }) : null;
    },
    getTrimmedAttrib: function(item) {
      if (item) {
        var attrib1 = Shared.IsNullOrWhiteSpace(item.get('Attribute1')) ? '' : item.get('Attribute1'),
          attrib2 = Shared.IsNullOrWhiteSpace(item.get('Attribute2')) ? '' : '-' + item.get('Attribute2'),
          attrib3 = Shared.IsNullOrWhiteSpace(item.get('Attribute3')) ? '' : '-' + item.get('Attribute3'),
          attrib4 = Shared.IsNullOrWhiteSpace(item.get('Attribute4')) ? '' : '-' + item.get('Attribute4'),
          attrib5 = Shared.IsNullOrWhiteSpace(item.get('Attribute5')) ? '' : '-' + item.get('Attribute5'),
          attrib6 = Shared.IsNullOrWhiteSpace(item.get('Attribute6')) ? '' : '-' + item.get('Attribute6');
        return attrib1 + attrib2 + attrib3 + attrib4 + attrib5 + attrib6;
      }
    },
    filterItemsByAttrib: function(args) {
      return this.items.where(args);
    },
    formatParams: function (args) { 
      return {
        "ItemMatrixGroupCode": args.code,
        "AttributeDescription1": ((args.attrib1) ? args.attrib1 : ""),
        "AttributeDescription2": ((args.attrib2) ? args.attrib2 : ""),
        "AttributeDescription3": ((args.attrib3) ? args.attrib3 : ""),
        "AttributeDescription4": ((args.attrib4) ? args.attrib4 : ""),
        "AttributeDescription5": ((args.attrib5) ? args.attrib5 : ""),
        "AttributeDescription6": ((args.attrib6) ? args.attrib6 : "")
      };
    },
    findItemByAttrib: function(args) {
      var filtered = this.items.where({
        'ItemMatrixGroupCode': args.code
      });

      return _.find(filtered, function(item) {
        return item.get('AttributeDescription1') == ((args.attrib1) ? args.attrib1 : "")  &&
          item.get('AttributeDescription2') == ((args.attrib2) ? args.attrib2 : "")  &&
          item.get('AttributeDescription3') == ((args.attrib3) ? args.attrib3 : "")  &&
          item.get('AttributeDescription4') == ((args.attrib4) ? args.attrib4 : "")  &&
          item.get('AttributeDescription5') == ((args.attrib5) ? args.attrib5 : "")  &&
          item.get('AttributeDescription6') == ((args.attrib6) ? args.attrib6 : "");
      });
    },
    getPrice: function(item) {
      var pricing = (Global.CurrentCustomer.DefaultPrice) ? Global.CurrentCustomer.DefaultPrice : Global.Preference.CustomerDefaultPrice,
        symbol = Global.CurrencySymbol;

      return ((pricing == 'Retail') ? item.get('RetailPrice') : item.get('WholeSalePrice'));
    },
    change: function(e) {
      e.preventDefault();
      var el = this.$(e.currentTarget),
        id = el.attr('id'),
        itemCode = el.data('itemcode'),
        code = el.data('attributecode'),
        value = el.find('option:selected').val(),
        elLength = this.$el.find('select').length,
        isLast = (elLength === parseInt(id)) ? true : false;

      this.$el.find('#' + (parseInt(id) + 1)).removeAttr('disabled').parent().removeClass('ui-disabled');
      var item = this.findAttributes(itemCode, this.model.cid);

      if (!item) {
        item = this.createAttributes(id, itemCode, code, value); 
      } else {
        this.setAttributes(id, item, code, value); 
      }

      this.updateDropdown(id, item, itemCode);
      
      if (isLast) {
        var itemByAttrib = this.findItemByAttrib({
            code: itemCode,
            positionID: item.get('PositionID'),
            attrib1: item.get('Attribute1'),
            attrib2: item.get('Attribute2'),
            attrib3: item.get('Attribute3'),
            attrib4: item.get('Attribute4'),
            attrib5: item.get('Attribute5'),
            attrib6: item.get('Attribute6')
          });
          var price = this.getPrice(itemByAttrib);
          var itemCode = itemByAttrib.get('ItemCode');
          var image = this.getImage(itemCode);
          var itemID = item.get('ItemID');
          var qty = itemByAttrib.get('Quantity') ? itemByAttrib.get('Quantity') : 1;

        this.$el.find('img').attr({
          'src': image,
          'onerror': 'this.onerror = null; this.src="img/ItemPlaceHolder.png";'
        });

        this.$el.find('#'+parseInt(id)).attr('disabled', 'disabled').parent().addClass('ui-disabled');
        
        //update model of this.attributes (item) and disregard itemByAttrib
        item.set({
          Price: price,
          Quantity: qty,
          ItemCode: itemCode,
        }, {silent:true});

        itemByAttrib = null; //set to null and throw to garbage

        window.sessionStorage.setItem('matrix_attributes', JSON.stringify(this.attributes));
        this.model.trigger('updateAttribDisplay', {
          ID: this.model.cid,
          LineNum: this.model.get('DetailLineNum'),
          value: function() {
            return this.getTrimmedAttrib(item);
          }.bind(this),
          price: function(isFormatted) {
            return (isFormatted) ? Global.CurrencySymbol + ' ' + price : price;
          },
          model: item
        });
      }
    },
    updateDropdown: function(id, item, itemCode) {
      if (id == 1) var attrib = _.pick(item.attributes, 'Attribute1');
      else if (id == 2) var attrib = _.pick(item.attributes, 'Attribute1', 'Attribute2');
      else if (id == 3) var attrib = _.pick(item.attributes, 'Attribute1', 'Attribute2', 'Attribute3');
      else var attrib = _.pick(item.attributes, 'Attribute1', 'Attribute2', 'Attribute3', 'Attribute4', 'Attribute5', 'Attribute6');
      
      for (attr in attrib) {
        if (_.isNull(attrib[attr])) delete attrib[attr];
      }
      var items = this.filterItemsByAttrib(attrib);

      if (items.length === 0) return;

      var id = parseInt(id),
        el = this.$el.find('#' + (id + 1)),
        nextId = (id + 1),
        prevEl = this.$el.find('#' + id);

      el.empty();
      if (id != 1) prevEl.attr('disabled', 'disabled').parent().addClass('ui-disabled');

      if (el.has('options:contains("Please select your")').length === 0) {
        el.append(new Option('Please select your ' + items[0].get('AttributeCode' + (id + 1), null))).selectmenu().selectmenu('refresh');
      }

      //filter duplicate items
      items = _.uniq(items, function (item) {
        return item.get('AttributeDescription' + nextId);
      });


      _.each(items, function(item) {
        var code = item.get('AttributeDescription' + nextId),
        attribCode = item.get('AttributeCode' + nextId);

        el.append(new Option(code, code)).selectmenu().selectmenu('refresh');

      }.bind(this));
    },
    fetchAttributes: function() {
      var attrib = window.sessionStorage.getItem('matrix_attributes');
      if (!attrib) {
        this.attributes = new BaseCollection();
      } else {
        var el = this.$el.find('select'),
          length = el.length;

        this.attributes = new BaseCollection(JSON.parse(attrib));
        var attrib = this.attributes.find(function(data) {
          return data.get('ItemID') === this.model.cid;
        }.bind(this));
        if (attrib) {
          for (var i = 1; i <= 6; i++) {
            this.$el.find('#' + i).val(attrib.get('Attribute' + i)).selectmenu().selectmenu('refresh');
            if (i != 1) this.$el.find('#' + i).attr('disabled', 'disabled').parent().addClass('ui-disabled');
          }

          this.$el.find('img').attr({
            'src': this.getImage(attrib.get('ItemCode')),
            'onerror': 'this.onerror = null; this.src="img/ItemPlaceHolder.png";'
          });
        }
      }
    }
  });
});
