const JasmineProvider = require('../../lib/jasmine/JasmineProvider');
const Qilan = require('../../lib/Qilan');

describe('[jasmine integration]', () => {
    let mock, when, any;

    beforeEach(() => {
        const provider = new JasmineProvider({ jasmine, spyOn, spyOnProperty });
        const qilan = new Qilan(provider);
        ({ mock, when, any, spy, anyArgs, unprofixy } = qilan);
    });

    describe('[simple mocks]', () => {
        let dog;
        let originalBark;

        beforeEach(() => {
            originalBark = jasmine.createSpy('original bark()');

            class Dog {
                bark() {
                    originalBark();
                }
            }

            dog = mock(Dog);
        });

        describe('do()', () => {
            it('should call provided method when mocked method is called with specific arguments', () => {
                const value1 = { fake: 'return-value-1' };
                const value2 = { fake: 'return-value-2' };
                const value3 = { fake: 'return-value-3' };

                const mockedBark1 = jasmine.createSpy('mockedBark1').and.returnValue(value1);
                const mockedBark2 = jasmine.createSpy('mockedBark2').and.returnValue(value2);
                const mockedBark3 = jasmine.createSpy('mockedBark3').and.returnValue(value3);

                when(() => dog.bark()).do(mockedBark1);
                when(() => dog.bark('hello world')).do(mockedBark2);
                when(() => dog.bark([1, 2, 3], { hello: 'world' }, true)).do(mockedBark3);

                expect(dog.bark()).toBe(value1);
                expect(dog.bark('hello world')).toBe(value2);
                expect(dog.bark([1, 2, 3], { hello: 'world' }, true)).toBe(value3);

                expect(mockedBark1).toHaveBeenCalledOnceWith();
                expect(mockedBark2).toHaveBeenCalledOnceWith('hello world');
                expect(mockedBark3).toHaveBeenCalledOnceWith([1, 2, 3], { hello: 'world' }, true);

                expect(originalBark).not.toHaveBeenCalled();
            });

            it('should work properly with any type', () => {
                const value1 = { fake: 'return-value-1' };
                const value2 = { fake: 'return-value-2' };
                const value3 = { fake: 'return-value-3' };
                const value4 = { fake: 'return-value-4' };

                when(() => dog.bark()).do(() => value1);
                when(() => dog.bark(any(String))).do(() => value2);
                when(() => dog.bark(any(Number))).do(() => value3);
                when(() => dog.bark(any(Array), any(Object), any(Boolean))).do(() => value4);

                expect(dog.bark()).toBe(value1);

                expect(dog.bark('')).toBe(value2);
                expect(dog.bark('hello world')).toBe(value2);

                expect(dog.bark(-123)).toBe(value3);
                expect(dog.bark(0)).toBe(value3);
                expect(dog.bark(123)).toBe(value3);

                expect(dog.bark([1, 2, 3], { hello: 'world' }, true)).toBe(value4);
                expect(dog.bark([1, 2, 3], {}, false)).toBe(value4);
                expect(dog.bark([], { hello: 'world' }, false)).toBe(value4);
            });
        });

        describe('return()', () => {
            it('should return provided value when mocked method is called with specific arguments', () => {
                const value1 = { fake: 'return-value-1' };
                const value2 = { fake: 'return-value-2' };
                const value3 = { fake: 'return-value-3' };

                when(() => dog.bark()).return(value1);
                when(() => dog.bark('hello world')).return(value2);
                when(() => dog.bark([1, 2, 3], { hello: 'world' }, true)).return(value3);
            });

            it('should work properly with any type', () => {
                const value1 = { fake: 'return-value-1' };
                const value2 = { fake: 'return-value-2' };
                const value3 = { fake: 'return-value-3' };
                const value4 = { fake: 'return-value-4' };
                const value5 = { fake: 'return-value-5' };
                const value6 = { fake: 'return-value-6' };
                const value7 = { fake: 'return-value-7' };

                when(() => dog.bark()).do(() => value1);
                when(() => dog.bark(any(String))).do(() => value2);
                when(() => dog.bark(any(Number))).do(() => value3);
                when(() => dog.bark(any(Array), any(Object), any(Boolean))).do(() => value4);
                when(() => dog.bark(any())).do(() => value5);
                when(() => dog.bark(any(), any())).do(() => value6);
                when(() => dog.bark(anyArgs())).do(() => value7);

                expect(dog.bark()).toBe(value1);

                expect(dog.bark('')).toBe(value2);
                expect(dog.bark('hello world')).toBe(value2);

                expect(dog.bark(-123)).toBe(value3);
                expect(dog.bark(0)).toBe(value3);
                expect(dog.bark(123)).toBe(value3);

                expect(dog.bark([1, 2, 3], { hello: 'world' }, true)).toBe(value4);
                expect(dog.bark([1, 2, 3], {}, false)).toBe(value4);
                expect(dog.bark([], { hello: 'world' }, false)).toBe(value4);

                expect(dog.bark(undefined)).toBe(value5);
                expect(dog.bark(null)).toBe(value5);
                expect(dog.bark(true)).toBe(value5);
                expect(dog.bark(false)).toBe(value5);
                expect(dog.bark([1, 2, 3])).toBe(value5);
                expect(dog.bark({ hello: 'world' })).toBe(value5);

                expect(dog.bark(undefined, undefined)).toBe(value6);
                expect(dog.bark(null, true)).toBe(value6);
                expect(dog.bark('hello', ['world'])).toBe(value6);
                expect(dog.bark({}, {})).toBe(value6);

                expect(dog.bark([], {}, 123)).toBe(value7);
                expect(dog.bark('hello', 'world', '!')).toBe(value7);
                expect(dog.bark(1, 2, 3)).toBe(value7);
            });
        });

        fit('should 1', () => {
            const anything = { asymmetricMatch: () => true };
            const spy = jasmine.createSpy('spy');

            spy.and.returnValue('any arguments');
            spy.withArgs().and.returnValue('no arguments');
            spy.withArgs(null).and.returnValue('null');
            spy.withArgs(undefined).and.returnValue('undefined');
            spy.withArgs(false).and.returnValue('false');
            spy.withArgs(anything).and.returnValue('anything');

            expect(spy()).toBe('no arguments');
            expect(spy(null)).toBe('null');
            expect(spy(undefined)).toBe('undefined');
            expect(spy(false)).toBe('false');
            expect(spy(123)).toBe('anything');
            expect(spy(1, 2, 3)).toBe('any arguments');
        });

        it('should 2', () => {
            const anything = { asymmetricMatch: () => true };
            const spy = jasmine.createSpy('spy');

            spy.and.returnValue('any arguments');
            spy.withArgs().and.returnValue('no arguments');
            spy.withArgs(anything).and.returnValue('one argument');
            spy.withArgs(anything, anything).and.returnValue('two arguments');

            expect(spy()).toBe('no arguments');

            expect(spy(undefined)).toBe('one argument');
            expect(spy(null)).toBe('one argument');
            expect(spy('hello world')).toBe('one argument');

            expect(spy(undefined, undefined)).toBe('two arguments');
            expect(spy(null, null)).toBe('two arguments');
            expect(spy('hello', 'world')).toBe('two arguments');

            expect(spy(undefined, undefined, undefined)).toBe('any arguments');
            expect(spy(null, null, null)).toBe('any arguments');
            expect(spy('hello', 'world', '!')).toBe('any arguments');
        });

        it('should work properly with "undefined" and "null" arguments', () => {
            when(() => dog.bark()).return(1);
            when(() => dog.bark(undefined)).return(2);
            when(() => dog.bark(null)).return(3);
            when(() => dog.bark(any())).return(4);

            expect(dog.bark()).toBe(1);
            expect(dog.bark(undefined)).toBe(2);
            expect(dog.bark(null)).toBe(3);
            expect(dog.bark(false)).toBe(4);
            expect(dog.bark(0)).toBe(4);
            expect(dog.bark('')).toBe(4);
        });
    });

    describe('spy()', () => {
        it('should create simple jasmine spies', () => {
            const mySpy = spy();

            expect(unprofixy(mySpy)).not.toHaveBeenCalled();

            mySpy(1, 'hello world', [true]);

            expect(unprofixy(mySpy)).toHaveBeenCalledOnceWith(1, 'hello world', [true]);
        });

        it('should always be reused by when()', () => {
            const mySpy = spy();

            expect(when(() => mySpy()).do(() => {})).toBe(mySpy);
            expect(when(() => mySpy(1, 2, 3)).return('hello world')).toBe(mySpy);
        });
    });
});
