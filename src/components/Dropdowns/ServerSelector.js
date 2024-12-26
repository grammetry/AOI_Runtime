import React, { useImperativeHandle, forwardRef, useRef, useState, useEffect } from 'react';
import Select from "react-select";
import { OptionType } from '../../page/type';



const ServerSelector = forwardRef((props, ref) => {

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

    useEffect(() => {

        if (currentItem==null){
            setCurrentItem(props.defaultValue);

        }
          
     }, [props.defaultValue]);



    return (

        <Select options={props.options} className={props.className}
            styles={{
                control: (baseStyles, state) => ({
                    ...baseStyles,
                    borderColor: state.isFocused ? '#16272e3d' : state.isSelected ? '#16272e3d' : '#E0E1E6',
                    borderWidth: state.isFocused ? '0px' : state.isSelected ? '0px' : '1px',
                }),
            }}
            theme={(theme) => ({
                ...theme,
                colors: {
                    ...theme.colors,
                    primary25: '#E0E1E6',
                    primary75: '#E0E1E6',
                    primary50: '#E0E1E6',
                    primary: '#16272e3d',
                },
            })}
            components={{
                IndicatorSeparator: () => null
            }}
            onChange={(item) => { setCurrentItem(item); props.onChange(item) }} value={currentItem} />

    )
})

export default ServerSelector
