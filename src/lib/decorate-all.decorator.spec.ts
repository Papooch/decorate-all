import 'reflect-metadata';
import { DecorateAll } from './decorate-all.decorator';

const AppendString = (mark: string) => {
    return (
        target: any,
        propertyKey: string,
        descriptor: PropertyDescriptor,
    ) => {
        const original = descriptor.value;
        descriptor.value = function (name: string) {
            return original.call(this, name + mark);
        };
    };
};

@Reflect.metadata('name', 'Hello')
class Hello {
    constructor(public message: string) {}

    @Reflect.metadata('name', 'Hello.a')
    a(name: string) {
        return this.message + name;
    }

    b(name: string) {
        return this.message + name;
    }

    c(name: string) {
        return this.message + name;
    }
}

@DecorateAll(AppendString('!'))
class DecoratedHello {
    constructor(public message: string) {}

    @Reflect.metadata('name', 'DecoratedHello.a')
    a(name: string) {
        return this.message + name;
    }

    b(name: string) {
        return this.message + name;
    }

    c(name: string) {
        return this.message + name;
    }
}

@DecorateAll(AppendString('!'))
class ExtendedHello extends Hello {
    c(name: string) {
        return this.message + name;
    }
}

@DecorateAll(AppendString('!'), { deep: true })
class DeepExtendedHello extends Hello {
    c(name: string) {
        return this.message + name;
    }
}

@DecorateAll(AppendString('?'), { deep: true, exclude: ['b'] })
class DeepExtendedExcludedHello extends Hello {}

@DecorateAll(AppendString('?'), { exclude: ['b'] })
class ExcludedHello {
    constructor(public message: string) {}

    a(name: string) {
        return this.message + name;
    }

    b(name: string) {
        return this.message + name;
    }

    c(name: string) {
        return this.message + name;
    }
}

@DecorateAll(AppendString('?'), { deep: true, exclude: ['b'] })
class ExtendedDecoratedHello extends ExtendedHello {}

@DecorateAll(AppendString('?'), { excludePrefix: '_' })
class ExcludePrefixHello {
    constructor(public message: string) {}

    _a(name: string) {
        return this.message + name;
    }

    b(name: string) {
        return this.message + name;
    }
}

@DecorateAll(AppendString('!'), {
    excludePrefix: 'PRIVATE',
    deep: true,
    exclude: ['_a'],
})
class ExtendedExcludePrefixHello extends ExcludePrefixHello {
    PRIVATE_c(name: string) {
        return this.message + name;
    }
}

describe('DecorateAll', () => {
    it('decorates all methods', () => {
        const hello = new DecoratedHello('test');
        expect(hello.a('a')).toEqual('testa!');
        expect(hello.b('b')).toEqual('testb!');
        expect(hello.b('c')).toEqual('testc!');
    });

    it('does not decorate inherited methods when deep is false', () => {
        const hello = new ExtendedHello('test');
        expect(hello.a('a')).toEqual('testa');
        expect(hello.b('b')).toEqual('testb');
        expect(hello.c('c')).toEqual('testc!');
    });

    it('decorates inherited methods when deep is true', () => {
        const hello = new DeepExtendedHello('test');
        expect(hello.a('a')).toEqual('testa!');
        expect(hello.b('b')).toEqual('testb!');
        expect(hello.c('c')).toEqual('testc!');
    });

    it('leaves the base class intact', () => {
        const hello = new Hello('test');
        expect(hello.a('a')).toEqual('testa');
        expect(hello.b('b')).toEqual('testb');
        expect(hello.c('c')).toEqual('testc');
    });

    it('does not decorate excluded methods', () => {
        const hello = new ExcludedHello('test');
        expect(hello.a('a')).toEqual('testa?');
        expect(hello.b('b')).toEqual('testb');
        expect(hello.c('c')).toEqual('testc?');
    });

    it('does not decorate methods with excluded prefix', () => {
        const hello = new ExcludePrefixHello('test');
        expect(hello._a('a')).toEqual('testa');
        expect(hello.b('b')).toEqual('testb?');
    });
    it('does not decorate methods from child class with excluded prefix', () => {
        const hello = new ExtendedExcludePrefixHello('test');
        expect(hello._a('a')).toEqual('testa');
        expect(hello.b('b')).toEqual('testb!?');
        expect(hello.PRIVATE_c('c')).toEqual('testc');
    });

    it('does not decorate excluded inherited methods', () => {
        const hello = new DeepExtendedExcludedHello('test');
        expect(hello.a('a')).toEqual('testa?');
        expect(hello.b('b')).toEqual('testb');
        expect(hello.c('c')).toEqual('testc?');
    });

    it('preserves decorators on inherited methods', () => {
        const hello = new ExtendedDecoratedHello('test');
        expect(hello.a('a')).toEqual('testa?');
        expect(hello.b('b')).toEqual('testb');
        expect(hello.c('c')).toEqual('testc?!');
    });

    it('preserves metadata from own method', () => {
        const hello = new DecoratedHello('');
        const metadata = Reflect.getMetadata('name', hello, 'a');
        expect(metadata).toEqual('DecoratedHello.a');
    });

    it('preserves metadata from inherited method', () => {
        const hello = new ExtendedHello('');
        const metadata = Reflect.getMetadata('name', hello, 'a');
        expect(metadata).toEqual('Hello.a');
    });
});
