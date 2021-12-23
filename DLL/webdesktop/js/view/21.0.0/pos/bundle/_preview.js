define(["jquery","mobile","underscore","backbone","model/base","collection/base","shared/enum","shared/global","shared/method","shared/shared","text!template/21.0.0/pos/bundle/stock.tpl.html","text!template/21.0.0/pos/bundle/matrix.tpl.html","text!template/21.0.0/pos/bundle/preview.tpl.html","js/libs/iscroll.js"],function(t,e,i,r,u,s,n,o,l,a,b,g,d){return r.View.extend({stockTemplate:i.template(b),matrixTemplate:i.template(g),previewTemplate:i.template(d),events:{"change select":"getAttributes"},initialize:function(){this.$el.attr("style","padding: 10px;"),this.type=this.options.type,this.code=this.options.code,this.matrixItems=this.options.matrixItems,this.type===n.ItemType.MatrixGroup?(this.processData(),this.$el.find("select").selectmenu().selectmenu("refresh"),this.fetchAttributes()):this.type===n.ItemType.Stock&&(this.model.set("ImageLocation",this.showImage(this.code)),this.$el.html(this.stockTemplate(this.model.attributes))),this.attributesCount=this.$el.find("select").length},render:function(){return this},processData:function(){var t=i.uniq(this.collection.pluck("AttributeCode")),e=this.showImage(this.code);this.$el.append(this.previewTemplate({ImageLocation:e})),i.each(t,function(t,e){this.$el.append(this.matrixTemplate({AttributeCode:t,ID:e+1}))}.bind(this)),this.collection.each(function(t){this.$el.find("#"+t.get("PositionID")).append(new Option(t.get("AttributeValueCode"),t.get("AttributeValueCode"))),1!=t.get("PositionID")&&this.$el.find("#"+t.get("PositionID")).attr("disabled",!0)}.bind(this))},showImage:function(t){return o.ServiceUrl+l.IMAGES+t+".png?"+Math.random()},loadScroll:function(){this.scrollAttrib={vScrollbar:!1,vScroll:!0,snap:!1,momentum:!0,hScrollbar:!0,onBeforeScrollStart:function(t){for(var e=t.target;1!=e.nodeType;)e=e.parentNode;"SELECT"!=e.tagName&&t.preventDefault()}},o.isBrowserMode?a.UseBrowserScroll("#bundle-configurator-preview"):this.myScroll?this.myScroll.refresh():this.myScroll=new iScroll("bundle-configurator-preview",this.scrollAttrib)},retrieveAttributes:function(t){t.preventDefault();var e=t.currentTarget.id,r=this.collection.find(function(t){return t.get("PositionID")===parseInt(e)}),s=r.get("AttributeCode"),n=t.currentTarget.value;console.log(e,s,n),this.$el.find("#"+(parseInt(e)+1)).parent().removeClass("ui-disabled"),this.$el.find("#"+(parseInt(e)+1)).removeAttr("disabled");var l=this.attributes.find(function(t){return t.get("ItemCode")===r.get("ItemCode")&&t.get("ItemID")===this.model.cid}.bind(this));if(l){switch(parseInt(e)){case 1:l.set({AttributeCode1:s,Attribute1:n});break;case 2:l.set({AttributeCode2:s,Attribute2:n});break;case 3:l.set({AttributeCode3:s,Attribute3:n});break;case 4:l.set({AttributeCode4:s,Attribute4:n});break;case 5:l.set({AttributeCode5:s,Attribute5:n});break;case 6:l.set({AttributeCode6:s,Attribute6:n})}var a=this.fetchMatrixItem(l);a&&this.attributes.each(function(t){var e=this.fetchMatrixItem(t);e&&t.set("ItemCode",e.get("ItemCode"))}.bind(this))}else{var b=new u({AttributeCode1:"1"===e?s:null,AttributeCode2:"2"===e?s:null,AttributeCode3:"3"===e?s:null,AttributeCode4:"4"===e?s:null,AttributeCode5:"5"===e?s:null,AttributeCode6:"6"===e?s:null,Attribute1:"1"===e?n:null,Attribute2:"2"===e?n:null,Attribute3:"3"===e?n:null,Attribute4:"4"===e?n:null,Attribute5:"5"===e?n:null,Attribute6:"6"===e?n:null,PositionID:e,ItemID:this.model.cid,ItemCode:r.get("ItemCode")}),a=this.fetchMatrixItem(b);this.attributes.add(b)}if(console.log(this.model.cid,this.attributes.length),a)this.model.trigger("updateAttribDisplay",{ID:this.model.cid,value:function(){var t=a?a:this.attributes.find(function(t){return t.get("ItemID")===this.model.cid}.bind(this));if(t){var e=i.isNull(t.get("Attribute1"))?"":t.get("Attribute1"),r=i.isNull(t.get("Attribute2"))?"":"-"+t.get("Attribute2"),u=i.isNull(t.get("Attribute3"))?"":"-"+t.get("Attribute3"),s=i.isNull(t.get("Attribute4"))?"":"-"+t.get("Attribute4"),n=i.isNull(t.get("Attribute5"))?"":"-"+t.get("Attribute5"),o=i.isNull(t.get("Attribute6"))?"":"-"+t.get("Attribute6");return e+r+u+s+n+o}}.bind(this),price:function(){if(a){var t=o.CurrentCustomer.DefaultPrice?o.CurrentCustomer.DefaultPrice:o.Preference.CustomerDefaultPrice;return"Retail"===t?a.get("RetailPrice"):a.get("WholeSalePrice")}return"None"}.bind(this),model:a.set("ItemID",this.model.cid)}),this.$el.find("img").attr({src:this.showImage(a?a.get("ItemCode"):this.code),onerror:'this.onerror=null; this.src="img/ItemPlaceHolder.png";'});else{var g=b?b:l,d=this.matrixItems.filter(function(t){switch(parseInt(e)){case 1:return t.get("Attribute1")===g.get("Attribute1");case 2:return t.get("Attribute1")===g.get("Attribute1")&&t.get("Attribute2")===g.get("Attribute2");case 3:return t.get("Attribute1")===g.get("Attribute1")&&t.get("Attribute2")===g.get("Attribute2")&&t.get("Attribute3")===g.get("Attribute3");case 4:return t.get("Attribute1")===g.get("Attribute1")&&t.get("Attribute2")===g.get("Attribute2")&&t.get("Attribute3")===g.get("Attribute3")&&t.get("Attribute4")===g.get("Attribute4");case 5:return t.get("Attribute1")===g.get("Attribute1")&&t.get("Attribute2")===g.get("Attribute2")&&t.get("Attribute3")===g.get("Attribute3")&&t.get("Attribute4")===g.get("Attribute4")&&t.get("Attribute5")===g.get("Attribute5");case 6:return t.get("Attribute1")===g.get("Attribute1")&&t.get("Attribute2")===g.get("Attribute2")&&t.get("Attribute3")===g.get("Attribute3")&&t.get("Attribute4")===g.get("Attribute4")&&t.get("Attribute5")===g.get("Attribute5")&&t.get("Attribute6")===g.get("Attribute6")}});if(d){e=parseInt(e);var c=this.$el.find("#"+(e+1));c.empty();for(var A=0;A<d.length;A++){var r=d[A],h=e+1;0===c.find("option[value='Please select your "+r.get("AttributeCode"+h)+"']").length&&c.append(new Option("Please select your "+r.get("AttributeCode"+h),"Please select your "+r.get("AttributeCode"+h))).selectmenu().selectmenu("refresh"),0===c.find("option[value='"+r.get("Attribute"+h)+"']").length&&c.append(new Option(r.get("Attribute"+h),r.get("Attribute"+h))).selectmenu().selectmenu("refresh")}}}window.sessionStorage.setItem("matrix_attributes",JSON.stringify(this.attributes))},fetchAttributes:function(){var t=window.sessionStorage.getItem("matrix_attributes");if(t){this.attributes=new s(JSON.parse(t));var e=this.attributes.find(function(t){return t.get("ItemID")===this.model.cid}.bind(this));if(e){for(var i=1;i<=6;i++)this.$el.find("#"+i).val(e.get("Attribute"+i)).selectmenu().selectmenu("refresh");this.$el.find("img").attr({src:this.showImage(e.get("ItemCode")),onerror:'this.onerror = null; this.src="img/ItemPlaceHolder.png";'})}}else this.attributes=new s},fetchMatrixItem:function(t){return this.matrixItems.find(function(e){return e.get("Attribute1")===t.get("Attribute1")&&e.get("Attribute2")===t.get("Attribute2")&&e.get("Attribute3")===t.get("Attribute3")&&e.get("Attribute4")===t.get("Attribute4")&&e.get("Attribute5")===t.get("Attribute5")&&e.get("Attribute6")===t.get("Attribute6")&&e.get("AttributeCode1")===t.get("AttributeCode1")&&e.get("AttributeCode2")===t.get("AttributeCode2")&&e.get("AttributeCode3")===t.get("AttributeCode3")&&e.get("AttributeCode4")===t.get("AttributeCode4")&&e.get("AttributeCode5")===t.get("AttributeCode5")&&e.get("AttributeCode6")===t.get("AttributeCode6")})},getAttributes:function(t){t.preventDefault();var e=t.currentTarget.id,i=this.collection.find(function(t){return t.get("PositionID")===parseInt(e)}),r=i.get("AttributeCode"),u=this.$(t.currentTarget).find("option:selected").val();console.log(e,r,u),this.$el.find("#"+(parseInt(e)+1)).parent().removeClass("ui-disabled"),this.$el.find("#"+(parseInt(e)+1)).removeAttr("disabled")}})});