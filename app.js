const port = 8000;

const core = require('../PIveCore');
const fs = require('fs');

const debug = require('debug');
const info = debug('PIve:info');
const error = debug('PIve:error');
const warning = debug('PIve:warning');
info.log = console.info.bind(console);

const express = require('express');
const url = require('url');
const pug = require('pug');

const session = require('express-session');
const bodyParser = require('body-parser');

const app = express()

app.use(express.static('static'));
app.set('view engine', 'pug');

app.set('trust proxy', 1);
app.use(session({
    secret: '-u5}K6MX"s/>YM{G/QC3NxsPDleM!o`:0}9E{6jeR_@/;^g0:AnE5/yw7c_lzEIn>@)go:ta7_ivtDVNf?u;I[r|tzr{!7"c4nw7oi:Wa<l}?s3Thn1#^5#{\Vw.DuL.A-IfgN["=|(l<Vuds!ZF(>1.XvMbd6`yeJo4|4%`<GGsK+IZWW@zz/^j]@{rQ^.aZh"tJe3;rH.G<NV>uU~p1Gb.BBTC3q0OhK5"%V:znx1AMGSg}74nh.k\'4w#\@FTW',
    resave: false,
    saveUninitialized: true
}))

app.use(bodyParser.urlencoded({extended: true}));

app.get('/', function(req, res) {
    if (!req.session.username) {
        info(req.session);
        info(req.session.username)
        res.render('login');
    } else {
        core.getDirContent('/mnt/c/Users/Edgar Pierre/Google Drive', function(err, data) {
            if (err) error(err.message)
            else {
                folders = [];files = [];
                for (var i=0;i < data.length;i++) {
                    elt = data[i]
                    if (elt.type=='dir')
                        folders.push(elt.name);
                    else if (elt.type == 'text/plain')
                        files.push({name: elt.name, icon: 'fa-file-alt'})
                    else
                        files.push({name: elt.name, icon: 'fa-file'})
                }
                res.render('index', {folders: folders, files: files});
            }
        });
    }
});

app.post('/', function(req, res) {
    if (req.session.username) {
        res.redirect('/');
    } else {
        if(req.body.username == 'edpi' && req.body.password == 'password') {
            info('Connexion de edpi réussie.')
            req.session.username = 'edpi';
            info(req.session)
            res.redirect('/')
        } else {
            error('Connexion échouée.')
            res.redirect('/login');
        }
    }
});

app.listen(port, function() {
    info('App listening on port ' + port + '...');
})