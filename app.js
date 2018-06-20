const port = 8000;
const basePath = '/mnt/c/Users/Edgar Pierre/Google Drive';

const core = require('../PIveCore');
const fs = require('fs-extra');
const colors = require('colors');
const crypto = require('crypto');
const path = require('path');

const debug = require('debug');
const info = debug('PIve:info');
const _error = debug('PIve:error');
function error(msg) {_error(msg.red);}
const warning = debug('PIve:warning');
info.log = console.info.bind(console);

const express = require('express');
const url = require('url');
const pug = require('pug');
const fileUpload = require('express-fileupload');

const session = require('express-session');
const bodyParser = require('body-parser');

const app = express()

app.use(express.static('static'));
app.set('view engine', 'pug');
app.use(fileUpload());

app.set('trust proxy', 1);
app.use(session({
    secret: '-u5}K6MX"s/>YM{G/QC3NxsPDleM!o`:0}9E{6jeR_@/;^g0:AnE5/yw7c_lzEIn>@)go:ta7_ivtDVNf?u;I[r|tzr{!7"c4nw7oi:Wa<l}?s3Thn1#^5#{\Vw.DuL.A-IfgN["=|(l<Vuds!ZF(>1.XvMbd6`yeJo4|4%`<GGsK+IZWW@zz/^j]@{rQ^.aZh"tJe3;rH.G<NV>uU~p1Gb.BBTC3q0OhK5"%V:znx1AMGSg}74nh.k\'4w#\@FTW',
    resave: false,
    saveUninitialized: true
}));

var genRandomString = function(length){
    return crypto.randomBytes(Math.ceil(length/2))
            .toString('hex') /** convert to hexadecimal format */
            .slice(0,length);   /** return required number of characters */
};

var sha512 = function(password, salt){
    var hash = crypto.createHmac('sha512', salt); /** Hashing algorithm sha512 */
    hash.update(password);
    var value = hash.digest('hex');
    return {
        salt:salt,
        passwordHash:value
    };
};

app.use(bodyParser.urlencoded({extended: true}));

app.get('/', function(req, res, next) {
    if (!req.session.username) {
        res.render('login');
    } else {
        next();
    }
});

app.get('/*', function(req, res, next) {
    if (!req.session.username) {
        res.redirect('/');
    } else {
        next();
    }
});

app.post('/', function(req, res, next) {
    if (req.session.username) {
        if (req.body.action) next();
        else res.redirect('/');
    } else {
        fs.readFile('./.users', 'utf8', function(err, data) {
			if (err) error('Erreur de lecture des utilisateurs !')
			else {
				lines = data.split('\r\n');
				var users = new Object();
				for (var i = 0; i < lines.length; i ++) {
					e = lines[i].split('\t');
					if (req.body.username == e[0]) {
						if (sha512(req.body.password, e[2]).passwordHash == e[1]) {
							info('Connexion de '.green + req.body.username + ' réussie.\n IP: '.green + req.connection.remoteAddress)
							req.session.username = req.body.username;
							res.redirect('/');
							return undefined;
						} else {
							info('Connexion échouée.\n IP: '.red + req.connection.remoteAddress);
							res.redirect('/');
							return;
						}
					}
				}
				info('Connexion échouée.\n IP: '.red + req.connection.remoteAddress);
				res.redirect('/');
			}
        });
    }
});

app.get('/[\:]logout', function(req, res) {
    var username = req.session.username;
    req.session.destroy(function(err) {
        if (!err) info('Déconnexion de '.green + username + ' réussie.'.green);
        res.redirect('/');
    });
});

app.get('/[\:]createUser', function(req, res) {
	if (req.session.username == 'admin') {
		res.render('login');
	} else {
		res.redirect('/');
	}
});

app.post('/[\:]createUser', function(req, res) {
	if (req.session.username == 'admin') {
		var salt = genRandomString(256);
		var hash = sha512(req.body.password, salt).passwordHash;
		fs.appendFile('./.users', '\r\n' + req.body.username + '\t' + hash + '\t' + salt, 'utf8', function(err) {
			if (err)
				res.redirect('/:createUser');
			else {
				res.redirect('/');
				info('Création de l\'utilisateur' + req.body.username + 'réussie.'.blue);
			}
		});
	}
});

app.post('/[\:]import/*', function(req, res) {
    if (req.session.username) {
        var pa = req.originalUrl.split('/');
        pa.splice(0,2);
        pa.pop();
        pa = pa.join('/');
        req.files.upload.mv(path.join(basePath, pa, req.files.upload.name), function(err) {
            if (err) error(err.message)
            else info('File uploaded successfully')
            res.redirect('/'+pa);
        });
    } else {
        res.redirect('/');
    }
});

app.get('/[\:]trash*', function(req, res) {
    var pa = req.originalUrl.split('/');
    pa.splice(0,2);
    pa = pa.join('/');
    core.getDirContent(path.join(basePath, '../_trash', pa), function(err, data) {
        if (err) {error(err.message);res.redirect('/')}
        else {
            folders = [];files = [];
            for (var i=0;i < data.length;i++) {
                elt = data[i]
                switch (elt.type) {
                    case 'dir': folders.push(elt.name);break;
                    default: 
                        var icon;

                        if (/^video/.test(elt.type)) icon = 'film';
                        else if (/^audio/.test(elt.type)) icon = 'music';
                        else if (/^text/.test(elt.type)) icon= 'file-code';
                        else if (/^image/.test(elt.type)) icon = 'image'
                        else {
                            switch (elt.type){
                                case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
                                case 'application/vnd.ms-powerpoint':
                                    icon = 'file-powerpoint';break;
                                case 'application/msword':
                                case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                                    icon = 'file-word';break;
                                case 'application/vnd.ms-excel':
                                case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                                    icon = 'file-excel';break;
                                case 'application/pdf':
                                    icon = 'file-pdf';break;
                                case 'application/zip':
                                    icon = 'file-archive';break;
                                default: icon = 'file';
                            }
                        }
                        files.push({name: elt.name, icon: icon});
                }
            }
            res.render('index', {folders: folders, files: files, basePath: '/:trash/'+pa, trash: true});
        }
    });
});

app.post('/*', function(req, res) {
    if (req.body.action=='rm') {
        var pa = req.originalUrl;
        fs.move(path.join(basePath, pa, req.body.rm), path.join(basePath, '../_trash', req.body.rm), {overwrite: true}, function(err) {
            if (err) {
                error(err.message);
                res.send(err.message);
            }
            res.send('OK');
        });
    } else if (req.body.action=='mv') {
        var pa = req.originalUrl;
        fs.access(path.join(basePath, pa, req.body.newname), function(err) {
            if (err && err.code === 'ENOENT') {
                fs.move(path.join(basePath, pa, req.body.oldname), path.join(basePath, pa, req.body.newname), function(err) {
                    if (err) {error(err.message);res.send(err.message);}
                    else res.send('OK');
                });
            } else if (err) {
                error(err.message);res.send(err.message);
            } else {
                error("Impossible de déplacer le fichier")
                res.send('ERR');
            }
        })
    } else if (req.body.action=='empty') {
        fs.remove(path.join(basePath, '../_trash'), function(err) {
            if (err) {error(err.message);res.send(err.message);}
            else {
                info('Bin emptied');
                fs.mkdir(path.join(basePath, '../_trash'), function(err) {
                    if (err) {error(err.message);res.send(err.message);}
                    else res.send('OK');
                });
            }
        });
    } else if (req.body.action=='newfolder') {
        info('New folder')
        var pa = req.originalUrl;
        fs.mkdir(path.join(basePath, pa, req.body.name), function(err) {
            if (err) {error(err.message);res.send(err.message);}
            else res.send('OK');
        });
    }
});

app.get('/*', function(req, res) {
    if (!req.session.username) {
        res.redirect('/');
        return;
    }
    var pa = basePath + decodeURI(req.originalUrl);
    if (fs.statSync(pa).isDirectory()) {
        core.getDirContent(pa, function(err, data) {
            if (err) {error(err.message);res.redirect('/')}
            else {
                folders = [];files = [];
                for (var i=0;i < data.length;i++) {
                    elt = data[i]
                    switch (elt.type) {
                        case 'dir': folders.push(elt.name);break;
                        default: 
                            var icon;

                            if (/^video/.test(elt.type)) icon = 'film';
                            else if (/^audio/.test(elt.type)) icon = 'music';
                            else if (/^text/.test(elt.type)) icon= 'file-code';
                            else if (/^image/.test(elt.type)) icon = 'image'
                            else {
                                switch (elt.type){
                                    case 'application/vnd.openxmlformats-officedocument.presentationml.presentation':
                                    case 'application/vnd.ms-powerpoint':
                                        icon = 'file-powerpoint';break;
                                    case 'application/msword':
                                    case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
                                        icon = 'file-word';break;
                                    case 'application/vnd.ms-excel':
                                    case 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet':
                                        icon = 'file-excel';break;
                                    case 'application/pdf':
                                        icon = 'file-pdf';break;
                                    case 'application/zip':
                                        icon = 'file-archive';break;
                                    default: icon = 'file';
                                }
                            }
                            files.push({name: elt.name, icon: icon});
                    }
                }
                res.render('index', {folders: folders, files: files, basePath: req.originalUrl=='/'?req.originalUrl:decodeURI(req.originalUrl+'/'), trash: false});
            }
        });
    } else {
        res.sendFile(pa);
    }
});

app.listen(port, function() {
    info(('App listening on port ' + port + '...').blue);
})