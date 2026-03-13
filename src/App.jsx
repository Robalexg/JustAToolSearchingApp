import { use, useState } from 'react'

import './App.css'
import toolData from './data';
function App() {
  const [toolNum , setToolNum] = useState("")
  const [location,setLocation] = useState('')
  const onChangeHandler = (e) => {
    let val = e.target.value
    setToolNum(val)
  }


  const submitHandler = (e) => {
    e.preventDefault()
    let found = false
    let tool = {}

    toolData.forEach(data => {
      if(data.tool === toolNum){
        tool = data
      }
    })

    if(Object.keys(tool).length !== 0){
      setLocation(tool.location)
    }else{
      console.log('notfound')
      setLocation("Not Found")
    }

  }

  return (
    <>
    <form onSubmit={(e) => submitHandler(e)}>
      <input 
      type="text" 
      onChange={(e) => onChangeHandler(e)}
      />
      <button>Enter</button>
    </form>
    <h1>{location}</h1>
    </>
  )
}

export default App
