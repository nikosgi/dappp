import React, { useEffect, useState } from "react";
import retry from 'async-retry';

import './TVL.css'



const TVL = ({CakeLP, pair}) => {

    const [supply, setSupply] = useState()
    const [reserves, setReserves] = useState([])
    const [prices, setPrices] = useState([])
    
    const [fetchingPrices, setFetchingPrices] = useState(true)
    const [fetchingReserves, setFetchingReserves] = useState(true)
    
    
    useEffect( () => {
        getReserves();
        
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])

    useEffect( () => {
        if (reserves && reserves.length === 2){
            getPrices()
        }
        
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[reserves])



    const getReserves = async () => {
        
        await retry(
            async () => {
                const {_reserve0, _reserve1} = await CakeLP.current.methods.getReserves().call();
                const supply = await CakeLP.current.methods.totalSupply().call();
                setReserves([_reserve0,_reserve1])
                setSupply(supply)
                setFetchingReserves(false)
            }
        )
    }

    const getPrices = async () => {
        await retry(
            async () => {
                const api = "https://api.coingecko.com/api/v3/simple/token_price/binance-smart-chain?vs_currencies=usd&contract_addresses=" + pair[0] + "," + pair[1]
                const res = await fetch(api)
                const json = await res.json();
                setFetchingPrices(false)
                if (Object.keys(json).length === 2)
                    setPrices(
                        [
                            json[pair[0].toLowerCase()],
                            json[pair[1].toLowerCase()]
                        ]
                    )
                else
                    setPrices([])            
            },
            {   
                factor: 1,
                minTimeout: 1000 * 60
            }
        )
    }


    return (
    
        <div className="container order">
            <p className="bold">TVL</p>
            {
                (fetchingReserves || fetchingPrices) 
                ?
                    <div className="skeleton paragraph"/>
                :
                    <>
                        { (reserves && supply && prices )
                            ?
                                <p>
                                    { reserves.length === 2 && prices.length === 2 
                                        ? ((reserves[0]*prices[0].usd + reserves[1]*prices[1].usd)/supply).toFixed(2) + '$'
                                        : '-'
                                    }
                                </p>
                            : <p>-</p>
                        }
                    </>
            }   

        </div>
    )
}

export default TVL