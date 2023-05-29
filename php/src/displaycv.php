<?php
 /**
 * Retrieve and display the jobseeker CV
 * 
 * @param userid returns the id of the jobseeker and displays the CV on the browser.
 * 
 * @method GET
 * @author Marius Oprea
 * @id w20039534
 */
class DisplayCV extends Endpoint{
  public function __construct()
    {
      $db = new Database(DATABASE);//set the db
      $this->initialiseSQL();//initialise the sql
      $queryResult = $db->executeSQL($this->getSQL(), $this->getSQLParams());//execute the sql
      $cv = $queryResult[0]['candidate_CV'];//get the CV
      header("Content-Type: application/pdf");//set the header to pdf
      echo($cv);//echo the cv
    }
    protected function initialiseSQL()
    {
      $userid = $_GET['userid'];
  
      $sql = "SELECT  user_id, candidate_CV FROM user WHERE user_id=:userid";
      $this->setSQL($sql);
      $this->setSQLParams([':userid'=>$userid]);
    }
}