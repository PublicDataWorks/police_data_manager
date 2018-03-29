import getAccessToken from "../../auth/getAccessToken";
import {getCaseDetailsSuccess} from "../../actionCreators/casesActionCreators";
import {push} from "react-router-redux";
import config from '../../config/config'

const hostname = config[process.env.NODE_ENV].hostname

const getCaseDetails = (caseId) => async (dispatch) => {
    try {
        const token = getAccessToken()

        if (!token){
            return dispatch(push(`/login`))
        }

        const response = await fetch(`${hostname}/api/cases/${caseId}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            }
        })

        switch (response.status) {
            case 200:
            const responseBody = await response.json()
                return dispatch(getCaseDetailsSuccess(responseBody))
            case 401:
                return dispatch(push(`/login`))
            default:
                return
        }
    } catch (e) {
    }
}


export default getCaseDetails