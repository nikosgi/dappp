import React, { useEffect, useState } from "react";
import { useWeb3React  } from '@web3-react/core';
import { NetworkConnector } from '@web3-react/network-connector'
import Pools from '../Pools/Pools';

export const Main = () => {
    const { active, activate, deactivate } = useWeb3React();
    const { error, setError } = useState(false);

    const connect = async () => {
        const network = new NetworkConnector({ urls: { 56 : "https://bsc-dataseed.binance.org/" } })
        await activate(network, handleError, true)
    }

    const handleError = (error) => {
        setError(true)      
    }

    const disconnect = async () => {
        deactivate()
    }

    useEffect( () => {
        connect();
        return () => {
            disconnect();
        }        
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])


    return(
        <div className="root">
            { !active 
                ? 
                    <div> 
                       { error }
                    </div>
                : 
                    <Pools/>
            }
            
        </div>
    )
}

export default Main