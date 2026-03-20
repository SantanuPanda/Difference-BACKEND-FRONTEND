import axios from "axios";

const App = () => {

/* 1. When the user clicks the "Open Razorpay" button, the handlePayment function is called.*/

const handlePayment = async () => {
    try {
      /* 2. This request is intended to create a new Razorpay order on the server side. The response from the server is expected to contain the order details, including the amount, currency, and order ID. and we are destucture it */
      const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/placerazorpayorder`);

      /* 3. The options object is created with the necessary details required to initialize the Razorpay payment gateway. This includes the key, amount, currency, order ID, and other relevant information. The handler function is defined to handle the response from Razorpay after the payment process is completed. */
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID, // must set the Razorpay key ID from environment variables
        amount: data.order.amount,
        currency: data.order.currency,
        order_id: data.order.id,
        name: "My Test App",
        description: "Demo Payment",

        /* 4. The handler function is an asynchronous function that is called when the payment process is completed. It receives the response from Razorpay, which contains the payment details. The function then makes a POST request to the server to verify the payment using the received response. Based on the verification result, an alert is shown to the user indicating whether the payment was successful and verified or if the verification failed. */
        handler: async function (response) {
          const { data } = await axios.post(`${import.meta.env.VITE_BACKEND_URL}/verifyRazorpay`,response);
          alert(data.success? "Payment Successful and Verified": "Payment Verification Failed");
        },
      };
      /* 5. Finally, a new instance of Razorpay is created using the options object, and the open method is called to display the Razorpay payment interface to the user. This allows the user to complete the payment process. */
      new window.Razorpay(options).open();

    } catch (error) {
      console.log(error);
      alert("Something went wrong");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <button
        onClick={handlePayment}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Open Razorpay
      </button>
    </div>
  );
};

export default App;