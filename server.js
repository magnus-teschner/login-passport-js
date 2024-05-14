const express = require("express");
const path = require("path");
const session = require("express-session");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const mysql = require('mysql2');
const bcrypt = require('bcryptjs');

const con = mysql.createConnection({
	host     : 'localhost',
	user     : 'admin',
	password : 'admin',
	database : 'login'
});


const app = express();
app.use(express.static('public'));

app.set("views", 'public/views');
app.set("view engine", "ejs");

app.use(session({ secret: "cats", resave: false, saveUninitialized: true }));
app.use(passport.session());
app.use(express.urlencoded({ extended: false }));

passport.use(
    new LocalStrategy({usernameField: 'email', passwordField: 'password'}, async (email, password, done) => {
        try {
            const query_retrieve = 'SELECT * FROM accounts WHERE email = ?';
            const values = [email];
            
            
            con.query(query_retrieve, values, async (err, result) => {
                if (err) {
                    return done(err);
                }
    
                if (!result || result.length === 0) {
                    return done(null, false, { message: "Incorrect email" });
                }
    
                const db_first = result[0].firstname;
                const db_last = result[0].lastname;
                const db_email = result[0].email;
                const db_password = result[0].password;
    
                try {
                    const match = await bcrypt.compare(password, db_password);
                    if (!match) {
                        // passwords do not match!
                        return done(null, false, { message: "Incorrect password" })
                    } else {            
                        let user = { firstname: db_first, lastname: db_last, email: db_email };
                        return done(null, user);
                    }
                } catch (bcryptError) {
                    return done(bcryptError);
                }
            });
            
        } catch(err) {
            return done(err);
        }
    })
);


passport.serializeUser((user, done) => {
    done(null, user.email);
});

passport.deserializeUser(async (email, done) => {
try {
    const query_retrieve = 'SELECT * FROM accounts WHERE email = ?';
    const values = [email];
    con.query(query_retrieve, values, (err, result) => {
        const db_first = result[0].firstname;
        const db_last = result[0].lastname;
        const db_email = result[0].email;

        
        let user = { firstname: db_first, lastname: db_last, email: db_email }
        return done(null, user);
    });
} catch(err) {
    done(err);
};
});


app.post(
    "/log-in",
    passport.authenticate("local", {
      successRedirect: "/",
      failureRedirect: "/",
      failureMessage: true
    })
);


app.get("/log-out", (req, res, next) => {
    req.logout((err) => {
      if (err) {
        return next(err);
      }
      res.redirect("/");
    });
  });
  


  app.get("/", (req, res) => {
    try {
        let error = req.session.messages.length > 0 ? req.session.messages[req.session.messages.length - 1] : undefined;
        res.render("index", { user: req.user, error: error });
    } catch (error) {
        res.render("index", { user: req.user, error: undefined });
    }
});


app.get("/sign-up", (req, res) => res.render("sign-up-form", { error: undefined}));

app.post("/sign-up", (req, res, next) => {
    try {
        let query_check = "SELECT * FROM accounts WHERE email = ?";
        const values_check = [req.body.email];

        con.query(query_check, values_check, (err, result) => {
            if (err) {
                return next(err);
            }

            if (result.length > 0) {
                return res.render("sign-up-form", { error: "Email already in use."} )
            }

            bcrypt.hash(req.body.password, 10, async (err, hashedPassword) => {
                // If the email is not in use, proceed with the insertion
                let query_insert = "INSERT INTO accounts (firstname, lastname, email, password) VALUES (?,?,?,?)";
                const values_insert = [req.body.fname, req.body.lname, req.body.email, hashedPassword];

                con.query(query_insert, values_insert, (err) => {
                    if (err) {
                        return next(err);
                    }
                    res.redirect("/");
                });
              });   
        });
    } catch (error) {
        next(error);
    }
});


  
app.listen(3000, () => console.log("app listening on port 3000!"));