import React, { useEffect, useState} from "react";
import retry from 'async-retry';
import Pair from './Pair/Pair.js'
import Rewards from "./Rewards/Rewards.js";
import './Pool.css'

const Pool = ({index, MasterChef, skip}) => {
    const [info, setPool] = useState();
    const [skipped, setSkipped] = useState(false);


    useEffect( () => {
        getPoolInfo();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    },[])

    const handleSkip = () => {
        setSkipped(true)
        skip();
    }



    const getPoolInfo = async () => {
        await retry(
            async () => {
                const info = await MasterChef.current.methods.poolInfo(index).call();
                if (parseInt(info.allocPoint) === 0){
                    skip()
                }                
                setPool(info);       
            }
        )
    }

    // I tried to breakdown into components which of them has a specific contract
    // For example in the Pair components holds the CakeLP contract
    // Subcomponents of the Pair component hold the ERC20 contract
    // But since I implemented the bonus part, a better split of logic could be used

    return (
        <>
            { info && info.allocPoint > 0 && !skipped &&
                <div className="pool-root">
                    <Pair 
                        skip={() => handleSkip()} 
                        token={info.lpToken}
                    />
                    <Rewards 
                        MasterChef={MasterChef}
                        token={info.lpToken}
                        allocPoint={info.allocPoint}
                    />
     
                </div>

            }

        </>
    )
}

export default Pool