import './App.css';
import { Web3ReactProvider } from '@web3-react/core'
import web3 from "web3";
import Main from './features/Main/Main.js'



function getLibrary(provider, connector) {
  console.log(provider,connector);
  return new web3(provider) // this will vary according to whether you use e.g. ethers or web3.js
}




function App () {

  function handleError(error){
    console.log(error)
  }

  return (
    <Web3ReactProvider onError={handleError} getLibrary={getLibrary}>
      <Main/>
    </Web3ReactProvider>
  )
}


export default App;
