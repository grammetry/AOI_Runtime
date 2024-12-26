import React, { useState, forwardRef, useEffect,useImperativeHandle} from "react";
import log from "../../utils/console";


const CustomInput  = forwardRef((props, ref) => {

    const [inputValue, setInputValue] = useState(props.defaultValue);
    const [warnning, setWarnning] = useState(false);
   // const { ref1, ref2 } = ref;

    useImperativeHandle(ref, () => ({
      
        setInputValue: (myValue) => {
            setInputValue(myValue);
            setWarnning(false);
        },
        getInputValue: () => {
            return inputValue;
        },
        setWarnning:(myValue)=>{
            setWarnning(myValue);
        }
    }));

    useEffect(() => {
        
        setInputValue(props.defaultValue);

     }, [props.defaultValue]);

    return (
        <div>
            <input type="text" 
                spellCheck="false"
                className={(warnning)?"form-control my-text-input-warnning":"form-control my-text-input"}
                value={inputValue} 
                onChange={(event)=>{
                    setInputValue(event.target.value);
                    props.onChange(event.target.value);
                    setWarnning(false);
                }} 
                placeholder={props.placeholder}
                style={{width:props.width,height:parseInt(props.height)}} 
              
                disabled={props.disabled}
               
            >

            </input>
        </div>
    )
});

export default CustomInput;