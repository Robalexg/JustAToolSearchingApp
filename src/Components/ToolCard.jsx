import '../css/toolcard.css'

const ToolCard = ({tool}) => {
    return(
        <div className='tool-card'>
            <div className='tool-img-container'>
                <img src={`.${tool.image}`} alt="" />
            </div>
            <div className='tool-text'>
                <h1>{tool.tool}</h1>
                <h2>{tool.name}</h2>
            </div>
            <h3>Location: {tool.location}</h3>
        </div>
    )
}

export default ToolCard