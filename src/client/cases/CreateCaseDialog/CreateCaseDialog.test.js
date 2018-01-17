import React from 'react'
import {Provider} from 'react-redux'
import createConfiguredStore from "../../createConfiguredStore";
import {mount} from "enzyme/build/index";
import {createCaseSuccess} from "../actionCreators";
import CreateCaseDialog from "./CreateCaseDialog";
import {changeInput, expectEventuallyNotToExist} from "../../../testHelpers";
import createCase from "../thunks/createCase";

jest.mock('../thunks/createCase', () => (caseDetails) => ({
    type: 'MOCK_CREATE_CASE_THUNK',
    caseDetails
}))

describe('CreateCaseDialog component', () => {
    let store, dialog, dispatchSpy

    beforeEach(() => {
        store = createConfiguredStore();

        dialog = mount(
            <Provider store={store}>
                <CreateCaseDialog/>
            </Provider>
        )

        dispatchSpy = jest.spyOn(store, 'dispatch')
        dispatchSpy.mockClear()

        const createCaseButton = dialog.find('button[data-test="createCaseButton"]')
        createCaseButton.simulate('click')
    })

    test('should create case when form is submitted', () => {
        const caseDetails = {
            firstName: 'Fats',
            lastName: 'Domino',
            phoneNumber: '0123456789',
            email: 'fdomino@gmail.com',
            complainantType: 'Civilian'
        }

        changeInput(dialog, 'input[data-test="firstNameInput"]', caseDetails.firstName);
        changeInput(dialog, 'input[data-test="lastNameInput"]', caseDetails.lastName);
        changeInput(dialog, 'input[data-test="phoneNumberInput"]', caseDetails.phoneNumber);
        changeInput(dialog, 'input[data-test="emailInput"]', caseDetails.email);

        const submitButton = dialog.find('button[data-test="submitCase"]')
        submitButton.simulate('click')

        expect(dispatchSpy).toHaveBeenCalledWith(createCase(caseDetails))
    })

    describe('dismissing dialog', () => {
        test('should dismiss when cancel button is clicked', async () => {
            const cancel = dialog.find('button[data-test="cancelCase"]')
            cancel.simulate('click')

            await expectEventuallyNotToExist(dialog, '[data-test="createCaseDialogTitle"]')
        })

        test('should dismiss after successful case creation', async () => {
            store.dispatch(createCaseSuccess({id: 1234}))

            await expectEventuallyNotToExist(dialog, '[data-test="createCaseDialogTitle"]')
        })
    })

    describe('fields', () => {
        describe('first name', () => {
            test('first name should have max length of 25 characters', () => {
                const firstName = dialog.find('input[data-test="firstNameInput"]')
                expect(firstName.props().maxLength).toEqual(25)
            })

            test('first name should not use autoComplete', () => {
                const firstName = dialog.find('input[data-test="firstNameInput"]')
                expect(firstName.props().autoComplete).toEqual('off')
            })
        });

        describe('last name', () => {
            test('last name should have max length of 25 characters', () => {
                const lastName = dialog.find('input[data-test="lastNameInput"]')
                expect(lastName.props().maxLength).toEqual(25)
            })

            test('last name should not use autoComplete', () => {
                const lastName = dialog.find('input[data-test="lastNameInput"]')
                expect(lastName.props().autoComplete).toEqual('off')
            })
        });
    })

    describe('field validation', () => {
        beforeEach(() => {
            const submitButton = dialog.find('button[data-test="submitCase"]')
            submitButton.simulate('click')
        })

        describe('first name', () => {
            test('should display error message when no value', () => {
                const firstNameField = dialog.find('div[data-test="firstNameField"]')
                expect(firstNameField.text()).toContain('Please enter First Name')
            })

            test('should display error when whitespace', () => {
                const firstNameInput = dialog.find('input[data-test="firstNameInput"]')

                firstNameInput.simulate('focus')
                firstNameInput.simulate('change', {target: {value: '   '}})
                firstNameInput.simulate('blur')

                const firstNameField = dialog.find('div[data-test="firstNameField"]')
                expect(firstNameField.text()).toContain('Please enter First Name')
            })
        })

        describe('last name', () => {
            test('should display error message when no value', () => {
                const lastNameField = dialog.find('div[data-test="lastNameField"]')
                expect(lastNameField.text()).toContain('Please enter Last Name')
            })


            test('should display error when whitespace', () => {
                const lastNameInput = dialog.find('input[data-test="lastNameInput"]')

                lastNameInput.simulate('focus')
                lastNameInput.simulate('change', {target: {value: '\t\t   '}})
                lastNameInput.simulate('blur')

                const lastNameField = dialog.find('div[data-test="lastNameField"]')
                expect(lastNameField.text()).toContain('Please enter Last Name')
            })
        });

        describe('phone number', () => {
            test('should display error when non-numeric', () => {
                const phoneNumberInput = dialog.find('input[data-test="phoneNumberInput"]')

                phoneNumberInput.simulate('focus')
                phoneNumberInput.simulate('change', {target: {value: '123456789A'}})
                phoneNumberInput.simulate('blur')

                const phoneNumberField = dialog.find('div[data-test="phoneNumberField"]')
                expect(phoneNumberField.text()).toContain('Please enter a numeric 10 digit value')
            })

            test('should display error when not 10 digits', () => {
                const phoneNumberInput = dialog.find('input[data-test="phoneNumberInput"]')

                phoneNumberInput.simulate('focus')
                phoneNumberInput.simulate('change', {target: {value: '123456789'}})
                phoneNumberInput.simulate('blur')

                const phoneNumberField = dialog.find('div[data-test="phoneNumberField"]')
                expect(phoneNumberField.text()).toContain('Please enter a numeric 10 digit value')

            })

            test('should not display error when undefined', () => {
                const phoneNumberField = dialog.find('div[data-test="phoneNumberField"]')
                expect(phoneNumberField.text()).not.toContain('Please enter a numeric 10 digit value')
            })
        });

        describe('email', () => {
            test('should display error when not an email address', () => {
                const emailInput = dialog.find('input[data-test="emailInput"]')

                emailInput.simulate('focus')
                emailInput.simulate('change', {target: {value: 'ethome@thoughtworks'}})
                emailInput.simulate('blur')

                const emailField = dialog.find('div[data-test="emailField"]')
                expect(emailField.text()).toContain('Please enter a valid email address')
            })
        });

        describe('when email and phone number are undefined', () => {
            test('should display phone number error', () => {
                const phoneNumberField = dialog.find('div[data-test="phoneNumberField"]')
                expect(phoneNumberField.text()).toContain('Please enter phone number or email address')
            })

            test('should display email error', () => {
                const emailField = dialog.find('div[data-test="emailField"]')
                expect(emailField.text()).toContain('Please enter phone number or email address')
            })
        })
    })

    describe('trimming whitespace', () => {
        test('whitespace should be trimmed from fields prior to sending', () => {
            changeInput(dialog, 'input[data-test="firstNameInput"]', '   Hello   ')
            changeInput(dialog, 'input[data-test="lastNameInput"]', '   Kitty   ')
            changeInput(dialog, 'input[data-test="phoneNumberInput"]', '1234567890')

            const submitButton = dialog.find('button[data-test="submitCase"]')
            submitButton.simulate('click')

            expect(dispatchSpy).toHaveBeenCalledWith(
                createCase({
                    firstName: 'Hello',
                    lastName: 'Kitty',
                    phoneNumber: '1234567890',
                    complainantType: 'Civilian'
                }))
        })
    })
})