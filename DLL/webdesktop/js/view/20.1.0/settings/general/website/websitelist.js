define(["jquery","mobile","underscore","backbone","shared/global","shared/shared","model/base","view/20.1.0/settings/general/website/websitecontent","text!template/20.1.0/settings/general/website/websitelist.tpl.html","text!template/20.1.0/settings/general/website/search.tpl.html","js/libs/iscroll.js"],function(e,t,i,s,n,l,r,c,o,h){var a=s.View.extend({_template:i.template(o),_search:i.template(h),initialize:function(){e("#settings-website-search").remove(),this.render()},render:function(){e("#back-general").show(),this.$el.html(this._template),e("#settings-modal-content").before(this._search),this.$el.trigger("create"),this.collection.each(this.LoadWebsiteContent,this),n.isBrowserMode?l.ApplyListScroll():this.myScroll=new iScroll("scroll-wrapper"),this.SetSelected()},SetSelected:function(t){this.collection.each(function(i){i.get("WebSiteCode")===t&&(e("<img class='ui-li-icon' style ='height:25px;width:27px;'/>").attr({src:"img/check@2x.png"}).prependTo(e("#"+i.cid)),e("#website-list-preference").listview("refresh"))})},LoadWebsiteContent:function(e){this.websiteContentPref=new c({model:e}),this.$("#website-list-preference").append(this.websiteContentPref.render().el),this.$("#website-list-preference").listview("refresh")}});return a});