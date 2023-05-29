<?php

use FirebaseJWT\JWT;
use FirebaseJWT\Key;

/**
 * Used by the jobseeker to save a job
 * if valid credentials are approved through JWT.
 * 
 * The userid is of the requested is decoded from the JWT token
 * and passed in the sql query to retrieve the saved job detials
 * 
 * @method POST
* @author Marius Oprea
 * @id w20039534
 */

class SavedJobs extends Endpoint {

    protected $decodedId;

    public function __construct()
    {
       $db = new Database(DATABASE);//set the db
       $this->validateRequestMethod('POST');//validate the post method
       $this->validateToken();//validate the token
       $this->initialiseSQL();//initialise the sql query
       $queryResult = $db->executeSQL($this->getSQL(), $this->getSQLParams());//execute the sql query
 
       //set data to the query result
        $this->setData( array(
            "length" => 0,
            "message" => "success",
            "data" => $queryResult
        ));
    }

    //getter and setter for the decoded userid
    public function getDecoded(){
        return $this->decodedId;
    }
    protected function setDecoded($data) {
        $this->decodedId = $data;
    }


    protected function initialiseSQL(){
 
        $sql= "SELECT savedJobs_id, job_id, user_id FROM savedjobs WHERE user_id = :userid";
        $this->setSQL($sql);
        $this->setSQLParams([ ':userid' => $this->getDecoded() ]);
    }

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
          //decode the userid from the jwt token
          $this->setDecoded ($decoded->sub);
        }catch(Exception $e){
            throw new ClientErrorException($e->getMessage(),401);
        }

        if($decoded->iss !=$_SERVER['HTTP_HOST']){
            throw new ClientErrorException("invalid token issuer", 401);
        }
    }

}