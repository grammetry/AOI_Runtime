import React, { useRef, useState, useEffect } from 'react';
import Tooltip from '@mui/joy/Tooltip';
import Box from '@mui/joy/Box';
import Typography from '@mui/joy/Typography';
import Chip from '@mui/joy/Chip';

const CustomTooltip = ({ children, title }) => {

    return (
        <Tooltip
            title={
                <Box sx={{ display: 'flex', gap: 1, width: '100%', mt: 0, backgroundColor: 'transparent', height: '28px' }}>

                    <Chip color="var(--base_2)" sx={{ ml: 0, mt: 0, fontSize: '15px', padding: 2, height: '20px', lineHeight: '20px',backgroundColor:'transparent',color:'white' }}>
                        {title}
                    </Chip>

                </Box>

            }
            arrow
            placement="top"  
            slotProps={{
                root: {
                    sx: {
                        backgroundColor: '#16272ECC',
                        padding: '0px 10px 2px 10px',
                        borderRadius: 6,

                    },
                },
            }}
        >
            {children}
        </Tooltip>
    );
};

export default CustomTooltip;