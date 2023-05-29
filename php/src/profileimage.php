<?php
  /**
 * Retrieve and display the user profile image
 * 
 * @param userid returns the id of the user and displays the profile img on the browser.
 * 
 * @method GET
 * @author Marius Oprea
 * @id w20039534
 */
class ProfileImage extends Endpoint{
  public function __construct()
    {
      $db = new Database(DATABASE);//set the db
      $this->initialiseSQL();//initialise the sql query
      $queryResult = $db->executeSQL($this->getSQL(), $this->getSQLParams());//execute the sql query
      $imageData = $queryResult[0]['logo'];//get the profile img
  
      header("Content-Type: image/jpg"); //set the header
      echo($imageData);//echo the img out
    }
  
    protected function initialiseSQL()
    {
      $userid = $_GET['userid'];
  
      $sql = "SELECT  logo FROM user WHERE user_id=:userid";
      $this->setSQL($sql);
      $this->setSQLParams([':userid'=>$userid]);
    }
}