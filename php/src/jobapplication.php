<?php

/**
 * Retrieves all job application details that matches the user and job tables
 * 
 * @param applicationID,userid,jobid, are used here
 * to filter out the data on user request
 * 
 * @method GET
 * @author Marius Oprea
 * @id w20039534
 */

class JobApplication extends Endpoint{
    protected function initialiseSQL(){

        $this->validateParams($this->endpointParams());

        $sql= "SELECT application.applicationId, application.job_id, application.application_date,
              application.status, application.notes, application.user_id, user.user_type, user.firstName, 
              user.lastName, user.skills, user.telNumber, user.email, user.prefSalary, user.description, job.job_name 
               FROM application
               JOIN user ON(user.user_id = application.user_id)
               JOIN job ON(job.job_id = application.job_id)";

        //sql parameters
        $sqlParams=array();

        /**
         * Search by application id
         */
        if(filter_has_var(INPUT_GET, 'applicationID')){
            if(!filter_var($_GET['applicationID'], FILTER_VALIDATE_INT)){
                http_response_code(400); //bad request 
                $output['message']= "Bad Request Trying To Access The Page ".$_SERVER['REQUEST_URI'];
                die(json_encode($output));
            }
        
            if(isset($where)){
                $where .= "AND application.applicationId = :applicationID";
            }else{
                $where = "WHERE application.applicationId = :applicationID";
            }
            $sqlParams[':applicationID']= $_GET['applicationID'];
        }

        /**
         * Search by job id
         */
        if(filter_has_var(INPUT_GET, 'jobid')){
            if(!filter_var($_GET['jobid'], FILTER_VALIDATE_INT)){
                http_response_code(400); //bad request 
                $output['message']= "Bad Request Trying To Access The Page ".$_SERVER['REQUEST_URI'];
                die(json_encode($output));
            }
        
            if(isset($where)){
                $where .= "AND application.job_id = :jobid";
            }else{
                $where = "WHERE application.job_id = :jobid";
            }
            $sqlParams[':jobid']= $_GET['jobid'];
        }

        /**
         * Search by user id
         */
        if(filter_has_var(INPUT_GET, 'userid')){
            if(!filter_var($_GET['userid'], FILTER_VALIDATE_INT)){
                http_response_code(400); //bad request 
                $output['message']= "Bad Request Trying To Access The Page ".$_SERVER['REQUEST_URI'];
                die(json_encode($output));
            }
        
            if(isset($where)){
                $where .= "AND application.user_id = :userid";
            }else{
                $where = "WHERE application.user_id = :userid";
            }
            $sqlParams[':userid']= $_GET['userid'];
        }

        
        //if $where is set, link it to the sql statement
        if(isset($where)){
            $sql.=$where;
        }
        $this->setSQL($sql);
        $this->setSQLParams($sqlParams);
        
    }

    //set the url params
    protected function endpointParams(){
        return ['userid', 'jobid', 'applicationID'];
    }
}