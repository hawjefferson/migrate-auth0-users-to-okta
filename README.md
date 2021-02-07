# migrate-auth0-users-to-okta
 migrate-auth0-users-to-okta


A webhook that allows you to connect your existing auth0 users and migrate them to Okta

This webhook will show two migration approaches

1.) Just in time migration using the Okta Sign In widget and Process Creds function of the Okta Sign In Widget. https://github.com/okta/okta-signin-widget

2.) Okta Password Hook (https://developer.okta.com/docs/reference/password-hook/)


## Your Project

On the back-end,

- your app starts at `server.js`
- add frameworks and packages in `package.json`
- safely store app secrets in `.env` (nobody can see this but you and people you invite)
- two key functions
- /processCreds provides a way to migrate auth0 users in a Just-in-time fashion. this functionality is connected with the Okta widget capability. 
- /migrate-auth0-to-okta-hook provides a way to migrate auth0 users in a staged manner wherein auth0 users are migrated to Okta beforehand first and these users will be set to use a password hook method. The password hook method will call this said function such that you can call the auth0 resource owner password grant credentials flow to check if the credentials is valid. If valid, then Okta will persist the password into Okta's directory else not.

Click `Show` in the header to see your app live. Updates to your code will instantly deploy.


## Made by Jefferson Haw (Jefferson.haw@okta.com)


