
import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Modal from '@mui/joy/Modal';
import ModalDialog from '@mui/joy/ModalDialog';
import { extendTheme } from '@mui/joy/styles';
import { ThemeProvider } from '@mui/joy/styles';
import moment from 'moment';
import ToggleButtonGroup from '@mui/joy/ToggleButtonGroup';
import Button from '@mui/joy/Button';
import axios, { isCancel, AxiosError } from 'axios';
import { saveAs } from "file-saver";

import CustomButton from '../components/Buttons/CustomButton';
import CustomInput from '../components/Inputs/CustomInput';

import Utility, { UtilityRef } from '../utils/Utility';
import { taoWorkspaceAPI, taoQuickTrainAPI, taoStartTrainAPI, taoUploadYamlAPI } from '../APIPath';
import { includes } from 'lodash';


const TrainingDialog = forwardRef((props, ref) => {

    const dispatch = useDispatch();

    const [show, setShow] = useState(false);
    const [method, setMethod] = useState('QuickTrain');
    const [taoModelName, setTaoModelName] = useState('');
    const [uploadProgress, setUploadProgress] = useState('');

    const [inputMargin, setInputMargin] = useState('1.5');
    const [inputBatchSize, setInputBatchSize] = useState('16');
    const [inputFpratioSampling, setInputFpratioSampling] = useState('0.02');
    const [inputNumEpochs, setInputNumEpochs] = useState('100');
    const [inputLearningRate, setInputLearningRate] = useState('0.0005');
    const [inputCheckpointInterval, setInputCheckpointInterval] = useState('20');

    //num_epochs
    //checkpoint_interval
    //fpratio_sampling

    const selectFileRef = useRef(null);
    const inputFileNameRef = useRef(null);
    const taoModelNameRef = useRef(null);
    const utilityRef = useRef(null);

    const inputMarginRef = useRef(null);
    const inputBatchSizeRef = useRef(null);
    const inputFpratioSamplingRef = useRef(null);
    const inputNumEpochsRef = useRef(null);
    const inputLearningRateRef = useRef(null);
    const inputCheckpointIntervalRef = useRef(null);


    useImperativeHandle(ref, () => ({

        SetOpen: () => {
            setShow(true);
        },


    }));

    const theme = extendTheme({
        components: {
            JoyModalDialog: {
                defaultProps: { layout: 'center' },
                styleOverrides: {
                    root: ({ ownerState }) => ({
                        ...(ownerState.layout === 'center' && {

                            width: '400px',
                            height: '300px',
                            backgroundColor: 'white',
                            borderRadius: '12px',
                            border: '1px solid #E0E1E6',
                            boxShadow: '0px 0px 4px #CACBD733',
                            padding: '40px',
                            fontFamily: 'Roboto',
                        }),
                    }),
                },
            },
        },

        colorSchemes: {
            light: {
                palette: {
                    danger: {
                        
                     
                        outlinedBorder: '#ed1b23', // outlined Border
                        outlinedColor: '#ed1b23', // text color
                        outlinedActiveBg: '#ed1b2333', // background color

                        plainColor: '#00ff00',
                        plainActiveBg: '#00ff00',
                    },
                },
            },
            
        }
    });

    const handleFileChange = (e) => {

        if (e.target.files) {

            const fileName = e.target.files[0].name;

            const fileExtension = fileName.toString().split('.').pop().toLowerCase();

            const supportType = ['zip'];

            if (includes(supportType, fileExtension)) {
                inputFileNameRef.current.setInputValue(fileName)
                setUploadProgress('');
            } else {
                e.target.files = null;
                utilityRef.current?.showMessage(`File type not support! Support Type : [${supportType.join(', ')}]`);
            }
        }

    }

    const handleTaoModelNameChange = (myName) => {
        setTaoModelName(myName);
    }

    const handleAdvanceTrain = async (myTaoModelId) => {
        console.log('AdvanceTrain')

        const myYaml = `results_dir: /results
encryption_key: nvidia_tao
model:
  model_type: Siamese_3
  model_backbone: custom
  embedding_vectors: 5
  margin: ${inputMargin}
dataset:
  train_dataset:
    csv_path: /data/dataset_convert/train.csv
    images_dir: /data/train/
  validation_dataset:
    csv_path: /data/dataset_convert/val.csv
    images_dir: /data/val/
  test_dataset:
    csv_path: /data/dataset_convert/val.csv
    images_dir: /data/val/
  infer_dataset:
    csv_path: /data/dataset_convert/val.csv
    images_dir: /data/val/
  image_ext: .jpg
  batch_size: ${inputBatchSize}
  workers: 8
  fpratio_sampling: ${inputFpratioSampling}
  num_input: 1
  input_map: null
  concat_type: linear
  grid_map:
    x: 2
    y: 2
  output_shape:
    - 256
    - 256
  augmentation_config:
    rgb_input_mean: [0.485, 0.456, 0.406]
    rgb_input_std: [0.229, 0.224, 0.225]
train:
  pretrained_model_path: /pretrained/optical_inspection_vtrainable_v1.0/oi_model.pth
  optim:
    type: Adam
    lr: ${inputLearningRate}
    momentum: 0.9        # SGD only
    weight_decay: 0.0001 # SGD only
  loss: contrastive
  num_epochs: ${inputNumEpochs}
  checkpoint_interval: ${inputCheckpointInterval}
  validation_interval: \${train.checkpoint_interval}
  results_dir: "\${results_dir}/train"
  tensorboard:
    enabled: True
evaluate:
  gpu_id: 0
  checkpoint: "\${results_dir}/train/oi_model.pth"
  results_dir: "\${results_dir}/evaluate"
export:
  checkpoint: "\${results_dir}/train/oi_model.pth"
  results_dir: "\${results_dir}/export"
  onnx_file: "\${export.results_dir}/oi_model.onnx"
  batch_size: 1
  input_height: 256
  input_width: 256
inference:
  gpu_id: 0
  checkpoint: "\${results_dir}/train/oi_model.pth"
  results_dir: "\${results_dir}/inference"
  trt_engine: "\${gen_trt_engine.trt_engine}"
  batch_size: \${dataset.batch_size}
gen_trt_engine:
  results_dir: "\${results_dir}/gen_trt_engine"
  onnx_file: "\${export.onnx_file}"
  trt_engine: "\${gen_trt_engine.results_dir}/oi_model.trt"
  batch_size: \${dataset.batch_size}
`;

        let myFile = new File([myYaml], "default.yaml", { type: "text/yaml" });
        const myData = new FormData();
        myData.append('tao_model_uuid', myTaoModelId);
        myData.append('file', myFile, 'default.yaml')

        const res = await axios.put(taoUploadYamlAPI, myData, {
            onUploadProgress: (progressEvent) => {
                const { loaded, total } = progressEvent;

                console.log('loaded', loaded ? loaded : 'null');
                console.log('total', total ? total : 'null');

                if (total) {
                    let precentage = Math.floor((loaded * 100) / total);
                    setUploadProgress(`( ${loaded}/${total} - ${precentage}% )`);
                }

            },
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        });

        if (res.status !== 200) {
            utilityRef.current?.showErrorMessage(res.statusText);
            return;
        } else {
            utilityRef.current?.showMessage('Step 3 success, upload yaml file to server complete');
        }



    }


    const handleTrainingTask = async () => {


        console.log('start training...')

        try {


            let pass = true;

            if (taoModelName === '') {
                utilityRef.current?.showMessage('Tao model name is empty!');
                taoModelNameRef.current.setWarnning(true);
                pass = false;
            }

            if (selectFileRef.current?.files?.length === 0) {
                utilityRef.current?.showMessage('No file selected!');
                inputFileNameRef.current.setWarnning(true);
                pass = false;
            }

            if (method === 'AdvanceTrain') {
                console.log(inputMargin)

                const isFloat = (n) => {
                    const er = /^[-+]?[0-9]+\.[0-9]+$/;
                    return er.test(n);
                }

                const isInteger = (n) => {
                    var er = /^-?[0-9]+$/;
                    return er.test(n);
                }



                console.log(isFloat(inputMargin))
                console.log(isInteger(inputMargin))

                if (!isFloat(inputMargin) && !isInteger(inputMargin)) {
                    utilityRef.current?.showMessage('Margin is not a float!');
                    inputMarginRef.current.setWarnning(true);
                    pass = false;
                }
                if (parseFloat(inputMargin) <= 0) {
                    utilityRef.current?.showMessage('Margin must be greater than 0!');
                    inputMarginRef.current.setWarnning(true);
                    pass = false;
                }

                if (!isInteger(inputBatchSize)) {
                    utilityRef.current?.showMessage('Batch size is not a integer!');
                    inputBatchSizeRef.current.setWarnning(true);
                    pass = false;
                }
                if (parseInt(inputBatchSize) < 2) {
                    utilityRef.current?.showMessage('Batch size must be greater than 1!');
                    inputBatchSizeRef.current.setWarnning(true);
                    pass = false;
                }
                if (!isFloat(inputFpratioSampling) && !isInteger(inputFpratioSampling)) {
                    utilityRef.current?.showMessage('Fpratio sampling is not a float!');
                    inputFpratioSamplingRef.current.setWarnning(true);
                    pass = false;
                }
                if (parseFloat(inputFpratioSampling) <= 0) {
                    utilityRef.current?.showMessage('Fpratio sampling must be greater than 0!');
                    inputFpratioSamplingRef.current.setWarnning(true);
                    pass = false;
                }

                if (!isInteger(inputNumEpochs)) {
                    utilityRef.current?.showMessage('Number of epochs is not a integer!');
                    inputNumEpochsRef.current.setWarnning(true);
                    pass = false;
                }
                if (parseInt(inputNumEpochs) <= 0) {
                    utilityRef.current?.showMessage('Number of epochs must be greater than 0!');
                    inputNumEpochsRef.current.setWarnning(true);
                    pass = false;
                }
                if (!isFloat(inputLearningRate) && !isInteger(inputLearningRate)) {
                    utilityRef.current?.showMessage('Learning rate is not a float!');
                    inputLearningRateRef.current.setWarnning(true);
                    pass = false;
                }
                if (parseFloat(inputLearningRate) <= 0) {
                    utilityRef.current?.showMessage('Learning rate must be greater than 0!');
                    inputLearningRateRef.current.setWarnning(true);
                    pass = false;
                }

                if (!isInteger(inputCheckpointInterval)) {
                    utilityRef.current?.showMessage('Check point interval is not a integer!');
                    inputCheckpointIntervalRef.current.setWarnning(true);
                    pass = false;
                }
                if (parseInt(inputCheckpointInterval) <= 0) {
                    utilityRef.current?.showMessage('Check point interval must be greater than 0!');
                    inputCheckpointIntervalRef.current.setWarnning(true);
                    pass = false;
                }
                if (parseInt(inputCheckpointInterval) > parseInt(inputNumEpochs)) {
                    utilityRef.current?.showMessage('Check point interval must be not greater than number of epochs!');
                    inputCheckpointIntervalRef.current.setWarnning(true);
                    pass = false;
                }

            }

            if (!pass) {
                return;
            }

            let taoModelId = null;

            //--- Step 1 : create workspace

            const myData = {
                project_uuid: null,
                dataset_uuid: null,
                export_uuid: null,
                tao_model_name: taoModelName,
            };

            const res1 = await fetch(taoWorkspaceAPI, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(myData),
            })

            const data1 = await res1.json();

            if (data1.detail) {
                utilityRef.current?.showErrorMessage(data1.detail);
                return;
            } else {
                utilityRef.current?.showMessage(`Step 1 success, get tao_model_uuid = ${data1.tao_model_uuid}`);
                taoModelId = data1.tao_model_uuid;
            }




            //--- Step 2 : upload dataset

            if (!taoModelId) {
                utilityRef.current?.showMessage('Tao model uuid is null!');
                return;
            }

            const myData2 = new FormData();
            myData2.append('tao_model_uuid', taoModelId);
            myData2.append('file', selectFileRef.current?.files[0])

            const res2 = await axios.post(taoQuickTrainAPI, myData2, {
                onUploadProgress: (progressEvent) => {
                    const { loaded, total } = progressEvent;

                    console.log('loaded', loaded ? loaded : 'null');
                    console.log('total', total ? total : 'null');

                    if (total) {
                        let precentage = Math.floor((loaded * 100) / total);
                        setUploadProgress(`( ${loaded}/${total} - ${precentage}% )`);
                    }

                },
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            console.log(res2)

            if (res2.status !== 200) {
                utilityRef.current?.showErrorMessage(res2.statusText);
                return;
            } else {
                utilityRef.current?.showMessage('Step 2 success, upload file to server complete');
            }


            if (method === 'AdvanceTrain') {
                await handleAdvanceTrain(taoModelId);
            }

            //--- Step 3 : set task started

            const myData3 = {
                tao_model_uuid: taoModelId
            };

            const res3 = await fetch(taoStartTrainAPI, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(myData3),
            })

            const data3 = await res3.json();

            if (data3.detail) {
                utilityRef.current?.showErrorMessage(data3.detail);
                return;
            } else {
                utilityRef.current?.showMessage(`Step ${method === 'QuickTrain' ? "3" : "4"} success, turn to Train Page`);
                props.setPageKey('TrainPage');
            }




        } catch (error) {

            console.log(error)
            if (error instanceof Error) {
                utilityRef.current?.showMessage(error.message);
            }
        }



    }

    useEffect(() => {

        console.log(props.currentProject.project_name)

        if ((show) && (props.currentProject.project_name !== '')) {

            setTaoModelName(`${props.currentProject.project_name}_${moment().format('YYYYMMDDHHmmss')}`);

        }

        setUploadProgress('');

    }, [show]);

    return (
        <>
            <Utility ref={utilityRef} />
            <ThemeProvider theme={theme}>

                <Modal open={show}>
                    <ModalDialog style={{ width: '800px', height: '600px' }} layout='center'>
                        <div className='d-flex align-items-end flex-column bd-highlight mb-0' style={{ height: 600 }}>

                            <div className='container-fluid'>

                                <div className='row'>
                                    <div className='col-md-12 mt-1'>
                                        <ToggleButtonGroup
                                            size="lg"
                                            value={method}
                                            onChange={(event, newValue) => {
                                                setMethod(newValue);
                                            }}
                                            color='danger'
                                            sx={{ '--ButtonGroup-separatorColor': '#ff000033' }}
                                        >
                                            <Button value="QuickTrain" sx={{ width: '50%' }} color='danger'>Quick Train</Button>
                                            <Button value="AdvanceTrain" sx={{ width: '50%' }}>Advance Train</Button>
                                        </ToggleButtonGroup>
                                    </div>
                                </div>

                                <div className='row'>
                                    <div className='col-md-12 mt-3'>
                                        <div className='my-input-title roboto-b2 py-1'>
                                            Tao model name
                                        </div>
                                        <div>
                                            <CustomInput defaultValue={taoModelName} onChange={handleTaoModelNameChange} width="100%" height="48" placeholder="" ref={taoModelNameRef}></CustomInput>
                                        </div>

                                    </div>
                                </div>

                                <div className='row'>
                                    <div className='col-md-12 mt-3'>
                                        <div className='my-input-title'>
                                            Select upload file  {uploadProgress}
                                        </div>
                                        <div style={{ position: 'relative' }}>
                                            <CustomInput defaultValue={''} width="100%" height="48" onChange={() => { }} disabled={true} ref={inputFileNameRef}></CustomInput>

                                            <div style={{ position: 'absolute', top: 8, right: 8 }}>
                                                <CustomButton name="view" text="Select" width={100} height={32} onClick={() => selectFileRef.current?.click()} />
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {
                                    (method === 'AdvanceTrain') ?
                                        <>
                                            <div className='row'>
                                                <div className='col-md-4 mt-3'>
                                                    <div className='my-input-title'>
                                                        Margin
                                                    </div>
                                                    <div>
                                                        <CustomInput defaultValue={inputMargin} width="100%" height="48" onChange={(myValue) => setInputMargin(myValue)} disabled={false} ref={inputMarginRef}></CustomInput>
                                                    </div>
                                                </div>
                                                <div className='col-md-4 mt-3'>
                                                    <div className='my-input-title'>
                                                        Batch size
                                                    </div>
                                                    <div>
                                                        <CustomInput defaultValue={inputBatchSize} width="100%" height="48" onChange={(myValue) => setInputBatchSize(myValue)} disabled={false} ref={inputBatchSizeRef}></CustomInput>
                                                    </div>
                                                </div>
                                                <div className='col-md-4 mt-3'>
                                                    <div className='my-input-title'>
                                                        Fpratio sampling
                                                    </div>
                                                    <div>
                                                        <CustomInput defaultValue={inputFpratioSampling} width="100%" height="48" onChange={(myValue) => setInputFpratioSampling(myValue)} disabled={false} ref={inputFpratioSamplingRef}></CustomInput>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className='row'>
                                                <div className='col-md-4 mt-3'>
                                                    <div className='my-input-title'>
                                                        Number of epochs
                                                    </div>
                                                    <div>
                                                        <CustomInput defaultValue={inputNumEpochs} width="100%" height="48" onChange={(myValue) => setInputNumEpochs(myValue)} disabled={false} ref={inputNumEpochsRef}></CustomInput>
                                                    </div>
                                                </div>
                                                <div className='col-md-4 mt-3'>
                                                    <div className='my-input-title'>
                                                        Learning rate
                                                    </div>
                                                    <div>
                                                        <CustomInput defaultValue={inputLearningRate} width="100%" height="48" onChange={(myValue) => setInputLearningRate(myValue)} disabled={false} ref={inputLearningRateRef}></CustomInput>
                                                    </div>
                                                </div>
                                                <div className='col-md-4 mt-3'>
                                                    <div className='my-input-title'>
                                                        Check point interval
                                                    </div>
                                                    <div>
                                                        <CustomInput defaultValue={inputCheckpointInterval} width="100%" height="48" onChange={(myValue) => setInputCheckpointInterval(myValue)} disabled={false} ref={inputCheckpointIntervalRef}></CustomInput>
                                                    </div>
                                                </div>
                                            </div>
                                        </>
                                        :
                                        <></>
                                }



                            </div>
                        </div>
                        <div className='container-fluid mt-auto'>
                            <div className='row'>
                                <div className='col-md-12 d-flex flex-row gap-3 justify-content-end p-0'>
                                    <input type="file" name="files" onChange={handleFileChange} ref={selectFileRef} style={{ visibility: 'hidden', height: 0 }} accept=".zip" />
                                    <div><CustomButton name="close" width={100} height={32} onClick={() => setShow(false)} /></div>
                                    <div><CustomButton name="confirm" width={100} height={32} onClick={handleTrainingTask} /></div>
                                </div>
                            </div>
                        </div>





                    </ModalDialog>
                </Modal>

            </ThemeProvider >
        </>
    );
});

export default TrainingDialog;

