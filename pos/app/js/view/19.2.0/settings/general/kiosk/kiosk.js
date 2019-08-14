/**
 * @author Connected Business
 */
define([
	'jquery',
	'mobile',
	'underscore',
	'shared/global',
	'backbone',
	'text!template/19.2.0/settings/general/kiosk/kiosk.tpl.html'
], function($, $$, _, Global, Backbone, template) {
	var KioskPreference = Backbone.View.extend({
		_template : _.template( template ),

		events : {
			"change #radio-Order-Kiosk" : "radioOrder_changed",
			"change #radio-Sale-Kiosk" : "radioSale_changed"
		},

		radioOrder_changed : function(e) {
			this.defaultTransaction = 0;
			this.trigger("selected",this);
			this.SetSelected();

		},

		radioSale_changed : function(e) {
			this.defaultTransaction = 1;
			this.trigger("selected",this);
			this.SetSelected();
		},

		initialize : function() {
			this.render();
		},
		ResetSelected : function()
		{
			$("#radio-Order-Kiosk").attr('checked',false).checkboxradio("refresh");
			$("#radio-Sale-Kiosk").attr('checked',false).checkboxradio("refresh");
		},

		SetSelected : function(){
			this.ResetSelected();
			switch(this.defaultTransaction)
			{
				case 0 : $("#radio-Order-Kiosk").attr('checked',true).checkboxradio("refresh"); break;
				case 1 : $('#radio-Sale-Kiosk').attr('checked',true).checkboxradio("refresh"); break;
			}
		},
		render : function() {
			$("#back-general").show();
			this.$el.html( this._template );
			this.$el.trigger("create");
			this.DisableOption();
			this.defaultTransaction = this.model.get("KioskDefaultTransaction");
			this.SetSelected();
		},

		DisableOption  : function(){
			if(Global.Preference.AllowSales === false)
			{
				this.$("#div-Sale-Kiosk").addClass("ui-disabled");
			}
			if(Global.Preference.AllowOrders === false)
			{
				this.$("#div-Order-Kiosk").addClass("ui-disabled");
			}
		}

	});
	return KioskPreference;
})
