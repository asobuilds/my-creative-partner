/**
 * Detects if a prompt names a concrete, real-world subject we can look up.
 * Uses a broad list of common nouns a child might ask for.
 */

const CONCRETE = [
  // Animals
  'lion','tiger','elephant','giraffe','zebra','cheetah','leopard','rhino','hippo','crocodile',
  'monkey','gorilla','chimpanzee','baboon','snake','cobra','python','tortoise','turtle','frog',
  'parrot','eagle','owl','peacock','ostrich','flamingo','penguin','shark','whale','dolphin','fish',
  'cat','kitten','dog','puppy','horse','pony','cow','goat','sheep','pig','chicken','rooster','duck',
  'rabbit','mouse','rat','squirrel','fox','wolf','bear','panda','koala','kangaroo','camel','deer',
  'antelope','buffalo','hyena','meerkat','porcupine','hedgehog','badger','otter','seal','bat',
  // Human / character
  'man','woman','child','baby','boy','girl','family','soldier','king','queen','prince','princess',
  'warrior','dancer','singer','farmer','doctor','teacher','pilot','pirate','knight','wizard',
  // Objects
  'car','truck','bus','bike','bicycle','motorcycle','boat','ship','airplane','plane','rocket',
  'helicopter','train','tractor','tank','robot','phone','computer','camera','television','radio',
  'clock','watch','chair','table','bed','door','window','house','castle','tower','bridge','lamp',
  'book','pencil','pen','brush','cup','mug','bottle','plate','bowl','spoon','fork','knife',
  'guitar','piano','drum','violin','trumpet','harp',
  // Nature / structure
  'tree','flower','rose','sunflower','cactus','mushroom','leaf','palm','bamboo','grass',
  'mountain','volcano','waterfall','river','lake','ocean','beach','island','cave','forest',
  'apple','banana','orange','mango','pineapple','coconut','grapes','watermelon','strawberry',
  // Fantasy
  'dragon','unicorn','dinosaur','t-rex','fairy','mermaid','ghost','zombie','alien','monster',
];

export function detectConcreteSubject(prompt) {
  const lower = String(prompt || '').toLowerCase();
  // Direct hit
  for (const word of CONCRETE) {
    if (lower.includes(word)) return word;
  }
  return null;
}

/**
 * Convert a subject word to a PolyHaven-style search query.
 */
export function subjectToQuery(subject) {
  const map = {
    't-rex': 'trex',
    'plane': 'airplane',
    'bike': 'bicycle',
    'puppy': 'dog',
    'kitten': 'cat',
  };
  return map[subject] || subject;
}
