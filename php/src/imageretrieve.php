<?php

use FirebaseJWT\JWT;
use FirebaseJWT\Key;
 /**
 * Retrieve and display the profile image
 * if token is valid
 * 
 * @param userid returns the id of the user and displays the CV on the browser
 * 
 * @method POST
 * @author Marius Oprea
 * @id w20039534
 */
class ImageRetrieve extends Endpoint {

    public function __construct()
    {
      $db = new Database(DATABASE);
      $this->validateRequestMethod('POST');
      $this->validateToken();
      $this->validateUpdateParams();
      $this->initialiseSQL();
      $queryResult = $db->executeSQL($this->getSQL(), $this->getSQLParams());
      $imageData = $queryResult[0]['logo'];
  
      $this->setData( array(
        "length" => 0,
        "message" => "success",
        "data" => "http://unn-w20039534.newnumyspace.co.uk/myplace/php/profileimage?userid="
      ));
    }
  
    protected function initialiseSQL()
    {
      $userid = $_POST['userid'];
      $sql = "SELECT  user_id, logo FROM user WHERE user_id=:userid";
      $this->setSQL($sql);
      $this->setSQLParams([':userid'=>$userid]);
    }
  
    private function validateRequestMethod($method) {
      if ($_SERVER['REQUEST_METHOD'] != $method) {
        throw new ClientErrorException("Invalid Request Method", 405);
      }
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
    private function validateUpdateParams(){

        if (!filter_has_var(INPUT_POST,'userid')) {
           throw new ClientErrorException("user id parameter required", 400);
         }
   
       }

}