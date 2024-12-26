import React, { useState, useRef, useEffect } from 'react';
import log from "../../utils/console";
import useWebSocket, { ReadyState } from 'react-use-websocket';

import { inferTaskInfoAPI } from '../../APIPath';

const CustomWebSocket = (props) => {

    const { onSocketMessage } = props;

    const [socketUrl, setSocketUrl] = useState('');
    const [messageHistory, setMessageHistory] = useState([]);
    const { lastMessage, readyState, sendMessage } = useWebSocket(socketUrl, {
        onOpen: () => {
            log('--- web socket open ---')
        },
        shouldReconnect: (closeEvent) => true,
    });

    const didUnmount = useRef(false);

    useEffect(() => {

        if (lastMessage !== null) {

            //console.log('lastMessage', lastMessage);
            onSocketMessage(lastMessage);

        }
    }, [lastMessage]);



    useEffect(() => {

        setSocketUrl(`${inferTaskInfoAPI}`);

        console.log('inferHeartBeatAPI', inferTaskInfoAPI);

        return () => {
            didUnmount.current = true;
        };
    }, []);

    const connectionStatus = {
        [ReadyState.CONNECTING]: 'Connecting',
        [ReadyState.OPEN]: 'Open',
        [ReadyState.CLOSING]: 'Closing',
        [ReadyState.CLOSED]: 'Closed',
        [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
    }[readyState];

    return (
        <div className="my-body-title roboto-h2" style={{ width: 1, height: 1, letterSpacing: 'normal',position:'absolute',top:-5,left:-5,backgroundColor:'#E61F23',color:'#E61F23' }}>
            {connectionStatus}
        </div>
    );
};

export default CustomWebSocket;