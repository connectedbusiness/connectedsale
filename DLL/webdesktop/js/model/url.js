define(["model/base"],function(e){var t=e.extend({select:function(){this.trigger("selected",this)},removeUrl:function(){this.trigger("removeUrl",this)},editUrl:function(){this.trigger("editUrl",this)}});return t});