import { copyMetadata } from './copy-metadata';

export interface DecorateAllOptions {
    deep?: boolean;
    exclude?: string[];
    excludePrefix?: string;
}

/**
 * Apply the given decorator to all class methods
 *
 * @param decorator Method decorator to apply to all methods of a class
 * @param {string[]} options.exclude array of method names that won't be decorated
 * @param {boolean} options.deep if true, also decorates methods of the extended classes (recusrively)
 */
export const DecorateAll = (
    decorator: MethodDecorator,
    options: DecorateAllOptions = {},
) => {
    return (target: any) => {
        let descriptors = Object.getOwnPropertyDescriptors(target.prototype);
        if (options.deep) {
            let base = Object.getPrototypeOf(target);
            while (base.prototype) {
                const baseDescriptors = Object.getOwnPropertyDescriptors(
                    base.prototype,
                );
                descriptors = { ...baseDescriptors, ...descriptors };
                base = Object.getPrototypeOf(base);
            }
        }
        for (const [propName, descriptor] of Object.entries(descriptors)) {
            const isMethod =
                typeof descriptor.value == 'function' &&
                propName != 'constructor';
            if (options.exclude?.includes(propName)) continue;
            if (propName.startsWith(options.excludePrefix)) continue;
            if (!isMethod) continue;
            const originalMethod = descriptor.value;
            decorator(target, propName, descriptor);
            if (originalMethod != descriptor.value) {
                copyMetadata(originalMethod, descriptor.value);
            }
            Object.defineProperty(target.prototype, propName, descriptor);
        }
    };
};
