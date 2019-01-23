let config = {
	isDemo: false,
	userAPIDomain: 'https://api.mobileads.com/coupons/goldenBowl',
	source: 'dumSource',
	campaignLink: 'https://goldenbowl.o2oplatform.com/',
	couponLink: 'https://goldenbowl.o2oplatform.com/coupon.html',
	emailSender: 'contact@o2oplatform.com',
	loginEmail: {
		subject: 'GoldenBowl O2O Login Link',
		content: `
			<head><meta charset="utf-8"></head>
			Thank you for registering. Please click the link below to complete your registration and win a cash voucher
			<br><br><a href="{{campaignLink}}?userId={{userId}}" target="_blank">
			{{campaignLink}}?userId={{userId}}</a>
		`
	},
	couponEmail: {
		subject: 'GoldenBowl O2O Coupon Link',
		content: `
			<head><meta charset="utf-8"></head>
			<div style="text-align:center;font-weight:600;color:#FF4244;font-size:28px;">
				CONGRATULATIONS! You won a cash voucher.
			</div>
			<br><br><div style="text-align:center;font-weight:600;">Please click the button below to get your voucher.</div>
			<a href="{{couponLink}}" target="_blank" style="text-decoration:none;">
				<button style="display:block;margin:20px auto;margin-bottom:40px;border-radius:5px;background-color:#E54C3C;border:none;color:white;width:200px;height:50px;font-weight:600;">
					Voucher
				</button>
			</a>
		`
	},
	tracking: {
		// make sure same as in index.html
		campaignId: '116',
		adUserId: '3354',
		utm_source: '{{source}}',
		generalURL: 'https://track.richmediaads.com/a/analytic.htm?pageLoadId={{cb}}&userId={{adUserId}}&campaignId={{campaignId}}&type={{type}}&value={{value}}&uniqueId={{userId}}&userType={{userType}}&source={{source}}&tc=o2o'
	}
}

export default config
