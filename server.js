// server.js
// where your node app starts

// we've started you off with Express (https://expressjs.com/)
// but feel free to use whatever libraries or frameworks you'd like through `package.json`.
const express = require("express");
const app = express();
var qs = require("querystring");
var axios = require("axios");
var jwt = require("jsonwebtoken");
// Verify using getKey callback
// Example uses https://github.com/auth0/node-jwks-rsa as a way to fetch the keys.
var jwksClient = require("jwks-rsa");
var client = jwksClient({
  jwksUri: "https://hawauth0.au.auth0.com/.well-known/jwks.json"
});

var passwordHookResponseSuccess = {
  //"result": "SUCCESS",
  commands: [
    {
      type: "com.okta.action.update",
      value: {
        credential: "VERIFIED"
      }
    }
  ],
  debugContext: {
    stuff: "The credential is valid!"
  }
};
var passwordHookResponseFail = {
  //"result": "FAIL",
  commands: [
    {
      type: "com.okta.action.update",
      value: {
        credential: "UNVERIFIED"
      }
    }
  ],
  debugContext: {
    stuff: "The credential is invalid!"
  }
};
function getKey(header, callback) {
  client.getSigningKey(header.kid, function(err, key) {
    var signingKey = key.publicKey || key.rsaPublicKey;
    callback(null, signingKey);
  });
}

// make all the files in 'public' available
// https://expressjs.com/en/starter/static-files.html
app.use(express.static("public"));

app.post("/processCreds", async (request, response) => {
  console.log("IN POST");
  if (request.method == "POST") {
    var body = "";

    request.on("data", function(data) {
      body += data;

      // Too much POST data, kill the connection!
      // 1e6 === 1 * Math.pow(10, 6) === 1 * 1000000 ~~~ 1MB
      if (body.length > 1e6) request.connection.destroy();
    });

    await request.on("end", async function() {
      var post = qs.parse(body);

      console.log(post.username);
      console.log(post.password);
      //migration script
      await axios
        .post(
          "https://oktauniversity.workflows.okta.com/api/flo/c3a83f5a2af507bafb169e161f5d235a/invoke",
          {
            username: post.username,
            password: post.password
          }
        )
        .then(function(resp) {
          var data = resp.data;
          console.log(data);

          response.append(
            "Access-Control-Allow-Origin",
            "https://super-widget.oktaprise.com"
          );
          if (data.migrated === "true") response.json({ migrated: "True" });
          else response.json({ migrated: "False" });
        });
    });
  }

});

app.post("/migrate-auth0-to-okta-hook", function(request, response) {
  console.log("password Hook");

  var data = "";
  // A chunk of data has been recieved.
  request.on("data", chunk => {
    data += chunk;
  });

  // The whole response has been received. Print out the result.
  request.on("end", () => {
    console.log(data);
    const jsonData = JSON.parse(data);
    const username = jsonData.data.context.credential.username;
    const password = jsonData.data.context.credential.password;
    console.log(username);
    console.log(password);

    axios
      .post("https://hawauth0.au.auth0.com/oauth/token", {
        grant_type: "http://auth0.com/oauth/grant-type/password-realm",
        client_id: "qNz82UflfqYMJdL0wTxUyudVfTpZfeNd",
        client_secret:
          "uD3qRx4ge4-NQbfHtUKrIci1Aplp_kqdrMeV7UPgBJzG8adwA0nOluP6ZbiytSwZ",
        audience: "https://migrate-auth0-to-okta",
        username: username,
        password: password,

        scope: "openid",
        realm: "Username-Password-Authentication"
      })
      .then(function(resp) {
        //console.log(response);
        var data = resp.data;
        console.log(data);
        var access_token = data.access_token;
        var id_token = data.id_token;
        console.log(id_token);
        jwt.verify(
          id_token,
          getKey,
          { audience: "qNz82UflfqYMJdL0wTxUyudVfTpZfeNd" },
          function(err, decoded) {
            console.log(decoded); 
            if (err == null) {
              response.send(passwordHookResponseSuccess);
            } else {
              response.send(passwordHookResponseFail);
              console.log(err);
            }
          }
        );
      })
      .catch(function(error) {
        response.send(passwordHookResponseFail);
        //console.log(error);
      });
   
  });
});

// listen for requests :)
const listener = app.listen(process.env.PORT, () => {
  console.log("Your app is listening on port " + listener.address().port);
});
