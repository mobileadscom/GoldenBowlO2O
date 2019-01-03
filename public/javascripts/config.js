let config = {
	isDemo: true,
	userAPIURL: 'https://api.mobileads.com', // demo api
	source: 'dumSource',
	campaignLink: 'https://demo.o2oplatform.com/goldenBowl/',
	couponLink: 'https://demo.o2oplatform.com/goldenBowl/coupon.html',
	emailSender: 'contact@o2otracking.com',
	loginEmail: {
		subject: 'GoldenBowl O2O Login Link',
		content: `
			<head><meta charset="utf-8"></head>
			Thank you for registering. Please click the link below to complete your registration and win a coupon
			<br><br><a href="https://demo.o2oplatform.com/goldenBowl/?userId={{userId}}" target="_blank">
			{{campaignLink}}?userId={{userId}}</a>
		`
	},
	couponEmail: {
		subject: 'GoldenBowl O2O Coupon Link',
		content: `
			<head><meta charset="utf-8"></head>
			<div style="text-align:center;font-weight:600;color:#FF4244;font-size:28px;">
				Congratulations. You are qualified for our offer.
			</div>
			<br><br><div style="text-align:center;font-weight:600;">Please click the button below to get your coupon.</div>
			<a href="{{couponLink}}" target="_blank" style="text-decoration:none;">
				<button style="display:block;margin:20px auto;margin-bottom:40px;border-radius:5px;background-color:#E54C3C;border:none;color:white;width:200px;height:50px;font-weight:600;">
					Coupon
				</button>
			</a>
		`
	}
}

export default config
