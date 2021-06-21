
define([
	'jquery',
	'mobile',
	'underscore',	
	'shared/shared',
	'backbone',
	'view/22.0.0/products/receivestocks/detail/general',
	'text!template/22.0.0/products/receivestocks/details.tpl.html',
	'text!template/22.0.0/products/receivestocks/detailsmenu.tpl.html'
], function($, $$, _, Shared, Backbone,GeneralView, template ,menuTemplate){
	
	var container_el = "#stockDetailsContainer";
	
	var ReceiveStockDetailView = Backbone.View.extend({
		_template : _.template( template ),
		_menuTemplate :_.template(menuTemplate),

		initialize : function(){
		    //this.render();
		   //this.InitializeChildViews();
		},

		render: function () {
		    this.$el.html(this._template);
		    this.InitializeChildViews();
		},
		
		DisplayNoRecordFound: function () {
		    Shared.Products.DisplayNoRecordFound("#right-panel", ".list-wrapper", this.toBeSearched);
		},

		InitializeChildViews : function(){
		    if(this.model){
		        this.$("#stockDetails > #stockMenu").html(this._menuTemplate);
		        this.SetSelectedTab("General");
		        this.LoadGeneralView();
		    }else{
		        this.DisplayNoRecordFound();
		    }
		},

		LoadGeneralView: function () {
		    this.SetSelectedTab("General");

		    var generalView = new GeneralView({
		        el: $(container_el),
		        model: this.model
		    });
		},
		
		SetSelectedTab : function(type){
			this.$("#stock-General").removeClass("selectedTab ");this.$("#stock-General").addClass("unSelectedTab");
			this.$("#stock-"+type).removeClass("unSelectedTab");
			this.$("#stock-"+type).addClass("selectedTab");
			this.$("#stock-"+type).css("color","black");
		},

	    Show : function(model){
	        this.model = model;
	        this.render();
	    },
	});
	return ReceiveStockDetailView;
})
