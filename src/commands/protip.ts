import { Command } from '../types';

const protip: Command = {
  name: 'protip',
  description: 'Wysyła protip na wskazany kanał.',
  args: 'optional',
  cooldown: 10,
  execute(msg) {
    const channel = msg.mentions.channels.first();
    const user = msg.mentions.users.first();

    if (!channel && !user) {
      return msg.channel.send(
        'Wyślij komuś protipa po cichu z innego kanału :eyes: np. `!protip @uzytkownik #kanal-tekstowy`',
      );
    }

    if (!channel) {
      return msg.channel.send(
        'Nieprawidłowa wzmianka kanału, użyj `#kanal-tekstowy` :person_tipping_hand:',
      );
    }

    if (!user) {
      return msg.channel.send(
        'Nieprawidłowa wzmianka użytkownika, użyj `@uzytkownik` :person_tipping_hand:',
      );
    }

    return channel.send(
      `${user.toString()}, protip: napisz \`@nazwa ++\`, żeby komuś podziękować! Możesz podziękować kilku osobom w jednej wiadomości!`,
    );
  },
};

export default protip;
