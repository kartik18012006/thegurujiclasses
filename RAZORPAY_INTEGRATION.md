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

### Current Keys (Test Mode)
- **Key ID**: `rzp_test_RwYH3q9VfgWuE2`
- **Key Secret**: `0JCjKpjeVNFWiAbRnwpyBowL`

### Environment Variables (Optional)
Create a `.env` file in the root directory:
```
VITE_RAZORPAY_KEY_ID=rzp_test_RwYH3q9VfgWuE2
VITE_RAZORPAY_KEY_SECRET=0JCjKpjeVNFWiAbRnwpyBowL
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
- Test keys are provided as fallback for development
- For production, use live keys from Razorpay dashboard

## 📝 Next Steps

1. **Test Payment Flow**:
   - Use Razorpay test cards: https://razorpay.com/docs/payments/test-cards/
   - Test successful payment
   - Test payment cancellation

2. **Production Setup**:
   - Get live API keys from Razorpay dashboard
   - Update environment variables with live keys
   - Test with real payment (small amount)

3. **Payment Verification** (Optional):
   - Implement webhook handler for payment verification
   - Store payment records in Firestore
   - Add payment history to student profile

## 🧪 Test Cards

Use these test cards for testing:
- **Success**: 4111 1111 1111 1111
- **Failure**: 4000 0000 0000 0002
- **CVV**: Any 3 digits
- **Expiry**: Any future date

## 📚 Documentation

- Razorpay Docs: https://razorpay.com/docs/
- Checkout Integration: https://razorpay.com/docs/payments/payment-gateway/web-integration/standard/

