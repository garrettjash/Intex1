// Garrett Ashcroft, Zach Tullis, Zack Olsen, Jake McGuire
// Section 2 Group 5
// INTEX Fall 2023 Website
// This website is about social media and mental health.


const express = require("express");
const app = express();
const path = require("path");
const port = process.env.PORT || 3001;
require("dotenv").config()

// allows ejs files to be used
app.set("view engine", "ejs");
app.use(express.urlencoded({ extended: true }));

// connect to our static and bootsrap files
app.use(express.static(path.join(__dirname, 'css')));
app.use(express.static(path.join(__dirname, 'assets')));
app.use(express.static(path.join(__dirname, 'js')));

// connect to postgres database
const knex = require("knex")({
   client: "pg",
   connection: {
       host: "awseb-e-mqv6tpqdzn-stack-awsebrdsdatabase-p3dketgvaf73.chyqa0amj5ei.us-east-1.rds.amazonaws.com" || "127.0.0.1",
       user: process.env.RDS_USERNAME || "postgres",
       password: process.env.RDS_PASSWORD || "group2-5",
       database: process.env.RDS_DB_NAME || "ebdb",
       port: process.env.RDS_PORT || 5432,
       ssl: {
           rejectUnauthorized: false,
       }
   }
});

// createUser routes
app.get("/createUser", (req, res) => {
    res.render('createUser');
});

app.post('/createUser', (req, res) => {
    const { first_name, last_name, email, username, password } = req.body;

    // Check if the username is already in use
    knex('users')
        .where('username', username)
        .first()
        .then(existingUser => {
            if (existingUser) {
                // Username is already in use, show an error
                res.render('createUser', { error: 'Username already in use' });
            } else {
                // Username is not in use, proceed to add the new user
                return knex('users').insert({
                    first_name,
                    last_name,
                    email,
                    username,
                    password
                }).then(() => {
                        // User successfully added, redirect to the admin page
                        res.redirect('/admin');
                    });
            }
        })
        // .then(() => {
        //     // User successfully added, redirect to the admin page
        //     res.redirect('/admin');
        // })
        .catch(err => {
            console.log(err);
            // Handle different types of errors
            if (err.constraint === 'users_username_unique') {
                // If it's a validation error (username already in use), render the form with an error message
                res.render('createUser', { error: 'Username already in use' });
            } else {
                // If it's a server error, send a 500 response
                res.status(500).json({ error: ' Line 127 Internal Server Error' });
            }
        });
});

// Survey routes
app.get("/socialmedia", (req, res) => res.render("socialmedia"));

// inserts the survey data into our 4 tables
app.post("/socialmedia", async (req, res) => {
    try {
        // this block of code creates a timestamp and inserts that into the database 
        let currentDate = new Date();
                
        // Format the date and time as a string
        let year = currentDate.getFullYear();
        let month = String(currentDate.getMonth() + 1).padStart(2, '0');
        let day = String(currentDate.getDate()).padStart(2, '0');
        let hours = String(currentDate.getHours()).padStart(2, '0');
        let minutes = String(currentDate.getMinutes()).padStart(2, '0');
        let seconds = String(currentDate.getSeconds()).padStart(2, '0');

        let time = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

        const [user_id] = await knex("person")
            .insert({
                loc_id: '2', // 2 is the id of provo in our database
                timestamp: time, 
                age: req.body.age, 
                gender: req.body.gender, 
                rel_id: req.body.rel_id, 
                occ_id: req.body.occ_id, 
                use_social: req.body.use_social,
                time_id: req.body.time_id, 
            })
            .returning('user_id');

            // insert into user_platforms table
            const pltIds = req.body.platform_id;

            // If one or more boxes are checked, iterate through the array created in the form
            if (Array.isArray(pltIds) && pltIds.length > 0) {
                // Iterate over each platform id and insert into user_platforms
                for (let iCount = 0; iCount < pltIds.length; iCount++) {
                    const pltId = parseInt(pltIds[iCount]);
    
                    await knex("user_platforms").insert({
                        user_id: user_id.user_id,
                        platform_id: pltId,
                    });
                }
                // if no boxes were checked, insert a null value for platforms (0 in our database)
                } else {
                    await knex("user_platforms").insert({
                        user_id: user_id.user_id,
                        platform_id: 0,
                    });
                }
            
            // insert into user_organizations table
            const orgIds = req.body.org_id;

            // If one or more boxes are checked, iterate through the array created in the form
            if (Array.isArray(orgIds) && orgIds.length > 0) {
                // Iterate over each org_id and insert into user_organizations
                for (let iCount = 0; iCount < orgIds.length; iCount++) {
                    const orgId = parseInt(orgIds[iCount]);

                    await knex("user_organizations").insert({
                        user_id: user_id.user_id,
                        org_id: orgId,
                    });
                }
                // if no boxes were checked, insert a null value for organizations (0 in our database)
                } else {
                    await knex("user_organizations").insert({
                        user_id: user_id.user_id,
                        org_id: 0,
                    });
                }
      

        // Insert into the survey table
        await knex("survey").insert({
            user_id: user_id.user_id,
            no_purpose: req.body.no_purpose,
            distracted_busy: req.body.distracted_busy,  
            restless: req.body.restless, 
            distracted_general: req.body.distracted_general, 
            bothered_worried: req.body.bothered_worried, 
            difficult_concentrate: req.body.difficult_concentrate, 
            compare_people: req.body.compare_people, 
            feeling_comparison: req.body.feeling_comparison, 
            validation_social: req.body.validation_social, 
            depressed_down: req.body.depressed_down, 
            fluctuate_activities: req.body.fluctuate_activities, 
            sleep_issues: req.body.sleep_issues,
        });

        // redirect to index upon success, or give an error
        res.redirect("/");
    } catch (error) {
        console.error(error);
        res.status(500).send(" Line 230 Internal Server Error");
    }
});

// report routes

// Query to select table for reports page
const knexQuery  = knex.select(
    'person.user_id',
    'person.timestamp',
    'person.age',
    'person.gender',
    'relationships.rel_status as rel_status',
    'occupation.occ_status as occ_status',
    'organizations.aff_orgs',
    'person.use_social',
    'platforms.platform_name',
    'time.avg_time',
    'survey.no_purpose',
    'survey.distracted_busy',
    'survey.restless',
    'survey.distracted_general',
    'survey.bothered_worried',
    'survey.difficult_concentrate',
    'survey.compare_people',
    'survey.feeling_comparison',
    'survey.validation_social',
    'survey.depressed_down',
    'survey.fluctuate_activities',
    'survey.sleep_issues',
    'city.location'
)
.from('person')
.join('survey', 'survey.user_id', '=', 'person.user_id')
.join('user_organizations', 'person.user_id', '=', 'user_organizations.user_id')
.join('organizations', 'organizations.org_id', '=', 'user_organizations.org_id')
.join('user_platforms', 'user_platforms.user_id', '=', 'person.user_id')
.join('relationships', 'relationships.rel_id', '=', 'person.rel_id')
.join('occupation', 'occupation.occ_id', '=', 'person.occ_id')
.join('city', 'city.loc_id', '=', 'person.loc_id')
.join('time', 'time.time_id', '=', 'person.time_id')
.join('platforms', 'platforms.platform_id', '=', 'user_platforms.platform_id');

// report get request
app.get('/report', (req, res) => {
    const knexQuery1 = knexQuery.clone();

    knexQuery1.then(result => {
        // Now 'res' is defined and can be used to render the template
        res.render("report", { results: result }); //{ results: result, user_id: user_id });
    })
});



// report route for the non-admin view
app.get('/userReport/:admin_id', (req, res) => {
    const adminId = req.params.admin_id
    const knexQuery3 = knexQuery.clone();

    knexQuery3.then(result => {
        // Now 'res' is defined and can be used to render the template
        res.render("userReport", { results: result, adminId: adminId });
    }).catch(error => {
        console.error('Error fetching data:', error);
        res.render("userReport", { adminId : adminId, results: [], error: error.message });
    });
});


// index route
app.get("/", (req, res) => res.render("index"));

// admin landing page route
app.get("/admin", (req, res) => {
    res.render('admin', { admin_id: 1 });
});

// tableau dashboard route
app.get("/insights", (req, res) => res.render('insights'));

// Edit user route passing admin id as a param
app.get("/editUser/:admin_id", (req, res) => {
    const adminId = req.params.admin_id;

    knex.select(
        "admin_id", 
        "first_name", 
        "last_name", 
        "email", 
        "username", 
        "password").from("users").where("admin_id", adminId).then(userInfo => {
        res.render("editUser", {userInfo: userInfo, adminId: adminId})
        }).catch(err => {
            console.log(err);
            res.status(500).json({err});
        })
});

app.post("/editUser/:admin_id", (req, res) => {
    const adminId = req.params.admin_id;
    const newUsername = req.body.username

    // Update the user information
    knex("users")
        .where("admin_id", adminId)
        .update({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            username: req.body.username,
            password: req.body.password
        })
        .then(updatedUserInfo => {
            // Render the editUser view with the updated user information
            res.render("userLanding", { adminId: adminId});
        }).catch(err => {
            console.log(err);
            res.status(500).json({ err });
        });
});

// used in the users table
const knexQuery2 = knex
  .select('admin_id', 'first_name', 'last_name', 'email', 'username', 'password')
  .from('users')
  .orderBy('users.admin_id', 'asc');

// Execute the query and pass the result to the view
app.get('/adminManage', (req, res) => {
    // Your database query using knex
    knexQuery2
      .then(users => {
        res.render('adminManage', { users });
      })
      .catch(error => {
        console.error('Error fetching data:', error);
        res.status(500).send('Line 466 Internal Server Error');
      });
  });

// User landing route passing their admin_id as a paramater
app.get('/userLanding/:admin_id', (req, res) => {
    const adminId = req.params.admin_id;
    // use the adminId in the route logic

    knex.select("first_name").from("users").where("admin_id", adminId).then(userInfo => {
        const first_name = userInfo.first_name
        res.render('userLanding', { first_name: first_name, adminId: adminId })
    }).catch(err => {
        console.log(err);
        res.status(500).json({err});
    });
});

app.post('/userLanding/:admin_id', (req, res) => {
    const adminId = req.params.admin_id;
    // Your logic for handling the POST request to /userLanding/:admin_id goes here
    res.render("userLanding", { adminId: adminId});
});

// login route to retrieve usernames
app.get("/login", (req, res) => {
    // Select all usernames from the "users" table
    knex.select("username").from("users").then(usernamesInfo => {
        res.render("login", { usernamesInfo: usernamesInfo });
      }).catch((err) => {
        console.log(err);
        res.status(500).json({err});
      });
  });

// submits login form and checks credentials against the database
app.post("/login", (req, res) => {
    const sAdminUsername = 'admin'
    const sAdminPassword = 'admin'
    const username = req.body.username
    const password = req.body.password

    if (username == sAdminUsername && password == sAdminPassword)
    {
        const admin_id = 1
        res.render('admin.ejs', { admin_id: admin_id })
    }
    else {
        knex('users')
        .where('username', username)
        .andWhere('password', password)
        .select('first_name', 'admin_id')
        .first()
        .then(results => {
            if (results) {
                const first_name = results.first_name;
                const adminId = results.admin_id;
                res.render('userLanding', {first_name, adminId: adminId });
            } else {
                res.render('login', { error: "Invalid username or password" });

            }
        })
    }});

// Edit user route passing admin id as a param
app.get("/adminEdit/:admin_id", (req, res) => {
    const admin_id = req.params.admin_id;

    knex.select(
        "admin_id", 
        "first_name", 
        "last_name", 
        "email", 
        "username", 
        "password").from("users").where("admin_id", admin_id).then(userInfo => {
        res.render("adminEdit", {userInfo: userInfo, admin_id: admin_id})
        }).catch(err => {
            console.log(err);
            res.status(500).json({err});
        })
});

// User landing route and Edit user route passing admin id as a parameter
app.post("/adminEdit/:admin_id", (req, res) => {
    const admin_id = req.params.admin_id;

    // Update the user information
    knex("users")
        .where("admin_id", admin_id)
        .update({
            first_name: req.body.first_name,
            last_name: req.body.last_name,
            email: req.body.email,
            username: req.body.username,
            password: req.body.password
        })
        .then(updatedUserInfo => {
            // Render the editUser view with the updated user information
            knexQuery2
            .then(users => {
              res.render('adminManage', { users });
            })
        }).catch(err => {
            console.log(err);
            res.status(500).json({ err });
        });
});

app.post("/adminManage/:admin_id", (req, res) => {
    const sAdminUsername = 'admin'
    const sAdminPassword = 'admin'
    const username = req.body.username
    const password = req.body.password

        knex('users')
        .where('username', username)
        .andWhere('password', password)
        .select('first_name', 'admin_id')
        .first()
        .then(results => {
            const first_name = results.first_name;
            const adminId = results.admin_id;
            res.render('adminEdit', {first_name, adminId: adminId });
        })
    });

    // Add a route to handle delete requests
    app.post("/adminDelete/:admin_id", (req, res) => {
    const admin_id = req.params.admin_id;

    // Use knex to delete the user record
    knex("users")
        .where("admin_id", admin_id)
        .del()
        .then(() => {
            // Redirect to the adminManage page after deletion
            res.redirect("/adminManage");
        })
        .catch(err => {
            console.log(err);
            res.status(500).json({ err });
        });
});

app.post("/searchUser/:user_id", (req, res) => {
    const user_id = req.body.user_id; // Assuming you meant to use 'username' here

    // Assuming your existing `knexQuery` is something like this
    knexQuery
        .where('username', user_id)
        .select('*')
        .first()
        .then(results => {
                // If a user with the specified username and password is found
                const user_id = results.user_id;
                res.render('userDetails', { user_id: user_id });
        })
});


// Edit user route passing user_id as a param
app.get("/userDetails/:user_id", (req, res) => {
    const user_id = req.params.user_id;
    const knexQuery4 = knexQuery.clone();

    knexQuery4
        .where('person.user_id', user_id) // Assuming 'user_id' is the correct column name
        .select('*')
        .then(results => {
            //if (results && results.length > 0) {
                // If a user with the specified user_id is found
                res.render('userDetails', { results: results }); // Pass the result to the view
            // } else {
            //     // Handle case when user is not found
            //     res.status(404).send('User not found');
            // }
        })})


// This is from the user profile to search surveys
app.post("/searchUser/:user_id", (req, res) => {
    // Assuming you meant to use 'user_id' instead of 'username'
    const user_id = req.params.user_id;

    // Assuming your existing `knexQuery` is something like this
    knexQuery
        .where('user_id', user_id) // Assuming 'user_id' is the correct column name
        .select('*')
        .first()
        .then(results => {
            if (results) {
                // If a user with the specified user_id is found
                res.render('userViewDetails', { results: results }); // Pass the result to the view
            } else {
                // Handle case when user is not found
                res.status(404).send('User not found');
            }
        });
});

// Edit user route passing user_id as a param
app.get("/userViewDetails/:user_id", (req, res) => {
    const user_id = req.params.user_id;
    const knexQuery4 = knexQuery.clone();

    knexQuery4
        .where('person.user_id', user_id) // Assuming 'user_id' is the correct column name
        .select('*')
        .then(results => {
            if (results && results.length > 0) {
                // If a user with the specified user_id is found
                res.render('userViewDetails', { results: results }); // Pass the result to the view
            } else {
                // Handle case when user is not found
                res.status(404).send('User not found');
            }
        });
});





app.listen(port, () => console.log("The server is listening for a client"));