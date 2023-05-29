<?php

use FirebaseJWT\JWT;
use FirebaseJWT\Key;
/**
 * Creates new job aler/job preferences  requested by the jobseeker
 * if valid credentials are approved through JWT
 * 
 * @param userid,jobName,jobType,jobCity,minSalary,maxSalary
 * are inserted into the db to create new job preferences
 * 
 * @method POST
 * @author Marius Oprea
 * @id w20039534
 */
class CreateJobPreferences extends Endpoint {

    public function __construct()
    {
       $db = new Database(DATABASE);//set the db
       $this->validateRequestMethod('POST');//validate the post method
       $this->validateToken();//validate the token
       $this->validateUpdateParams();//validate the params
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
        $jobName = $_POST['jobName'];
        $jobType = $_POST['jobType'];
        $jobCity = $_POST['jobCity'];
        $minSalary = $_POST['minSalary'];
        $maxSalary = $_POST['maxSalary'];

        $sql = "INSERT INTO jobpreferences(user_id, job_name, job_type, job_city, minSalary, maxSalary) 
        VALUES(:userid, :jobName, :jobType, :jobCity , :minSalary, :maxSalary)";
        $this->setSQL($sql);
        $this->setSQLParams([':userid'=>$userid, ':jobName'=>$jobName, ':jobType'=>$jobType, ':jobCity'=>$jobCity, 'minSalary'=>$minSalary , ':maxSalary'=>$maxSalary]);
    }
    //create a function to validate the request method
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
        if (!filter_has_var(INPUT_POST,'jobName')) {
            throw new ClientErrorException("jobName parameter required", 400);
        }
        if (!filter_has_var(INPUT_POST,'jobType')) {
            throw new ClientErrorException("jobType parameter required", 400);
        }
        if (!filter_has_var(INPUT_POST,'jobCity')) {
            throw new ClientErrorException("jobCity parameter required", 400);
        }
   
       }

}