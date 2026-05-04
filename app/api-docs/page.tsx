export default function ApiDocsPage() {
  return (
    <div className="min-h-screen px-4 py-10 bg-gray-50">
      <div className="max-w-4xl mx-auto bg-white p-6 rounded-2xl shadow">
        <h1 className="text-3xl font-bold text-gray-800">M-Pesa API Documentation 📘</h1>

        {/* OVERVIEW */}
        <section className="mt-6">
          <h2 className="text-xl font-semibold">Overview</h2>
          <p className="text-gray-600 mt-2">Use this API to integrate M-Pesa payments into your application.</p>
        </section>

        {/* BASE URL */}
        <section className="mt-6">
          <h2 className="text-xl font-semibold">Base URL</h2>
          <div className="bg-gray-100 p-3 rounded mt-2 text-sm">https://mpesa-payments.vercel.app/api/mpesa</div>
        </section>

        {/* AUTH */}
        <section className="mt-6">
          <h2 className="text-xl font-semibold">Authentication</h2>
          <p className="text-gray-600 mt-2">Include your API key in headers:</p>

          <pre className="bg-gray-900 text-green-400 p-3 rounded mt-2 text-sm overflow-x-auto">
            {`{
  "x-api-key": "your_api_key_here"
}`}
          </pre>
        </section>

        {/* STK PUSH */}
        <section className="mt-6">
          <h2 className="text-xl font-semibold">STK Push</h2>

          <p className="text-gray-600 mt-2">Initiate payment request to customer's phone.</p>

          <div className="bg-gray-100 p-3 rounded mt-2 text-sm">POST /transactions</div>

          <pre className="bg-gray-900 text-green-400 p-3 rounded mt-2 text-sm overflow-x-auto">
            {`{
  "transactionType": "stkPush",
  "phone": "2547XXXXXXXX",
  "amount": 100
}`}
          </pre>
        </section>

        {/* PAYBILL */}
        <section className="mt-6">
          <h2 className="text-xl font-semibold">Paybill</h2>

          <pre className="bg-gray-900 text-green-400 p-3 rounded mt-2 text-sm overflow-x-auto">
            {`{
  "transactionType": "paybill",
  "phone": "2547XXXXXXXX",
  "amount": 100,
  "shortcode": "123456",
  "accountNumber": "INV001"
}`}
          </pre>
        </section>

        {/* RESPONSE */}
        <section className="mt-6">
          <h2 className="text-xl font-semibold">Response</h2>

          <pre className="bg-gray-900 text-green-400 p-3 rounded mt-2 text-sm overflow-x-auto">
            {`{
  "CheckoutRequestID": "ws_CO_123...",
  "ResponseCode": "0",
  "CustomerMessage": "Success. Request accepted"
}`}
          </pre>
        </section>
      </div>
    </div>
  );
}
