/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState, useRef, useMemo } from "react";
import { useWeb3React  } from '@web3-react/core';
import retry from 'async-retry';
import { debounce} from 'throttle-debounce';

import {MasterChefABI} from '../../ABI/MasterChef';
import Pool from './Pool/Pool.js';
import './Pools.css';



const Pools = () => {
    const { library } = useWeb3React()

    // Offset is our "page" which increments everytime the scrollbar reaches the bottom
    const [offset, setOffset] = useState(1)
    // Additional is a counter of how many pools we skipped (allocPoint = 0)
    const [additional, setAdditional] = useState(0)
    const [poolLength, setPoolLength] = useState(0)

    const MasterChef = useRef(new library.eth.Contract(MasterChefABI, '0x73feaa1eE314F8c655E354234017bE2193C9E24E'))
      
    useEffect( () => {
        //Get pool length
        getPoolsLength();
    },[])

    useEffect( () => {
        //Used for auto scroll
        const scroll = debounce(500,onScroll)
        window.addEventListener('scroll', scroll )
        return () => {
            window.removeEventListener('scroll',scroll)
        }
    },[poolLength,offset,additional])

    const getPoolsLength = async () => {
        await retry(
            async () => {
                const length = await MasterChef.current.methods.poolLength().call();
                setPoolLength(length);       
            }
        )
    }

    // The logic here is to start from the most recent pools
    // That means traverse the array poolInfo from poolInfo.length -> 0
    // Additional is incremented every time we "skip" a pool
    // A pool is skipped if alocPoint is 0
    // Rendered pools is technically a counter that points to the latest pool
    const renderedPools = useMemo( () => {
        return offset * 15 + additional;
    },[offset, additional])

    const onScroll = () => {
        if (offset * 15 + additional > poolLength) return
        if (window.scrollY + window.innerHeight >= document.body.scrollHeight - 100 ){
            setOffset( offset => offset + 1)
        }
    }


    return (
        <div className="pools-container">
            { poolLength > 0 && [...Array(renderedPools)].map( (_,index) => (
                <Pool 
                    key={index} 
                    MasterChef={MasterChef}
                    skip={() => setAdditional( add => add + 1)} 
                    index={poolLength - index - 1}             
                />
            ))}
        </div>
    )
}

export default Pools