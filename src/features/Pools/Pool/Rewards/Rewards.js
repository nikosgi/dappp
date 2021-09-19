import React, { useEffect, useState, useMemo } from "react";
import { useWeb3React  } from '@web3-react/core';
import retry from 'async-retry';
import APR from './APR/APR'

const Rewards = ({MasterChef,token, allocPoint}) => {

    
    const { library } = useWeb3React()

    const [cakePerBlock, setCakePerBlock] = useState();
    const [totalAllocPoint, setTotalAllocPoint] = useState();
    
    const [fetching, setFetching] = useState(true)

    useEffect( () => {
        getCakePerBlock();

    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])

 

    const getCakePerBlock = async () => {
        await retry(
            async () => {
                const cake = await MasterChef.current.methods.cakePerBlock().call();
                const total = await MasterChef.current.methods.totalAllocPoint().call();
                setCakePerBlock(library.utils.fromWei(cake));     
                setTotalAllocPoint(total);  
                setFetching(false)
            }
        )
    }

    const rewardsPerBlock = useMemo( () => {
        return (cakePerBlock * allocPoint / totalAllocPoint).toFixed(6)
    },[cakePerBlock,allocPoint,totalAllocPoint])

    const rewardsInTotal = useMemo( () => {
        return (allocPoint / totalAllocPoint * 100).toFixed(2) + '%'
    },[allocPoint,totalAllocPoint])


    return (

        <>

            <div className="container">
                <p className="bold"> Rewards / Block</p>
                <>
                    {
                        fetching 
                        ?
                            <div style={{width: 120}} className="skeleton paragraph"/>                                                   
                        :
                            <>
                                {  cakePerBlock && totalAllocPoint &&                                    
                                    <p>{rewardsPerBlock} <span style={{fontSize:14, fontWeight: 500}}>CAKE</span></p>
                                }
                            </>
                    }
                </>
            </div>
            <div className="container">                
                <p className="bold"> Rewards in Total </p>
                <>
                    {
                        fetching 
                        ?
                            <div style={{width: 120}} className="skeleton paragraph"/>                                
                        
                        :
                            <>
                                {  cakePerBlock && totalAllocPoint &&                                    
                                    <p>{rewardsInTotal}</p>
                                }
                            </>
                    }
                </>
            </div>
            <APR
                MasterChef={MasterChef}
                token={token}
                allocPoint={allocPoint}
                totalAllocPoint={totalAllocPoint}
                rewardsPerBlock={rewardsPerBlock}
                cakePerBlock={cakePerBlock}
            />
            
        </>
            
    
    )
}

export default Rewards