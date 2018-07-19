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
'text!template/18.2.0/pos/bundle/stock.tpl.html',
'text!template/18.2.0/pos/bundle/matrix.tpl.html',
'text!template/18.2.0/pos/bundle/preview.tpl.html',
'js/libs/iscroll.js'
], function ($, $$, _, Backbone, BaseModel, BaseCollection, Enum, Global, Method, Shared, StockTemplate, MatrixTemplate, PreviewTemplate) {
  return Backbone.View.extend({
    stockTemplate: _.template(StockTemplate),
    matrixTemplate: _.template(MatrixTemplate),
    previewTemplate: _.template(PreviewTemplate),
    events: {
      'change select': 'getAttributes'
    },
    initialize: function () {
      this.$el.attr('style', 'padding: 10px;');
      this.type = this.options.type;
      this.code = this.options.code;
      this.matrixItems = this.options.matrixItems;
      
      if (this.type === Enum.ItemType.MatrixGroup) {
        this.processData();
        this.$el.find('select').selectmenu().selectmenu('refresh'); 
        this.fetchAttributes();
      } else if (this.type === Enum.ItemType.Stock) {
        this.model.set('ImageLocation', this.showImage(this.code));
        this.$el.html(this.stockTemplate(this.model.attributes));
      }

      this.attributesCount = this.$el.find('select').length;
    },
    render: function () {
      //this.loadScroll();
      return this;
    },
    processData: function () {
      var keys = _.uniq(this.collection.pluck('AttributeCode'));
      var imageLoc = this.showImage(this.code);
      this.$el.append(this.previewTemplate({ 'ImageLocation': imageLoc }));

      _.each(keys, function (key, i) {
        this.$el.append(this.matrixTemplate({ AttributeCode: key, ID: i + 1 }));
      }.bind(this));

      this.collection.each(function (model) { 
        this.$el.find("#"+model.get("PositionID")).append(new Option(model.get("AttributeValueCode"), model.get("AttributeValueCode")));

       if (model.get('PositionID') != 1) this.$el.find('#'+model.get('PositionID')).attr('disabled', true);
      }.bind(this));
    },
    showImage: function (code) {
      return Global.ServiceUrl + Method.IMAGES + code + ".png?"+ Math.random();
    },
    loadScroll: function () {
      this.scrollAttrib = {
        vScrollbar: false, vScroll: true, snap: false, momentum: true, hScrollbar: true,
        onBeforeScrollStart: function (e) {
          var target = e.target;
          while (target.nodeType != 1) target = target.parentNode;

		      if (target.tagName != 'SELECT') e.preventDefault();
		    }
		  }
      if (Global.isBrowserMode) Shared.UseBrowserScroll('#bundle-configurator-preview');
      else {
        if (!this.myScroll) this.myScroll = new iScroll('bundle-configurator-preview', this.scrollAttrib);
        else this.myScroll.refresh(); 
      }
    },
    retrieveAttributes: function (e) {
      e.preventDefault();
      
      var id = e.currentTarget.id, 
      data = this.collection.find(function (model) {
        return model.get('PositionID') === parseInt(id);
      }), 
      attribCode = data.get('AttributeCode'),
      attribValue = e.currentTarget.value;

      console.log(id, attribCode, attribValue);

      this.$el.find('#'+ (parseInt(id)+1)).parent().removeClass('ui-disabled');
      this.$el.find('#'+ (parseInt(id)+1)).removeAttr('disabled');
      
      var matrix = this.attributes.find(function (attribute) {
        return attribute.get('ItemCode') === data.get('ItemCode') && attribute.get('ItemID') === this.model.cid;
      }.bind(this));

      if (matrix) {
        switch(parseInt(id)) {
          case 1:
          matrix.set({
            'AttributeCode1': attribCode,
            'Attribute1': attribValue
          });
          break;
          case 2:
          matrix.set({
            'AttributeCode2': attribCode,
            'Attribute2': attribValue
          });
          break;
          case 3:
          matrix.set({
            'AttributeCode3': attribCode,
            'Attribute3': attribValue
          });
          break;
          case 4:
          matrix.set({
            'AttributeCode4': attribCode,
            'Attribute4': attribValue
          });
          break;
          case 5:
          matrix.set({
            'AttributeCode5': attribCode,
            'Attribute5': attribValue
          });
          break;
          case 6:
          matrix.set({
            'AttributeCode6': attribCode,
            'Attribute6': attribValue
          });
          break;
        };

        var result = this.fetchMatrixItem(matrix);

        //if (result) matrix.set('ItemCode', result.get('ItemCode'));
        if (result) {
          this.attributes.each(function (data) {
            var model = this.fetchMatrixItem(data);

            if (model) data.set('ItemCode', model.get('ItemCode'));
          }.bind(this));
        }
      } else {
        var attribModel = new BaseModel({
          'AttributeCode1': (id === "1") ? attribCode : null,
          'AttributeCode2': (id === "2") ? attribCode : null,
          'AttributeCode3': (id === "3") ? attribCode : null,
          'AttributeCode4': (id === "4") ? attribCode : null,
          'AttributeCode5': (id === "5") ? attribCode : null,
          'AttributeCode6': (id === "6") ? attribCode : null,
          'Attribute1': (id === "1") ? attribValue : null,
          'Attribute2': (id === "2") ? attribValue : null,
          'Attribute3': (id === "3") ? attribValue : null,
          'Attribute4': (id === "4") ? attribValue : null,
          'Attribute5': (id === "5") ? attribValue : null,
          'Attribute6': (id === "6") ? attribValue : null,
          'PositionID': id,
          'ItemID': this.model.cid,
          'ItemCode': data.get('ItemCode')
        });

        //this.attributes.add(attribModel);
        var result = this.fetchMatrixItem(attribModel);
        //if (result) attribModel.set('ItemCode', result.get('ItemCode'));
        this.attributes.add(attribModel);
      }
      console.log(this.model.cid, this.attributes.length);
      if (result) {
        this.model.trigger('updateAttribDisplay', { ID: this.model.cid, value: function () {
          var item = (result) ? result : this.attributes.find(function (data) {
            return data.get('ItemID') === this.model.cid;
          }.bind(this));

          if (item) {
            var attrib1 = _.isNull(item.get('Attribute1')) ? '' : item.get('Attribute1');
            var attrib2 = _.isNull(item.get('Attribute2')) ? '' : '-' + item.get('Attribute2');
            var attrib3 = _.isNull(item.get('Attribute3')) ? '' : '-' + item.get('Attribute3');
            var attrib4 = _.isNull(item.get('Attribute4')) ? '' : '-' + item.get('Attribute4');
            var attrib5 = _.isNull(item.get('Attribute5')) ? '' : '-' + item.get('Attribute5');
            var attrib6 = _.isNull(item.get('Attribute6')) ? '' : '-' + item.get('Attribute6');
            return attrib1 + attrib2 + attrib3 + attrib4 + attrib5 + attrib6; 
          }

        }.bind(this), price: function () {
          if (result) {
						var pricing = (Global.CurrentCustomer.DefaultPrice) ? Global.CurrentCustomer.DefaultPrice : Global.Preference.CustomerDefaultPrice;
            if (pricing === 'Retail') {
              return result.get('RetailPrice');
            }

            return result.get('WholeSalePrice');
          }
        
          return 'None';    
        }.bind(this), model: result.set('ItemID', this.model.cid) });
  
        this.$el.find('img').attr({
          'src': this.showImage((result) ? result.get('ItemCode') : this.code),
          'onerror': 'this.onerror=null; this.src="img/ItemPlaceHolder.png";'
        }); 
      } else {
        var referenceModel = (attribModel) ? attribModel : matrix;
        var filteredResult = this.matrixItems.filter(function (data) {
          switch(parseInt(id)) {
            case 1:
              return data.get('Attribute1') === referenceModel.get('Attribute1');
              break;
            case 2:
              return data.get('Attribute1') === referenceModel.get('Attribute1') &&
              data.get('Attribute2') === referenceModel.get('Attribute2');
              break;
            case 3:
              return data.get('Attribute1') === referenceModel.get('Attribute1') &&
              data.get('Attribute2') === referenceModel.get('Attribute2') &&
              data.get('Attribute3') === referenceModel.get('Attribute3');
              break;
            case 4:
              return data.get('Attribute1') === referenceModel.get('Attribute1') &&
              data.get('Attribute2') === referenceModel.get('Attribute2') &&
              data.get('Attribute3') === referenceModel.get('Attribute3') &&
              data.get('Attribute4') === referenceModel.get('Attribute4');
              break;
            case 5:
              return data.get('Attribute1') === referenceModel.get('Attribute1') &&
              data.get('Attribute2') === referenceModel.get('Attribute2') &&
              data.get('Attribute3') === referenceModel.get('Attribute3') &&
              data.get('Attribute4') === referenceModel.get('Attribute4') &&
              data.get('Attribute5') === referenceModel.get('Attribute5');
              break;
            case 6:
              return data.get('Attribute1') === referenceModel.get('Attribute1') &&
              data.get('Attribute2') === referenceModel.get('Attribute2') &&
              data.get('Attribute3') === referenceModel.get('Attribute3') &&
              data.get('Attribute4') === referenceModel.get('Attribute4') &&
              data.get('Attribute5') === referenceModel.get('Attribute5') &&
              data.get('Attribute6') === referenceModel.get('Attribute6');
              break;
          };
        });

        if (filteredResult) {
          id = parseInt(id);
          var el = this.$el.find('#'+ (id + 1));
          
          el.empty();
          for(var i = 0; i < filteredResult.length; i++) {
            var data = filteredResult[i], nextCode = id + 1;
            if (el.find("option[value='Please select your "+ data.get('AttributeCode' + nextCode)  +"']").length === 0) {
              el.append(new Option("Please select your " + data.get('AttributeCode' + nextCode),"Please select your "+ data.get('AttributeCode' + nextCode))).selectmenu().selectmenu('refresh');
            }

            if (el.find("option[value='" + data.get('Attribute'+ nextCode) + "']").length === 0) {
              el.append(new Option(data.get('Attribute'+ nextCode), data.get('Attribute'+ nextCode))).selectmenu().selectmenu('refresh');
            }
          } 
          
        }
      }
      window.sessionStorage.setItem('matrix_attributes', JSON.stringify(this.attributes));
    },
    fetchAttributes: function () {
      var attrib = window.sessionStorage.getItem('matrix_attributes');
      if (!attrib) {
        this.attributes = new BaseCollection();
      } else {
        this.attributes = new BaseCollection(JSON.parse(attrib));
        var filtered = this.attributes.find(function (data) {
          return data.get('ItemID') === this.model.cid;
        }.bind(this));
        
        if (filtered) {
          for (var i = 1; i <= 6; i++) {
            this.$el.find('#'+i).val(filtered.get('Attribute'+i)).selectmenu().selectmenu('refresh');
          }

          this.$el.find('img').attr({
            'src': this.showImage(filtered.get('ItemCode')),
            'onerror': 'this.onerror = null; this.src="img/ItemPlaceHolder.png";'
          });
        } 
      }
    },
    fetchMatrixItem: function (model) {
      return this.matrixItems.find(function (data) {
        return data.get('Attribute1') === model.get('Attribute1') &&
        data.get('Attribute2') === model.get('Attribute2') &&
        data.get('Attribute3') === model.get('Attribute3') &&
        data.get('Attribute4') === model.get('Attribute4') &&
        data.get('Attribute5') === model.get('Attribute5') &&
        data.get('Attribute6') === model.get('Attribute6') &&
        data.get('AttributeCode1') === model.get('AttributeCode1') &&
        data.get('AttributeCode2') === model.get('AttributeCode2') &&
        data.get('AttributeCode3') === model.get('AttributeCode3') &&
        data.get('AttributeCode4') === model.get('AttributeCode4') &&
        data.get('AttributeCode5') === model.get('AttributeCode5') &&
        data.get('AttributeCode6') === model.get('AttributeCode6');
      });
    },
		getAttributes: function (e) {
			e.preventDefault();
			var id = e.currentTarget.id, 
      data = this.collection.find(function (model) {
        return model.get('PositionID') === parseInt(id);
      }), 
      attribCode = data.get('AttributeCode'),
      attribValue = this.$(e.currentTarget).find('option:selected').val();

      console.log(id, attribCode, attribValue);

      this.$el.find('#'+ (parseInt(id)+1)).parent().removeClass('ui-disabled');
      this.$el.find('#'+ (parseInt(id)+1)).removeAttr('disabled');
		}
  });
});
