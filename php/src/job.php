<?php
/**
 * Retrieves all job details of a particular employer
 * 
 * @param jobid,userid,jobname,salary,jobcity,jobpostcode are used here
 * to filter out the data on user request
 * 
 * @method GET
 * @author Marius Oprea
 * @id w20039534
 */

 
class Job extends Endpoint{

    protected function initialiseSQL(){

        $this->validateParams($this->endpointParams());

        $sql= "SELECT job.job_id, job.job_name, job_type, job.job_description, job.job_requirements, job.job_jobDuties,
               job.job_datePosted, job.job_salary, job.job_city, job.job_postcode, user.user_id, user.firstName, 
               user.lastName 
               FROM job
               JOIN user ON (user.user_id = job.user_id)";
        //sql parameters
        $sqlParams=array();

        /**
         * Search by  job id
         */
        if(filter_has_var(INPUT_GET, 'jobid')){
            if(!filter_var($_GET['jobid'], FILTER_VALIDATE_INT))
            http_response_code(400); //bad request 
            $output['message']= "Bad Request Trying To Access The Page ".$_SERVER['REQUEST_URI'];
            die(json_encode($output));
        
            if(isset($where)){
                $where .= "AND job.job_id = :jobid";
            }else{
                $where = "WHERE job.job_id = :jobid";
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
                $where .= "AND user.user_id = :userid";
            }else{
                $where = "WHERE user.user_id = :userid";
            }
            $sqlParams[':userid']= $_GET['userid'];
        }

        /**
         * Search by job name
         */
        if(filter_has_var(INPUT_GET, 'jobname')){
        
            if(isset($where)){
                $where .= "AND job.job_name = :jobname";
            }else{
                $where = "WHERE job.job_name = :jobname";
            }
            $sqlParams[':jobname']= $_GET['jobname'];
        }

        /**
         * Search by job salary
         */
        if(filter_has_var(INPUT_GET, 'salary')){
            if(!filter_var($_GET['salary'], FILTER_VALIDATE_INT))
            http_response_code(400); //bad request 
            $output['message']= "Bad Request Trying To Access The Page ".$_SERVER['REQUEST_URI'];
            die(json_encode($output));
        
            if(isset($where)){
                $where .= "AND job.job_salary = :salary";
            }else{
                $where = "WHERE job.job_salary = :salary";
            }
            $sqlParams[':salary']= $_GET['salary'];
        }

        /**
         * Search by job city
         */
        if(filter_has_var(INPUT_GET, 'jobcity')){
        
            if(isset($where)){
                $where .= "AND job.job_city = :jobcity";
            }else{
                $where = "WHERE job.job_city = :jobcity";
            }
            $sqlParams[':jobcity']= $_GET['jobcity'];
        }

        /**
         * Search by job postcode
         */
        if(filter_has_var(INPUT_GET, 'jobpostcode')){
        
            if(isset($where)){
                $where .= "AND job.job_postcode = :jobpostcode";
            }else{
                $where = "WHERE job.job_postcode = :jobpostcode";
            }
            $sqlParams[':jobpostcode']= $_GET['jobpostcode'];
        }

        //if $where is set, link it to the sql statement
        if(isset($where)){
            $sql.=$where;
        }
        $this->setSQL($sql);
        $this->setSQLParams($sqlParams);

    }

    //only two params will be used here
    protected function endpointParams(){
        return ['jobid', 'userid'];
    }
}