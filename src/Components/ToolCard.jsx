import '../css/toolcard.css'

const PinIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 10c0 7-9 13-9 13S3 17 3 10a9 9 0 0 1 18 0z"/>
        <circle cx="12" cy="10" r="3"/>
    </svg>
)

const ToolCard = ({ tool }) => {
    return (
        <div className='tool-card'>
            <div className='tool-number'>
                <span className='tool-number-badge'>{tool.tool}</span>
                <span className='tool-tag'>Ford</span>
            </div>

            <div className='tool-img-container'>
                <img src={`.${tool.image}`} alt={tool.name} />
            </div>

            <div className='tool-text'>
                <p className='tool-name'>{tool.name}</p>
            </div>

            <div className='tool-location'>
                <PinIcon />
                <span className='tool-location-text'>{tool.location}</span>
            </div>
        </div>
    )
}

export default ToolCard
