import { Collection } from "discord.js";
import { Command } from "./commandBuilder.js";

import { help } from "../commands/help/help.js";
import { profil } from "../commands/profil/profil.js";
import { questionnaire } from "../commands/ticket/questionnaire.js";
import { badge } from "../commands/badge/badge.js";
import {
  addbadge,
  autocomplete as addBadgeAutocomplete,
} from "../commands/badge/add-badge.js";
import { deletebadge } from "../commands/badge/delete-badge.js";
import { assignbadge } from "../commands/badge/assign-badge.js";
import { unassignbadge } from "../commands/badge/unassign-badge.js";
import { anim } from "../commands/anim/anim.js";
import { addanim } from "../commands/anim/add-anim.js";
import { deleteanim } from "../commands/anim/delete-anim.js";
import { semaine } from "../commands/anim/semaine.js";
import { createcategory } from "../commands/badge/create-categorie.js";
import { deletecategory } from "../commands/badge/delete-categorie.js";
import { annonce } from "../commands/annonce/annonce.js";
import { addchallenge } from "../commands/challenge/add-challenge.js";
import { deletechallenge } from "../commands/challenge/delete-challenge.js";
import { challenge } from "../commands/challenge/challenge.js";

const commandModules: { command: Command; autocomplete?: Function }[] = [
  { command: help },
  { command: profil },
  { command: questionnaire },
  { command: badge },
  { command: addbadge, autocomplete: addBadgeAutocomplete },
  { command: deletebadge },
  { command: assignbadge },
  { command: unassignbadge },
  { command: anim },
  { command: addanim },
  { command: deleteanim },
  { command: semaine },
  { command: createcategory },
  { command: deletecategory },
  { command: annonce },
  { command: addchallenge },
  { command: deletechallenge },
  { command: challenge },
];

export function loadCommands(): Collection<string, Command> {
  const commands = new Collection<string, Command>();

  for (const { command, autocomplete } of commandModules) {
    if (autocomplete) {
      // @ts-ignore → on attache dynamiquement autocomplete à l’objet Command
      command.autocomplete = autocomplete;
    }

    commands.set(command.data.name, command);
  }

  return commands;
}
