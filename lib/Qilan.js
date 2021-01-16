class Call {
    constructor({ proxy, fieldName }) {
        this.proxy = proxy;
        this.fieldName = fieldName;
    }
}

class MethodCall extends Call {
    constructor({ proxy, fieldName, args }) {
        super({ proxy, fieldName });
        this.args = args;
    }
}

class Qilan {
    /** @param {import('./JasmineMockProvider')} mockProvider */
    constructor(mockProvider) {
        this._mockProvider = mockProvider;

        this._proxyMockMap = new Map();
        this._trackCalls = false;
        /** @type {Call[]} */
        this._calls = [];

        this.mock = this.mock.bind(this);
        this.when = this.when.bind(this);
    }

    when(expression) {
        this._trackCalls = true;
        expression();
        this._trackCalls = false;

        if (this._calls.length !== 1) {
            throw new Error(`Invalid call count: ${this._calls.length}`);
        }

        const call = this._calls.pop();
        const mock = this._proxyMockMap.get(call.proxy);

        return {
            do: (method) => {
                if (call instanceof MethodCall) {
                    return this._mockProvider.spyOnMethodAndDo(mock, call.fieldName, call.args, method);
                } else {
                    throw new Error(`Invalid call: ${call}`)
                }
            },
            return: (value) => {
                if (call instanceof MethodCall) {
                    return this._mockProvider.spyOnMethodAndReturn(mock, call.fieldName, call.args, value);
                } else {
                    throw new Error(`Invalid call: ${call}`)
                }
            }
        };
    }

    mock(mockable) {
        const mock = this._mockProvider.createMock({
            name: mockable.name,
            methods: getClassMethods(mockable)
        });

        const proxy = new Proxy({}, {
            get: (_, fieldName) => {
                return (...args) => {
                    if (this._trackCalls) {
                        const call = new MethodCall({ proxy, fieldName, args });
                        this._calls.push(call);
                    } else {
                        return mock[fieldName](...args);
                    }
                };
            }
        });

        this._proxyMockMap.set(proxy, mock);

        return proxy;
    }
}

function getClassMethods(object) {
    const methods = new Set();

    let currentPrototype = object.prototype;

    while (currentPrototype && currentPrototype !== Object.prototype) {
        const keys = Reflect.ownKeys(currentPrototype);

        for (const key of keys) {
            if (
                key !== 'constructor' &&
                typeof currentPrototype[key] === 'function'
            ) {
                methods.add(key);
            }
        }

        currentPrototype = Reflect.getPrototypeOf(currentPrototype);
    }

    return [...methods];
}

module.exports = Qilan;
