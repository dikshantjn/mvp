const buyerModel = require("../models/buyerModel");
const ApiError = require("../utils/apiError");

class BuyerService {
  static async getProfile(buyerUserId) {
    const buyer = await buyerModel.getBuyerProfile(buyerUserId);
    if (!buyer) {
      throw new ApiError(404, "NOT_FOUND", "Buyer not found", {});
    }

    return {
      id: buyer.id,
      fullName: buyer.full_name,
      email: buyer.email,
      mobileNumber: buyer.mobile_number,
      role: "buyer",
      buyerProfile: {
        buyerId: buyer.id,
        status: buyer.status
      }
    };
  }

  static async getUnit(buyerUserId) {
    const assignment = await buyerModel.getBuyerUnitAssignment(buyerUserId);
    if (!assignment) {
      throw new ApiError(404, "NO_UNIT_ASSIGNED", "No unit assigned", {});
    }

    return {
      assignmentId: assignment.assignment_id,
      project: {
        id: assignment.project_id,
        name: assignment.project_name
      },
      unit: {
        id: assignment.unit_id,
        unitNumber: assignment.unit_number,
        tower: assignment.tower,
        floor: assignment.floor,
        type: assignment.type,
        areaSqFt: Number(assignment.area_sq_ft),
        status: assignment.status
      },
      purchase: {
        agreementValue: Number(assignment.agreement_value),
        bookingDate: assignment.booking_date
      }
    };
  }
}

module.exports = BuyerService;
