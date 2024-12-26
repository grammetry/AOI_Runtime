import React, { useImperativeHandle, forwardRef, useRef, useState } from 'react';
import Select from "react-select";
import { OptionType } from '../../page/type';

const PanelSelector = forwardRef((props, ref) => {

    const [currentItem, setCurrentItem] = useState(null);

    useImperativeHandle(ref, () => {
        return {
            setValue(value) {
                setCurrentItem(value);
            },
            getValue() {
                return currentItem;
            },
         
        }
    }, [currentItem])



    return (

        <Select options={props.options} className={props.className} 
            onChange={(item) => { setCurrentItem(item);props.onChange(item) }} value={currentItem} />

    )
})

export default PanelSelector
