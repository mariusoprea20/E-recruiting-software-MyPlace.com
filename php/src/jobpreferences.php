<?php
/**
 * Retrieves all job preferences from the database
 * 
 * @param userid returns the user id of the user and extracts all
 * job preferences details where the user id matches any id
 * 
 * @method GET
 * @author Marius Oprea
 * @id w20039534
 */
class JobPreferences extends Endpoint{

    protected function initialiseSQL(){

        $this->validateParams($this->endpointParams());

        $sql = "SELECT pref_id, user_id, job_name, job_type, job_city, minSalary, maxSalary FROM jobpreferences ";

        //sql parameters
        $sqlParams=array();

        /**
         * Search by user id
         */
    if(filter_has_var(INPUT_GET, 'userid')){
        if(!filter_var($_GET['userid'],FILTER_VALIDATE_INT)){
                http_response_code(400);
                $output['message']="Bad Request trying to access the page ".$_SERVER['REQUEST_URI'];
                die(json_encode($output));
            }
    //sanitise the paper id
        if(isset($where)){
            $where .=" AND user_id = :userid";
        } else{
            $where = " WHERE user_id = :userid";
        }
        $sqlParams[':userid']=$_GET['userid']; //pass the URL parameter value in the associative array
    }
        //if $where is set, link it to the sql statement
        if(isset($where)){
            $sql .= $where;
        }
        $this->setSQL($sql);
        $this->setSQLParams($sqlParams);

    }

    //set the params
    protected function endpointParams(){
        return ['userid'];
    }
}