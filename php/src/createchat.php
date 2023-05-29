<?php
use FirebaseJWT\JWT;
use FirebaseJWT\Key;
/**
 * Creates a new chatroom requested by the employer
 * if valid credentials are approved through JWT
 * 
 * @param guestuserid returns the userid of the jobseeker an creates a room in the database
 * by inserting the @param guestuserid, the current datetime and the employer id decoded from 
 * the jwt token
 * 
 * @method POST
 * @author Marius Oprea
 * @id w20039534
 */
class CreateChat extends Endpoint {

    protected $decodedId;//default var

    public function __construct()
    {
       $db = new Database(DATABASE);//initialise the db
       $this->validateRequestMethod('POST');//validate the post method
       $this->validateToken();//validate the token
       $this->validateUpdateParams();//validate the params
       $this->initialiseSQL();//initialise the sql
       $queryResult = $db->executeSQL($this->getSQL(), $this->getSQLParams());//execute the sql query
 
        $this->setData( array(
            "length" => 0,
            "message" => "success",
            "data" => null
        ));
    }
//getter and setter for decoding the employer id from the jwt token
    public function getDecoded(){
        return $this->decodedId;
    }
      protected function setDecoded($data) {
        $this->decodedId = $data;
    }

    protected function initialiseSQL(){

        $guestuserid = $_POST['guestuserid']; //get guest userid, in this case jobseeker
        $datetimenow = date('Y-m-d H:i:s');//get the current date time
        //insert statement
                  $sql= "INSERT INTO chat(user_id, usertargetid, datetime ) 
                  VALUES(:userid, :guestuserid, :datetimenow)";
                  $this->setSQL($sql);
                  $this->setSQLParams([':userid' => $this->getDecoded(), ':guestuserid' => $guestuserid, ':datetimenow'=>$datetimenow]);
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
          //decode the employer id from the jwt token
          $this->setDecoded ($decoded->sub);
        }catch(Exception $e){
            throw new ClientErrorException($e->getMessage(),401);
        }

        if($decoded->iss !=$_SERVER['HTTP_HOST']){
            throw new ClientErrorException("invalid token issuer", 401);
        }
    }
    //validate the params
    private function validateUpdateParams(){

     if (!filter_has_var(INPUT_POST,'guestuserid')) {
        throw new ClientErrorException("userid parameter required", 400);
      }

    }
}