import React, { useEffect, useMemo } from 'react';
import { doc as docRef, setDoc } from "firebase/firestore"

import { auth, firebaseUiConfig, firestore } from '../../firebase/firebase-config'
import { StyledFirebaseAuth } from "react-firebaseui";
import { useLocation, useNavigate } from "react-router-dom";
import { makeUserProfile } from "./utils";
import { Typography } from "@mui/material";

export function Login() {
  const location = useLocation()
  const navigate = useNavigate()
  const params = useMemo(() => {
    return new URLSearchParams(location.search)
  }, [location.search])

  useEffect(() => {
    return auth.onAuthStateChanged((user) => {
      if (user) {
        setDoc(docRef(firestore, 'users', user.uid), makeUserProfile(user))
        navigate(params.get('from') || '/')
      }
    })
  }, [navigate, params])

  return (
    <div className="text-center  p-3">
      <Typography variant="h5">Login</Typography>
      {!auth.currentUser && (
        <StyledFirebaseAuth uiConfig={firebaseUiConfig} firebaseAuth={auth} />
      )}
    </div>
  )
}