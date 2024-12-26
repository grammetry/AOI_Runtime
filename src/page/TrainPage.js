
import { useEffect, useState, useRef } from 'react';
import './page.scss';
import { Button, createTheme, Menu, MenuItem, ThemeProvider, Tooltip } from '@mui/material';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import { extendTheme } from '@mui/joy/styles';
import YAML from 'yaml';
import { faBan, faCheck, faTriangleExclamation, faSquareXmark, faSquareCheck, faSquareMinus, faSquare } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { AttributeType, PageKeyType, ProjectDataType } from './type';
import { SchedulerHeadContainer, SchedulerHeadWrapper, SchedulerBodyContainer, SchedulerBodyWrapper } from "./pageStyle";
import { taoWorkspaceAPI, taoQuickTrainAPI, taoStartTrainAPI, taoTrainStatusWS, taoEvaluateAPI, taoInferenceAPI, taoExportAPI, taoDownloadAPI, taoDownloadYamlAPI } from '../APIPath';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/js/dist/tab.js';
import log from '../utils/console';
import Utility from '../utils/Utility';

import CustomCounter from '../components/Counters/CustomCounter';
import CustomChart from '../components/Charts/CustomChart';
import StatusButton from '../components/Buttons/StatusButton';
import CustomButton from '../components/Buttons/CustomButton';
import ExtendButton from '../components/Buttons/ExtendButton';

import WebSocketUtility from '../components/WebSocketUtility.js';
import Stack from '@mui/joy/Stack';
import LinearProgress from '@mui/joy/LinearProgress';
import moment from 'moment';
import { filter, toArray, findIndex, isEqual, map, cloneDeep, sortBy, orderBy } from 'lodash-es';

export const theme = extendTheme({
    palette: {
        primary: {
            main: '#ed1b23',
        },
        secondary: {
            main: '#888',
        },
        soft: {
            main: '#888',
        },
    },
    typography: {
        fontFamily: 'Google Noto Sans TC',
    },
});

const TrainPage = (props) => {

    const { setPageKey, projectData, setCurrentProject } = props;
    const [noTask, setNoTask] = useState(true);

    const [currentStep, setCurrentStep] = useState(0);
    const [currentProjectName, setCurrentProjectName] = useState('');
    const [currentPercent, setCurrentPercent] = useState(0);

    const [showDetail, setShowDetail] = useState(false);


    const [totalStep, setTotalStep] = useState(200);
    const [currentUuid, setCurrentUuid] = useState(null);

    const [table1HeaderNoShadow, setTable1HeaderNoShadow] = useState(true);
    const [table2HeaderNoShadow, setTable2HeaderNoShadow] = useState(true);

    const currentTableColumnWidth = [100, 470, 180, 220, 150];
    //const historyTableColumnWidth = [100, 400, 400, 150, 150];

    const historyTableColumnWidth = ['10%', '30%', '30%', '25%', '5%'];

    const [remainingTime, setRemainingTime] = useState('');
    const [startTime, setStartTime] = useState('');

    const [taskList, setTaskList] = useState([]);
    const [fetchList, setFetchList] = useState([]);
    const [historyList, setHistoryList] = useState([]);

    const [currentTaskInfo, setCurrentTaskInfo] = useState('');


    const chartRef = useRef(null);
    const utilityRef = useRef(null);
    const currentTabRef = useRef(null);
    const historyTabRef = useRef(null);

    const getTrainingList = async () => {


        //log('---- getTrainingList ----')

     
        try {

            const response = await fetch(taoStartTrainAPI, {
                method: 'GET'
            })
            const data = await response.json();
    
            if (data.length === 0) {
                setNoTask(true);
            } else {
                setNoTask(false);
            }
            setFetchList(data);
            
        } catch (error) {

            utilityRef.current.showMessage('Get training list : '+error.message);
            
        }
    }

    const getHistoryList = async () => {

   
        try {

            const response = await fetch(taoWorkspaceAPI, {
                method: 'GET'
            });
            const data = await response.json();
            setHistoryList(data);
            //console.log(data)
            
        } catch (error) {

            utilityRef.current.showMessage('Get history list : '+error.message);
            
        }
    };

    const handleUpdateStep = (myStep) => {

        setCurrentStep(myStep);

    }

    const handleDeleteTask = async (myTaskId, myProjectName) => {

        if (myTaskId !== '') {

            const myData = {};
            myData.tao_model_uuid = myTaskId;
            myData.force = "false";

            utilityRef.current.setLoading(true);

            const response = await fetch(taoStartTrainAPI, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(myData),
            });

            const data = await response.json();

            utilityRef.current.setLoading(false);

            //console.log(data);
            //setTaskList(data);
            getTrainingList();


        }

    }

    const handleViewTask = async (myTaskId, myProjectName) => {

        viewTaskByModelId(myTaskId);

    }

    const handleDetailTask = async (myTaskId, myProjectName) => {

        //viewTaskByModelId(myTaskId);

        console.log('handle detail task')
        console.log(myTaskId, myProjectName);



        const theTask = filter(historyList, function (myItem) { return myItem.tao_model_uuid == myTaskId });

        if (theTask.length > 0) {

            const myTask = theTask[0];
            const myTrainStatus = myTask.tao_model_status;
            log('myTrainStatus', myTrainStatus);
            setCurrentTaskInfo(myTrainStatus);


            log(myTrainStatus.upload_dataset.success)
            setShowDetail(true);
        } else {
            setCurrentTaskInfo('');
            utilityRef.current.showMessage('No more infomation found.');
        }



    }

    const handleDeleteHistory = async (myTaoModelId) => {

        log(`delete history ${myTaoModelId}`)

        if (myTaoModelId !== '') {

            log(`delete history ${myTaoModelId}`)

            const myData = {};
            myData.tao_model_uuid = myTaoModelId;

            const response = await fetch(taoWorkspaceAPI, {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(myData),
            });

            const data = await response.json();
            console.log(data);
            //setTaskList(data);
            getHistoryList();


        }

    }

    const isFloat = (n) => {
        return parseFloat(n.match(/^-?\d*(\.\d+)?$/)) > 0;
    }



    const getModelNameByModelId = (myModelId) => {

        //console.log('myModelId='+myModelId);

        let myModelName = 'N/A';
        const myIndex1 = findIndex(historyList, function (myItem) { return myItem.tao_model_uuid == myModelId })

        if (myIndex1 >= 0) {
            myModelName = historyList[myIndex1].tao_model_name;
        }

        return myModelName;
    }

    const getTrainStatus = async (uuid) => {

        const wsurl = `${taoTrainStatusWS}?tao_model_uuid=${uuid}`;
        //setShowLoadingModal(true);
        //console.log(wsurl);
        const websocket = new WebSocketUtility(wsurl);
        websocket.setMessageCallback(async (message) => {


            if (message.indexOf('Training finished successfully.') >= 0) {
                websocket.stop();

            } else {
                const fromStr = message.indexOf('}, "details"') + 13;
                const toStr = message.length - 1;
                if (fromStr >= 0) {
                    const myData = message.substring(fromStr, toStr).replaceAll('\\u2588', '');
                    //console.log(myData);
                    const myArr = myData.split('\\r');

                    myArr.map((item) => {

                        // console.log(`index=${index}`);
                        console.log(item);

                        if (item.indexOf('Epoch') >= 0) {
                            const myEpoch = item.substring(item.indexOf('Epoch') + 5, item.indexOf(':')).replaceAll(' ', '');
                            const myInfo = item.substring(item.indexOf('train_loss='), item.length);
                            let myTranLoss = '';
                            if (myInfo.indexOf('train_loss=') >= 0) {
                                myTranLoss = myInfo.substring(myInfo.indexOf('train_loss=') + 11, myInfo.length);
                            }
                            if (myTranLoss.indexOf(',') >= 0) {
                                myTranLoss = myTranLoss.substring(0, myTranLoss.indexOf(','));
                            }
                            if (myTranLoss.indexOf(']') >= 0) {
                                myTranLoss = myTranLoss.substring(0, myTranLoss.indexOf(']'));
                            }
                            let myValLoss = '';
                            if (myInfo.indexOf('val_loss=') >= 0) {
                                myValLoss = myInfo.substring(myInfo.indexOf('val_loss=') + 9, myInfo.length);
                            }
                            if (myValLoss.indexOf(']') >= 0) {
                                myValLoss = myValLoss.substring(0, myValLoss.indexOf(']'));
                            }



                            setCurrentStep(parseInt(myEpoch) + 1);

                            if (chartRef.current) {

                                if (isFloat(myTranLoss)) {
                                    chartRef.current.updateChart1Line1Data(parseInt(myEpoch) + 1, parseFloat(myTranLoss));
                                }

                                if (isFloat(myValLoss)) {
                                    chartRef.current.updateChart1Line2Data(parseInt(myEpoch) + 1, parseFloat(myValLoss));
                                }



                            }

                        }
                    })
                }
            }


        });

        websocket.start();

    }


    const doTrain = async (myModelId) => {

        console.log(`doTrain ${myModelId}`);

        const myIndex1 = findIndex(historyList, function (myItem) { return myItem.tao_model_uuid == myModelId })
        if (myIndex1 >= 0) {

            const myTrainStatus = historyList[myIndex1].tao_model_status.train.status;

            if (!myTrainStatus) {

                try {
                    log('try train model')

                    utilityRef.current.setLoading(true);

                    const response = await fetch(taoStartTrainAPI, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ "tao_model_uuid": myModelId }),
                    });

                    const data = await response.json();

                    utilityRef.current.setLoading(false);

                    if (data.detail) {
                        utilityRef.current?.showErrorMessage(data.detail);
                        return;
                    }

                    if (data.message) {
                        utilityRef.current.showMessage(data.message);
                    }

                    getHistoryList();

                } catch (err) {

                    console.log(err);
                    utilityRef.current.setLoading(false);

                }

            }

        };

    };


    const doEvaluate = async (myModelId) => {

        log(`doEvaluate ${myModelId}`);

        const myIndex1 = findIndex(historyList, function (myItem) { return myItem.tao_model_uuid == myModelId })
        if (myIndex1 >= 0) {

            const myTrainStatus = historyList[myIndex1].tao_model_status.train.status;

            if (myTrainStatus) {

                try {
                    log('try evaluate model')

                    utilityRef.current.setLoading(true);

                    const response = await fetch(taoEvaluateAPI, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({ "tao_model_uuid": myModelId }),
                    });

                    const data = await response.json();

                    utilityRef.current.setLoading(false);

                    if (data.detail) {
                        utilityRef.current?.showErrorMessage(data.detail);
                        return;
                    }

                    if (data.message) {
                        utilityRef.current.showMessage(data.message);
                    }

                    getHistoryList();

                } catch (err) {

                    console.log(err);
                    utilityRef.current.setLoading(false);

                }

            }

        };

    };

    const getProjectIdByDatasetId = (myId) => {

        console.log(projectData)

        let myProjectId = '';
        const myIndex1 = findIndex(projectData, function (myItem) { return myItem.dataset_uuid == myId })
        if (myIndex1 >= 0) {
            myProjectId = projectData[myIndex1].project_uuid;
        }
        return myProjectId;
    }

    const doInference = async (myModelId) => {

        log(`doInference ${myModelId}`)

        const myIndex1 = findIndex(historyList, function (myItem) { return myItem.tao_model_uuid == myModelId })
        if (myIndex1 >= 0) {


            const myEvaluateStatus = historyList[myIndex1].tao_model_status.evaluate.status;
            const myInferenceStatus = historyList[myIndex1].tao_model_status.inference.success;
            const myDatasetId = historyList[myIndex1].dataset_uuid;
            const myExportId = historyList[myIndex1].export_uuid;

            const myProjectId = getProjectIdByDatasetId(myDatasetId);

            if (myInferenceStatus) {

                utilityRef.current.setCurrentTaoModelId(myModelId);
                utilityRef.current.setCurrentExportId(myExportId);
                setPageKey('InferenceResultPage');

            } else {
                if (myEvaluateStatus) {

                    try {
                        log('try evaluate model')
                        utilityRef.current.setLoading(true);
                        const response = await fetch(taoInferenceAPI, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            body: JSON.stringify({ "tao_model_uuid": myModelId }),
                        });

                        const data = await response.json();
                        utilityRef.current.setLoading(false);

                        if (data.detail) {
                            utilityRef.current?.showErrorMessage(data.detail);
                            return;
                        }

                        if (data.message) {
                            utilityRef.current.showMessage(data.message);
                        }

                        getHistoryList();

                    } catch (err) {
                        const msg = err?.response?.detail?.[0]?.msg || '';
                        const loc = err?.response?.detail?.[0]?.loc || [];
                        console.log(`API error: ${msg} [${loc.join(', ')}]`);
                        utilityRef.current.setLoading(false);


                    }

                }
            }



        };

    };

    const viewTaskByModelId = async (myModelId) => {

        log(`viewTaskByModelId ${myModelId}`)

        const myIndex1 = findIndex(historyList, function (myItem) { return myItem.tao_model_uuid == myModelId });

        if (myIndex1 < 0) {

            utilityRef.current.showMessage('Dataset uuid not found.');
            return;
        }

        const myDatasetId = historyList[myIndex1].dataset_uuid;
        const myProjectId = getProjectIdByDatasetId(myDatasetId);
        log('myProjectId:' + myProjectId)

        if (myProjectId === '') {

            utilityRef.current.showMessage('Project uuid not found.');
            return;
        }

        const myIndex2 = findIndex(projectData, function (myItem) { return myItem.project_uuid == myProjectId });

        if (myIndex2 < 0) {

            utilityRef.current.showMessage('Project not found.');
            return;
        }

        if (myIndex2 >= 0) {
            const project = projectData[myIndex2];
            const project_uuid = projectData[myIndex2].project_uuid;

            setCurrentProject(project);
            if (project.export_uuid) {
                setPageKey('SetAttributePage')
            } else {
                utilityRef.current.showMessage('Export uuid not found.');
            }
        }


    }

    const handleViewClick = () => {

        viewTaskByModelId(currentUuid);

    }

    const handleTaskStopClick = async () => {

        //viewTaskByModelId(currentUuid);
        console.log('handleTaskStopClick')
        console.log(currentUuid)
        //taoStartTrainAPI

        const res = await fetch(taoStartTrainAPI, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ "tao_model_uuid": currentUuid,"force":true })
        })
        const resJson = await res.json();

        if (resJson.detail) {
            utilityRef.current?.showErrorMessage(resJson.detail);
            return;
        }

        if (resJson.message) {
            utilityRef.current.showMessage(resJson.message);
        }

        getTrainingList();

      

    }

    const getSettingFile = async (myModelId) => {
        log(`getSettingFile ${myModelId}`)

        try {

            const myUrl = `${taoDownloadYamlAPI}?tao_model_uuid=${myModelId}`;

            const res = await fetch(myUrl, { method: 'GET' });

            const resYaml = await res.text();

            const yamlObj = YAML.parse(resYaml);

            const myEpochs = yamlObj.train.num_epochs;

            //console.log('--- yamlObj ---')
            //console.log(yamlObj);

            if (totalStep !== myEpochs) {
                setTotalStep(myEpochs);
            }


        } catch (err) {
            console.log(err)
        }
    }

    useEffect(() => {

        setCurrentPercent(0);
        setCurrentStep(0);
        getTrainingList();
        getHistoryList();

        log('---- project data ----')
        console.log(props.projectData);

        // every 5 seconds get training list
        const interval = setInterval(async () => {
            await getTrainingList();
            await getHistoryList();
        }, 10000);

        const currentTab = utilityRef.current.getCurrentTab();
        log('currentTab', currentTab);
        if (currentTab === 'current') {
            currentTabRef.current.click();
        } else {
            historyTabRef.current.click();
        }

        return () => clearInterval(interval);
    }, []);


    useEffect(() => {


        setTaskList(fetchList);

        fetchList.map((item, index) => {

            if (index === 0) {
                const newUuid = item.tao_model_uuid;
                if (newUuid !== currentUuid) {
                    setCurrentUuid(newUuid);
                    getTrainStatus(newUuid);
                    getSettingFile(newUuid);
                    getHistoryList();
                    setCurrentStep(0);
                    setCurrentPercent(0);
                    if (chartRef.current) {
                        chartRef.current.resetLineData();
                    }
                }
            }

        });




    }, [fetchList]);



    return (
        <>

            <ThemeProvider theme={theme}>


                <Modal open={showDetail}>
                    <ModalDialog style={{ width: 500, height: 700, backgroundColor: '#ffffff' }} layout='center'>
                        <div className='d-flex align-items-end flex-column bd-highlight mb-0' style={{ height: 600 }}>
                            <div className='container-fluid'>

                                <div className='row mt-2 p-0'>
                                    <div className='col-12 d-flex justify-content-between p-0' style={{ paddingRight: 21 }}>
                                        <h4 style={{ margin: 0 }}>Task Detail Info</h4>
                                    </div>
                                </div>

                                <div className='row mt-1'>
                                    <div className='col-md-12 mt-3 p-0 d-flex flex-row justify-content-between align-items-center'>
                                        <div className='my-detail-item-lv0'>
                                            Completed
                                        </div>
                                        <div className='my-detail-item'>
                                            {
                                                (currentTaskInfo.completed) ?
                                                    <FontAwesomeIcon icon={faSquareCheck} color="green" size="2x"/>
                                                    :
                                                    <FontAwesomeIcon icon={faSquare} color="gray" size="2x" />
                                            }
                                        </div>

                                    </div>
                                </div>



                                <div className='row'>
                                    <div className='col-md-12 mt-1 p-0 d-flex flex-row justify-content-between' style={{ borderBottom: '1px solid #16272e3d' }}>

                                    </div>
                                </div>

                                <div className='row'>
                                    <div className='col-md-12 mt-3 p-0 d-flex flex-row justify-content-between'>
                                        <div className='my-detail-item-lv1'>
                                            1. Upload dataset
                                        </div>
                                        <div className='my-detail-item'>
                                            {
                                                (currentTaskInfo.upload_dataset?.success) ?
                                                <FontAwesomeIcon icon={faSquareCheck} color="green" size="2x"/>
                                                :
                                                <FontAwesomeIcon icon={faSquare} color="gray" size="2x" />
                                            }
                                        </div>

                                    </div>
                                </div>

                                {
                                    (currentTaskInfo.upload_dataset?.status?.train?.length >= 2) ?
                                        <div className='row'>
                                            <div className='col-md-12 mt-1 p-0 d-flex flex-row justify-content-start'>
                                                <div className='my-detail-item-lv2'>
                                                    Train {currentTaskInfo.upload_dataset.status.train[1]}
                                                </div>
                                            </div>
                                        </div>
                                        :
                                        <></>
                                }

                                {
                                    (currentTaskInfo.upload_dataset?.status?.val?.length >= 2) ?
                                        <div className='row'>
                                            <div className='col-md-12 mt-1 p-0 d-flex flex-row justify-content-start'>
                                                <div className='my-detail-item-lv2'>
                                                    Val {currentTaskInfo.upload_dataset.status.val[1]}
                                                </div>
                                            </div>
                                        </div>
                                        :
                                        <></>
                                }


                                <div className='row'>
                                    <div className='col-md-12 mt-3 p-0 d-flex flex-row justify-content-between'>
                                        <div className='my-detail-item-lv1'>
                                            2. Train
                                        </div>
                                        <div className='my-detail-item'>
                                            {
                                                (currentTaskInfo.train?.success) ?
                                                <FontAwesomeIcon icon={faSquareCheck} color="green" size="2x"/>
                                                :
                                                <FontAwesomeIcon icon={faSquare} color="gray" size="2x" />
                                            }
                                        </div>

                                    </div>
                                </div>

                                {
                                    (currentTaskInfo.train?.status.length >= 2) ?
                                        <div className='row'>
                                            <div className='col-md-12 mt-1 p-0 d-flex flex-row justify-content-start'>
                                                <div className='my-detail-item-lv2'>
                                                    {currentTaskInfo.train.status[1]}
                                                </div>


                                            </div>
                                        </div>
                                        :
                                        <></>
                                }



                                <div className='row'>
                                    <div className='col-md-12 mt-3 p-0 d-flex flex-row justify-content-between'>
                                        <div className='my-detail-item-lv1'>
                                            3. Evaluate
                                        </div>
                                        <div className='my-detail-item'>
                                            {
                                                (currentTaskInfo.evaluate?.success) ?
                                                <FontAwesomeIcon icon={faSquareCheck} color="green" size="2x"/>
                                                :
                                                <FontAwesomeIcon icon={faSquare} color="gray" size="2x" />
                                            }
                                        </div>

                                    </div>
                                </div>

                                {
                                    (currentTaskInfo.evaluate?.status.length >= 2) ?
                                        <div className='row'>
                                            <div className='col-md-12 mt-1 p-0 d-flex flex-row justify-content-start'>
                                                <div className='my-detail-item-lv2'>
                                                    {currentTaskInfo.evaluate.status[1]}
                                                </div>


                                            </div>
                                        </div>
                                        :
                                        <></>
                                }


                                <div className='row'>
                                    <div className='col-md-12 mt-3 p-0 d-flex flex-row justify-content-between'>
                                        <div className='my-detail-item-lv1'>
                                            4. Inference
                                        </div>
                                        <div className='my-detail-item'>
                                            {
                                                (currentTaskInfo.inference?.success) ?
                                                <FontAwesomeIcon icon={faSquareCheck} color="green" size="2x"/>
                                                :
                                                <FontAwesomeIcon icon={faSquare} color="gray" size="2x" />
                                            }
                                        </div>

                                    </div>
                                </div>

                                {
                                    (currentTaskInfo.inference?.status.length >= 2) ?
                                        <div className='row'>
                                            <div className='col-md-12 mt-1 p-0 d-flex flex-row justify-content-start'>
                                                <div className='my-detail-item-lv2'>
                                                    {currentTaskInfo.inference.status[1]}
                                                </div>


                                            </div>
                                        </div>
                                        :
                                        <></>
                                }


                                <div className='row'>
                                    <div className='col-md-12 mt-3 p-0 d-flex flex-row justify-content-between'>
                                        <div className='my-detail-item-lv1'>
                                            5. Export
                                        </div>
                                        <div className='my-detail-item'>
                                            {
                                                (currentTaskInfo.export?.success) ?
                                                <FontAwesomeIcon icon={faSquareCheck} color="green" size="2x"/>
                                                :
                                                <FontAwesomeIcon icon={faSquare} color="gray" size="2x" />
                                            }
                                        </div>

                                    </div>
                                </div>

                                {
                                    (currentTaskInfo.export?.status.length >= 2) ?
                                        <div className='row'>
                                            <div className='col-md-12 mt-1 p-0 d-flex flex-row justify-content-start'>
                                                <div className='my-detail-item-lv2'>
                                                    {currentTaskInfo.export.status[1]}
                                                </div>


                                            </div>
                                        </div>
                                        :
                                        <></>
                                }




                            </div>
                        </div>
                        <div className='container-fluid mt-auto'>
                            <div className='row'>
                                <div className='col-md-12 d-flex flex-row gap-3 justify-content-end p-0'>
                                    <div><CustomButton name="view" text="Close" width={100} height={32} onClick={() => setShowDetail(false)} /></div>

                                </div>
                            </div>
                        </div>

                    </ModalDialog>
                </Modal>



                <div className="container">
                    <div className="title-container">
                        <div className="title-style">Train Page</div>

                    </div>
                    <div className="train-page-content">
                        <SchedulerHeadContainer $noOverFlow={true}>
                            <SchedulerHeadWrapper>
                                <div style={{ position: 'relative', height: 40 }}>
                                    <div style={{ position: 'absolute', top: 2 }}>

                                        <ul className="nav nav-tabs flex-nowrap" id="myTab" role="tablist">
                                            <li className="nav-item" role="presentation">
                                                <button className="my-nav-link active"
                                                    id="current-tab"
                                                    data-bs-toggle="tab"
                                                    data-bs-target="#current"
                                                    type="button" role="tab"
                                                    aria-controls="info"
                                                    aria-selected="true"
                                                    ref={currentTabRef}
                                                    onClick={() => utilityRef.current.setCurrentTab('current')}>Current</button>

                                            </li>
                                            <li className="nav-item" role="presentation">
                                                <button className="my-nav-link"
                                                    id="history-tab"
                                                    data-bs-toggle="tab"
                                                    data-bs-target="#history"
                                                    type="button" role="tab"
                                                    aria-controls="log"
                                                    aria-selected="false"
                                                    ref={historyTabRef}
                                                    onClick={() => utilityRef.current.setCurrentTab('history')}
                                                >History</button>
                                            </li>
                                        </ul>

                                    </div>
                                </div>

                            </SchedulerHeadWrapper>
                        </SchedulerHeadContainer>


                        <SchedulerBodyContainer $noOverFlow={true} >
                            <SchedulerBodyWrapper>

                                <div className="tab-content" id="myTabContent">
                                    <div className="tab-pane fade show active" id="current" role="tabpanel" aria-labelledby="current-tab">
                                        {
                                            noTask ?
                                                <div className='d-flex flex-column justify-content-center align-items-center' style={{ width: 1200, height: 500 }}>
                                                    <div style={{ fontSize: 22, color: '#000000', fontWeight: 500 }}>No training job.</div>
                                                    <div style={{ fontSize: 18, color: '#979CB5', fontWeight: 300 }}>Please start training from project.</div>

                                                </div>
                                                :
                                                <div className='my-tab-container d-flex flex-row justify-content-between gap-3'>

                                                    <div className='my-training-panel d-flex flex-column' style={{ backgroundColor: 'white' }}>
                                                        <div className='my-training-panel-section-1'>
                                                            <div className='d-flex flex-column' style={{ padding: 24 }}>
                                                                <div className='d-flex flex-row justify-content-between' style={{ fontWeight: 500, fontSize: 22 }}>

                                                                    <div style={{ width: 200, overflow: 'hidden', textOverflow: 'ellipsis' }}>

                                                                        {getModelNameByModelId(currentUuid)}

                                                                    </div>

                                                                    <CustomCounter currentStep={currentStep} totalStep={totalStep} updatePercent={(myPercent) => setCurrentPercent(myPercent)}></CustomCounter>
                                                                </div>
                                                                <div className='d-flex flex-row justify-content-between' style={{ paddingTop: 15, paddingBottom: 15 }}>
                                                                    <Stack spacing={12} sx={{ flex: 1 }}>
                                                                        <LinearProgress determinate value={currentPercent} size="lg" />

                                                                    </Stack>
                                                                </div>
                                                                <div className='d-flex flex-row justify-content-between' style={{ fontWeight: 400, fontSize: 13, color: '#000000D9' }}>
                                                                    <div>Started at {startTime}</div>
                                                                    <div>{remainingTime} left</div>
                                                                </div>
                                                                <div className='d-flex flex-row justify-content-between' style={{ paddingTop: 15, paddingBottom: 0 }}>
                                                                    <div><CustomButton name="stop" width={116} height={32} onClick={handleTaskStopClick}/></div>
                                                                    <div><CustomButton name="view" text="View" width={116} height={32} onClick={handleViewClick} /></div>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div className='my-training-panel-section-2'>


                                                            <CustomChart datasetId={'aaa'} lastIter={20} totalStep={parseInt(totalStep)} updateStep={handleUpdateStep} ref={chartRef} />

                                                        </div>
                                                        <div className='my-training-panel-section-3'>


                                                            <div className='d-flex flex-column' style={{ padding: '24px 20px' }}>
                                                                <div className='d-flex flex-row justify-content-between' style={{ fontWeight: 500, fontSize: 22, paddingBottom: 5 }}>
                                                                    <div>Information</div>
                                                                </div>

                                                                <div className='d-flex flex-row justify-content-start' style={{ borderBottom: '1px solid #0000001F', paddingLeft: 8 }}>
                                                                    <div className='d-flex align-items-center' style={{ fontSize: 14, color: '#979CB5', width: 120, height: 34, paddingTop: 3 }}>Model type</div>
                                                                    <div className='d-flex align-items-center' style={{ fontSize: 14, color: '#16272E', paddingTop: 3 }}></div>
                                                                </div>
                                                                <div className='d-flex flex-row justify-content-start' style={{ borderBottom: '1px solid #0000001F', paddingLeft: 8 }}>
                                                                    <div className='d-flex align-items-center' style={{ fontSize: 14, color: '#979CB5', width: 120, height: 34, paddingTop: 3 }}>Platform</div>
                                                                    <div className='d-flex align-items-center' style={{ fontSize: 14, color: '#16272E', paddingTop: 3 }}></div>
                                                                </div>
                                                                <div className='d-flex flex-row justify-content-start' style={{ borderBottom: '1px solid #0000001F', paddingLeft: 8 }}>
                                                                    <div className='d-flex align-items-center' style={{ fontSize: 14, color: '#979CB5', width: 120, height: 34, paddingTop: 3 }}>Dataset count</div>
                                                                    <div className='d-flex align-items-center' style={{ fontSize: 14, color: '#16272E', paddingTop: 3 }}></div>
                                                                </div>
                                                                <div className='d-flex flex-row justify-content-start' style={{ borderBottom: '1px solid #0000001F', paddingLeft: 8 }}>
                                                                    <div className='d-flex align-items-center' style={{ fontSize: 14, color: '#979CB5', width: 120, height: 34, paddingTop: 3 }}>Training method</div>
                                                                    <div className='d-flex align-items-center' style={{ fontSize: 14, color: '#16272E', paddingTop: 3 }}></div>
                                                                </div>

                                                            </div>


                                                        </div>

                                                    </div>



                                                    <div className='my-table' style={{ width: 880, height: 662 }}>
                                                        <div className={(table1HeaderNoShadow) ? 'my-thead' : 'my-thead-shadow'}>

                                                            <div className='my-thead-th' style={{ width: currentTableColumnWidth[0] }}>Order</div>
                                                            <div className='my-thead-th' style={{ width: currentTableColumnWidth[1] }}>Model name</div>
                                                            <div className='my-thead-th' style={{ width: currentTableColumnWidth[2] }}>Status</div>
                                                            <div className='my-thead-th' style={{ width: currentTableColumnWidth[3] }}>Create time</div>
                                                            <div className='my-thead-th' style={{ width: currentTableColumnWidth[4] }}></div>
                                                        </div>
                                                        <div className='my-tbody' onScroll={(e) => {
                                                            if (e.target.scrollTop === 0) {
                                                                //console.log('滾動在頂部');
                                                                setTable1HeaderNoShadow(true);
                                                            } else {
                                                                //console.log('滾動不在頂部');
                                                                setTable1HeaderNoShadow(false);
                                                            }

                                                        }}>

                                                            {taskList.map((item, i) => (


                                                                <div key={`taskList_${i}`} >

                                                                    <div className={(i === (taskList.length - 1)) ? `my-tbody-row-${(i % 2 === 1) ? "1" : "2"} flash-element` : `my-tbody-row-${(i % 2 === 1) ? "1" : "2"}`} task_uuid={item.tao_model_uuid} onClick={() => console.log('click')}>

                                                                        <div className='my-tbody-td' style={{ width: currentTableColumnWidth[0] }} >{i + 1}</div>
                                                                        <div className='my-tbody-td' style={{ width: currentTableColumnWidth[1], overflow: 'hidden', textOverflow: 'ellipsis' }} >

                                                                            {getModelNameByModelId(item.tao_model_uuid)}

                                                                        </div>
                                                                        <div className='my-tbody-td' style={{ width: currentTableColumnWidth[2] }}>
                                                                            {
                                                                                (item.train_status.status === 'START') ? <StatusButton name="training" /> :
                                                                                    (item.train_status.status === 'WAIT') ? <StatusButton name="train-wait" /> :
                                                                                        (item.train_status.status === 'SUCCESS') ? <StatusButton name="train-active" /> :
                                                                                            (item.train_status.status === 'FAILURE') ? <StatusButton name="train-failed" title={item.train_status.details} /> : <StatusButton name="waiting" />
                                                                            }

                                                                        </div>
                                                                        <div className='my-tbody-td' style={{ width: currentTableColumnWidth[3], fontWeight: 300 }}>{moment.unix(item.create_time / 1000000).format("YYYY-MM-DD HH:mm")}</div>
                                                                        <div className='my-tbody-td' style={{ width: currentTableColumnWidth[4] }}>
                                                                            <ExtendButton type={1} uuid={item.tao_model_uuid} projectName={item.tao_model_uuid} onDeleteTask={handleDeleteTask} onViewTask={handleViewTask} />
                                                                        </div>
                                                                    </div>
                                                                </div>
                                                            ))}

                                                        </div>




                                                    </div>
                                                </div>

                                        }
                                    </div>
                                    <div className="tab-pane fade" id="history" role="tabpanel" aria-labelledby="history-tab" style={{ backgroundColor: 'red', width: '100%' }}>
                                        <div className='my-tab-container' style={{ width: '80vw', maxWidth: 1200 }}>

                                            <div className='my-table'>
                                                <div className={(table2HeaderNoShadow) ? 'my-thead' : 'my-thead-shadow'}>
                                                    <div className='my-thead-th' style={{ width: historyTableColumnWidth[0] }}>Order</div>
                                                    <div className='my-thead-th' style={{ width: historyTableColumnWidth[1] }}>Model name</div>
                                                    <div className='my-thead-th' style={{ width: historyTableColumnWidth[2] }}>Status</div>
                                                    <div className='my-thead-th' style={{ width: historyTableColumnWidth[3] }}>Create Time</div>
                                                    <div className='my-thead-th' style={{ width: historyTableColumnWidth[4] }}></div>
                                                </div>
                                                <div className='my-tbody' >

                                                    {historyList.map((item, index) => (


                                                        <div key={`history_${index}`} >

                                                            <div className={(index === (historyList.length - 1)) ? `my-tbody-row-${(index % 2 === 1) ? "1" : "2"} flash-element` : `my-tbody-row-${(index % 2 === 1) ? "1" : "2"}`} task_uuid={item.tao_model_uuid}>

                                                                <div className='my-tbody-td' style={{ width: historyTableColumnWidth[0] }} >{index + 1}</div>
                                                                <div className='my-tbody-td' style={{ width: historyTableColumnWidth[1], overflow: 'hidden', textOverflow: 'ellipsis' }} >

                                                                    {item.tao_model_name}

                                                                </div>
                                                                <div className='my-tbody-td d-flex flex-row gap-2' style={{ width: historyTableColumnWidth[2] }}>
                                                                    {
                                                                        (item.tao_model_status.train.success) ? <StatusButton name="train-active" style={{ cursor: 'default !important' }} /> :
                                                                            (item.tao_model_uuid === currentUuid) ? <StatusButton name="training" style={{ cursor: 'default !important' }} /> :
                                                                                <div>
                                                                                    <StatusButton name="train-inactive" style={{ cursor: 'default !important' }} onClick={() => doTrain(item.tao_model_uuid)} />
                                                                                </div>
                                                                    }

                                                                    {
                                                                        (item.tao_model_status.evaluate.success) ?
                                                                            <StatusButton name="evaluate-active" onClick={() => doEvaluate(item.tao_model_uuid)} style={{ cursor: 'pointer' }} />
                                                                            :
                                                                            <StatusButton name="evaluate-inactive" onClick={() => doEvaluate(item.tao_model_uuid)} style={{ cursor: 'pointer' }} />

                                                                    }

                                                                    {
                                                                        (item.tao_model_status.inference.success) ?
                                                                            <StatusButton name="inference-active" onClick={() => doInference(item.tao_model_uuid)} style={{ cursor: 'pointer' }} />
                                                                            :
                                                                            <StatusButton name="inference-inactive" onClick={() => doInference(item.tao_model_uuid)} style={{ cursor: 'pointer' }} />

                                                                    }

                                                                </div>
                                                                <div className='my-tbody-td' style={{ width: historyTableColumnWidth[3], fontWeight: 300 }}>{moment.unix(item.create_time / 1000000).format("YYYY-MM-DD HH:mm")}</div>
                                                                <div className='my-tbody-td d-flex justify-content-end' style={{ width: historyTableColumnWidth[4], padding: '20px' }}>
                                                                    <ExtendButton type={1} uuid={item.tao_model_uuid} projectName={item.tao_model_uuid} onDeleteTask={handleDeleteHistory} onViewTask={handleViewTask} onDetailTask={handleDetailTask} /></div>
                                                            </div>
                                                        </div>
                                                    ))}



                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>


                            </SchedulerBodyWrapper>
                        </SchedulerBodyContainer >

                    </div>
                </div>
            </ThemeProvider >
            <Utility ref={utilityRef} />

        </>
    );
}

export default TrainPage;