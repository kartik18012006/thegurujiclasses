import { RAZORPAY_CONFIG } from '../config/razorpay';

export const initiatePayment = async (amount, courseName, courseId, userId, userName, userEmail) => {
  return new Promise((resolve, reject) => {
    if (!window.Razorpay) {
      reject({
        success: false,
        error: 'Razorpay SDK not loaded',
      });
      return;
    }

    const options = {
      key: RAZORPAY_CONFIG.key,
      amount: amount * 100,
      currency: 'INR',
      name: 'The GuruJI Classes',
      description: `Payment for ${courseName}`,
      image: '/vite.svg',
      prefill: {
        name: userName || '',
        email: userEmail || '',
        contact: '',
      },
      notes: {
        courseId: courseId,
        userId: userId,
        courseName: courseName,
      },
      theme: {
        color: '#4f46e5',
      },
      handler: function (response) {
        resolve({
          success: true,
          paymentId: response.razorpay_payment_id,
          orderId: response.razorpay_order_id,
          signature: response.razorpay_signature,
        });
      },
      modal: {
        ondismiss: function () {
          reject({
            success: false,
            error: 'Payment cancelled by user',
          });
        },
      },
    };

    const razorpay = new window.Razorpay(options);
    razorpay.open();
  });
};

