<?php
use FirebaseJWT\JWT;
use FirebaseJWT\Key;
/**
 * Creates a new job requested by employer account
 * if valid credentials are approved through JWT
 * 
 * @param userid,jobName,jobType,jobDescription,jobRequirements,jobDuties,jobDate,jobSalary,jobCity,jobPostcode
 * are being inserted in the database to create a new job
 * 
 * @method POST
 * @author Marius Oprea
 * @id w20039534
 */
class Createjob extends Endpoint {

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
        $jobName = $_POST['jobName'];
        $jobType = $_POST['jobType'];
        $jobDescription = $_POST['jobDescription'];
        $jobRequirements = $_POST['jobRequirements'];
        $jobDuties = $_POST['jobDuties'];
        $jobDate = $_POST['jobDate'];
        $jobSalary = $_POST['jobSalary'];
        $jobCity = $_POST['jobCity'];
        $jobPostcode = $_POST['jobPostcode'];

        $sql= "INSERT INTO job(user_id, job_name, job_type, job_description, job_requirements, job_jobDuties, job_datePosted, job_salary, job_city, job_postcode) 
        VALUES(:userid, :jobName, :jobType, :jobDescription, :jobRequirements, :jobDuties, :jobDate, :jobSalary, :jobCity, :jobPostcode )";


        $this->setSQL($sql);
        $this->setSQLParams([':userid'=>$userid, ':jobName'=>$jobName, ':jobType'=>$jobType, ':jobDescription'=>$jobDescription, 
        ':jobRequirements'=>$jobRequirements, ':jobDuties'=>$jobDuties, ':jobDate'=>$jobDate, ':jobSalary'=>$jobSalary, ':jobCity'=>$jobCity, 
        ':jobPostcode'=>$jobPostcode]);
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

      if (!filter_has_var(INPUT_POST,'jobDate')) {
        throw new ClientErrorException("job date parameter required", 400);
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