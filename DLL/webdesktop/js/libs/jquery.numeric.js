!function(e){e.fn.numeric=function(t,n){"boolean"==typeof t&&(t={decimal:t}),t=t||{},"undefined"==typeof t.negative&&(t.negative=!0);var r=t.decimal===!1?"":t.decimal||".",i=t.negative===!0,n="function"==typeof n?n:function(){};return this.data("numeric.decimal",r).data("numeric.negative",i).data("numeric.callback",n).keypress(e.fn.numeric.keypress).keyup(e.fn.numeric.keyup).blur(e.fn.numeric.blur)},e.fn.numeric.keypress=function(t){var n=e.data(this,"numeric.decimal"),r=e.data(this,"numeric.negative"),i=t.charCode?t.charCode:t.keyCode?t.keyCode:0;if(13==i&&"input"==this.nodeName.toLowerCase())return!0;if(13==i)return!1;var a=!1;if(t.ctrlKey&&97==i||t.ctrlKey&&65==i)return!0;if(t.ctrlKey&&120==i||t.ctrlKey&&88==i)return!0;if(t.ctrlKey&&99==i||t.ctrlKey&&67==i)return!0;if(t.ctrlKey&&122==i||t.ctrlKey&&90==i)return!0;if(t.ctrlKey&&118==i||t.ctrlKey&&86==i||t.shiftKey&&45==i)return!0;if(i<48||i>57){if(0!=this.value.indexOf("-")&&r&&45==i&&(0==this.value.length||0==e.fn.getSelectionStart(this)))return!0;n&&i==n.charCodeAt(0)&&this.value.indexOf(n)!=-1&&(a=!1),8!=i&&9!=i&&13!=i&&35!=i&&36!=i&&37!=i&&39!=i&&46!=i?a=!1:"undefined"!=typeof t.charCode&&(t.keyCode==t.which&&0!=t.which?(a=!0,46==t.which&&(a=!1)):0!=t.keyCode&&0==t.charCode&&0==t.which&&(a=!0)),n&&i==n.charCodeAt(0)&&(a=this.value.indexOf(n)==-1)}else a=!0;return a},e.fn.numeric.keyup=function(t){var n=this.value;if(n.length>0){var r=e.fn.getSelectionStart(this),i=e.data(this,"numeric.decimal"),a=e.data(this,"numeric.negative");if(""!=i){var c=n.indexOf(i);0==c&&(this.value="0"+n),1==c&&"-"==n.charAt(0)&&(this.value="-0"+n.substring(1)),n=this.value}for(var u=[0,1,2,3,4,5,6,7,8,9,"-",i],l=n.length,s=l-1;s>=0;s--){var f=n.charAt(s);0!=s&&"-"==f?n=n.substring(0,s)+n.substring(s+1):0!=s||a||"-"!=f||(n=n.substring(1));for(var h=!1,o=0;o<u.length;o++)if(f==u[o]){h=!0;break}h&&" "!=f||(n=n.substring(0,s)+n.substring(s+1))}var d=n.indexOf(i);if(d>0)for(var s=l-1;s>d;s--){var f=n.charAt(s);f==i&&(n=n.substring(0,s)+n.substring(s+1))}this.value=n,e.fn.setSelection(this,r)}},e.fn.numeric.blur=function(){var t=e.data(this,"numeric.decimal"),n=e.data(this,"numeric.callback"),r=this.value;if(""!=r){var i=new RegExp("^\\d+$|\\d*"+t+"\\d+");i.exec(r)||n.apply(this)}},e.fn.removeNumeric=function(){return this.data("numeric.decimal",null).data("numeric.negative",null).data("numeric.callback",null).unbind("keypress",e.fn.numeric.keypress).unbind("blur",e.fn.numeric.blur)},e.fn.getSelectionStart=function(e){if(e.createTextRange){var t=document.selection.createRange().duplicate();return t.moveEnd("character",e.value.length),""==t.text?e.value.length:e.value.lastIndexOf(t.text)}return e.selectionStart},e.fn.setSelection=function(e,t){if("number"==typeof t&&(t=[t,t]),t&&t.constructor==Array&&2==t.length)if(e.createTextRange){var n=e.createTextRange();n.collapse(!0),n.moveStart("character",t[0]),n.moveEnd("character",t[1]),n.select()}else e.setSelectionRange&&(e.focus(),e.setSelectionRange(t[0],t[1]))}}(jQuery);