define(["jquery","mobile","underscore","backbone","shared/global","shared/shared","model/base","collection/base","text!template/22.0.0/settings/general/email/formats.tpl.html","text!template/22.0.0/settings/general/email/help.tpl.html"],function(e,t,n,i,s,a,o,l,d,r){var c=i.View.extend({events:{"tap #btn-Fields":"onFields_Tap","tap #btn-Link":"onLink_Tap","tap #btn-TestSend":"onTestSend_Tap","tap #btn-Bold":"onBold_Tap","tap #btn-Italic":"onItalic_Tap","tap #btn-Underlined":"onUnderlined_Tap","tap [cs-field-value]":"onFiledItem_Tap","tap #btn-Help":"onHelp_Tap","tap #btn-Close-Help":"onCloseHelp_Tap","tap .wrap-button":"wrapButton_Tap","tap #btn-Send":"onSend_Tap","tap #btn-Reset":"onReset_Tap"},_template:n.template(d),_helpTemplate:n.template(r),initialize:function(e){e=e||{},this.editor=e.editor,this.render(),this.editor.focus(),this.trigger("update-model"),this.selectedTextAreaID="main-body-source"},render:function(){this.$el.html(this._template),this.loadFields(),this.initialBarHeight=e("#formatting-controls").outerHeight(!0),this.initialEditorHeight=this.editor.height()},updateHeight:function(){var t=this,n=setInterval(function(){var i=t.initialEditorHeight+(t.initialBarHeight-e("#formatting-controls").outerHeight(!0))+"px";t.isDoneAnimating&&clearInterval(n),t.editor.height(i)},100)},loadFields:function(){var e=this,t=new l;t.parse=function(e){return e.EmailFields},t.url=s.ServiceUrl+"Transactions/getemailtemplatefields",t.fetch({success:function(t,n){e.renderFields(t)},error:function(e,t,n){console.log("Error Loading Email Fields")}})},renderFields:function(e){if(e){var t=this;n.each(e.where({IsDetailField:!1}),function(e){t.addFieldToPool(e)}),this.$el.find("#grp-Fields").append('<div style="width: 100%;background: transparent;height: 1px;padding: 0;margin: 0; border: none;"></div>'),n.each(e.where({IsDetailField:!0}),function(e){t.addFieldToPool(e)})}},addFieldToPool:function(e){var t=e.get("DataColumn"),n=e.get("EmailField").toUpperCase(),i=e.get("IsDetailField");isImage=e.get("IsImage"),t=i?"Row Field: "+t:t;var s=i?"IsDetailField":"";isImage&&(s+=" IsImage"),this.$el.find("#grp-Fields").append('<div class="'+s+'" title="'+t+'" cs-field-value="{'+n+'}">{'+n+"}</div>")},onLink_Tap:function(e){e.preventDefault();var t=this;t.isDoneAnimating=!1,t.updateHeight(),this.$el.find("#btn-Link").hasClass("selected")?this.resetSubControls(function(){t.isDoneAnimating=!0}):(this.resetSubControls(function(){t.$el.find("#grp-Link").show("slow",function(){t.isDoneAnimating=!0})}),t.$el.find("#btn-Link").addClass("selected"))},onTestSend_Tap:function(e){e.preventDefault();var t=this;t.isDoneAnimating=!1,t.updateHeight(),this.$el.find("#btn-TestSend").hasClass("selected")?this.resetSubControls(function(){t.isDoneAnimating=!0}):(this.resetSubControls(function(){t.$el.find("#grp-TestSend").show("slow",function(){t.isDoneAnimating=!0})}),t.$el.find("#btn-TestSend").addClass("selected"))},onFields_Tap:function(e){e.preventDefault();var t=this;t.isDoneAnimating=!1,t.updateHeight(),this.$el.find("#btn-Fields").hasClass("selected")?this.resetSubControls(function(){t.isDoneAnimating=!0}):(this.resetSubControls(function(){t.$el.find("#grp-Fields").show("slow",function(){t.isDoneAnimating=!0})}),t.$el.find("#btn-Fields").addClass("selected"))},InsertCodeInTextArea:function(e){var t=document.getElementById(this.selectedTextAreaID);if(document.selection){t.focus();var n=document.selection.createRange();return n.text=e,void this.trigger("update-model")}if(t.selectionStart||"0"==t.selectionStart){var i=t.selectionStart,s=t.selectionEnd;t.scrollTop;t.value=t.value.substring(0,i)+e+t.value.substring(s,t.value.length),t.focus(),t.selectionStart=i+e.length,t.selectionEnd=i+e.length}else t.value+=textArea.value,t.focus();this.trigger("update-model")},resetSubControls:function(e){var t=this;this.$el.find("#grp-Formats div").removeClass("selected"),this.$el.find("#grp-Fields").hide("fast",function(){t.$el.find("#grp-Link").hide("fast",function(){t.$el.find("#grp-TestSend").hide("fast",e)})})},onHelp_Tap:function(e){e.preventDefault(),this.$el.find("#help-body").html(this._helpTemplate()),this.$el.find("#help-tool").show()},onCloseHelp_Tap:function(e){e.preventDefault(),this.$el.find("#help-body").html(""),this.$el.find("#help-tool").hide()},wrapButton_Tap:function(t){t.preventDefault();var n=e(t.currentTarget).find("i"),i=!1;n.hasClass("icon-check-empty")?(n.removeClass("icon-check-empty"),n.addClass("icon-check"),i=!0):(n.removeClass("icon-check"),n.addClass("icon-check-empty")),"mb-wrap"==t.currentTarget.id&&e("#main-body-source").attr("wrap",i?"on":"off")},onFiledItem_Tap:function(t){t.preventDefault();var n=this,i=(e(document.createElement("span")),e(t.target).attr("cs-field-value")||""),s=e(t.target).hasClass("IsImage");i=s?'<img src="data:image/png;base64,'+i+'">':i,n.InsertCodeInTextArea(i)},onSend_Tap:function(e){e.preventDefault();var t=this,n=this.$el.find("#txtTestEmail").val();return(n=(n||"").trim())?a.ValidateEmailFormat(n)?void a.ShowNotification("Invalid Email Address",!0):(t.toggleSendButton(!0,!0),void this.trigger("save-changes",function(){t.doSend(n)},function(){t.toggleSendButton()})):void a.ShowNotification("Email Address is required",!0)},onReset_Tap:function(e){e.preventDefault(),this.trigger("reset-template")},doSend:function(e){var t=this,n=new o;n.url=s.ServiceUrl+"Transactions/sendtestemail",n.set({UserName:s.Username,RecipientEmailAddress:e,IsReadyForInvoice:!0,WorkStationID:s.POSWorkstationID}),t.toggleSendButton(!0),n.save(n,{success:function(e,n){t.toggleSendButton(),n.Value?a.ShowNotification("Test Email Sent!"):a.ShowNotification(n.ErrorMessage||"Error Sending Email",!0)},error:function(e,n,i){t.toggleSendButton(),a.ShowNotification("An error was encountered when trying to Send Test Email",!0)}})},toggleSendButton:function(e,t){e?(this.$el.find("#btn-Send i").removeClass("icon-envelope"),this.$el.find("#btn-Send i").addClass("icon-spinner"),this.$el.find("#btn-Send i").addClass("icon-spin"),this.$el.find("#btn-Send").addClass("ui-disabled"),this.$el.find("#btn-Send span").text(t?"Saving...":"Sending...")):(this.$el.find("#btn-Send i").removeClass("icon-spinner"),this.$el.find("#btn-Send i").removeClass("icon-spin"),this.$el.find("#btn-Send i").addClass("icon-envelope"),this.$el.find("#btn-Send").removeClass("ui-disabled"),this.$el.find("#btn-Send span").text("Send"))},insertNewElement:function(e){try{this.editor.focus();var t=window.getSelection().getRangeAt(0);t.deleteContents(),t.insertNode(e)}catch(n){console.log(n.message)}},onBold_Tap:function(e){e.preventDefault(),document.execCommand("Bold",!1,null),this.updateBoldElements(),this.trigger("update-model")},onItalic_Tap:function(e){e.preventDefault(),document.execCommand("Italic",!1,null)},onUnderlined_Tap:function(e){e.preventDefault(),document.execCommand("Underline",!1,null),this.trigger("update-model")},updateBoldElements:function(){a.SetStyle(e(this.editor.find("b")),"font-weight","bold !important")}});return c});