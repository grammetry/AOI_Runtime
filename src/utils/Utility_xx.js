import { forwardRef, useImperativeHandle,useState } from 'react';  
import { useDispatch,useSelector } from 'react-redux';
import { selectCurrentMessage, setShow, setMessage, setCurrentTaoModelId, setCurrentExportId, setCurrentTab } from '../redux/store/slice/currentMessage';
import CustomLoading from '../components/Loadings/CustomLoading';
import { ToastContainer, toast, cssTransition, Slide } from 'react-toastify';

const Utility = forwardRef((props, ref) => {

    const dispatch = useDispatch();

    const [openProgressDialog, setOpenProgressDialog] = useState(false);

    const currentTaoModelId = useSelector(selectCurrentMessage).currentTaoModelId;
    const currentExportId = useSelector(selectCurrentMessage).currentExportId;
    const currentTab = useSelector(selectCurrentMessage).currentTab;

    const setMessage=(message)=>{
        toast(message, {
            style: {
                backgroundColor: '#16272E',
                width: 800,
                height: 44,
                fontSize:'16px',
                minHeight: 44,
                color: 'white',
                left:-250,
                paddingLeft: 200
            },
           
            closeOnClick: true,
            position: "bottom-center",
            pauseOnHover: true,
            draggable: false,
            theme: "light",
          
        });
    }

    const setLocalMessage = (message) => {

        console.log(`setLocalMessage : ${message}`);

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
            });

           // toast(message);
        
    }


    useImperativeHandle(ref, () => ({

        showMessage: (myMessage) => {
            //dispatch(setMessage(myMessage));
            //dispatch(setShow(true));

            setMessage(myMessage);
        },
        setLoading: (myToggle) => {
            setOpenProgressDialog(myToggle);
        },
        setCurrentTaoModelId: (myTaoModelId) => {
            dispatch(setCurrentTaoModelId(myTaoModelId));
        },
        getCurrentTaoModelId: () => {
            return currentTaoModelId;
        },
        setCurrentExportId: (myExportId) => {
            dispatch(setCurrentExportId(myExportId));
        },
        getCurrentExportId: () => {
            return currentExportId;
        },
        setCurrentTab: (myTab) => {
            dispatch(setCurrentTab(myTab));
        },
        getCurrentTab: () => { 
            return currentTab;
        },
        showErrorMessage: (myError) => {
            const msg = myError?.[0]?.msg || '';
            const loc = myError?.[0]?.loc || [];
            setLocalMessage(`API error : ${msg}`);
        },
    }));

    return (
        <>
            <CustomLoading
                openProgressDialog={openProgressDialog}
                setOpenProgressDialog={setOpenProgressDialog}
                progressAttribute={{ "message": "Loading", "percent": "" }}
            />
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
                transition=  {Slide}
                
            />
        </>
    );
});

export default Utility;
