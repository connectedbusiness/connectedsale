/**
 * Connected Business | 05-8-2012
 */
define([
	'shared/enum',
	'collection/base',
	'model/payment',
],function(Enum, BaseCollection, PaymentModel){
	var PaymentCollection = BaseCollection.extend({
		model : PaymentModel,
		
		total: function() {
			return this.reduce(function(memo, value) { return memo + value.get("AmountPaid") }, 0);
		},
		
		totalCashPayment: function() {
			return this.reduce(function(memo, value) {
				if (value.get("PaymentType") === Enum.PaymentType.Cash) {
					return memo + value.get("AmountPaid"); 
				}
				return memo; 
			}, 0);
		},
		
		totalCheckPayment: function() {
			return this.reduce(function(memo, value) {
				if (value.get("PaymentType") === Enum.PaymentType.Check) {
					return memo + value.get("AmountPaid"); 
				}
				return memo; 
			}, 0);
		},

		totalCardPayment: function () {
		    return this.reduce(function (memo, value) {
		        if (value.get("PaymentType") === Enum.PaymentType.CreditCard) {
		            return memo + value.get("AmountPaid");
		        }
		        return memo;
		    }, 0);
		},

		totalGiftCardPayment: function () {
		    return this.reduce(function (memo, value) {
		        if (value.get("GiftType") === Enum.PaymentType.GiftCard) {
		            return memo + value.get("AmountPaid");
		        }
		        return memo;
		    }, 0);
		},

		totalGiftCertificatePayment: function () {
		    return this.reduce(function (memo, value) {
		        if (value.get("GiftType") === Enum.PaymentType.GiftCertificate) {
		            return memo + value.get("AmountPaid");
		        }
		        return memo;
		    }, 0);
		},
		
		GetNewPayments : function() {
			if (this.length > 0) {
				return this.where({IsNew: true})
			}
			return null;		
		},
		
	});
	return PaymentCollection;
});
