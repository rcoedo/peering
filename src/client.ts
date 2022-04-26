import EventEmitter from "events";
import { Server } from "socket.io";
import { io, Socket } from "socket.io-client";

class Client extends EventEmitter {
  readonly port: number;
  readonly uri: string;

  private balance: number;
  private socket: Socket;
  private readonly server: Server;

  constructor(port: number, uri: string) {
    super();
    this.port = port;
    this.uri = uri;

    this.balance = 0;
    this.server = new Server(port);
    this.socket = io(`ws://${uri}`);

    this.socket.on("connect", () => {
      this.emit("ready");
    });

    this.socket.on("disconnect", () => {
      this.emit("disconnect");
    });

    this.server.on("connection", (socket) => {
      socket.on("pay", (amount) => {
        if (isNaN(amount)) {
          throw new Error("The amount must be a number");
        }

        if (amount <= 0) {
          throw new Error("The amount must be > 0");
        }

        this.emit("pay", amount);
        this.balance = this.balance + amount;
      });
    });
  }

  getBalance() {
    return this.balance;
  }

  pay(amount: number) {
    if (isNaN(amount)) {
      throw new Error("The amount must be a number");
    }

    if (amount <= 0) {
      throw new Error("The amount must be > 0");
    }

    if (this.socket === null) {
      throw new Error("Unable to connect");
    }

    this.socket.emit("pay", amount);
    this.balance = this.balance - amount;
  }
}

export default Client;
