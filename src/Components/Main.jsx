import { useState } from 'react'
import toolData from '../db/data.js';
import '../css/main.css'
import ToolCard from './ToolCard.jsx';

const SearchIcon = () => (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
    </svg>
)

const Main = () => {
    const [tool, setTool] = useState('')
    const [filteredTools, setFilteredTools] = useState([])

    const onChangeHandler = (e) => {
        let val = e.target.value.toLowerCase()
        setTool(val)
        if (val === '') {
            setFilteredTools([])
            return
        }
        let arr = toolData.filter(t =>
            t.tool.slice(0, val.length).toLowerCase() === val
        )
        setFilteredTools(arr)
    }

    const displayedTools = tool === '' ? toolData : filteredTools

    return (
        <div className='main'>
            <div className='nav'>
                <h1><span>Tool</span> Search</h1>
                <div className='nav-meta'>
                    <span className='nav-dot'></span>
                    <span>SYSTEM ONLINE</span>
                </div>
            </div>

            <div className='search-menu'>
                <div className='search-wrapper'>
                    <SearchIcon />
                    <input
                        type="text"
                        onChange={onChangeHandler}
                        placeholder='Search by tool number…'
                    />
                </div>
            </div>

            <div className='results-header'>
                <span className='results-label'>Inventory</span>
                <span className='results-count'>
                    <em>{displayedTools.length}</em> tools
                </span>
            </div>

            <div className='card-container'>
                {displayedTools.map((t, i) => <ToolCard key={i} tool={t} />)}
            </div>
        </div>
    )
}

export default Main
