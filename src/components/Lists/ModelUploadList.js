// third party imports
import React, { useState, useRef, forwardRef, useEffect, useImperativeHandle } from "react";
import List from '@mui/joy/List';
import ListItem from '@mui/joy/ListItem';
import ListDivider from '@mui/joy/ListDivider';
import LinearProgress from '@mui/joy/LinearProgress';
import Typography from '@mui/joy/Typography';
import Stack from '@mui/joy/Stack';
import axios, { isCancel, AxiosError } from 'axios';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ErrorIcon from '@mui/icons-material/Error';

import AutorenewIcon from '@mui/icons-material/Autorenew';


// local imports
import { inferInferenceAPI, inferUploadAPI } from '../../APIPath';
import log from "../../utils/console";
import Utility, { UtilityRef } from '../../utils/Utility';
import { set } from "lodash";

const ModelUploadList = forwardRef((props, ref) => {

    const {updateStatus } = props;
    const [value, setValue] = useState('');
    const utilityRef = useRef(null);
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadProgressText, setUploadProgressText] = useState('0%');

    const uploadData = async (myName, myData) => {

        try {

            //step 1 : create workspace
            const res1 = await fetch(`${inferInferenceAPI}`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    inference_model_name: myName.replace('.zip', ''),
                })
            });

            const res1Json = await res1.json();

            console.log('res1', res1Json);

            if (res1Json.detail) {
                props.showErrorMessage(res1Json.detail);
                return;
            }

            if (res1Json.inference_model_uuid) {

                // step 2 : upload file
                const formData = new FormData();
                formData.append('inference_model', myData);
                formData.append('inference_model_uuid', res1Json.inference_model_uuid);

                console.log('fomrData', formData);


                const res = await axios.post(`${inferUploadAPI}`, formData, {
                    onUploadProgress: (progressEvent) => {
                        const { loaded, total } = progressEvent;

                        console.log('loaded', loaded ? loaded : 'null');
                        console.log('total', total ? total : 'null');

                        if (total) {
                            const precentage = Math.floor((loaded * 100) / total);
                            //setUploadProgress(precentage);
                            //setUploadProgressText(`${precentage}% `);
                            props.updateStatus(precentage, `${precentage}%`);
                        }

                    },
                    headers: {
                        'Content-Type': 'multipart/form-data'
                    }
                });

                if (res.status !== 200) {
                    props.updateStatus( 0, `Failed`);
                    props.showMessage(res.statusText);
                    return;
                } else {
                    props.updateStatus( 100, `Success`);
                    props.showMessage(` Upload success!`);
                    
                }

            }

        } catch (error) {

            console.log(error.message);
            setUploadProgressText('Failed');
            props.showMessage(`${error.message}`);
        }


    }

    useImperativeHandle(ref, () => ({

        setInputValue: (myValue) => {
            setValue(myValue);

        },
        getInputValue: () => {
            return value;
        },
        setUpload: (myName, myData) => {
            log('set upload data')
            uploadData(myName, myData);
        },
        setProgress: (myProgress, myProgressText) => {

            console.log('--- myProgress ----', myProgress);

            setUploadProgress(myProgress);
            setUploadProgressText(myProgressText);
        }
    }));


    return (
        <>
            
            <ListItem>
              
                <Stack spacing={12} sx={{ flex: 1 }}>
                    <LinearProgress determinate value={uploadProgress} size="lg" />
                </Stack>
                <div className='d-flex justify-content-center' style={{ width: 50 }}>
                    {

                        (uploadProgressText === 'Success') ? <CheckCircleIcon sx={{fontSize: 25,color:'green'}} /> :
                            (uploadProgressText === 'Failed') ? <ErrorIcon sx={{fontSize: 25,color:'red'}}/> :
                                (uploadProgressText === '100%')?
                                    <div className='my-rotation-container'>
                                        <div className="my-rotation">
                                            <AutorenewIcon sx={{fontSize: 30,color:'orange'}} />                
                                        </div>
                                    </div>
                                    :uploadProgressText    
                    }
                </div>

            </ListItem>

            
        </>
    )
});

export default ModelUploadList;