define(["shared/shared","model/base"],function(e,t){var i=t.extend({initialize:function(){this.set({ExpirationDate:e.GetJsonUTCDate(),StartingDate:e.GetJsonUTCDate()})},select:function(){this.trigger("selected",this)}});return i});