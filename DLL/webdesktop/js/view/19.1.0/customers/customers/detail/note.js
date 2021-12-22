define(["jquery","mobile","underscore","backbone","shared/shared","text!template/19.1.0/customers/customers/detail/note.tpl.html"],function(t,e,o,i,d,a){var l=i.View.extend({_noteTemplate:o.template(a),initialize:function(){this.$el.show()},render:function(){return this.IsNoRecord&&!this.IsNew?(this.$el.html(""),this.DisplayNoRecordFound(),t("#customers-details").removeClass("addmode"),t("#paddingRight").addClass("ui-disabled")):this.$el.html(this._noteTemplate),this},AddMode:function(){this.IsNew=!0,d.Customers.Overlay.Hide(),this.render(),this.BindData(this.IsNew),t("#newcustomer-title").text("New Note")},BindData:function(e){switch(e){case!0:t("#note-title").text("New Note"),t("#note-code i").text("[To be generated]");break;default:null==this.model&&void 0==this.model||(t("#note-title").html(this.model.get("FormattedName")),t("#note-code i").html(this.model.get("NoteCode")),t("#data-title-name").val(this.model.get("Title")),t("#data-noteText-name").val(this.model.get("NoteText")))}},DisplayNoRecordFound:function(){d.Products.DisplayNoRecordFound("#detail-body",".list-wrapper",this.toBeSearched)},FormatNoteTitle:function(){if(this.model){if(this.model.get("Title").length>40)var t=this.model.get("Title").substr(0,41)+"...";else var t=this.model.get("Title");this.model.set({FormattedName:d.Escapedhtml(t)})}},GetUpdatedModelAttributes:function(){var e=t("#data-noteText-name").val(),o=t("#data-title-name").val(),i="";if(null!=this.model||void 0!=this.model)return this.IsNew||(i=this.model.get("NoteCode")),this.model.set({NoteText:e,Title:o,NoteCode:i}),this.model.attributes;var d={NoteText:e,Title:o,EntityCode:this.entityCode,ContactCode:this.contactCode,NoteCode:""};return d},Show:function(){this.FormatNoteTitle(),this.render(),this.BindData()},ValidData:function(){var e=(t("#data-noteText-name").val(),t("#data-title-name").val()),o="";return""!=e||(o="Please fill up all fields in order to complete note",d.Customers.ShowNotification(o,!0),!1)}});return l});