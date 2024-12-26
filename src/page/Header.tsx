import { useState, FormEventHandler, useEffect, Dispatch, SetStateAction } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import logo from '../image/Dataset_Tool_Logo_white.svg';
import { Tooltip } from '@mui/material';
import { selectCurrentList } from '../redux/store/slice/currentSelected';
import { selectCurrentMessage, setMessage, setShow } from '../redux/store/slice/currentMessage';
import ConfirmDialog from '../dialog/ConfirmDialog';
import CustomButton from '../components/Buttons/CustomButton';
import LogoIcon from '../image/iVIT_Logo.png';

import { AttributeType, ProgressType, PageKeyType, TabKeyType } from './type';
import { ToastContainer, toast, cssTransition, Slide } from 'react-toastify';


import 'react-toastify/dist/ReactToastify.css';

type HeaderProps = {

    setPageKey: Dispatch<SetStateAction<PageKeyType>>;
    pageKey: PageKeyType;
    setTabKey: Dispatch<SetStateAction<TabKeyType>>;
    tabKey: TabKeyType;

};


const Header = (props: HeaderProps) => {

    // https://fkhadra.github.io/react-toastify/replace-default-transition/

    const dispatch = useDispatch();

    const somethingChange = useSelector(selectCurrentList).somethingChange;
    const show = useSelector(selectCurrentMessage).show;
    const message = useSelector(selectCurrentMessage).message;


    const [openConfirmDialog, setOpenConfirmDialog] = useState(false);


    const handleWindowReload = () => {
        if (somethingChange) {
            console.log('show dialog')
            setOpenConfirmDialog(true);
        } else {
            console.log('reload directly')
            window.location.reload();
        }
    }

    const handleConfirmLeave: FormEventHandler<HTMLFormElement> = (e) => {
        e.preventDefault();
        setOpenConfirmDialog(false);
        window.location.reload();

    };

    const confirmLeaveAttribute: AttributeType = {
        title: 'Confirm leave',
        desc: 'You have unsaved changes.<br/>Are you sure to leave?',
    };

    const currentProgressAttribute: ProgressType = {
        message: '',
        percent: 0,
    };

    const swirl = cssTransition({
        enter: "swirl-in-fwd",
        exit: "swirl-out-bck"
    });

    useEffect(() => {

        if (show)
            toast(message, {
                style: {
                    backgroundColor: '#16272E',
                    width: 800,
                    height: 44,
                    fontSize: '16px',
                    minHeight: 44,
                    color: 'white',
                    left: -250,
                    paddingLeft: 200
                },

                closeOnClick: true,
                position: "bottom-center",
                pauseOnHover: true,
                draggable: false,
                theme: "light",

            });
        dispatch(setShow(false));
        dispatch(setMessage(''));

    }, [show]);




    return (
        <>
            <ToastContainer
                position="bottom-center"
                autoClose={3000}
                hideProgressBar={true}
                newestOnTop={true}
                closeOnClick={true}
                closeButton={false}
                rtl={false}
                pauseOnFocusLoss
                draggable={false}
                pauseOnHover
                bodyClassName={"my-toast-body"}
                transition={Slide}

            />
            {/* <div style={{backgroundColor:'yellow'}} className='d-flex flex-row justify-content-center'>
                <div className="header"> */}


            <div className='header-container'>
                <div className="header">
                    {/* <div className="header-text" onClick={() => window.location.reload()}> */}
                    <div className='d-flex flex-row justify-content-between' style={{ width: '100%' }}>
                        <div className="header-text" onClick={handleWindowReload}>
                            <Tooltip enterDelay={500} enterNextDelay={500} title="Home" arrow>
                                <div className="flex-row-center gap-1">
                                    {/* <img src={logo} alt="logo icon" style={{ width: 32, height: 32 }} /> */}
                                    <img src={LogoIcon} width={32} height={32} />
                                    {/* <FontAwesomeIcon icon={faScrewdriverWrench} size="sm" color="#fff" /> */}
                                    <div style={{ fontSize: 30, fontWeight: 500 }}>iVIT.AOI-Runtime</div>
                                </div>
                            </Tooltip>
                        </div>
                        <div className='d-flex align-items-center'>


                            <CustomButton name="function" text="Task" onClick={() => props.setTabKey('Task')}
                                focus={(props.tabKey === 'Task')}
                            />
                            <CustomButton name="function" text="Model" onClick={() => props.setTabKey('Model')}
                                focus={(props.tabKey === 'Model')}
                            />
                            <CustomButton name="function" text="Log" onClick={() => props.setTabKey('Log')}
                                focus={(props.tabKey === 'Log')}
                            />


                        </div>
                    </div>
                </div>
            </div>
            <ConfirmDialog
                openConfirmDialog={openConfirmDialog}
                setOpenConfirmDialog={setOpenConfirmDialog}
                handleConfirm={handleConfirmLeave}
                confirmAttribute={confirmLeaveAttribute}
            />

        </>
    );
};

export default Header;
