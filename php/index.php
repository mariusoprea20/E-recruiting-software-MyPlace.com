<?php
/**
 * Index Page
 * 
 * @author Marius Oprea
 * @id w20039534
 */

//allow all headers access and specify this is JSON data
header("Access-Control-Allow-Origin: *");
header("Content-Type: application/json; charset=UTF-8");
//allow the use of authentication headers
header("Access-Control-Allow-Headers: *");

//exit the pre-flight request when probing the headers
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {    
    exit(0);
} 

//Generate a security key that will be used in 
//Authenticate.PHP and Update.php
define('SECRET', "3I0V9xPJFobEtP761juoqFbXGgrONm3t");

//include all the config files
include 'config/config.php';

// invoke the request class to get the URI path 
$request= new Request();

try{
//use a switch case statement and pass the path as a parameter
//to find the existing endpoint  
    switch($request->getPath()){

        case '/user':
        case '/users':
        case '/user/':
        case '/users/':
            $endpoint = new User($request);
            break;

        case '/job':
        case '/jobs':
        case '/job/':
        case '/jobs/':
            $endpoint = new Job($request);
            break;

        case '/jobapplication':
        case '/jobapplications':
        case '/jobapplication/':
        case '/jobapplications/':
            $endpoint = new JobApplication($request);
            break;

        case '/savedjob':
        case '/savedjobs':
        case '/savedjob/':
        case '/savedjobs/':
            $endpoint = new SavedJobs($request);
            break;

        case '/authenticate':
        case '/authenticate/':
            $endpoint = new Authenticate($request);
            break;

        case '/signup':
        case '/signup/':
            $endpoint = new Signup($request);
            break;

        case '/userauth':
        case '/userauth/':
            $endpoint = new Userauth($request);
            break;

        case '/createjob':
        case '/createjob/':
            $endpoint = new Createjob($request);
            break;
        
        case '/updatejob':
        case '/updatejob/':
            $endpoint = new UpdateJob($request);
            break;

        case '/deletejob':
        case '/deletejob/':
            $endpoint = new DeleteJob($request);
            break;

        case '/deleteuser':
        case '/deleteuser/':
            $endpoint = new DeleteUser($request);
            break;
            
        case '/updateemployer':
        case '/updateemployer/':
            $endpoint = new UpdateEmployer($request);
            break;
        
        case '/updatejobseeker':
        case '/updatejobseeker/':
            $endpoint = new UpdateJobSeeker($request);
            break;
        
        case '/uploadcv':
        case '/uploadcv/':
            $endpoint = new UploadCV($request);
            break;

        case '/uploadimg':
        case '/uploadimg/':
            $endpoint = new UploadImg($request);
            break;

        case '/imageretrieve':
        case '/imageretrieve/':
            $endpoint = new ImageRetrieve($request);
            break;

        case '/profileimage':
        case '/profileimage/':
            $endpoint = new ProfileImage($request);
             break;
        
        case '/cvretrievel':
        case '/cvretrievel/':
            $endpoint = new CVRetrievel($request);
            break;

        case '/displaycv':
        case '/displaycv/':
            $endpoint = new DisplayCV($request);
            break;
             
        case '/createapplication':
        case '/createapplication/':
            $endpoint = new CreateApplication($request);
            break;

        case '/applicationdetails':
        case '/applicationdetails/':
            $endpoint = new ApplicationDetails($request);
            break;
            
        case '/createjobsave':
        case '/createjobsave/':
            $endpoint = new CreateJobSave($request);
            break;

        case '/unsavejob':
        case '/unsavejob/':
            $endpoint = new UnsaveJob($request);
            break;
            
        case '/createjobpreferences':
        case '/createjobpreferences/':
            $endpoint = new CreateJobPreferences($request);
            break;
            
        case '/jobpreferences':
        case '/jobpreferences/':
            $endpoint = new JobPreferences($request);
            break;


        case '/removejobpreferences':
        case '/removejobpreferences/':
             $endpoint = new RemoveJobPreferences($request);
            break;

        case '/jobapplicationcv':
        case '/jobapplicationcv/':
            $endpoint = new JobApplicationCv();
            break;

        case '/deleteapplication':
        case '/deleteapplication/':
            $endpoint = new DeleteApplication($request);
            break;

        case '/checkcandidatecv':
        case '/checkcandidatecv/':
            $endpoint = new CheckCandidateCV($request);
            break;

        case '/acceptapplication':
        case '/acceptapplication/':
            $endpoint = new AcceptApplication($request);
            break;
        
        case '/savenotes':
        case '/savenotes/':
            $endpoint = new SaveNotes($request);
            break;

        case '/createchat':
        case '/createchat/':
            $endpoint = new CreateChat($request);
            break;

        case '/retrievechat':
        case '/retrievechat/':
            $endpoint = new RetrieveChat($request);
            break;
        
        case '/updatechatstatus':
        case '/updatechatstatus/':
            $endpoint = new UpdateChatStatus($request);
            break;

        case '/applicationcounter':
        case '/applicationcounter/':
            $endpoint = new ApplicationCounter($request);
            break;
        
        //if the path does not match with any of the endpoint
        //use ClientError class to display an 404 NOT FOUND error
        default: $endpoint = new ClientError( "Could not find your request", 404) ;
    }
}catch(ClientErrorException $e){
    $endpoint= new ClientError($e->getMessage(), $e->getCode()) ;
}
//display the data in JSON format
echo json_encode($endpoint->getData());