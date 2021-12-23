define(["jquery","mobile","underscore","backbone","shared/global","text!template/22.0.0/pos/keypad/keypad.tpl.html","js/libs/format.min.js"],function(e,t,a,n,r,s){var i=n.View.extend({_template:a.template(s),_currentAmount:"",events:{"tap a":"button_tap"},render:function(){this.$el.html(this._template({CurrencySymbol:r.CurrencySymbol})),this.isFromInitialize=!0,r.isBrowserMode&&this.BindKeyDownEvent()},BindKeyDownEvent:function(){var t=this;e(document).bind("keydown",function(e){var a=e.target.tagName.toLowerCase();"input"!=a&&"textarea"!=a&&t.DoBindKeypressValues(e)})},DoBindKeypressValues:function(t){switch(t.which){case 96:case 48:e("#num-zero").tap();break;case 97:case 49:e("#num-one").tap();break;case 98:case 50:e("#num-two").tap();break;case 99:case 51:e("#num-three").tap();break;case 100:case 52:e("#num-four").tap();break;case 101:case 53:e("#num-five").tap();break;case 102:case 54:e("#num-six").tap();break;case 103:case 55:e("#num-seven").tap();break;case 104:case 56:e("#num-eight").tap();break;case 105:case 57:e("#num-nine").tap();break;case 13:this.trigger("enterTriggered"),console.log("enter");break;case 46:e("#num-clear").tap();break;case 189:case 109:e("#num-sign").tap()}t.preventDefault&&t.preventDefault()},Show:function(){this.render()},button_tap:function(e){e.preventDefault(),e.target.text&&this.ProcessKeyPressed(e.target.text)},ProcessKeyPressed:function(e){this.isFromInitialize&&(this.ResetAmount(),this.isFromInitialize=!1);var t=this.$(".keypad-amount").html(),a=t;if("+/-"===e)return void this.ApplyNegativeValue();switch(t=t.replace(".",""),e){case"1":t+="1";break;case"2":t+="2";break;case"3":t+="3";break;case"4":t+="4";break;case"5":t+="5";break;case"6":t+="6";break;case"7":t+="7";break;case"8":t+="8";break;case"9":t+="9";break;case"0":t+="0";break;case"C":t="0.00",this.ResetAmount()}var n="0.00";if("0.00"!=t){var r=0,s=t.length-2,i="";"0"===t.charAt(0)?(r=1,s=t.length-3):"-"===t.charAt(0)&&"0"===t.charAt(1)&&(r=2,s=t.length-4,i="-");var o=t.substr(r,s),c=t.substr(t.length-2);a.length-2<15?(n=i+o+"."+c,this.ModifyAmountStyle(n),this.$(".keypad-amount").html(this.formatAmount(n))):(this.ModifyAmountStyle(a),this.$(".keypad-amount").html(this.formatAmount(a)))}},ModifyAmountStyle:function(e){e.length>15&&this.$("div.calcfield").attr("style","font-size: 37px;")},formatAmount:function(e){var t=e.replace(",",""),a=t.replace(",",""),n=format("#,##0.00",a.replace(",",""));return n},GetActualAmount:function(e){var t=e.replace(",",""),a=t.replace(",",""),n=a.replace(",","");return n},ResetAmount:function(){this.$(".keypad-amount").html("0.00")},ApplyNegativeValue:function(){var e=this.$(".keypad-amount").html(),t="";t="-"===e.charAt(0)?e.replace("-",""):"-"+e,this.$(".keypad-amount").html(this.formatAmount(t))},GetAmount:function(){var e=this.$(".keypad-amount").html(),t=this.GetActualAmount(e);return parseFloat(t)},SetAmount:function(e){e.length>12&&this.$("div.calcfield").attr("style","font-size: 37px;"),this.$(".keypad-amount").html(this.formatAmount(e)),this._currentAmount=e}});return i});