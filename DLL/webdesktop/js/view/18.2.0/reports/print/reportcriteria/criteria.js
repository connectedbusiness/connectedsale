define(["jquery","mobile","underscore","backbone","shared/global","shared/service","shared/method","shared/shared","model/base","model/lookupcriteria","collection/base","text!template/18.2.0/reports/print/printdialog/reportcriteria/criteria.tpl.html","js/libs/moment.min.js","js/libs/format.min.js"],function(e,t,a,i,s,n,r,o,c,l,h,d,u){var m=!1,I=i.View.extend({_template:a.template(d),BindEvents:function(){var t=this;e(this.classID.CID+" .addCriteria").on("tap",function(){t.SelectedItem()}),e(this.classID.CID).on("tap",function(){t.SelectedItem()}),e(this.classID.CID+" .removeCriteria").on("tap",function(e){t.RemoveCriteria(e)}),e(this.classID.InputID).on("blur",function(){t.SaveChanges()})},initialize:function(){this.classID={CID:" #"+this.cid+" ",ModelID:this.cid,InputID:" #"+this.cid+" #txtInput-"+this.cid},this.render()},SelectedItem:function(){},SaveChanges:function(){var t=e(this.classID.InputID).val();"datetime"==this.type&&(o.IsNullOrWhiteSpace(t)||(t=this.FormatDateToJSON(t)));this.model.get("ColumnName");this.model.set({CriteriaValue:t}),this.trigger("updateLineItem",this.model)},JsonToAspDate:function(e){var t=Date.parse(e),a=new Date(t),i=a.getMonth(),s=a.getDate(),n=a.getFullYear();return a=Date.UTC(n,i,s),a="/Date("+a+")/"},FormatDateToJSON:function(e){return moment(e).format("M/D/YYYY hh:mm:ss A")},RemoveCriteria:function(t){t.preventDefault(),this.trigger("RemoveCriteria",this.model),e(this.classID.CID).remove()},ValidateKeyInput:function(t,a,i){var s=t.keyCode,n=e(a).val(),r=!1;switch(s){case 48:case 49:case 50:case 51:case 52:case 53:case 54:case 55:case 56:case 57:case 46:case 37:case 39:case 8:case 13:return!0;case 190:if(!i)return t.preventDefault(),!1;if(n.length>0){for(var o=0;o<=n.length;o++)"."==n[o]&&(r=!0);return 1!=r||(t.preventDefault(),!1)}default:return t.preventDefault(),!1}},ConvertInputType:function(e){switch(e){case"numeric":case"double":case"float":case"bigint":case"tinyint":case"INT":e="number";break;case"time":e="time";break;case"date":case"datetime":case"smalldatetime":e="date";break;case"bit":e="checkbox";break;default:e="text"}return e},OptionChange:function(){var e=this.classID.CID+" td  #chkOption";m=o.CustomCheckBoxChange(e,m),this.model.set({CriteriaValue:m}),this.trigger("updateLineItem",this.model)},TriggerOptionChangeOnload:function(){m=!0,this.model.set({CriteriaValue:m}),this.trigger("updateLineItem",this.model)},AssignPlaceHolder:function(e,t){var a=t.get("ColumnName");return"datetime"!=e&&"date"!=e||(a="mm/dd/yyyy"),a},InitializeInputProperties:function(t,a){var i=this;switch(t){case"checkbox":e(this.classID.CID+" #chkOption").addClass("icon-check"),e(this.classID.CID+" #chkOption").show(),e(this.classID.CID+" #chkOption").on("tap",function(){i.OptionChange()}),this.TriggerOptionChangeOnload(),e(this.classID.InputID).hide();break;case"date":case"datetime":e(i.classID.InputID).addClass("custom-date-time");break;case"number":"double"==a||"float"==a||"numeric"==a?e(i.classID.InputID).on("keydown",function(e){i.ValidateKeyInput(e,inputID,!0)}):e(i.classID.InputID).on("keydown",function(e){i.ValidateKeyInput(e,inputID,!1)})}},LoadBrowserDatePicker:function(t){var a=this;s.isBrowserMode&&e(function(){"date"!=t&&"datetime"!=t||("date"==t?o.BrowserModeDatePicker(a.classID.InputID,"datepicker"):o.BrowserModeDatePicker(a.classID.InputID,"datetimepicker"),e(a.classID.InputID).on("change",function(){a.SaveChanges()}))}),this.BindEvents()},render:function(){var t=this;console.log("daTATYPE : "+this.model.get("DataType"));var a=this.ConvertInputType(this.model.get("DataType")),i=this.model.get("MaxLength"),s=(this.model.get("ColumnName"),this.AssignPlaceHolder(a,this.model));this.type=a;var n="";return o.IsNullOrWhiteSpace(this.model.get("DefaultValue"))||(n=this.model.get("DefaultValue")),this.model.set({ModelID:t.cid,Type:a,MaxLength:i,CriteriaValue:n,PlaceHolder:s}),this.$el.append(this._template(this.model.toJSON())),this.InitializeInputProperties(a,this.model.get("DataType")),this.LoadBrowserDatePicker(a),o.IsNullOrWhiteSpace(n)||e(this.classID.InputID).val(n),this},InitializeChildViews:function(){this.BindEvents()}});return I});