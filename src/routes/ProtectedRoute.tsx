import React from 'react'
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({children}:any) => {

    const isAuth:boolean = false;

  return (
    isAuth ? children : <Navigate to="/dashboard" replace/>
  )
}

export default ProtectedRoute