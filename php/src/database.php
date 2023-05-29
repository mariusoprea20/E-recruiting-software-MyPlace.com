<?php
/**
 * Database class used to connect to the database file
 * using the PDO class and provides prepared statements
 *  to be used in the endpoints for better security.
 * 
 * @author Marius Oprea
 * @id w20039534
 */
class Database{

    private $dbConnection;

    public function __construct($dbName){
        $this->setDBConnection($dbName);
    }

    public function setDBConnection($dbName){
        $this->dbConnection = new PDO('sqlite:'.$dbName);
        $this->dbConnection->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
    }

    public function getDBConnection(){
        return $this->dbConnection;
    }

    public function executeSQL($sql, $params=[]){
        //1. prepare the sql statement
        $stmt= $this->dbConnection->prepare($sql);
        //2. execute the params in the array
        $stmt->execute($params);
        //3. fetch the data and return it into an indexed array
        return $stmt->fetchAll(PDO::FETCH_ASSOC);


    }

    //fetch single column for cv deletion
    public function fetchSingleColumn($sql, $params=[]) {
        $stmt = $this->dbConnection->prepare($sql);
        $stmt->execute($params);
        return $stmt->fetchColumn();
    }
}