import React, { useState, useEffect, useRef } from 'react';

import { inferTaskStartAPI, inferTaskStopAPI } from '../../APIPath';


import axios from 'axios';
import log from "../../utils/console";

import CustomButton from '../Buttons/CustomButton';
import ExtendButton from '../Buttons/ExtendButton';
import StatusButton from '../Buttons/StatusButton';
import ToggleButton from '../Buttons/ToggleButton';
import SwitchButton from '../Buttons/SwitchButton';
import CustomTooltip from '../Tooltips/CustomTooltip';
import ClientServerChart from '../Charts/ClientServerChart';

import LooksOneIcon from '@mui/icons-material/LooksOne';
import LooksTwoIcon from '@mui/icons-material/LooksTwo';
import Looks3Icon from '@mui/icons-material/Looks3';
import Looks4Icon from '@mui/icons-material/Looks4';
import Looks5Icon from '@mui/icons-material/Looks5';
import moment from 'moment';
import Typography from '@mui/joy/Typography';


import { useSelector, useDispatch } from "react-redux";
import Utility from '../../utils/Utility';
import { set } from 'lodash';

//import { faChevronUp, faChevronDown } from '@fortawesome/free-solid-svg-icons';
import { faChevronUp, faChevronDown,faLayerGroup,faCube, faBarcode } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';


const TaskCard = (props) => {

    const { data, index, currentServer, showMessage, getTaskList } = props;
    // const [name, setName] = useState("");
    const [status, setStatus] = useState(props.nameStatus);
    const [disabled, setDisabled] = useState(false);
    const [updateStatus, setUpdateStatus] = useState({});
    const [showChart, setShowChart] = useState(false);

    const STREAM_SERVER = process.env.REACT_APP_STREAM_SERVER;
    const STREAM_URL = `${STREAM_SERVER}/stream`;




    const init = [];
    const [state, setState] = useState(init);
    const dummyState = useRef(init);
    const toggleRef = useRef(null);



    const handleToggleChange = (myValue) => {

        console.log('toggle change', myValue);
        if (myValue) {
            axios.post(`${inferTaskStartAPI}`, {
                task_uuid: data.task_uuid,
            })
                .then(function (response) {
                    console.log(response);
                    showMessage(`Task [${data.task_uuid}] start successfully`);
                })
                .catch(function (error) {
                    console.log(error);
                    showMessage(`Task [${data.task_uuid}] start failed`);
                })
                .finally(() => {
                    getTaskList(currentServer);
                });
        } else {
            axios.post(`${inferTaskStopAPI}`, {
                task_uuid: data.task_uuid,
            })
                .then(function (response) {
                    console.log(response);
                    showMessage(`Task [${data.task_uuid}] stop successfully`);
                })
                .catch(function (error) {
                    console.log(error);
                    showMessage(`Task [${data.task_uuid}] stop failed`);
                })
                .finally(() => {
                    getTaskList(currentServer);
                });
        }



    }


    useEffect(() => {

        //console.log('client_container',data.client_container);

        setUpdateStatus(data.updateStatus);

    }, [data.updateStatus]);





    return (
        <div className="card border-0">
            <div className="card-body my-card-l p-3" style={{ cursor: (disabled) ? 'arrow' : 'pointer' }} >
                <div className="row p-1 gy-0">
                    <div className="col-12 roboto-h4 mb-2 d-flex flex-row justify-content-between gap-2">
                        <div className='d-flex flex-row justify-content-start gap-2'>
                            <div className='my-number-circle'>
                                {index + 1}
                            </div>
                            <div className='d-flex flex-column'>
                                <div style={{ fontSize: 20 }}>{data.name}</div>
                                <Typography
                                    aria-hidden="true"
                                    sx={{ display: 'block', fontSize: 'sm', color: 'neutral.500' }}
                                >
                                    <code inset='gutter'> task_uuid:{data.task_uuid}</code>
                                </Typography>


                            </div>
                        </div>
                        <div style={{ backgroundColor: 'transparent', width: 38, height: 38, borderRadius: 5, padding: 3 }}
                            onClick={() => setShowChart(!showChart)}
                            className='d-flex align-items-center justify-content-center mr-2'>
                            {
                                (showChart) ?
                                    <FontAwesomeIcon icon={faChevronUp} color="gray" size="2x" />
                                    :
                                    <FontAwesomeIcon icon={faChevronDown} color="gray" size="2x" />
                            }

                        </div>

                        
                    </div>
                    <div className="col-12 mb-2">
                        <div className="card border-0">
                            <div className="card-body my-card-m p-2">
                                <div className="row p-1">
                                    <div className="col-12 d-flex flex-column gap-2">
                                        <div style={{ color: '#697A8D' }}>Task Info</div>
                                        <div className="d-flex flex-column gap-1">

                                            <div className='d-flex flex-row gap-2'>
                                                {
                                                    Object.keys(data.infer_panel).map((panel, index) => {
                                                        return (
                                                            <div key={'support_panel' + index} className={(data.infer_panel[panel]) ? 'my-tag-pass' : 'my-tag-close'} style={{ width: 180 }}>
                                                                {panel}
                                                            </div>
                                                        )
                                                    })
                                                }
                                            </div>
                                           

                                            <div className='d-flex flex-row gap-4 mt-2'>
                                                
                                                <div className='d-flex flex-row gap-2 align-items-center'>
                                                    <div className="my-info-icon-container">
                                                        <FontAwesomeIcon icon={faLayerGroup} className="my-info-icon"/>
                                                    </div>
                                                    <div className='d-flex flex-column gap-0'>
                                                        <CustomTooltip title="Model Platform">
                                                        <div className='my-info-line1' >{data.inference_model_platform}</div>
                                                        </CustomTooltip>
                                                    </div>
                                                </div>

                                                <div className='d-flex flex-row gap-2 align-items-center'>
                                                    <div className="my-info-icon-container">
                                                        <FontAwesomeIcon icon={faCube} className="my-info-icon"/>
                                                    </div>
                                                    <div className='d-flex flex-column gap-0'>
                                                        <CustomTooltip title="Model Type">
                                                        <div className='my-info-line1' >{data.inference_model_type}</div>
                                                        </CustomTooltip>
                                                    </div>
                                                </div>

                                                <div className='d-flex flex-row gap-2 align-items-center'>
                                                    <div className="my-info-icon-container">
                                                        <FontAwesomeIcon icon={faBarcode} className="my-info-icon"/>
                                                    </div>
                                                    <div className='d-flex flex-column gap-0'>
                                                        <CustomTooltip title="Model UUID">
                                                        <div className='my-info-line1' >{data.inference_model}</div>
                                                        </CustomTooltip>
                                                    </div>
                                                </div>
                                            </div>


                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>
                    </div>
                    {
                        showChart &&
                        <div className="col-12 mb-2">
                            <div className="card border-0">
                                <div className="card-body  my-card-m p-2">
                                    <div className="row p-1">
                                        <div className="col-12 d-flex flex-column gap-2" style={{ paddingBottom: 20 }}>
                                            <div style={{ color: '#697A8D' }}>Container Chart</div>
                                            <ClientServerChart data={data} updateStatus={updateStatus} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    }

                    <div className="col-12 mb-3 mt-1">
                        <div className="card border-0">
                            <div className="card-body my-card-s p-1 align-items-center">
                                <div className="d-flex flex-row justify-content-between align-items-center gap-1">
                                    <div className="d-flex flex-row gap-2 align-items-center" style={{ paddingTop: '7px', paddingLeft: '8px' }} >
                                        <div className="my-card-status roboto-b2" style={{ paddingTop: '2px', color: '#697A8D' }}>
                                            Status
                                        </div>
                                        <div>
                                            <StatusButton name="task-status" title={data.status} className="mb-2" />

                                        </div>
                                    </div>
                                    <div style={{ paddingTop: '0px', paddingRight: '5px' }}>
                                        <SwitchButton onChange={handleToggleChange}
                                            status={data.switch ? 'run' : 'stop'} ref={toggleRef}
                                            left={-40}
                                            top={-5}
                                            id={'toggle_' + data.task_uuid}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="col-12 mt-1 d-flex justify-content-between">
                        <div className='d-flex flex-row gap-2'>

                            <CustomButton onClick={() => props.onDeleteTask(data.task_uuid)} status={data.status} name="view" text="Delete" width={100} />
                            <CustomButton onClick={() => props.onResetTask(data.task_uuid)} status={data.status} name="view" text="Reset" width={100} />
                            
                        </div>


                        <div style={{ height: 32, paddingTop: 10, color: '#697A8D' }} className='d-flex align-items-bottom'>
                            Create Time : {moment.unix(Math.round(data.create_time / 1000000)).format('YYYY-MM-DD HH:mm:ss')}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    );
};



export default TaskCard;