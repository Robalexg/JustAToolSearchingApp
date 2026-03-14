
import { use, useState } from 'react'
import toolData from '../db/data.js';
import '../css/main.css'
import ToolCard from './ToolCard.jsx';

const Main = () => {
    const [tool,setTool] = useState('')
    const [filteredTools, setFilteredTools] = useState([])

    const onChangeHandler = (e) => {
        let val = e.target.value
        setTool(val)
        if(val === ''){
            setFilteredTools([])
        }

        let arr = []
        toolData.forEach(t => {
            let sliced = t.tool.slice(0,val.length)
            if(sliced === val){
                arr.push(t)
            }

        })
        
        setFilteredTools(arr)

    }

    const submitHandler = (e) => {
        e.preventDefault()
        console.log(filteredTools)
    }

    return(
    <div className='main'>
        <div className='nav'>
            <h1>Tool Search</h1>
        </div>
        <div className='search-menu'>
            <input 
            type="text" 
            onChange={(e) => onChangeHandler(e)}
            placeholder='Search Tool Number'
            ></input>
        </div>
        <div className='card-container'>
            {
                tool === '' ? 
                    toolData.map(t => <ToolCard tool={t}/>)
                    : 
                    filteredTools.map(t => <ToolCard tool={t}/>)
            }
        </div>
    </div>
    )
}

export default Main