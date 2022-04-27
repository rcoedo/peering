import EventEmitter from "events";
import { Server } from "socket.io";
import { io } from "socket.io-client";
import Client from "./client";

jest.mock("socket.io", () => {
  return {
    Server: jest.fn().mockImplementation(() => new EventEmitter()),
  };
});

jest.mock("socket.io-client", () => {
  return {
    io: jest.fn(() => new EventEmitter()),
  };
});

jest.useFakeTimers();
describe("client", () => {
  let client: Client;

  beforeEach(() => {
    client = new Client(3000, "localhost:3001");
  });

  describe("#constructor", () => {
    test("properly initializes the server with the specified port", () => {
      expect(Server).toHaveBeenCalled();
      expect(Server).toHaveBeenCalledWith(3000);
    });

    test("properly initializes the client with the specified uri", () => {
      expect(io).toHaveBeenCalled();
      expect(io).toHaveBeenCalledWith("ws://localhost:3001");
    });
  });

  describe("#getBalance", () => {
    test("returns the current balance", () => {
      expect(client.getBalance()).toEqual(0);
    });
  });

  describe("#pay", () => {
    test("emits the `pay` event through the socket and substracts from the current balance", () => {
      const spy = jest.spyOn(client.socket, "emit");

      client.pay(30);

      expect(spy).toHaveBeenCalledWith("pay", 30);
      expect(client.getBalance()).toEqual(-30);
    });

    test("throws when amount is NaN", () => {
      expect(() => client.pay(NaN)).toThrowErrorMatchingInlineSnapshot(
        `"The amount must be a number"`
      );
    });

    test("throws when amount is <= 0", () => {
      expect(() => client.pay(0)).toThrowErrorMatchingInlineSnapshot(
        `"The amount must be > 0"`
      );
    });
  });

  describe("#emit", () => {
    let spy: jest.SpyInstance;

    beforeEach(() => {
      spy = jest.spyOn(client, "emit");
    });

    test("emits `ready` when the client connects", () => {
      client.socket.emit("connect");

      expect(spy).toHaveBeenCalledWith("ready");
    });

    test("emits `disconnect` when the client disconnects", () => {
      client.socket.emit("disconnect");

      expect(spy).toHaveBeenCalledWith("disconnect");
    });

    test("emits `receive` when a connection emits the `pay` event", () => {
      const newClient = new EventEmitter();

      client.server.emit("connection", newClient);
      newClient.emit("pay", 30);

      expect(spy).toHaveBeenCalledWith("receive", 30);
    });
  });
});
