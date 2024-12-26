import React, { Dispatch, FormEventHandler, SetStateAction } from 'react';
import ResultCard from '../Cards/ResultCard';



const ResultCardList = (props) => {

    const handleLabelToggle = (imageUuid) => {
        props.onChange(imageUuid);
    }

    return (
        <div className='my-card-list-container'>
            {
                props.data.map((item, i) => (
                    <div key={`resultList_${item.imageUuid}`} >
                        <ResultCard data={item} onChange={() => handleLabelToggle(item.imageUuid)}></ResultCard>
                    </div>
                ))
            }
        </div>
    );
};

export default ResultCardList;

