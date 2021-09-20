import React, { useEffect, useState, useMemo, useRef } from "react";
import retry from 'async-retry';

import {CakeLPABI} from '../../../../../ABI/CakeLP';
import { useWeb3React  } from '@web3-react/core';

import { MASTERCHEF_ADDRESS } from "../../../../../constants/addresses";



const APR = ({MasterChef, token, cakePerBlock, allocPoint, totalAllocPoint}) => {

    
    const { library } = useWeb3React()

    const [total, setTotal] = useState()
    const [price, setPrice] = useState()
    const [supply, setSupply] = useState()
    const [reserves, setReserves] = useState([])
    const [prices, setPrices] = useState([])

    const [fetchingPrices, setFetchingPrices] = useState(true)
    const [fetchingReserves, setFetchingReserves] = useState(true)

    const [fetching, setFetching] = useState(true)
    
    const CakeLP = useRef(new library.eth.Contract(CakeLPABI, token))
    
    useEffect( () => {
        getBalance();
        getReserves();
        getPair();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])


    const getBalance = async () => {
        await retry(
            async () => {
                const cake = await MasterChef.current.methods.cake().call()
                const balance = await CakeLP.current.methods.balanceOf(MASTERCHEF_ADDRESS).call()
                setTotal(library.utils.fromWei(balance))
                getPrice(cake);
            }
        )
    }


    const getPrice = async (cake) => {
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

    const getReserves = async () => {
        
        await retry(
            async () => {
                const {_reserve0, _reserve1} = await CakeLP.current.methods.getReserves().call();
                const supply = await CakeLP.current.methods.totalSupply().call();
                setReserves([library.utils.fromWei(_reserve0),library.utils.fromWei(_reserve1)])
                setSupply(library.utils.fromWei(supply))
                setFetchingReserves(false)
            }
        )
    }

    const getPair = async () => {
        setFetching(true)
        await retry(
            async () => {
                const symbol = await CakeLP.current.methods.symbol().call();
                // I noticed there are some tokens which aren't Cake-LP tokens so we ignore/skip them for now 
                if (symbol === 'Cake-LP'){
                    setFetching(true)
                    const token0 = await CakeLP.current.methods.token0().call();
                    const token1 = await CakeLP.current.methods.token1().call();
                    getPrices([token0,token1])
                    setFetching(false)
                }

            }
        )
    }

    const getPrices = async (pair) => {
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

    const TVL = (reserves,prices,supply,total) => (reserves[0]*prices[0].usd + reserves[1]*prices[1].usd ) / supply * total

    const dollarPerBlock = useMemo( () => {

        if (prices && prices.length === 2 && total && price){
            const rewardsPerBlockValue = cakePerBlock * price.usd;

            const rewardsPerShare = rewardsPerBlockValue * (allocPoint / totalAllocPoint) / TVL(reserves,prices,supply,total);  

            const APR = rewardsPerShare * 10518984 * 100 ;
            return APR.toFixed(2).toString() + '%'
        }else{
            return '-'
        }
            
                       
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[cakePerBlock,price,prices,reserves,total,supply])

   

    return ( <>
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
                                        ? ( TVL(reserves,prices,supply,total) / 1000000).toFixed(2) + 'M'
                                        : '-'
                                    }
                                </p>
                            : <p>-</p>
                        }
                    </>
            }   
        </div>
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
    </>
    )
}

export default APR