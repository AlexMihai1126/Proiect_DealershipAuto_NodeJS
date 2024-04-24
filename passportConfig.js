const LocalUser = require('passport-local').Strategy;
const {Client} = require("pg");
const bcr = require("bcrypt");

var client= new Client({database:"mds",
        user:"alexm1126",
        password:"alex",
        host:"localhost",
        port:5432});
client.connect();

const authUser = function(email, parola, done){
    client.query(
        `SELECT * FROM utilizatori where email = $1`, [email], function(queryErr, queryRes){
            if(queryErr){
                throw queryErr;
            }else{
                if(queryRes.rows.length>0){
                    const user = queryRes.rows[0];

                    bcr.compare(parola, user.parola, function(err, isMatch){
                        if(err){
                            throw err;
                        }
                        if(isMatch){
                            return done(null, user); //stocheaza utilizatorul in session cookie
                        }else{
                            return done(null, false, {message:"Parolele nu se potrivesc."}); //nu autentificam utilizatorul daca nu se potrivesc parolele
                        }
                    })
                }else{
                    return done(null, false, {message:"Email-ul nu exista."});
                }
            }
        }
    )
}

function initializare(passport){
    passport.use(new LocalUser({
        usernameField: "email",
        passwordField: "parola"
    }, authUser)
    );
    passport.serializeUser(function(user, done){
        done(null, user.id); //stocheaza id-ul in sesiune
    });
    passport.deserializeUser(function(id, done){
        client.query(
            `SELECT * FROM utilizatori WHERE id=$1`, [id], function(queryErrId, queryResId){
                if(queryErrId){
                    throw queryErrId;
                }else{
                    return done(null, queryResId.rows[0]); //ia datele de utilizator bazate pe id
                }
            }
        )
    })
}

module.exports= initializare;