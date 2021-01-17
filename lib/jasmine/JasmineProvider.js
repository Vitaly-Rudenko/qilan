const AnyArgs = require('../AnyArgs');

function anything() {
    return {
        asymmetricMatch: () => true,
        jasmineToString: () => '<qilan.anything>'
    };
}

class JasmineProvider {
    constructor({ jasmine, spyOn, spyOnProperty }) {
        this._jasmine = jasmine;
        this._spyOn = spyOn;
        this._spyOnProperty = spyOnProperty;

        this._methodSpies = new Map();
        this._propertySpies = new Map();
    }

    // ---

    createMock({ name, methods }) {
        return this._jasmine.createSpyObj(name, methods);
    }

    createSpy(name) {
        return this._jasmine.createSpy(name);
    }

    createAnyType(...args) {
        return args.length === 1 && args[0] !== undefined
            ? this._jasmine.any(args[0])
            : anything();
    }

    // ---

    spyToDo(spy, args, method) {
        if (args[0] !== AnyArgs) spy = spy.withArgs(...args);
        spy.and.callFake(method);
        return spy;
    }

    spyToReturn(spy, args, value) {
        if (args[0] !== AnyArgs) spy = spy.withArgs(...args);
        spy.and.returnValue(value);
        return spy;
    }

    spyOnMethodAndDo(mock, fieldName, args, method) {
        let spy = this._getMethodSpy(mock, fieldName);
        if (args[0] !== AnyArgs) spy = spy.withArgs(...args);
        spy.and.callFake(method);
        return spy;
    }

    spyOnMethodAndReturn(mock, fieldName, args, value) {
        let spy = this._getMethodSpy(mock, fieldName);
        if (args[0] !== AnyArgs) spy = spy.withArgs(...args);
        spy.and.returnValue(value);
        return spy;
    }

    _getMethodSpy(mock, fieldName) {
        return mock[fieldName];
    }

    // ---

    expectSame(value1, value2) {
        expect(value1).toBe(value2);
    }

    expectEqual(value1, value2) {
        expect(value1).toEqual(value2);
    }

    expectCalled(mock, args) {
        if (args[0] === AnyArgs) {
            expect(mock).toHaveBeenCalledWith(...args);
        } else {
            expect(mock).toHaveBeenCalled();
        }
    }

    expectCalledOnce(mock, args) {
        if (args[0] === AnyArgs) {
            expect(mock).toHaveBeenCalledTimes(1);
        } else {
            expect(mock).toHaveBeenCalledOnceWith(...args);
        }
    }

    expectCalledTimes(mock, args, times) {
        if (args[0] === AnyArgs) {
            expect(mock).toHaveBeenCalledTimes(times);
        } else {
            const allArgs = [];
            for (let i = 0; i < times; i++) {
                allArgs.push(args);
            }

            expect(mock.calls.allArgs()).toEqual(allArgs);
        }
    }

    expectNotCalled(mock, args) {
        if (args[0] === AnyArgs) {
            expect(mock).not.toHaveBeenCalled();
        } else {
            const allArgs = [];
            for (let i = 0; i < times; i++) {
                allArgs.push(args);
            }

            expect(mock.calls.allArgs()).toEqual(allArgs);
        }
    }
}

module.exports = JasmineProvider;
