import React from 'react';
import createConfiguredStore from "../../createConfiguredStore";
import {getCasesSuccess} from "../actionCreators";
import {mount} from "enzyme/build/index";
import CaseDetails from "./CaseDetails";
import {Provider} from 'react-redux';
import NavBar from "../../sharedComponents/NavBar";
import {BrowserRouter as Router} from "react-router-dom";
import LinkButton from "../../sharedComponents/LinkButton";
import formatDate from "../../formatDate";
import {containsText} from "../../../testHelpers";

jest.mock('../thunks/getCases', () => () => ({
    type: 'MOCK_GET_CASES_THUNK'
}))
describe('Case Details Component', () => {
    let caseDetails, expectedCase, dispatchSpy;
    beforeEach(() => {
        let store = createConfiguredStore()
        dispatchSpy = jest.spyOn(store, 'dispatch');
        let cases = [{
            id: 17,
            firstName: 'Chuck',
            lastName: 'Berry',
            status: 'Initial',
            createdAt: formatDate(new Date(2015, 8, 13).toISOString()),
            createdBy: 'not added',
            assignedTo: 'not added'
        }];
        store.dispatch(getCasesSuccess(cases));
        expectedCase = cases[0]
        caseDetails = mount(
            <Provider store={store}>
                <Router>
                    <CaseDetails match={{params: {id: expectedCase.id.toString()}}}/>
                </Router>
            </Provider>
        )
    });

    describe('nav bar', () => {
        test("should display with Last Name, First Initial", () => {
            const navBar = caseDetails.find(NavBar);
            containsText(navBar, '[data-test="pageTitle"]', 'Berry, C.')
        })

        test("should display with case status", () => {
            const navBar = caseDetails.find(NavBar)
            containsText(navBar, '[data-test="caseStatusBox"]', expectedCase.status)
        })
    });

    describe('drawer', () => {
        test("should provide an option to go back to all cases", () => {
            containsText(caseDetails, 'LinkButton', "Back to all Cases")
        })

        test("should display the case number", () => {
            containsText(caseDetails, '[data-test="case-number"]', `Case #${expectedCase.id}`)
        })

        test("should display created on date", () => {
            containsText(caseDetails, '[data-test="created-on"]', expectedCase.createdAt)
        })

        test("should display created by user", () => {
            containsText(caseDetails, '[data-test="created-by"]', expectedCase.createdBy)
        })

        test("should display assigned to user", () => {
            containsText(caseDetails, '[data-test="assigned-to"]', expectedCase.assignedTo)
        })

    });

});