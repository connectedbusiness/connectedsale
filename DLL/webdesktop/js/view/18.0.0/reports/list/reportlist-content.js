define(["jquery","mobile","underscore","backbone","shared/global","shared/service","shared/method","model/base","model/lookupcriteria","collection/base","text!template/16.0.0/reports/list/reportlistcontent.tpl.html"],function(e,t,s,i,l,o,n,d,r,c,a,h){var u=i.View.extend({_template:s.template(a),BindEvents:function(){var t=this;e(this.classID.CID).on("tap",function(){t.SelectedItem()})},initialize:function(){this.classID={CID:" #"+this.cid+" "},this.render()},SelectFirstModel:function(t){var s=t.get("ReportCode");this.model.get("ReportCode")==s&&(e(".report-lookup-content").removeClass("selected-blue"),e(this.classID.CID).addClass("selected-blue"))},SelectedItem:function(){e(".report-lookup-content").removeClass("selected-blue"),e(this.classID.CID).addClass("selected-blue"),this.trigger("selected",this.model)},render:function(){var e=this;return this.model.set({ModelID:e.cid}),this.$el.append(this._template(this.model.toJSON())),this},InitializeChildViews:function(){this.BindEvents()}});return u});