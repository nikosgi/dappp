import React, { useEffect, useState, useRef } from "react";
import { useWeb3React  } from '@web3-react/core';
import retry from 'async-retry';


import {CakeLPABI} from '../../../../ABI/CakeLP';
import Symbol from './Symbol/Symbol';


const Pair = ({token, skip}) => {

    const { library } = useWeb3React()

    const [pair, setPair] = useState()
    const [fetching, setFetching] = useState(false)
    const CakeLP = useRef(new library.eth.Contract(CakeLPABI, token))
    
    useEffect( () => {
        getPair();
        
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[CakeLP])


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
                    setPair([token0, token1])
                    setFetching(false)
                }else{
                    skip()
                }

            }
        )
        

    }


    return (
        <>
            { fetching 
                ?
                    <>
                        <div className="skeleton div"/>
                    </>
                :
                <>
                    { pair && pair.length === 2 &&
                        <>
                            <div className="container">
                                <Symbol bold token={pair[0]}/>
                                <Symbol token={pair[1]}/>
                            </div>                            
                        </>
                    }
                </>
            }
            

        </>
    )
}

export default Pair