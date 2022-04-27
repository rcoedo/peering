import EventEmitter from "events";
import { Server } from "socket.io";
import { io, Socket } from "socket.io-client";

class Client extends EventEmitter {
  readonly port: number;
  readonly uri: string;
  readonly socket: Socket;
  readonly server: Server;

  private balance: number;

  private static validateAmount(amount: number) {
    if (isNaN(amount)) {
      throw new Error("The amount must be a number");
    }

    if (amount <= 0) {
      throw new Error("The amount must be > 0");
    }
    return amount;
  }

  constructor(port: number, uri: string) {
    super();
    this.port = port;
    this.uri = uri;
    this.balance = 0;
    this.server = new Server(this.port);
    this.socket = io(`ws://${this.uri}`);

    this.socket.on("connect", () => {
      this.emit("ready");
    });

    this.socket.on("disconnect", () => {
      this.emit("disconnect");
    });

    this.server.on("connection", (socket) => {
      socket.on("pay", (amount) => {
        Client.validateAmount(amount);

        this.emit("receive", amount);
        this.balance = this.balance + amount;
      });
    });
  }

  getBalance() {
    return this.balance;
  }

  pay(amount: number) {
    Client.validateAmount(amount);

    this.socket.emit("pay", amount);
    this.balance = this.balance - amount;
  }
}

export default Client;
