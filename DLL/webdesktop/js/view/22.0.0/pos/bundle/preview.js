define(["jquery","mobile","underscore","backbone","model/base","collection/base","shared/enum","shared/global","shared/method","shared/shared","text!template/22.0.0/pos/bundle/stock.tpl.html","text!template/22.0.0/pos/bundle/matrix.tpl.html","text!template/22.0.0/pos/bundle/preview.tpl.html","js/libs/iscroll.js"],function(t,e,i,r,s,a,n,u,o,l,b,c,d){return r.View.extend({stockTemplate:i.template(b),matrixTemplate:i.template(c),previewTemplate:i.template(d),events:{"change select":"change"},initialize:function(){switch(this.$el.attr("style","padding: 10px;"),this.type=this.options.type,this.code=this.options.code,this.items=this.options.matrixItems,this.attributes=new a,this.type){case n.ItemType.MatrixGroup:this.processMatrix(),this.fetchAttributes(),this.$el.find("select").selectmenu().selectmenu("refresh");break;case n.ItemType.Stock:this.processStock()}},render:function(){return this},getImage:function(t){return u.ServiceUrl+o.IMAGES+t+".png?"+Math.random()},loadScroll:function(){var t="bundle-configurator-preview";this.scrollAttrib={vScrollbar:!1,vScroll:!0,snap:!1,momentum:!0,hScrollbar:!0,onBeforeScrollStart:function(t){for(var e=t.target;1!=e.nodeType;)e=e.parentNode;"SELECT"!=e.tagName&&t.preventDefault()}},u.isBrowserMode?l.UseBrowserScroll("#"+t):this.myScroll?this.myScroll.refresh():this.myScroll=new iScroll(t,this.scrollAttrib)},processMatrix:function(){this.collection.comparator=function(t){return t.get("PositionID")},this.collection.sort();var t=i.uniq(this.collection.pluck("AttributeCode"));i.uniq(this.collection.pluck("AttributeValueCode"));this.$el.append(this.previewTemplate({ImageLocation:this.getImage(this.code)})),i.each(t,function(t,e){this.$el.append(this.matrixTemplate({AttributeCode:t,ID:e+1,ItemCode:this.model.get("ItemCode")}))}.bind(this)),this.collection.each(function(t){var e=t.get("PositionID"),i=t.get("AttributeValueDescription"),r=(t.get("AttributeValueCode"),t.get("ItemCode")),s=t.get("AttributeCode"),a=this.$('[data-itemcode="'+r+'"][data-attributecode="'+s+'"]');a.data("attributecode")==s&&a.append(new Option(i,i)).selectmenu().selectmenu("refresh"),1!=e&&this.$el.find("#"+e).attr("disabled",!0)}.bind(this))},processStock:function(){this.model.set("ImageLocation",this.getImage(this.code)),this.$el.html(this.stockTemplate(this.model.attributes))},setAttributes:function(t,e,i,r){if(e)switch(parseInt(t)){case 1:e.set({AttributeCode1:i,Attribute1:r});break;case 2:e.set({AttributeCode2:i,Attribute2:r});break;case 3:e.set({AttributeCode3:i,Attribute3:r});break;case 4:e.set({AttributeCode4:i,Attribute4:r});break;case 5:e.set({AttributeCode5:i,Attribute5:r});break;case 6:e.set({AttributeCode6:i,Attribute6:r})}},createAttributes:function(t,e,i,r){var a=new s({AttributeCode1:"1"===t?i:null,AttributeCode2:"2"===t?i:null,AttributeCode3:"3"===t?i:null,AttributeCode4:"4"===t?i:null,AttributeCode5:"5"===t?i:null,AttributeCode6:"6"===t?i:null,Attribute1:"1"===t?r:null,Attribute2:"2"===t?r:null,Attribute3:"3"===t?r:null,Attribute4:"4"===t?r:null,Attribute5:"5"===t?r:null,Attribute6:"6"===t?r:null,PositionID:t,ItemID:this.model.cid,ItemCode:e,ItemMatrixGroupCode:e});return this.attributes.add(a),a},findAttributes:function(t,e){return this.attributes?this.attributes.find(function(i){return i.get("ItemMatrixGroupCode")==t&&i.get("ItemID")==e}):null},getTrimmedAttrib:function(t){if(t){var e=l.IsNullOrWhiteSpace(t.get("Attribute1"))?"":t.get("Attribute1"),i=l.IsNullOrWhiteSpace(t.get("Attribute2"))?"":"-"+t.get("Attribute2"),r=l.IsNullOrWhiteSpace(t.get("Attribute3"))?"":"-"+t.get("Attribute3"),s=l.IsNullOrWhiteSpace(t.get("Attribute4"))?"":"-"+t.get("Attribute4"),a=l.IsNullOrWhiteSpace(t.get("Attribute5"))?"":"-"+t.get("Attribute5"),n=l.IsNullOrWhiteSpace(t.get("Attribute6"))?"":"-"+t.get("Attribute6");return e+i+r+s+a+n}},filterItemsByAttrib:function(t){return this.items.where(t)},formatParams:function(t){return{ItemMatrixGroupCode:t.code,AttributeDescription1:t.attrib1?t.attrib1:"",AttributeDescription2:t.attrib2?t.attrib2:"",AttributeDescription3:t.attrib3?t.attrib3:"",AttributeDescription4:t.attrib4?t.attrib4:"",AttributeDescription5:t.attrib5?t.attrib5:"",AttributeDescription6:t.attrib6?t.attrib6:""}},findItemByAttrib:function(t){var e=this.items.where({ItemMatrixGroupCode:t.code});return i.find(e,function(e){return e.get("AttributeDescription1")==(t.attrib1?t.attrib1:"")&&e.get("AttributeDescription2")==(t.attrib2?t.attrib2:"")&&e.get("AttributeDescription3")==(t.attrib3?t.attrib3:"")&&e.get("AttributeDescription4")==(t.attrib4?t.attrib4:"")&&e.get("AttributeDescription5")==(t.attrib5?t.attrib5:"")&&e.get("AttributeDescription6")==(t.attrib6?t.attrib6:"")})},getPrice:function(t){var e=u.CurrentCustomer.DefaultPrice?u.CurrentCustomer.DefaultPrice:u.Preference.CustomerDefaultPrice;u.CurrencySymbol;return"Retail"==e?t.get("RetailPrice"):t.get("WholeSalePrice")},change:function(t){t.preventDefault();var e=this.$(t.currentTarget),i=e.attr("id"),r=e.data("itemcode"),s=e.data("attributecode"),a=e.find("option:selected").val(),n=this.$el.find("select").length,o=n===parseInt(i);this.$el.find("#"+(parseInt(i)+1)).removeAttr("disabled").parent().removeClass("ui-disabled");var l=this.findAttributes(r,this.model.cid);if(l?this.setAttributes(i,l,s,a):l=this.createAttributes(i,r,s,a),this.updateDropdown(i,l,r),o){var b=this.findItemByAttrib({code:r,positionID:l.get("PositionID"),attrib1:l.get("Attribute1"),attrib2:l.get("Attribute2"),attrib3:l.get("Attribute3"),attrib4:l.get("Attribute4"),attrib5:l.get("Attribute5"),attrib6:l.get("Attribute6")}),c=this.getPrice(b),r=b.get("ItemCode"),d=this.getImage(r),h=(l.get("ItemID"),b.get("Quantity")?b.get("Quantity"):1);this.$el.find("img").attr({src:d,onerror:'this.onerror = null; this.src="img/ItemPlaceHolder.png";'}),this.$el.find("#"+parseInt(i)).attr("disabled","disabled").parent().addClass("ui-disabled"),l.set({Price:c,Quantity:h,ItemCode:r},{silent:!0}),b=null,window.sessionStorage.setItem("matrix_attributes",JSON.stringify(this.attributes)),this.model.trigger("updateAttribDisplay",{ID:this.model.cid,LineNum:this.model.get("DetailLineNum"),value:function(){return this.getTrimmedAttrib(l)}.bind(this),price:function(t){return t?u.CurrencySymbol+" "+c:c},model:l})}},updateDropdown:function(t,e,r){if(1==t)var s=i.pick(e.attributes,"Attribute1");else if(2==t)var s=i.pick(e.attributes,"Attribute1","Attribute2");else if(3==t)var s=i.pick(e.attributes,"Attribute1","Attribute2","Attribute3");else var s=i.pick(e.attributes,"Attribute1","Attribute2","Attribute3","Attribute4","Attribute5","Attribute6");for(attr in s)i.isNull(s[attr])&&delete s[attr];var a=this.filterItemsByAttrib(s);if(0!==a.length){var t=parseInt(t),n=this.$el.find("#"+(t+1)),u=t+1,o=this.$el.find("#"+t);n.empty(),1!=t&&o.attr("disabled","disabled").parent().addClass("ui-disabled"),0===n.has('options:contains("Please select your")').length&&n.append(new Option("Please select your "+a[0].get("AttributeCode"+(t+1),null))).selectmenu().selectmenu("refresh"),a=i.uniq(a,function(t){return t.get("AttributeDescription"+u)}),i.each(a,function(t){var e=t.get("AttributeDescription"+u);t.get("AttributeCode"+u);n.append(new Option(e,e)).selectmenu().selectmenu("refresh")}.bind(this))}},fetchAttributes:function(){var t=window.sessionStorage.getItem("matrix_attributes");if(t){var e=this.$el.find("select");e.length;this.attributes=new a(JSON.parse(t));var t=this.attributes.find(function(t){return t.get("ItemID")===this.model.cid}.bind(this));if(t){for(var i=1;i<=6;i++)this.$el.find("#"+i).val(t.get("Attribute"+i)).selectmenu().selectmenu("refresh"),1!=i&&this.$el.find("#"+i).attr("disabled","disabled").parent().addClass("ui-disabled");this.$el.find("img").attr({src:this.getImage(t.get("ItemCode")),onerror:'this.onerror = null; this.src="img/ItemPlaceHolder.png";'})}}else this.attributes=new a}})});