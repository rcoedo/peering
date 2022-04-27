import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import Client from "./client";
import Repl from "./repl";
import { isNumber, isString } from "./utils";

const exit = () => {
  process.stdout.write(`Goodbye.\n`);
  process.exit(0);
};

(async () => {
  const argv = await yargs(hideBin(process.argv))
    .usage("Usage: $0 --port [number] --uri [string]")
    .example(
      "$0 --uri localhost:3003 --port 3000",
      "starts the client at port 3000 and connects to uri localhost:3003"
    )
    .check((args) => isNumber(args.port) && isString(args.uri))
    .parse();

  const client = new Client(argv.port as number, argv.uri as string);

  const repl = new Repl();

  repl.on("exit", exit);

  repl.on("pay", (amount: string) => {
    try {
      client.pay(Number(amount));
      process.stdout.write(`Sent ${amount} to your peer.\n`);
    } catch (error) {
      if (error instanceof Error) {
        process.stderr.write(`${error.message}\n`);
      }
    }
  });

  repl.on("balance", () => {
    process.stdout.write(`Your balance is ${client.getBalance()}\n`);
  });

  client.on("ready", () => {
    process.stdout.write("Welcome to your peering relationship!\n");
    repl.start();
  });

  client.on("receive", (amount: number) => {
    repl.addMessage(`Received ${amount} from your peer.`);
  });

  client.on("disconnect", exit);

  process.on("SIGINT", () => {
    process.exit(0);
  });
})();
