import {Outlet, Navigate} from 'react-router-dom';// Import the necessary components from react-router-dom

const PrivateRoute =(props)=>{
  // Get the authentication status from props
  let auth =props.authenticated

  // Return outlet component if authenticated or redirect to the root path if otherwise
  return(
    auth ? <Outlet/> :<Navigate to="/"/>
  )
}
export default PrivateRoute;
