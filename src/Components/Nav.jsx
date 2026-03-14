import logo from '../images/logo.jpg'
import tool from '../images/tool.png'
import '../css/nav.css'
const Nav = () => {
    return (
        <div className='sidebar'>
            <img id='logo' src={logo} alt="" />
            <div className='nav-links'>
                <ul>
                    <li>
                        <img src={tool} alt="" />
                        Tool Search
                    </li>
                </ul>
            </div>
        </div>
    )
}


export default Nav