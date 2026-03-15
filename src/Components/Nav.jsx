

import '../css/nav.css'
const Nav = () => {
    return (
        <div className='sidebar'>
            <img id='logo' src='../images/logo.png' alt="" />
            <div className='nav-links'>
                <ul>
                    <li>
                        <img src='../images/tool.png' alt="" />
                        Tool Search
                    </li>
                </ul>
            </div>
        </div>
    )
}


export default Nav