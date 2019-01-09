let config = {
	isDemo: false,
	userAPIDomain: 'https://api.mobileads.com',
	source: 'dumSource',
	campaignLink: 'https://demo.o2oplatform.com/goldenBowl/',
	couponLink: 'https://demo.o2oplatform.com/goldenBowl/coupon.html',
	emailSender: 'contact@o2oplatform.com',
	loginEmail: {
		subject: 'GoldenBowl O2O Login Link',
		content: `
			<head><meta charset="utf-8"></head>
			Thank you for registering. Please click the link below to complete your registration and win a cash voucher
			<br><br><a href="https://demo.o2oplatform.com/goldenBowl/?userId={{userId}}" target="_blank">
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
		campaignId: 'df9fa8c87d2ab84e1f1893d7484908a9',
		adUserId: '3354',
		rmaId: '239',
		utm_source: '',
		generalURL: 'https://track.richmediaads.com/a/analytic.htm?rmaId={{rmaId}}&domainId=0&pageLoadId={{cb}}&userId={{adUserId}}&pubUserId=0&campaignId={{campaignId}}&callback=trackSuccess&type={{type}}&value={{value}}&uniqueId={{userId}}&userType={{userType}}&source={{source}}'
	}
}

export default config
