const AnyArgs = require('./AnyArgs');

class Call {
    constructor({ proxy }) {
        this.proxy = proxy;
    }
}

class SpyCall extends Call {
    constructor({ proxy, args }) {
        super({ proxy });
        this.args = args;
    }
}

class MethodCall extends Call {
    constructor({ proxy, fieldName, args }) {
        super({ proxy });
        this.fieldName = fieldName;
        this.args = args;
    }
}

class Qilan {
    /** @param {import('./jasmine/JasmineProvider')} provider */
    constructor(provider) {
        this._provider = provider;

        this._proxyMap = new Map();
        this._trackCalls = false;
        /** @type {Call[]} */
        this._calls = [];

        const boundMethods = ['mock', 'spy', 'when', 'any', 'anyArgs', 'unprofixy'];
        for (const boundMethod of boundMethods) {
            this[boundMethod] = this[boundMethod].bind(this);
        }
    }

    install() {
        this._provider.install();
    }

    get expect() {
        return {
            same: (value1, value2) => {
                return this._provider.expectSame(value1, value2);
            },
            equal: (value1, value2) => {
                return this._provider.expectEqual(value1, value2);
            },
            called: (expression) => {
                const [call, mock] = this._getCall(expression);
                return this._provider.expectCalled(mock, call.args);
            },
            calledOnce: (expression) => {
                const [call, mock] = this._getCall(expression);
                return this._provider.expectCalledOnce(mock, call.args);
            },
            calledTimes: (expression, times) => {
                const [call, mock] = this._getCall(expression);
                return this._provider.expectCalledTimes(mock, call.args, times);
            },
            notCalled: (expression) => {
                const [call, mock] = this._getCall(expression);
                return this._provider.expectNotCalled(mock, call.args);
            }
        }
    }

    _getCall(expression) {
        this._trackCalls = true;
        expression();
        this._trackCalls = false;

        if (this._calls.length !== 1) {
            throw new Error(`Invalid call count: ${this._calls.length}`);
        }

        const call = this._calls.pop();
        const mock = this._proxyMap.get(call.proxy);

        return [call, mock];
    }

    spy(...args) {
        const spy = this._provider.createSpy();

        const proxy = (...args) => {
            if (this._trackCalls) {
                const call = new SpyCall({ proxy, args });
                this._calls.push(call);
            } else {
                return spy(...args);
            }
        };

        this._proxyMap.set(proxy, spy);

        if (this._trackCalls) {
            proxy(...args);
        }

        return proxy;
    }

    when(expression) {
        if (!expression) {
            expression = () => this.spy(this.anyArgs());
        }

        if (this._trackCalls) {
            throw new Error('Calls are already being tracked!');
        }

        this._trackCalls = true;
        expression();
        this._trackCalls = false;

        if (this._calls.length !== 1) {
            throw new Error(`Invalid call count: ${this._calls.length}`);
        }

        const call = this._calls.pop();
        const mock = this._proxyMap.get(call.proxy);

        return {
            do: (method) => {
                if (call instanceof MethodCall) {
                    this._provider.spyOnMethodAndDo(mock, call.fieldName, call.args, method);
                } else if (call instanceof SpyCall) {
                    this._provider.spyToDo(mock, call.args, method);
                } else {
                    throw new Error(`Invalid call: ${call}`)
                }

                return call.proxy;
            },
            return: (value) => {
                if (call instanceof MethodCall) {
                    this._provider.spyOnMethodAndReturn(mock, call.fieldName, call.args, value);
                } else if (call instanceof SpyCall) {
                    this._provider.spyToReturn(mock, call.args, value);
                } else {
                    throw new Error(`Invalid call: ${call}`)
                }

                return call.proxy;
            }
        };
    }

    mock(mockable) {
        const mock = this._provider.createMock({
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

        this._proxyMap.set(proxy, mock);

        return proxy;
    }

    unprofixy(proxy) {
        return this._proxyMap.get(proxy);
    }

    any(type) {
        return this._provider.createAnyType(type);
    }

    anyArgs() {
        return AnyArgs;
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
