/**
 * Menu.js is the top page Menu visible on all pages and
 * returns a Nav bar containing links to other main pages.
 * 
 * @author Marius Oprea
 * @studentID w20039534
 */
// imports for bootstrap, can be found on npm react bootstrap website 
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import { LinkContainer } from 'react-router-bootstrap';
import logo from './logologin.png';

function Menu(props) {
    //use LinkContainer to specify only the endpath and not the full path 
    //make sure to 'npm install react-bootstrap bootstrap' for bootstrap and 'npm install react-router-bootstrap' for bootstrap components like LinkContainer
    //make sure to import react bootstrap in 
    return (
        //parent container
        <div
            style={{
                position: "fixed",
                position: "fixed",
                top: "0",
                left: "0",
                right: "0",
                zIndex: "999" //z-index: 999 property ensures that the div is always in front of other elements on the screen
            }}>
        {/**Display basic menu if user is not authenticated*/}
            {!props.authenticated && <div><Navbar bg="light" expand="lg">
                <Container className='top-menu'>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <img src={logo} style={{width: "12%", height:"12%",marginLeft:"-4%"}} />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <LinkContainer to="/"><Nav.Link> Log in</Nav.Link></LinkContainer>
                            <LinkContainer to="/signup"><Nav.Link> Sign up</Nav.Link></LinkContainer>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            </div>}
        {/**Display menu for employer if employers are authenticated*/}
            {props.authenticated && props.userType === "employer" && <div><Navbar bg="light" expand="lg">
                <Container className='top-menu'>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <img src={logo} style={{width: "12%", height:"12%",marginLeft:"-4%"}} />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <LinkContainer to="/"><Nav.Link> Dashoard</Nav.Link></LinkContainer>
                            <LinkContainer to="/employerProfile"><Nav.Link> Profile </Nav.Link></LinkContainer>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            </div>}
            {/**Display menu for job seekers if they are authenticated */}
            {props.authenticated && props.userType === "jobseeker" && <div><Navbar bg="light" expand="lg">
                <Container className='top-menu'>
                    <Navbar.Toggle aria-controls="basic-navbar-nav" />
                    <img src={logo} style={{width: "12%", height:"12%",marginLeft:"-4%"}} />
                    <Navbar.Collapse id="basic-navbar-nav">
                        <Nav className="me-auto">
                            <LinkContainer to="/"><Nav.Link> Dashoard</Nav.Link></LinkContainer>
                            <LinkContainer to="/seekerProfile"><Nav.Link> Profile </Nav.Link></LinkContainer>
                            <LinkContainer to="/searchJobs"><Nav.Link> Search </Nav.Link></LinkContainer>
                        </Nav>
                    </Navbar.Collapse>
                </Container>
            </Navbar>
            </div>}
        </div>

    );
}
export default Menu;