# decorate-all

A `typescript` decorator that allows you to apply another decorator to *all* methods of a class.

```
npm i decorate-all
```

## Why
A need for this decorator arose from having to decorate all methods (route handlers) of a [NestJS](https://nestjs.com/) controller class with the same parameter decorator. In the project, most routes included a "tenantId" path parameter which needed to be specified using a route decorator. Repeating it over each method was tedious and error prone.

Thus, `decorate-all` was born.

## Usage
```ts
import { DecorateAll } from 'decorate-all'

const Uppercase = (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const original = descriptor.value;
    descriptor.value = function (name: string) {
        return original.call(this, name).toUpperCase();
    }
}

// instead of decorating each method on its own...
class Hello1 {
    @Uppercase
    world() { return 'world' }

    @Uppercase
    galaxy() { return 'galaxy' }
}

// ...use the DecorateAll decorator
@DecorateAll(Uppercase)
class Hello2 {
    world() { return 'world' }
    galaxy() { return 'galaxy' }
}


const hello1 = new Hello1();
console.log(hello1.world);    // logs "WORLD"
console.log(hello1.galaxy);   // logs "GALAXY"

const hello2 = new Hello2();
console.log(hello2.world);    // logs "WORLD"
console.log(hello2.galaxy);   // logs "GALAXY"

```

## Options
The second parameter of the `DecorateAll` decorator takes an options object with the following options:

* `exclude: string[]`  
array of method names that won't be decorated
```ts

// apply the Uppercase decorator to all methods, except 'galaxy'
@DecorateAll(Uppercase, { exclude: ['galaxy'] })
class Hello {
    world() { return 'world' }
    galaxy() { return 'galaxy' }
    universe() { return 'universe' }
}

const hello = new Hello();
console.log(hello.world);    // logs "WORLD"
console.log(hello.galaxy);   // logs "galaxy"
console.log(hello.universe); // logs "UNIVERSE"
```
* `deep: boolean`  
By default, only the class' own methods are decorated. If you pass `deep: true`, the decorator will be also applied to inherited methods of any extended class. (It can also be combined with the exclude option).



```ts
class Plain {
    hi() { return 'hi'}
    hello() { return 'hello'}
}

@DecorateAll(Uppercase, { deep: true })
class Decorated extends Plain {}

const plain = Plain();
console.log(plain.hi()) // logs "hi"
console.log(plain.hello()) // logs "hello"

const decorated = Ddecorated();
console.log(decorated.hi()) // logs "HI"
console.log(decorated.hello()) // logs "HELLO"
```