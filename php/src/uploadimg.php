<?php

use FirebaseJWT\JWT;
use FirebaseJWT\Key;
/**
 * Upload a new profile img as blob type in database
 * if valid credentials are approved through JWT
 * 
 * @param file returns the profile img and it is being stored
 * in the database where the userid matches @param userid
 * 
 * @method POST
 * @author Marius Oprea
 * @id w20039534
 */
class UploadImg extends Endpoint {

    public function __construct()
    {
       $db = new Database(DATABASE);
       $this->validateRequestMethod('POST');
       $this->validateToken();
       $this->initialiseSQL();
       $queryResult = $db->executeSQL($this->getSQL(), $this->getSQLParams());
 
        $this->setData( array(
            "length" => 0,
            "message" => "success",
            "data" => null
        ));
    }

    protected function initialiseSQL(){

        //check if the profile img file is being sent in the url and there are no upload errors
        if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {
            $file=$_FILES['file'];//get the file name
            $fileName = $_FILES['file']['name'];//get the file type
            $fileTmp = $_FILES['file']['tmp_name'];//get the file tmp name
            $fileSize = $_FILES['file']['size'];//get the file size
            $fileType = $_FILES['file']['type'];//get the file type
            $fileExt = explode('.', $fileName);//explode the filename to get the extension
            $fileActualExt = strtolower(end($fileExt));//store the extension of the file
            //set what types of file are allowed
            $allowed = array('jpg', 'jpeg', 'png');

            //check if the profile img file type is allowed
            if(in_array($fileActualExt, $allowed )) {
                //check the size of the image
                if($fileSize < 10000000){
                    //get the img content
                    $fileContents = file_get_contents($fileTmp);
                    // store the img in the database
                    $sql = "UPDATE user SET logo = :logo WHERE user_id = :userid";
                    $this->setSQL($sql);
                    $this->setSQLParams([':userid'=>$_POST['userid'], ':logo'=>$fileContents]);
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