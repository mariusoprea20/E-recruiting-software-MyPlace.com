<?php
/**
 * Retrieves the CV of the application when requesting
 * if valid credentials are approved through JWT, and displays it in the browser
 * @param applicationid returns the id of an application and 
 * retrieves the bool CV from the database if the id matches
 * 
 * @method GET
 * @author Marius Oprea
 * @id w20039534
 */
 
class JobApplicationCv extends Endpoint{
  public function __construct()
    {
      $db = new Database(DATABASE);//set the db
      $this->initialiseSQL();//initialise the sql query
      $queryResult = $db->executeSQL($this->getSQL(), $this->getSQLParams());//execute the sql query
      $cv = $queryResult[0]['candidate_CV'];//get the jobseeker cv
      header("Content-Type: application/pdf");//set the header
      echo($cv);//echo the cv
    }
    protected function initialiseSQL()
    {
      $applicationID = $_GET['applicationid'];
  
      $sql = "SELECT applicationId, candidate_CV FROM application WHERE applicationId = :applicationid";
      $this->setSQL($sql);
      $this->setSQLParams([':applicationid'=>$applicationID]);
    }
}