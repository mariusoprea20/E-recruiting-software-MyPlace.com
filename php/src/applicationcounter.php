<?php
/**
 * ApplicationCounter retrieves the each applications made on employer's jobs. 
 * 
 * @param userid returns the employer id and it is used to retrieve all applications
 * made on employer's jobs to be displayed as notifications in the frontend
 * 
 * @method GET
 * @author Marius Oprea
 * @id w20039534
 */

class ApplicationCounter extends Endpoint{
    protected function initialiseSQL(){
        //validate the parameters
        $this->validateParams($this->endpointParams());
        //select statement
        $sql= "SELECT job.job_id, user.user_id, application.applicationId, application.job_id, application.status
               FROM job
               JOIN user ON(user.user_id = job.user_id)
               JOIN application ON(job.job_id = application.job_id)";

        //sql parameters
        $sqlParams=array();
        //detect if there is any userid parameter  and make sure it is of type int
        if(filter_has_var(INPUT_GET, 'userid')){
            if(!filter_var($_GET['userid'], FILTER_VALIDATE_INT)){
                http_response_code(400); //bad request 
                $output['message']= "Bad Request Trying To Access The Page ".$_SERVER['REQUEST_URI'];
                die(json_encode($output));
            }
        
            if(isset($where)){
                $where .= "AND user.user_id = :userid";
            }else{
                $where = "WHERE user.user_id = :userid";
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
    //set the endpoint parameter
    protected function endpointParams(){
        return ['userid'];
    }
}