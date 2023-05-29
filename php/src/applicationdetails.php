<?php

use FirebaseJWT\JWT;
use FirebaseJWT\Key;
/**
 * Selects the application job ids and dates
 * if valid credentials are approved through JWT
 * 
 * The userid of this request is decoded from JWT and passed in the sellect 
 * statement to retrieve the job id and job date from the application table
 * where the user id of the application matches the userid from the JWT token
 * 
 * @method POST
 * @author Marius Oprea
 * @id w20039534
 */

class ApplicationDetails extends Endpoint {
    protected $decodedId; //set default var
        public function __construct()
        {
           $db = new Database(DATABASE);//initialise the db
           $this->validateRequestMethod('POST');//validate the post method
           $this->validateToken();//validate the jwt token
           $this->initialiseSQL();//initialise the sql
           $queryResult = $db->executeSQL($this->getSQL(), $this->getSQLParams());//execute the sql query

        $this->setData(
            array(
                "length" => 0,
                "message" => "success",
                "data" => $queryResult,
                "userid" => $this->getDecoded()

            )
        );
    }
    //getter and setter for decoding the userid
    public function getDecoded(){
        return $this->decodedId;
    }
    protected function setDecoded($data) {
        $this->decodedId = $data;
    }

    protected function initialiseSQL(){
        $sql=" SELECT job_id, application_date FROM application WHERE user_id = :userid";
        $this->setSQL($sql);
        $this->setSQLParams([':userid'=>$this->getDecoded()]);
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
          //set the decoded userid 
          $this->setDecoded ($decoded->sub);
        }catch(Exception $e){
            throw new ClientErrorException($e->getMessage(),401);
        }
        //check the host of this request
        if($decoded->iss !=$_SERVER['HTTP_HOST']){
            throw new ClientErrorException("invalid token issuer", 401);
        }
    }
}