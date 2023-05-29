<?php
/**
 * Creates a new user account in the database.
 * 
 * @method GET
 * @author Marius Oprea
 * @id w20039534
 */
class Signup extends Endpoint {

    public function __construct()
    {
       $db = new Database(DATABASE);//set the db
       $this->validateRequestMethod('POST');//validate the post method
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

      //get all url params needed
        $userType = $_POST['usertype'];
        $email = $_POST['email'];
        $password = password_hash($_POST['password'], PASSWORD_DEFAULT);
        $firstName = $_POST['firstName'];
        $lastName = $_POST['lastName'];
        $city = $_POST['city'];
        $postcode = $_POST['postcode'];
        $telNumber = $_POST['telNumber'];

        //check if the default profile image is being set and with no errors
        if (isset($_FILES['file']) && $_FILES['file']['error'] === UPLOAD_ERR_OK) {

          $file=$_FILES['file'];//get the file
          $fileName = $_FILES['file']['name'];//get the filename
          $fileTmp = $_FILES['file']['tmp_name'];//get the file temp name
          $fileSize = $_FILES['file']['size'];//get the file size
          $fileType = $_FILES['file']['type'];//get the file type
          $fileExt = explode('.', $fileName);//get the name of the file and extension stored in an array
          $fileActualExt = strtolower(end($fileExt));//store the extension of the file
          //allow only these file types to be stored in the db
          $allowed = array('jpg', 'jpeg', 'png');

          //check if the file extansion is allowed
          if(in_array($fileActualExt, $allowed )) {
            //check if the file size is allowed
              if($fileSize < 10000000){
                //get the content of the file temp
                  $fileContents = file_get_contents($fileTmp);
                  //if everything ok so far, create the user account in the db
                  $sql= "INSERT INTO user(user_type,  email, password, firstName, lastName, city, postcode, telNumber, logo) 
                  VALUES(:usertype, :email, :password, :firstName, :lastName, :city, :postcode, :telNumber, :logo)";
          
                  $this->setSQL($sql);
                  $this->setSQLParams([':usertype'=>$userType,':email'=>$email, ':password'=>$password, ':firstName'=>$firstName, ':lastName'=>$lastName, 
                  ':city'=>$city, ':postcode'=>$postcode, ':telNumber'=>$telNumber, ':logo'=>$fileContents]);

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
      
    //validate the url params
    private function validateUpdateParams(){

     if (!filter_has_var(INPUT_POST,'usertype')) {
        throw new ClientErrorException("usertype parameter  required", 400);
      }

      if (!filter_has_var(INPUT_POST,'email')) {
        throw new ClientErrorException("email parameter required", 400);
      }

      if (!filter_has_var(INPUT_POST,'password')) {
        throw new ClientErrorException("password parameter required", 400);
      }

      if (!filter_has_var(INPUT_POST,'firstName')) {
        throw new ClientErrorException("first name parameter required", 400);
      }

      if (!filter_has_var(INPUT_POST,'lastName')) {
        throw new ClientErrorException("last name parameter required", 400);
       }

      if (!filter_has_var(INPUT_POST,'city')) {
        throw new ClientErrorException("city parameter required", 400);
      }

      if (!filter_has_var(INPUT_POST,'postcode')) {
        throw new ClientErrorException("postcode parameter required", 400);
      }

      if (!filter_has_var(INPUT_POST,'telNumber')) {
        throw new ClientErrorException("telephone number parameter required", 400);
      }
      if (!filter_var($_POST['email'], FILTER_VALIDATE_EMAIL)) {
        throw new ClientErrorException("Invalid email address", 400);
      }
    }
}