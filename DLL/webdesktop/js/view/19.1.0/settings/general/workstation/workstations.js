define(["jquery","mobile","underscore","backbone","shared/global","shared/shared","view/19.1.0/settings/general/workstation/workstation","text!template/19.1.0/settings/general/workstation/workstations.tpl.html","text!template/19.1.0/settings/general/workstation/search.tpl.html","js/libs/iscroll.js"],function(t,e,i,s,r,n,o,a,l){var c=s.View.extend({_template:i.template(a),_search:i.template(l),initialize:function(){t("#settings-workstation-container").remove(),this.render()},render:function(){t("#back-general").show(),this.$el.html(this._template),t("#settings-modal-content").before(this._search),this.$el.trigger("create"),this.collection.each(this.LoadWorkstations,this),r.isBrowserMode?n.ApplyListScroll():this.myScroll=new iScroll("scroll-wrapper"),t("#settings-workstation-input").attr("maxlength","30"),t("#settings-workstation-input").val(r.WorkstationValue)},LoadWorkstations:function(t){this.workstationPreference=new o({model:t}),this.$("#workstationListPreference").append(this.workstationPreference.render().el),this.$("#workstationListPreference").listview("refresh")},SetSelected:function(e){this.collection.each(function(i){i.get("WorkstationID")===e&&(t("<img class='ui-li-icon' style ='height:25px;width:27px;'/>").attr({src:"img/check@2x.png"}).prependTo(t("#"+i.cid)),t("#workstationListPreference").listview("refresh"))})}});return c});