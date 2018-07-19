define(["jquery","mobile","underscore","backbone","shared/global","shared/service","shared/method","model/lookupcriteria","view/16.0.0/secondarydisplay/workstations/workstation","text!template/16.0.0/secondarydisplay/workstations/workstations.tpl.html","view/spinner","js/libs/iscroll.js"],function(t,i,o,e,n,s,r,a,l,c,h){var d=e.View.extend({_template:o.template(c),events:{"keyup #workstation-search":"keyUp_workstationSearch","tap .btn-Close":"btnClick_Close"},initialize:function(){this.collection.on("reset",this.AddAllWorkstations,this)},render:function(){this.$el.html(this._template),this.FetchWorkstations()},Close:function(){this.trigger("ViewClosed"),this.$el.hide()},FetchWorkstations:function(){var t=this,i=this.$("#workstation-search").val(),o=new a,e=100;i||(i=""),o.set({StringValue:i}),this.ShowActivityIndicator(),o.url=n.ServiceUrl+s.POS+r.PREFERENCELOOKUP+e,o.save(null,{success:function(i,o){n.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),t.ResetWorkstationCollection(o.Preferences)},error:function(i,o,e){n.isBrowserMode||window.plugins.cbNetworkActivity.HideIndicator(),i.RequestError(o,"Error Retrieving Workstations"),t.HideActivityIndicator()}})},ResetWorkstationCollection:function(t){this.collection.reset(t),this.ApplyJQM(),this.RefreshScroll()},AddOneWorkstation:function(t){var i=new l({model:t});this.$("#workstationListContainer").append(i.render().el)},RefreshScroll:function(){return n.isBrowserMode?void t("#workstation-content").css("overflow-y","scroll"):(this.myScroll&&(this.myScroll.destroy(),this.myScroll=null),void(this.myScroll=new iScroll("workstation-content")))},ApplyJQM:function(){try{t(".workstationContainer").trigger("create"),t("#workstationListContainer").listview("refresh")}catch(i){console.log("error encountered: "+i)}},ShowNoData:function(){this.$(".no-data").show()},HideNoData:function(){this.$(".no-data").hide()},AddAllWorkstations:function(){!this.collection.length>0?this.ShowNoData():this.HideNoData(),this.$("#workstationListContainer").empty(),this.collection.each(this.AddOneWorkstation,this),this.HideActivityIndicator()},Show:function(){this.render(),this.$el.show()},keyUp_workstationSearch:function(t){13===t.keyCode&&this.FetchWorkstations()},btnClick_Close:function(t){t.preventDefault(),this.Close()},ShowActivityIndicator:function(){if(document.getElementById("workstation-form")){t("#spin").remove(),t("<div id='spin' class='spin'></div>").appendTo(this.$("#workstation-form"));var i=document.getElementById("spin");this._spinner=h,this._spinner.opts.color="#fff",this._spinner.opts.lines=13,this._spinner.opts.length=7,this._spinner.opts.width=4,this._spinner.opts.radius=10,this._spinner.opts.top="auto",this._spinner.opts.left="auto",this._spinner.spin(i),t("<h5>Loading...</h5>").appendTo(t("#spin"))}},HideActivityIndicator:function(){this._spinner&&(t("#spin").remove(),this._spinner.stop())}});return d});