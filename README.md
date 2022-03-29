# decorate-all

A `typescript` decorator that allows you to apply another decorator to _all_ methods of a class.

```
npm i decorate-all
```

> **Note:** since version `1.1.0`, this package uses the [`reflect-metadata`](https://www.npmjs.com/package/reflect-metadata) package as a _peer dependency_, so you need to have it installed.

## Why

A need for this decorator arose from having to decorate all methods (route handlers) of a controller class with the same parameter decorator to apply the framework-specific metadata. In the project, which is a multi-tenant application, most routes contain the same `tenantId` path parameter and repeating it over each method turned out to be tedious and error prone.

This decorator is, however, not limited to adding simple metadata decorators. Another use case can be applying a logging decorator (that actually alters the method's implementation) on all methods of a class for debugging or for tracing purposes.

## Usage

```ts
import { DecorateAll } from 'decorate-all';

const Uppercase = (
    target: any,
    propertyKey: string,
    descriptor: PropertyDescriptor,
) => {
    const original = descriptor.value;
    descriptor.value = function () {
        return original.call(this).toUpperCase();
    };
};

// instead of decorating each method on its own...
class Hello1 {
    @Uppercase
    world() {
        return 'world';
    }

    @Uppercase
    galaxy() {
        return 'galaxy';
    }
}

// ...use the DecorateAll decorator
@DecorateAll(Uppercase)
class Hello2 {
    world() {
        return 'world';
    }
    galaxy() {
        return 'galaxy';
    }
}

const hello1 = new Hello1();
console.log(hello1.world()); // logs "WORLD"
console.log(hello1.galaxy()); // logs "GALAXY"

const hello2 = new Hello2();
console.log(hello2.world()); // logs "WORLD"
console.log(hello2.galaxy()); // logs "GALAXY"
```

## Options

The second parameter of the `DecorateAll` decorator takes an options object with the following options:

-   `exclude: string[]`  
    array of method names that won't be decorated

```ts
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
console.log(hello.world()); // logs "WORLD"
console.log(hello.galaxy()); // logs "galaxy"
console.log(hello.universe()); // logs "UNIVERSE"
```

-   `excludePrefix: string`  
    methods with the given prefix won't be decorated

```ts
// apply the Uppercase decorator to all methods, except 'galaxy'
@DecorateAll(Uppercase, { excludePrefix: '_' })
class Hello {
    world() {
        return 'world';
    }
    _galaxy() {
        return 'galaxy';
    }
    universe() {
        return 'universe';
    }
}

const hello = new Hello();
console.log(hello.world()); // logs "WORLD"
console.log(hello._galaxy()); // logs "galaxy"
console.log(hello.universe()); // logs "UNIVERSE"
```

-   `deep: boolean`  
    By default, only the class' own methods are decorated. If you pass `deep: true`, the decorator will be also applied to inherited methods of any extended class. (It can also be combined with the exclude options).

```ts
class Plain {
    hi() {
        return 'hi';
    }
    hello() {
        return 'hello';
    }
}

@DecorateAll(Uppercase, { deep: true })
class Decorated extends Plain {}

const plain = new Plain();
console.log(plain.hi()); // logs "hi"
console.log(plain.hello()); // logs "hello"

const decorated = new Decorated();
console.log(decorated.hi()); // logs "HI"
console.log(decorated.hello()); // logs "HELLO"
```
