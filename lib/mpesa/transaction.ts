import { stkPush } from "./stk";
import { paybillPayment } from "./paybill";
import { tillPayment } from "./till";
import { sendMoney } from "./b2c";

export async function mpesaTransactionRouter(body: any, mpesa: any) {
  const { transactionType } = body;

  switch (transactionType) {
    case "stkPush":
      return stkPush({ ...body, mpesa });

    case "paybill":
      return paybillPayment({ ...body, mpesa });

    case "till":
      return tillPayment({ ...body, mpesa });

    case "sendMoney":
      return sendMoney({ ...body, mpesa });

    default:
      throw new Error("Invalid transaction type");
  }
}
