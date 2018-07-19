define([
	'backbone',
	'shared/global',	
	'shared/service',
	'shared/method',
	'shared/shared',	
    'model/base',
    'collection/base',
    'text!template/16.0.0/pos/item/upcitem/upcitem.tpl.html'
], function (Backbone, Global, Service, Method,Shared, 
             BaseModel,
             BaseCollection,
          	template) {
    var UpcItemView = Backbone.View.extend({

        _template : _.template(template),

	
		BindEvents : function(){
             var self = this;
          	$(this.classID.CID ).on("tap",function(){ self.SelectedItem(); });
        },
        initialize: function () {
            this.InitializeFreeStock(this.model);

            this.classID = {
                CID : " #" + this.cid + " " ,
                ModelID : this.cid, 
                OptionVal : false
            }   
        	this.render();
        },
		
        render: function () {
            var self = this;
            this.model.set({
                ModelID : self.cid,
                CurrencySymbol : Global.CurrencySymbol
            });

            this.$el.append(this._template(this.model.toJSON()));
          
            return this;
        },
        InitializeFreeStock : function(model){
            var _unitMeasureQty = model.get("UnitMeasureQty");
            var _freeStock = model.get("FreeStock");
            _freeStock = _freeStock / _unitMeasureQty;
            var splitVal = _freeStock.toString().split(".");
            if (splitVal[1] > 0) {
                _freeStock = _freeStock.toFixed(2);
            } else {
                _freeStock = parseFloat(_freeStock);
            }
            model.set({ UnitsInStock: _freeStock }, { silent: true });
        },
        InitializeChildViews : function(){
            this.BindEvents();
        },
       SelectedItem : function(){
        this.classID.OptionVal =  Shared.CustomCheckBoxChange(this.classID.CID + " #chkOption",this.classID.OptionVal);
        this.model.set({IsSelected : this.classID.OptionVal});
        this.trigger('UpdateItemState',this.model);
       }
    });

    return UpcItemView;
});