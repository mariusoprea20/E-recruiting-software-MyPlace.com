<?php
/**
 * A general class for endpoints
 * 
 * This class will be a parent for all endpoints ...
 * providing common methods. It has been declared as an abstract class
 * which means it is not possible to make an instance of this class itself.
 * 
 * @author Marius Oprea
 */
define('DATABASE', 'database/myPlace.db'); // constant

abstract class Endpoint 
{
    
    protected $data;
    protected $sql;
    protected $sqlParams;
 
    /**
     * Query the database and save the result 
     */
    public function __construct() {
        //pass the defined constant to the database class
        $db = new Database(DATABASE);
 
        // The initialiseSQL method can be overridden by
        // child classes to set the SQL as appropriate for
        // each endpoint
        $this->initialiseSQL();
        
        $data = $db->executeSQL($this->sql, $this->sqlParams);
 
        // We are following the pattern from the first
        // answer by providing the length of the data array 
        $this->setData( array(
            "length" => count($data),
            "message" => "success",
            "data" => $data
        ));
    }
 
    protected function setSQL($sql) {
        $this->sql = $sql;
    }
 
    protected function setSQLParams($params) {
        $this->sqlParams = $params;
    }
    protected function getSQL() {
        return $this->sql;
    }
 
    protected function getSQLParams() {
        return $this->sqlParams;
    }
 
    /**
     * Define SQL and params for the endpoint
     * 
     * This method can be overridden by child classes
     * with to set the SQL query needed for the specific
     * endpoint. It is just blank here because this is an
     * abstract endpoint.
     */
    protected function initialiseSQL() {
        $sql = "";
        $this->setSQL($sql);
        $this->setSQLParams([]);
    }
 
 
    protected function setData($data) {
        $this->data = $data;
    }
 
    public function getData() {
        return $this->data;
    }

    /**
 * Define valid parameters for this endpoint
 */
protected function endpointParams() {
    return [];
}
 
/**
 * Check the parameters used in request against an array of
 * valid parameters for the endpoint
 * 
 * @param array $params An array of valid param names (e.g. ['id', 'name'])
 */
protected function validateParams($params) {
    foreach ($_GET as $key => $value) {
        if (!in_array($key, $params)) {
            //display bad request message code
            http_response_code(400);
            $output['message'] = "Invalid parameter: " . $key;
            die(json_encode($output));
        }
     }    
}
}