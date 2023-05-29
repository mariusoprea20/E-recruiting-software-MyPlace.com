<?php
use FirebaseJWT\JWT;
use FirebaseJWT\Key;
/**
 * Creates a saved job in the DB requested by the jobseeker
 * if valid credentials are approved through JWT
 * 
 * @param userid,jobid are inserted in the db to create a saved job.
 * 
 * @method POST
 * @author Marius Oprea
 * @id w20039534
 */
class CreateJobSave extends Endpoint {

    public function __construct()
    {
       $db = new Database(DATABASE);
       $this->validateRequestMethod('POST');
       $this->validateToken();
       $this->validateUpdateParams();
       $this->initialiseSQL();
       $queryResult = $db->executeSQL($this->getSQL(), $this->getSQLParams());
 
        $this->setData( array(
            "length" => 0,
            "message" => "success",
            "data" => null
        ));
    }

    protected function initialiseSQL(){

        $userid = $_POST['userid'];
        $jobid = $_POST['jobid'];

                  $sql= "INSERT INTO savedjobs(user_id, job_id ) 
                  VALUES(:userid, :jobid)";
                  $this->setSQL($sql);
                  $this->setSQLParams([':userid' => $userid, ':jobid' => $jobid]);
    }

    //create a function to validate the request method in the constructor
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
    //validate the url params
    private function validateUpdateParams(){

     if (!filter_has_var(INPUT_POST,'userid')) {
        throw new ClientErrorException("userid parameter required", 400);
      }
      if (!filter_has_var(INPUT_POST,'jobid')) {
        throw new ClientErrorException("jobid parameter required", 400);
      }

    }
}