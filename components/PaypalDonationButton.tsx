import {
  PayPalButtons,
  PayPalCardFieldsProvider,
  PayPalCVVField,
  PayPalExpiryField,
  PayPalNameField,
  PayPalNumberField,
  PayPalScriptProvider,
  usePayPalCardFields,
} from "@paypal/react-paypal-js";
import React, { useEffect, useState } from "react";

export default function PaypalCardForm() {
  const [isPaying, setIsPaying] = useState(false);
  const [amount, setAmount] = useState("10.00");
  const [isCustomAmount, setIsCustomAmount] = useState(false);
  // const [error, setError] = useState();

  const initialOptions = {
    "client-id":
      "AYOeyCQvilLVKJGjslZfFSi_Nkl7A6OfXNarj5lS55iUcQXMhpp3AypVjAVkS_qvPcO5D415b9SnBFuN",
    "enable-funding": "venmo",
    "disable-funding": "",
    "buyer-country": "US",
    currency: "USD",
    "data-page-type": "product-details",
    components: "buttons,card-fields",
    "data-sdk-integration-source": "developer-studio",
  };

  // Create the order with the selected amount
  async function createOrder() {
    try {
      const res = await fetch("http://localhost:5000/api/paypal/order/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      });

      const dataResponse = await res.json();
      if (dataResponse.status === "CREATED") {
        return dataResponse.id;
      } else {
        throw new Error("Order creation failed");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      throw error;
    }
  }

  // Handle order approval
  async function onApprove(data, actions) {
    try {
      const res = await fetch(
        "http://localhost:5000/api/paypal/order/capture",
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: data.orderID }),
        }
      );

      const orderData = await res.json();
      const transaction =
        orderData?.purchaseUnits?.[0]?.payments?.captures?.[0] ||
        orderData?.purchaseUnits?.[0]?.payments?.authorizations?.[0];
      const errorDetail = orderData?.details?.[0];

      if (errorDetail || !transaction || transaction.status === "DECLINED") {
        let errorMessage;
        if (transaction) {
          errorMessage = `Transaction ${transaction.status}: ${transaction.id}`;
        } else if (errorDetail) {
          errorMessage = `${errorDetail.description} (${orderData.debug_id})`;
        } else {
          errorMessage = JSON.stringify(orderData);
        }

        throw new Error(errorMessage);
      } else {
        window.location.href = `/sponsorship/thankYou?transactionId=${transaction.id}&amount=${transaction.amount.value}`;
        return `Transaction ${transaction.status}: ${transaction.id}. See console for all available details`;
      }
    } catch (error) {
      return `Sorry, your transaction could not be processed...${error}`;
    }
  }

  // Handle error from SDK
  function onError(error) {
    // setError(error);
    console.error("Error with PayPal SDK:", error);
  }

  return (
    <div className="flex justify-center items-center min-h-screen bg-gray-50 p-8">
      {/* {error && (
        <div>
          <h3>{error}</h3>
        </div>
      )} */}
      <div className="max-w-lg w-full bg-white shadow-lg rounded-xl p-8 border border-gray-200">
        <div className="mb-6">
          <label htmlFor="amount" className="block text-lg font-semibold mb-2">
            Select Donation Amount
          </label>
          <div className="flex gap-4 mb-4">
            <div
              onClick={() => setAmount("10.00")}
              className={`cursor-pointer w-1/4 p-4 text-center rounded-lg border border-gray-300 ${
                amount === "10.00" ? "bg-gray-200" : "hover:bg-gray-100"
              }`}
            >
              $10
            </div>
            <div
              onClick={() => setAmount("20.00")}
              className={`cursor-pointer w-1/4 p-4 text-center rounded-lg border border-gray-300 ${
                amount === "20.00" ? "bg-gray-200" : "hover:bg-gray-100"
              }`}
            >
              $20
            </div>
            <div
              onClick={() => setAmount("50.00")}
              className={`cursor-pointer w-1/4 p-4 text-center rounded-lg border border-gray-300 ${
                amount === "50.00" ? "bg-gray-200" : "hover:bg-gray-100"
              }`}
            >
              $50
            </div>
            <div
              onClick={() => setAmount("100.00")}
              className={`cursor-pointer w-1/4 p-4 text-center rounded-lg border border-gray-300 ${
                amount === "100.00" ? "bg-gray-200" : "hover:bg-gray-100"
              }`}
            >
              $100
            </div>
          </div>

          <div className="w-full">
            <input
              type="number"
              value={isCustomAmount ? amount : ""}
              onChange={(e) => setAmount(e.target.value)}
              onFocus={() => setIsCustomAmount(true)}
              placeholder="Enter custom amount"
              className="w-full p-3 border rounded-lg"
            />
          </div>
        </div>

        <PayPalScriptProvider options={initialOptions}>
          <PayPalButtons
            createOrder={createOrder}
            onApprove={onApprove}
            onError={onError}
            style={{
              shape: "rect",
              layout: "vertical",
              color: "gold",
              label: "paypal",
              height: 50,
              width: "100%",
            }}
          />
          <PayPalCardFieldsProvider
            createOrder={createOrder}
            onApprove={onApprove}
            style={{
              input: {
                fontSize: "16px",
                fontFamily: "Arial, sans-serif",
                fontWeight: "normal",
                color: "#333",
                padding: "12px",
                borderRadius: "8px",
                border: "1px solid #ccc",
              },
              ".invalid": {
                color: "red",
              },
            }}
          >
            <PayPalNameField />
            <PayPalNumberField />
            <div className="flex gap-4">
              <div className="flex-1">
                <PayPalExpiryField />
              </div>
              <div className="flex-1">
                <PayPalCVVField />
              </div>
            </div>
            <SubmitPayment isPaying={isPaying} setIsPaying={setIsPaying} />
          </PayPalCardFieldsProvider>
        </PayPalScriptProvider>
      </div>
    </div>
  );
}

const SubmitPayment = ({ isPaying, setIsPaying }) => {
  const { cardFieldsForm, fields } = usePayPalCardFields();

  const handleClick = async () => {
    if (!cardFieldsForm) {
      const childErrorMessage =
        "Unable to find any child components in the <PayPalCardFieldsProvider />";
      throw new Error(childErrorMessage);
    }
    const formState = await cardFieldsForm.getState();

    if (!formState.isFormValid) {
      return alert("The payment form is invalid");
    }
    setIsPaying(true);

    cardFieldsForm.submit({}).catch((err) => {
      setIsPaying(false);
    });
  };

  return (
    <button
      className={`${
        isPaying ? "bg-gray-400" : "bg-primary"
      } w-full py-3 text-white font-semibold rounded-lg`}
      onClick={handleClick}
      disabled={isPaying}
    >
      {isPaying ? <div className="spinner tiny" /> : "Pay Now"}
    </button>
  );
};
