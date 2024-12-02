const { PeerRPCServer, PeerRPCClient } = require("grenache-nodejs-http");
const Link = require("grenache-nodejs-link");
const mongoose = require("mongoose");
const MongoOrderMatchingEngine = require("./mongodb-order-matching");
const {
  announceService,
} = require("../src/shared-kernel/adapters/primaries/grenache/announce");

// Microservices Configuration
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://localhost:27017/orderbook";
const GRAPE_URI = process.env.GRAPE_URI || "http://127.0.0.1:30001";

console.log("MONGO_URI:", MONGO_URI);
console.log("GRAPE_URI:", GRAPE_URI);

// Order Service
class OrderService {
  constructor() {
    this.matchingEngine = new MongoOrderMatchingEngine();
    this.link = new Link({ grape: GRAPE_URI });
    this.server = null;
  }

  async initialize() {
    // Connect to MongoDB
    await this.matchingEngine.connect(MONGO_URI);

    // Initialize Grenache Link
    this.link.start();

    // Create RPC Server
    this.server = new PeerRPCServer(this.link, {
      timeout: 300000,
    });
    this.server.init();

    // Create service transport
    const port = this.getRandomPort();
    const service = this.server.transport("server");
    service.listen(port);

    // Set up request handlers
    service.on("request", async (rid, key, payload, handler) => {
      try {
        switch (payload.type) {
          case "PLACE_ORDER": {
            const placedOrder = await this.placeOrder(payload.order);
            handler.reply(null, placedOrder);
            break;
          }
          case "CANCEL_ORDER": {
            const cancelledOrder = await this.cancelOrder(payload.orderId);
            handler.reply(null, cancelledOrder);
            break;
          }
          default:
            handler.reply(new Error("Invalid request type"));
        }
      } catch (error) {
        handler.reply(error);
      }
    });

    await announceService("order_service", this.link, service.port);
  }

  async placeOrder(orderData) {
    try {
      const result = await this.matchingEngine.placeOrder(orderData);
      return result;
    } catch (error) {
      console.error("Order placement error:", error);
      throw error;
    }
  }

  async cancelOrder(orderId) {
    try {
      const cancelledOrder = await this.matchingEngine.cancelOrder(orderId);
      return cancelledOrder;
    } catch (error) {
      console.error("Order cancellation error:", error);
      throw error;
    }
  }

  getRandomPort() {
    return 1024 + Math.floor(Math.random() * 40000);
  }
}

// Market Data Service
class MarketDataService {
  constructor() {
    this.matchingEngine = new MongoOrderMatchingEngine();
    this.link = new Link({ grape: GRAPE_URI });
    this.server = null;
  }

  async initialize() {
    // Connect to MongoDB
    await this.matchingEngine.connect(MONGO_URI);

    // Initialize Grenache Link
    this.link.start();

    // Create RPC Server
    this.server = new PeerRPCServer(this.link, {
      timeout: 300000,
    });
    this.server.init();

    // Create service transport
    const port = this.getRandomPort();
    const service = this.server.transport("server");
    service.listen(port);

    // Set up request handlers
    service.on("request", async (rid, key, payload, handler) => {
      try {
        switch (payload.type) {
          case "GET_ORDER_BOOK": {
            const orderBook = await this.getOrderBook(payload.symbol);
            handler.reply(null, orderBook);
            break;
          }
          case "GET_PERFORMANCE_METRICS": {
            const performanceMetrics = await this.getPerformanceMetrics(
              payload.symbol,
            );
            handler.reply(null, performanceMetrics);
            break;
          }
          default:
            handler.reply(new Error("Invalid request type"));
        }
      } catch (error) {
        handler.reply(error);
      }
    });

    await announceService("market_data_service", this.link, service.port);
  }

  async getOrderBook(symbol) {
    try {
      return await this.matchingEngine.getOrderBook(symbol);
    } catch (error) {
      console.error("Order book retrieval error:", error);
      throw error;
    }
  }

  async getPerformanceMetrics(symbol) {
    try {
      return await this.matchingEngine.getMatchingPerformanceMetrics(symbol);
    } catch (error) {
      console.error("Performance metrics error:", error);
      throw error;
    }
  }

  getRandomPort() {
    return 1024 + Math.floor(Math.random() * 40000);
  }
}

// Client for Interacting with Microservices
class OrderMatchingClient {
  constructor() {
    this.link = new Link({ grape: GRAPE_URI });
    this.link.start();
    this.client = new PeerRPCClient(this.link, {});
    this.client.init();
  }

  async placeOrder(orderData) {
    return new Promise((resolve, reject) => {
      this.client.request(
        "order_service",
        { type: "PLACE_ORDER", order: orderData },
        { timeout: 10000 },
        (err, data) => {
          if (err) reject(err);
          else resolve(data);
        },
      );
    });
  }

  async cancelOrder(orderId) {
    return new Promise((resolve, reject) => {
      this.client.request(
        "order_service",
        { type: "CANCEL_ORDER", orderId },
        { timeout: 10000 },
        (err, data) => {
          if (err) reject(err);
          else resolve(data);
        },
      );
    });
  }

  async getOrderBook(symbol) {
    return new Promise((resolve, reject) => {
      this.client.request(
        "market_data_service",
        { type: "GET_ORDER_BOOK", symbol },
        { timeout: 10000 },
        (err, data) => {
          if (err) reject(err);
          else resolve(data);
        },
      );
    });
  }

  async getPerformanceMetrics(symbol) {
    return new Promise((resolve, reject) => {
      this.client.request(
        "market_data_service",
        { type: "GET_PERFORMANCE_METRICS", symbol },
        { timeout: 10000 },
        (err, data) => {
          if (err) reject(err);
          else resolve(data);
        },
      );
    });
  }
}

// Main Application Setup
async function startServices() {
  try {
    // Initialize Order Service
    const orderService = new OrderService();
    await orderService.initialize();
    console.log("Order Service initialized");

    // Initialize Market Data Service
    const marketDataService = new MarketDataService();
    await marketDataService.initialize();
    console.log("Market Data Service initialized");

    // Example Client Usage
    const client = new OrderMatchingClient();

    // Simulate order placement and retrieval
    const userId = 1;
    const order = await client.placeOrder({
      type: "BUY",
      symbol: "AAPL",
      price: 150.0,
      quantity: 100,
      userId: new mongoose.Types.ObjectId(userId),
    });

    console.log("Placed Order:", order);

    // Get order book
    console.log("Order Book:", await client.getOrderBook("AAPL"));

    const sellOrder = await client.placeOrder({
      type: "SELL",
      symbol: "AAPL",
      price: 150.0,
      quantity: 100,
      userId: new mongoose.Types.ObjectId(userId),
    });

    console.log("Placed Order:", sellOrder);

    console.log("Order Book:", await client.getOrderBook("AAPL"));
  } catch (error) {
    console.error("Service initialization error:", error);
  }
}

// Export services and client
module.exports = {
  OrderService,
  MarketDataService,
  OrderMatchingClient,
  startServices,
};

// Start services if run directly
if (require.main === module) {
  startServices();
}
