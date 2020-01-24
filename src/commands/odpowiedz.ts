import { Command } from '../types';
import { randomizeArray } from '../utils';
const ANSWERS = [
  'Mój wywiad donosi: NIE',
  'Wygląda dobrze',
  'Kto wie?',
  'Zapomnij o tym',
  'Tak - w swoim czasie',
  'Prawie jak tak',
  'Nie teraz',
  'YES, YES, YES',
  'To musi poczekać',
  'Mam pewne wątpliwości',
  'Możesz na to liczyć',
  'Zbyt wcześnie aby powiedzieć',
  'Daj spokój',
  'Absolutnie',
  'Chyba żatrujesz?',
  'Na pewno nie',
  'Zrób to',
  'Prawdopodobnie',
  'Dla mnie rewelacja',
  'Na pewno tak',
];

const odpowiedz: Command = {
  name: 'odpowiedz',
  description: 'Pomoże ci wybrać odpowiedź',
  args: false,
  execute(msg) {
    // Really randomize the answer
    const randomAnswer = randomizeArray(randomizeArray(ANSWERS))[0];
    return msg.channel.send(randomAnswer);
  },
};

export default odpowiedz;
