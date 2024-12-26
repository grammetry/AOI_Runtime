import { createSlice } from "@reduxjs/toolkit";
import { set } from "lodash";

interface InitialState {
    message: string;
    show: boolean;
    currentTaoModelId: string;
    currentExportId: string;
    currentTab: string;
}

const init: InitialState = {
    message: '',
    show: false,
    currentTaoModelId: '',
    currentExportId: '',
    currentTab: 'current'
}

export const currentMessage = createSlice({
    name: "currentMessage",
    initialState: init,
    reducers: {
        setMessage: (state, action) => {
            state.message = action.payload;
        },
        setShow: (state, action) => {
            state.show = action.payload;
        },
        setCurrentTaoModelId: (state, action) => {
            state.currentTaoModelId = action.payload;   
        },
        setCurrentExportId: (state, action) => {
            state.currentExportId = action.payload;
        },
        setCurrentTab: (state, action) => {
            state.currentTab = action.payload;
        }
    },
});



export const selectCurrentMessage = (state: { currentMessage: { message: string ,show:boolean, currentTaoModelId:string} }) => state.currentMessage;

export const { setMessage,setShow,setCurrentTaoModelId,setCurrentExportId,setCurrentTab } = currentMessage.actions;  // 輸出action

export default currentMessage.reducer;