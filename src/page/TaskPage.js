
import { useEffect, useState, useRef } from 'react';
import './page.scss';
import { Button, createTheme, Menu, MenuItem, ThemeProvider, Tooltip } from '@mui/material';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import { extendTheme } from '@mui/joy/styles';
import StorageIcon from '@mui/icons-material/Storage';
import DataThresholdingIcon from '@mui/icons-material/DataThresholding';
import { v4 as uuidv4 } from 'uuid';
import axios from 'axios';
import { includes } from 'lodash-es';

import { inferTaskAPI, inferModelAPI, inferInferenceAPI, inferAllSupportPanelAPI, inferTaskStartAPI, inferHeartBeatAPI } from '../APIPath';

import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap/js/dist/tab.js';
import log from '../utils/console';
import Utility from '../utils/Utility';

import CustomCounter from '../components/Counters/CustomCounter';
import CustomChart from '../components/Charts/CustomChart';
import StatusButton from '../components/Buttons/StatusButton';
import CustomButton from '../components/Buttons/CustomButton';
import ExtendButton from '../components/Buttons/ExtendButton';
import PanelSelector from '../components/Dropdowns/PanelSelector';
import CustomWebSocket from '../components/WebSockets/CustomWebSocket';
import ModelUploadList from '../components/Lists/ModelUploadList';
import CustomInput from '../components/Inputs/CustomInput';


import TaskCard from '../components/Cards/TaskCard';
import ModelCard from '../components/Cards/ModelCard';

import ServerSelector from '../components/Dropdowns/ServerSelector';

import WebSocketUtility from '../components/WebSocketUtility.js';
import Stack from '@mui/joy/Stack';
import LinearProgress from '@mui/joy/LinearProgress';
import moment from 'moment';
import { filter, toArray, findIndex, isEqual, map, cloneDeep, sortBy, orderBy, set, get } from 'lodash-es';

import LightGreenIcon from '../image/Light_Green.png';
import LightRedIcon from '../image/Light_Red.png';
import LightGrayIcon from '../image/Light_Gray.png';






const TaskPage = (props) => {

    const { setPageKey, projectData, setCurrentProject } = props;

    const [serverOption, setServerOption] = useState([]);
    const [serverList, setServerList] = useState([]);
    const [currentServer, setCurrentServer] = useState('');
    const [currentTab, setCurrentTab] = useState('Task');
    const [taskList, setTaskList] = useState([]);
    const [modelList, setModelList] = useState([]);
    const [panelOption, setPanelOption] = useState([]);
    const [modelOption, setModelOption] = useState([]);
    const [modelData, setModelData] = useState([]);
    const [inferPanel, setInferPanel] = useState([]);
    const [selectedPanel, setSelectedPanel] = useState('');
    const [selectedModel, setSelectedModel] = useState('');

    const [currentFileName, setCurrentFileName] = useState('');
    const [currentFile, setCurrentFile] = useState(null);

    const [showEdit, setShowEdit] = useState(false);
    const [showUpload, setShowUpload] = useState(false);

    const [currentEditTaskIndex, setCurrentEditTaskIndex] = useState(-1);

    const [currentEditTaskUuid, setCurrentEditTaskUuid] = useState('');
    const [currentEditModelUuid, setCurrentEditModelUuid] = useState('');
    const [currentEditModelName, setCurrentEditModelName] = useState('');

    const [showTaskDeleteConfirm, setShowTaskDeleteConfirm] = useState(false);
    const [showModelDeleteConfirm, setShowModelDeleteConfirm] = useState(false);

    const utilityRef = useRef(null);

    const panelSelectorRef = useRef(null);
    const modelSelectorRef = useRef(null);
    const selectFileRef = useRef(null);
    const inputFileNameRef = useRef(null);
    const uploadRef = useRef(null);

    const statusHotDatabaseRef = useRef(null);
    const statusColdDatabaseRef = useRef(null);
    const statusClearDogRef = useRef(null);
    const statusWatchDogRef = useRef(null);

    const theme = extendTheme({
        components: {
            JoyModalDialog: {
                defaultProps: { layout: 'center' },
                styleOverrides: {
                    root: ({ ownerState }) => ({
                        ...(ownerState.layout === 'center' && {
                            // width: '400px',
                            // height: '300px',
                            // backgroundColor: 'white',
                            // borderRadius: '12px',
                            // border: '1px solid #E0E1E6',
                            // boxShadow: '0px 0px 4px #CACBD733',
                            // padding: '40px',
                            // fontFamily: 'Roboto',
                            padding: '40px'
                        }),
                    }),
                },
            },
        },
    });

    const handleFileChange = (e) => {

        console.log('file change')
        console.log(e.target.files[0].name)

        if (e.target.files) {

            const fileName = e.target.files[0].name;

            const fileExtension = fileName.toString().split('.').pop().toLowerCase();

            const supportType = ['zip'];

            if (includes(supportType, fileExtension)) {

                setCurrentFileName(fileName);
                setCurrentFile(e.target.files[0]);

            }
            else {
                e.target.files = null;
                utilityRef.current?.showMessage(`File type not support! Support Type : [${supportType.join(', ')}]`);
            }
        }

    }

    const handleUpdateStatus = (myProgress, myProgressText) => {
        console.log('update status');
        console.log(myProgress, myProgressText);

        uploadRef.current?.setProgress(myProgress,myProgressText);

        if (myProgressText==='Success') {
            setShowUpload(false);
        }

    }

    const handleUpload = () => {

        console.log('handle upload');


        if (currentFile) {

            console.log(currentFile);

            uploadRef.current?.setUpload(currentFileName, currentFile);



        } else {
            utilityRef.current?.showMessage('Please select file!');
        }



    }

    const handleTabClick = () => {
        if (currentTab === 'Task') {
            setCurrentTab('Model');
        } else {
            setCurrentTab('Task');
        }
    }


    const getTaskList = async () => {

        try {

            const myUrl = `${inferTaskAPI}`;

            const res = await fetch(myUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const resJson = await res.json();

            if (resJson.detail) {
                utilityRef.current.showErrorMessage(resJson.detail);
                return;
            }

            let myData = cloneDeep(resJson);
            myData.forEach(element => {
                element.updateStatus = {};
            });
            setTaskList(myData);

        } catch (error) {

            utilityRef.current.showMessage(error.message);

        }

    }

    const getModelList = async () => {


        console.log('get model list')

        try {

            const myUrl = `${inferModelAPI}`;

            const res = await fetch(myUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                },
            });

            const resJson = await res.json();

            if (resJson.detail) {
                utilityRef.current.showErrorMessage(resJson.detail);
                return;
            }

            setModelList(resJson);

        } catch (error) {
            utilityRef.current.showMessage(error.message);
        }


    }

    const getPanelList = async () => {

        try {

            const myUrl = `${inferAllSupportPanelAPI}`;

            const res = await fetch(myUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const resJson = await res.json();

            if (resJson.detail) {
                utilityRef.current.showErrorMessage(resJson.detail);
                return;
            }

            let myOptionList = [];
            resJson.map((item) => {
                let myOption = {};
                myOption.value = item;
                myOption.label = item;
                myOptionList.push(myOption);
            });


            console.log('myOptionList', myOptionList);
            setPanelOption(myOptionList);

        } catch (error) {
            utilityRef.current?.showMessage(error.message);
        }

    }

    const getTaskModelList = async (mySelectedPanel) => {

        try {
            const myUrl = `${inferModelAPI}?inference_model_panel=${mySelectedPanel}`;
            const res = await fetch(myUrl, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                }
            });

            const resJson = await res.json();

            if (resJson.detail) {
                utilityRef.current.showErrorMessage(resJson.detail);
                return;
            }

            let myOptionList = [];
            resJson.map((item) => {
                let myOption = {};
                myOption.value = item.inference_model_uuid;
                myOption.label = item.inference_model_name;
                myOptionList.push(myOption);
            });

            setModelData(resJson);
            setModelOption(myOptionList);
        } catch (error) {
            utilityRef.current.showMessage(error.message);

        }


    }

    const handleDeleteModel = async (myId) => {
        console.log('Delete Item : ', myId);
        const myUrl = `http://${currentServer}${inferInferenceAPI}`;
        log('myUrl', myUrl);

        const res = await fetch(myUrl, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ inference_model_uuid: myId })
        });

        const resJson = await res.json();

        if (resJson.detail) {
            utilityRef.current.showErrorMessage(resJson.detail);
            return;
        }

        getModelList();

        utilityRef.current.showMessage(`Delete model ${myId} success`);


    }

    const handleAddTask = () => {
        console.log('handle add task');
        setCurrentEditTaskIndex(-1);
        setShowEdit(true);
    }

    const handleUploadModel = () => {
        console.log('handle upload model');
        setShowUpload(true);
    }


    const handleSaveTask = async () => {
        console.log('handle save task')

        let myPass = true;

        if (selectedPanel === '') {
            utilityRef.current.showMessage('Please select panel');
            myPass = false;
        }

        if (selectedModel === '') {
            utilityRef.current.showMessage('Please select model');
            myPass = false;
        }

        if (myPass === false) return;

        console.log('selectedModel', selectedModel)

        let myInferPanel = {};
        inferPanel.map((item) => {
            myInferPanel[item.panel] = item.checked;
        });

        let myData = {};
        myData.inference_model_uuid = selectedModel;
        myData.inference_panel = selectedPanel;
        myData.inference_support_panel = myInferPanel;

        const myUrl = `${inferTaskAPI}`;

        const res = await fetch(myUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(myData)
        });

        const resJson = await res.json();

        if (resJson.detail) {
            utilityRef.current.showErrorMessage(resJson.detail);
            return;
        }

        console.log('resJson', resJson);

        utilityRef.current.showMessage(`Add task success`);

        const res2 = await fetch(`${inferTaskStartAPI}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ task_uuid: resJson.task_uuid })
        });

        const res2Json = await res2.json();

        if (res2Json.detail) {
            utilityRef.current.showErrorMessage(resJson.detail);
            return;
        }

        utilityRef.current.showMessage(`Start task success`);

        setShowEdit(false);
        getTaskList();

    }

    const handlePanelChange = (item) => {
        console.log('item', item);
        const selectedPanel = item.value;
        setSelectedPanel(selectedPanel);
        getTaskModelList(selectedPanel);
        modelSelectorRef.current.setValue(null);
        setSelectedModel('');
        setInferPanel([]);
    }

    const resetAllStatusLight = () => {
        statusHotDatabaseRef.current.src = LightGrayIcon;
        statusColdDatabaseRef.current.src = LightGrayIcon;
        statusClearDogRef.current.src = LightGrayIcon;
        statusWatchDogRef.current.src = LightGrayIcon;
    }

    const handleModelChange = (item) => {

        const myModel = filter(modelData, { inference_model_uuid: item.value });

        const myInferPanel = myModel[0].inference_model_panel_info;

        let myOptionList = [];
        myInferPanel.map((item) => {
            let myOption = {};
            myOption.panel = item;
            myOption.checked = true;
            myOptionList.push(myOption);
        });

        setInferPanel(myOptionList);
        setSelectedModel(item.value);

    }

    const handleTaskDeleteConfirm = (myId) => {
        console.log('handleTaskDeleteConfirm', myId);
        setCurrentEditTaskUuid(myId);
        const myIndex = findIndex(taskList, { task_uuid: myId });
        setCurrentEditTaskIndex(myIndex);
        setShowTaskDeleteConfirm(true);
    }

    const handleModelDeleteConfirm = (myId) => {
        console.log('handleModelDeleteConfirm', myId);
        console.log(modelList)
        setCurrentEditModelUuid(myId);
        const myIndex = findIndex(modelList, { inference_model_uuid: myId });
        if (myIndex >= 0) {
            setCurrentEditModelName(modelList[myIndex].inference_model_name)
        }
        //console.log(modelList[myIndex].inference_model_name)
        // setCurrentEditTaskIndex(myIndex);
        setShowModelDeleteConfirm(true);
    }

    const handleModelDeleteItem = async () => {

        const myUrl = `${inferInferenceAPI}`;
        log('myUrl', myUrl);

        const res = await fetch(myUrl, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ inference_model_uuid: currentEditModelUuid })
        });

        const resJson = await res.json();

        if (resJson.detail) {
            utilityRef.current.showErrorMessage(resJson.detail);
            return;
        }

        getModelList();

        setShowModelDeleteConfirm(false);

        utilityRef.current.showMessage(`Delete model success`);

    }

    const handlePanelChecked = (item) => {
        console.log('handlePanelChecked', item);
        let myInferPanel = [...inferPanel];
        const myIndex = findIndex(myInferPanel, { panel: item.panel });
        myInferPanel[myIndex].checked = !myInferPanel[myIndex].checked;
        setInferPanel(myInferPanel);
        console.log(myInferPanel)
    }

    const handleSocketMessage = (myMessage) => {

        const myData = JSON.parse(myMessage.data);

        //console.log('myData',myData);

        if (myData.hot_database) {
            statusHotDatabaseRef.current.src = (myData.hot_database === 'active') ?
                LightGreenIcon : (myData.hot_database === 'inactive') ? LightRedIcon : LightGrayIcon;
        };

        if (myData.cold_database) {
            statusColdDatabaseRef.current.src = (myData.cold_database === 'active') ?
                LightGreenIcon : (myData.cold_database === 'inactive') ? LightRedIcon : LightGrayIcon;
        };

        if (myData.cleardog) {
            statusClearDogRef.current.src = (myData.cleardog === 'active') ?
                LightGreenIcon : (myData.cleardog === 'inactive') ? LightRedIcon : LightGrayIcon;
        }

        if (myData.watchdog) {
            statusWatchDogRef.current.src = (myData.watchdog === 'active') ?
                LightGreenIcon : (myData.watchdog === 'inactive') ? LightRedIcon : LightGrayIcon;
        }

        let myTaskList = cloneDeep(taskList);

        myTaskList.forEach(element => {

            const myTaskUuid = element.task_uuid;
            if (myData[myTaskUuid]) {
                element.updateStatus = myData[myTaskUuid];
            }
        });

        setTaskList(myTaskList);
    };

    const handleTaskDeleteItem = async () => {
        console.log('handleTaskDeleteItem')

        const myTask = filter(taskList, { task_uuid: currentEditTaskUuid });

        if (myTask.length > 0) {
            const myStatus = myTask[0].status;
            console.log('myStatus', myStatus);
            if (myStatus !== 'wait') {
                utilityRef.current.showMessage('Please stop the task first.');
                setShowTaskDeleteConfirm(false);
                return;
            }
        }

        const myUrl = `${inferTaskAPI}`;
        log('myUrl', myUrl);

        const res = await fetch(myUrl, {
            method: 'DELETE',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ task_uuid: currentEditTaskUuid })
        });

        const resJson = await res.json();

        if (resJson.detail) {
            utilityRef.current.showErrorMessage(resJson.detail);
            return;
        }

        utilityRef.current.showMessage(`Delete task success`);
        getTaskList();
        setShowTaskDeleteConfirm(false);
    }


    useEffect(() => {

        console.log('showEdit', showEdit);
        if (showEdit) {
            setSelectedModel('');
            setSelectedPanel('');
            setInferPanel([]);
            getPanelList();

        }

    }, [showEdit]);



    useEffect(() => {

        getTaskList();
        getModelList();
        //getPanelList();

        const interval = setInterval(async () => {

            getTaskList();
            getModelList();
            //getPanelList();


        }, 5000);

        return () => clearInterval(interval);
    }, []);


    return (
        <>

            <ThemeProvider theme={theme}>

                <Modal open={showEdit}>
                    <ModalDialog style={{ width: 600, height: 500, backgroundColor: '#ffffff' }} layout='center'>
                        <div className='d-flex align-items-end flex-column bd-highlight mb-0' style={{ height: 600 }}>
                            <div className='container-fluid'>

                                <div className='row mt-2 p-0'>
                                    <div className='col-12 d-flex justify-content-between p-0' style={{ paddingRight: 21 }}>
                                        <h4 style={{ margin: 0 }}>{(currentEditTaskIndex >= 0) ? `Edit Item ${currentEditTaskIndex + 1}` : `Add New Task`}</h4>
                                    </div>
                                </div>

                                <div className='row'>
                                    <div className='col-md-12 mt-3 p-0'>
                                        <div className='my-input-title py-1'>
                                            Select Panel
                                        </div>
                                        <div>
                                            <PanelSelector options={panelOption} onChange={handlePanelChange} className="my-panel-select" ref={panelSelectorRef} />
                                        </div>

                                    </div>
                                </div>

                                <div className='row'>
                                    <div className='col-md-12 mt-3 p-0'>
                                        <div className='my-input-title'>
                                            Server Model
                                        </div>
                                        <div style={{ position: 'relative' }}>
                                            <PanelSelector options={modelOption} onChange={handleModelChange} className="my-panel-select" ref={modelSelectorRef} />

                                        </div>
                                    </div>
                                </div>

                                <div className='row'>
                                    <div className='col-md-12 mt-3 p-0'>
                                        <div className='my-input-title'>
                                            Set infer panel
                                        </div>
                                        <div style={{ position: 'relative' }}>
                                            {
                                                inferPanel.map((item, index) => {
                                                    return (
                                                        <div key={index} className='d-flex flex-row gap-2 mt-1'>
                                                            <input id={`checkbox_${index}`} type="checkbox" defaultChecked={item.checked} onChange={() => handlePanelChecked(item)} />
                                                            <label for={`checkbox_${index}`}>{item.panel}</label>
                                                        </div>
                                                    )
                                                })
                                            }
                                        </div>
                                    </div>
                                </div>



                            </div>
                        </div>
                        <div className='container-fluid mt-auto'>
                            <div className='row'>
                                <div className='col-md-12 d-flex flex-row gap-3 justify-content-end p-0'>
                                    <div><CustomButton name="close" width={100} height={32} onClick={() => setShowEdit(false)} /></div>
                                    <div><CustomButton name="view" text="Save" width={100} height={32} onClick={handleSaveTask} /></div>

                                </div>
                            </div>
                        </div>

                    </ModalDialog>
                </Modal>

                <Modal open={showTaskDeleteConfirm}>
                    <ModalDialog style={{ width: 500, height: 300, backgroundColor: '#ffffff' }} layout='center'>
                        <div className='d-flex align-items-end flex-column bd-highlight mb-0' style={{ height: 600 }}>
                            <div className='container-fluid'>

                                <div className='row mt-2 p-0'>
                                    <div className='col-12 d-flex justify-content-between p-0' style={{ paddingRight: 21 }}>
                                        <h4 style={{ margin: 0 }}>Delete task confirm</h4>
                                    </div>
                                </div>

                                <div className='row'>
                                    <div className='col-md-12 mt-3 p-0'>
                                        <div className='my-input-title py-1'>
                                            Are you sure to delete the task {currentEditTaskIndex + 1}?
                                        </div>

                                    </div>
                                </div>



                            </div>
                        </div>
                        <div className='container-fluid mt-auto'>
                            <div className='row'>
                                <div className='col-md-12 d-flex flex-row gap-3 justify-content-end p-0'>
                                    <div><CustomButton name="cancel" width={100} height={32} onClick={() => setShowTaskDeleteConfirm(false)} /></div>
                                    <div><CustomButton name="view" text="OK" width={100} height={32} onClick={handleTaskDeleteItem} /></div>

                                </div>
                            </div>
                        </div>

                    </ModalDialog>
                </Modal>


                <Modal open={showModelDeleteConfirm}>
                    <ModalDialog style={{ width: 500, height: 300, backgroundColor: '#ffffff' }} layout='center'>
                        <div className='d-flex align-items-end flex-column bd-highlight mb-0' style={{ height: 600 }}>
                            <div className='container-fluid'>

                                <div className='row mt-2 p-0'>
                                    <div className='col-12 d-flex justify-content-between p-0' style={{ paddingRight: 21 }}>
                                        <h4 style={{ margin: 0 }}>Delete model confirm</h4>
                                    </div>
                                </div>

                                <div className='row'>
                                    <div className='col-md-12 mt-3 p-0'>
                                        <div className='my-input-title py-1'>
                                            Are you sure to delete the model {currentEditModelName}?
                                        </div>

                                    </div>
                                </div>



                            </div>
                        </div>
                        <div className='container-fluid mt-auto'>
                            <div className='row'>
                                <div className='col-md-12 d-flex flex-row gap-3 justify-content-end p-0'>
                                    <div><CustomButton name="cancel" width={100} height={32} onClick={() => setShowModelDeleteConfirm(false)} /></div>
                                    <div><CustomButton name="view" text="OK" width={100} height={32} onClick={handleModelDeleteItem} /></div>

                                </div>
                            </div>
                        </div>

                    </ModalDialog>
                </Modal>

                <Modal open={showUpload}>
                    <ModalDialog style={{ width: 600, height: 500, backgroundColor: '#ffffff' }} layout='center'>
                        <div className='d-flex align-items-end flex-column bd-highlight mb-0' style={{ height: 600 }}>
                            <div className='container-fluid'>

                                <div className='row mt-2'>
                                    <div className='col-12 d-flex justify-content-between' style={{ paddingRight: 21 }}>
                                        <h4 style={{ margin: 0 }}>Upload model</h4>
                                        <input type="file" name="files" ref={selectFileRef} style={{ visibility: 'hidden', height: 0 }} accept=".zip" onChange={handleFileChange} />
                                    </div>
                                </div>




                                <div className='row mt-4'>
                                    <div className='col-12 d-flex flex-column' >


                                        <div className='my-input-title'>
                                            Select upload file

                                        </div>
                                        <div style={{ position: 'relative' }}>
                                            <CustomInput defaultValue={currentFileName} width="100%" height="48" onChange={() => { }} disabled={true} ref={inputFileNameRef}></CustomInput>

                                            <div style={{ position: 'absolute', top: 8, right: 8 }}>
                                                <CustomButton name="view" text="Select" width={100} height={32} onClick={() => selectFileRef.current?.click()} />

                                            </div>

                                        </div>
                                    </div>

                                </div>
                                <div className='row mt-4'>
                                    <div className='col-12 d-flex flex-column' >

                                        <div style={{ position: 'relative', marginTop: 10 }}>


                                            <div style={{ position: 'relative' }}>
                                                <div className='mt-2'>

                                                    <ModelUploadList ref={uploadRef}
                                                        updateStatus={handleUpdateStatus}
                                                        showMessage={utilityRef.current?.showMessage}
                                                        showErrorMessage={utilityRef.current?.showErrorMessage}
                                                    />

                                                </div>

                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>


                        <div className='container-fluid mt-auto'>
                            <div className='row'>
                                <div className='col-md-12 d-flex flex-row gap-3 justify-content-end p-0'>

                                    <div className='d-flex flex-row gap-2'>
                                        <CustomButton name="close" width={100} height={32} onClick={() => setShowUpload(false)} />
                                        <CustomButton name="view" text="Upload" width={100} height={32} onClick={handleUpload} />
                                    </div>

                                </div>
                            </div>
                        </div>

                    </ModalDialog>
                </Modal>


                <div className="container">
                    <div className="title-container">
                        <div className="title-style">{currentTab}s</div>
                        <div className='d-flex flex-row gap-2'>
                            <CustomButton name="view" text="Refresh" onClick={() => getTaskList(currentServer)} width={100}></CustomButton>
                            <CustomButton name="view" text="Add" onClick={handleAddTask} width={100}></CustomButton>
                            <CustomButton name="view" text="Upload" onClick={handleUploadModel} width={100}></CustomButton>
                            <CustomButton name="view" text={currentTab === 'Task' ? 'Model' : 'Task'} onClick={handleTabClick} width={100}></CustomButton>
                        </div>
                    </div>

                    
                    <CustomWebSocket onSocketMessage={handleSocketMessage} />
                    


                    <div className="row mt-4">
                        <div className="col-3">

                            <div className="my-status-card p-2 gap-2" style={{ borderColor: '#DC3545', position: 'relative' }}>
                                <StorageIcon sx={{ color: '#DC3545' }} />
                                Hot Database
                                <img src={LightGrayIcon} width={20} height={20} style={{ position: 'absolute', top: 5, left: 5 }} ref={statusHotDatabaseRef} />
                            </div>

                        </div>
                        <div className="col-3">

                            <div className="my-status-card p-2 gap-2" style={{ borderColor: '#007BFF', position: 'relative' }}>
                                <StorageIcon sx={{ color: '#007BFF' }} />
                                Cold Database
                                <img src={LightGrayIcon} width={20} height={20} style={{ position: 'absolute', top: 5, left: 5 }} ref={statusColdDatabaseRef} />
                            </div>

                        </div>
                        <div className="col-3">

                            <div className="my-status-card p-2 gap-2" style={{ borderColor: '#FFC107', position: 'relative' }}>
                                <DataThresholdingIcon sx={{ color: '#FFC107' }} />
                                Clear Dog
                                <img src={LightGrayIcon} width={20} height={20} style={{ position: 'absolute', top: 5, left: 5 }} ref={statusClearDogRef} />
                            </div>

                        </div>
                        <div className="col-3">

                            <div className="my-status-card p-2 gap-2" style={{ borderColor: '#28A745', position: 'relative' }}>
                                <DataThresholdingIcon sx={{ color: '#28A745' }} />
                                Watch Dog
                                <img src={LightGrayIcon} width={20} height={20} style={{ position: 'absolute', top: 5, left: 5 }} ref={statusWatchDogRef} />
                            </div>

                        </div>
                    </div>



                    {
                        currentTab === 'Task' ?
                            <div className="infer-page-content" style={{ overflowY: 'scroll' }}>


                                {
                                    (taskList.length === 0) ?
                                        <div className='d-flex flex-column justify-content-center align-items-center' style={{ width: 1200, height: 500 }}>
                                            <div style={{ fontSize: 22, color: '#000000', fontWeight: 500 }}>No task.</div>
                                            <div style={{ fontSize: 18, color: '#979CB5', fontWeight: 300 }}>Please add task from upper right cornor button.</div>
                                        </div>
                                        :
                                        taskList.map((task, index) => {
                                            return (
                                                <div key={task.task_uuid}>
                                                    <TaskCard data={task} index={index}
                                                        currentServer={currentServer}
                                                        showMessage={utilityRef.current.showMessage}
                                                        getTaskList={getTaskList}
                                                        onDeleteTask={handleTaskDeleteConfirm}
                                                    />
                                                </div>
                                            )
                                        })

                                }
                            </div>
                            :
                            <div className="infer-page-content" style={{ overflowY: 'scroll' }}>

                                {
                                    (modelList.length === 0) ?
                                        <div className='d-flex flex-column justify-content-center align-items-center' style={{ width: 1200, height: 500 }}>
                                            <div style={{ fontSize: 22, color: '#000000', fontWeight: 500 }}>No model.</div>
                                            <div style={{ fontSize: 18, color: '#979CB5', fontWeight: 300 }}>Please upload model from server page.</div>
                                        </div>
                                        :
                                        modelList.map((model, index) => {
                                            return (
                                                <div key={model.inference_model_uuid}>
                                                    <ModelCard data={model} index={index}
                                                        currentServer={currentServer}
                                                        showMessage={utilityRef.current.showMessage}
                                                        getModelList={getModelList}
                                                        onDeleteModel={handleModelDeleteConfirm}
                                                    />
                                                </div>
                                            )
                                        })

                                }
                            </div>
                    }

                </div>
            </ThemeProvider >
            <Utility ref={utilityRef} />

        </>
    );
}

export default TaskPage;