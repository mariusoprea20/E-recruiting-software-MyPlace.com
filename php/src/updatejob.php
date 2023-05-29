<?php

use FirebaseJWT\JWT;
use FirebaseJWT\Key;
/**
 * Update the job table.
 * 
 * @method POST
 * @author Marius Oprea
 * @id w20039534
 */
class UpdateJob extends Endpoint {

    public function __construct()
    {
       $db = new Database(DATABASE);//set the db
       $this->validateRequestMethod('POST');
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
        $jobid = $_POST['jobid'];
        $jobName = $_POST['jobName'];
        $jobType = $_POST['jobType'];
        $jobDescription = $_POST['jobDescription'];
        $jobRequirements = $_POST['jobRequirements'];
        $jobDuties = $_POST['jobDuties'];
        $jobSalary = $_POST['jobSalary'];
        $jobCity = $_POST['jobCity'];
        $jobPostcode = $_POST['jobPostcode'];

        $sql = "Update job SET job_name = :jobName, job_type = :jobType, job_description = :jobDescription,
                job_requirements = :jobRequirements, job_jobDuties = :jobDuties, job_salary = :jobSalary,
                job_city = :jobCity, job_postcode = :jobPostcode 
                WHERE job_id = :jobid";
        $this->setSQL($sql);
        $this->setSQLParams([':jobid'=>$jobid, ':jobName'=>$jobName, ':jobType'=>$jobType, ':jobDescription'=>$jobDescription, 
        ':jobRequirements'=>$jobRequirements, ':jobDuties'=>$jobDuties,':jobSalary'=>$jobSalary, ':jobCity'=>$jobCity, 
        ':jobPostcode'=>$jobPostcode]);
    }

    //function validate the request method
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

        if (!filter_has_var(INPUT_POST,'jobid')) {
           throw new ClientErrorException("job id parameter required", 400);
         }
   
         if (!filter_has_var(INPUT_POST,'jobName')) {
           throw new ClientErrorException("job name parameter required", 400);
         }
   
         if (!filter_has_var(INPUT_POST,'jobType')) {
           throw new ClientErrorException("job type parameter required", 400);
         }
   
         if (!filter_has_var(INPUT_POST,'jobDescription')) {
           throw new ClientErrorException("job desc parameter required", 400);
         }
   
         if (!filter_has_var(INPUT_POST,'jobRequirements')) {
           throw new ClientErrorException("job requirements parameter required", 400);
          }
   
         if (!filter_has_var(INPUT_POST,'jobDuties')) {
           throw new ClientErrorException("job duties parameter required", 400);
         }
   
         if (!filter_has_var(INPUT_POST,'jobSalary')) {
           throw new ClientErrorException("job salary parameter required", 400);
         }
         if (!filter_var($_POST['jobSalary'], FILTER_VALIDATE_INT)) {
           throw new ClientErrorException("Invalid salary", 400);
         }
         if (!filter_has_var(INPUT_POST,'jobCity')) {
           throw new ClientErrorException("job city parameter required", 400);
         }
   
         if (!filter_has_var(INPUT_POST,'jobPostcode')) {
           throw new ClientErrorException("job postcode parameter required", 400);
         }
   
       }

}