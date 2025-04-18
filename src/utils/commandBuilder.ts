import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  AutocompleteInteraction,
} from "discord.js";

export interface Command {
  data: SlashCommandBuilder;
  execute: (interaction: ChatInputCommandInteraction) => Promise<void>;
  autocomplete?: (interaction: AutocompleteInteraction) => Promise<void>;
}

/**
 * Crée une commande avec un builder, une fonction d'exécution et optionnellement une fonction d'autocomplétion
 */
function buildCommand(
  builder: SlashCommandBuilder | (() => SlashCommandBuilder),
  executeFn: (interaction: ChatInputCommandInteraction) => Promise<void>,
  autocompleteFn?: (interaction: AutocompleteInteraction) => Promise<void>
): Command {
  const command: Command = {
    data: typeof builder === "function" ? builder() : builder,
    execute: executeFn,
  };

  if (autocompleteFn) {
    command.autocomplete = autocompleteFn;
  }

  return command;
}

export default buildCommand;
