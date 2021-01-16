# Qilan

## Idea

The concept is heavily inspired by Mockito and uses Proxy to track calls.

```js
class Dog {
	bark(loud) {}
	generateBark(type) {}
	get name() { return null; }
	get surname() { return null; }
}

const dog = mock(Dog);

when(dog.name).return('Doggy');
when(dog.surname).do(() => 'Doggo #' + Math.ceil(Math.random() * 100));

when(dog.bark(false)).do(() => console.log('..silent bark..'));
when(dog.bark(true)).do(() => console.log('Loud bark! Woof-woof!'));

when(dog.generateBark()).do(() => 'woof!');
when(dog.generateBark(any(String))).do(type => `${type} bark!`);

// ---

console.log('Full name:', dog.name, dog.surname); // Doggy Doggo #12
console.log('Regular bark:', dog.generateBark()); // woof!
console.log('Robotic bark:', dog.generateBark('robotic')); // robotic bark!

dog.bark(false);
dog.bark(true);

// ---

expect.called(dog.name);
expect.calledOnce(dog.generateBark('robotic'));
expect.calledTimes(2, dog.bark(any()));
expect.notCalled(dog.bark(any(Number)));

expect.notCalled(dog.bark(any(Boolean))); // fails
expect.called(dog.generateBark('realistic')); // fails
```
