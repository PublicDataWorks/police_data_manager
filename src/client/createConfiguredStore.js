import {applyMiddleware, combineReducers, createStore} from 'redux'
import {composeWithDevTools} from 'redux-devtools-extension'
import {reducer as formReducer} from 'redux-form'
import thunk from 'redux-thunk'
import history from './history'
import { routerMiddleware , routerReducer} from 'react-router-redux'
import allCasesReducer from './cases/reducers/allCasesReducer'
import caseCreationReducer from "./cases/reducers/caseCreationReducer"
import allUsersReducer from "./users/reducers/allUsersReducer";
import userCreationReducer from "./users/reducers/userCreationReducer";
import caseSnackbarReducer from "./cases/reducers/caseSnackbarReducer";
import userSnackbarReducer from "./users/reducers/userSnackbarReducer";

const rootReducer = combineReducers({
    form: formReducer,
    routing: routerReducer,
    cases: combineReducers({
        all: allCasesReducer,
        creation: caseCreationReducer,
        snackbar: combineReducers({
            open: caseSnackbarReducer
        })
    }),
    users: combineReducers({
        all: allUsersReducer,
        creation: userCreationReducer,
        snackbar: combineReducers({
            open: userSnackbarReducer
        })
    })
})

const routingMiddleware = routerMiddleware(history)

const createConfiguredStore = () => createStore(rootReducer, composeWithDevTools(
    applyMiddleware(
        thunk,
        routingMiddleware
        )
))

export default createConfiguredStore
