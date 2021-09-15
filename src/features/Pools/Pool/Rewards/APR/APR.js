import React, { useEffect, useState, useMemo, useRef } from "react";
import retry from 'async-retry';

import {CakeLPABI} from '../../../../../ABI/CakeLP';
import { useWeb3React  } from '@web3-react/core';




const APR = ({MasterChef, token, rewardsPerBlock, allocPoint, totalAllocPoint}) => {

    
    const { library } = useWeb3React()

    const [total, setTotal] = useState()
    const [price, setPrice] = useState()
    
    const [fetching, setFetching] = useState(true)
    
    const CakeLP = useRef(new library.eth.Contract(CakeLPABI, token))
    
    useEffect( () => {
        getReserves();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])


    const getReserves = async () => {
        await retry(
            async () => {
                const cake = await MasterChef.current.methods.cake().call()
                const balance = await CakeLP.current.methods.balanceOf("0x73feaa1eE314F8c655E354234017bE2193C9E24E").call()
                // There is an issue here which I couldn't manage to solve
                // It should take into account the decimals of the token
                // because on < 18 decimals APR is not correct
                setTotal(library.utils.fromWei(balance))
                getPrices(cake);
            }
        )
    }


    const getPrices = async (cake) => {
        await retry(
            async () => {
                const api = "https://api.coingecko.com/api/v3/simple/token_price/binance-smart-chain?vs_currencies=usd&contract_addresses=" + cake
                const res = await fetch(api)
                const json = await res.json();    
                setPrice(json[cake.toLowerCase()])
                setFetching(false)
            },
            {   
                factor: 1,
                minTimeout: 1000 * 60
            }
        )
    }

    const dollarPerBlock = useMemo( () => {
        if (price && total)
            return ((rewardsPerBlock * price.usd)*(allocPoint/totalAllocPoint) / total * 100 * 29000 * 365).toFixed(2) + '%'
                       
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[rewardsPerBlock,price])

   

    return (

        <div className="container">                        
            <p className="bold"> APR </p>
            { 
                fetching 
                ?
                    <div className="skeleton paragraph"/>
                :
                    <>
                    { price &&
                        
                        <p>{dollarPerBlock}</p>
                    }
                    </>
            }
        </div>

    )
}

export default APR