import React, {useEffect, useMemo} from "react";

import {auth, firebaseUiConfig} from "../../config/firebase-config";
import {StyledFirebaseAuth} from "react-firebaseui";
import {useLocation, useNavigate} from "react-router-dom";
import {Typography} from "@mui/material";
import {AuthService} from "./auth-service";

export function Login() {
  const location = useLocation();
  const navigate = useNavigate();
  const params = useMemo(() => {
    return new URLSearchParams(location.search);
  }, [location.search]);

  useEffect(() => {
    return auth.onAuthStateChanged((user) => {
      if (user) {
        AuthService.saveProfile(user)
          .then(_ => console.log("User profile saved."))
          .catch(e => console.error("Error saving user profile", e));
        navigate(params.get("from") || "/");
      }
    });
  }, [navigate, params]);

  return (
    <div className="text-center  p-3">
      <Typography variant="h5">Login</Typography>
      {!auth.currentUser && (
        <StyledFirebaseAuth uiConfig={firebaseUiConfig} firebaseAuth={auth}/>
      )}
    </div>
  );
}