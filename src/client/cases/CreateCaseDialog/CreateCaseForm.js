import React from 'react';
import {Field, reduxForm} from 'redux-form'
import createCase from "../thunks/createCase";
import {TextField} from 'redux-form-material-ui'
import validator from 'validator'
import ComplainantTypeRadioGroup from './ComplainantTypeRadioGroup'

const isRequired = text => value =>
    value === undefined ? `Please enter ${text}` : undefined

const notBlank = text => value =>
    value.trim() === '' ? `Please enter ${text}` : undefined

const isPhoneNumber = value => {
    const missingOrValid = value === undefined || /^[0-9]{10}$/.test(value);
    return missingOrValid ? undefined : 'Please enter a numeric 10 digit value'
}

const isEmail = value => {
    const missingOrValid = value === undefined || validator.isEmail(value);
    return missingOrValid ? undefined : 'Please enter a valid email address'
}

const firstNameRequired = isRequired('First Name');
const lastNameRequired = isRequired('Last Name');
const firstNameNotBlank = notBlank('First Name')
const lastNameNotBlank = notBlank('Last Name')

const CreateCaseForm = () => {
    const offSet = {
        marginRight: '5%'
    }

    return (
        <form data-test="createCaseForm">
            <Field
                name="complainantType"
                component={ComplainantTypeRadioGroup}
                style={offSet}
            />
            <br />
            <Field
                name="firstName"
                component={TextField}
                label="First Name"
                inputProps={{
                    maxLength: 25,
                    autoComplete: "off",
                    "data-test": "firstNameInput"
                }}
                data-test="firstNameField"
                validate={[firstNameRequired, firstNameNotBlank]}
                style={offSet}
            />
            <Field
                name="lastName"
                component={TextField}
                label="Last Name"
                inputProps={{
                    maxLength: 25,
                    autoComplete: "off",
                    "data-test": "lastNameInput"
                }}
                data-test="lastNameField"
                validate={[lastNameRequired, lastNameNotBlank]}
                style={offSet}
            />
            <br />
            <Field
                name="phoneNumber"
                component={TextField}
                label="Phone Number"
                inputProps={{
                    "data-test": "phoneNumberInput"
                }}
                data-test="phoneNumberField"
                validate={[isPhoneNumber]}
                style={offSet}
            />
            <Field
                name="email"
                component={TextField}
                label="Email"
                inputProps={{
                    "data-test": "emailInput",
                }}
                data-test="emailField"
                validate={[isEmail]}
                style={offSet}
            />
        </form>
    )
}

const dispatchCreateCase = (values, dispatch) => {
    const sanitizedValues = {
        ...values,
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim()
    }

    dispatch(createCase(sanitizedValues))
}

const validate = values => {
    const errors = {}

    if (values.phoneNumber === undefined && values.email === undefined) {
        errors.phoneNumber = 'Please enter phone number or email address'
        errors.email = 'Please enter phone number or email address'
    }

    return errors
}

export default reduxForm({
    form: 'CreateCase',
    initialValues: {
        complainantType: 'Civilian'
    },
    onSubmit: dispatchCreateCase,
    validate
})(CreateCaseForm);