<?php
use FirebaseJWT\JWT;
use FirebaseJWT\Key;
/**
 * Creates a new job application made by the jobseeker
 * if valid credentials are approved through JWT
 * 
 * @param userid returns the userid of the jobseeker and creates a new job application
 * in the database with the @param jobid of the applied job and jobseeker cv @param file stored as blob
 * 
 * @method POST
 * @author Marius Oprea
 * @id w20039534
 */
class CreateApplication extends Endpoint {

    public function __construct()
    {
       $db = new Database(DATABASE);//initialise db
       $this->validateRequestMethod('POST');//validate post method
       $this->validateToken();//validate the token
       $this->validateUpdateParams();//validate he params
       $this->initialiseSQL();//initialise the sql query
       $queryResult = $db->executeSQL($this->getSQL(), $this->getSQLParams());//execute the sql query
 
        $this->setData( array(
            "length" => 0,
            "message" => "success",
            "data" => null
        ));
    }

    protected function initialiseSQL(){
        //get the url parameters
        $userid = $_POST['userid'];
        $jobid = $_POST['jobid'];
        $applicationDate = $_POST['applicationDate'];

        //check if the CV file was sent through the URL and check for any errors
        if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
          $file=$_FILES['file'];//get the file
          $fileName = $_FILES['file']['name'];//get the file name
          $fileTmp = $_FILES['file']['tmp_name']; //get the file temporary name
          $fileSize = $_FILES['file']['size'];//get the file size
          $fileType = $_FILES['file']['type'];//get the file type
          $fileExt = explode('.', $fileName);//explode the name by delimitor '.' in an array
          $fileActualExt = strtolower(end($fileExt)); //get the extension at the end of the filename ex .pdf
          //set the allowed extensions
          $allowed = array( 'jpg', 'jpeg', 'png', 'pdf');
          //check if the file extensions is allowed
          if(in_array($fileActualExt, $allowed )) {
            //check if the filesize ie less than 50MG
              if($fileSize < 50000000){
                  $fileContents = file_get_contents($fileTmp);//get the content of the temp file
                  //sql insert statement
                  $sql= "INSERT INTO application(user_id, job_id, application_date, candidate_CV ) 
                  VALUES(:userid, :jobid, :applicationDate, :candidateCV  )";
                  $this->setSQL($sql);
                  $this->setSQLParams([':userid' => $userid, ':jobid' => $jobid, ':applicationDate' => $applicationDate, 
                                       ':candidateCV' => $fileContents]);
                } else {
                  throw new ClientErrorException("File size over the limit required", 406);
              }
          } else {
              throw new ClientErrorException("File type not allowed", 406);
          }
      } else {
          throw new ClientErrorException("Error with uploading the file", 406);
      }
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

    private function validateUpdateParams(){

     if (!filter_has_var(INPUT_POST,'userid')) {
        throw new ClientErrorException("userid parameter required", 400);
      }
      if (!filter_has_var(INPUT_POST,'jobid')) {
        throw new ClientErrorException("jobid parameter required", 400);
      }

    }
}