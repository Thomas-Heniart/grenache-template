const mongoose = require("mongoose");
const { performance } = require("perf_hooks");

// Order Schema
const OrderSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["BUY", "SELL"],
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
    },
    symbol: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["PENDING", "PARTIALLY_FILLED", "FILLED", "CANCELLED"],
      default: "PENDING",
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
    },
  },
  {
    indexes: [{ symbol: 1, type: 1, price: 1, timestamp: 1 }],
  },
);

// Trades Schema
const TradeSchema = new mongoose.Schema({
  buyOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
  },
  sellOrderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Order",
  },
  symbol: String,
  price: Number,
  quantity: Number,
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

class MongoOrderMatchingEngine {
  constructor() {
    this.Order = mongoose.model("Order", OrderSchema);
    this.Trade = mongoose.model("Trade", TradeSchema);
  }

  // Connect to MongoDB
  async connect(mongoURI) {
    try {
      await mongoose.connect(mongoURI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
      console.log("MongoDB connected successfully");
    } catch (error) {
      console.error("MongoDB connection error:", error);
      throw error;
    }
  }

  // Place a new order
  async placeOrder(orderData) {
    const order = new this.Order(orderData);
    await order.save();
    const matchResults = await this.matchOrders(order.symbol);
    return { order, matchResults };
  }

  // Advanced Order Matching Algorithm
  async matchOrders(symbol) {
    const startTime = performance.now();

    // Fetch pending buy and sell orders for the symbol
    const buyOrders = await this.Order.find({
      symbol,
      type: "BUY",
      status: { $in: ["PENDING", "PARTIALLY_FILLED"] },
    }).sort({ price: -1, timestamp: 1 });

    const sellOrders = await this.Order.find({
      symbol,
      type: "SELL",
      status: { $in: ["PENDING", "PARTIALLY_FILLED"] },
    }).sort({ price: 1, timestamp: 1 });

    console.log("orders", { buyOrders, sellOrders });

    const trades = [];

    for (let buyOrder of buyOrders) {
      console.log("buyOrder", buyOrder);
      for (let sellOrder of sellOrders) {
        // Match conditions
        if (
          buyOrder.price >= sellOrder.price &&
          buyOrder.status !== "FILLED" &&
          sellOrder.status !== "FILLED"
        ) {
          const matchQuantity = Math.min(buyOrder.quantity, sellOrder.quantity);

          // Create trade record
          const trade = new this.Trade({
            buyOrderId: buyOrder._id,
            sellOrderId: sellOrder._id,
            symbol,
            price: sellOrder.price,
            quantity: matchQuantity,
          });
          trades.push(trade);

          // Update order quantities and statuses
          buyOrder.quantity -= matchQuantity;
          sellOrder.quantity -= matchQuantity;

          // Update order status
          buyOrder.status =
            buyOrder.quantity === 0 ? "FILLED" : "PARTIALLY_FILLED";
          sellOrder.status =
            sellOrder.quantity === 0 ? "FILLED" : "PARTIALLY_FILLED";

          // Save updated orders and trade
          await buyOrder.save();
          console.log("buyOrder after", buyOrder);
          await sellOrder.save();
          await trade.save();

          // If buy order is fully filled, move to next buy order
          if (buyOrder.status === "FILLED") break;
        }
      }
    }

    const endTime = performance.now();

    return {
      trades,
      matchingTime: endTime - startTime,
      totalTradesMatched: trades.length,
    };
  }

  // Advanced Order Cancellation
  async cancelOrder(orderId) {
    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      const order = await this.Order.findById(orderId);

      if (!order) {
        throw new Error("Order not found");
      }

      order.status = "CANCELLED";
      await order.save({ session });

      await session.commitTransaction();
      return order;
    } catch (error) {
      await session.abortTransaction();
      throw error;
    } finally {
      session.endSession();
    }
  }

  // Get Order Book
  async getOrderBook(symbol) {
    const buyOrders = await this.Order.aggregate([
      {
        $match: {
          symbol,
          type: "BUY",
          status: { $in: ["PENDING", "PARTIALLY_FILLED"] },
        },
      },
      {
        $group: {
          _id: "$price",
          quantity: { $sum: "$quantity" },
          orders: { $push: "$$ROOT" },
        },
      },
      { $sort: { _id: -1 } },
    ]);

    const sellOrders = await this.Order.aggregate([
      {
        $match: {
          symbol,
          type: "SELL",
          status: { $in: ["PENDING", "PARTIALLY_FILLED"] },
        },
      },
      {
        $group: {
          _id: "$price",
          quantity: { $sum: "$quantity" },
          orders: { $push: "$$ROOT" },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    return {
      buyOrders,
      sellOrders,
    };
  }

  // Performance Reporting
  async getMatchingPerformanceMetrics(symbol) {
    const trades = await this.Trade.aggregate([
      { $match: { symbol } },
      {
        $group: {
          _id: null,
          totalTrades: { $sum: 1 },
          totalVolume: { $sum: "$quantity" },
          avgTradePrice: { $avg: "$price" },
        },
      },
    ]);

    return (
      trades[0] || {
        totalTrades: 0,
        totalVolume: 0,
        avgTradePrice: 0,
      }
    );
  }
}

module.exports = MongoOrderMatchingEngine;
