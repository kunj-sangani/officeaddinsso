/*
 * Copyright (c) Microsoft. All rights reserved. Licensed under the MIT license. See full license in root of repo. -->
 *
 * This file shows how to use MSAL.js to get an access token to Microsoft Graph an pass it to the task pane.
 */

/* global console, localStorage, Office */

import { Configuration, PublicClientApplication, RedirectRequest } from "@azure/msal-browser";

const msalConfig: Configuration = {
  auth: {
    clientId: "002ec2e7-a2d9-459e-87cf-ede2ec13eca4", //This is your client ID
    authority: "https://login.microsoftonline.com/common",
    redirectUri: "https://localhost:3000/fallbackauthdialog.html",
    navigateToLoginRequestUrl: false,
  },
  cache: {
    cacheLocation: "localStorage", // Needed to avoid "User login is required" error.
    storeAuthStateInCookie: true, // Recommended to avoid certain IE/Edge issues.
  },
};

const loginRequest: RedirectRequest = {
  scopes: [`https://graph.microsoft.com/User.Read`],
};

const publicClientApp: PublicClientApplication = new PublicClientApplication(msalConfig);

Office.onReady(() => {
  if (Office.context.ui.messageParent) {
    publicClientApp
      .handleRedirectPromise()
      .then(handleResponse)
      .catch((error) => {
        console.log(error);
        Office.context.ui.messageParent(JSON.stringify({ status: "failure", result: error }));
      });

    // The very first time the add-in runs on a developer's computer, msal.js hasn't yet
    // stored login data in localStorage. So a direct call of acquireTokenRedirect
    // causes the error "User login is required". Once the user is logged in successfully
    // the first time, msal data in localStorage will prevent this error from ever hap-
    // pening again; but the error must be blocked here, so that the user can login
    // successfully the first time. To do that, call loginRedirect first instead of
    // acquireTokenRedirect.
    if (localStorage.getItem("loggedIn") === "yes") {
      publicClientApp.acquireTokenRedirect(loginRequest);
    } else {
      // This will login the user and then the (response.tokenType === "id_token")
      // path in authCallback below will run, which sets localStorage.loggedIn to "yes"
      // and then the dialog is redirected back to this script, so the
      // acquireTokenRedirect above runs.
      publicClientApp.loginRedirect(loginRequest);
    }
  }
});

function handleResponse(response) {
  if (response.tokenType === "id_token") {
    console.log("LoggedIn");
    localStorage.setItem("loggedIn", "yes");
  } else {
    console.log("token type is:" + response.tokenType);
    Office.context.ui.messageParent(JSON.stringify({ status: "success", result: response.accessToken }));
  }
}
