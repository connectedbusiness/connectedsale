define([
  'jquery',
  'mobile',
  'underscore',
  'backbone',
  'shared/global',
  'model/lookupcriteria',
  'collection/base',
  'text!template/18.1.0/customers/typepopup/popupcontainer.tpl.html',
  'text!template/18.1.0/customers/typepopup/typelist.tpl.html',
  'js/libs/moment.min.js'
], function($, $$, _, Backbone, Global, BtnModel, BtnCollection, template, BtnTemplate) {

  var ContacTypePopUpView = Backbone.View.extend({
    _template: _.template(template),
    _btnTemplate: _.template(BtnTemplate),

    events: {
      "tap #customer-contact-btn": "customerContact_Tapped",
      "tap #shipto-contact-btn": "shiptoContact_Tapped"
    },

    initialize: function() {
      this.render()
    },

    InitializeChildViews: function() {
      this.setIwantoBtn();
    },

    render: function() {
      this.$el.html(this._template());
    },

    setIwantoBtn: function() {
      $("#typePopUpContainer").append(this._btnTemplate());
    },

    customerContact_Tapped: function(e) {
      this.ContactTypeChanged('CustomerContact');
    },

    shiptoContact_Tapped: function(e) {
      this.ContactTypeChanged('CustomerShipToContact');
    },

    ContactTypeChanged: function(type) {
      Global.Contact.Type = type;
      this.trigger('typeChanged');
    }

  });
  return ContacTypePopUpView;
})
