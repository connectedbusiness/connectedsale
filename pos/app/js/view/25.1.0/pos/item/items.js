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
	'view/25.1.0/pos/item/item',
	'text!template/25.1.0/pos/item/items.tpl.html',
	'js/libs/swipe.min.js'
],function($, $$, _, Backbone, Global, Shared, ItemView,  template){
	var _limit = 15, _i = 1, _remaining = 0, _collection, _page = 0; _currentPage = 0;
	var ItemsView = Backbone.View.extend({
		_template : _.template( template ),

		events : {			
			//"tap #item-arrow-right" : "SwipeLeft",
			//"tap #item-arrow-left" : "SwipeRight",
		},

		BindDashBoardSwipe : function(){ // added by jj
			_currentPage = 1;
			if(Global.isBrowserMode){
				var self = this;
				$("#itemContainer").on("swiperight",function(e){ self.SwipeRight(e); });
				$("#itemContainer").on("swipeleft",function(e){ self.SwipeLeft(e); });
				$("#item-arrow-right").on("tap",function(e){ self.SwipeLeft(e); });
				$("#item-arrow-left").on("tap",function(e){ self.SwipeRight(e); });				
			}
			
		},

		SwipeLeft : function(e) {
			e.stopPropagation();			
			if(Global.isBrowserMode) if(_currentPage >= _page) { return; }
			if(this.swipe) if(!this.isSinglePage)this.swipe.next();			
			else $("#itemContainer").trigger("swipeleft");		
			Shared.FocusToItemScan();
			_currentPage++;				
		},
		
		SwipeRight : function(e) {
			e.stopPropagation();
			if(Global.isBrowserMode) if(_currentPage <= 1) return;
			
			if(this.swipe) if(!this.isSinglePage)this.swipe.prev();
			else $("#itemContainer").trigger("swiperight");	
			Shared.FocusToItemScan();
			_currentPage--;
		},

		initialize : function(){
			this.collection.bind("reset", this.LoadItems, this);
			_collection = this.collection;			
		},
		
		render : function(){
			this.$el.html( this._template );
		},

		InitializeSwipe : function(target) {
			this.swipe = new Swipe(document.getElementById(target), {
				callback: function() {
					var _a = this.index+1;
					$("#itemBullet em").css("color", "#CCC");
					$("#"+_a+"itemBullet").css("color", "#6D6D6D");

					if(this.index > 1){
						this.isSinglePage = true;
					}else this.isSinglePage = false;
				}
			});
			var _a = this.swipe.index+1;
			$("#"+_a+"itemBullet").css("color", "#6D6D6D");

			this.BindDashBoardSwipe();
		},
		
		LoadItems : function() {
			_limit = 15;
			if(Global.ApplicationType === "Kiosk"){
				_limit = 12;
			}
			
			_remaining = this.collection.length;
			var _a = _remaining / _limit;
			
			this.render();

			 _page = Math.ceil(_a);

			 for (var _i = 1; _i <= _page; _i++){
				this.PaginateItems(_limit, _i, _remaining);
				_remaining = _remaining - _limit;
			 }
			 var _id = $("#item").attr("id");
			 this.InitializeSwipe(_id); 
			 if(Global.isBrowserMode && _page > 1) this.ShowPageNavigator();
		},

		PaginateItems : function(_limit, _x, _remaining){
			var collection = _collection.paginate(_limit, _x, _remaining);
			$("#itemListContainer").append("<li><div id=item-"+ _x +"/></li>");
			$("#itemBullet").append("<em id="+_x+"itemBullet>&#8226;</em>");
			for(var i = 0; i < collection.length; i++) {
				var model = collection[i];
				this.itemView = new ItemView({model : model});
				$("#item-"+_x).append(this.itemView.render().el);
				if(Global.ApplicationType === "Kiosk"){
					if(i === 2 || i === 5 || i === 8 || i === 11){
						$("#"+model.cid).css({
							'margin-left': '0px',
							'margin-right': '0px'
						});
					}
				}else{
					if(i === 2 || i === 5 || i === 8 || i === 11 || i == 14){
						$("#"+model.cid).css({
							'margin-left': '0px',
							'margin-right': '0px'
						});
					}
				}
				
			}
		},
		
		ShowPageNavigator : function() {
			$('#item-arrow-right').removeAttr('style')
			$('#item-arrow-left').removeAttr('style')
		},		
	});
	return ItemsView;
});
