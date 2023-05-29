<?php

/**
 * Select all users from the database
 * 
 * 
 * @method GET
 * @author Marius Oprea
 * @id w20039534
 */

class User extends Endpoint{

    protected function initialiseSQL(){

        $this->validateParams($this->endpointParams());

        $sql = "SELECT user_id, user_type, email, password, firstName, lastName, prefSalary, skills, 
        jobTitle, description, city, postcode, telNumber FROM user ";

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
        /**
         * Search by user username
         */
        if(filter_has_var(INPUT_GET, 'username')){

            if(isset($where)){
                $where .= " AND email LIKE :username";
            }else{
                $where = "WHERE email LIKE :username";
            }
            $sqlParams[':username'] = $_GET['username'];
        }

        /**
         * Search by user type
         */
        if(filter_has_var(INPUT_GET, 'usertype')){

            if(isset($where)){
                $where .= " AND user_type LIKE :usertype";
            }else{
                $where = "WHERE user_type LIKE :usertype";
            }
            $sqlParams[':usertype'] = $_GET['usertype'];
        }

        /**
         * Search by user first name
         */
        //sanitise the title
        if(filter_has_var(INPUT_GET, 'fname')){
            if(isset($where)){
                $where .= " AND firstName LIKE :fname";
            } else{
                $where = "WHERE firstName LIKE :fname";
            }
        $sqlParams[':fname']=$_GET['fname']; //pass the URL parameter value in the associative array
        }

        /**
         * Search by user last name
         */
        if(filter_has_var(INPUT_GET, 'lastname')){

            if(isset($where)){
                $where .= " AND lastName LIKE :lastname";
            }else{
                $where = "WHERE lastName LIKE :lastname";
            }
            $sqlParams[':lastname'] = $_GET['lastname'];
        }

         /**
         * Search by user skills
         */
        if(filter_has_var(INPUT_GET, 'candidateskills')){

            if(isset($where)){
                $where .= " AND skills LIKE :candidateskills";
            }else{
                $where = "WHERE skills LIKE :candidateskills";
            }
            $sqlParams[':candidateskills'] = $_GET['candidateskills'];
        }

        //if $where is set, link it to the sql statement
        if(isset($where)){
            $sql .= $where;
        }
        $this->setSQL($sql);
        $this->setSQLParams($sqlParams);

    }

    //set the url params
    protected function endpointParams(){
        return ['userid', 'username', 'fname', 'lastname', 'candidateskills', 'usertype'];
    }
}