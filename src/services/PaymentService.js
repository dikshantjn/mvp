const paymentModel = require("../models/paymentModel");
const ApiError = require("../utils/apiError");

class PaymentService {
  static async getSummary(buyerUserId) {
    const summary = await paymentModel.getPaymentSummary(buyerUserId);
    return {
      totalAmount: Number(summary.total_amount),
      paidAmount: Number(summary.paid_amount),
      dueAmount: Number(summary.due_amount),
      overdueAmount: Number(summary.overdue_amount),
      lastPaymentDate: summary.last_payment_date
    };
  }

  static async listBuyerPayments(buyerUserId, page, pageSize) {
    const result = await paymentModel.listPaymentsByBuyer(buyerUserId, page, pageSize);
    return {
      items: result.items.map((item) => ({
        id: item.id,
        title: item.title,
        amount: Number(item.amount),
        status: item.status,
        dueDate: item.due_date,
        paidDate: item.paid_date,
        referenceNumber: item.reference_number
      })),
      page,
      pageSize,
      total: result.total
    };
  }

  static async listBuyerPaymentSchedule(buyerUserId, page, pageSize) {
    const result = await paymentModel.listPaymentsByBuyer(buyerUserId, page, pageSize, ["due", "overdue"]);
    return {
      items: result.items.map((item) => ({
        id: item.id,
        title: item.title,
        amount: Number(item.amount),
        dueDate: item.due_date,
        status: item.status
      })),
      page,
      pageSize,
      total: result.total
    };
  }

  static async createPayment(adminUserId, payload, buyerExists) {
    if (!buyerExists) {
      throw new ApiError(404, "NOT_FOUND", "Buyer not found", {});
    }

    return paymentModel.createPayment({
      id: require("uuid").v4(),
      buyerUserId: payload.buyerId,
      title: payload.title,
      amount: payload.amount,
      status: payload.status,
      dueDate: payload.dueDate || null,
      paidDate: payload.paidDate || null,
      referenceNumber: payload.referenceNumber || null,
      createdByAdminId: adminUserId
    });
  }
}

module.exports = PaymentService;
