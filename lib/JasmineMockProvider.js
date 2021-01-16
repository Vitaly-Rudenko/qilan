class JasmineMockProvider {
    constructor({ jasmine, spyOn, spyOnProperty }) {
        this._jasmine = jasmine;
        this._spyOn = spyOn;
        this._spyOnProperty = spyOnProperty;

        this._methodSpies = new Map();
        this._propertySpies = new Map();
    }

    createMock({ name, methods }) {
        return this._jasmine.createSpyObj(name, methods);
    }

    spyOnMethodAndDo(mock, fieldName, args, method) {
        const spy = this._getMethodSpy(mock, fieldName).withArgs(...args);
        spy.and.callFake(method);
        return;
    }

    spyOnMethodAndReturn(mock, fieldName, args, value) {
        const spy = this._getMethodSpy(mock, fieldName).withArgs(...args);
        spy.and.returnValue(value);
        return spy;
    }

    _getMethodSpy(mock, fieldName) {
        return mock[fieldName];
    }
}

module.exports = JasmineMockProvider;
