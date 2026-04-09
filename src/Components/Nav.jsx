import '../css/nav.css'

const Nav = () => {
    return (
        <div className='sidebar'>
            <img id='logo' src='../images/logo.png' alt="Logo" />

            <div className='sidebar-divider'></div>

            <span className='sidebar-label'>Navigation</span>

            <div className='nav-links'>
                <ul>
                    <li>
                        <img src='../images/tool.png' alt="" />
                        Tool Search
                    </li>
                </ul>
            </div>

            <div className='sidebar-footer'>
                <span className='sidebar-version'>v1.0.0</span>
            </div>
        </div>
    )
}

export default Nav
