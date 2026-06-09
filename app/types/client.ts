export type Client = {
  id: string;
  email: string;
  role: "admin" | "client";
  authUid: string;
  accountNumber: number;
  businessName: string;
  createdAt: string;
  mpesa: {
    consumerKey: string;
    consumerSecret: string;
    passKey: string;
    shorcode: number;
  };
  phone: number;
  type: "till" | "paybill" | "stk";
  usage: {
    transactionCount: number;
    totalVolume: number;
    totalFees: number;
  };
};
