const { v4: uuidv4 } = require("uuid");

const ticketModel = require("../models/ticketModel");
const ApiError = require("../utils/apiError");

class TicketService {
  static async listBuyerTickets(buyerUserId, page, pageSize) {
    const result = await ticketModel.listTicketsByBuyer(buyerUserId, page, pageSize);
    return {
      items: result.items.map((item) => ({
        id: item.id,
        subject: item.subject,
        category: item.category,
        status: item.status,
        priority: item.priority,
        createdAt: item.created_at,
        updatedAt: item.updated_at
      })),
      page,
      pageSize,
      total: result.total
    };
  }

  static async createBuyerTicket(buyerUserId, payload) {
    return ticketModel.createTicket({
      id: uuidv4(),
      buyerUserId,
      subject: payload.subject,
      category: payload.category,
      description: payload.description
    });
  }

  static async getBuyerTicket(ticketId, buyerUserId) {
    const ticket = await ticketModel.getTicketByIdForBuyer(ticketId, buyerUserId);
    if (!ticket) {
      throw new ApiError(404, "NOT_FOUND", "Ticket not found", {});
    }

    return {
      id: ticket.id,
      subject: ticket.subject,
      category: ticket.category,
      description: ticket.description,
      status: ticket.status,
      priority: ticket.priority,
      resolutionNote: ticket.resolution_note,
      createdAt: ticket.created_at,
      updatedAt: ticket.updated_at
    };
  }

  static async listAdminTickets(status, page, pageSize) {
    const result = await ticketModel.listTicketsForAdmin(status, page, pageSize);
    return {
      items: result.items.map((item) => ({
        id: item.id,
        buyerName: item.buyer_name,
        subject: item.subject,
        category: item.category,
        status: item.status,
        priority: item.priority,
        createdAt: item.created_at
      })),
      page,
      pageSize,
      total: result.total
    };
  }

  static async updateAdminTicket(ticketId, payload) {
    const ticket = await ticketModel.updateTicket(ticketId, payload);
    if (!ticket) {
      throw new ApiError(404, "NOT_FOUND", "Ticket not found", {});
    }
    return ticket;
  }
}

module.exports = TicketService;
