class CLIRegistry {
  constructor() {
    this.registry = [];
  }

  push(command) {
    this.registry.push(command);
  }

  killAll() {
    this.registry.forEach(command => command.kill());
    this.registry = [];
  }
}

exports.CLIRegistry = CLIRegistry;
