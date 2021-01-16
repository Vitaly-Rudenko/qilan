const JasmineMockProvider = require('../../lib/JasmineMockProvider');
const Qilan = require('../../lib/Qilan');

describe('Qilan', () => {
    let mock, when;

    beforeEach(() => {
        ({ mock, when } = new Qilan(
            new JasmineMockProvider({ jasmine, spyOn, spyOnProperty })
        ));
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

        describe('when()', () => {
            describe('do()', () => {
                it('should call provided method when mocked method is called with specific arguments', () => {
                    const value1 = { fake: 'return-value' };
                    const value2 = ['hello world', true];
                    const value3 = 'fake result 3';

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
            });

            describe('return()', () => {
                it('should return provided value when mocked method is called with specific arguments', () => {
                    const value1 = { fake: 'return-value' };
                    const value2 = ['hello world', true];
                    const value3 = 'fake result 3';

                    when(() => dog.bark()).return(value1);
                    when(() => dog.bark('hello world')).return(value2);
                    when(() => dog.bark([1, 2, 3], { hello: 'world' }, true)).return(value3);

                    expect(dog.bark()).toBe(value1);
                    expect(dog.bark('hello world')).toBe(value2);
                    expect(dog.bark([1, 2, 3], { hello: 'world' }, true)).toBe(value3);

                    expect(originalBark).not.toHaveBeenCalled();
                });
            });
        });
    });
});
