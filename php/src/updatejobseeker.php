<?php

use FirebaseJWT\JWT;
use FirebaseJWT\Key;
/**
 * Update the jobseeker table.
 * 
 * @method POST
 * @author Marius Oprea
 * @id w20039534
 */
class UpdateJobSeeker extends Endpoint {

    public function __construct()
    {
       $db = new Database(DATABASE);//set the db
       $this->validateRequestMethod('POST');//validate the request method
       $this->validateToken();//validate the token
       $this->validateUpdateParams();//validate the url params
       $this->initialiseSQL();//initialise the sql query
       $queryResult = $db->executeSQL($this->getSQL(), $this->getSQLParams());//execute the sql query
 
        $this->setData( array(
            "length" => 0,
            "message" => "success",
            "data" => null
        ));
    }

    protected function initialiseSQL(){
        $userid = $_POST['userid'];
        $firstName = $_POST['firstName'];
        $lastName = $_POST['lastName'];
        $telNumber = $_POST['telNumber'];
        $city = $_POST['city'];
        $postcode = $_POST['postcode'];
        $description = $_POST['description'];
        $prefSalary = $_POST['prefSalary'];
        $skills = $_POST['skills'];
        $jobTitle = $_POST['jobTitle'];

        $sql = "Update user SET  firstName=:firstName, lastName=:lastName, telNumber=:telNumber,
                city=:city, postcode=:postcode, description=:description, prefSalary=:prefSalary,
                jobTitle=:jobTitle, skills=:skills
                WHERE user_id = :userid";
        $this->setSQL($sql);
        $this->setSQLParams([':userid'=>$userid, ':firstName'=>$firstName, ':lastName'=>$lastName, ':telNumber'=>$telNumber, 
        ':city'=>$city, ':postcode'=>$postcode,':description'=>$description, ':prefSalary'=>$prefSalary, ':jobTitle'=>$jobTitle, ':skills'=>$skills]);
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
   
         if (!filter_has_var(INPUT_POST,'firstName')) {
           throw new ClientErrorException("user first name parameter required", 400);
         }
   
         if (!filter_has_var(INPUT_POST,'lastName')) {
           throw new ClientErrorException("user last name parameter required", 400);
         }
   
         if (!filter_has_var(INPUT_POST,'description')) {
           throw new ClientErrorException("description parameter required", 400);
         }
   
         if (!filter_has_var(INPUT_POST,'postcode')) {
           throw new ClientErrorException("postcode parameter required", 400);
         }
   
         if (!filter_has_var(INPUT_POST,'city')) {
           throw new ClientErrorException("city parameter required", 400);
         }
         if (!filter_has_var(INPUT_POST,'telNumber')) {
          throw new ClientErrorException("tel number parameter required", 400);
         }
         if (!filter_has_var(INPUT_POST,'prefSalary')) {
            throw new ClientErrorException("preferred salary parameter required", 400);
         }
          if (!filter_has_var(INPUT_POST,'skills')) {
            throw new ClientErrorException("skills parameter required", 400);
         }
          if (!filter_has_var(INPUT_POST,'jobTitle')) {
            throw new ClientErrorException("job title parameter required", 400);
         }

         if (!filter_var($_POST['prefSalary'], FILTER_VALIDATE_INT)) {
            throw new ClientErrorException("Salary must be a number", 400);
         }
       }
}