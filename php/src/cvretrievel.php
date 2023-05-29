<?php

use FirebaseJWT\JWT;
use FirebaseJWT\Key;
/**
 * Retrieves the CV of the jobseeker when requesting
 * if valid credentials are approved through JWT
 * 
 * @method POST
 * @author Marius Oprea
 * @id w20039534
 */
class CVRetrievel extends Endpoint {

  protected $decodedId;
  private $isCV;
    public function __construct()
    {
      $db = new Database(DATABASE);//set the db connection
      $this->validateRequestMethod('POST');//validate the post method
      $this->validateToken();//validate the token 
      $this->initialiseSQL();//initialise the sql query
      $queryResult = $db->executeSQL($this->getSQL(), $this->getSQLParams());//execute the sql query
  // Check if cv exists in database
  // this helps with error messeging when job seeker applies without CV
  if ($queryResult[0]['candidate_CV'] ===null) {
    $this->isCV = false;
  } else {
    $this->isCV = true;
  }
  /**
   * 'data' provides a link to another endpoing that display the CV and passes the decoded jobseekerid
   * 'isCV' checks if the cv exists and return true or false
   */
      $this->setData( array(
        "length" => 0,
        "message" => "success",
        "data" => 'http://unn-w20039534.newnumyspace.co.uk/myplace/php/displaycv?userid='.$this->getDecoded(),
        "userid" => $this->getDecoded(),
        "isCV"=>$this->isCV
      ));
    }

    //getter and setted for the jobseekerid
    public function getDecoded(){
      return $this->decodedId;
  }
    protected function setDecoded($data) {
      $this->decodedId = $data;
  }
  //function validate the request method
    private function validateRequestMethod($method) {
      if ($_SERVER['REQUEST_METHOD'] != $method) {
        throw new ClientErrorException("Invalid Request Method", 405);
      }
    }

    protected function initialiseSQL()
    {
  
      $sql = "SELECT user_id, candidate_CV FROM user WHERE user_id=:userid";
      $this->setSQL($sql);
      $this->setSQLParams([':userid'=>$this->getDecoded()]);
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
        //get the jobseekerid
        $this->setDecoded ($decoded->sub);
      }catch(Exception $e){
        throw new ClientErrorException($e->getMessage(),401);
      }
  
      if($decoded->iss !=$_SERVER['HTTP_HOST']){
        throw new ClientErrorException("invalid token issuer", 401);
      }
    }

}