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

class Hello {
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

@DecorateAll(AppendString('!'))
class DecoratedHello {
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

describe('ApplyToAll', () => {
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
});
