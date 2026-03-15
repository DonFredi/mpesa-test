export default interface Order {
  transactionType: "STK_PUSH" | "PAYBILL" | "TILL" | "SEND_MONEY";
  phone: string;
  amount: number;
  accountNumber?: number; // paybill only
  receiverPhone?: string; // send money
}
