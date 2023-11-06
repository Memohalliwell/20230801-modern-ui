import { useState, ChangeEventHandler } from 'react'
import {  useNetwork, 
          useContractRead, 
          usePrepareContractWrite, 
          useContractWrite, 
          useContractEvent 
        } from 'wagmi'
import { AddressType } from 'abitype'


let greeterABI = [
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_greeting",
        "type": "string"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "address",
        "name": "sender",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "string",
        "name": "greeting",
        "type": "string"
      }
    ],
    "name": "SetGreeting",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "greet",
    "outputs": [
      {
        "internalType": "string",
        "name": "",
        "type": "string"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "string",
        "name": "_greeting",
        "type": "string"
      }
    ],
    "name": "setGreeting",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
] as const   // greeterABI



type AddressPerBlockchainType = {
  [key: number]: AddressType
}

const contractAddrs : AddressPerBlockchainType = {
  // Holesky
  17000: '0x432d810484AdD7454ddb3b5311f0Ac2E95CeceA8',

  // Sepolia
  11155111: '0x7143d5c190F048C8d19fe325b748b081903E3BF0'
}


type ShowObjectAttrsType = {
  name: string,
  object: any
}


type ShowGreetingAttrsType = {
  greeting: string | undefined
}


const Greeter = () => {  
  const { chain } = useNetwork()

  const greeterAddr = chain && contractAddrs[chain.id] 

  const readResults = useContractRead({
    address: greeterAddr,
    abi: greeterABI,
    functionName: "greet", // No arguments
    watch: true
  })

  console.log(`readResults result:${readResults.data}`)

  const [ currentGreeting, setCurrentGreeting ] = 
    useState(readResults.data)
  const [ currentChain, setCurrentChain ] =
    useState(chain.id)

  if (currentGreeting != readResults.data)
    setCurrentGreeting(readResults.data)

  const [ newGreeting, setNewGreeting ] = useState("")

  const greetingChange : ChangeEventHandler<HTMLInputElement> = (evt) => 
    setNewGreeting(evt.target.value)

  const preparedTx = usePrepareContractWrite({
    address: greeterAddr,
    abi: greeterABI,
    functionName: 'setGreeting',
    args: [ newGreeting ]
  })
  const workingTx = useContractWrite(preparedTx.config)

  return (
    <>
      <h2>Greeter</h2>
      {
        !readResults.isError && !readResults.isLoading &&
          <ShowGreeting greeting={readResults.data} />
      }
      <hr />

      <input type="text" 
        value={newGreeting}
        onChange={greetingChange}
      />

      <button disabled={!workingTx.write}
              onClick={workingTx.write}
      >
        Update greeting
      </button>
      <hr />
      <ShowObject name="readResults" object={readResults} />
      <ShowObject name="preparedTx" object={preparedTx} />
      <ShowObject name="workingTx" object={workingTx} />
    </>
  )
}




const ShowGreeting = (attrs : ShowGreetingAttrsType) => {
  return <>
    <b>{attrs.greeting}</b>
  </>
}


const ShowObject = (attrs: ShowObjectAttrsType ) => {
  const keys = Object.keys(attrs.object)
  const funs = keys.filter(k => typeof attrs.object[k] == "function")
  return <>  
    <details>
      <summary>{attrs.name}</summary>
      <pre>
        {JSON.stringify(attrs.object, null, 2)}
      </pre>
      { funs.length > 0 &&
        <>
          Functions:
          <ul>
          {funs.map((f, i) => 
           (<li key={i}>{f}</li>)
                )}
          </ul>
        </>
      }
    </details>
  </>
}


export {Greeter}
