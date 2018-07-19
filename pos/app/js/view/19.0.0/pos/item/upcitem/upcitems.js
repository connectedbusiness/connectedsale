define([
	'backbone',
	'shared/global',	
	'shared/service',
	'shared/method',
	'shared/shared',
	'shared/enum',	
    'model/base',
    'collection/base',
    'view/19.0.0/pos/item/upcitem/upcitem',
    'text!template/19.0.0/pos/item/upcitem/upcitems.tpl.html'
], function (Backbone, Global, Service, Method,Shared,Enum, BaseModel,BaseCollection,UpcItemView,template) {
          		
    var _optionVal = false;
    var _txtSearch = "#txtSearchUpcItem";
    var UpcItemsView = Backbone.View.extend({

        _template : _.template(template),

		events  : {
			"tap #cmdDone-upcitem" : "Tap_Done",
            "tap #cmdCancel-upcitem" : "Tap_Cancel",
            "tap #chkSelectAll" : "SelectAllUpcChange",
            //"keyup #txtSearchUpcItem" : "SearchUpc",
            "keypress #txtSearchUpcItem" : "SearchUpc",
            "focus #txtSearchUpcItem " : "ShowClearButton",
            "blur #txtSearchUpcItem " : "HideClearButton",
            "tap #clearUpcText " : "ClearText"    
		},
		
        initialize: function () {
        	this.render();
        },
			
        render: function () {
            this.$el.html(this._template());
            this.trigger("create");
         	
            this.options.parentEl.show();
        },

        ClearText : function(){
            $(_txtSearch).val("");
        },

        ShowClearButton : function(){
            $("#clearUpcText").show();
        },

        HideClearButton : function(){
            $("#clearUpcText").fadeOut();
        },
        
        InitializeChildViews : function(upcCode){
            $(".upcItemHeader").text("Items with \"" + upcCode + "\" UPC Code.");
            this.LoadUpcItems(this.collection);
            this.RefreshScroll();
        },

        LoadUpcItems : function(collection){
            var self = this;
            //var collection = this.collection;
            var _collection = collection.pluck('ItemName');
            var _result = _.groupBy(_collection, function(item){
                return item.charAt(0).toUpperCase();
            });
            
            for(var item in _result){
                
                $("#upcItemList").append("<ol class='gradient-black'>"+item+"</ol>");
                
                collection.each(function(model){
                    model.set({IsSelected : false });
                    var _item = model.get("ItemName");

                    if(_item.charAt(0).toUpperCase() === item.toUpperCase()){
                        
                        self.upcItemView  = new UpcItemView({
                            el : $("#upcItemList"),
                            model : model
                        });
                        self.upcItemView.InitializeChildViews();
                        self.upcItemView.on("UpdateItemState", self.UpdateItemState,self);
                    }
                });
            }
           
        },

        UpdateItemState : function(_model){
            var itemCode = _model.get("ItemCode");
            var isSelected = _model.get("IsSelected");
            var _um = _model.get("UnitMeasureCode");
            this.collection.each(function(model){
                if(itemCode == model.get("ItemCode") && _um == model.get("UnitMeasureCode")){
                    model.set({IsSelected : isSelected});
                }
            });
        },

        Tap_Done : function(e){
            e.preventDefault();
            //var tempCollection = new BaseCollection();
            //this.collection.each(function(model){
            //    if(model.get("IsSelected") === true){
            //        tempCollection.add(model);
            //    }
            //});

            var tempCollection = this.collection.filter(function (model) {
                return model.get("IsSelected") === true;
            });

            this.Hide();
            this.trigger('AddSelectedItem', new BaseCollection(tempCollection));
        },

        Hide : function(isCancel){
			//if(!Shared.IsNullOrWhiteSpace(isCancel)){
			$("#main-transaction-blockoverlay").hide();
			console.log("hide Overlay!")
			//}

			 this.options.parentEl.hide();
        },

        Tap_Cancel : function(e){
            e.preventDefault();
        	this.Hide(true);
        },

        SelectAllUpcChange : function(e){
            e.preventDefault();
          _optionVal = Shared.CustomCheckBoxChange("#chkSelectAll",_optionVal);
        },

        SearchUpc : function(e){
        	var find = $(_txtSearch).val().toString().toUpperCase();
        	this.ShowClearButton();
        	if(e.keyCode === 13){
				var _el = "#upcItemList";
				var _searchCollection = new BaseCollection();
			
				if(!Shared.IsNullOrWhiteSpace(find)){
					this.collection.each(function(model){
						var toFind = model.get("ItemName").toString().toUpperCase();
						var toFind2 = model.get("ItemDescription").toString().toUpperCase();
						var toFind3 = model.get("ItemCode").toString().toUpperCase();
						if(toFind.indexOf(find) > -1 || toFind2.indexOf(find) > -1 || toFind3.indexOf(find) > -1){
							_searchCollection.add(model);
						}
					});
					
					if(_searchCollection.length > 0){
						this.$(_el).html('');
						this.LoadUpcItems(_searchCollection);
					}else{
						this.$(_el).html('');
					}
					
				}else{
					this.$(_el).html('');
					this.LoadUpcItems(this.collection);
				}
			}
        },

        RefreshScroll : function(){
			if(!Global.isBrowserMode){
				if(!this.myScroll){
					this.myScroll = new iScroll('upcItemlistContainer', {
						vScrollbar:true, vScroll:true, snap:false, momentum:true,hScrollbar:false,hScroll:false,
						onBeforeScrollStart: function (e) {
						var target = e.target;
						while (target.nodeType != 1) target = target.parentNode;
						
						if (target.tagName != 'SELECT' && target.tagName != 'INPUT' && target.tagName != 'TEXTAREA')
						e.preventDefault();
						}
					});
				}else{
					this.myScroll.refresh();
				}
				
				var self = this;
				setTimeout(function () {
					self.myScroll.refresh();
				}, 1000);
			}else{
				$("#upcItemlistContainer").css({"overflow-x":"hidden", "overflow-y":"auto"});
			}	
		}
       
    });

    return UpcItemsView;
});