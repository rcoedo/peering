import inquirer from "inquirer";
import EventEmitter from "events";

class Repl extends EventEmitter {
  private exit: boolean;
  private messages: string[];

  constructor() {
    super();
    this.exit = false;
    this.messages = [];
  }

  private async readInput(): Promise<string> {
    const answer = await inquirer.prompt([
      { type: "input", name: "command", message: "> " },
    ]);

    return answer.command;
  }

  addMessage(message: string) {
    this.messages.push(message);
  }

  flushMessages() {
    for (const message of this.messages.reverse()) {
      process.stdout.write(`${message}\n`);
    }
    this.messages = [];
  }

  async start() {
    while (!this.exit) {
      try {
        const [command, ...args] = (await this.readInput()).split(" ");

        this.emit(command, ...args);
      } catch (error) {
        console.error(error);
        process.exit(1);
      }
      this.flushMessages();
    }
  }
}

export default Repl;
