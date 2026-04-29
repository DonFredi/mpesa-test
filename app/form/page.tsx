import MpesaForm from "../components/MpesaForm";

export default function Form() {
  return (
    <div className="flex justify-center">
      <main className="flex flex-col items-center justify-between p-2 sm:items-start">
        <div className="flex flex-col items-center text-center sm:items-start sm:text-left">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800">
            Mpesa Test Console
            <MpesaForm />
          </h1>
        </div>
      </main>
    </div>
  );
}
