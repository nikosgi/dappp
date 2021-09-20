import React, { useEffect, useState, useRef, useMemo } from "react";
import { useWeb3React  } from '@web3-react/core';
import retry from 'async-retry';
import './Symbol.css';

import {ERC20ABI} from '../../../../../ABI/ERC20';



const Pair = ({token,bold}) => {
    const { library } = useWeb3React()
    const [symbol, setSymbol] = useState();
    const [fetching,setFetching] = useState(false)
    const ERC20 = useRef(new library.eth.Contract(ERC20ABI, token))
    
    
    useEffect( () => {
        getPoolsLength();
    },[])


    const getPoolsLength = async () => {
        setFetching(true)
        await retry(
            async () => {              
                const symbol = await ERC20.current.methods.symbol().call();
                setSymbol(symbol);
                setFetching(false)
            }
        )
    }

    const styles = useMemo( () => {
        return "symbol-container" + (bold ? " bold" : "")
    },[bold])

    return (
        <>
            {
                fetching 
                ?        
                    <div className="skeleton paragraph"/>                 
                :
                <>
                    { symbol && 
                        <p className={styles}>{symbol}</p>
                    }      
                </>
            }
        </>
    )
}

export default Pair