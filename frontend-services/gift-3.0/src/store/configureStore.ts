import {createStore, combineReducers, applyMiddleware, compose} from "redux";
import thunk, {ThunkMiddleware}from "redux-thunk";
import { AppActions } from '../types/Actions/appActions';
import { composeWithDevTools } from "redux-devtools-extension";
import { cloneDeep } from "lodash";
import produce, { produceWithPatches } from "immer";
import { EditorStateActionTypes } from "../types/Actions/editorStateActions";
import { ViewConfigActionTypes } from "../types/Actions/viewConfig";
import { curriedMetaStateReducer } from "../reducers/normalizedReducers/metaState";
import { AppState } from "../types/NormalizedState/AppState";



declare global {
  interface Window {
    __REDUX_DEVTOOLS_EXTENSION_COMPOSE__?: typeof compose;
  }
}

const composeEnhancers = window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;



export const store = createStore(curriedMetaStateReducer, composeEnhancers());
