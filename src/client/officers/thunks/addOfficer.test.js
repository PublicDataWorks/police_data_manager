import addOfficer from "./addOfficer";
import nock from "nock";
import getAccessToken from "../../auth/getAccessToken";
import {push} from "react-router-redux";
import Officer from "../../testUtilities/Officer";
import Case from "../../testUtilities/case";
import {
    addOfficerToCaseFailure, addOfficerToCaseSuccess,
    clearSelectedOfficer
} from "../../actionCreators/officersActionCreators";

jest.mock("../../auth/getAccessToken", () => jest.fn(() => "TEST_TOKEN"))

describe('addOfficer', () => {
    const dispatch = jest.fn()

    beforeEach(() => {
        getAccessToken.mockClear()
        dispatch.mockClear()
    })

    test('should dispatch success, clear selected officer, and redirect to caseDetails when successful', async () => {
        const officer = new Officer.Builder().defaultOfficer().withId(14)
        const defaultCase = new Case.Builder().defaultCase().withId(14)
        const formValues = {
            roleOnCase: "Accused",
            notes: "Some very very very important notes"
        }

        const responseBody = {updatedCaseProp: "updatedCaseValues"}

        nock('http://localhost', {
            reqheaders: {
                'Authorization': `Bearer TEST_TOKEN`
            }
        })
            .put(`/api/cases/${defaultCase.id}/officers/${officer.id}`, JSON.stringify(formValues))
            .reply(200, responseBody)

        await addOfficer(officer.id, defaultCase.id, formValues)(dispatch)

        expect(dispatch).toHaveBeenCalledWith(addOfficerToCaseSuccess(responseBody))
        expect(dispatch).toHaveBeenCalledWith(clearSelectedOfficer())
        expect(dispatch).toHaveBeenCalledWith(push(`/cases/${defaultCase.id}`))
    })

    test('should dispatch failure when fails', async () => {
        const officer = new Officer.Builder().defaultOfficer().withId(14)
        const defaultCase = new Case.Builder().defaultCase().withId(14)
        const formValues = {
            roleOnCase: "Accused",
            notes: "Some very very very important notes"
        }

        nock('http://localhost', {
            reqheaders: {
                'Authorization': `Bearer TEST_TOKEN`
            }
        })
            .put(`/api/cases/${defaultCase.id}/officers/${officer.id}`, JSON.stringify(formValues))
            .reply(500)

        await addOfficer(officer.id, defaultCase.id, formValues)(dispatch)

        expect(dispatch).toHaveBeenCalledWith(addOfficerToCaseFailure())
    })

    test('should not dispatch success and should redirect when 401 response', async () => {
        const officer = new Officer.Builder().defaultOfficer().withId(14)
        const defaultCase = new Case.Builder().defaultCase().withId(14)
        const formValues = {
            roleOnCase: "Accused",
            notes: "Some very very very important notes"
        };

        nock('http://localhost', {
            reqheaders: {
                'Authorization': `Bearer TEST_TOKEN`
            }
        })
            .put(`/api/cases/${defaultCase.id}/officers/${officer.id}`, JSON.stringify(formValues))
            .reply(401)

        await addOfficer(officer.id, defaultCase.id, formValues)(dispatch)

        expect(dispatch).toHaveBeenCalledWith(push(`/login`))
    })

    test('should redirect immediately if token missing', async () => {
        getAccessToken.mockImplementation(() => false)


        await addOfficer()(dispatch)

        expect(dispatch).toHaveBeenCalledWith(push(`/login`))
    })
})
