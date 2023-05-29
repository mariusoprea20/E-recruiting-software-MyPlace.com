<?php
use FirebaseJWT\JWT;
use FirebaseJWT\Key;
/**
 *Update chat status if valid credentials are approved through JWT
 * This class is being used when the user clicks on the chatroom in the 
 * ChatApp.js to prevent the chat status altercation.
 * If the employer has a new message and he clicks on the chatroom after he sends a message to the jobseeker,
 *  the database will be updated with "old" status and but the jobseeker status will remain "new".
 * 
 * 
 * @param chatid,messagestatus,usertype are used to update the status of user chat in the db
 * 
 * @method POST
 * @id w20039534
 */
class UpdateChatStatus extends Endpoint {


    public function __construct()
    {
       $db = new Database(DATABASE);//set the db
       $this->validateRequestMethod('POST');//validate the post request method
       $this->validateToken();//validate the token
       $this->initialiseSQL();//initialise the sql query 
       $queryResult = $db->executeSQL($this->getSQL(), $this->getSQLParams());//execute the sql query
 
        $this->setData( array(
            "length" => 0,
            "message" => "success",
            "data" => null
        ));
    }

    protected function initialiseSQL(){
        $datetimenow = date('Y-m-d H:i:s');//get the current date
        $chatid = $_POST["chatid"];//get the chatid
        $messageStatus = $_POST["messageStatus"];//get the message stauts (old, new)
        $usertype= $_POST['usertype'];//get the usertype

        //if the usertype is employer, update the chat with the current time , messageemployer = old
        if($usertype==="employer"){
                  $sql = "UPDATE chat SET messageemployer =:messageemployer, datetime=:datetimenow  WHERE  chatId = :chatid" ;
                  
                  $this->setSQL($sql);
                  $this->setSQLParams([':chatid' => $chatid, ':messageemployer' => $messageStatus, ':datetimenow'=>$datetimenow]);
        }else {
            //if the usertype is employer, update the chat with the current time , messagejobseeker = old
            $sql = "UPDATE chat SET messagejobseeker=:messagejobseeker, datetime=:datetimenow  WHERE  chatId = :chatid" ;
                  
            $this->setSQL($sql);
            $this->setSQLParams([':chatid' => $chatid,':messagejobseeker'=>$messageStatus, ':datetimenow'=>$datetimenow]);

        }
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
}