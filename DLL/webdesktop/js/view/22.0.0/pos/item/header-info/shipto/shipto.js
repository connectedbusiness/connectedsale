define(["jquery","mobile","underscore","backbone","shared/shared","text!template/22.0.0/pos/item/header-info/shipto/shipto.tpl.html"],function(e,t,i,s,l,o){var a=s.View.extend({_template:i.template(o),tagName:"li",events:{tap:"ViewDetail","tap #select-shipto-btn":"Selected","tap #select-shipto":"Selected"},initialize:function(){},render:function(){var e="";return l.IsNullOrWhiteSpace(this.model.get("Address"))||(e=this.model.get("Address"),e=e.substr(0,40)+"..."),this.model.set({DisplayAddress:e}),this.$el.html(this._template(this.model.toJSON())),this},Selected:function(e){e.stopPropagation(),this.model.select()},ViewDetail:function(e){e.stopPropagation(),this.model.viewDetail()}});return a});