<?php

use FirebaseJWT\JWT;
use FirebaseJWT\Key;
/**
 * Delete the user from the the database
 * if valid credentials are approved through JWT
 * 
 * @param userid returns the user id to delete the user from the database.
 * 
 * @method POST
 * @author Marius Oprea
 * @id w20039534
 */
class DeleteUser extends Endpoint {

    public function __construct()
    {
       $db = new Database(DATABASE);//set db
       $this->validateRequestMethod('POST');//validate request method   
       $this->validateToken();//validate the token
       $this->validateUpdateParams();//validate the params
       $this->initialiseSQL();//initialise the sql
       $queryResult = $db->executeSQL($this->getSQL(), $this->getSQLParams());//execute the sql
 
        $this->setData( array(
            "length" => 0,
            "message" => "success",
            "data" => null
        ));
    }

    protected function initialiseSQL(){
        $userid = $_POST['userid'];


        $sql = "DELETE FROM user WHERE user_id = :userid";
        $this->setSQL($sql);
        $this->setSQLParams([':userid'=>$userid]);
    }
//function to validate the request method
    private function validateRequestMethod($method) {
        if ($_SERVER['REQUEST_METHOD'] != $method) {
          throw new ClientErrorException("Invalid Request Method", 405);
         }
      }

    private function validateToken(){
        // Use the secret key
        $secretKey = SECRET;
                
        // Get all headers from the http request
        $allHeaders = getallheaders();
        $authorizationHeader = "";
                
        // Look for an Authorization header. This 
        // this might not exist. It might start with a capital A (requests
        // from Postman do), or a lowercase a (requests from browsers might)
        if (array_key_exists('Authorization', $allHeaders)) {
            $authorizationHeader = $allHeaders['Authorization'];
        } elseif (array_key_exists('authorization', $allHeaders)) {
            $authorizationHeader = $allHeaders['authorization'];
        }
                
        // Check if there is a Bearer token in the header
        if (substr($authorizationHeader, 0, 7) != 'Bearer ') {
            throw new ClientErrorException("Bearer token required", 401);
        }
        
        // Extract the JWT from the header (by cutting the text 'Bearer ')
        $jwt = trim(substr($authorizationHeader, 7));
        
        // Use the JWT class to decode the token
        try{
          $decoded = JWT::decode($jwt, new Key($secretKey, 'HS256'));
        }catch(Exception $e){
            throw new ClientErrorException($e->getMessage(),401);
        }

        if($decoded->iss !=$_SERVER['HTTP_HOST']){
            throw new ClientErrorException("invalid token issuer", 401);
        }
    }
//function to validate the url params
    private function validateUpdateParams(){

        if (!filter_has_var(INPUT_POST,'userid')) {
           throw new ClientErrorException("userid parameter required", 400);
         }

  }
}
