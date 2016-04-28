'use strict';

const express = require('express');
const app = express();
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const argv = require('minimist')(process.argv.slice(2));

app.set('view engine', 'hbs');
app.use(express.static(__dirname + '/public'));

app.use(bodyParser.json());
app.use(morgan('dev'));

require('./routes')(app);

app.set('port', (process.env.PORT || 8080));

app.use((req, res, next) => {
    req.commonData = {
        meta: {
            description: 'ToDo-hi',
            charset: 'utf-8'
        },
        page: {
            title: 'ToDo-hi'
        },
        host: (argv.NODE_ENV === 'development') ? '' : '//lakate-todohi.surge.sh'
    };

    next();
});
app.use(cookieParser());

app.listen(app.get('port'),
    () => console.log(`Listening on port ${app.get('port')}`));

module.exports = app;