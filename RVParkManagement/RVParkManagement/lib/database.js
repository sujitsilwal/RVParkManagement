let mysql = require('mysql2');

var dbConnectionInfo = require('./connectionInfo');

var con = mysql.createConnection({
  host: dbConnectionInfo.host,
  user: dbConnectionInfo.user,
  password: dbConnectionInfo.password,
  port: dbConnectionInfo.port,
  multipleStatements: true              // Needed for stored proecures with OUT results
});

con.connect(function (err) {
  if (err) {
    throw err;
  }
  else {
    console.log("database.js: Connected to server!");

    con.query("CREATE DATABASE IF NOT EXISTS RVPark", function (err, result) {
      if (err) {
        console.log(err.message);
        throw err;
      }
      console.log("database.js: RVPark database created if it didn't exist");
      selectDatabase();
    });
  }
});

function selectDatabase() {
  let sql = "USE RVPark";
  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: Selected RVPark database");
      createTables();
      createStoredProcedures();
      //addTableData();
      addDummyData();
    }
  });
}

function createTables() {
  //Resets everything so I dont have to do it manually, we will comment this out later
  // let sql = "DROP DATABASE rvpark"
  // con.execute(sql, function (err, results, fields) {
  //   if (err) {
  //     console.log(err.message);
  //     throw err;
  //   } else {
  //     console.log("database.js: user types created if it didn't exist");
  //   }
  // });

  // sql = "DROP DATABASE nodeexpresssessionstorage"
  // con.execute(sql, function (err, results, fields) {
  //   if (err) {
  //     console.log(err.message);
  //     throw err;
  //   } else {
  //     console.log("database.js: user types created if it didn't exist");
  //   }
  // });


  let sql = "CREATE TABLE IF NOT EXISTS user_types (\n" +
    "user_type_id INT NOT NULL AUTO_INCREMENT, \n" +
    "user_type VARCHAR(25) NOT NULL,\n" +
    "PRIMARY KEY (user_type_id)\n" +
    ")";
  con.execute(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: table user types created if it didn't exist");
    }
  });

  //We can make tables to pull from for Rank, DOD_Affiliation, and DOD_Status later, to avoid inconsistent data
  sql = "CREATE TABLE IF NOT EXISTS users (\n" +
    "user_id INT(6) ZEROFILL NOT NULL AUTO_INCREMENT,\n" +
    "username varchar(45) NOT NULL,\n" +
    "first_name VARCHAR(255) NOT NULL,\n" +
    "last_name VARCHAR(255) NOT NULL,\n" +
    "email VARCHAR(255) NOT NULL,\n" +
    "phone_number VARCHAR(40),\n" +
    "hashed_password VARCHAR(255) NOT NULL,\n" +
    "salt VARCHAR(255) NOT NULL,\n" +
    "street_address VARCHAR(40),\n" +
    "city VARCHAR(40),\n" +
    "state VARCHAR(30),\n" +
    "zip VARCHAR(10),\n" +
    "dod_affiliation VARCHAR(45) NOT NULL,\n" +
    "dod_status VARCHAR(45) NOT NULL,\n" +
    "military_rank VARCHAR(45),\n" +
    "user_role_id INT NOT NULL, \n" +
    "FOREIGN KEY (user_role_id) REFERENCES user_types(user_type_id),\n" +
    "PRIMARY KEY (user_id)\n" +
    ");";
  con.execute(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: table users created if it didn't exist");
    }
  });


  //Like RV Parking or Tent Reservation
  sql = "CREATE TABLE IF NOT EXISTS reservation_types (\n" +
    "reservation_type_id INT NOT NULL AUTO_INCREMENT, \n" +
    "reservation_type VARCHAR(45) NOT NULL,\n" +
    "reservation_type_description VARCHAR(255), \n" +
    "PRIMARY KEY (reservation_type_id)\n" +
    ");";
  con.execute(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: table reservation_types created if it didn't exist");
    }
  });


  sql = "CREATE TABLE IF NOT EXISTS sites (\n" +
    "site_id INT(5) ZEROFILL NOT NULL AUTO_INCREMENT,\n" +
    "site_number INT NOT NULL,\n" +
    "max_size INT, \n" +
    "price_per_night INT NOT NULL, \n" +
    "site_status VARCHAR(45) NOT NULL, \n" +
    "reservation_type_id INT NOT NULL, \n" +
    "PRIMARY KEY (site_id), \n" +
    "FOREIGN KEY (reservation_type_id) REFERENCES reservation_types(reservation_type_id)\n" +
    ") AUTO_INCREMENT = 10001";
  con.execute(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: table sites created if it didn't exist");
    }
  });


  sql = "CREATE TABLE IF NOT EXISTS managing_sites_log (\n" +
    "log_id INT NOT NULL AUTO_INCREMENT,\n" +
    "user_id INT(6) ZEROFILL NOT NULL, \n" +
    "site_id INT(5) ZEROFILL NOT NULL, \n" +
    "log_date date NOT NULL, \n" +
    "note VARCHAR(255), \n" +
    "PRIMARY KEY (log_id), \n" +
    "FOREIGN KEY (user_id) REFERENCES users(user_id),\n" +
    "FOREIGN KEY (site_id) REFERENCES sites(site_id)\n" +
    ")";
  con.execute(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: table managing_sites_log created if it didn't exist");
    }
  });

  sql = "CREATE TABLE IF NOT EXISTS payments (\n" +
    "payment_id INT NOT NULL AUTO_INCREMENT,\n" +
    "card_number VARCHAR(16) NOT NULL, \n" +
    "amount DECIMAL(15,2) NOT NULL, \n" +
    "payment_date DATE NOT NULL, \n" +
    "payment_status VARCHAR(45) NOT NULL, \n" +
    "reason VARCHAR(45) NOT NULL, \n" +
    "user_id INT(6) ZEROFILL NOT NULL, \n" +
    "PRIMARY KEY (payment_id), \n" +
    "FOREIGN KEY (user_id) REFERENCES users(user_id)\n" +
    ")";
  con.execute(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: table payments created if it didn't exist");
    }
  });


  sql = "CREATE TABLE IF NOT EXISTS reservation_status (\n" +
    "reservation_status_id INT NOT NULL AUTO_INCREMENT,\n" +
    "status VARCHAR(45) NOT NULL, \n" +
    "PRIMARY KEY (reservation_status_id)\n" +
    ")";
  con.execute(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: table reservation_status created if it didn't exist");
    }
  });


  sql = "CREATE TABLE IF NOT EXISTS reservations (\n" +
    "reservation_id INT(7) NOT NULL AUTO_INCREMENT,\n" +
    "user_id INT(6) ZEROFILL NOT NULL,\n" +
    "reservation_type_id INT NOT NULL, \n" +
    "site_id INT(5) ZEROFILL NOT NULL, \n" +
    "payment_id INT NOT NULL, \n" +
    "rv_size DECIMAL(5,2), \n" +
    "date_of_reservation DATE NOT NULL, \n" +
    "reservation_status_id INT NOT NULL, \n" +
    "from_date DATE NOT NULL, \n" +
    "to_date DATE NOT NULL, \n" +
    "PRIMARY KEY (reservation_id), \n" +
    "FOREIGN KEY (user_id) REFERENCES users(user_id),\n" +
    "FOREIGN KEY (reservation_type_id) REFERENCES reservation_types(reservation_type_id),\n" +
    "FOREIGN KEY (site_id) REFERENCES sites(site_id),\n" +
    "FOREIGN KEY (reservation_status_id) REFERENCES reservation_status(reservation_status_id),\n" +
    "FOREIGN KEY (payment_id) REFERENCES payments(payment_id)\n" +
    ") AUTO_INCREMENT=1000001";

  con.execute(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: table reservations created if it didn't exist");
    }
  });


  sql = "CREATE TABLE IF NOT EXISTS holiday_dates (\n" +
    "holiday_date_id INT NOT NULL AUTO_INCREMENT,\n" +
    "holiday_date DATE NOT NULL, \n" +
    "holiday_description VARCHAR(255), \n" +
    "PRIMARY KEY (holiday_date_id)\n" +
    ")";
  con.execute(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: table holiday_dates created if it didn't exist");
    }
  });



}

function createStoredProcedures() {

  let sql =
    "CREATE PROCEDURE IF NOT EXISTS `register_user`(\n" +
    "IN newUsername VARCHAR(45),\n" +
    "IN newFirstName VARCHAR(255),\n" +
    "IN newLastName VARCHAR(255),\n" +
    "IN newEmail VARCHAR(255),\n" +
    "IN newPhoneNumber VARCHAR(40),\n" +
    "IN newHashedPassword VARCHAR(255),\n" +
    "IN newSalt VARCHAR(255),\n" +
    "IN newStreetAddress VARCHAR(40),\n" +
    "IN newCity VARCHAR(40),\n" +
    "IN newState VARCHAR(30),\n" +
    "IN newZIP VARCHAR(10),\n" +
    "IN newDodAffiliation VARCHAR(255),\n" +
    "IN newDodStatus VARCHAR(25),\n" +
    "IN newRank VARCHAR(40),\n" +
    "IN newUserRoleId VARCHAR(50),\n" +
    "OUT result INT\n" +
    ")\n" +
    "BEGIN\n" +
    "DECLARE usernameCount INT;\n" +
    "DECLARE emailCount INT;\n" +
    "SET result = 0;\n" +
    "SELECT COUNT(*) INTO usernameCount\n" +
    "FROM users\n" +
    "WHERE username = newUsername;\n" +
    "SELECT COUNT(*) INTO emailCount\n" +
    "FROM users\n" +
    "WHERE email = newEmail;\n" +
    "IF usernameCount > 0 THEN\n" +
    "    SET result = 1;\n" +
    "ELSEIF emailCount > 0 THEN\n" +
    "    SET result = 2;\n" +
    "ELSE\n" +
    "    INSERT INTO users (username, first_name, last_name, email, phone_number, hashed_password, salt, street_address, city, state, zip, dod_affiliation, dod_status, military_rank, user_role_id)\n" +
    "    VALUES (newUsername, newFirstName, newLastName, newEmail, newPhoneNumber, newHashedPassword, newSalt, newStreetAddress, newCity, newState, newZIP, newDodAffiliation, newDodStatus, newRank,\n" +
    "    (SELECT user_type_id FROM user_types WHERE user_types.user_type = newUserRoleId LIMIT 1));\n" +
    "END IF;\n" +
    "END;";

  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: procedure register_user created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `get_salt`(\n" +
    "IN username VARCHAR(255)\n" +
    ")\n" +
    "BEGIN\n" +
    "SELECT salt FROM users\n" +
    "WHERE users.username = username\n" +
    "LIMIT 1;\n" +
    "END;";
  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: procedure get_salt created if it didn't exist");
    }
  });


  sql = "CREATE PROCEDURE IF NOT EXISTS `check_credentials`(\n" +
    "IN username VARCHAR(255),\n" +
    "IN hashed_password VARCHAR(255)\n" +
    ")\n" +
    "BEGIN\n" +
    "SELECT EXISTS(\n" +
    "SELECT * FROM users\n" +
    "WHERE users.username = username AND users.hashed_password = hashed_password\n" +
    ") AS result;\n" +
    "END;";

  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: procedure check_credentials created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `change_password`(\n" +
    "IN username VARCHAR(255),\n" +
    "IN new_password_hash VARCHAR(255),\n" +
    "IN new_password_salt VARCHAR(255)\n" +
    ")\n" +
    "BEGIN\n" +
    "UPDATE users SET users.hashed_password = new_password_hash WHERE users.username = username;\n" +
    "UPDATE users SET users.salt = new_password_salt WHERE users.username = username;\n" +
    "END;";

  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: procedure change_password created if it didn't exist");
    }
  });


  sql = "CREATE PROCEDURE IF NOT EXISTS `insert_user_type`(\n" +
    "IN user_type VARCHAR(45)\n" +
    ")\n" +
    "BEGIN\n" +
    "INSERT INTO user_types (user_type)\n" +
    "SELECT user_type FROM DUAL\n" +
    "WHERE NOT EXISTS (\n" +
    "SELECT * FROM user_types\n" +
    "WHERE user_types.user_type=user_type LIMIT 1\n" +
    ");\n" +
    "END;";
  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: procedure insert_user_type created if it didn't exist");
    }
  });


  sql = "CREATE PROCEDURE IF NOT EXISTS `get_reservations`(\n" +
    "IN userId INT,\n" +
    "IN new_reservation_status VARCHAR(45)\n" +
    ")\n" +
    "BEGIN\n" +
    "DECLARE length INT;\n" +
    "SELECT reservations.reservation_id, reservation_status.status, reservation_types.reservation_type,  \n" +
    "reservations.rv_size, sites.site_number, \n" +
    "DATE_FORMAT(reservations.date_of_reservation, '%a %b %d %Y') AS reservation_date, \n" +
    "DATEDIFF(reservations.to_date, reservations.from_date) AS length, \n" +
    "reservations.from_date, reservations.to_date\n" +
    "FROM reservations \n" +
    "INNER JOIN reservation_status ON reservations.reservation_status_id = reservation_status.reservation_status_id\n" +
    "INNER JOIN reservation_types ON reservations.reservation_type_id = reservation_types.reservation_type_id\n" +
    "INNER JOIN sites ON reservations.site_id = sites.site_id\n" +
    "WHERE reservations.user_id = userId AND (new_reservation_status = '' OR reservation_status.status = new_reservation_status)\n" +
    "ORDER BY reservations.from_date, reservations.to_date, sites.site_number;\n" +
    "END;";

  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: procedure get_reservations created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `insert_reservation_type`(\n" +
    "IN reservation_type VARCHAR(45)\n" +
    ")\n" +
    "BEGIN\n" +
    "INSERT INTO reservation_types(reservation_type)\n" +
    "SELECT reservation_type FROM DUAL\n" +
    "WHERE NOT EXISTS (\n" +
    "SELECT * FROM reservation_types\n" +
    "WHERE reservation_types.reservation_type=reservation_type LIMIT 1\n" +
    ");\n" +
    "END;";
  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: procedure insert_reservation_status created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `insert_reservation_status`(\n" +
    "IN status VARCHAR(45)\n" +
    ")\n" +
    "BEGIN\n" +
    "INSERT INTO reservation_status(status)\n" +
    "SELECT status FROM DUAL\n" +
    "WHERE NOT EXISTS (\n" +
    "SELECT * FROM reservation_status\n" +
    "WHERE reservation_status.status = status LIMIT 1\n" +
    ");\n" +
    "END;";
  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: procedure insert_reservation_status created if it didn't exist");
    }
  });

  sql =
    "CREATE PROCEDURE IF NOT EXISTS `make_payment`(\n" +
    "IN new_card_number VARCHAR(16),\n" +
    "IN new_amount decimal(8,2),\n" +
    "IN new_payment_date DATE,\n" +
    "IN new_payment_status VARCHAR(10),\n" +
    "IN new_reason VARCHAR(255),\n" +
    "IN new_user_id INT,\n" +
    "OUT result INT\n" +
    ")\n" +
    "BEGIN\n" +
    "INSERT INTO payments (card_number, amount, payment_date, payment_status, reason, user_id)\n" +
    "VALUES (new_card_number, new_amount, new_payment_date, new_payment_status, new_reason, new_user_id);\n" +
    "SET result = LAST_INSERT_ID();\n" +
    "END;";

  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: procedure register_user created if it didn't exist");
    }
  });


  //variables subject to change based on info that we get (instead of the id, we could get the type and then find the associated id)
  sql =
    "CREATE PROCEDURE IF NOT EXISTS `create_reservation`(\n" +
    "IN new_user_id INT,\n" +
    "IN new_reservation_type VARCHAR(45),\n" +
    "IN new_site_id INT,\n" +
    "IN new_payment_id INT,\n" +
    "IN new_rv_size DECIMAL(5,2),\n" +
    "IN new_date_of_reservation DATE,\n" +
    "IN new_reservation_status VARCHAR(45),\n" +
    "IN new_from_date DATE,\n" +
    "IN new_to_date DATE,\n" +
    "OUT result INT\n" +
    ")\n" +
    "BEGIN\n" +
    "INSERT INTO reservations (user_id, reservation_type_id, site_id, payment_id, rv_size, date_of_reservation, reservation_status_id, from_date, to_date)\n" +
    "VALUES (new_user_id," +
    "(SELECT reservation_type_id FROM reservation_types WHERE reservation_types.reservation_type = new_reservation_type LIMIT 1)," +
    "new_site_id, new_payment_id, new_rv_size, new_date_of_reservation," +
    "(SELECT reservation_status_id FROM reservation_status WHERE reservation_status.status = new_reservation_status LIMIT 1), " +
    "new_from_date, new_to_date);\n" +
    "SET result = LAST_INSERT_ID();\n" +
    "END;";
  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: procedure create_reservation created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `get_reservation`(\n" +
    "IN new_reservation_id VARCHAR(255)\n" +
    ")\n" +
    "BEGIN\n" +
    "SELECT reservation_types.reservation_type, reservations.rv_size, sites.site_number, payments.amount, reservations.date_of_reservation, reservations.from_date, reservations.to_date, reservation_status.status FROM reservations\n" +
    "JOIN reservation_types ON reservation_types.reservation_type_id = reservations.reservation_type_id\n" +
    "JOIN sites ON sites.site_id = reservations.site_id\n" +
    "JOIN payments ON payments.payment_id = reservations.payment_id\n" +
    "JOIN reservation_status ON reservation_status.reservation_status_id = reservations.reservation_status_id\n" +
    "WHERE reservations.reservation_id = new_reservation_id\n" +
    "LIMIT 1;\n" +
    "END;";
  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: procedure get_reservation created if it didn't exist");
    }
  });

  sql =
    "CREATE PROCEDURE IF NOT EXISTS `create_site`(\n" +
    "IN new_username VARCHAR(45),\n" +
    "IN new_site_number INT,\n" +
    "IN new_max_size INT,\n" +
    "IN new_price_per_night INT,\n" +
    "IN new_site_status VARCHAR(45),\n" +
    "IN new_reservation_type VARCHAR(45),\n" +
    "OUT result INT\n" +
    ")\n" +
    "BEGIN\n" +
    "DECLARE siteCount INT;\n" +
    "SET result = 0;\n" +
    "SELECT COUNT(*) INTO siteCount\n" +
    "FROM sites\n" +
    "WHERE site_number = new_site_number;\n" +
    "IF siteCount = 0\n" +
    "THEN \n" +
    "INSERT INTO sites (site_number, max_size, price_per_night, site_status, reservation_type_id)\n" +
    "VALUES (new_site_number, new_max_size, new_price_per_night, new_site_status," +
    "(SELECT reservation_type_id FROM reservation_types WHERE reservation_types.reservation_type = new_reservation_type LIMIT 1));\n" +
    "INSERT INTO managing_sites_log (user_id, site_id, log_date, note)\n" +
    "        VALUES ((SELECT user_id FROM users WHERE username = new_username), (SELECT site_id FROM sites WHERE site_number = new_site_number), CURDATE(), CONCAT('AddSite: Site ', new_site_number, ' added successfully'));\n" +
    "ELSE\n" +
    "INSERT INTO managing_sites_log (user_id, site_id, log_date, note)\n" +
    "        VALUES ((SELECT user_id FROM users WHERE username = new_username), (SELECT site_id FROM sites WHERE site_number = new_site_number), CURDATE(), CONCAT('AddSite: Site ', new_site_number, ' already exists'));\n" +
    "SET result = 1;\n" +
    "END IF;\n" +
    "END;";
  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: procedure create_site created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `remove_site`(\n" +
    "    IN new_username VARCHAR(45),\n" +
    "    IN new_site_number INT,\n" +
    "    IN new_site_status VARCHAR(45),\n" +
    "    OUT result INT\n" +
    ")\n" +
    "BEGIN\n" +
    "    DECLARE future_reservations INT;\n" +
    "    SET result = 0;\n" +
    "    SELECT COUNT(*) INTO future_reservations\n" +
    "    FROM reservations\n" +
    "    WHERE site_id = (SELECT site_id FROM sites WHERE site_number = new_site_number)\n" +
    "    AND to_date >= CURDATE()\n" +
    "    AND reservation_status_id IN (SELECT reservation_status_id FROM reservation_status WHERE status = 'Active');\n" +
    "    IF future_reservations = 0 THEN\n" +
    "        UPDATE sites \n" +
    "        SET site_status = new_site_status\n" +
    "        WHERE site_number = new_site_number;\n" +
    "        INSERT INTO managing_sites_log (user_id, site_id, log_date, note)\n" +
    "        VALUES ((SELECT user_id FROM users WHERE username = new_username), (SELECT site_id FROM sites WHERE site_number = new_site_number), CURDATE(), CONCAT('EditSite: Site ', new_site_number, 's status changed to ', new_site_status));\n" +
    "    ELSE\n" +
    "        INSERT INTO managing_sites_log (user_id, site_id, log_date, note)\n" +
    "        VALUES ((SELECT user_id FROM users WHERE username = new_username), (SELECT site_id FROM sites WHERE site_number = new_site_number), CURDATE(), CONCAT('EditSite: Site ', new_site_number, ' could not be closed due to active reservations'));\n" +
    "        SET result = 1;\n" +
    "    END IF;\n" +
    "END\n";

  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: procedure remove_site created if it didn't exist");
    }
  });


  //carbon copy of add_site, but the names might as well be different
  sql = " CREATE PROCEDURE IF NOT EXISTS edit_site(\n" +
    "IN new_username VARCHAR(45),\n" +
    "IN old_site_number INT,\n" +
    "IN new_site_number INT,\n" +
    "IN new_max_size INT,\n" +
    "IN new_price_per_night INT,\n" +
    "IN new_site_status VARCHAR(45),\n" +
    "IN new_reservation_type VARCHAR(45),\n" +
    "OUT result INT\n" +
    ")\n" +
    "BEGIN\n" +
    "DECLARE siteCount INT;\n" +
    "DECLARE siteMatchCount INT;\n" +
    "DECLARE siteId INT;\n" +
    "DECLARE future_reservations INT;\n\n" +
    "SET result = 0;\n\n" +
    "SELECT site_id INTO siteId FROM sites WHERE site_number = old_site_number LIMIT 1;\n" +
    "SELECT COUNT(*) INTO siteCount FROM sites WHERE site_number = new_site_number AND site_number <> old_site_number;\n" +
    "IF new_site_status = 'Closed' AND siteCount = 0 THEN\n" +
    "SELECT COUNT(*) INTO future_reservations\n" +
    "FROM reservations\n" +
    "WHERE site_id = siteId\n" +
    "AND to_date >= CURDATE()\n" +
    "AND reservation_status_id IN (SELECT reservation_status_id FROM reservation_status WHERE status = 'Active');\n\n" +
    "IF future_reservations = 0 THEN\n" +
    "UPDATE sites\n" +
    "SET site_number = new_site_number, max_size = new_max_size, price_per_night = new_price_per_night, site_status = new_site_status,\n" +
    "reservation_type_id = (SELECT reservation_type_id FROM reservation_types WHERE reservation_type = new_reservation_type LIMIT 1)\n" + "WHERE site_id = siteId;\n\n" +
    "INSERT INTO managing_sites_log (user_id, site_id, log_date, note)\n" +
    "VALUES ((SELECT user_id FROM users WHERE username = new_username), siteId, CURDATE(), CONCAT('EditSite: Site ', old_site_number, 's status changed to ', new_site_status));\n" +
    "IF new_site_number != old_site_number THEN\n" +
    "INSERT INTO managing_sites_log (user_id, site_id, log_date, note)\n" +
    "VALUES ((SELECT user_id FROM users WHERE username = new_username), siteId, CURDATE(), CONCAT('EditSite: Site Number ', old_site_number, ' Changed from ', old_site_number, ' -> ', new_site_number));\n" +
    "END IF;" +
    "ELSE\n" +
    "INSERT INTO managing_sites_log (user_id, site_id, log_date, note)\n" +
    "VALUES ((SELECT user_id FROM users WHERE username = new_username), siteId, CURDATE(), CONCAT('EditSite: Site ', old_site_number, ' could not be closed due to active reservations'));\n" +
    "SET result = 2;\n" +
    "END IF;\n" +
    "ELSE\n" +
    "SET result = 0;\n\n" +
    "IF siteCount > 0 THEN\n" +
    "SET result = 1;\n" +
    "INSERT INTO managing_sites_log (user_id, site_id, log_date, note)\n" +
    "VALUES ((SELECT user_id FROM users WHERE username = new_username), siteId, CURDATE(), CONCAT('EditSite: Site ', new_site_number, ' already exists'));\n" +
    "ELSE\n" +
    "SELECT COUNT(*) INTO siteMatchCount FROM sites WHERE site_number = old_site_number;\n" +
    "IF siteMatchCount > 0 THEN\n" +
    "IF new_site_number = old_site_number THEN\n" +
    "INSERT INTO managing_sites_log (user_id, site_id, log_date, note)\n" +
    "VALUES ((SELECT user_id FROM users WHERE username = new_username), siteId, CURDATE(), CONCAT('EditSite: Site ', new_site_number, 's properties were changed'));\n" +
    "ELSE\n" +
    "INSERT INTO managing_sites_log (user_id, site_id, log_date, note)\n" +
    "VALUES ((SELECT user_id FROM users WHERE username = new_username), siteId, CURDATE(), CONCAT('EditSite: Site Number Changed from ', old_site_number, ' -> ', new_site_number, ', site properties were changed'));\n" +
    "END IF;\n" +
    "UPDATE sites\n" +
    "SET site_number = new_site_number, max_size = new_max_size, price_per_night = new_price_per_night, site_status = new_site_status,\n" +
    "reservation_type_id = (SELECT reservation_type_id FROM reservation_types WHERE reservation_type = new_reservation_type LIMIT 1)\n" +
    "WHERE site_id = siteId;\n" +
    "ELSE\n" +
    "SET result = 3;\n" +
    "END IF;\n" +
    "END IF;\n" +
    "END IF;\n" +
    "END;\n";

  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: procedure edit_site created if it didn't exist");
    }
  });



  sql = "CREATE PROCEDURE IF NOT EXISTS `get_site`(\n" +
    "IN new_site_number VARCHAR(255)\n" +
    ")\n" +
    "BEGIN\n" +
    "SELECT *, reservation_types.reservation_type FROM sites\n" +
    "JOIN reservation_types ON reservation_types.reservation_type_id = sites.reservation_type_id\n" +
    "WHERE sites.site_number = new_site_number\n" +
    "LIMIT 1;\n" +
    "END;";
  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: procedure get_reservation created if it didn't exist");
    }
  });


  sql =
    "CREATE PROCEDURE IF NOT EXISTS `add_manage_site_log`(\n" +
    "IN new_card_number VARCHAR(16),\n" +
    "IN new_amount decimal(8,2),\n" +
    "IN new_payment_date DATE,\n" +
    "IN new_payment_status VARCHAR(10),\n" +
    "IN new_reason VARCHAR(255),\n" +
    "IN new_user_id INT,\n" +
    "OUT result INT\n" +
    ")\n" +
    "BEGIN\n" +
    "INSERT INTO payments (card_number, amount, payment_date, payment_status, reason, user_id)\n" +
    "VALUES (new_card_number, new_amount, new_payment_date, new_payment_status, new_reason, new_user_id);\n" +
    "SET result = LAST_INSERT_ID();\n" +
    "END;";

  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: procedure add_manage_site_log created if it didn't exist");
    }
  });


  sql = "CREATE PROCEDURE IF NOT EXISTS `check_availability`(\n" +
    "IN new_reservation_type VARCHAR(45),\n" +
    "IN new_size INT,\n" +
    "IN new_price_per_night INT,\n" +
    "IN new_from_date DATE,\n" +
    "IN new_to_date DATE\n" +
    //"OUT result INT\n" + will make a result later
    ")\n" +
    "BEGIN\n" +
    "SELECT sites.site_id, sites.site_number, sites.price_per_night, sites.max_size, reservation_types.reservation_type \n" +
    "FROM sites\n" +
    "JOIN reservation_types ON reservation_types.reservation_type_id = sites.reservation_type_id\n" +
    "WHERE sites.reservation_type_id = (SELECT reservation_type_id FROM reservation_types WHERE reservation_type = new_reservation_type) \n" +
    "AND (new_size IS NULL OR sites.max_size >= new_size) \n" +
    "AND sites.price_per_night <= new_price_per_night \n" +
    "AND sites.site_status = 'Active' \n" +
    "AND NOT EXISTS (\n" +
    "    SELECT 1\n" +
    "    FROM reservations\n" +
    "    JOIN reservation_status ON reservation_status.reservation_status_id = reservations.reservation_status_id\n" +
    "    WHERE reservations.site_id = sites.site_id\n" +
    "    AND reservations.from_date <= new_to_date\n" +
    "    AND reservations.to_date >= new_from_date\n" +
    "    AND reservation_status.status = 'Active'\n" +
    ")\n" +
    "AND NOT EXISTS (\n" +
    "    SELECT 1\n" +
    "    FROM holiday_dates\n" +
    "    WHERE holiday_dates.holiday_date BETWEEN new_from_date AND new_to_date\n" +
    ")\n" +
    "ORDER BY sites.site_number;\n" +
    "END;";


  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: procedure check_availability created if it didn't exist");
    }
  });


  sql = "CREATE PROCEDURE IF NOT EXISTS `cancel_reservation`(\n" +
    "IN cancel_reservation_id INT\n" +
    ")\n" +
    "BEGIN\n" +
    "UPDATE reservations \n" +
    "SET reservation_status_id = 2\n" +
    "WHERE reservation_id = cancel_reservation_id; \n" +
    "END;";

  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: procedure cancel_reservation created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `complete_reservation`(\n" +
    "IN complete_reservation_id INT\n" +
    ")\n" +
    "BEGIN\n" +
    "UPDATE reservations \n" +
    "SET reservation_status_id = (SELECT reservation_status_id FROM reservation_status WHERE status = 'Completed')\n" +
    "WHERE reservation_id = complete_reservation_id; \n" +
    "END;";

  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: procedure cancel_reservation created if it didn't exist");
    }
  });


  sql = "CREATE PROCEDURE IF NOT EXISTS `refund_payment`(\n" +
    "IN new_reservation_id INT\n" +
    ")\n" +
    "BEGIN\n" +
    "UPDATE payments \n" +
    "JOIN reservations ON reservations.payment_id = payments.payment_id\n" +
    "SET payments.payment_status = 'Refunded'\n" +
    "WHERE reservations.reservation_id = new_reservation_id; \n" +
    "END;";

  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: procedure refund_payment created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `get_usertype_id`(\n" +
    "IN logged_userid INT\n" +
    ")\n" +
    "BEGIN\n" +
    "SELECT user_role_id \n" +
    "FROM users\n" +
    "WHERE users.user_id = logged_userid; \n" +
    "END;";

  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: procedure get_usertype_id created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `get_users`()\n" +
    "BEGIN\n" +
    "SELECT username \n" +
    "FROM users\n" +
    "ORDER BY username;\n" +
    "END;";

  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: procedure get_users created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `get_user_info`(\n" +
    "IN getUserName VARCHAR(45)\n" +
    ")\n" +
    "BEGIN\n" +
    "SELECT *, users.user_role_id AS role \n" +
    "FROM users\n" +
    "INNER JOIN user_types ON users.user_role_id = user_types.user_type_id\n" +
    "WHERE username = getUserName;\n" +
    "END;";

  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: procedure get_user_info created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `edit_user_details`(\n" +
    "IN userId INT,\n" +
    "IN newUserName VARCHAR(50),\n" +
    "IN newFirstName VARCHAR(50),\n" +
    "IN newLastName VARCHAR(50),\n" +
    "IN newEmail VARCHAR(50),\n" +
    "IN newPhoneNum VARCHAR(40),\n" +
    "IN newStreetAddress VARCHAR(255),\n" +
    "IN newCity VARCHAR(40),\n" +
    "IN newState VARCHAR(40),\n" +
    "IN newZipCode VARCHAR(10),\n" +
    "IN newUserRoleId INT,\n" +
    "OUT result INT\n" +
    ")\n" +
    "BEGIN\n" +
    "DECLARE rowsAffected INT;\n" +
    "DECLARE usernameCount INT;\n" +
    "SET result = 0;\n" +
    "SELECT COUNT(*) INTO usernameCount\n" +
    "FROM users\n" +
    "WHERE username = newUserName;\n" +
    "IF usernameCount > 0 THEN\n" +
    "    SET result = 1;\n" +
    "ELSE\n" +
        "UPDATE users\n" +
        "SET \n" +
        "username = CASE\n" +
        "WHEN newUserName IS NOT NULL THEN newUserName\n" +
        "ELSE username\n" +
        "END,\n" +
        "first_name = CASE\n" +
        "WHEN newFirstName IS NOT NULL THEN newFirstName\n" +
        "ELSE first_name\n" +
        "END,\n" +
        "last_name = CASE\n" +
        "WHEN newLastName IS NOT NULL THEN newLastName\n" +
        "ELSE last_name\n" +
        "END,\n" +
        "email = CASE\n" +
        "WHEN newEmail IS NOT NULL THEN newEmail\n" +
        "ELSE email\n" +
        "END,\n" +
        "phone_number = CASE\n" +
        "WHEN newPhoneNum IS NOT NULL THEN newPhoneNum\n" +
        "ELSE phone_number\n" +
        "END,\n" +
        "street_address = CASE\n" +
        "WHEN newStreetAddress IS NOT NULL THEN newStreetAddress\n" +
        "ELSE street_address\n" +
        "END,\n" +
        "city = CASE\n" +
        "WHEN newCity IS NOT NULL THEN newCity\n" +
        "ELSE city\n" +
        "END,\n" +
        "state = CASE\n" +
        "WHEN newState IS NOT NULL THEN newState\n" +
        "ELSE state\n" +
        "END,\n" +
        "zip = CASE\n" +
        "WHEN newZipCode IS NOT NULL THEN newZipCode\n" +
        "ELSE zip\n" +
        "END,\n" +
        "user_role_id = CASE\n" +
        "WHEN newUserRoleId IS NOT NULL THEN newUserRoleId\n" +
        "ELSE user_role_id\n" +
        "END\n" +
        "WHERE user_id = userId;\n" +
    "END IF;\n" +
    "END;"
  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: procedure edit_user_details created if it didn't exist");
    }
  });


  // sql = "CREATE PROCEDURE IF NOT EXISTS `edit_user_details`(\n" +
  //   "IN userId INT,\n" +
  //   "IN newUserName VARCHAR(50),\n" +
  //   "IN newFirstName VARCHAR(50),\n" +
  //   "IN newLastName VARCHAR(50),\n" +
  //   "IN newEmail VARCHAR(50),\n" +
  //   "IN newPhoneNum VARCHAR(40),\n" +
  //   "IN newStreetAddress VARCHAR(255),\n" +
  //   "IN newCity VARCHAR(40),\n" +
  //   "IN newState VARCHAR(40),\n" +
  //   "IN newZipCode VARCHAR(10),\n" +
  //   "IN newUserRoleId INT,\n" +
  //   "OUT result INT\n" +
  //   ")\n" +
  //   "BEGIN\n" +
  //   "DECLARE rowsAffected INT;\n" +

  //   "SET result = 1;\n" +

  //   "UPDATE users\n" +
  //   "SET \n" +
  //   "username = CASE\n" +
  //   "WHEN newUserName IS NOT NULL THEN newUserName\n" +
  //   "ELSE username\n" +
  //   "END,\n" +
  //   "first_name = CASE\n" +
  //   "WHEN newFirstName IS NOT NULL THEN newFirstName\n" +
  //   "ELSE first_name\n" +
  //   "END,\n" +
  //   "last_name = CASE\n" +
  //   "WHEN newLastName IS NOT NULL THEN newLastName\n" +
  //   "ELSE last_name\n" +
  //   "END,\n" +
  //   "email = CASE\n" +
  //   "WHEN newEmail IS NOT NULL THEN newEmail\n" +
  //   "ELSE email\n" +
  //   "END,\n" +
  //   "phone_number = CASE\n" +
  //   "WHEN newPhoneNum IS NOT NULL THEN newPhoneNum\n" +
  //   "ELSE phone_number\n" +
  //   "END,\n" +
  //   "street_address = CASE\n" +
  //   "WHEN newStreetAddress IS NOT NULL THEN newStreetAddress\n" +
  //   "ELSE street_address\n" +
  //   "END,\n" +
  //   "city = CASE\n" +
  //   "WHEN newCity IS NOT NULL THEN newCity\n" +
  //   "ELSE city\n" +
  //   "END,\n" +
  //   "state = CASE\n" +
  //   "WHEN newState IS NOT NULL THEN newState\n" +
  //   "ELSE state\n" +
  //   "END,\n" +
  //   "zip = CASE\n" +
  //   "WHEN newZipCode IS NOT NULL THEN newZipCode\n" +
  //   "ELSE zip\n" +
  //   "END,\n" +
  //   "user_role_id = CASE\n" +
  //   "WHEN newUserRoleId IS NOT NULL THEN newUserRoleId\n" +
  //   "ELSE user_role_id\n" +
  //   "END\n" +
  //   "WHERE user_id = userId;\n" +
  //   "END;"
  // con.query(sql, function (err, results, fields) {
  //   if (err) {
  //     console.log(err.message);
  //     throw err;
  //   } else {
  //     console.log("database.js: procedure edit_user_details created if it didn't exist");
  //   }
  // });


  sql = "CREATE PROCEDURE IF NOT EXISTS `insert_holiday_date`(\n" +
    "    IN new_holiday_date DATE,\n" +
    "    IN new_holiday_description VARCHAR(255)\n" +
    ")\n" +
    "BEGIN\n" +
    "    INSERT INTO holiday_dates(holiday_date, holiday_description)\n" +
    "    SELECT new_holiday_date, new_holiday_description\n" +
    "    FROM DUAL\n" +
    "    WHERE NOT EXISTS (\n" +
    "        SELECT *\n" +
    "        FROM holiday_dates\n" +
    "        WHERE holiday_dates.holiday_date = new_holiday_date\n" +
    "        LIMIT 1\n" +
    "    );\n" +
    "END;";
  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: procedure insert_holiday_date created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `delete_holiday_date`(\n" +
    "    IN new_holiday_date_id INT\n" +
    ")\n" +
    "BEGIN\n" +
    "    DELETE FROM holiday_dates WHERE holiday_date_id = new_holiday_date_id;\n" +
    "END;";
  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: procedure delete_holiday_date created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `get_holiday_dates`()\n" +
    "BEGIN\n" +
    "SELECT * \n" +
    "FROM holiday_dates\n" +
    "ORDER BY holiday_date;\n" +
    "END;";
  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: procedure get_holiday_dates created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `get_reservations_by_date`(\n" +
    "IN inputDate DATE\n" +
    ")\n" +
    "BEGIN\n" +
    "SELECT r.reservation_id, rt.reservation_type, sites.site_number, r.rv_size \n" +
    "FROM reservations r \n" +
    "INNER JOIN reservation_types rt ON r.reservation_type_id = rt.reservation_type_id\n" +
    "INNER JOIN sites ON r.site_id = sites.site_id\n" +
    "WHERE inputDate BETWEEN r.from_date AND r.to_date;\n" +
    "END;";

  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: procedure get_reservations_by_date created if it didn't exist");
    }
  });

  sql = "CREATE PROCEDURE IF NOT EXISTS `get_reservations_by_username`(\n" +
    "IN inputUsername VARCHAR(45)\n" +
    ")\n" +
    "BEGIN\n" +
    "SELECT users.username, users.first_name, users.last_name, users.email,\n" +
    "users.phone_number, r.reservation_id, rt.reservation_type, sites.site_number, r.rv_size \n" +
    "FROM reservations r \n" +
    "INNER JOIN reservation_types rt ON r.reservation_type_id = rt.reservation_type_id\n" +
    "INNER JOIN sites ON r.site_id = sites.site_id\n" +
    "INNER JOIN users ON r.user_id = users.user_id\n" +
    "WHERE inputUsername = users.username;\n" +
    "END;";

  con.query(sql, function (err, results, fields) {
    if (err) {
      console.log(err.message);
      throw err;
    } else {
      console.log("database.js: procedure get_reservations_by_username created if it didn't exist");
    }
  });

}

function addDummyData() {

  // sql = "CALL register('john.krasinski', 'jk12345', 'John', 'Krasinski', '555-555-5555', '18375960', @result)";
  // con.query(sql, function (err, rows) {
  //   if (err) {
  //     console.log(err.message);
  //     throw err;
  //   }
  //   console.log("database.js: Added user to users table");
  // });

  sql = "CALL insert_user_type('customer')";
  con.query(sql, function (err, rows) {
    if (err) {
      console.log(err.message);
      throw err;
    }
    console.log("database.js: Added 'customer' to user_types");
  });

  sql = "CALL insert_user_type('admin')";
  con.query(sql, function (err, rows) {
    if (err) {
      console.log(err.message);
      throw err;
    }
    console.log("database.js: Added 'admin' to user_types");
  });

  sql = "CALL insert_user_type('employee')";
  con.query(sql, function (err, rows) {
    if (err) {
      console.log(err.message);
      throw err;
    }
    console.log("database.js: Added 'employee' to user_types");
  });

  sql = "CALL insert_reservation_status('Active')";
  con.query(sql, function (err, rows) {
    if (err) {
      console.log(err.message);
      throw err;
    }
    console.log("database.js: Added 'Active' to reservation_status");
  });

  sql = "CALL insert_reservation_status('Canceled')";
  con.query(sql, function (err, rows) {
    if (err) {
      console.log(err.message);
      throw err;
    }
    console.log("database.js: Added 'Canceled' to reservation_status");
  });

  sql = "CALL insert_reservation_status('Completed')";
  con.query(sql, function (err, rows) {
    if (err) {
      console.log(err.message);
      throw err;
    }
    console.log("database.js: Added 'Completed' to reservation_status");
  });

  sql = "CALL insert_reservation_type('RV Parking')";
  con.query(sql, function (err, rows) {
    if (err) {
      console.log(err.message);
      throw err;
    }
    console.log("database.js: Added 'RV Parking' to reservation_types");
  });

  sql = "CALL insert_reservation_type('Dry Camping')";
  con.query(sql, function (err, rows) {
    if (err) {
      console.log(err.message);
      throw err;
    }
    console.log("database.js: Added 'Dry Camping' to reservation_types");
  });

  sql = "CALL insert_reservation_type('Tenting')";
  con.query(sql, function (err, rows) {
    if (err) {
      console.log(err.message);
      throw err;
    }
    console.log("database.js: Added 'Tenting' to reservation_types");
  });

  sql = "CALL insert_reservation_type('Storage')";
  con.query(sql, function (err, rows) {
    if (err) {
      console.log(err.message);
      throw err;
    }
    console.log("database.js: Added 'Storage' to reservation_types");
  });

  sql = "CALL insert_reservation_type('Pop Up Trailer')";
  con.query(sql, function (err, rows) {
    if (err) {
      console.log(err.message);
      throw err;
    }
    console.log("database.js: Added 'Pop Up Trailer' to reservation_types");
  });


  sql = "CALL register_user('admin', 'admin', 'admin', 'admin@gmail.com', '8017753250', '757e31954b06c8c0e3b2f026d507b78a7a0f9d76e545cb70f631b0e1004f086b',\n" +
    "'0ce81db045e50d61', '5622 Park Ln. Bldg. #564', 'Hill AFB', 'UT', 84056, 'DOD Authorized Civilian',\n" +
    "'other', 'none', 'admin', @result)";
  con.query(sql, function (err, rows) {
    if (err) {
      console.log(err.message);
      throw err;
    }
    console.log("database.js: Added admin account to users");
  });
}

module.exports = con;