<?php

use FirebaseJWT\JWT;
 
/**
 * Authenticate username and password
 *
 * This class will check a username and password again those held in the 
 * database. Where authentication is successful it will return a JWT.
 *
 * @method POST
 * @author Marius Oprea
 * @id w20039534
 */
class Authenticate extends Endpoint
{

    public function __construct() {

        $db = new Database(DATABASE);
        $this->validateRequestMethod("POST");
        $this->validateAuthParameters();
        $this->initialiseSQL();
        $queryResult = $db->executeSQL($this->getSQL(), $this->getSQLParams());
        $this->validateUsername($queryResult);
        $this->validatePassword($queryResult);
        $tokenData['token'] = $this->createJWT($queryResult);

        $this->setData( array(
          "length" => 0, 
          "message" => "success",
          "data" => $tokenData,
          "dbdata" =>$queryResult
        ));
    }


    protected function initialiseSQL() {
        $sql = "SELECT user_id, user_type, email, password, firstName, lastName
        FROM user WHERE email = :username";
        $this->setSQL($sql);
        $this->setSQLParams([':username'=>$_SERVER['PHP_AUTH_USER']]);
    }

    private function validateRequestMethod($method) {
        if ($_SERVER['REQUEST_METHOD'] != $method){

            throw new ClientErrorException("Invalid request method", 405);
        }
    }

    private function validateAuthParameters(){
        if(!isset($_SERVER['PHP_AUTH_USER']) || !isset($_SERVER['PHP_AUTH_PW'])){

            throw new ClientErrorException("Please enter username and password", 401);
        }
    }

    private function validateUsername($queryResult){
        if(count($queryResult)<1){

            throw new ClientErrorException("Invalid username", 401);
        }
    }
    private function validatePassword($queryResult){
        if(!password_verify($_SERVER['PHP_AUTH_PW'] , $queryResult[0]['password'])){
            
            throw new ClientErrorException("Invalid password", 401);
        }
    }

    private function createJWT($queryResult) {
 
        // Uses the secret key defined earlier
        $secretKey = SECRET;
       
        $time= time();
        // Specify what to add to the token payload. 
        $tokenPayload = [
          'iat' =>$time,
          'exp' => strtotime('+1 day', $time),
          'iss' => $_SERVER['HTTP_HOST'], 
          'sub' =>$queryResult[0]['user_id']
        ];
            
        // Use the JWT class to encode the token  
        $jwt = JWT::encode($tokenPayload, $secretKey, 'HS256');
        
        return $jwt;
      }
}