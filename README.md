# decorate-all

A `typescript` decorator that allows you to apply another decorator to ALL methods of a class.

## Why
A need for this decorator arose from having to decorate all methods (route handlers) of a [NestJS](https://nestjs.com/) controller class with the same parameter decorator. In my project, most routes included a "tennatId" path parameter and repeating the same decorator on all routes was tedious and error prone.

That's how `decorate-all` was born.

## Usage
```ts
import { DecorateAll } from 'decorate-all'

const Uppercase =  (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    const original = descriptor.value;
    descriptor.value = function (name: string) {
        return original.call(this, name).toUpperCase();
    }
}

// apply the Uppercase decorator to all methods, except 'galaxy'
@DecorateAll(Uppercase, { exclude: ['galaxy'] })
class Hello {
    world() {
        return 'world';
    }
    galaxy() {
        return 'galaxy';
    }
    universe() {
        return 'universe';
    }
}

const hello = new Hello();
console.log(hello.world);    // logs "WORLD"
console.log(hello.galaxy);   // logs "galaxy"
console.log(hello.universe); // logs "UNIVERSE"
```

## Options
* `exclude: string[]`: array of method names that won't be decorated
* `deep: boolean`: by default, only own methods are decorated, id `deep` is true, the decorator will be also applied to inherited methods of any extended class