import "core-js/stable";
import express from 'express';
import {matchRoutes} from 'react-router-config';
import proxy from 'express-http-proxy';
import Routes from './client/Routes';
import renderer from './helpers/renderer';
import createStore from './helpers/createStore';

const app = express();
const dotenv = require('dotenv');
dotenv.config();

app.use(
    '/api',
    proxy(process.env.API_URL, {
        proxyReqOptDecorator(opts) {
            opts.headers['x-forwarded-host'] = `${process.env.HOSTNAME}:${process.env.PORT}`;
            return opts;
        }
    })
);
app.use(express.static('public'));
app.get('*', (req, res) => {
    const store = createStore(req);
    const promises = matchRoutes(Routes, req.path)
        .map(({route}) => route.loadData ? route.loadData(store) : null)
        .map(promise => {
            if (promise) {
                return new Promise((resolve, reject) => {
                    promise.then(resolve).catch(resolve);
                });
            }
        });

    Promise.all(promises).then(() => {
        const context = {};
        const content = renderer(req, store, context);

        if (context.url) {
            return res.redirect(301, context.url);
        }
        if (context.notFound) {
            res.status(404);
        }

        res.send(content);
    });
});

app.listen(process.env.PORT, process.env.HOSTNAME, () => {
    console.log(`Listening on port ${process.env.PORT}`);
});
