<?php

use FirebaseJWT\JWT;
use FirebaseJWT\Key;
/**
 * Checks if the jobseeker has an existing CV in the database and returns true or false.
 * 
 * @param userid returns the id of the jobseeker and query the database
 * to find out if the 'candidate_CV' is null or not. Returns true if CV is found or false if it's not.
 * 
 * @method POST
 * @author Marius Oprea
 * @id w20039534
 */
class CheckCandidateCV extends Endpoint {

  private $isCV;
    public function __construct()
    {
      $db = new Database(DATABASE);
      $this->validateRequestMethod('POST'); //validate the request method function
      $this->validateUpdateParams();//validate the params
      $this->validateToken();//validate the token
      $this->initialiseSQL();//initialise the sql query
      $queryResult = $db->executeSQL($this->getSQL(), $this->getSQLParams());//exec the sql query
  // Check if cv exists in database
  // this helps with error messiging when job seeker applies without CV
  if ($queryResult[0]['candidate_CV'] ===null) {
    $this->isCV = false;
  } else {
    $this->isCV = true;
  }
  
      $this->setData( array(
        "length" => 0,
        "message" => "success",
        "isCV"=>$this->isCV
      ));
    }
    //create the request method function
    private function validateRequestMethod($method) {
      if ($_SERVER['REQUEST_METHOD'] != $method) {
        throw new ClientErrorException("Invalid Request Method", 405);
      }
    }

    protected function initialiseSQL()
    {
      $userid = $_POST["userid"];
      $sql = "SELECT user_id, candidate_CV FROM user WHERE user_id=:userid";
      $this->setSQL($sql);
      $this->setSQLParams([':userid'=>$userid]);
    }

    private function validateToken()
    {
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
    //validate the parameter
    private function validateUpdateParams(){

        if (!filter_has_var(INPUT_POST,'userid')) {
           throw new ClientErrorException("userid parameter required", 400);
        }
       }
}