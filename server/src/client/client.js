import React from "react";
import { createRoot } from 'react-dom/client';
import "core-js/stable";
import {BrowserRouter} from "react-router-dom";
import {applyMiddleware, createStore} from "redux";
import thunk from "redux-thunk";
import {Provider} from "react-redux";
import {renderRoutes} from "react-router-config";
import reducers from './reducers';
import MyRoutes from "./Routes";
import axios from "axios";

const container = document.querySelector("#root");

const axiosInstance = axios.create({
    baseURL: "/api"
})

const store = createStore(
    reducers,
    window.INITIAL_STATE,
    applyMiddleware(thunk.withExtraArgument(axiosInstance))
);

const root = createRoot(container);

root.render(
    <Provider store={store}>
        <BrowserRouter>
            <div>{renderRoutes(MyRoutes)}</div>
        </BrowserRouter>
    </Provider>
);
