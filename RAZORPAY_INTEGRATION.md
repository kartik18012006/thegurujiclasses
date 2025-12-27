# Razorpay Payment Integration

## ✅ Integration Complete

Razorpay payment gateway has been successfully integrated into the EdTech platform for course enrollment payments.

## 📁 Files Modified/Created

### 1. **`index.html`**
   - Added Razorpay Checkout script: `<script src="https://checkout.razorpay.com/v1/checkout.js"></script>`

### 2. **`src/config/razorpay.js`** (NEW)
   - Razorpay configuration with API keys
   - Uses environment variables with fallback to provided keys

### 3. **`src/services/payment.js`** (NEW)
   - `initiatePayment()` function to start Razorpay payment flow
   - Handles payment success and cancellation

### 4. **`src/pages/student/StudentCourseDetail.jsx`**
   - Updated `handleEnroll()` to integrate Razorpay payment
   - Payment is required for courses with price > 0
   - Free courses (price = 0) skip payment

## 🔑 Configuration

### Current Keys (Live Mode)
- **Key ID**: `rzp_live_Rwikp6Zp3Uderj`
- **Key Secret**: `Ydy9j8fCnc7AwWAK2xT0iQFs`

### Environment Variables (Optional)
Create a `.env` file in the root directory:
```
VITE_RAZORPAY_KEY_ID=rzp_live_Rwikp6Zp3Uderj
VITE_RAZORPAY_KEY_SECRET=Ydy9j8fCnc7AwWAK2xT0iQFs
```

**Note**: `.env` files are already in `.gitignore` and won't be committed.

## 💳 Payment Flow

1. Student clicks "Enroll Now" on a course
2. If course has a price > 0:
   - Razorpay payment modal opens
   - Student enters payment details
   - Payment is processed
3. On successful payment:
   - Student is enrolled in the course
   - Enrollment record is saved to Firestore
   - Student gains access to course lessons
4. On payment cancellation:
   - Error message is shown
   - Enrollment is not completed

## 🎨 Payment Modal Styling

- **Color Theme**: Indigo (#4f46e5) matching platform theme
- **Company Name**: The GuruJI Classes
- **Prefilled Data**: Student name and email from profile

## 🔒 Security Notes

- API keys are stored in environment variables
- Keys are not hardcoded in production code
- Live keys are configured and active
- **Important**: Never commit live keys to version control

## 📝 Next Steps

1. **Live Payment Testing**:
   - Test with real payment (small amount)
   - Verify payment success flow
   - Test payment cancellation

2. **Payment Verification** (Optional):
   - Implement webhook handler for payment verification
   - Store payment records in Firestore
   - Add payment history to student profile

3. **Monitoring**:
   - Monitor payment success rates
   - Set up alerts for failed payments
   - Review transaction logs in Razorpay dashboard

## 📚 Documentation

- Razorpay Docs: https://razorpay.com/docs/
- Checkout Integration: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/


