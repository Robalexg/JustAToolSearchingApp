import '../css/toolcard.css'


const ToolCard = ({tool}) => {

    return(
        <div className='tool-card'>
            <div>
                <h1>{tool.tool}</h1>
                <h2>{tool.name}</h2>
            </div>
            <div className='tool-img-container'>
                <img src={`.${tool.image}`} alt="" />
            </div>
            <h3>Location: {tool.location}</h3>
        </div>
    )
}

export default ToolCard