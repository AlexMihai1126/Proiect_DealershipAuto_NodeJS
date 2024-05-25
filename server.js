require('dotenv').config({ path: "/" });
const express = require("express");
const app = express();
const { Client } = require("pg");
const bcr = require("bcrypt");
const session = require("express-session");
const flash = require("express-flash");
const passport = require("passport");
const initPassport = require("./passportConfig");
const formidable = require('formidable');
const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
    dialect: 'postgres',
    database: process.env.DB_NAME,
    username: process.env.DB_USER,
    password: process.env.DB_PASS,
    host: process.env.DB_ADDR,
    port: process.env.DB_PORT,
    ssl: true,
});

initPassport(passport);

var client = new Client({
    database: `${process.env.DB_NAME}`,
    user: `${process.env.DB_USER}`,
    password: `${process.env.DB_PASS}`,
    host: `${process.env.DB_ADDR}`,
    port: process.env.DB_PORT
});
client.connect();

const PORT = process.env.PORT || 32767;

app.set("view engine", "ejs");

app.use("/static", express.static(__dirname + "/static"));

app.use(express.urlencoded({ extended: false }));
app.use(session({
    secret: 'secret', //cheie de criptre sesiune
    resave: false,
    saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.get(["/", "/home", "/index"], function (req, res) {
    client.query(`SELECT id_masina FROM masina WHERE id_masina NOT IN (SELECT masina_id FROM rezervare)`, function (err, resId) {
        if (err) {
            console.log(err);
        } else {
            if (resId.rowCount < 3) {
                res.render("pages/index", { nr_rez: 0 });
            } else {
                let ids = resId.rows.map(row => row.id_masina);
                let random_ids = [];

                for (let i = 0; i < 3; i++) {
                    let randomIndex = Math.floor(Math.random() * ids.length);
                    random_ids.push(ids[randomIndex]);
                    ids.splice(randomIndex, 1);
                }

                let query = `SELECT id_masina, brand, model, pret, imagine FROM masina WHERE id_masina IN (${random_ids})`;

                client.query(query, function (errQ, resQ) {
                    if (errQ) {
                        console.log(errQ);
                    } else {
                        res.render("pages/index", { masini_afis: resQ.rows });
                    }
                });
            }
        }
    });
})

app.get("/utilizator/signup", isAuth, function (req, res) {
    res.render("pages/signup");
});


app.get("/utilizator/login", isAuth, function (req, res) {
    res.render("pages/login");
});

app.get(["/stoc", "/masini"], function (req, res) {
    let brands = [];
    let pretMinMax = [];
    let kmMinMax = [];
    client.query(
        `SELECT m.id_masina, m.brand, m.model, m.vin, m.pret, m.an_fabricatie, m.accident, m.km, m.descriere, m.imagine FROM masina m WHERE m.id_masina NOT IN (SELECT masina_id FROM rezervare)`, function (queryErr, queryRes) {
            if (queryErr) {
                throw queryErr;
            } else {
                client.query("select min(pret), max(pret) from masina", function (err, rezPret) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        pretMinMax = rezPret.rows;
                    }
                });

                client.query("select min(km), max(km) from masina", function (err, rezKm) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        kmMinMax = rezKm.rows;
                    }
                });
                client.query("select * from unnest(enum_range(null::brands))", function (err, rezBrand) {
                    if (err) {
                        console.log(err);
                    }
                    else {
                        brands = rezBrand.rows;
                    }
                });
                console.log(brands);
                console.log(pretMinMax);
                console.log(kmMinMax);
                res.render("pages/masini", { masini: queryRes.rows, carCount: queryRes.rowCount,carBrands: brands,priceRange: pretMinMax,kmRange:kmMinMax});
            }
        });
});

app.get("/masini/rezerva/:id_masina", isNotAuth_rezervare, function (req, res) {
    client.query(`select * from masina where id_masina = ${req.params.id_masina} `, function (errSelect, rezSelect) {
        if (errSelect) {
            console.log(errSelect);
        } else {
            if (rezSelect.rowCount == 0) {
                res.render("pages/eroare", { err: "Masina nu exista!!!" });
            } else {
                client.query(`insert into rezervare(user_id,masina_id,data) values (${req.user.id},${req.params.id_masina},${new Date().getTime()})`, function (err_ins, rez_ins) {
                    if (err_ins) {
                        console.log(err_ins);
                        res.render("pages/eroare", { err: "A aparut o eroare in rezervarea masinii!" });
                    } else {
                        res.render("pages/confirmare", { masina: rezSelect.rows[0] });
                    }
                })
            }

        }
    });
});

app.get("/masini/detalii/:id_masina", function (req, res) {
    client.query(`select * from masina where id_masina = ${req.params.id_masina} `, function (errSelect, rezSelect) {
        if (errSelect) {
            console.log(errSelect);
        } else {
            if (rezSelect.rowCount == 0) {
                res.render("pages/eroare", { err: "Masina nu exista!!!" });
            } else {
                res.render("pages/detalii", { masina: rezSelect.rows[0] });
            }
        }
    })
}
);

app.get("/utilizator/home", isNotAuth, function (req, res) {
    if (req.user.rol == 1) {
        res.redirect("/admin/home");
    } else {
        client.query(`SELECT m.id_masina, m.brand, m.model, r.data, m.vin FROM masina m JOIN rezervare r on (m.id_masina=r.masina_id) WHERE r.user_id=${req.user.id}`, function (err, rez) {
            if (err) {
                console.log(err);
            }
            res.render("pages/useracc", { user_email: req.user.email, user_nume: req.user.nume, rezervari: rez.rows, nr_rez: rez.rowCount });
        });
    };

});

app.get("/admin/home", isNotAuth, function (req, res) {
    if (req.user.rol == 1) {
        client.query(`SELECT id_masina, brand, model, vin FROM masina`, function (errMasina, rezMasina) {
            if (errMasina) {
                console.log(errMasina);
            }
            client.query(`SELECT m.id_masina, m.brand, m.model, m.vin, r.data, u.email FROM masina m JOIN rezervare r on (m.id_masina=r.masina_id) JOIN utilizatori u on (u.id = r.user_id)`, function (errRez, queryRez) {
                if (errRez) {
                    console.log(errRez);
                }
                res.render("pages/admin", { admin_email: req.user.email, rezervari: queryRez.rows, masini: rezMasina.rows, nr_rez: queryRez.rowCount, nr_m: rezMasina.rowCount });
            })
        })
    } else {
        res.redirect("/utilizator/home");
    }
})


app.get("/utilizator/logout", function (req, res, next) {
    req.logOut(function (err) {
        if (err) {
            return next(err);
        }
        req.flash('succes', "Te-ai delogat de pe site.");
        res.redirect("/utilizator/login");
    });
});

app.get("/eroare", function (req, res) {
    res.render("pages/eroare", { err: "A aparut o eroare" });
});

app.get("/authErr", function (req, res) {
    res.render("pages/eroare", { err: "Nu esti logat pe site, nu poti rezerva o masina." });
});


app.post("/utilizator/signup", async function (req, res) {
    const form = new formidable.IncomingForm();

    form.parse(req, async function (errForm, fields) {
        if (errForm) {
            console.error('Error parsing form:', errForm);
            return res.status(500).send('Internal Server Error');
        }
        let err = []; //vectorul de erori pe care il vom trimite catre ejs pt afisare
        if (!fields.nume[0] || !fields.prenume[0] || !fields.email[0] || !fields.parola[0] || !fields.parola_conf[0]) {
            err.push({ mesaj: "Va rugam introduceti toate datele necesare!" });
        }; //daca nu exista da eroare (am rezolvat cu validare la nivel de formular)

        if (fields.parola[0].length < 8) {
            err.push({ mesaj: "Parola trebuie sa aiba minim 8 caractere!" });
        }

        if (fields.parola[0] !== fields.parola_conf[0]) {
            err.push({ mesaj: "Parolele nu se potrivesc!" });
        }

        if (err.length > 0) {
            res.render("pages/signup", { err }); //daca avem erori vom regenera pagina cu erorile afisate
        } else {
            let hashPass = await bcr.hash(fields.parola[0], 10); //cripteaza parola cu 10 runde de criptare in algoritm
            client.query(
                `SELECT * FROM utilizatori WHERE email = $1`, [fields.email[0]], function (queryErr, queryRez) {
                    if (queryErr) {
                        throw queryErr;
                    }

                    if (queryRez.rows.length > 0) {
                        err.push({ mesaj: "Deja ai un cont la noi pe site! Acest email deja exista in baza de date." });
                        res.render("pages/signup", { err });
                    } else {
                        client.query(
                            `INSERT INTO utilizatori (nume, prenume, email, parola, telefon, adresa) values($1, $2, $3, $4, $5, $6) RETURNING id, parola`, [fields.nume[0], fields.prenume[0], fields.email[0], hashPass, fields.tel[0], fields.addr[0]], function (queryErrIns, queryResIns) {
                                if (queryErrIns) {
                                    throw queryErrIns;
                                } //cererea in baza de date care introduce noul user
                                req.flash("succes", "Contul a fost creat");
                                res.redirect("/utilizator/login"); //redirectioneaza catre pagina de login
                            }
                        )
                    }
                }
            )
        }
    });
});


app.post("/utilizator/login", passport.authenticate('local', {
    successRedirect: '/utilizator/home',
    failureRedirect: '/utilizator/login',
    failureFlash: true
})); //folosim libraria passport pentru a autentifica utilizatorul si crea cookie-ul

app.post("/stergeRezervare/:id_masina", isNotAuth, function (req, res) {
    client.query(`DELETE FROM rezervare where masina_id=${req.params.id_masina}`, function (err, rez) {
        if (err) {
            console.log(err);
        }
        res.redirect("/utilizator/home");
    });
});

app.post("/stergeMasina/:id_masina", isNotAuth, function (req, res) {
    if (req.user.rol == 1) {
        client.query(`DELETE FROM masina where id_masina=${req.params.id_masina}`, function (err, rez) {
            if (err) {
                console.log(err);
            }
            res.redirect("/admin/home");
        });
    } else {
        res.redirect("/utilizator/home");
    }

});


function isAuth(req, res, next) {
    if (req.isAuthenticated()) {
        return res.redirect("/utilizator/home");
    }
    next();
}

function isNotAuth(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/utilizator/login");
}

function isNotAuth_rezervare(req, res, next) {
    if (req.isAuthenticated()) {
        return next();
    }
    res.redirect("/authErr");
}

app.listen(PORT, () => {
    console.log(`Serverul a pornit, port: ${PORT}`);
});